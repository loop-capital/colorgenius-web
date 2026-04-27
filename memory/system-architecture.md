# Color Genius - System Architecture

## Executive Summary

Color Genius is an AI-powered Hair Color Formulation Engine designed for professional stylists. The system digitizes 100+ years of color science into an intelligent platform that generates precise color formulas based on visual input, hair assessment, and environmental factors.

**System Design Philosophy:** Modular, extensible architecture that separates concerns between visual analysis, scientific calculation, and formulation generation. Built for enterprise scalability with edge deployment capabilities for salon environments.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  iOS App     │  │ Android App  │  │ Web Portal   │  │ Salon Kiosk  │     │
│  │  (Stylist)   │  │  (Stylist)   │  │  (Manager)   │  │  (Client)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Kong/AWS API Gateway - Rate Limiting, Auth, SSL Termination         │  │
│  │  JWT Validation │ Request Routing │ Circuit Breaker │ Caching        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MICROSERVICES LAYER                                 │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Photo Analysis  │  │ Color Science   │  │ Formulation     │             │
│  │    Service      │  │    Engine       │  │    Engine       │             │
│  │                 │  │                 │  │                 │             │
│  │ • Hair Seg      │  │ • Level System  │  │ • Formula Gen   │             │
│  │ • Color Extract │  │ • Pigment Calc  │  │ • Developer Rec   │             │
│  │ • Texture CV    │  │ • Tone Logic    │  │ • Timing Engine   │             │
│  │ • Porosity AI   │  │ • Gray Coverage │  │ • Cost Calculator │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐             │
│  │ Color Line DB   │  │ Learning System │  │ Client Mgmt     │             │
│  │    Service      │  │    Service      │  │    Service      │             │
│  │                 │  │                 │  │                 │             │
│  │ • Product DB    │  │ • Feedback ML   │  │ • Profiles      │             │
│  │ • Shade Mapping   │  │ • Regional AI   │  │ • History       │             │
│  │ • Mixing Rules    │  │ • Trend Tracking│  │ • Preferences   │             │
│  │ • Compatibility   │  │ • Formula Refine│  │ • Photo Library │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Cluster │ Redis │ MinIO │ Elasticsearch │ Vector DB (pgvector)│
│  │  ├─ Stylists        │ Cache │ Images│ Search Index  │ Embeddings         │
│  │  ├─ Clients         │       │       │               │                    │
│  │  ├─ Formulas        │       │       │               │                    │
│  │  ├─ Products        │       │       │               │                    │
│  │  └─ Outcomes        │       │       │               │                    │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI/ML INFERENCE LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Hair Seg     │  │ Color        │  │ Texture      │  │ Similarity   │     │
│  │ Model        │  │ Classifier   │  │ Classifier   │  │ Search       │     │
│  │ (YOLOv8+)    │  │ (CNN)        │  │ (ResNet)     │  │ (Vector DB)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Damage       │  │ Face Analysis│  │ Lighting     │  │ Formulation  │     │
│  │ Assessment   │  │ (MTCNN)      │  │ Correction   │  │ LLM (Fine-   │     │
│  │ (UNet++)     │  │              │  │ (White Bal)  │  │ tuned)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE & EVENT STREAMING                          │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  Apache Kafka / AWS Kinesis - Event-driven architecture              │    │
│  │  ├─ Formula Generation Events    ├─ Feedback Events                 │    │
│  │  ├─ Photo Upload Events            ├─ Learning Events                │    │
│  │  └─ User Action Events             ├─ Analytics Events               │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Services Deep Dive

### 1. Photo Analysis Service

**Purpose:** Computer vision pipeline for extracting actionable data from hair photos.

**Components:**

```
┌────────────────────────────────────────────────────────────────┐
│                    PHOTO ANALYSIS PIPELINE                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: Photo upload (PNG/JPG/WebP, max 20MB)                 │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ 1. Pre-     │  │ 2. Hair     │  │ 3. Color      │           │
│  │ processing  │  │ Segmentation│  │ Extraction    │           │
│  │             │  │             │  │               │           │
│  │ • Resize    │  │ • YOLOv8    │  │ • RGB to Lab  │           │
│  │ • Normalize │  │ • Isolate   │  │ • Histogram   │           │
│  │ • Orient    │  │ • Mask Gen  │  │ • K-means     │           │
│  │ • EXIF read │  │ • Multi-mask│  │ • Delta E     │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
│         │                │                │                    │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐           │
│  │ 4. Texture  │  │ 5. Damage   │  │ 6. Lighting   │           │
│  │  Analysis   │  │ Assessment  │  │ Correction    │           │
│  │             │  │             │  │               │           │
│  │ • Strand    │  │ • Split ends│  │ • WB detect   │           │
│  │   detection │  │ • Breakage  │  │ • Color const │           │
│  │ • Curl patt │  │ • Elasticity│  │ • Exposure    │           │
│  │ • Thickness │  │ • Porosity  │  │ • Gamma corr  │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  OUTPUT: ColorGeniusAnalysis object                            │
│  {                                                              │
│    hair_segmentation_mask: base64,                              │
│    primary_color: { level: 7, tone: "neutral", rgb: [..] },   │
│    texture_score: { fine: 0.2, med: 0.6, coarse: 0.2 },       │
│    damage_indicators: [split_ends: 0.3, breakage: 0.1],       │
│    porosity_estimate: "normal",                                │
│    lighting_corrected: true,                                  │
│    confidence: 0.94                                            │
│  }                                                              │
└────────────────────────────────────────────────────────────────┘
```

