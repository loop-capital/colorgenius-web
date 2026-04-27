# COLOR LINE DATABASE — BUILD TASK

**Assigned to:** main-research (via Lucy/ColorGenius-CEO)
**Priority:** HIGH — This is the core IP for ColorGenius
**Due:** April 23, 2026

## Objective
Build a comprehensive hair color formulation database covering the major professional color lines used in US salons. This database powers ColorGenius's AI formulation engine.

## Color Lines to Research (Priority Order)

### Tier 1 — Most Popular US Salon Lines
1. **Davines** (View, A New Colour, Mask with Vibrachrom)
2. **Wella** (Koleston Perfect, Illumina, Color Touch)
3. **Redken** (Shades EQ, Color Gels, Chromatics)
4. **Schwarzkopf** (Igora Royal, Igora Vibrance, BlondMe)
5. **Matrix** (SoColor, Color Sync, Light Master)

### Tier 2 — Popular Alternatives
6. **Joico** (LumiShine, Vero K-PAK Color)
7. **Pravana** (ChromaSilk, Vivids)
8. **Kenra** (Color)
9. **Goldwell** (Topchic, Colorance, Elumen)
10. **L'Oréal Professionnel** (INOA, Majirel, Dia)

## Data to Collect Per Color Line

For each line, document:
1. **Shade numbering system** — how to decode (e.g., Wella 6/7 = level 6, gold tone)
2. **Tone numbering** — what each tone number means (ash, gold, red, etc.)
3. **Available shades** — full shade chart
4. **Developer volumes** — which developers to use (10, 20, 30, 40 vol)
5. **Mixing ratios** — color:developer ratio (e.g., 1:1, 1:1.5, 1:2)
6. **Processing times** — standard, gray coverage, lightening
7. **Underlying pigment chart** — what's revealed at each level when lifting
8. **Cross-brand conversions** — equivalent shades between brands

## Data Sources
- Manufacturer websites (free, public)
- Manufacturer education portals (some require stylist login)
- SalonGeek forums (community formulas)
- DavinesPro.com (seasonal recipes)
- Wella blog (formula recipes)
- Confessions of a Cosmetologist (cross-brand resources)
- Professional colorist YouTube channels (techniques + formulas)

## Output Format

Create one file per color line at:
`/home/jason/.openclaw/workspace/colorgenius/color-lines/{brand}.md`

Example structure:
```
# Wella — Koleston Perfect

## Shade System
- Level: 1-10 (1=black, 10=lightest blonde)
- Tone: /1=ash, /2=green, /3=gold, /4=red, /5=mahogany, /6=violet, /7=brown, /8=blue, /9=pearl gold

## Shade Chart
| Code | Name | Level | Tone |
|---|---|---|---|
| 5/0 | Light Brown Natural | 5 | Natural |
| ... | ... | ... | ... |

## Mixing Ratios
- Permanent: 1:1 with Koleston Perfect Special Developer
- ...

## Processing Times
- Gray coverage: 35-45 min
- Lightening: 30-40 min
- ...

## Underlying Pigment
| Level | Pigment |
|---|---|
| 1-4 | Blue-violet |
| 5-7 | Orange |
| 8-10 | Yellow-orange |
| ... | ... |

## Cross-Brand Equivalents
| Wella | Redken | Schwarzkopf | Davines |
|---|---|---|---|
| 6/0 | 6N | 6-0 | 6.0 |
| ... | ... | ... | ... |
```

## Also Create
- `/home/jason/.openclaw/workspace/colorgenius/color-lines/INDEX.md` — master index of all lines
- `/home/jason/.openclaw/workspace/colorgenius/color-lines/CONVERSION-CHART.md` — cross-brand conversion reference

## Notes
- This is data collection, not original research (we're documenting manufacturer specs)
- Prioritize accuracy — wrong formulations damage hair and our reputation
- Include source URLs for verification
- Flag any data gaps where manufacturer info is incomplete
