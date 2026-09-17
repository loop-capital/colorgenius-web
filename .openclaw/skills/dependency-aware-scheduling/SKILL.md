# Dependency-Aware Agent Scheduling

When spawning multiple sub-agents, define task dependencies so agents start in the right order and don't step on each other's files.

## Problem
Firing agents blindly causes:
- File conflicts (two agents editing the same file)
- Race conditions (agent B needs agent A's output)
- Wasted tokens (agent retries because prerequisites failed)

## Solution: Dependency Graph

Before spawning, build a graph:
```
Phase 1 (parallel):  [Agent A: read codebase] [Agent B: read docs]
Phase 2 (depends):   [Agent C: build feature]  ← needs A + B output
Phase 3 (depends):   [Agent D: write tests]    ← needs C output
Phase 4 (depends):   [Agent E: review all]     ← needs A+B+C+D
```

## Implementation

### 1. Task Definition
Each task gets:
- `id`: unique identifier
- `deps`: list of task IDs that must complete first
- `tools`: explicit tool list (principle of least privilege)
- `files`: files this agent will touch (for conflict detection)

### 2. File Locking
Before spawning, check:
```
fileLocks = {}
for task in readyTasks:
    for file in task.files:
        if file in fileLocks:
            task.blocked = true
            task.blockReason = "file locked by [owner]"
        else:
            fileLocks[file] = task.id
```

### 3. Budget Enforcement
Track per-agent and total cost:
```
budget = 5.00  # USD
totalSpent = 0
for agent in runningAgents:
    totalSpent += agent.cost
    if totalSpent > budget:
        cancelRemaining()
        break
```

### 4. Quality Gate
After all agents complete, spawn a review agent:
```
reviewer = spawnAgent(
    task="Review combined output of [agents]. Check consistency, correctness, completeness.",
    model="claude-opus-4-7"
)
```

## Example: Feature Build
```yaml
swarm:
  name: add-auth
  max_concurrent: 3
  budget_usd: 5.0

tasks:
  - id: discover
    deps: []
    agent: dev
    tools: [Read, Grep, Glob]
    files: []

  - id: routes
    deps: [discover]
    agent: dev
    tools: [Write, Edit, Bash]
    files: [app/api/auth/route.ts]

  - id: middleware
    deps: [discover]
    agent: dev
    tools: [Write, Edit]
    files: [middleware.ts]

  - id: tests
    deps: [routes, middleware]
    agent: test-writer
    tools: [Write, Edit, Bash]
    files: [__tests__/auth.test.ts]

  - id: review
    deps: [routes, middleware, tests]
    agent: reviewer
    tools: [Read, Grep]
    files: []
```
