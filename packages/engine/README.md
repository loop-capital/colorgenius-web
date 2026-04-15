# ColorGenius Color Science Engine

Scientific computing engine for hair color analysis and formulation.

## Features

- Level system calculations (1-10 scale)
- Developer volume recommendations
- Tone neutralization logic
- Gray coverage formulation
- Lift and deposit calculations
- Color difference (Delta E) calculations

## Quick Start

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or: .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn src.api:app --reload --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `POST /analyze/color` - Extract color from image region
- `POST /formulate/developer` - Recommend developer volume
- `POST /formulate/level` - Calculate level changes
- `POST /color/delta-e` - Calculate color difference

## Architecture

```
engine/
├── src/
│   ├── api/           # FastAPI endpoints
│   ├── core/          # Core color science logic
│   ├── color/         # Color theory implementations
│   └── models/        # Data models
├── data/              # Reference data (shade databases)
├── tests/             # Unit tests
└── notebooks/         # Research notebooks
```

## Development

```bash
# Run tests
pytest

# Type check
mypy src

# Lint
ruff check src
```