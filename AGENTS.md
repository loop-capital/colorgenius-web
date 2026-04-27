# ColorGenius Agent Roster

| Agent ID | Name | Role | Primary Model |
|----------|------|------|---------------|
| `colorgenius-ceo` | Iris | CEO / Orchestrator | Xiaomi MiMo V2 Pro |
| `colorgenius-architect` | — | Platform Architect | Kimi K2.6 |
| `colorgenius-dev` | — | Full-Stack Developer | Kimi K2 Thinking |
| `colorgenius-devops` | — | Infrastructure | Kimi K2 Thinking |
| `colorgenius-research` | — | Research | Kimi K2.6 |
| `colorgenius-meta` | Prism | Meta / Improvement | Kimi K2 Thinking |

## Spawn Protocol
All tasks are assigned by Iris (`colorgenius-ceo`) via `sessions_spawn`. Sub-agents report back to Iris. Iris reports to Che (PC1) and Jason.

**Sub-agents must NOT be started directly.** Iris spawns them with explicit task directives.

## Escalation Path
Sub-agents → Iris → Che → Jason
