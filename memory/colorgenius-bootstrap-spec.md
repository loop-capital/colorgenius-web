# ColorGenius — Technical Bootstrap Spec
## Competitive Deep-Dive + Build Instructions for PC2 (Iris/colorgenius)

**Version:** 1.0.0  
**Date:** 2026-04-24  
**Status:** Bootstrap — 0% build, 100% research validated  
**Author:** OpenClaw Subagent (che)  
**Audience:** Iris, PC2 Lead Engineer, Backend/ML leads  

---

## 1. Executive Summary

ColorGenius is an **AI-powered hair color formulation engine** for professional stylists. It digitizes 100+ years of color science into a system that generates precise color formulas from a smartphone photo, considering 10+ variables (current color, texture, porosity, damage, water quality, etc.).

**Current State:** Research is 100% complete (10 deep-dive documents). Build is 0%. This spec distills the research into a developer-ready bootstrap document.

**Key Differentiator:** No competitor combines on-device photo analysis, AI formulation across multiple professional color lines, and a learning feedback loop in a single tool. Most competitors are either consumer-facing (Madison Reed, eSalon) or salon-back-office tools (Vish, SalonScale) with no AI formulation.

---

## 2. Competitive Landscape & Gaps

### 2.1 Competitor Matrix

| Competitor | Type | AI Photo Analysis | Formulation Engine | Multi-Brand | Salon POS Integration | On-Device AI | Price |
|---|---|---|---|---|---|---|---|
| **Madison Reed** | D2C Consumer | ❌ Questionnaire only | ❌ Pre-mixed kits | ❌ Own brand only | ❌ N/A | ❌ Cloud | ~$30/kit |
| **eSalon** | D2C Consumer | ❌ Questionnaire only | ⚠️ Custom-mixed off-site | ❌ Own brand only | ❌ N/A | ❌ Cloud | ~$25/kit |
| **Schwarzkopf Professional** | B2B Brand | ❌ None | ❌ Static charts/manual | ⚠️ Own brands only | ❌ None | ❌ N/A | Free (product sales) |
| **L'Oréal Professionnel** | B2B Brand | ❌ None | ❌ Static charts/manual | ⚠️ Own brands only | ❌ None | ❌ N/A | Free (product sales) |
| **Vish** | Salon SaaS | ❌ None | ❌ Scale-based tracking | ❌ N/A | ✅ Yes (booking) | ❌ Cloud | $200-500/mo |
| **SalonScale** | Salon SaaS | ❌ None | ❌ Cost calc only | ❌ N/A | ⚠️ Partial | ❌ Cloud | ~$50-150/mo |
| **Redken Shade Charts** | Traditional | ❌ None | ❌ Manual lookup | ❌ Redken only | ❌ None | ❌ N/A | Free |
| **ColorGenius (us)** | **Pro SaaS** | **✅ On-device** | **✅ AI-generated** | **✅ 10+ brands** | **✅ Planned** | **✅ Core** | **$29-499/mo** |

### 2.2 Technical Gaps Discovered

**Gap 1: No On-Device AI Photo Analysis**
- Madison Reed and eSalon use web questionnaires (hair color history, gray %, skin tone). Zero computer vision.
- Schwarzkopf and L'Oréal have no digital formulation tools at all — stylists still use physical shade charts.
- **Opportunity:** Real-time hair segmentation, level detection, and porosity estimation from a phone camera is entirely unaddressed in the pro market.

**Gap 2: No Cross-Brand AI Formulation**
- Every major brand (Redken, Wella, Schwarzkopf) only supports their own product lines.
- Stylists memorize equivalencies manually or use conversion apps with static lookup tables.
- **Opportunity:** A unified formulation engine that can generate equivalent formulas across brands is unique.

**Gap 3: No Learning Feedback Loop**
- Vish and SalonScale track formula weights and costs but do not learn from outcomes.
- No competitor correlates "formula X on hair type Y in water type Z → result" over time.
- **Opportunity:** A community learning system where every stylist's feedback improves everyone's formulations.

**Gap 4: No Salon POS Integration with AI**
- Vish integrates with booking software (Mindbody, Square) for appointment management.
- No tool integrates color formulation → cost calculation → inventory depletion → client record → rebooking.
- **Opportunity:** End-to-end workflow: photo → formula → cost → inventory update → client history → next appointment suggestion.

