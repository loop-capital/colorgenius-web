# Formulation Engine Rules

## Executive Summary

This document defines the rule-based formulation logic for the ColorGenius engine, derived from the 10-brand color line database. The engine takes client hair characteristics (current level, desired level, tone, condition, history) and outputs a recommended formulation: developer volume, color family, specific shade, and any adjustments or warnings.

**Key Principle:** Formulation is a decision tree, not a black box. Every recommendation must be explainable to the stylist.

---

## 1. Color Level System (1–10)

| Level | Description | Underlying Pigment | Common Client Description |
|---|---|---|---|
| **1** | Black | Red (very strong) | "Jet black" |
| **2** | Very Dark Brown | Red | "Dark brown, almost black" |
| **3** | Dark Brown | Red-Orange | "Chocolate brown" |
| **4** | Medium Brown | Red-Orange | "Light brown / mousy brown" |
| **5** | Light Brown | Orange | "Light brown / dark blonde" |
| **6** | Dark Blonde | Orange | "Dark blonde / light brown" |
| **7** | Medium Blonde | Yellow-Orange | "Dirty blonde / honey blonde" |
| **8** | Light Blonde | Yellow | "Blonde" |
| **9** | Very Light Blonde | Pale Yellow | "Platinum-ish / very light blonde" |
| **10** | Lightest Blonde | Palest Yellow | "White blonde / ice blonde" |

**Rule 1.1:** When analyzing current level, always identify the **underlying pigment** — this is what will be exposed during lightening and must be counteracted.

**Rule 1.2:** White/grey hair has no underlying pigment and is resistant to color absorption. It requires specific grey coverage formulations (see Section 6).

---

## 2. Developer Volume Logic

Developer (hydrogen peroxide) determines how much lift or deposit occurs. The standard volumes are 10 Vol (3%), 20 Vol (6%), 30 Vol (9%), 40 Vol (12%).

### 2.1 Same Level or Darker (Deposit / Tone-on-Tone)

| Current Level | Desired Level | Action | Developer | Timing |
|---|---|---|---|---|
| Any | Same | Tone / refresh | 10 Vol | 15–20 min |
| Any | 1 level darker | Deposit | 10 Vol | 20–25 min |
| Any | 2+ levels darker | Deposit + fill | 10–20 Vol | 25–35 min |

**Rule 2.1:** When going darker, always use **10 Vol** unless covering resistant grey, in which case 20 Vol may be used for better penetration.

**Rule 2.2:** When going 2+ levels darker, a **fill formula** is required first (see Section 7).

### 2.2 Lighter (Lift / Lighten)

| Current Level | Desired Level | Levels of Lift | Developer | Timing | Notes |
|---|---|---|---|---|---|
| 1–2 | Same or lighter | — | See bleaching | — | Levels 1–2 cannot be lifted with color alone |
| 3 | 4 | 1 level | 20 Vol | 30–35 min | |
| 3 | 5 | 2 levels | 30 Vol | 35–45 min | |
| 4 | 5 | 1 level | 20 Vol | 30–35 min | |
| 4 | 6 | 2 levels | 30 Vol | 35–45 min | |
| 5 | 6 | 1 level | 20 Vol | 30–35 min | |
| 5 | 7 | 2 levels | 30 Vol | 35–45 min | |
| 6 | 7 | 1 level | 20 Vol | 30–35 min | |
| 6 | 8 | 2 levels | 30 Vol | 35–45 min | |
| 7 | 8 | 1 level | 20 Vol | 30–35 min | |
| 7 | 9 | 2 levels | 30 Vol | 35–45 min | |
| 8 | 9 | 1 level | 20 Vol | 30–35 min | |
| 8 | 10 | 2 levels | 30 Vol | 35–45 min | |
| 9 | 10 | 1 level | 20 Vol | 30–35 min | |

**Rule 2.3:** Color alone can lift **maximum 2–3 levels** depending on brand. For 3+ levels of lift, **pre-lightening (bleaching)** is required.

**Rule 2.4:** 40 Vol is generally **not recommended** for scalp application due to damage risk. Reserve for off-scalp techniques (foils, balayage) on healthy hair only.

**Rule 2.5:** When lifting **2 levels**, 30 Vol is standard. When lifting **1 level**, 20 Vol is standard. 10 Vol provides no significant lift.

