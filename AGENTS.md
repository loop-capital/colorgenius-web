# ColorGenius Agent Roster

| Agent ID                | Name  | Role                 | Primary Model      |
| ----------------------- | ----- | -------------------- | ------------------ |
| `colorgenius-ceo`       | Iris  | CEO / Orchestrator   | Xiaomi MiMo V2 Pro |
| `colorgenius-architect` | —     | Platform Architect   | Kimi K2.6          |
| `colorgenius-dev`       | —     | Full-Stack Developer | Kimi K2 Thinking   |
| `colorgenius-devops`    | —     | Infrastructure       | Kimi K2 Thinking   |
| `colorgenius-research`  | —     | Research             | Kimi K2.6          |
| `colorgenius-meta`      | Prism | Meta / Improvement   | Kimi K2 Thinking   |

## Spawn Protocol

All tasks are assigned by Iris (`colorgenius-ceo`) via `sessions_spawn`. Sub-agents report back to Iris. Iris reports to Che (PC1) and Jason.

**Sub-agents must NOT be started directly.** Iris spawns them with explicit task directives.

## Quality Gates (Hard Rules)

Every agent MUST follow these rules when writing or modifying code:

### File Size Limits

- **No file > 300 lines.** If a file exceeds 300 lines, refactor into smaller modules.
- **No function > 50 lines.** If a function exceeds 50 lines, extract helper functions.

### TypeScript Standards

- **TypeScript strict mode always.** No `any` types without a comment explaining why.
- **No `@ts-ignore` or `@ts-expect-error`** unless the reason is documented.
- **All new files must be `.ts` or `.tsx`.** No `.js` files in the app.

### Code Quality

- **ESLint must pass** before committing.
- **No console.log in production code.** Remove it or use a logger.
- **No hardcoded secrets.** All secrets go in environment variables.
- **All components must have TypeScript props.**

### Testing

- **3+ assertions per test.** No single-assertion tests.
- **Test files live next to the code they test** (`__tests__/` directory).
- **Use descriptive test names.**

### Database

- **Prisma is the ORM.** Use Prisma Client, not raw SQL.
- **All tables must have proper indexes.**
- **AWS S3 for media.** Never store files in the database.

### Git Workflow

- **Never commit directly to main** without a feature branch (enforced by hook).
- **Commit messages** follow conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Always pull before push.**

## Before Making Changes

1. Read the relevant ADR in `project-docs/DECISIONS.md`
2. Check if the change conflicts with any existing decision
3. If it's a significant new decision, write a new ADR
4. Run lint before committing

## Escalation Path

Sub-agents → Iris → Che → Jason
