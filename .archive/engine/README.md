# ColorGenius Engine

Professional hair color science engine for ColorGenius.

## Installation

```bash
pip install -e .
```

## Quick Start

```python
from colorgenius.engine import HairAnalyzer, FormulationEngine, ColorConverter
from colorgenius.engine.formulation.models import (
    FormulationInput, TargetColor, CurrentHairState, 
    HairProfile, ClientFactors, FormulationPreferences
)

# Analyze hair from photo
analyzer = HairAnalyzer()
result = analyzer.analyze(image_array)

# Generate formulation
engine = FormulationEngine()
input_data = FormulationInput(
    target=TargetColor(level=6, primary_tone="N"),
    current=CurrentHairState(level=3, tone="N", is_virgin=True),
    hair_profile=HairProfile(texture="medium", density="medium"),
    client=ClientFactors(gray_percentage=0),
    preferences=FormulationPreferences(preferred_brand="wella")
)
formula = engine.formulate(input_data)
```

## Modules

### Color Science (`color_science/`)

- `conversions.py` - RGB, Lab, LCH, HSL conversions using colormath
- `models.py` - Color level (1-10), tone families, shade profiles

### Hair Analysis (`hair_analysis/`)

- `analyzer.py` - Main orchestrator for photo analysis
- `color_extract.py` - Dominant color extraction from hair regions
- `undertone.py` - Undertone detection (warm/cool/neutral)

### Formulation (`formulation/`)

- `engine.py` - Main formulation algorithm
- `database.py` - Color line database (Schwarzkopf, Redken, Wella, Matrix)
- `models.py` - Formulation input/output models

## Color Levels (1-10 Scale)

| Level | Description | Melanin % |
|-------|-------------|-----------|
| 1 | Black | ~95% |
| 2 | Very Dark Brown | ~85% |
| 3 | Dark Brown | ~75% |
| 4 | Medium Brown | ~60% |
| 5 | Light Brown | ~45% |
| 6 | Dark Blonde | ~30% |
| 7 | Medium Blonde | ~20% |
| 8 | Light Blonde | ~12% |
| 9 | Very Light Blonde | ~6% |
| 10 | Platinum/Lightest | ~2% |

## Tone Families

- **N** - Natural/Neutral
- **A** - Ash (cool)
- **G** - Gold (warm)
- **C** - Copper
- **R** - Red
- **V** - Violet
- **B** - Beige
- **P** - Pearl

## Supported Brands

- Schwarzkopf (IGORA ROYAL, BlondMe)
- Wella (Koleston Perfect ME+, Illumina Color)
- Redken (Shades EQ, Color Gels Lacquers)
- Matrix (SoColor, Color Sync)
- Joico, Goldwell, Kenra

## Dependencies

- numpy, scipy
- Pillow
- colormath, colour-science
- scikit-image, opencv-python-headless
- pydantic, pyyaml

## License

MIT - ClawStudio