### 2.3 Condition-Based Developer Adjustments

| Hair Condition | Developer Adjustment | Rationale |
|---|---|---|
| **Healthy / Virgin** | Use standard developer | Full lift/deposit potential |
| **Moderate (some previous color)** | Drop 1 level (30→20, 20→10) | Reduce damage risk |
| **Damaged (over-processed, brittle)** | Drop to 10 Vol or use demi-permanent | Prevent breakage; may require multiple gentle sessions |
| **Severely Damaged** | **Do not lift.** Demi-permanent only or refuse service | Structural integrity at risk |
| **High Porosity** | Drop 1 level; reduce timing | Color absorbs too quickly; can grab dark or fade fast |
| **Low Porosity** | Increase developer by 1 level; extend timing | Resistant cuticle needs more processing time |

**Rule 2.6:** Damaged hair + lift = high breakage risk. Always recommend conditioning treatments and potentially postpone lightening services.

---

## 3. Color Family Selection by Desired Tone

### 3.1 Tone Terminology Mapping

| Client Says | Professional Term | Color Family Code | Direction |
|---|---|---|---|
| "Ashy," "Cool," "No warmth" | Ash | .1 (Blue-Violet base) | Cool |
| "Beige," "Neutral," "Natural" | Natural / Beige | .0 or .7 | Neutral-Slightly Cool |
| "Golden," "Honey," "Sunny" | Golden | .3 | Warm |
| "Copper," "Red," "Auburn" | Copper / Red | .4 / .5 / .6 | Warm |
| "Violet," "Purple," "Plum" | Violet | .2 | Cool |
| "Chocolate," "Warm Brown" | Warm | .3 / .4 / .5 | Warm |
| "Icy," "Platinum," "White" | High-Lift Ash / Pale Ash | .1 / .11 | Very Cool |
| "Rose Gold," "Blush" | Rose Gold | Mix of .4 + .2 | Warm-Cool balance |
| "Pearl," "Champagne" | Pearl | .2 + .1 | Cool |
| "Bronde" | Brown-Blonde | .7 / .3 + .1 | Neutral-Warm |
| "Mushroom," "Greige" | Mushroom | .1 + .7 | Cool-Neutral |
| "Smoky," "Graphite" | Smoky | .1 + .11 | Very Cool |

**Note:** Exact numeric codes vary by brand. The above uses a generalized system (e.g., Schwarzkopf .1 = Ash, Wella /1 = Ash, Redken .1 = Ash). The engine must map to brand-specific codes at formulation time.

### 3.2 Tone Selection Rules

**Rule 3.1 — Counteract Underlying Pigment:**
When lightening, the exposed underlying pigment must be neutralized:

| Exposed Pigment | Counteract With | Result |
|---|---|---|
| Red (Levels 1–2) | Green / Ash (.1) | Neutral brown |
| Red-Orange (Levels 3–4) | Blue-Violet / Ash (.1) | Cool brown |
| Orange (Levels 5–6) | Blue / Ash (.1) or Violet (.2) | Neutral-cool blonde |
| Yellow-Orange (Level 7) | Violet (.2) or Blue-Violet | Cool blonde |
| Yellow (Level 8) | Violet (.2) | Ash blonde |
| Pale Yellow (Levels 9–10) | Pale Violet (.2) or Pearl | Platinum / Icy |

**Rule 3.2 — Add Warmth (Gold/Copper/Red):**
When desired tone is warm, ADD warmth rather than relying solely on exposed pigment:

| Desired Result | Formula Approach |
|---|---|
| Golden Blonde | Level 8 base + .3 (gold) |
| Honey Blonde | Level 7 base + .3 (gold) + slight .4 (copper) |
| Strawberry Blonde | Level 7 base + .4 (copper) + .3 (gold) |
| Auburn | Level 4–5 base + .5 (red) or .4 (copper) |
| Rich Copper | Level 6–7 base + .4 (copper) |

**Rule 3.3 — Neutral/Beige:**
For clients wanting "no tone" or "natural":
- Use **.0** (natural) or **.7** (beige/neutral) families
- These balance warm and cool without strong direction
- Best for: clients who want subtle enhancement, grey coverage, or professional conservative looks

