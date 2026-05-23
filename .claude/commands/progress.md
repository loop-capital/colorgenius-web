---
description: Show current build sprint progress and next steps
scope: project
---

# Progress

Read `PROJECT_STATUS.md` and `TASKS.md` and report current status.

## Instructions

1. Read `PROJECT_STATUS.md` — what phase are we on?
2. Read `TASKS.md` — which tasks completed? Which pending?
3. Check subagents — which agents completed? Which are running?
4. List completed vs pending tasks with status indicators
5. Identify blockers (especially Jason's items)
6. Suggest next steps

## Output Format
```
📊 COLORgenius Build Status

Phase: [Current Phase]

✅ Completed:
- [task] (agent)

🔄 In Progress:
- [task] (agent)

⏳ Pending:
- [task] → [next agent needed]

🚫 Blockers:
- [blocker] (owner)

📋 Next Steps:
1. [action]
2. [action]
```