### 2.3 Competitor Deep-Dive

#### Madison Reed (San Francisco, ~$100M+ revenue)
- **Model:** Subscription D2C at-home color + "Color Bars" (physical salons for application).
- **Tech:** Online quiz → algorithm selects from ~50 pre-mixed shades → shipped to customer.
- **Limitations:** No AI/ML in formulation; all shades are pre-mixed. Not for professional stylists.
- **Learnings:** Their "Color Bar" concept proves consumers want professional application of "smart" color. Stylists are the distribution channel.

#### eSalon (El Segundo, ~$30M revenue)
- **Model:** Custom-mixed color based on questionnaire → mixed in factory → shipped.
- **Tech:** Two patents on custom color mixing system. ~120,000 unique formulas from 2015.
- **Limitations:** Factory-based mixing (not real-time). No photo analysis. Consumer-only.
- **Learnings:** The demand for personalized color is real (2.2M units sold). But the factory model has 3-5 day lag. Real-time salon formulation is the next evolution.

#### Vish (Vancouver, salon SaaS)
- **Model:** Bluetooth-connected scale + app tracks color usage, calculates costs, manages inventory.
- **Tech:** IoT scale integration with salon booking software.
- **Limitations:** No formulation guidance — stylists still decide what to mix. No AI. No photo analysis.
- **Learnings:** Salons will pay $200-500/mo for color management tools. The market exists.

#### SalonScale (US, ~8,000 salons)
- **Model:** App-based cost tracking and inventory for backbar products.
- **Tech:** Manual input or barcode scanning for product usage.
- **Limitations:** No formulation, no AI, no photo analysis.
- **Learnings:** Salons report +$50-65k/year in recovered profit from accurate cost tracking.

#### Schwarzkopf Professional / L'Oréal Professionnel
- **Model:** Product manufacturer with education programs.
- **Tech:** E-academy for training, static shade charts, no digital tools.
- **Limitations:** Brand-locked. No AI. No data collection.
- **Learnings:** Stylists trust these brands but need better tools. Brand partnerships are a distribution opportunity.

---

## 3. Core AI Model Architecture

### 3.1 Design Philosophy: On-Device First

**Why On-Device?**
1. **Privacy:** Stylists photograph clients. HIPAA-like concerns mean photos should not leave the device if possible.
2. **Latency:** Salon workflows demand sub-second response. Cloud round-trip adds 200-500ms.
3. **Reliability:** Salons often have poor WiFi. Offline capability is essential.
4. **Cost:** GPU inference at scale is expensive. On-device shifts compute to the user's hardware.

### 3.2 Recommended Model Stack

#### Primary: Google Gemma 4 (4B) — Multimodal On-Device
```
Role: Multimodal understanding + formulation reasoning
Size: 4B parameters (fits on modern smartphones)
Input: Photo + text prompts (hair history, goals)
Output: Structured formulation JSON
Rationale: Gemma 4 supports vision + text natively. Can be fine-tuned
         on hair-specific datasets. Open weights allow local deployment.
Alternative: Meta Llama 3.2 Vision (11B) if edge hardware improves.
```

#### Secondary: Specialized Vision Models (ONNX Runtime)
```
Model: YOLOv8-seg (hair segmentation)
Size: ~6MB quantized (INT8)
Task: Isolate hair from background, face, clothing
Latency Target: < 100ms on iPhone 14+

Model: MobileNetV3 (color level classification)
Size: ~5MB
Task: Classify hair into Level 1-10 + tone family
Latency Target: < 50ms

Model: EfficientNet-B0 (texture/porosity)
Size: ~20MB
Task: Fine/medium/coarse texture + porosity estimate
Latency Target: < 80ms

Model: UNet++ (damage assessment)
Size: ~15MB
Task: Split ends, breakage, heat damage detection
Latency Target: < 150ms
```

#### Tertiary: Server-Side LLM (Optional, for complex cases)
```
Model: GPT-4o / Claude 3.5 Sonnet (API fallback)
Task: Corrective color analysis, multi-step formulations
When: When on-device model confidence < 0.7
```

