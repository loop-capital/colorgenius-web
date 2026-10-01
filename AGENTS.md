## Reply style (MANDATORY)
- Send the user the final answer only: results, status, next step. Never write out your plan, reasoning, "What I should do", "My response:", or drafts of your reply.
- Do not ask A/B questions when one option is clearly right; pick it and proceed.

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

## Tools

### Local notes (migrated from TOOLS.md)

# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Credentials & MCP keys — where to find them (2026-09-20)

All API keys, tokens and passwords (including the MCP server keys for `21st-magic`, `figma`, `scrapegraph`, `github`, `dataforseo`, `google-ads`) live in **`~/.openclaw/.env`** and are real environment variables. Reference them by name (`$NAME`); MCP servers receive them automatically via `${NAME}` in their `env` block in `openclaw.json`.

- **Never print, copy, or paste a literal key** into config, command-line args, memory notes, briefs, or chat.
- The full name → purpose list is in `~/.openclaw/workspaces/che/AGENTS.md` under "Credentials — moved to `~/.openclaw/.env`".
- If a credential isn't resolving or an MCP fails to authenticate, stop and tell Jason rather than searching for the value elsewhere.
