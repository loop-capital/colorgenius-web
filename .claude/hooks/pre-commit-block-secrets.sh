#!/usr/bin/env bash
# Pre-Commit Hook: Block Secrets — COLORgenius
# Scans staged files for API keys, tokens, passwords, .env file contents.
# Blocks commit if found.
#
# Install: ln -s .claude/hooks/pre-commit-block-secrets.sh .git/hooks/pre-commit

set -euo pipefail

# Only run if we're in a git repo
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    exit 0
fi

# Check if there are staged files
STAGED=$(git diff --cached --name-only 2>/dev/null || true)
if [ -z "$STAGED" ]; then
    exit 0
fi

VIOLATIONS=""

# ── 1. Check for sensitive files being staged ──
SENSITIVE_BASENAMES=".env .env.local .env.production .env.staging secrets.json credentials.json service-account.json .npmrc"
for pattern in $SENSITIVE_BASENAMES; do
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        bname=$(basename "$file")
        if [ "$bname" = "$pattern" ]; then
            VIOLATIONS="${VIOLATIONS}\n  ❌ SENSITIVE FILE STAGED: $file"
        fi
    done <<< "$STAGED"
done

# ── 2. Check for private key files ──
while IFS= read -r file; do
    [ -z "$file" ] && continue
    bname=$(basename "$file")
    case "$bname" in
        id_rsa|id_ed25519|id_ecdsa|id_dsa|*.pem|*.key)
            VIOLATIONS="${VIOLATIONS}\n  ❌ PRIVATE KEY FILE STAGED: $file"
            ;;
    esac
done <<< "$STAGED"

# ── 3. Check staged file contents for common secret patterns ──
while IFS= read -r file; do
    [ -z "$file" ] && continue
    if [ -f "$file" ]; then
        # Generic API key / secret / password / token patterns
        if grep -qEi '(api[_-]?key|secret[_-]?key|password|token)\s*[:=]\s*["\x27][A-Za-z0-9+/=_-]{16,}' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ⚠️  POSSIBLE SECRET in $file"
        fi
        # AWS access keys
        if grep -qE 'AKIA[0-9A-Z]{16}' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ⚠️  AWS ACCESS KEY in $file"
        fi
        # GitHub tokens
        if grep -qE '(ghp_[A-Za-z0-9]{36,}|gho_[A-Za-z0-9]{36,}|ghs_[A-Za-z0-9]{36,}|ghr_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ⚠️  GITHUB TOKEN in $file"
        fi
        # Slack tokens
        if grep -qE '(xoxb-|xoxp-|xoxo-|xoxa-)[0-9A-Za-z-]{20,}' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ⚠️  SLACK TOKEN in $file"
        fi
        # Square keys (NOT Stripe — we don't use Stripe)
        if grep -qE '(sq0idp-|sq0csp-|sq0atp-)[A-Za-z0-9]{20,}' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ⚠️  SQUARE KEY in $file"
        fi
        # Supabase service role key pattern
        if grep -qE 'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*' "$file" 2>/dev/null && grep -qEi 'service[_-]?role|supabase' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ⚠️  POSSIBLE SUPABASE SERVICE ROLE KEY in $file"
        fi
        # PEM-format private keys
        if grep -qE '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----' "$file" 2>/dev/null; then
            VIOLATIONS="${VIOLATIONS}\n  ❌ PEM PRIVATE KEY in $file"
        fi
    fi
done <<< "$STAGED"

if [ -n "$VIOLATIONS" ]; then
    echo -e "\n🚨  POTENTIAL SECRETS DETECTED — COMMIT BLOCKED 🚨" >&2
    echo -e "${VIOLATIONS}" >&2
    echo "" >&2
    echo "Remove secrets before committing. If these are false positives, use:" >&2
    echo "  git commit --no-verify" >&2
    echo "  (not recommended for production code)" >&2
    exit 1
fi

echo "✅  No secrets detected in staged files."
exit 0
