# ColorGenius

AI-powered hair color formulation system for beauty professionals.

## Overview

ColorGenius digitizes 100+ years of professional hair color science into an intelligent platform that generates precise color formulas based on visual input, hair assessment, and environmental factors.

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### Local Development

1. **Start infrastructure:**
   ```bash
   cd infrastructure/docker
   docker-compose up -d postgres redis
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd packages/shared && npm install && cd ../..
   cd packages/api && npm install && cd ../..
   cd packages/web && npm install && cd ../..
   ```

3. **Set up Python engine:**
   ```bash
   cd packages/engine
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Run development servers:**
   ```bash
   # API (Terminal 1)
   cd packages/api && npm run dev

   # Engine (Terminal 2)
   cd packages/engine && uvicorn src.api:app --reload --port 8000

   # Web (Terminal 3)
   cd packages/web && npm run dev
   ```

5. **Access services:**
   - API: http://localhost:3000
   - API Docs: http://localhost:3000/docs
   - Web: http://localhost:3001
   - Engine: http://localhost:8000

### Docker Compose (Full Stack)

```bash
cd infrastructure/docker
docker-compose up -d
```

## Project Structure

```
colorgenius/
├── packages/
│   ├── api/          # Fastify REST API
│   ├── web/          # Next.js 14 web app
│   ├── engine/       # Python color science engine
│   └── shared/       # Shared TypeScript types
├── infrastructure/
│   └── docker/       # Docker Compose setup
├── docs/             # Documentation
└── [config files]
```

## Packages

| Package | Description |
|---------|-------------|
| `@colorgenius/shared` | TypeScript types for all domain objects |
| `@colorgenius/api` | Fastify API server with health checks, auth, rate limiting |
| `@colorgenius/web` | Next.js 14 web application for stylists |
| `@colorgenius/engine` | Python color science computations |

## Development

### Type Checking

```bash
npm run build --workspace @colorgenius/shared
```

### Linting

```bash
npm run lint --workspace @colorgenius/api
```

### Python

```bash
# Run engine tests
cd packages/engine && pytest

# Lint
ruff check src
```

## Documentation

- [Build Roadmap](../memory/color-genius/build-roadmap.md)
- [System Architecture](../memory/color-genius/system-architecture.md)
- [API Specification](../memory/color-genius/api-spec.md)
- [Database Schema](../memory/color-genius/database-schema.md)
- [Formulation Algorithm](../memory/color-genius/formulation-algorithm.md)
- [Color Science Engine](../memory/color-genius/color-science-engine.md)

## License

UNLICENSED - Proprietary to ClawStudio