**Tech Stack:**
- Python 3.11+
- PyTorch + torchvision
- OpenCV
- ONNX Runtime (optimized inference)
- FastAPI (service layer)

**Performance Targets:**
- Segmentation: < 200ms
- Color extraction: < 100ms
- Total pipeline: < 500ms for single image

---

### 2. Color Science Engine

**Purpose:** Core computational engine implementing hair color theory and chemistry.

**Key Modules:**

#### 2.1 Level System Calculator
```python
class LevelSystemCalculator:
    """
    Converts between visual color representation and professional level system.
    Level 1 = Black, Level 10 = Lightest Blonde
    """
    
    UNDERLYING_PIGMENTS = {
        1: {"eumelanin": 95, "pheomelanin": 5, "visible": "black"},
        2: {"eumelanin": 90, "pheomelanin": 10, "visible": "darkest brown"},
        3: {"eumelanin": 80, "pheomelanin": 15, "visible": "dark brown"},
        4: {"eumelanin": 70, "pheomelanin": 20, "visible": "medium brown"},
        5: {"eumelanin": 60, "pheomelanin": 25, "visible": "light brown"},
        6: {"eumelanin": 45, "pheomelanin": 30, "visible": "dark blonde"},
        7: {"eumelanin": 30, "pheomelanin": 35, "visible": "medium blonde"},
        8: {"eumelanin": 15, "pheomelanin": 40, "visible": "light blonde"},
        9: {"eumelanin": 5, "pheomelanin": 45, "visible": "very light blonde"},
        10: {"eumelanin": 0, "pheomelanin": 50, "visible": "lightest blonde"}
    }
    
    def calculate_levels_to_lift(self, current_level: int, target_level: int) -> int:
        """Calculate number of levels to lift."""
        return max(0, target_level - current_level)
    
    def get_underlying_exposed(self, lift_levels: int, current_level: int) -> dict:
        """Determine underlying pigment exposed during lift."""
        # Each level exposes different warm undertones
        exposed_level = current_level + lift_levels
        return self.UNDERLYING_PIGMENTS.get(exposed_level, {})
```

#### 2.2 Developer Volume Calculator
```python
class DeveloperCalculator:
    """
    Calculates appropriate developer volume based on lift required and hair condition.
    """
    
    VOLUME_STRENGTHS = {
        10: {"lift_levels": 0, "deposit_only": True, "processing_time": 20},
        20: {"lift_levels": 1-2, "deposit_only": False, "processing_time": 30},
        30: {"lift_levels": 2-3, "deposit_only": False, "processing_time": 30-40},
        40: {"lift_levels": 3-4, "deposit_only": False, "processing_time": 40-50}
    }
    
    def recommend_developer(
        self,
        levels_to_lift: int,
        hair_condition: dict,  # porosity, elasticity, damage_score
        previous_color: bool,
        gray_percentage: int
    ) -> dict:
        """
        Intelligently select developer volume considering all factors.
        """
        base_recommendation = self._base_recommendation(levels_to_lift)
        
        # Adjustments
        if hair_condition["porosity"] == "high":
            base_recommendation = self._lower_volume(base_recommendation)
        
        if previous_color:
            base_recommendation = self._apply_color_buildup_factor(base_recommendation)
        
        if gray_percentage > 50:
            base_recommendation = self._increase_for_gray_coverage(base_recommendation)
        
        return {
            "recommended_volume": base_recommendation,
            "processing_time": self._calculate_time(base_recommendation, hair_condition),
            "rationale": self._generate_rationale(...)
        }
```

