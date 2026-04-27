# Manual Photo Analysis Guide

## For ColorGenius Beta Stylists

This guide explains how to use the **Manual Photo Analysis** workflow when automated ML analysis is not available. This manual process is designed to be simple, fast, and accurate enough for beta launch while the ML model is being trained.

---

## When to Use Manual Analysis

**Use Manual Photo Analysis when:**
- The automated ML analysis service is unavailable
- You need a quick recommendation without waiting for ML processing
- You're working with a client who needs immediate results
- You want to cross-check or override ML recommendations

**Wait for Automated Analysis when:**
- You have time for processing (typically 10-30 seconds)
- You want the most accurate color extraction from the photo
- The client's hair is complex (multiple colors, heavy highlights, etc.)
- You need segmentation data (coverage percentage, zone mapping)

---

## How to Take Client Photos

### Lighting
- **Best:** Natural daylight from a window, indirect
- **Avoid:** Direct sunlight (creates harsh shadows and overexposure)
- **Avoid:** Fluorescent lighting (casts green/blue tones)
- **Avoid:** Yellow indoor lighting (warms the color, causes misidentification)
- **Tip:** Use a ring light or softbox if natural light is unavailable

### Camera Setup
- **Distance:** 12-18 inches from the head
- **Angle:** Slightly above eye level, camera parallel to the floor
- **Background:** Plain, neutral background (white or light gray wall)
- **Focus:** Sharp focus on the hair, especially the crown and front sections

### Hair Preparation
- Hair should be **dry** (wet hair appears darker)
- Comb through to remove tangles
- Part hair in the client's usual style
- Capture multiple angles if hair is multi-tonal:
  - Front view (face and crown)
  - Side view (temple to nape)
  - Back view (if possible, or ask client to take)

### What to Capture
- **Current color:** Take photos before any color application
- **Desired result:** If client has reference photos, capture those too
- **Problem areas:** If correction is needed, photograph the specific issues

---

## How to Determine Hair Level from a Photo

### The Level Scale (1-10)

| Level | Description | Color | Indicators |
|-------|-------------|-------|------------|
| 1 | Black | #0D0D0D | No light reflects, very dark |
| 2 | Very Dark Brown | #1A1A1A | Slightly lighter than black |
| 3 | Dark Brown | #3D2B1F | Rich brown, minimal warmth |
| 4 | Medium Brown | #5C4033 | Standard brown, some warmth |
| 5 | Light Brown | #7A5C4D | Brown with visible warmth |
| 6 | Dark Blonde | #A08060 | Golden tones appear |
| 7 | Medium Blonde | #C4A882 | Obvious blonde, warm base |
| 8 | Light Blonde | #D4B896 | Pale blonde, yellow visible |
| 9 | Very Light Blonde | #E4D4B8 | Very pale, slight yellow |
| 10 | Lightest Blonde | #F0E8DC | Near white, platinum base |

### Quick Identification Tips

**Dark Range (1-3):** If you can't see any warmth or lightness, it's in the dark range.

**Brown Range (4-5):** Look for brown with varying degrees of warmth. Level 4 is "coffee," Level 5 is "milk chocolate."

**Blonde Range (6-7):** Hair is clearly blonde but not pale. Level 6 is "dark honey," Level 7 is "honey."

**Light Blonde (8-10):** Hair is pale. Level 8 still has visible yellow, Level 9 is almost white with a tint, Level 10 is platinum/white.

### Common Mistakes to Avoid

1. **Wet hair photos:** Wet hair can appear 1-2 levels darker
2. **Poor lighting:** Yellow lighting makes hair appear warmer/lighter; blue lighting makes it appear cooler/darker
3. **Roots vs ends:** If hair is grown out, assess the most prevalent level or note both
4. **Dyed vs natural:** Previously dyed hair may not lift predictably; note this in "condition"

---

## Understanding Hair Condition

### Healthy
- **Signs:** Smooth cuticle, minimal breakage, elastic when wet
- **Process:** Can handle standard developer volumes and processing times

### Damaged
- **Signs:** Some split ends, dryness, slight breakage when brushing
- **Process:** Lower developer (10-20 vol max), shorter processing times

### Processed
- **Signs:** Previously colored, permed, or relaxed; some porosity
- **Process:** Test strand recommended; may need filler for even results

### Overprocessed
- **Signs:** Mushy when wet, breaks easily, stretchy texture, severe dryness
- **Process:** Very gentle! Low developer (10 vol), deposit-only formulas, bond builders mandatory

---

## Determining Skin Undertone

### Warm Undertone
- **Skin:** Yellow, peach, or golden cast
- **Veins:** Greenish appearance
- **Jewelry:** Gold looks better
- **Hair colors:** Golden blondes, warm browns, copper, caramel

### Cool Undertone
- **Skin:** Pink, red, or blue cast
- **Veins:** Blue or purple appearance
- **Jewelry:** Silver looks better
- **Hair colors:** Ash blondes, cool browns, platinum, burgundy

### Neutral Undertone
- **Skin:** Balanced, no strong warm or cool cast
- **Veins:** Blue-green (hard to tell)
- **Jewelry:** Both gold and silver look good
- **Hair colors:** Most colors work; natural tones are safest

