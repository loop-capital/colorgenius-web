#!/usr/bin/env bash
# Pre-Commit Hook: Main Branch Protection — COLORgenius
# Blocks direct commits to main branch. Forces using worktrees or feature branches.
#
# Install: ln -s .claude/hooks/pre-commit-main-protect.sh .git/hooks/pre-commit-main

set -euo pipefail

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    exit 0
fi

BRANCH=$(git branch --show-current 2>/dev/null || true)

# Allow initial commits (no previous commits yet)
if ! git rev-parse HEAD >&/dev/null 2>&1; then
    exit 0
fi

# Only care about main / master
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    exit 0
fi

echo ""
echo "🚨  COMMIT BLOCKED: Direct commits to '$BRANCH' are not allowed 🚨"
echo ""
echo "COLORgenius requires all work to happen on feature branches or worktrees:"
echo ""
echo "  Option 1 — Feature branch:"
echo "    git checkout -b feat/<feature-name>"
echo "    git add ."
echo "    git commit -m '...'"
echo "    git push -u origin feat/<feature-name>"
echo ""
echo "  Option 2 — Git worktree:"
echo "    git worktree add ../colorgenius-tasks/<task-name> -b <branch-name>"
echo "    cd ../colorgenius-tasks/<task-name>"
echo "    # do work, commit, then merge back"
echo ""
echo "  Option 3 — Use the /worktree command in Claude"
echo ""
echo "To bypass (not recommended): git commit --no-verify"
echo ""
exit 1
