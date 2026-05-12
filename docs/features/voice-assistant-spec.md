# ColorGenius Voice Assistant — Feature Spec

**Status:** Spec Complete — Ready for Research & Architecture
**Priority:** Phase 1 Beta Differentiator
**Owner:** Iris (CEO) → delegated to Architect + Dev
**Target:** Bowl-side, hands-free AI consultant for stylists

---

## 1. Problem Statement

Stylists work with gloved hands, chemicals, and clients in the chair. They cannot type. When a question comes up mid-service — timing, safety, developer choice, corrective steps — they need an answer *now*, without leaving the bowl or pulling off gloves.

**No existing salon tool solves this.** ReFa, Vish, and every salon POS require screen interaction. A voice-first AI assistant at the bowl is a category-defining feature.

---

## 2. User Stories

### Primary: Bowl-Side Consultation
> As a colorist applying formula at the bowl, I tap the mic button and ask "How long should I process this?" so I get an instant answer based on my current client's formulation, hair type, and color line — without touching my screen with gloved hands.

### Secondary: Safety Check
> As a colorist with a new client, I ask "Can I color over metallic dye?" and get a clear yes/no answer with risk context, based on what the client disclosed in their questionnaire.

### Tertiary: Inventory / Reorder
> As a stylist mid-service, I ask "Do I have enough Igora Royal 7-77 for this formulation?" and get a stock answer from my inventory, optionally triggering an auto-order.

### Future: Corrective Guidance
> As a colorist whose toner went too ashy, I ask "How do I fix this?" and the assistant references the current formulation, client history, and suggests a corrective step.

---

## 3. UX Design: Push-to-Talk

### Interaction Model

```
┌──────────────────────────────────────────────┐
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │                                      │   │
│   │    🎙️  Tap to ask a question         │   │
│   │                                      │   │
│   │    ┌────────────────────────────┐    │   │
│   │    │  ● Listening...            │    │   │
│   │    │                            │    │   │
│   │    │  "How long should I        │    │   │
│   │    │   process this?"           │    │   │
│   │    └────────────────────────────┘    │   │
│   │                                      │   │
│   │    ┌────────────────────────────┐    │   │
│   │    │  🤖 ColorGenius            │    │   │
│   │    │                            │    │   │
│   │    │  "For Shades EQ 09V with  │    │   │
│   │    │   20 vol on level 8 hair,  │    │   │
│   │    │   process for 20 minutes.  │    │   │
│   │    │   Check at 15 for          │    │   │
│   │    │   porosity."               │    │   │
│   │    │                            │    │   │
│   │    │  🔊 [Replay]  [Ask More]   │    │   │
│   │    └────────────────────────────┘    │   │
│   │                                      │   │
│   └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

### Flow

1. **Tap** floating mic button (always accessible, FAB)
2. **Speak** question (browser records via Web Speech API or streaming STT)
3. **Transcript appears** in real-time (confidence feedback for user)
4. **Processing** — context assembled, sent to LLM
5. **Response streams** — text appears + TTS speaks simultaneously
6. **Tap again** to ask follow-up, or dismiss

### Accessibility
- Large tap target (FAB, 56px minimum)
- High contrast recording indicator
- Audio feedback: chime on start, chime on response ready
- Works with screen locked? (PWA — future)

---

## 4. Context System

The assistant is only useful if it's **contextual**. Generic ChatGPT at the bowl is worthless. The prompt must include:

### Per-Query Context

| Context Source | Data |
|---------------|------|
| **Current Formulation** | Brand, line, shade, developer, ratio, processing time |
| **Client Profile** | Hair type, texture, porosity, allergies, history, previous color |
| **Stylist Preferences** | Brands/lines they carry, default developer |
| **Inventory** | Current stock levels for relevant products |
| **Formulation Engine Rules** | Level system, underlying pigments, developer chemistry |
| **Safety Flags** | PPD, metallic dye, henna, allergy warnings |

### System Prompt (Draft)

```
You are ColorGenius, an AI assistant for professional hair colorists.
You are speaking to a stylist who is currently working at the color bowl.

CONTEXT:
- Client: {client_name}, hair level {current_level} → {target_level}
- Current formula: {brand} {line} {shade} + {developer_vol} vol, ratio {ratio}
- Processing time: {time} minutes
- Client history: {previous_services}
- Safety flags: {allergies, metallic_dye, henna, straightening}
- Stylist carries: {brand_lines}

RULES:
- Be concise. Bowl-side = seconds matter. 2-3 sentences max.
- Always reference the specific formulation when relevant.
- Flag safety concerns immediately. Never be vague about risk.
- If unsure, say so. Never guess on chemistry.
- Use professional colorist language (level, tone, underlying pigment).
- Suggest checking/strand testing when appropriate.
```

---

## 5. Technical Architecture

### Flow

```
[Mic Button Tap]
      │
      ▼
[Browser: Web Speech API / MediaRecorder]
      │
      │ audio stream / transcript
      ▼
[Next.js API Route: /api/voice]
      │
      │ 1. Assemble context (client, formulation, inventory, safety)
      │ 2. Build system prompt with context
      │ 3. Send to LLM
      │
      ▼