### 3.3 Model Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ON-DEVICE INFERENCE PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT: Client photo (taken in-app, 1024x1024)                           │
│                                                                             │
│  Step 1: Pre-processing (20ms)                                            │
│    ├── Orientation correction (EXIF)                                       │
│    ├── White balance / exposure normalization                              │
│    └── Resize to model input sizes                                         │
│                                                                             │
│  Step 2: Hair Segmentation (100ms) — YOLOv8-seg                            │
│    └── Output: Hair mask, root/mid/end zone masks                         │
│                                                                             │
│  Step 3: Color Analysis (50ms) — MobileNetV3                             │
│    ├── Level detection (1-10)                                              │
│    ├── Tone family (N, A, G, V, R, etc.)                                  │
│    └── RGB/Lab color extraction                                            │
│                                                                             │
│  Step 4: Texture & Porosity (80ms) — EfficientNet-B0                     │
│    ├── Texture: fine/medium/coarse                                         │
│    └── Porosity: low/normal/high                                           │
│                                                                             │
│  Step 5: Damage Assessment (150ms) — UNet++                                │
│    └── Damage score + indicators                                           │
│                                                                             │
│  Step 6: Multimodal Formulation (Gemma 4, 4B)                             │
│    ├── Input: Photo embeddings + structured analysis data               │
│    ├── Context: Client history, water quality, brand preference             │
│    └── Output: Complete formulation JSON                                   │
│                                                                             │
│  TOTAL LATENCY TARGET: < 800ms on-device                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Model Training Data Strategy

```
Phase 1 (Bootstrap): Public datasets + synthetic
├── FFHQ (Flickr-Faces-HQ): 70K faces with hair
├── CelebA-HQ: 30K celebrity images with hair masks
├── Synthetic hair color transformations (GAN-based)
└── Labeled by professional colorists (contract via Upwork/Fiverr)

Phase 2 (Growth): Proprietary salon data
├── Stylist-uploaded before/after photos
├── Feedback scores correlated with outcomes
├── Regional water quality + result correlations
└── Minimum viable: 10K labeled pairs before v2 launch

Phase 3 (Scale): Community-sourced
├── Opt-in photo sharing from stylists
├── Federated learning (model updates without raw data)
└── Target: 100K+ labeled pairs by Year 2
```

---

## 4. Data Schema

### 4.1 Core Entities

#### Client Hair History
```sql
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL,
    stylist_id UUID NOT NULL,
    
    -- Identity
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    date_of_birth DATE,
    
    -- Natural hair characteristics (baseline)
    natural_level INT CHECK (natural_level BETWEEN 1 AND 10),
    natural_tone VARCHAR(10),
    texture VARCHAR(20) CHECK (texture IN ('fine', 'medium', 'coarse')),
    porosity VARCHAR(20) CHECK (porosity IN ('low', 'normal', 'high')),
    density VARCHAR(20) CHECK (density IN ('thin', 'medium', 'thick')),
    
    -- Medical / sensitivity
    allergies JSONB DEFAULT '{}',
    medications TEXT[],
    scalp_conditions TEXT[],
    
    -- Preferences
    preferred_brands TEXT[],
    disliked_tones TEXT[],
    maintenance_level VARCHAR(20) CHECK (maintenance_level IN ('low', 'medium', 'high')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE color_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_profiles(id),
    
    -- Service details
    service_date DATE NOT NULL,
    stylist_id UUID NOT NULL,
    service_type VARCHAR(50), -- 'full_color', 'root_touchup', 'highlight', 'balayage', etc.
    
    -- Before state (from photo analysis)
    before_photo_url TEXT,
    before_level INT,
    before_tone VARCHAR(10),
    before_condition JSONB, -- texture, porosity, damage score
    
    -- Generated formula
    formulation_id UUID,
    formula JSONB NOT NULL, -- structured formula object
    
    -- After state
    after_photo_url TEXT,
    after_level INT,
    after_tone VARCHAR(10),
    after_condition JSONB,
    
    -- Outcome tracking
    client_satisfaction INT CHECK (client_satisfaction BETWEEN 1 AND 5),
    stylist_satisfaction INT CHECK (stylist_satisfaction BETWEEN 1 AND 5),
    color_longevity_weeks INT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Color Formulas
```sql
CREATE TABLE formulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES client_profiles(id),
    stylist_id UUID NOT NULL,
    
    -- Target
    target_level INT,
    target_tone VARCHAR(10),
    target_description TEXT,
    
    -- Current state at time of formulation
    current_level INT,
    current_tone VARCHAR(10),
    is_virgin BOOLEAN DEFAULT false,
    gray_percentage INT CHECK (gray_percentage BETWEEN 0 AND 100),
    
    -- Generated formula
    formula_components JSONB NOT NULL, -- array of {brand, line, shade_code, amount_grams}
    developer_volume INT, -- 10, 20, 30, 40
    developer_amount_ml INT,
    mixing_ratio VARCHAR(10), -- '1:1', '1:1.5', '1:2'
    
    -- Processing
    processing_time_minutes INT,
    application_technique VARCHAR(50), -- 'global', 'roots_only', 'balayage', etc.
    
    -- Cost & pricing
    estimated_product_cost DECIMAL(10,2),
    suggested_service_price DECIMAL(10,2),
    
    -- AI metadata
    model_version VARCHAR(20),
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Before/After Photos
```sql
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    
    -- Photo metadata
    photo_type VARCHAR(20) CHECK (photo_type IN ('before', 'after', 'target_inspiration', 'texture_closeup')),
    storage_path TEXT NOT NULL, -- S3/MinIO path
    original_dimensions INT[], -- [width, height]
    file_size_bytes INT,
    
    -- AI analysis results (cached)
    analysis_results JSONB, -- full analysis output
    
    -- Privacy
    is_consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP,
    is_shareable BOOLEAN DEFAULT false, -- for learning system
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products / Color Lines
```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    manufacturer VARCHAR(100),
    website_url TEXT,
    professional_only BOOLEAN DEFAULT true,
    tier VARCHAR(20) CHECK (tier IN ('premium', 'mid', 'mass'))
);

