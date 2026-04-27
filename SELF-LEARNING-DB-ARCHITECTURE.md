# ColorGenius — Self-Learning Database Architecture

## Overview
Anonymous, privacy-preserving system that learns from real color service outcomes to improve recommendations over time.

---

## Core Philosophy

1. **Never store PII with outcomes**
2. **Client owns their data** — portable, deletable
3. **Aggregate learning** — patterns, not individuals
4. **Transparency** — clients know what we learn and how we use it

---

## Data Model

### Layer 1: Anonymous Service Event (Per Session)

```json
{
  "event_id": "uuid-anonymous",
  "timestamp": "2026-04-18T14:30:00Z",
  "salon_id_hash": "hashed-salon-identifier",
  
  "client_profile": {
    "age_range": "30-40",           // 10-year buckets, not exact
    "hair_texture": "fine/medium/coarse",
    "hair_density": "thin/medium/thick",
    "previous_services": ["color", "keratin"],  // anonymized history
    "percent_gray": 30,              // approximate, self-reported
    "health_flags": ["thyroid"],     // categorical, no details
    "medications_category": ["antidepressant"],  // class only, not specific drug
    "scalp_condition": "normal/sensitive/inflamed"
  },
  
  "service_details": {
    "service_type": "root_touchup",
    "color_family": "brown/blonde/red",
    "target_level": 6,
    "brand_used": "redken",
    "formula": {
      "shade": "6N",
      "developer": 10,
      "processing_time": 35
    },
    "pre_treatments": ["metal_detox"],
    "technique": "single_process"
  },
  
  "outcome": {
    "color_achievement": "target_met/close/off_target",
    "coverage_quality": 4,           // 1-5 scale
    "texture_change": "none/slight/moderate/severe",
    "scalp_reaction": "none/mild/moderate/severe",
    "durability_weeks": 6,           // how long color lasted
    "client_satisfaction": 4,        // 1-5, if volunteered
    "required_correction": false
  },
  
  "deviation_from_expected": {
    "processing_faster": true,       // bool flags
    "processing_slower": false,
    "unexpected_warmth": false,
    "scalp_sensitivity": false,
    "breakage": false
  }
}
```