[LLM: OpenAI / Anthropic / Local]
      │
      │ streaming response (text chunks)
      ▼
[TTS Service: ElevenLabs / OpenAI TTS / Browser SpeechSynthesis]
      │
      │ audio stream
      ▼
[Browser: Audio playback + transcript display]
```

### Technology Options

#### Speech-to-Text (STT)

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Web Speech API** | Free, built-in, no API key | Chrome-only, no streaming, accuracy varies | Free |
| **Deepgram** | Fast, streaming, salon-noise tolerant | API dependency | $0.0043/min |
| **Whisper API (OpenAI)** | Great accuracy, many languages | Not real-time (batch) | $0.006/min |
| **Whisper (local)** | No API calls, private | Heavier, needs GPU or CPU tradeoff | Free |

**Recommendation Phase 1:** Web Speech API (zero cost, works now in Chrome/Safari). Upgrade to Deepgram if accuracy is insufficient in salon noise.

#### Text-to-Speech (TTS)

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Browser SpeechSynthesis** | Free, built-in, instant | Robotic voice | Free |
| **ElevenLabs** | Natural, professional, low latency | API dependency | $0.30/1K chars |
| **OpenAI TTS** | Good quality, streaming | API dependency | $15/1M chars |

**Recommendation Phase 1:** Browser SpeechSynthesis for instant prototype. Upgrade to ElevenLabs for production (natural voice matters — stylists won't trust a robot voice with chemistry advice).

#### LLM

| Option | Pros | Cons |
|--------|------|------|
| **GPT-4o-mini** | Fast, cheap, good enough for Q&A | External API |
| **Claude Haiku** | Fast, accurate, good with context | External API |
| **Local (Ollama)** | Private, no API costs | Latency, hosting |

**Recommendation:** GPT-4o-mini or Claude Haiku for Phase 1. The context window is small (formulation + client data), so speed matters more than model size.

---

## 6. Integration Points

### Existing Systems to Connect

| System | Integration | Priority |
|--------|------------|----------|
| **Formulation Engine** | Pass current formula as context | P0 |
| **Client Profile** | Pass client history, allergies, hair type | P0 |
| **Stylist Brand Preferences** | Filter recommendations to brands they carry | P0 |
| **Inventory (Prisma)** | "Do I have enough X?" stock queries | P1 |
| **Safety Flags** | PPD, metallic dye, henna alerts in prompt | P0 |
| **Auto-Order** | "Order more 7-77" voice-triggered reorder | P2 |

### New API Endpoints

```
POST /api/voice/ask
  Body: { question: string, context: { clientId?, formulationId?, stylistId } }
  Response: { answer: string, audioUrl?: string, safety_flag?: string }

POST /api/voice/transcribe
  Body: { audio: base64 | Blob }
  Response: { transcript: string, confidence: number }

POST /api/voice/speak
  Body: { text: string, voice?: string }
  Response: { audioUrl: string | streaming audio }
```

---

## 7. Phased Rollout

### Phase 1: MVP (Beta)
- [ ] Push-to-talk mic button (FAB, always visible)
- [ ] Web Speech API for STT
- [ ] Browser SpeechSynthesis for TTS
- [ ] Context: current formulation + client profile
- [ ] Basic Q&A: processing time, developer choice, safety flags
- [ ] Transcript display (text, not just voice)
- **Timeline:** 1-2 weeks
- **Cost:** Near zero (browser APIs)

### Phase 2: Production Voice
- [ ] Upgrade STT → Deepgram (salon noise tolerance)
- [ ] Upgrade TTS → ElevenLabs (natural voice)
- [ ] Add inventory context ("Do I have enough?")
- [ ] Conversation memory (follow-up questions)
- [ ] Formulation correction guidance
- **Timeline:** 2-3 weeks after Phase 1
- **Cost:** ~$50-100/mo at 50 stylists

### Phase 3: Advanced
- [ ] Wake word ("Hey ColorGenius")
- [ ] Auto-order via voice ("Order more Igora Royal 7-77")
- [ ] Multi-language support
- [ ] Client-facing mode (explain the formula to the client)
- [ ] PWA offline mode (cached formulations)
- **Timeline:** Phase 2 post-beta

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| **Adoption** | 80% of beta stylists use voice at least once per day |
| **Accuracy** | 95%+ useful answers (thumbs up on response) |
| **Latency** | <3s from question to first audio output |
| **Retention** | Stylists who use voice have 2x formulation completion rate |
| **NPS impact** | Voice users rate ColorGenius 9+/10 |

---

## 9. Competitive Position

| Feature | ColorGenius | ReFa | Vish | SalonScale |
|---------|-------------|------|------|------------|
| Voice consultation | ✅ | ❌ | ❌ | ❌ |
| Context-aware answers | ✅ | ❌ | ❌ | ❌ |
| Hands-free at bowl | ✅ | ❌ | ❌ | ❌ |
| Safety alerts via voice | ✅ | ❌ | ❌ | ❌ |

**This is a moat.** No one else is doing this. First-mover advantage in voice + AI for salon workflow.

---

*Spec authored by Iris — ColorGenius CEO*
*Ready for Architect review and Dev task breakdown*