CREATE TABLE product_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    
    color_type VARCHAR(50), -- 'permanent', 'demi-permanent', 'semi-permanent', 'bleach', 'toner'
    ammonia_free BOOLEAN DEFAULT false,
    max_gray_coverage INT,
    max_lift_levels INT,
    mixing_ratio VARCHAR(10) NOT NULL,
    developer_options INT[], -- e.g., {10, 20, 30, 40}
    base_processing_time INT, -- minutes
    
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE shades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_line_id UUID REFERENCES product_lines(id),
    
    shade_code VARCHAR(20) NOT NULL, -- e.g., "6N", "6-0"
    shade_name VARCHAR(100),
    level INT CHECK (level BETWEEN 1 AND 12),
    primary_tone VARCHAR(10),
    secondary_tone VARCHAR(10),
    
    -- Colorimetry
    rgb VARCHAR(20), -- "#8B4513"
    lab JSONB, -- {l: 45.2, a: 8.5, b: 15.3}
    
    -- Properties
    gray_coverage BOOLEAN DEFAULT false,
    lift_capability INT, -- levels of lift
    
    UNIQUE(product_line_id, shade_code)
);
```

### 4.2 JSON Schema: Formulation Output

```json
{
  "formulation_id": "uuid",
  "generated_at": "2026-04-24T12:00:00Z",
  "model_version": "gemma-4-hair-v1.2",
  "confidence": 0.94,
  
  "client_context": {
    "client_id": "uuid",
    "natural_level": 5,
    "current_level": 6,
    "texture": "medium",
    "porosity": "normal",
    "gray_percentage": 30
  },
  
  "target": {
    "level": 7,
    "tone": "N",
    "description": "Natural medium blonde"
  },
  
  "primary_formula": {
    "brand": "Redken",
    "line": "Shades EQ",
    "components": [
      {
        "shade_code": "07N",
        "shade_name": "Moroccan Sand",
        "amount_grams": 30,
        "purpose": "base_color"
      },
      {
        "shade_code": "07NA",
        "shade_name": "Natural Ash",
        "amount_grams": 15,
        "purpose": "gray_coverage_boost"
      }
    ],
    "developer": {
      "volume": 20,
      "amount_ml": 45,
      "ratio": "1:1"
    },
    "total_formula_weight_grams": 90
  },
  
  "toning_formula": {
    "needed": false
  },
  
  "processing": {
    "time_minutes": 20,
    "technique": "global_application",
    "heat_required": false,
    "check_points": [
      {"time": 10, "action": "check_gray_coverage"},
      {"time": 20, "action": "evaluate_color_development"}
    ]
  },
  
  "costs": {
    "product_cost": 4.50,
    "suggested_service_price": 85.00
  },
  
  "warnings": [
    "Gray coverage may need 5 extra minutes for resistant hair",
    "Porosity is normal — monitor for even absorption"
  ],
  
  "alternatives": [
    {
      "brand": "Wella",
      "line": "Koleston Perfect",
      "shade_code": "7/0",
      "reason": "If client prefers ammonia-free"
    }
  ]
}
```

---

## 5. API Endpoints for Salon Integration

### 5.1 Authentication
```http
POST /auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id={salon_id}&
client_secret={secret}&
scope=photo_analysis formulation client_read client_write
```

### 5.2 Core Endpoints

#### Photo Analysis
```http
POST /v1/photos/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
  photo: <binary>
  photo_type: "current" | "target"
  client_id: "uuid"
  