**Key Privacy Features:**
- No names, no exact dates of birth
- No specific medication names (category only)
- No precise geographic location (region only)
- Salon ID hashed (can't reverse to actual salon without key)
- Event ID random (not sequential, not traceable to client)

---

### Layer 2: Pattern Aggregates (Learning Layer)

**Auto-Generated Insights:**

```json
{
  "pattern_id": "thyroid-10vol-success",
  "pattern_type": "formula_outcome",
  "created_at": "2026-04-18",
  
  "conditions": {
    "health_flag": "thyroid",
    "developer_range": "5-10vol",
    "service_type": "root_touchup"
  },
  
  "statistics": {
    "total_cases": 247,
    "success_rate": 0.89,
    "unexpected_warmth_rate": 0.12,
    "scalp_reaction_rate": 0.03,
    "avg_processing_time": 38  // minutes
  },
  
  "confidence": "high",          // low/medium/high based on sample size
  "recommendation": "Use 5-10vol for thyroid clients; expect 38min avg processing",
  "last_updated": "2026-04-18"
}
```

**Pattern Types:**
1. **Formula Outcome** — Shade + developer + condition → result
2. **Health Interaction** — Condition + medication class → protocol adjustment
3. **Technique Success** — Method + hair type → coverage quality
4. **Failure Analysis** — What went wrong, common factors

---

## Learning Mechanisms

### 1. Supervised Learning (Expert-Labeled)

**Process:**
- Expert colorist reviews anonymized events
- Labels outcomes: "success", "partial", "failure"
- Adds notes: "should have used lower developer"

**Use:**
- Train recommendation models
- Validate automated patterns
- Create teaching examples

### 2. Unsupervised Pattern Detection

**Auto-Detection:**
- System finds correlations: "Antidepressant + 20vol = 34% unexpected warmth"
- Flags anomalies: "Keratin 3 weeks ago + bleach = high breakage"
- Suggests new patterns for expert review

**Review Queue:**
- Colorists confirm/reject auto-patterns
- Prevents false correlations
- Builds confidence scores

### 3. Reinforcement Learning (A/B Testing)

**Experiment Framework:**
- Split similar profiles into treatment groups
- Group A: Standard recommendation
- Group B: AI-suggested adjustment
- Measure outcomes, iterate

**Example:**
- "Does Metal Detox improve results for antidepressant users?"
- 50% get it, 50% don't
- Compare outcomes after 100 services

---

## Technical Architecture

### Data Flow

```
Client Service → Anonymization Layer → Raw Events DB
                                    ↓
                              Pattern Detection Engine
                                    ↓
                          Aggregate Insights DB
                                    ↓
                              AI Recommendation API
                                    ↓
                          Colorist Dashboard
```

### Storage

**Raw Events (Time-Series):**
- Encrypted at rest
- Retention: 2 years, then aggregate only
- Access: ML pipeline only

**Pattern Aggregates:**
- Public-facing insights
- No individual data
- Continuously updated

**Expert Labels:**
- Colorist-contributed
- Quality control layer
- Versioned

### APIs

**Ingestion API:**
```
POST /v1/service-event
Authorization: Salon API Key
Body: AnonymousEvent
Response: 202 Accepted
```

**Query API:**
```
GET /v1/recommendation
Params: hair_texture, health_flags, target_level
Response: {
  "suggested_developer": 10,
  "confidence": 0.89,
  "similar_cases": 247,
  "caveats": ["thyroid = unpredictable processing"]
}
```

**Pattern Review API:**
```
GET /v1/patterns/pending-review
Authorization: Expert Colorist
Action: Approve / Reject / Modify
```

---

## Privacy & Ethics

### Client Consent Flow

**At First Service:**
> "ColorGenius anonymously learns from each service to improve recommendations for future clients. We never store your name with outcomes. You own your data and can delete it anytime. Learn more [link]"

**Options:**
- ✅ Yes, contribute to color science (default)
- ❌ No, don't use my service data
- 🔍 Show me exactly what you store

**Portable Data:**
- Client can download: "My Color History" (encrypted, no salon IDs)
- Transfer to new salon: "Verified Color Profile"

### Data Deletion

**Client Request:**
- Find all events by anonymous_id
- Remove from raw events
- Update aggregates (remove counts)
- Cannot delete if part of approved pattern (anonymized anyway)

**Time-Based:**
- Auto-delete raw events after 2 years
- Keep aggregates only (no individual traceability)

### What We NEVER Do

- Sell individual data
- Share with insurance without explicit opt-in
- Attempt to re-identify from patterns
- Store health details with outcomes
- Build marketing profiles

---

## Self-Improvement Metrics

**System Tracks:**

| Metric | Target | Current |
|--------|--------|---------|
| Recommendation accuracy | >85% | Baseline |
| Expert confirmation rate | >90% | N/A |
| False positive patterns | <5% | N/A |
| Data coverage | 10k services | 0 |
| Client opt-in rate | >70% | N/A |

**Accuracy Defined:**
- Color matches target: Yes/No
- No adverse reaction: Yes/No
- Client satisfaction 4+: Yes/No

---

## Anonymous Feedback Loop Design

### How Stylists Submit Outcomes

**Submission Flow:**

```
Service Completion → Stylist Opens ColorGenius App → Outcome Entry
                                                    ↓
                                    ┌───────────────┼───────────────┐
                                    ↓               ↓               ↓
                            Quick Submit      Detailed Review    Photo Upload
                            (30 seconds)      (2-3 minutes)      (Optional)
```

**Quick Submit Mode (Default):**
```json
{
  "event_id": "auto-generated-uuid",
  "submission_type": "quick",
  "outcome_scores": {
    "color_match": 5,           // 1-5: Did it hit the target?
    "coverage": 5,              // 1-5: Gray coverage quality
    "texture": 5,               // 1-5: Hair condition post-service
    "client_satisfaction": 5      // 1-5: Client feedback (if shared)
  },
  "deviation_flags": {
    "processing_faster": false,
    "processing_slower": false,
    "unexpected_warmth": false,
    "unexpected_coolness": false,
    "scalp_sensitivity": false,
    "breakage": false
  },
  "timestamp": "2026-04-18T16:30:00Z",
  "submitted_by": "hashed-stylist-id"
}
```

**Detailed Review Mode:**
- Optional: Before/after photos (anonymized, stored separately)
- Optional: Formula adjustments made during service
- Optional: Processing time variations
- Optional: Additional notes (free text, reviewed for PII before storage)

**Stylist Incentive Structure:**
- **Reputation Points:** Track stylist's contribution to ColorGenius knowledge base
- **Learning Credits:** Access to premium patterns/insights based on contribution
- **Recognition:** "Top Contributor" badges (anonymized stats only)
- **No Penalty:** Low scores don't hurt stylist — they help system learn

**Friction Reduction:**
- One-tap submission for returning clients
- Auto-populate from client profile
- Voice-to-text for notes
- Photo prompts at 4-week follow-up (optional, with client consent)

---

### How the System Learns Patterns

**Pattern Detection Pipeline:**

```
Raw Events → Anonymization Layer → Pattern Detection Engine → Pattern Review → Active Patterns
     ↓                                    ↓                           ↓                ↓
  Ingested                           Correlation                    Expert          Recommendation
  Daily                              Analysis                     Validation      Engine
```

**Stage 1: Data Ingestion & Normalization**
- Events validated against schema
- PII scrubbing (automated)
- Quality scoring (completeness check)
- Time-windowed batching (daily processing)

**Stage 2: Correlation Detection**

**Statistical Methods Used:**
1. **Chi-Square Testing** — Categorical associations (health condition + developer)
2. **Pearson Correlation** — Continuous variables (processing time vs. coverage)
3. **Cox Regression** — Time-to-event (durability predictions)
4. **Decision Trees** — Multi-variable pattern splits

**Auto-Detection Triggers:**
- Minimum 50 events with same condition combination
- Statistical significance p < 0.05
- Effect size > 0.3 (medium)
- Consistent across 3+ month window

**Example Auto-Detected Pattern:**
```
ALERT: Pattern Detected
Condition: Antidepressant + 20vol developer
Finding: 34% unexpected warmth rate (vs. 12% baseline)
Sample Size: 247 events
Confidence: 89%
Recommended Action: Suggest 10vol for this cohort
Expert Review Required: YES
```

**Stage 3: Expert Review Queue**

**Colorist Review Dashboard:**
```
┌─────────────────────────────────────────────────────┐
│ Pending Patterns (12)    Approved (847)   Rejected (203) │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Pattern #1247: Thyroid + Low Developer              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Statistic: 89% success with 5-10vol vs 67% with   │ │
│ │ 20vol for thyroid clients                       │ │
│ │ Sample: 1,247 events                            │ │
│ │ Confidence: HIGH                              │ │
│ │                                                 │ │
│ │ [View Raw Events] [Approve] [Modify] [Reject]   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Pattern #1248: Metal Detox + Antidepressants        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Statistic: 23% reduction in unexpected warmth     │ │
│ │ Sample: 892 events                              │ │
│ │ Confidence: MEDIUM (needs more data)            │ │
│ │                                                 │ │
│ │ [View Raw Events] [Approve] [Modify] [Reject]   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Review Actions:**
- **Approve:** Pattern becomes active, added to recommendation engine
- **Modify:** Expert adjusts parameters, adds caveats
- **Reject:** Pattern archived, algorithm learns from rejection
- **Flag:** Escalate for clinical review (safety concerns)

**Stage 4: Active Pattern Management**

**Pattern Lifecycle:**
```
Draft → Expert Review → Active → Validated → Core Knowledge
                              ↓              ↓
                         Deprecated    Industry Standard
                              ↓
                          (Replaced by better pattern)
```

**Continuous Validation:**
- Active patterns re-evaluated monthly
- Success rates tracked against predictions
- Confidence scores updated with new data
- Patterns deprecated if performance degrades

---

### Privacy Guarantees

**Technical Privacy Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT DATA LAYER                        │
│  (Encrypted, Client-Owned, Portable, Deletable)            │
│  • Names, Contact Info, Exact DOB, Photos, Exact Location   │
└──────────────────┬────────────────────────────────────────┘
                   │
                   ▼ (One-Way Hash + Bucketing)
┌─────────────────────────────────────────────────────────────┐
│              ANONYMIZATION LAYER                            │
│  • Age ranges (10-year buckets)                              │
│  • Region (not exact location)                              │
│  • Hashed salon IDs (reversible only with master key)       │
│  • Categorized medications (not specific drug names)        │
│  • Random UUIDs for event linking                             │
└──────────────────┬────────────────────────────────────────┘
                   │
                   ▼ (Aggregated, No Individual Traceability)
┌─────────────────────────────────────────────────────────────┐
│              LEARNING DATABASE                               │
│  • Pattern statistics only                                    │
│  • No raw events exposed                                      │
│  • No reverse-engineerable data                               │
│  • Differential privacy noise added to small samples          │
└─────────────────────────────────────────────────────────────┘
```

**Privacy-By-Design Principles:**

1. **Data Minimization**
   - Collect only what's needed for pattern detection
   - No exact dates (age buckets only)
   - No specific medication names (categories only)
   - No precise geolocation

2. **Anonymization Standards**
   ```
   BEFORE → AFTER ANONYMIZATION
   
   "Jane Smith, 32, NYC" → "Event_7A3F9, 30-40, Northeast"
   "Sertraline 100mg" → "antidepressant_category"
   "Jan 15, 2026 service" → "Q1_2026"
   "Exact GPS coords" → "Region_12_Hash"
   ```

3. **Re-Identification Prevention**
   - Differential privacy: Add statistical noise to small cohorts (<100)
   - K-anonymity: Minimum 5 similar records before pattern extraction
   - Event IDs: Random UUIDs, not sequential, not linkable to client
   - No cross-database joins with PII systems

4. **Client Control**
   - Opt-out at any time (removes future data collection)
   - Delete my data (removes past events, updates aggregates)
   - View what we store (transparency report)
   - Download my history (encrypted, portable)

5. **Technical Safeguards**
   - Encryption at rest (AES-256)
   - TLS 1.3 for data in transit
   - Access logging (who accessed what, when)
   - Regular privacy audits (quarterly)
   - Data retention limits (raw events: 2 years; aggregates: permanent)

6. **Legal Compliance**
   - GDPR compliant (EU clients)
   - CCPA compliant (California clients)
   - HIPAA considerations (no medical diagnosis, just general health categories)
   - Industry standard: SOC 2 Type II certified infrastructure

**Privacy Promise (Client-Facing):**

> "We learn from patterns, not people.
> 
> ColorGenius anonymously learns from each service to improve recommendations for future clients. We never store your name with outcomes. We can't identify you from our learning data.
> 
> **Your Rights:**
> - See exactly what we store about you
> - Download your data anytime
> - Delete your data anytime
> - Opt out of learning contributions
> 
> We believe the best color science comes from trusted, anonymous collaboration between stylists and clients."

**Breach Response Protocol:**
- 72-hour notification to affected clients
- Immediate pattern database audit
- No PII in pattern DB = minimal risk even if breached
- Transparent post-incident report

---

### Pattern Contribution Rewards

**Transparency for Stylists:**

Stylists can see aggregate impact of their contributions:

```
Your ColorGenius Contribution Summary

Total Events Submitted: 247
Patterns You Helped Discover: 12

Top Patterns:
✓ "Thyroid clients + 10vol = 89% success" (1,247 stylists use this)
✓ "Metal Detox + Antidepressants = fewer surprises" (892 stylists use this)
✓ "Post-chemo: wait 6+ months" (verified across 456 events)

Stylists Helped: 2,847 stylists have benefited from patterns you contributed to
Client Outcomes Improved: Estimated 15,000+ better color outcomes
```

**Anonymity for Stylists:**
- Patterns attributed to "community" not individual
- No public leaderboard of individual contributions
- No competitive ranking between salons
- Focus on collective knowledge building

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- Database schema
- Anonymization pipeline
- Basic ingestion API
- Manual expert review

### Phase 2: Learning (Weeks 5-12)
- Pattern detection algorithms
- Automated insights
- Colorist dashboard
- 1,000 services minimum

### Phase 3: Intelligence (Weeks 13-24)
- AI recommendation engine
- Reinforcement learning
- 10,000 services
- External validation

### Phase 4: Network (Year 2)
- Cross-salon learning
- Industry insights
- 100,000+ services
- Published research

---

## Competitive Moat

**Why This Matters:**

1. **Data Flywheel** — More services → Better recommendations → More salons → More services

2. **Expert Validation** — Colorist-reviewed patterns, not just raw correlations

3. **Privacy Trust** — Clients opt in because they trust the system

4. **Medical Safety** — Only system tracking health-condition outcomes at scale

**Defensibility:**
- 2+ years of validated patterns
- Expert network effects
- Client trust/loyalty
- Regulatory compliance as feature

---

*Architecture Version: 1.0*
*Last Updated: 2026-04-18*
*Next: Implementation spec for Phase 1*