# Voice Assistant — Architecture Document

**Status:** Draft — Ready for Dev Handoff
**Scope:** ColorGenius Web App (Next.js App Router)
**Target Phase:** Phase 1 MVP (Beta)
**Author:** ColorGenius Architect
**Date:** 2026-05-04

---

## 1. Overview

This document defines the complete architecture for the ColorGenius Voice Assistant — a push-to-talk, context-aware AI consultant accessible bowl-side by stylists. The assistant answers formulation, safety, and inventory questions using the current client's profile, active formulation, stylist preferences, and safety flags.

### Key Design Principles
- **Hands-free at the bowl** — no keyboard, no screen gestures
- **Context-aware by default** — every answer references the current formulation + client
- **Phase 1: Browser-native APIs** — Web Speech API + SpeechSynthesis, zero external cost
- **Phase 2: Production APIs** — upgrade to Deepgram (STT) + ElevenLabs (TTS)
- **Always streaming** — text response streams while TTS starts simultaneously
- **Safety-first** — safety flags are injected into every prompt; never hidden

---

## 2. API Route Design

### 2.1 Route Map

```
POST /api/voice/ask          → Main Q&A endpoint (context + LLM)
POST /api/voice/transcribe   → STT bridge (browser → Deepgram/Whisper)
POST /api/voice/speak        → TTS bridge (text → ElevenLabs/browser)
GET  /api/voice/health       → Service health + latency check
```

### 2.2 `POST /api/voice/ask`

**Auth:** JWT cookie required (`colorgenius_token`).
**Rate limiting:** 30 requests/minute per user (Next.js middleware + Redis/Upstash).
**Timeout:** 15s for full response (streaming via Vercel Edge / OpenAI streaming).

#### Request Schema (JSON)

```typescript
interface VoiceAskRequest {
  question: string;               // transcribed user question
  clientId?: string;              // current client (null if no client selected)
  formulationId?: string;         // active formulation (null if none)
  contextSource?: 'dashboard' | 'formulate' | 'results' | 'clients' | 'global'; // where mic was tapped
  audioUrl?: string;              // optional: raw audio blob URL for audit (Phase 2)
  voiceConfig?: {
    sttProvider?: 'browser' | 'deepgram' | 'whisper';   // default: 'browser'
    ttsProvider?: 'browser' | 'elevenlabs' | 'openai';  // default: 'browser'
    voiceId?: string;                                     // ElevenLabs voice ID
  };
  // Session tracking for follow-up
  sessionId?: string;             // conversation thread ID (for multi-turn)
}
```

#### Response Schema (Streaming JSON Lines)

```typescript
// Each line is a JSON object (SSE / NDJSON)
type VoiceAskChunk =
  | { type: 'transcript'; text: string }           // (only if server-side STT)
  | { type: 'context'; summary: string }           // what context was loaded
  | { type: 'thinking'; text: string }            // optional: reasoning steps
  | { type: 'text'; chunk: string }               // LLM text stream
  | { type: 'audio'; url: string }                // TTS audio URL (when ready)
  | { type: 'safety_flag'; flag: string; severity: 'critical' | 'warning' | 'info' }
  | { type: 'done'; usage: { promptTokens: number; completionTokens: number } }
  | { type: 'error'; code: string; message: string };
```

For Phase 1 MVP (non-streaming fallback):