Response: 202 Accepted
{
  "analysis_id": "ana_123",
  "status": "processing",
  "estimated_time_ms": 800
}
```

```http
GET /v1/photos/analysis/{analysis_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "analysis_id": "ana_123",
  "status": "completed",
  "hair_analysis": {
    "segmentation": { "coverage": 78.5, "confidence": 0.96 },
    "color": { "level": 7, "tone": "N", "rgb": [130, 98, 72] },
    "texture": { "type": "medium", "porosity": "normal" },
    "damage": { "score": 0.25, "indicators": { "heat_damage": true } }
  }
}
```

#### Formulation Generation
```http
POST /v1/formulations
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "client_id": "uuid",
  "target": {
    "source": "photo",
    "photo_id": "photo_uuid",
    "level": 7,
    "tone": "N"
  },
  "current_state": {
    "analysis_id": "ana_123",
    "is_virgin": false,
    "previous_color_type": "permanent",
    "months_since_color": 8
  },
  "preferences": {
    "preferred_brands": ["Redken", "Wella"],
    "max_developer_volume": 30,
    "budget_sensitivity": "medium"
  }
}

Response: 200 OK
{
  "formulation_id": "form_456",
  "confidence": 0.94,
  "primary_formula": { ... },
  "processing": { ... },
  "warnings": [ ... ],
  "alternatives": [ ... ]
}
```

#### Client Management
```http
POST /v1/clients
GET /v1/clients/{client_id}
PATCH /v1/clients/{client_id}
GET /v1/clients/{client_id}/history
GET /v1/clients/{client_id}/formulations
```

#### Feedback & Learning
```http
POST /v1/formulations/{formulation_id}/feedback
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "ratings": {
    "color_accuracy": 4,
    "formula_precision": 5,
    "client_satisfaction": 4,
    "overall": 4
  },
  "outcome": {
    "actual_level": 7,
    "actual_tone": "N",
    "delta_e": 2.3,
    "longevity_weeks": 6
  },
  "adjustments_made": [
    {"component": "developer", "change": "+5ml", "reason": "gray_resistance"}
  ],
  "photos": {
    "after_photo_id": "photo_uuid"
  }
}
```

### 5.3 Salon POS Integration Endpoints

```http
# Inventory sync
POST /v1/salons/{salon_id}/inventory/sync
GET /v1/salons/{salon_id}/inventory/levels

# Cost tracking
POST /v1/services
{
  "client_id": "uuid",
  "formulation_id": "uuid",
  "service_type": "full_color",
  "product_cost": 4.50,
  "service_price": 85.00,
  "stylist_id": "uuid",
  "date": "2026-04-24"
}

