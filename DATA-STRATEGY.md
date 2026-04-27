# ColorGenius — Data Strategy & Privacy Framework

## Core Principle
**ColorGenius never stores, shares, or sells health data.**

---

## Data Categories

### 1. HAIR HISTORY (Sharable, Opt-In)
**What:** Chemical services, color history, treatments
**Use:** Cross-salon fraud protection, industry trends
**Client Control:** Portable, opt-in/opt-out

| Data Point | Sharable | Notes |
|------------|----------|-------|
| Last color service date | ✅ Yes | Flag for overlapping treatments |
| Keratin/Brazilian blowout date | ✅ Yes | Critical for timing |
| Henna use | ✅ Yes | Major contraindication |
| Color brand used | ✅ Yes | Helps formulate |
| Previous lightening | ✅ Yes | Integrity assessment |
| Haircut dates | ✅ Yes | Not sensitive |

### 2. SERVICE PREFERENCES (Private, Per-Salon)
**What:** Likes, dislikes, stylist notes
**Use:** Personalized experience
**Location:** Salon-local only

| Data Point | Sharable | Notes |
|------------|----------|-------|
| Preferred tone | ❌ No | Salon keeps private |
| Disliked results | ❌ No | Learning for that salon |
| Stylist notes | ❌ No | Proprietary |
| Pricing/history | ❌ No | Business sensitive |

### 3. HEALTH INFORMATION (Never Stored)
**What:** Conditions, medications, allergies
**Use:** Real-time consultation only
**Policy:** Not logged, not stored, not shared

| Data Point | Stored | Action |
|------------|--------|--------|
| Thyroid condition | ❌ No | AI advises stylist in moment |
| Cancer treatment | ❌ No | AI flags + requires human review |
| PPD allergy | ❌ No | Immediate product restriction warning |
| Psoriasis | ❌ No | AI suggests ammonia-free |
| Medications | ❌ No | Real-time formula adjustment suggestion |

---

## AI Consultation — Health Data Flow

**Step 1: Collection**
- AI asks: "Any health conditions or medications?"
- Client answers conversationally

**Step 2: Processing**
- AI interprets response
- Applies expert protocols (thyroid = 5-10vol, etc.)
- Generates **actionable suggestion**, not record

**Step 3: Delivery**
- Stylist sees: "AI suggests: Consider 5-10vol developer due to metabolic factors"
- **Not:** "Client has thyroid condition"
- Stylist decides, documents in their own system if needed

**Step 4: Disposal**
- Health data not written to ColorGenius database
- Consultation summary contains recommendations only
- No health history retained

---

## Client Communication

**Standard Script:**

> "ColorGenius will ask about health conditions and medications that could affect your color results. This information helps us suggest the safest approach, but it's not stored or shared. Please also discuss any concerns directly with your stylist before your service begins."

---

## Fraud Protection (Non-Health)

**What ColorGenius Can Track:**
- Chemical service dates
- Treatment types
- Salon locations
- Inconsistency flags

**Example Alert:**
```
⚠️ FLAG: Client reported "no recent color" but
record shows keratin treatment at [Salon] 4 weeks ago.
Recommend: Strand test + verify history with client.
```

**Client Sees:**
> "Our system shows a recent treatment. For your safety, let's do a quick strand test to ensure beautiful results."

---

## Business Model — Data Revenue

### ✅ Can Monetize (Anonymized)
| Data Product | Buyer | Example |
|--------------|-------|---------|
| Trend reports | Manufacturers | "Ash blonde demand up 23% in Southeast" |
| Regional insights | Distributors | "Keratin treatment popularity by metro" |
| Seasonal forecasting | Brands | "Summer 2026 color predictions" |
| Fraud incidence | Insurers | "False virgin hair claims by region" |

### ❌ Never Monetize
- Individual client identities
- Health conditions
- Specific medication data
- Personal service history tied to identity

---

## Technical Safeguards

1. **Data Minimization** — Health info processed in-memory, never persisted
2. **Access Logging** — Who saw what, when (audit trail)
3. **Encryption** — Hair history encrypted at rest and in transit
4. **Breach Response** — 72hr notification if hair history compromised
5. **Right to Delete** — Client can purge their portable history anytime

---

## Legal Positioning

**Not a Medical Device:**
- ColorGenius provides "suggestions" not "prescriptions"
- Stylist retains all professional liability
- No diagnosis, no treatment recommendations

**Not a Health Record:**
- No HIPAA compliance required (no PHI storage)
- General consumer privacy laws apply (CCPA, GDPR)

---

## Scanner Integration (Future)

**Anonymous Hair Fingerprint:**
- Spectral analysis creates unique hash
- Links to chemical service history only
- No PII attached
- Client controls: "My verified history" portable credential

**Fraud Detection:**
- Scanner detects: "Previous oxidative color present"
- Cross-reference: Client claimed "virgin"
- Outcome: Mandatory strand test, stylist discretion

---

*Last Updated: 2026-04-17*
*Policy: Health data never stored, hair history opt-in only, fraud protection via non-sensitive data*