# Graph Report - /home/jason/.openclaw/workspaces/colorgenius  (2026-04-25)

## Corpus Check
- Corpus is ~1,242 words - fits in a single context window. You may not need a graph.

## Summary
- 41 nodes · 54 edges · 10 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Governance & Reporting Chain|Governance & Reporting Chain]]
- [[_COMMUNITY_Core Platform & Memory Tools|Core Platform & Memory Tools]]
- [[_COMMUNITY_Architecture Decisions & Infrastructure|Architecture Decisions & Infrastructure]]
- [[_COMMUNITY_Brand Shade Research|Brand Shade Research]]
- [[_COMMUNITY_Color Science Architecture|Color Science Architecture]]
- [[_COMMUNITY_Partner Ecosystem|Partner Ecosystem]]
- [[_COMMUNITY_Agent Bootstrap & Identity|Agent Bootstrap & Identity]]
- [[_COMMUNITY_Frontend Dev Stack|Frontend Dev Stack]]
- [[_COMMUNITY_Pleij Salon Beta|Pleij Salon Beta]]
- [[_COMMUNITY_Tool Configuration|Tool Configuration]]

## God Nodes (most connected - your core abstractions)
1. `Phase 1 Foundation` - 13 edges
2. `ColorGenius` - 12 edges
3. `colorgenius-ceo Agent` - 8 edges
4. `colorgenius-devops Agent` - 5 edges
5. `colorgenius-research Agent` - 5 edges
6. `Phase 2 Integrations (Post-Beta)` - 4 edges
7. `Pleij Salon` - 3 edges
8. `colorgenius-architect Agent` - 3 edges
9. `colorgenius-dev Agent` - 3 edges
10. `Color Science Data Model` - 3 edges

## Surprising Connections (you probably didn't know these)
- `colorgenius-devops Agent` --responsible_for--> `Frontend on Vercel`  [INFERRED]
  AGENTS.md → TASKS.md
- `Heartbeat Periodic Task Runner` --monitors--> `ColorGenius`  [INFERRED]
  HEARTBEAT.md → SOUL.md
- `colorgenius-devops Agent` --responsible_for--> `PostgreSQL on Neon`  [INFERRED]
  AGENTS.md → TASKS.md
- `colorgenius-devops Agent` --responsible_for--> `Backend API (Railway/Render)`  [INFERRED]
  AGENTS.md → TASKS.md
- `colorgenius-research Agent` --responsible_for--> `Redken Shade Library`  [INFERRED]
  AGENTS.md → TASKS.md

## Hyperedges (group relationships)
- **ColorGenius Multi-Agent Team** — agents_colorgenius_ceo, agents_colorgenius_architect, agents_colorgenius_dev, agents_colorgenius_devops, agents_colorgenius_research [EXTRACTED 1.00]
- **Brand Shade Library Research Cluster** — tasks_redken_shade_library, tasks_wella_shade_library, tasks_goldwell_shade_library, agents_colorgenius_research [EXTRACTED 0.95]
- **Pleij Beta Launch Dependencies** — soul_pleij_salon, tasks_phase1_foundation, soul_colorgenius, soul_eiza [INFERRED 0.85]

## Communities

### Community 0 - "Governance & Reporting Chain"
Cohesion: 0.32
Nodes (8): Che (PC1), colorgenius-ceo Agent, colorgenius-devops Agent, Jason (Human Owner), Nemotron 3 Super (Model), Iris (colorgenius-ceo), PostgreSQL on Neon, Backend API (Railway/Render)

### Community 1 - "Core Platform & Memory Tools"
Cohesion: 0.33
Nodes (7): Heartbeat Periodic Task Runner, AI Hair Color Formulation Platform, ColorGenius, Formula Output (brand, shade, developer, ratio, timing), Graphify Knowledge Tool, Hair State Input (level, porosity, condition, history), QMD Semantic Search

### Community 2 - "Architecture Decisions & Infrastructure"
Cohesion: 0.4
Nodes (5): ADR-001: AI Recommendation Approach, ADR-003: Auth Provider Decision, ADR-002: Video/Storage Platform Decision, Phase 1 Foundation, Frontend on Vercel

### Community 3 - "Brand Shade Research"
Cohesion: 0.5
Nodes (4): colorgenius-research Agent, Goldwell Shade Library, Redken Shade Library, Wella Shade Library

### Community 4 - "Color Science Architecture"
Cohesion: 0.5
Nodes (4): colorgenius-architect Agent, Kimi K2.6 (Model), Color Science Data Model, OpenAPI Spec for Formula API

### Community 5 - "Partner Ecosystem"
Cohesion: 0.67
Nodes (3): ByondEdu, UpLook, Phase 2 Integrations (Post-Beta)

### Community 6 - "Agent Bootstrap & Identity"
Cohesion: 0.67
Nodes (3): Bootstrap Identity Initialization, Agent Identity (IDENTITY.md), Human User Profile (USER.md)

### Community 7 - "Frontend Dev Stack"
Cohesion: 0.67
Nodes (3): colorgenius-dev Agent, MiniMax M2.7 (Model), Next.js Project (Mobile-First)

### Community 8 - "Pleij Salon Beta"
Cohesion: 1.0
Nodes (2): Eiza (Pleij Salon Access Manager), Pleij Salon

### Community 9 - "Tool Configuration"
Cohesion: 1.0
Nodes (2): Local Tool Configuration (TOOLS.md), Shared Skills

## Knowledge Gaps
- **13 isolated node(s):** `AI Hair Color Formulation Platform`, `ADR-001: AI Recommendation Approach`, `ADR-002: Video/Storage Platform Decision`, `ADR-003: Auth Provider Decision`, `Agent Identity (IDENTITY.md)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Pleij Salon Beta`** (2 nodes): `Eiza (Pleij Salon Access Manager)`, `Pleij Salon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tool Configuration`** (2 nodes): `Local Tool Configuration (TOOLS.md)`, `Shared Skills`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ColorGenius` connect `Core Platform & Memory Tools` to `Governance & Reporting Chain`, `Pleij Salon Beta`, `Architecture Decisions & Infrastructure`, `Partner Ecosystem`?**
  _High betweenness centrality (0.411) - this node is a cross-community bridge._
- **Why does `Phase 1 Foundation` connect `Architecture Decisions & Infrastructure` to `Governance & Reporting Chain`, `Core Platform & Memory Tools`, `Brand Shade Research`, `Color Science Architecture`, `Frontend Dev Stack`?**
  _High betweenness centrality (0.401) - this node is a cross-community bridge._
- **Why does `colorgenius-ceo Agent` connect `Governance & Reporting Chain` to `Brand Shade Research`, `Color Science Architecture`, `Frontend Dev Stack`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `colorgenius-devops Agent` (e.g. with `PostgreSQL on Neon` and `Backend API (Railway/Render)`) actually correct?**
  _`colorgenius-devops Agent` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `colorgenius-research Agent` (e.g. with `Redken Shade Library` and `Wella Shade Library`) actually correct?**
  _`colorgenius-research Agent` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AI Hair Color Formulation Platform`, `ADR-001: AI Recommendation Approach`, `ADR-002: Video/Storage Platform Decision` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._