# Appointment integration (webhook)
POST /v1/webhooks/appointments
{
  "event": "appointment.completed",
  "appointment_id": "ext_uuid",
  "client_id": "uuid",
  "service_ids": ["color_service"],
  "stylist_id": "uuid"
}
```

### 5.4 Webhook Events

| Event | Description |
|---|---|
| `photo.analysis.completed` | Photo analysis finished |
| `formulation.generated` | New formula created |
| `feedback.received` | Stylist submitted feedback |
| `inventory.low_stock` | Product running low |
| `client.due_for_touchup` | Client approaching touchup window |

---

## 6. Feature Prioritization: MVP → v2 → v3

### 6.1 MVP: Color Match (Months 1-4)
**Goal:** Prove the core loop — photo → analysis → formula → display.

**Features:**
- [ ] iOS app with photo capture
- [ ] On-device hair segmentation (YOLOv8-seg)
- [ ] On-device level detection (MobileNetV3)
- [ ] Cloud-based formulation engine (rules-based v1)
- [ ] Support 3 brands: Redken, Wella, Schwarzkopf
- [ ] Basic formula display (shade codes, ratios, developer)
- [ ] Client profile creation
- [ ] Photo gallery per client
- [ ] JWT auth + basic subscription tiers

**Tech Stack:**
- Mobile: Swift (iOS) + CoreML for on-device models
- Backend: Python 3.11 + FastAPI
- Database: PostgreSQL + pgvector
- Storage: MinIO (S3-compatible)
- Models: YOLOv8-seg, MobileNetV3 (ONNX Runtime)
- Formulation: Python rules engine (not AI yet)

**Team:** 4-6 people, 4 months, ~$350K budget

**Success Metrics:**
- 50 beta stylists generating ≥3 formulations/week
- Photo analysis accuracy ≥85% on level detection
- Formulation acceptance rate ≥70%

### 6.2 v2: AI Formulation + Learning (Months 5-8)
**Goal:** Replace rules engine with AI, add learning feedback loop.

**Features:**
- [ ] Gemma 4 (4B) fine-tuned for formulation
- [ ] Multimodal input: photo + text context
- [ ] Support 8+ brands
- [ ] Learning system: feedback collection + model retraining
- [ ] Formula outcome tracking (before/after photos)
- [ ] Confidence scoring + alternative suggestions
- [ ] Android app
- [ ] Web dashboard for salon managers
- [ ] Regional adaptation (water quality, climate)

**Tech Stack Additions:**
- ML: PyTorch + Hugging Face Transformers (Gemma fine-tuning)
- Feature Store: Feast
- Experiment Tracking: MLflow
- Vector DB: pgvector (existing) or Pinecone

**Team:** 8-12 people, 4 months, ~$600K budget

**Success Metrics:**
- 500 active stylists
- Feedback submission rate ≥30%
- Model accuracy improvement ≥10% from v1 baseline
- Retention rate ≥60% after 3 months

### 6.3 v3: Inventory Tie-In + Enterprise (Months 9-14)
**Goal:** Full salon workflow integration, POS connectivity, inventory intelligence.

**Features:**
- [ ] Salon POS integrations (Square, Clover, Mindbody, Fresha)
- [ ] Real-time inventory tracking
- [ ] Automatic reorder suggestions
- [ ] Cost analytics + profit optimization
- [ ] White-label option for color brands
- [ ] API access for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] International expansion (EU color lines)

**Tech Stack Additions:**
- Integrations: REST/SOAP adapters for POS systems
- Analytics: Apache Superset or Metabase
- Multi-tenant architecture for white-label

**Team:** 15-20 people, 6 months, ~$1.2M budget

**Success Metrics:**
- 2,000+ active stylists
- 500+ salon subscriptions
- Enterprise pilot with 1 major color brand
- MRR ≥$50K

---

## 7. Infrastructure & DevOps

### 7.1 MVP Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐                                        │
│  │  iOS App     │  │ Android App  │  (Flutter/React Native in v2)          │
│  │  SwiftUI     │  │  Kotlin      │                                        │
│  │  CoreML      │  │  TFLite      │                                        │
│  └──────────────┘  └──────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                      │
│  Kong / AWS API Gateway — Auth, rate limiting, SSL                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES (FastAPI)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│  │ Photo Svc   │  │ Formula Svc │  │ Client Svc  │                       │
│  │ (upload,    │  │ (generate,  │  │ (CRUD,      │                       │
│  │  preproc)   │  │  retrieve)  │  │  history)   │                       │
│  └─────────────┘  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                      │
│  PostgreSQL (schemas: core, formulation, products, analysis, learning)   │
│  Redis (caching, session store)                                             │
│  MinIO (photo storage)                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Deployment

| Environment | Platform | Notes |
|---|---|---|
| Development | Docker Compose local | Hot reload, seeded data |
| Staging | AWS ECS / DigitalOcean | Parity with prod, anonymized data |
| Production | AWS EKS or GCP GKE | Auto-scaling, multi-AZ |

### 7.3 CI/CD
- GitHub Actions: lint → test → build → deploy
- Unit tests: pytest (≥80% coverage)
- Integration tests: Postman/Newman or pytest-asyncio
- Mobile: TestFlight (iOS), Firebase App Distribution (Android)

---

## 8. Security & Privacy

### 8.1 Data Classification

| Data Type | Sensitivity | Storage | Retention |
|---|---|---|---|
| Client photos | High | Encrypted at rest (AES-256), TLS in transit | 7 years or per salon policy |
| Client PII | High | PostgreSQL encrypted columns | 7 years |
| Formulas | Medium | PostgreSQL | Indefinite |
| Product data | Low | PostgreSQL | Indefinite |
| Analytics | Low | Aggregated, anonymized | Indefinite |

### 8.2 Compliance
- **GDPR:** Client data deletion within 30 days of request
- **CCPA:** Data portability, opt-out of data sharing
- **HIPAA-adjacent:** While not healthcare, treat client photos as PHI-level sensitive
- **SOC 2 Type II:** Target certification by Month 12

### 8.3 Photo Privacy
- Photos never used for training without explicit opt-in
- On-device analysis means raw photos need not leave device for basic features
- Cloud storage only for users who enable "cloud sync"
- Face detection used solely for hair zone segmentation; no facial recognition storage

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Model accuracy insufficient for pro use | Medium | High | Bootstrap with rules-based fallback; continuous feedback loop |
| Color brands refuse partnership | Medium | High | Start with public shade data; partnerships are growth accelerator, not blocker |
| Stylists distrust AI | Medium | High | Position as "assistant," not replacement; always allow manual override |
| Regulatory issues (chemical safety) | Low | High | Clear disclaimers; formulations based on manufacturer guidelines |
| Competitive response from L'Oréal | Medium | Medium | Speed to market; network effects from learning system |
| On-device model too large/slow | Medium | Medium | Quantization (INT8); progressive loading; cloud fallback |

---

## 10. Immediate Next Steps (Week 1-2)

1. **Set up dev environment:** Docker Compose with PostgreSQL + Redis + MinIO
2. **Bootstrap iOS app:** SwiftUI scaffold with camera integration + CoreML
3. **Train YOLOv8-seg on hair:** Use CelebA-HQ + FFHQ datasets; target 90% mAP
4. **Build rules-based formulation v1:** Hardcode Redken + Wella shade mappings
5. **Design client schema:** Implement PostgreSQL tables for client_profiles, formulations, photos
6. **Create FastAPI scaffold:** Auth, photo upload, formulation endpoints
7. **Define API contract:** OpenAPI spec for MVP endpoints

---

## 11. Appendix: Research Source Documents

All research documents are located at `/home/jason/.openclaw/workspaces/che/memory/color-genius/`:

| Document | Contents | Size |
|---|---|---|
| `system-architecture.md` | High-level architecture, service definitions, tech stack | 45KB |
| `formulation-algorithm.md` | Algorithm pipeline, input/output schemas, decision trees | 42KB |
| `color-science-engine.md` | Level system, developer calculation, pigment theory | 33KB |
| `photo-analysis-pipeline.md` | CV models, segmentation, color extraction, damage assessment | 39KB |
| `database-schema.md` | PostgreSQL DDL, indexes, JSONB schemas | 33KB |
| `api-spec.md` | Full REST API with auth, rate limits, error codes | 29KB |
| `color-line-database.md` | Brand schemas, shade catalogs, mixing rules | 33KB |
| `learning-system.md` | ML pipeline, feedback collection, model training | 40KB |
| `build-roadmap.md` | Phased plan, team composition, budgets | 16KB |
| `go-to-market.md` | Pricing, segments, competitive positioning | 16KB |

---

**End of Spec**

*For questions or updates, contact the PC2 (Iris/colorgenius) team lead or update this document in the memory directory.*
