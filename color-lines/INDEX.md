# ColorGenius Color Line Database — Index

## Overview
Comprehensive professional hair color line database for the ColorGenius AI formulation engine. 10 major professional brands documented with shade numbering, tone systems, developer volumes, mixing ratios, processing times, underlying pigment charts, and cross-brand conversions.

## Brand Files

### Tier 1 — Core Professional Brands
| Brand | File | Shade System | Tone Format | Key Lines |
|-------|------|-------------|-------------|-----------|
| **Davines** | [davines.md](davines.md) | Level.Tone (1-12) | Decimal (.0-.9) | View, A New Colour, Mask with Vibrachrom |
| **Wella** | [wella.md](wella.md) | Depth/Tone (1-12) | Slash (0-9) | Koleston Perfect, Illumina, Color Touch |
| **Redken** | [redken.md](redken.md) | Level + Letters | Alpha (N,A,C,G,R,V) | Shades EQ, Color Extend, Blondage |
| **Schwarzkopf** | [schwarzkopf.md](schwarzkopf.md) | Level-Tone (1-12) | Dash (-0 to -9) | Igora Royal, Igora Vibrance, Igora Vario |
| **Matrix** | [matrix.md](matrix.md) | Level + Letters | Alpha (N,A,G,C,R,V,M,P,T) | SoColor, Color Sync, Light Master |

### Tier 2 — Specialty & Emerging Brands
| Brand | File | Shade System | Tone Format | Key Lines |
|-------|------|-------------|-------------|-----------|
| **Joico** | [joico.md](joico.md) | Level + Letters | Alpha (N,NA,NV,NB,G,C,R,RV,V,M) | LumiShine, Vero K-PAK Color, Age Defy |
| **Pravana** | [pravana.md](pravana.md) | Level.Tone (1-10+) | Decimal (.0-.8) | ChromaSilk, VIVIDS, Platinum Toner |
| **Kenra** | [kenra.md](kenra.md) | Level + Letters (1-12) | Alpha (N,NA,NB,NUA,G,C,R,RV,V,M,BV) | Kenra Color, Simply Blonde, Rapid Toner |
| **Goldwell** | [goldwell.md](goldwell.md) | Level + Letters (1-12) | Alpha (N,NA,A,B,G,K,O,R,V,P,S) | Topchic, Colorance, Elumen |
| **L'Oréal Professionnel** | [loreal-professionnel.md](loreal-professionnel.md) | Level.Tone (1-10+) | Decimal (.0-.9) | iNOA, Majirel, Dia Light, Dia Colour |

## Tone System Comparison

| Tone Meaning | Davines | Wella | Redken | Schwarzkopf | Matrix | Joico | Pravana | Kenra | Goldwell | L'Oréal |
|-------------|---------|-------|--------|-------------|--------|-------|---------|-------|----------|---------|
| Natural | .0 | /0 | N | -0 | N | N | .0 | N | N | .0 |
| Ash | .1 | /1 | A | -2 | A | NA | .1 | NA | A | .1 |
| Green/Cendré | .2 | /2 | — | -1 | — | — | — | — | — | .2 |
| Gold | .3 | /3 | G | -5 | G | G | .3 | G | G | .3 |
| Copper | .4 | /4 | C | -7 | C | C | .4 | C | K | .4 |
| Mahogany | .5 | /5 | — | -8 | — | — | .5 | — | — | .5 |
| Red | .6 | /4 | R | -8 | R | R | .6 | R | R | .6 |
| Violet/Mat | .7 | /6 | V | -9 | V | NV | .7 | V | V | .7 |
| Pearl/Blue | .8 | /8 | — | — | P | — | .8 | — | P | .8 |
| Cendré/Grey | .9 | /9 | — | — | — | — | — | — | S | .9 |
| Beige | — | — | B | -4 | B | NB | .2 | NB | B | — |
| Mocha | .8 | /7 | — | — | M | M | — | M | — | — |

## Cross-Brand Quick Reference
See [CONVERSION-CHART.md](CONVERSION-CHART.md) for complete cross-brand conversion tables.

## Data Quality Notes
- All data sourced from manufacturer websites, education portals, professional forums, and publicly available shade charts
- Cross-brand conversions are approximate recommendations — actual results vary based on hair porosity, texture, and condition
- Always verify with manufacturer-published swatch charts for precise matching
- This database is for ColorGenius AI formulation engine development

## Last Updated
2026-04-16