#### 2.3 Color Wheel Logic
```python
class ColorWheel:
    """
    Implements professional color theory for tone selection and correction.
    """
    
    # Professional tone families
    TONES = {
        "N": "Natural",
        "A": "Ash (blue-green)",
        "G": "Gold (yellow)",
        "R": "Red (copper)",
        "V": "Violet (purple)",
        "B": "Beige",
        "C": "Chocolate/Warm Brown",
        "K": "Copper",
        "M": "Mauve",
        "O": "Orange",
        "P": "Pearl",
        "S": "Silver",
        "W": "Warm"
    }
    
    COMPLEMENTARY_CORRECTIONS = {
        "unwanted_orange": ["A", "V"],      # Ash or Violet
        "unwanted_yellow": ["V", "A"],      # Violet or Ash  
        "unwanted_gold": ["A", "P"],        # Ash or Pearl
        "unwanted_red": ["A", "G"],         # Ash or Gold
        "unwanted_brass": ["V", "A"],       # Violet or Ash
        "unwanted_green": ["R", "K"],       # Red or Copper
        "unwanted_purple": ["G", "O"]       # Gold or Orange
    }
    
    def calculate_tone_adjustment(
        self,
        current_undertone: str,
        target_tone: str,
        gray_percentage: int = 0
    ) -> dict:
        """
        Determine tone mix to achieve target while neutralizing unwanted tones.
        """
        ...
```

---

### 3. Formulation Engine

**Purpose:** Generates complete color formulas with application instructions.

**Workflow:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FORMULATION ENGINE WORKFLOW                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INPUTS:                                                                │
│  ├── Target Color (from photo analysis or manual input)               │
│  ├── Current State (from hair assessment)                              │
│  ├── Client Factors (medications, water quality, lifestyle)           │
│  ├── Color Line Preference (Redken, Wella, etc.)                      │
│  └── Business Context (salon pricing, product availability)           │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    FORMULATION PIPELINE                         │   │
│  ├────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  1. LIFT CALCULATION                                            │   │
│  │     ├── Determine current level (assessment + photo)            │   │
│  │     ├── Determine target level (color extraction)               │   │
│  │     └── Calculate levels needed to lift                        │   │
│  │                                                                 │   │
│  │  2. DEVELOPER SELECTION                                         │   │
│  │     ├── Apply lift requirements                                 │   │
│  │     ├── Adjust for hair condition (porosity, damage)            │   │
│  │     ├── Adjust for previous color buildup                       │   │
│  │     └── Finalize volume and processing time                    │   │
│  │                                                                 │   │
│  │  3. SHADE SELECTION                                             │   │
│  │     ├── Query color line database                               │   │
│  │     ├── Match target level + tone                               │   │
│  │     ├── Consider undertone neutralization                     │   │
│  │     └── Apply gray coverage rules if needed                   │   │
│  │                                                                 │   │
│  │  4. FORMULA CONSTRUCTION                                        │   │
│  │     ├── Primary shade                                           │   │
│  │     ├── Secondary shade (if custom mix)                       │   │
│  │     ├── Corrector (if needed)                                   │   │
│  │     ├── Developer volume and amount                           │   │
│  │     └── Mixing instructions                                     │   │
│  │                                                                 │   │
│  │  5. APPLICATION PROTOCOL                                        │   │
│  │     ├── Sectioning strategy                                     │   │
│  │     ├── Application order (roots → mids → ends)               │   │
│  │     ├── Timing per zone                                         │   │
│  │     └── Processing conditions (heat, ambient temp)              │   │
│  │                                                                 │   │
│  │  6. TONING DECISION                                             │   │
│  │     ├── Will lift expose unwanted tones?                        │   │
│  │     ├── If yes: generate toner formula                        │   │
│  │     └── Toner application timing                              │   │
│  │                                                                 │   │
│  │  7. CORRECTIVE PROTOCOLS                                        │   │
│  │     ├── Banding correction (if detected)                        │   │
│  │     ├── Fill formula (if needed before target)                │   │
│  │     └── Pre-treatment requirements (clarifier, etc.)            │   │
│  │                                                                 │   │
│  │  8. AFTERCARE & COST                                            │   │
│  │     ├── Recommended products                                    │   │
│  │     ├── Maintenance schedule                                    │   │
│  │     ├── Product cost calculation                                │   │
│  │     └── Suggested service pricing                             │   │
│  │                                                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  OUTPUT: Complete FormulaDocument                                       │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Color Line Database Service

**Purpose:** Comprehensive database of professional color lines with formulation rules.

**Schema Design:**

