# Autonomous Skill Creation

After completing any complex task (multi-step, cross-project, or novel), automatically create a reusable skill so other agents can replicate the work without starting from scratch.

## Trigger Conditions
Create a skill when ALL of these are true:
- Task took >3 steps to complete
- Task involved >1 tool call type
- Task required project-specific knowledge
- The pattern could be reused by another agent

## Creation Process

### Step 1: Capture the Trajectory
Immediately after declaring "done", before context shifts:
1. What was the goal? (one sentence)
2. What were the phases? (numbered list)
3. What tools were used? (tool names)
4. What files were read/written? (paths)
5. What verification was done? (commands, tests)
6. What went wrong and how was it fixed? (errors + fixes)
7. What would you do differently next time? (improvement)

### Step 2: Write the Skill
Save to `~/.openclaw/skills/[category]/[skill-name]/SKILL.md`

Template:
```markdown
# [Skill Name]

## When to Use
[Trigger conditions — what makes this skill fire?]

## Phases
1. [Phase 1: DISCOVERY/PLAN/BUILD/etc]
   - [Specific action]
   - [Tool to use]
2. [Phase 2]
   - ...

## Verification
- [ ] [Check 1]
- [ ] [Check 2]

## Common Errors
| Error | Cause | Fix |
|-------|-------|-----|
| [Error pattern] | [Root cause] | [Solution] |

## Example Invocation
```
[Example task brief that would use this skill]
```
```

### Step 3: Log It
Append to `.learnings/SKILLS.md`:
```
## [YYYY-MM-DD] [skill-name]
- **Source task:** [brief description]
- **Pattern-Key:** [area.action]
- **Status:** active | deprecated | promoted
```

## Periodic Review
Weekly: scan `.learnings/SKILLS.md` for skills with >3 uses — promote to workspace-level skills.
Monthly: deprecate skills that haven't been used in 30 days.
