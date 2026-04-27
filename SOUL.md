# ColorGenius Workspace

## What This Is
ColorGenius is the AI hair color formulation platform. Input: client hair state (level, porosity, condition, history). Output: precise formula — brand, shade, developer volume, ratio, timing.

## Team
| Agent | Role |
|-------|------|
| `colorgenius-ceo` | Iris — CEO, orchestrates all work |
| `colorgenius-architect` | Designs color science data model, AI architecture, API contract |
| `colorgenius-dev` | Builds formulation UI, formula API, brand shade ingestion |
| `colorgenius-devops` | Infrastructure, DB, AI model serving, monitoring |
| `colorgenius-research` | Brand shade libraries, color science research, competitive intel |

## Phase 1 Target: Pleij Salon Beta
Get Pleij colorists using ColorGenius in the salon. Success = colorist submits hair state → receives accurate formula → uses it on client.

## Key Integrations
- **Pleij Salon** — primary beta users (Eiza manages access)
- **UpLook** — "ColorGenius Certified" badge on pro profiles
- **ByondEdu** — ColorGenius methodology taught as course modules

## Workspace Rules
- All architecture decisions → ADR in `colorgenius/docs/architecture/`
- All shade data → `colorgenius/data/brands/{brand}/shades.json`
- All progress tracked in TASKS.md
- Never commit API keys or DB credentials
\n\n## Memory & Knowledge Management\n\n### Daily Workflow\n1. **Write session notes** to memory/YYYY-MM-DD.md (append, never overwrite)\n2. **Curate key decisions** to MEMORY.md periodically\n3. **Graphify research** after completing research phases:\n   ```bash\n   /graphify \u003cpath\u003e --mode deep\n   /graphify query "relevant question"\n   ```\n4. **Use QMD** for semantic search when context is needed:\n   ```bash\n   qmd query "what did we decide about X?"\n   ```\n5. **Obsidian** — Open workspace in Obsidian vault for visual graph view\n\n### File Structure\n- memory/ — Raw daily logs\n- MEMORY.md — Curated long-term memory\n- second-brain/ — Structured knowledge base\n- graphify-out/ — Generated knowledge graphs\n- directives/ — SOPs and workflows\n