```sql
-- Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    country_of_origin VARCHAR(2),
    professional_only BOOLEAN DEFAULT true,
    website_url TEXT,
    support_contact TEXT
);

-- Product Lines (e.g., Shades EQ, Color Gels Lacquers)
CREATE TABLE product_lines (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- permanent, demi-permanent, semi-permanent
    ammonia_free BOOLEAN,
    plex_technology BOOLEAN,
    max_gray_coverage INT, -- percentage
    typical_mixing_ratio VARCHAR(20), -- "1:1", "1:2", etc.
    developer_options INT[], -- [10, 20, 30, 40]
    base_processing_time INT -- minutes
);

-- Shades
CREATE TABLE shades (
    id UUID PRIMARY KEY,
    product_line_id UUID REFERENCES product_lines(id),
    shade_code VARCHAR(20) NOT NULL,
    shade_name VARCHAR(100),
    level INT CHECK (level >= 1 AND level <= 12),
    primary_tone CHAR(2),
    secondary_tone CHAR(2),
    tertiary_tone CHAR(2),
    is_natural BOOLEAN, -- for gray coverage
    is_high_lift BOOLEAN,
    is_special_mix BOOLEAN, -- for custom blending
    rgb_representation INT[3],
    lab_representation FLOAT[3],
    undertone VARCHAR(50),
    intensity_score FLOAT,
    notes TEXT
);

-- Formulation Rules
CREATE TABLE formulation_rules (
    id UUID PRIMARY KEY,
    product_line_id UUID REFERENCES product_lines(id),
    rule_type VARCHAR(50), -- "gray_coverage", "lift_limitation", "compatibility"
    condition JSONB,
    action JSONB,
    priority INT DEFAULT 100,
    active BOOLEAN DEFAULT true
);

-- Example Rules
INSERT INTO formulation_rules (rule_type, condition, action, priority) VALUES
('gray_coverage', 
 '{"gray_percentage": ">50", "natural_shade": false}', 
 '{"require_natural_series": true, "add_developer_volume": 10}', 
 10),
('lift_limitation', 
 '{"previous_color": true, "current_level": "<6"}', 
 '{"max_lift": 2, "warning": "Buildup detected - limited lift achievable"}', 
 20);
```

---

### 5. Learning System Service

**Purpose:** Continuous improvement through stylist feedback and outcome tracking.

**Architecture:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LEARNING SYSTEM ARCHITECTURE                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Feedback        │  │ Outcome         │  │ Model           │     │
│  │ Collection      │  │ Analysis        │  │ Retraining      │     │
│  │                 │  │                 │  │                 │     │
│  │ • Star ratings  │  │ • Before/after  │  │ • Weekly batch  │     │
│  │ • Text feedback │  │   comparison    │  │ • A/B testing   │     │
│  │ • Photo upload  │  │ • Color match   │  │ • Shadow        │     │
│  │ • Adjustments   │  │   accuracy      │  │   deployment    │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                                ▼                                    │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                    ML PIPELINE                                ││
│  │                                                                 ││
│  │  Feature Store (Feast)                                        ││
│  │  ├── Stylist preferences (regional, seasonal)               ││
│  │  ├── Hair condition patterns                                  ││
│  │  ├── Color line performance metrics                           ││
│  │  └── Formula success rates                                    ││
│  │                                                                 ││
│  │  Model Training (MLflow + SageMaker)                          ││
│  │  ├── Formula recommendation model                             ││
│  │  ├── Processing time predictor                                ││
│  │  └── Success outcome classifier                              ││
│  │                                                                 ││
│  │  Real-time Scoring                                            ││
│  │  ├── Confidence adjustment based on history                   ││
│  │  ├── Personalized recommendations                             ││
│  │  └── Trend detection (viral colors)                           ││
│  │                                                                 ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Specifications

### Performance Requirements

| Metric | Target | SLA |
|--------|--------|-----|
| API Response Time (p95) | < 200ms | 99.9% |
| Photo Analysis | < 2s | 99.5% |
| Formula Generation | < 500ms | 99.9% |
| Image Upload | < 5s (20MB) | 99% |
| System Availability | 99.99% | Monthly |
| Concurrent Users | 10,000 | Peak |