**Rule 3.4 — Fashion Colors (Vivids):**
For direct dyes (Pravana, Pulp Riot, etc.):
- Hair must be pre-lightened to **Level 9–10** for true vibrancy
- Pale yellow base is ideal (not orange)
- Apply to clean, dry hair
- Processing time: 20–30 minutes (often no developer needed for direct dyes)

---

## 4. Hair Condition Adjustments

### 4.1 Condition Assessment Impact

| Condition | Developer | Color Type | Processing Time | Additional Recommendations |
|---|---|---|---|---|
| **Healthy / Virgin** | Standard | Permanent | Standard | Standard aftercare |
| **Moderate** | Drop 1 level | Permanent / Demi | Standard | Add Olaplex/Bond builder to formula |
| **Damaged** | 10 Vol max | Demi-permanent | Reduce 5–10 min | Pre-treatment: protein filler; post: deep conditioning |
| **Severely Damaged** | No lift | Demi / Semi | Reduce 10 min | **Refuse lightening.** Offer gloss/tone only. Recommend conditioning series. |
| **High Porosity** | Drop 1 level | Demi-permanent | Reduce timing | Use porosity equalizer before color; expect faster fading |
| **Low Porosity** | Increase 1 level | Permanent | Extend 5–10 min | Use heat (cap/steamer) to open cuticle; clarify before service |

**Rule 4.1:** Damaged hair has compromised cuticle layers. Permanent color + developer further erodes the cuticle. **When in doubt, go gentler.**

**Rule 4.2:** High porosity hair (often from bleach, heat damage, or chemical treatments) absorbs color rapidly but also releases it quickly. Expect:
- Darker initial result than intended
- Faster fading
- Need for acidic toners and color-depositing conditioners

**Rule 4.3:** Low porosity hair (tight, compact cuticle, often on fine or resistant hair) resists color penetration. Techniques:
- Clarify before service to remove buildup
- Use heat during processing
- Extend processing time slightly
- May need higher developer for resistant grey

---

## 5. Previous Treatment Warnings & Pre-Lightening Requirements

### 5.1 Treatment History Logic

| Previous Treatment | Impact on Formulation | Warning Level |
|---|---|---|
| **No previous treatment (virgin)** | Full range of options | None |
| **Permanent color (same or darker)** | Color will not lift previous color; only lift natural regrowth | Medium |
| **Permanent color (lighter than current)** | Possible banding; assess porosity | High |
| **Highlights / Balayage** | Lifted sections are porous; formulate separately for lightened vs. natural areas | Medium |
| **Bleach / Pre-lightening** | Hair is porous and fragile; reduce developer; consider bond builder | High |
| **Keratin / Brazilian Blowout** | Color may not take evenly; wait 2 weeks post-treatment or use clarifying shampoo first | High |
| **Relaxer / Perm** | Hair is compromised; avoid lightening; tone/gloss only | **Critical** |
| **Henna / Metallic salts** | **DO NOT APPLY CHEMICAL COLOR** — risk of melting, breakage, chemical reaction | **CRITICAL — REFUSE** |
| **Direct dye / Vivid color** | May stain; requires color remover or pre-lightening for change | Medium |
| **Color remover / Stripper** | Hair is swollen and porous; gentle formulation only | High |
| **Box dye (unknown)** | Treat as permanent color; unpredictable results | Medium |
| **Sun-in / Lemon juice / DIY lightening** | Uneven lift; patchy results; may need correction | Medium |

### 5.2 Banding Prevention

**Rule 5.1:** When client has previous color and wants to go lighter, **the existing colored hair will NOT lift with color.** Only virgin regrowth lifts.

**Solution:**
1. Apply lightener/developer to **regrowth only** first
2. Process until regrowth reaches target level
3. Refresh ends with a toner or gloss (do NOT apply lightener to previously colored ends)

### 5.3 Pre-Lightening (Bleaching) Protocol

When target is 3+ levels lighter than current:

| Current Level | Target Level | Pre-Lightening Required? | Bleach Developer |
|---|---|---|---|
| 1–2 | 3+ | **Yes — always** | 20–30 Vol with care |
| 3 | 6+ | Yes | 20–30 Vol |
| 4 | 7+ | Yes | 20–30 Vol |
| 5 | 8+ | Yes | 20–30 Vol |
| 6 | 9+ | Yes | 20 Vol |
| 7–8 | 10 | Sometimes (for palest result) | 20 Vol |

