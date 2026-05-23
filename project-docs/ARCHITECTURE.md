# ColorGenius Architecture

> System overview, service responsibilities, and data flow.

## System Overview

ColorGenius is an AI-powered hair color consultation platform. It uses Next.js 15 with Prisma (database), AWS S3 (media storage), Anthropic AI (color recommendations), and Sentry (monitoring).

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  Next.js App • React 18 • Tailwind CSS • Radix UI           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Next.js API   │
                    │  (App Router)  │
                    └───────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                  │
    ┌─────▼─────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  Prisma    │   │   AWS S3    │   │  Anthropic  │
    │  (DB)      │   │  (Media)    │   │  (AI)       │
    └────────────┘   └─────────────┘   └─────────────┘
```

## Project Structure

```
colorgenius/
├── dashboard/           ← Main Next.js app
│   ├── app/             ← App Router pages & API routes
│   ├── components/      ← React components
│   ├── hooks/           ← Custom React hooks
│   ├── lib/             ← Utility functions
│   ├── data/            ← Static data (color lines, products)
│   └── docs/            ← Internal documentation
├── project-docs/        ← Architecture, infrastructure, decisions
├── scripts/             ← Git hooks, utility scripts
└── package.json         ← Root package (delegates to dashboard/)
```

## Core Services

### Database — Prisma

- ORM for database access
- Schema defined in `dashboard/prisma/schema.prisma`
- Migrations managed via `npx prisma migrate`

### AI — Anthropic

- Color recommendation engine
- Consultation processing
- Located in API routes

### Media — AWS S3

- Image uploads for color consultations
- Presigned URL upload flow
- S3 bucket for media storage

### Monitoring — Sentry

- Error tracking and performance monitoring
- `@sentry/nextjs` integration

## Key Design Decisions

| Decision   | Choice                | Why                                  |
| ---------- | --------------------- | ------------------------------------ |
| Framework  | Next.js 15 + React 18 | App Router, SSR, API routes          |
| Database   | Prisma                | Type-safe ORM, migrations            |
| AI         | Anthropic SDK         | Color recommendations, consultations |
| Storage    | AWS S3                | Media uploads, presigned URLs        |
| Monitoring | Sentry                | Error tracking, performance          |
| Styling    | Tailwind + Radix UI   | Consistent design system             |