**Quick test:** Look at the client in natural light. Do they "glow" in warm or cool colors? That's your clue.

---

## The Recommendation Engine

### How Scoring Works

The manual recommendation engine scores each shade across five dimensions:

1. **Level Match (35%):** How close the shade's level is to the desired level
2. **Undertone Compatibility (20%):** Whether the shade's undertone matches or complements the client's undertone
3. **Condition Compatibility (25%):** Whether the shade/process is safe for the hair condition
4. **Correction Needs (10%):** Whether the shade addresses any color correction needs
5. **Gray Coverage (10%):** Whether the shade is appropriate for gray hair percentage

### Confidence Score Interpretation

- **80-100% (High):** Excellent match — proceed with confidence
- **60-79% (Moderate):** Good match, but review reasoning notes
- **Below 60% (Caution):** Consider alternatives or consult senior stylist

### Reading the Results

Each recommendation includes:
- **Shade name and code:** Wella Koleston Perfect format (e.g., "6/1 Dark Blonde Ash")
- **Confidence score:** Overall compatibility percentage
- **Reasoning:** Why this shade was recommended (or cautioned against)
- **Developer recommendation:** Suggested developer volume based on condition and lift needed
- **Mixing instructions:** For corrector shades, how to mix with target shade

---

## Color Theory Basics for Stylists

### The Color Wheel in Hair

Understanding the color wheel helps you correct unwanted tones:

- **Yellow** is neutralized by **Violet** (opposite on wheel)
- **Orange** is neutralized by **Blue** (opposite on wheel)
- **Red** is neutralized by **Green** (opposite on wheel)

### Wella Koleston Perfect Correctors

| Corrector | Neutralizes | Use When |
|-----------|------------|----------|
| 0/11 Ash | Warmth, brass | Orange/yellow tones |
| 0/22 Matt | Yellow-orange | Overall warmth |
| 0/33 Gold | — | Adding warmth, richness |
| 0/66 Violet | Yellow | Brassy blonde |
| 0/88 Blue | Orange | Brassy dark blonde/light brown |

### Level System Logic

- **Going darker:** Deposit-only, lower risk. Use 10-20 vol developer.
- **Going lighter (1-2 levels):** Standard lift. Use 20-30 vol.
- **Going lighter (3+ levels):** High lift or pre-lightening required. Use 30-40 vol or bleach.
- **Same level:** Toning or refreshing. Use 10-20 vol deposit.

### Developer Guide

| Volume | Lift | Best For |
|--------|------|----------|
| 10 vol | 0 levels | Deposit only, toning, gray coverage on fragile hair |
| 20 vol | 1-2 levels | Standard coloring, gray coverage |
| 30 vol | 2-3 levels | Moderate lift, resistant gray |
| 40 vol | 3-4 levels | High lift, special blonde shades |

**Important:** Lower developer on damaged/overprocessed hair to minimize further damage.

---

## Common Correction Scenarios

### Scenario 1: Orange / Brassy After Lightening
**Cause:** Warm pigment exposed when lifting dark hair
**Fix:** Use ash (0/11) or blue (0/88) corrector mixed with target shade
**Shades:** 6/1, 7/1, 8/1 + corrector

### Scenario 2: Yellow Brassy on Light Blonde
**Cause:** Pale yellow undertone visible
**Fix:** Use violet (0/66) or ash (0/11) corrector
**Shades:** 8/1, 8/7 + corrector

### Scenario 3: Too Ashy / Green Cast
**Cause:** Over-correction with ash on porous hair
**Fix:** Add warmth with gold (0/33) corrector or warm family shade
**Shades:** 6/3, 7/3 + 0/33

### Scenario 4: Resistant Gray Coverage
**Cause:** Gray hair cuticle is resistant to penetration
**Fix:** Use natural (N) family shades with 20-30 vol. Pre-soften if very resistant.
**Shades:** 3/0, 4/0, 5/0, 6/0

### Scenario 5: Going Dark to Light (4+ Levels)
**Fix:** Use Special Blonde (12/0, 12/1, 12/7) with 40 vol, or pre-lighten with bleach.
**Caution:** This is high-risk on damaged hair. Consider multiple sessions.

### Scenario 6: Uneven Porosity
**Cause:** Previous color/chemicals create uneven absorption
**Fix:** Use lower developer on porous ends. Consider color fill before final color.
**Shades:** Neutral or warm shades (5/0, 6/0, 6/3)

---

## Best Practices for Beta

1. **Always photograph before and after** — this builds the dataset for ML training
2. **Note exceptions** — if the recommendation doesn't work, document why
3. **Start conservative** — when in doubt, choose the safer option
4. **Use corrector shades** — they give you more control than hoping a single shade handles everything
5. **Consider the whole client** — undertone, lifestyle, maintenance willingness
6. **When stuck, go neutral** — Natural (N) family shades are the safest bet

---

## Beta Feedback

Please report back on:
- Which recommendations worked well
- Which didn't match expectations
- Any missing shades or correction scenarios
- Suggestions for improving the scoring algorithm

Your feedback directly improves the ML model and recommendation engine!
