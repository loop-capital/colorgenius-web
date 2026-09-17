# ColorGenius Agent Roster

| Agent ID | Name | Role | Primary Model |
|----------|------|------|---------------|
| `colorgenius-ceo` | Iris | CEO / Orchestrator | Kimi K2.6 |
| `colorgenius-architect` | — | Platform Architect | Qwen3.5 |
| `colorgenius-dev` | — | Full-Stack Developer | Kimi K2.7-Code |
| `colorgenius-dev-qwen` | — | Full-Stack Developer (Qwen) | Qwen3.5 |
| `colorgenius-devops` | — | Infrastructure | Nemotron-3-Super |
| `colorgenius-research` | — | Research | GLM-5.3 |
| `colorgenius-meta` | Prism | Meta / Improvement | GLM-5.3-Flash |

## Spawn Protocol
All tasks are assigned by Iris (`colorgenius-ceo`) via `sessions_spawn`. Sub-agents report back to Iris. Iris reports to Che (PC2) and Jason.

**Sub-agents must NOT be started directly.** Iris spawns them with explicit task directives.

## Escalation Path
Sub-agents → Iris → Che → Jason
