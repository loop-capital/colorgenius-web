---
description: Generate architecture diagrams from actual COLORgenius code
scope: project
argument-hint: [architecture|api|database|formulation|all]
---

# Diagram

Generate architecture diagrams from the actual codebase.

## Usage
- `/diagram architecture` — System overview diagram
- `/diagram api` — API endpoint map
- `/diagram database` — Database schema diagram
- `/diagram formulation` — Formulation engine flow
- `/diagram all` — Generate all diagrams

## Instructions

1. **architecture** — Map the system:
   - Scan all API routes in `app/api/v1/`
   - Map data flows (photo → analysis → formulate → result)
   - Show external services (Supabase, Square, Vagaro, LiteRT)
   - Output as Mermaid diagram in `docs/diagrams/architecture.md`

2. **api** — Map all endpoints:
   - List every route in `app/api/v1/`
   - Show method, path, auth required, request/response schema
   - Output as table in `docs/diagrams/api-map.md`

3. **database** — Map the schema:
   - Read `supabase/complete-setup.sql` or schema file
   - Show tables, relationships, RLS policies
   - Output as Mermaid ER diagram in `docs/diagrams/database.md`

4. **formulation** — Map the formulation engine:
   - Show 6-step flow
   - Show hair state → formula mapping
   - Show brand/shade selection logic
   - Output in `docs/diagrams/formulation.md`

5. **all** — Generate all four diagrams

## Output
All diagrams saved to `docs/diagrams/` directory.
Use Mermaid syntax for diagrams (renders in GitHub).