### Security Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Layer 1: Network Security                                             │
│  ├── AWS WAF / CloudFlare                                              │
│  ├── DDoS protection                                                   │
│  ├── VPC with private subnets                                          │
│  └── TLS 1.3 required                                                  │
│                                                                         │
│  Layer 2: Application Security                                           │
│  ├── OAuth 2.0 + OIDC                                                  │
│  ├── JWT with RS256                                                    │
│  ├── Rate limiting (100 req/min default)                               │
│  └── Input validation (Pydantic)                                       │
│                                                                         │
│  Layer 3: Data Security                                                  │
│  ├── AES-256 at rest                                                 │
│  ├── Field-level encryption for PII                                  │
│  ├── Automated key rotation                                          │
│  └── GDPR/CCPA compliance                                              │
│                                                                         │
│  Layer 4: Compliance                                                   │
│  ├── SOC 2 Type II (target Q2 2027)                                  │
│  ├── HIPAA alignment (PHI handling)                                  │
│  ├── Audit logging (immutable)                                         │
│  └── Penetration testing (quarterly)                                 │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CLOUD DEPLOYMENT (AWS)                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Route 53 (DNS) + CloudFront (CDN)                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│  ┌───────────────────────────┼───────────────────────────┐              │
│  │                           ▼                           │              │
│  │  ┌───────────────────────────────────────────────┐   │              │
│  │  │           EKS Cluster (Kubernetes)            │   │              │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │              │
│  │  │  │  API    │ │ Photo   │ │ Color   │         │   │              │
│  │  │  │ Gateway │ │ Service │ │ Service │         │   │              │
│  │  │  │ (3 pods)│ │ (5 pods)│ │ (5 pods)│         │   │              │
│  │  │  └─────────┘ └─────────┘ └─────────┘         │   │              │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │              │
│  │  │  │Formulat │ │ Learning│ │ Client  │         │   │              │
│  │  │  │Service  │ │ Service │ │ Service │         │   │              │
│  │  │  │(5 pods) │ │(3 pods) │ │(3 pods) │         │   │              │
│  │  │  └─────────┘ └─────────┘ └─────────┘         │   │              │
│  │  └───────────────────────────────────────────────┘   │              │
│  │           │                   │                     │              │
│  │           ▼                   ▼                     ▼              │
│  │  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐        │
│  │  │   RDS         │   │   ElastiCache │   │   S3 +        │        │
│  │  │   PostgreSQL  │   │   Redis       │   │   CloudFront  │        │
│  │  │   (Multi-AZ)  │   │   (Cluster)   │   │   Images      │        │
│  │  └───────────────┘   └───────────────┘   └───────────────┘        │
│  └───────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Sagemaker (Model Inference) + S3 (Model Artifacts)              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### Third-Party APIs

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| Stripe | Payments, subscriptions | REST API |
| SendGrid | Email notifications | SMTP/API |
| Twilio | SMS alerts | REST API |
| S3 | Image storage | SDK |
| CloudFront | CDN | DNS |
| Segment | Analytics | SDK |

### Salon Software Integrations (Future)

- Square Appointments
- Booker (Mindbody)
- Schedulicity
- Acuity Scheduling
- Vagaro
- Fresha

---

## Monitoring & Observability

```
┌────────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY STACK                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Metrics: Prometheus + Grafana                                        │
│  ├── Service-level indicators (latency, error rate)                  │
│  ├── Business metrics (formulas generated, success rate)             │
│  └── Infrastructure metrics (CPU, memory, disk)                        │
│                                                                         │
│  Logging: ELK Stack (Elasticsearch, Logstash, Kibana)                 │
│  ├── Structured JSON logs                                            │
│  ├── Centralized aggregation                                         │
│  └── Alert-based routing                                             │
│                                                                         │
│  Tracing: Jaeger + OpenTelemetry                                    │
│  ├── Distributed request tracing                                     │
│  ├── Performance bottleneck identification                           │
│  └── Dependency mapping                                              │
│                                                                         │
│  Alerting: PagerDuty + Slack                                        │
│  ├── Critical: PagerDuty + Phone                                    │
│  ├── Warning: Slack #alerts                                         │
│  └── Info: Slack #monitoring                                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Development Standards

### Code Organization
```
color-genius/
├── services/
│   ├── photo-analysis/
│   ├── color-science/
│   ├── formulation/
│   ├── color-line-db/
│   ├── learning-system/
│   └── client-management/
├── shared/
│   ├── models/
│   ├── utils/
│   └── constants/
├── ml-models/
│   ├── hair-segmentation/
│   ├── color-classifier/
│   └── texture-analyzer/
├── infrastructure/
│   ├── terraform/
│   ├── kubernetes/
│   └── ci-cd/
└── docs/
    ├── api/
    ├── architecture/
    └── runbooks/
```

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React Native (mobile), Next.js (web) |
| Backend | Python 3.11, FastAPI, PostgreSQL 15 |
| ML/AI | PyTorch, ONNX, scikit-learn |
| Infrastructure | AWS EKS, Terraform, ArgoCD |
| Caching | Redis |
| Message Queue | Apache Kafka |
| Storage | S3, EFS |
| Monitoring | Prometheus, Grafana, Jaeger |

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** che-architect (ClawStudio)