**Rule 5.2:** Bleaching requires:
- Olaplex or equivalent bond builder **strongly recommended**
- Never process bleach beyond 45 minutes on scalp
- Check hair elasticity every 10 minutes (stretch test)
- If hair becomes gummy or stretchy, **rinse immediately**

**Rule 5.3:** Pre-lightened hair needs a **toner** afterward — raw lifted hair is yellow/orange and must be neutralized to achieve target tone.

---

## 6. Grey Coverage Rules

### 6.1 Grey Percentage Formulation

| White/Grey % | Formulation Adjustment |
|---|---|
| **0–25%** | Standard permanent color; grey will blend |
| **25–50%** | Use permanent color with 20 Vol; extend processing time to 35–40 min |
| **50–75%** | Add 1:1 ratio of Natural (.0) family to target shade; 20 Vol; 40 min |
| **75–100%** | Use pure Natural (.0) shade or dedicated grey coverage series; 20 Vol; 40–45 min |

**Rule 6.1:** Grey hair is resistant and lacks pigment. It needs:
- Permanent color (not demi or semi)
- 20 Vol developer (10 Vol may not penetrate)
- Extended processing time
- Natural (.0) base for maximum coverage

**Rule 6.2:** For salt-and-pepper look (intentional grey blending):
- Use demi-permanent or semi-permanent on lower developer
- Apply to non-grey hair only, or use a shadow root technique

---

## 7. Fill Formulas (Going Darker)

When going 2+ levels darker, hair lacks the underlying pigment needed for depth.

| Target Level | Fill Color | Developer | Process Time |
|---|---|---|---|
| **Level 3** (Dark Brown) | Red-Orange | 10 Vol | 15 min |
| **Level 4** (Medium Brown) | Red-Orange | 10 Vol | 15 min |
| **Level 5** (Light Brown) | Orange | 10 Vol | 15 min |
| **Level 6** (Dark Blonde) | Orange-Yellow | 10 Vol | 15 min |
| **Level 7** (Medium Blonde) | Yellow-Orange | 10 Vol | 15 min |
| **Level 8** (Light Blonde) | Yellow | 10 Vol | 15 min |

**Rule 7.1:** Apply fill first, process, rinse, then apply target color. Do not mix fill and target color together.

**Rule 7.2:** Fill formula uses a **demi-permanent** or **semi-permanent** color to deposit pigment without further lift.

---

## 8. Brand-Specific Mapping Notes

The engine must translate generalized rules into brand-specific codes. Key differences:

| Concept | Schwarzkopf | Wella | Redken | Matrix | Joico |
|---|---|---|---|---|---|
| Ash | .1 | /1 | .1 | .1 | .1 |
| Violet | .2 | /2 | .2 | .2 | .2 |
| Gold | .3 | /3 | .3 | .3 | .3 |
| Copper | .4 | /4 | .4 | .4 | .4 |
| Red | .5 | /5 | .5 | .5 | .5 |
| Natural | .0 | /0 | N | N | .0 |
| Developer | 3%, 6%, 9%, 12% | Same | Same | Same | Same |

**Rule 8.1:** Store brand-specific tone codes in the database. The engine should accept a brand parameter and return the correct shade code.

---

## 9. Example Decision Trees

### Example 1: Virgin Hair, Lightening

**Client:** Current Level 5 (Light Brown), wants Level 8 (Light Blonde), Golden tone, Healthy hair

1. **Lift Required:** 3 levels (5 → 8)
2. **Developer:** Color alone cannot lift 3 levels → **Pre-lightening required**
3. **Pre-Lightening:** Apply bleach + 20 Vol to regrowth (if previously colored) or all hair (virgin)
4. **Process:** Lift to pale yellow (Level 9–10)
5. **Tone:** Apply Level 8 + .3 (Gold) toner with 10 Vol developer
6. **Timing:** 15–20 minutes
7. **Result:** Level 8 Golden Blonde

### Example 2: Previously Colored, Same Level Tone Change

**Client:** Current Level 6 Dark Blonde with ash tone, wants Level 6 with copper tone, Moderate condition

