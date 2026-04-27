# ColorGenius

AI-powered Hair Color Formulation Engine for Professional Stylists.

## Architecture

```
colorgenius/
├── packages/
│   ├── engine/          # Python color science engine (FastAPI)
│   ├── api/             # Fastify TypeScript API server
│   └── web/             # Next.js 14 web frontend
├── infrastructure/
│   ├── docker/          # Dockerfiles for each service
│   ├── nginx/           # Nginx reverse proxy config
│   └── sql/             # PostgreSQL init scripts
└── docker-compose.yml
```

## Quick Start

```bash
# Copy environment
cp .env.example .env

# Build all services
npm run build

# Start all services
npm run start

# View logs
npm run logs
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Web | 3000 | Next.js frontend |
| API | 3001 | Fastify REST API |
| Engine | 8000 | Python color science |
| DB | 5432 | PostgreSQL |
| Redis | 6379 | Redis cache |
| Nginx | 80/443 | Reverse proxy |

## Development

```bash
# Run individual services
npm run dev:api
npm run dev:web
npm run dev:engine

# Shell into containers
npm run shell:api
npm run shell:web

# Database access
npm run db:shell
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /analyze | Analyze hair photo |
| POST | /formulate | Generate color formula |
| GET | /color-lines | List brands/shades |
| GET | /history | User analysis history |
| GET | /health | Health check |

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, CSS Modules
- **API**: Fastify, TypeScript, PostgreSQL, Redis
- **Engine**: Python 3.11, FastAPI, PyTorch
- **Infrastructure**: Docker Compose, PostgreSQL, Redis, Nginx

## MVP Deadline: August 15

See [system-architecture.md](../memory/color-genius/system-architecture.md) and [api-spec.md](../memory/color-genius/api-spec.md) for full specifications.