```typescript
interface VoiceAskResponse {
  success: boolean;
  data?: {
    answer: string;               // full LLM answer
    audioUrl?: string;            // TTS audio blob URL
    safetyFlags: Array<{
      flag: string;
      severity: 'critical' | 'warning' | 'info';
    }>;
    contextSummary: string;       // brief description of what was loaded
    sessionId: string;            // for follow-up questions
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Invalid or missing JWT |
| `RATE_LIMITED` | 429 | Too many voice requests |
| `NO_CONTEXT` | 200 | Question asked with no client/formulation; assistant answers generically |
| `STT_FAILED` | 422 | Transcription failed (low confidence or network) |
| `LLM_TIMEOUT` | 504 | LLM did not respond in time |
| `TTS_FAILED` | 502 | TTS service error |
| `SAFETY_BLOCK` | 200 | Question triggered a safety concern; answer includes warning |

---

### 2.3 `POST /api/voice/transcribe`

**Auth:** JWT cookie required.
**Purpose:** Server-side STT for Phase 2 (Deepgram / Whisper). Phase 1 uses browser-native `webkitSpeechRecognition`, so this route is optional.

#### Request

```typescript
interface VoiceTranscribeRequest {
  audio: string;            // base64-encoded audio blob (webm/opus or wav)
  mimeType?: string;        // default: 'audio/webm'
  language?: string;        // default: 'en-US'
}
```

#### Response

```typescript
interface VoiceTranscribeResponse {
  success: boolean;
  data?: {
    transcript: string;
    confidence: number;     // 0–1
    isFinal: boolean;
    words?: Array<{
      word: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  };
  error?: { code: string; message: string };
}
```

---

### 2.4 `POST /api/voice/speak`

**Auth:** JWT cookie required.
**Purpose:** Server-side TTS for Phase 2 (ElevenLabs / OpenAI). Phase 1 uses `window.speechSynthesis`.

#### Request

```typescript
interface VoiceSpeakRequest {
  text: string;
  voiceId?: string;         // ElevenLabs voice ID
  speed?: number;           // 0.5–2.0
  format?: 'mp3' | 'wav' | 'ogg' | 'pcm';
}
```

#### Response

```typescript
interface VoiceSpeakResponse {
  success: boolean;
  data?: {
    audioUrl: string;         // signed URL to generated audio (or data URI for Phase 1)
    durationMs: number;
  };
  error?: { code: string; message: string };
}
```

---

## 3. Context Assembly System

### 3.1 Philosophy

The voice assistant is **only useful if contextual**. Generic ChatGPT at the bowl is worthless. The context builder is the heart of the system — it gathers everything the LLM needs to give an accurate, safe, brand-aware answer.

### 3.2 Context Sources

| Source | Prisma Model | Priority | How Fetched |
|--------|-------------|----------|-------------|
| **Current Client** | `Client` | P0 | `clientId` from request → Prisma query |
| **Active Formulation** | `Formulation` | P0 | `formulationId` from request → Prisma query |
| **Stylist Preferences** | `Stylist.preferences` | P0 | From JWT payload or `stylist_id` lookup |
| **Client History** | `ClientVisit[]` | P1 | Last 3 visits with formulations |
| **Safety Flags** | `Client.allergies`, `has_metallic_dye`, etc. | P0 | Denormalized on `Client` model |
| **Inventory Levels** | `InventoryItem[]` | P1 | Filter by salon + brand/shade codes |
| **Brand/Shade Metadata** | `Brand`, `ProductLine`, `Shade` | P1 | Lookup by formulation brand/line |
| **Stylist's Selected Brands** | `User.selectedBrands` | P0 | From JWT or `User` model |

### 3.3 Context Builder Module

**File:** `packages/web/src/lib/voice/context-builder.ts`

```typescript
// ============================================================
// CONTEXT BUILDER — Assembles all data for voice assistant LLM
// ============================================================

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface VoiceContext {
  // --- P0: Always included ---
  client?: ClientContext;
  formulation?: FormulationContext;
  stylist: StylistContext;
  safetyFlags: SafetyFlag[];

  // --- P1: Enriched ---
  clientHistory?: ClientVisitContext[];
  inventory?: InventoryContext[];
  shadeMetadata?: ShadeMetadataContext;

  // --- Computed ---
  contextSummary: string;   // one-line summary for UI
  hasActiveFormulation: boolean;
}

interface ClientContext {
  id: string;
  name: string;
  hairTexture?: string | null;
  hairDensity?: string | null;
  naturalLevel?: number | null;
  naturalTone?: string | null;
  porosity: string;
  scalpCondition: string;
  allergies: {
    ppd: boolean;
    ammonia: boolean;
    fragrance: boolean;
    known_allergens: string[];
  };
  hasStraightening: boolean;
  hasPermedHair: boolean;
  hasMetallicDye: boolean;
  hasHenna: boolean;
  hasPreviousColor: boolean;
  lastColorServiceDate?: Date | null;
  generalNotes?: string | null;
  totalVisits: number;
  lastVisitAt?: Date | null;
}

interface FormulationContext {
  id: string;
  brand: string | null;
  productLine: string | null;
  primaryFormula: Prisma.JsonValue;   // parsed from Formulation.primary_formula
  toningFormula?: Prisma.JsonValue;
  processingInstructions: Prisma.JsonValue;
  warnings: string[];
  confidenceScore?: Prisma.Decimal | null;
  status: string;
  createdAt: Date;
}

interface StylistContext {
  id: string;
  name: string;
  preferredBrands: string[];
  defaultDeveloper?: number;
  salonId?: string | null;
}

interface SafetyFlag {
  type: 'allergy' | 'metallic_dye' | 'henna' | 'straightening' | 'post_chemo' | 'porosity' | 'damage' | 'high_gray';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  source: 'client_profile' | 'formulation' | 'inventory';
}

interface ClientVisitContext {
  date: Date;
  serviceType?: string | null;
  formulationBrand?: string | null;
  notes?: string | null;
  photos?: Prisma.JsonValue;
}

interface InventoryContext {
  brand: string;
  shadeCode: string;
  shadeName: string;
  quantity: number;
  unit: string;
  lowStock: boolean;
}

interface ShadeMetadataContext {
  shadeCode: string;
  shadeName?: string | null;
  level?: number | null;
  primaryTone?: string | null;
  undertone?: string | null;
  bestFor: string[];
  notRecommendedFor: string[];
}
```

### 3.4 Context Builder Implementation

```typescript
// ============================================================
// packages/web/src/lib/voice/context-builder.ts (concrete)
// ============================================================

export async function buildVoiceContext(
  stylistId: string,
  clientId?: string,
  formulationId?: string,
  salonId?: string
): Promise<VoiceContext> {
  const startTime = Date.now();

  // --- Fetch stylist (always required) ---
  const stylist = await prisma.stylist.findUnique({
    where: { id: stylistId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      preferences: true,
      salon_id: true,
      salon: { select: { preferred_brands: true } },
    },
  });

  if (!stylist) throw new Error('Stylist not found');

  const stylistPrefs = (stylist.preferences as Record<string, any>) || {};
  const stylistContext: StylistContext = {
    id: stylist.id,
    name: `${stylist.first_name} ${stylist.last_name}`,
    preferredBrands: stylist.salon?.preferred_brands || stylistPrefs.preferred_brands || [],
    defaultDeveloper: stylistPrefs.preferred_developer,
    salonId: stylist.salon_id,
  };

  // --- Fetch client (if provided) ---
  let clientContext: ClientContext | undefined;
  let clientHistory: ClientVisitContext[] | undefined;

  if (clientId) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        formulations: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { id: true, brand: true, created_at: true },
        },
        client_visits: {
          orderBy: { visit_date: 'desc' },
          take: 3,
          select: {
            visit_date: true,
            service_type: true,
            hair_state: true,
            stylist_notes: true,
            photos: true,
            formulation: { select: { brand: true } },
          },
        },
      },
    });

    if (client) {
      const allergies = (client.allergies as Record<string, any>) || {};
      clientContext = {
        id: client.id,
        name: `${client.first_name} ${client.last_name}`,
        hairTexture: client.hair_texture,
        hairDensity: client.hair_density,
        naturalLevel: client.natural_level,
        naturalTone: client.natural_tone,
        porosity: client.porosity,
        scalpCondition: client.scalp_condition,
        allergies: {
          ppd: allergies.ppd ?? false,
          ammonia: allergies.ammonia ?? false,
          fragrance: allergies.fragrance ?? false,
          known_allergens: allergies.known_allergens || [],
        },
        hasStraightening: client.has_straightening,
        hasPermedHair: client.has_permed_hair,
        hasMetallicDye: client.has_metallic_dye,
        hasHenna: client.has_henna,
        hasPreviousColor: client.has_previous_color,
        lastColorServiceDate: client.last_color_service_date,
        generalNotes: client.general_notes,
        totalVisits: client.total_visits,
        lastVisitAt: client.last_visit_at,
      };

      clientHistory = client.client_visits.map(v => ({
        date: v.visit_date,
        serviceType: v.service_type,
        formulationBrand: v.formulation?.brand,
        notes: v.stylist_notes,
        photos: v.photos,
      }));
    }
  }

  // --- Fetch formulation (if provided) ---
  let formulationContext: FormulationContext | undefined;

  if (formulationId) {
    const formulation = await prisma.formulation.findUnique({
      where: { id: formulationId, stylist_id: stylistId },
      include: {
        client: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (formulation) {
      formulationContext = {
        id: formulation.id,
        brand: formulation.brand,
        productLine: formulation.product_line,
        primaryFormula: formulation.primary_formula,
        toningFormula: formulation.toning_formula,
        processingInstructions: formulation.processing_instructions,
        warnings: formulation.warnings,
        confidenceScore: formulation.confidence_score,
        status: formulation.status,
        createdAt: formulation.createdAt,
      };
    }
  }

  // --- Compute safety flags ---
  const safetyFlags = computeSafetyFlags(clientContext, formulationContext);

  // --- Fetch inventory (P1) ---
  let inventory: InventoryContext[] | undefined;
  if (salonId && formulationContext?.brand) {
    const items = await prisma.inventoryItem.findMany({
      where: {
        salonId,
        brand: formulationContext.brand,
      },
      select: {
        brand: true,
        shadeCode: true,
        shadeName: true,
        quantity: true,
        unit: true,
        lowStockThreshold: true,
      },
      take: 20, // limit to relevant shades
    });

    inventory = items.map(i => ({
      brand: i.brand,
      shadeCode: i.shadeCode,
      shadeName: i.shadeName,
      quantity: i.quantity,
      unit: i.unit,
      lowStock: i.lowStockThreshold !== null && i.quantity <= i.lowStockThreshold,
    }));
  }

  // --- Shade metadata (P1) ---
  let shadeMetadata: ShadeMetadataContext | undefined;
  if (formulationContext?.primaryFormula) {
    const primary = formulationContext.primaryFormula as any;
    const firstComponent = primary?.components?.[0];
    if (firstComponent?.shade?.code) {
      const shade = await prisma.shade.findFirst({
        where: { shade_code: firstComponent.shade.code },
        select: {
          shade_code: true,
          shade_name: true,
          level: true,
          primary_tone: true,
          undertone: true,
          best_for: true,
          not_recommended_for: true,
        },
      });
      if (shade) {
        shadeMetadata = {
          shadeCode: shade.shade_code,
          shadeName: shade.shade_name,
          level: shade.level,
          primaryTone: shade.primary_tone,
          undertone: shade.undertone,
          bestFor: shade.best_for,
          notRecommendedFor: shade.not_recommended_for,
        };
      }
    }
  }

  // --- Build summary ---
  const hasActiveFormulation = !!formulationContext;
  const contextSummary = buildContextSummary(clientContext, formulationContext, safetyFlags);

  const context: VoiceContext = {
    client: clientContext,
    formulation: formulationContext,
    stylist: stylistContext,
    safetyFlags,
    clientHistory,
    inventory,
    shadeMetadata,
    contextSummary,
    hasActiveFormulation,
  };

  console.log(`[VoiceContext] Built in ${Date.now() - startTime}ms | Flags: ${safetyFlags.length} | Inventory: ${inventory?.length ?? 0}`);
  return context;
}

// --- Safety flag computation ---

function computeSafetyFlags(
  client?: ClientContext,
  formulation?: FormulationContext
): SafetyFlag[] {
  const flags: SafetyFlag[] = [];

  if (!client) return flags;

  if (client.hasMetallicDye) {
    flags.push({
      type: 'metallic_dye',
      message: 'Metallic dye history detected. Oxidative color can cause severe damage. Malibu C treatment required before coloring.',
      severity: 'critical',
      source: 'client_profile',
    });
  }

  if (client.hasHenna) {
    flags.push({
      type: 'henna',
      message: 'Henna in hair history. Unpredictable results possible. Strand test required 48 hours prior.',
      severity: 'critical',
      source: 'client_profile',
    });
  }

  if (client.allergies.ppd) {
    flags.push({
      type: 'allergy',
      message: `Client has PPD allergy. Use PPD-free color lines only.`,
      severity: 'critical',
      source: 'client_profile',
    });
  }

  if (client.hasStraightening) {
    flags.push({
      type: 'straightening',
      message: 'Previous chemical straightening detected. Hair may be compromised. Use lowest effective developer.',
      severity: 'warning',
      source: 'client_profile',
    });
  }

  if (client.porosity === 'high') {
    flags.push({
      type: 'porosity',
      message: 'High porosity detected. Use cooler developer (20vol max) and monitor closely to prevent over-processing.',
      severity: 'warning',
      source: 'client_profile',
    });
  }

  // Formulation-derived flags
  if (formulation?.warnings) {
    for (const warning of formulation.warnings) {
      const severity = warning.includes('CRITICAL') ? 'critical' :
                       warning.includes('⚠️') ? 'warning' : 'info';
      flags.push({
        type: 'damage',
        message: warning.replace(/⚠️\s*(CRITICAL:\s*)?/, ''),
        severity,
        source: 'formulation',
      });
    }
  }

  return flags;
}

function buildContextSummary(
  client?: ClientContext,
  formulation?: FormulationContext,
  flags?: SafetyFlag[]
): string {
  const parts: string[] = [];
  if (client) parts.push(`Client: ${client.name}`);
  if (formulation) {
    const brand = formulation.brand || 'Unknown brand';
    parts.push(`Formula: ${brand} (${formulation.status})`);
  }
  if (flags && flags.length > 0) {
    const critical = flags.filter(f => f.severity === 'critical').length;
    parts.push(`${critical > 0 ? `⚠️ ${critical} critical` : `${flags.length} safety flags`}`);
  }
  return parts.join(' | ') || 'No active context';
}
```

---

## 4. System Prompt

### 4.1 Production System Prompt

**File:** `packages/web/src/lib/voice/system-prompt.ts`

```typescript
// ============================================================
// SYSTEM PROMPT — Voice Assistant LLM Prompt
// Placeholders are filled by context-builder.ts
// ============================================================

export interface SystemPromptVars {
  stylistName: string;
  clientName?: string;
  clientHairProfile?: string;
  currentFormulation?: string;
  processingTime?: string;
  developerVolume?: string;
  safetyFlagsText: string;
  stylistBrandsText: string;
  clientHistoryText?: string;
  inventoryText?: string;
  shadeMetadataText?: string;
}

export function buildSystemPrompt(vars: SystemPromptVars): string {
  return `You are ColorGenius, an AI hair color assistant for professional stylists. You are speaking to ${vars.stylistName}, who is currently working at the color bowl with a client.

## YOUR RULES
1. **Be concise.** Bowl-side = seconds matter. Every answer must be 2-3 sentences maximum. Use bullet points if listing steps.
2. **Reference the specific formulation.** If a current formula exists, always tie your answer to the brand, shade, developer, and processing time.
3. **Flag safety immediately.** If a safety concern exists, state it first — never bury it.
4. **If unsure, say so.** Never guess on chemistry. Say "I don't have enough information" rather than risk an unsafe answer.
5. **Use professional colorist language.** Levels, tones, underlying pigment, developer volume, porosity.
6. **Suggest checking/strand testing** when appropriate — especially with compromised hair or corrective work.
7. **Do not make up shade codes.** Only reference shades you see in the formulation data.
8. **Inventory awareness:** If asked about stock, reference current inventory levels. Suggest reorder if low.

## CURRENT CONTEXT
${vars.clientName ? `- Client: ${vars.clientName}` : '- No client selected'}
${vars.clientHairProfile ? `- Hair profile: ${vars.clientHairProfile}` : ''}
${vars.currentFormulation ? `- Current formula: ${vars.currentFormulation}` : '- No active formulation'}
${vars.processingTime ? `- Processing time: ${vars.processingTime}` : ''}
${vars.developerVolume ? `- Developer: ${vars.developerVolume}` : ''}

## SAFETY FLAGS
${vars.safetyFlagsText || 'No safety flags.'}

## STYLIST BRAND PREFERENCES
${vars.stylistBrandsText || 'No brand preferences set.'}

${vars.clientHistoryText ? `## CLIENT HISTORY (last 3 visits)\n${vars.clientHistoryText}` : ''}

${vars.inventoryText ? `## INVENTORY STATUS\n${vars.inventoryText}` : ''}

${vars.shadeMetadataText ? `## SHADE METADATA\n${vars.shadeMetadataText}` : ''}

## RESPONSE FORMAT
- Direct answer first.
- If safety-critical: safety flag in ALL CAPS as the first sentence.
- If steps are needed: numbered list, max 3 steps.
- End with a confidence indicator: "(confident)" or "(check with senior stylist)" for uncertain cases.
`;
}

// Helper to format context for prompt
export function formatContextForPrompt(ctx: VoiceContext): SystemPromptVars {
  const clientName = ctx.client ? `${ctx.client.name}` : undefined;

  const clientHairProfile = ctx.client
    ? `Level ${ctx.client.naturalLevel ?? '?'}${ctx.client.naturalTone ?? ''}, ` +
      `${ctx.client.hairTexture ?? 'unknown'} texture, ` +
      `${ctx.client.porosity} porosity, ` +
      `${ctx.client.hairDensity ?? 'unknown'} density` +
      (ctx.client.hasPreviousColor ? ', previously colored' : '') +
      (ctx.client.hasStraightening ? ', chemically straightened' : '') +
      (ctx.client.hasPermedHair ? ', permed' : '')
    : undefined;

  const currentFormulation = ctx.formulation
    ? `${ctx.formulation.brand ?? 'Unknown brand'} ${ctx.formulation.productLine ?? ''} — ` +
      `${formatFormulaComponents(ctx.formulation.primaryFormula)}`
    : undefined;

  const processingTime = ctx.formulation?.processingInstructions
    ? formatProcessingTime(ctx.formulation.processingInstructions)
    : undefined;

  const developerVolume = ctx.formulation?.primaryFormula
    ? (ctx.formulation.primaryFormula as any)?.developer?.volume + ' vol'
    : undefined;

  const safetyFlagsText = ctx.safetyFlags.length > 0
    ? ctx.safetyFlags.map(f =>
        `[${f.severity.toUpperCase()}] ${f.type.replace('_', ' ')}: ${f.message}`
      ).join('\n')
    : 'No safety flags.';

  const stylistBrandsText = ctx.stylist.preferredBrands.length > 0
    ? ctx.stylist.preferredBrands.join(', ')
    : 'No brand preferences set.';

  const clientHistoryText = ctx.clientHistory && ctx.clientHistory.length > 0
    ? ctx.clientHistory.map((h, i) =>
        `${i + 1}. ${h.date.toDateString()}: ${h.serviceType ?? 'Unknown service'}${h.formulationBrand ? ` using ${h.formulationBrand}` : ''}${h.notes ? ` — Notes: ${h.notes}` : ''}`
      ).join('\n')
    : undefined;

  const inventoryText = ctx.inventory && ctx.inventory.length > 0
    ? ctx.inventory.map(i =>
        `- ${i.brand} ${i.shadeCode} (${i.shadeName}): ${i.quantity}${i.unit}${i.lowStock ? ' ⚠️ LOW STOCK' : ''}`
      ).join('\n')
    : undefined;

  const shadeMetadataText = ctx.shadeMetadata
    ? `Shade: ${ctx.shadeMetadata.shadeCode} — ${ctx.shadeMetadata.shadeName ?? 'Unknown name'}\n` +
      `Level ${ctx.shadeMetadata.level ?? '?'}, tone ${ctx.shadeMetadata.primaryTone ?? '?'}\n` +
      `Undertone: ${ctx.shadeMetadata.undertone ?? 'unknown'}\n` +
      `Best for: ${ctx.shadeMetadata.bestFor.join(', ') || 'N/A'}\n` +
      `Not recommended for: ${ctx.shadeMetadata.notRecommendedFor.join(', ') || 'N/A'}`
    : undefined;

  return {
    stylistName: ctx.stylist.name,
    clientName,
    clientHairProfile,
    currentFormulation,
    processingTime,
    developerVolume,
    safetyFlagsText,
    stylistBrandsText,
    clientHistoryText,
    inventoryText,
    shadeMetadataText,
  };
}

function formatFormulaComponents(primaryFormula: any): string {
  const comps = primaryFormula?.components;
  if (!Array.isArray(comps)) return 'No components';
  return comps.map((c: any) =>
    `${c.shade?.code ?? '?'} (${c.shade?.name ?? '?'}) — ${c.amount_oz ?? '?'}oz`
  ).join(' + ');
}

function formatProcessingTime(instructions: any): string {
  const mins = instructions?.total_time_minutes;
  if (!mins) return 'Not set';
  const sequence = instructions?.application_sequence;
  if (!sequence?.length) return `${mins} minutes`;
  return `${mins} minutes total: ${sequence.map((s: any) => `${s.zone} ${s.duration}min`).join(', ')}`;
}
```

---

## 5. Integration Plan

### 5.1 Where the Mic Button Lives

The voice assistant is a **global floating action button (FAB)** available on every authenticated page. It adapts its context based on the current route and any selected client/formulation.

| Route | Context Source | clientId / formulationId | Example Question |
|-------|---------------|------------------------|------------------|
| `/dashboard` | Global / last client | Last active formulation | "What was Sarah's last formula?" |
| `/formulate` | In-progress form | From form state | "Should I use 20 or 30 vol for this?" |
| `/results` | Completed formulation | From results page | "How long should I process this?" |
| `/clients/[id]` | Client profile | From client page | "Does she have any allergies?" |
| `/clients` | Client list | None | "When was Maria's last visit?" |
| `/history` | Past formulations | None | "How many formulas did I do last week?" |
| Any other | Global | None | "What developer do I need for 3 levels of lift?" |

### 5.2 Context Detection Logic

The voice hook determines context from React state + URL:

```typescript
// packages/web/src/lib/voice/use-voice-context.ts

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export interface VoicePageContext {
  clientId?: string;
  formulationId?: string;
  contextSource: 'dashboard' | 'formulate' | 'results' | 'clients' | 'global';
}

export function useVoicePageContext(): VoicePageContext {
  const pathname = usePathname();
  const { user } = useAuth();

  // Extract from URL
  const clientMatch = pathname.match(/\/clients\/([^\/]+)/);
  const formulationMatch = pathname.match(/\/results\?id=([^&]+)/);

  // Determine source
  let contextSource: VoicePageContext['contextSource'] = 'global';
  if (pathname === '/dashboard') contextSource = 'dashboard';
  else if (pathname === '/formulate') contextSource = 'formulate';
  else if (pathname.startsWith('/results')) contextSource = 'results';
  else if (pathname.startsWith('/clients')) contextSource = 'clients';

  // Read from global state (set by pages when client/formulation is selected)
  // In Phase 1, pages set window.__VOICE_CONTEXT via a small bridge
  const globalContext = (typeof window !== 'undefined'
    ? (window as any).__VOICE_CONTEXT
    : undefined) as { clientId?: string; formulationId?: string } | undefined;

  return {
    clientId: clientMatch?.[1] || globalContext?.clientId,
    formulationId: formulationMatch?.[1] || globalContext?.formulationId,
    contextSource,
  };
}
```

### 5.3 "No Active Formulation" vs "Mid-Formulation" Context

| State | Behavior |
|-------|----------|
| **No client, no formulation** | Assistant answers generically about color science, brand recommendations, and salon best practices. Prompt includes: "No client or formulation is currently active. Answer generally but reference stylist brand preferences if relevant." |
| **Client selected, no formulation** | Assistant answers about client history, allergies, preferences. Can suggest formulation parameters. |
| **Client + formulation active** | Full context. Every answer ties back to the specific formula, brand, shade, developer, and processing time. |
| **Formulation active, no client** | Assistant answers about the formula itself. Cannot reference client history or allergies. |

### 5.4 Database Changes

#### New Model: `VoiceInteraction`

```prisma
// Add to schema.prisma

model VoiceInteraction {
  id String @id @default(cuid())

  stylist_id String
  stylist    Stylist @relation(fields: [stylist_id], references: [id], onDelete: Cascade)

  // Context at time of query
  client_id       String?
  client          Client?   @relation(fields: [client_id], references: [id], onDelete: SetNull)
  formulation_id  String?
  formulation     Formulation? @relation(fields: [formulation_id], references: [id], onDelete: SetNull)

  // Query data
  question          String   @db.Text
  transcript        String   @db.Text
  transcript_confidence Float?

  // Response data
  answer           String   @db.Text
  answer_tokens    Int?
  response_time_ms Int?

  // Safety
  safety_flags_triggered Json?  // array of flag objects

  // Provider tracking
  stt_provider  String @default("browser") @db.VarChar(20)
  llm_provider  String @default("openai") @db.VarChar(20)
  tts_provider  String @default("browser") @db.VarChar(20)

  // User feedback (Phase 2)
  user_rating   Int?     // 1-5 thumbs up/down
  user_feedback String?  @db.Text

  // Session for multi-turn
  session_id String?

  created_at DateTime @default(now())

  @@index([stylist_id])
  @@index([client_id])
  @@index([formulation_id])
  @@index([created_at])
  @@index([session_id])
  @@index([stylist_id, created_at])
}
```

#### Migration

```sql
-- Run via: npx prisma migrate dev --name add_voice_interaction
-- Or create manually:

CREATE TABLE "VoiceInteraction" (
  "id" TEXT NOT NULL,
  "stylist_id" TEXT NOT NULL,
  "client_id" TEXT,
  "formulation_id" TEXT,
  "question" TEXT NOT NULL,
  "transcript" TEXT NOT NULL,
  "transcript_confidence" DOUBLE PRECISION,
  "answer" TEXT NOT NULL,
  "answer_tokens" INTEGER,
  "response_time_ms" INTEGER,
  "safety_flags_triggered" JSONB,
  "stt_provider" VARCHAR(20) NOT NULL DEFAULT 'browser',
  "llm_provider" VARCHAR(20) NOT NULL DEFAULT 'openai',
  "tts_provider" VARCHAR(20) NOT NULL DEFAULT 'browser',
  "user_rating" INTEGER,
  "user_feedback" TEXT,
  "session_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VoiceInteraction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VoiceInteraction_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE CASCADE,
  CONSTRAINT "VoiceInteraction_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL,
  CONSTRAINT "VoiceInteraction_formulation_id_fkey" FOREIGN KEY ("formulation_id") REFERENCES "Formulation"("id") ON DELETE SET NULL
);

CREATE INDEX "VoiceInteraction_stylist_id_idx" ON "VoiceInteraction"("stylist_id");
CREATE INDEX "VoiceInteraction_client_id_idx" ON "VoiceInteraction"("client_id");
CREATE INDEX "VoiceInteraction_formulation_id_idx" ON "VoiceInteraction"("formulation_id");
CREATE INDEX "VoiceInteraction_created_at_idx" ON "VoiceInteraction"("created_at");
CREATE INDEX "VoiceInteraction_session_id_idx" ON "VoiceInteraction"("session_id");
CREATE INDEX "VoiceInteraction_stylist_created_idx" ON "VoiceInteraction"("stylist_id", "created_at");
```

---

## 6. File / Module Structure

```
packages/web/src/
│
├── app/
│   ├── api/
│   │   └── voice/
│   │       ├── ask/
│   │       │   └── route.ts          # POST /api/voice/ask
│   │       ├── transcribe/
│   │       │   └── route.ts          # POST /api/voice/transcribe (Phase 2)
│   │       ├── speak/
│   │       │   └── route.ts          # POST /api/voice/speak (Phase 2)
│   │       └── health/
│   │           └── route.ts          # GET /api/voice/health
│   ├── layout.tsx                      # Mount VoiceAssistantProvider here
│   └── ...
│
├── components/
│   └── voice/
│       ├── VoiceFAB.tsx               # Floating mic button (56px, bottom-right)
│       ├── VoicePanel.tsx             # Slide-up panel: listening, transcript, response
│       ├── VoiceWaveform.tsx          # Animated audio waveform visualization
│       ├── VoiceResponseCard.tsx      # Displayed answer with replay button
│       ├── VoiceSafetyBanner.tsx      # Critical/warning banner for safety flags
│       └── index.ts                   # Barrel export
│
├── lib/
│   └── voice/
│       ├── context-builder.ts         # BuildVoiceContext + helpers
│       ├── system-prompt.ts           # buildSystemPrompt + formatContextForPrompt
│       ├── use-voice-context.ts       # React hook: detect page context
│       ├── use-voice-recorder.ts      # Browser MediaRecorder + SpeechRecognition
│       ├── use-voice-speech.ts        # Browser SpeechSynthesis wrapper
│       ├── voice-api.ts               # Fetch wrappers for /api/voice/* routes
│       ├── voice-session.ts           # Multi-turn conversation session manager
│       └── index.ts                   # Barrel export
│
├── types/
│   └── voice.ts                       # VoiceAskRequest, VoiceContext, etc.
```

---

## 7. Implementation Order (Dev Handoff)

### Sprint 1: Foundation
1. **Prisma migration** — add `VoiceInteraction` table
2. **File scaffold** — create all directories and empty files
3. **Context builder** — implement `buildVoiceContext()` with Prisma queries
4. **System prompt** — implement `buildSystemPrompt()` + `formatContextForPrompt()`
5. **API route: `/api/voice/ask`** — wire context builder → OpenAI → response

### Sprint 2: Browser Voice
6. **Voice recorder hook** — `useVoiceRecorder()` with `webkitSpeechRecognition`
7. **Voice speech hook** — `useVoiceSpeech()` with `window.speechSynthesis`
8. **Voice FAB component** — floating button with tap-to-talk
9. **Voice panel** — slide-up overlay with transcript + response display
10. **Safety banner** — red/yellow banner for critical/warning flags

### Sprint 3: Integration
11. **Layout integration** — mount FAB in root layout
12. **Page context bridge** — `window.__VOICE_CONTEXT` setter on formulate/results/clients
13. **Interaction logging** — save every voice query to `VoiceInteraction` table
14. **Rate limiting** — middleware: 30 req/min per user

### Sprint 4: Polish
15. **Audio waveform animation** — visual feedback while listening
16. **Response card** — styled answer with replay, copy, thumbs up/down
17. **Edge cases** — no context, network failure, STT timeout, LLM timeout
18. **Analytics dashboard** — admin view of voice usage (Phase 2)

---

## 8. Technology Decisions

| Layer | Phase 1 (MVP) | Phase 2 (Production) |
|-------|--------------|----------------------|
| **STT** | Web Speech API (`webkitSpeechRecognition`) | Deepgram Nova-2 (salon noise model) |
| **TTS** | `window.speechSynthesis` | ElevenLabs Multilingual v2 |
| **LLM** | OpenAI GPT-4o-mini (fast, cheap) | GPT-4o-mini or Claude Haiku (evaluate) |
| **Streaming** | Server-Sent Events (SSE) | Same |
| **Audio format** | WebM Opus (browser native) | Same |
| **Session store** | In-memory (Map) per request | Redis for multi-turn + persistence |

---

## 9. Security Considerations

1. **Auth:** Every voice route requires valid JWT cookie. Reject anonymous.
2. **Rate limiting:** 30 req/min per user. Voice is expensive; prevent abuse.
3. **Input validation:** Sanitize transcript before sending to LLM. No prompt injection.
4. **Audio storage:** Phase 1 does not store audio. Phase 2 stores audio URLs (R2/S3) with 7-day TTL.
5. **PII:** `VoiceInteraction` table contains client names. Apply same access controls as `Client` table.
6. **LLM output:** Safety flags are computed independently of LLM. Never trust LLM to identify safety issues.

---

## 10. Performance Targets

| Metric | Phase 1 Target | How Measured |
|--------|---------------|--------------|
| Tap-to-first-text | < 3s | `VoiceInteraction.response_time_ms` |
| Tap-to-first-audio | < 4s | Browser Performance API |
| STT accuracy | > 85% | Manual spot-check + Deepgram confidence |
| LLM latency (TTFT) | < 1.5s | OpenAI API metrics |
| Context build time | < 200ms | `Date.now()` delta in `buildVoiceContext` |
| Database query time | < 100ms | Prisma query logs |

---

## 11. Appendix: Sample API Call Flow

```
[Stylist taps FAB on /results?id=form-123]
        │
        ▼
[VoicePanel opens → useVoiceRecorder starts]
        │
        ▼
[Browser: webkitSpeechRecognition → transcript: "How long?"]
        │
        ▼
[POST /api/voice/ask]
  Body: {
    question: "How long?",
    clientId: "cli-456",
    formulationId: "form-123",
    contextSource: "results"
  }
        │
        ▼
[Server: verify JWT → buildVoiceContext()]
  Queries: Stylist, Client (with visits), Formulation, Inventory
  Time: ~150ms
        │
        ▼
[Server: formatContextForPrompt() → buildSystemPrompt()]
  Result: 2,400-token prompt with full context
        │
        ▼
[Server: OpenAI GPT-4o-mini streaming]
  Chunk 1: "Process for 20 minutes."
  Chunk 2: " Check at 15 if the hair is porous."
        │
        ▼
[Server: parallel TTS with SpeechSynthesis]
  Audio starts playing at ~3.2s
        │
        ▼
[VoicePanel displays text + plays audio]
  Interaction logged to VoiceInteraction table
```

---

*End of Architecture Document. Ready for dev sprint planning.*