1. **Lift:** None (same level)
2. **Developer:** 10 Vol (deposit only)
3. **Color:** Level 6 + .4 (Copper)
4. **Condition Adjustment:** Moderate condition → add Olaplex to formula
5. **Timing:** 25–30 minutes
6. **Result:** Level 6 Copper

### Example 3: Grey Coverage

**Client:** 60% grey, Level 4 Natural Brown target, Healthy hair

1. **Grey %:** 60% → use Natural + target blend
2. **Formula:** Level 4 Natural (.0) mixed 1:1 with Level 4 target shade
3. **Developer:** 20 Vol (grey needs penetration)
4. **Timing:** 40 minutes
5. **Result:** Level 4 with full grey coverage

### Example 4: Damaged Hair, Lifting

**Client:** Current Level 4, wants Level 7, previously bleached highlights, Damaged condition

1. **Assessment:** Damaged + lifting = high risk
2. **Decision:** **REFUSE to lift.** Offer alternative: Level 6–7 Demi-permanent gloss for shine and tone without lift.
3. **If client insists:** Require signature waiver; use 10 Vol maximum; add bond builder; process 20 min max; recommend conditioning series first.

---

## 10. Safety Guardrails

The formulation engine must enforce these non-negotiables:

| Guardrail | Action |
|---|---|
| **Damaged + 40 Vol** | Block and warn: "40 Vol not recommended on damaged hair. Consider lower developer or conditioning treatment first." |
| **Previously bleached + bleach again** | High warning: "Hair is already compromised. Re-bleaching risks breakage. Recommend Olaplex + 20 Vol max, or alternative service." |
| **Henna / Metallic salts detected** | **CRITICAL WARNING:** "Do not apply chemical color. Henna/metallic salts can react dangerously. Perform strand test or refuse service." |
| **Keratin treatment within 2 weeks** | Warning: "Keratin coating may prevent even color absorption. Clarify first or wait 2 weeks." |
| **Relaxer/Perm + Lightening** | **CRITICAL WARNING:** "Chemically relaxed/permed hair is structurally compromised. Lightening is NOT recommended. Tone-only service advised." |
| **Lift >3 levels with color alone** | Auto-correct: "Color can lift maximum 2–3 levels. Pre-lightening (bleach) required for this target." |
| **Going darker without fill** | Warning when 2+ levels darker: "Fill formula recommended to prevent muddy/green cast." |

---

## 11. Engine Data Structure (Recommended)

```json
{
  "input": {
    "current_level": 5,
    "desired_level": 8,
    "desired_tone": "golden",
    "condition": "healthy",
    "porosity": "normal",
    "grey_percentage": 0,
    "previous_treatments": ["none"],
    "brand_preference": "schwarzkopf"
  },
  "output": {
    "service_type": "pre-lightening + toner",
    "pre_lightening": {
      "developer": "20_vol",
      "product": "blonde_me_lift",
      "timing": "30_minutes",
      "target_level": 9
    },
    "final_formulation": {
      "level": 8,
      "tone_code": ".3",
      "tone_name": "golden",
      "developer": "10_vol",
      "product_line": "igor_royal",
      "timing": "20_minutes"
    },
    "adjustments": ["add_olaplex"],
    "warnings": ["ensure_even_lift_before_toning"],
    "confidence": "high"
  }
}
```

---

## 12. Implementation Priority

| Priority | Feature | Complexity |
|---|---|---|
| **P0** | Developer volume lookup table (current → desired → developer) | Low |
| **P0** | Tone family selection logic | Low |
| **P0** | Condition-based developer reduction | Low |
| **P0** | Critical safety warnings (henna, damaged + bleach, etc.) | Low |
| **P1** | Grey coverage percentage logic | Low |
| **P1** | Fill formula recommendations | Medium |
| **P1** | Brand-specific shade code mapping | Medium |
| **P2** | Banding prevention / zone-specific formulation | Medium |
| **P2** | Pre-lightening protocol generator | Medium |
| **P3** | AI-driven personalization based on outcome feedback | High |

---

*Document compiled from: Schwarzkopf, Wella, Redken, Matrix, Joico, L'Oréal Professionnel, Goldwell, Davines, Kenra, Pravana color line documentation*
*Date: 2026-04-25*
