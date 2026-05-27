# EAS Build & Submit — COLORgenius iOS

## Credentials

- **Expo account**: `jasonopland`
- **EXPO_TOKEN**: stored at `/tmp/expo_token.txt` (write it there before running)
  - Full token: `Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7`
  - Token contains `--` — NEVER inline it in shell commands or it breaks argument parsing
  - Always use: `EXPO_TOKEN="$(cat /tmp/expo_token.txt)"`
- **Apple ID**: `jasonopland@msn.com` (hardcoded in `eas.json` — EAS CLI does NOT interpolate shell env vars like `$APPLE_ID` in eas.json)
- **ASC App ID**: `6768502681`
- **Bundle ID**: `com.colorgenius.app`
- **EAS Project ID**: `b079806d-5b5b-4c83-ab89-63ea74de66da`

## Build

```bash
echo -n "Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7" > /tmp/expo_token.txt
cd /home/jason/.openclaw/workspaces/colorgenius/mobile
EXPO_TOKEN="$(cat /tmp/expo_token.txt)" npx eas-cli@latest build --platform ios --profile production --non-interactive
```

Build takes 10–20 minutes. Note the build ID from the output URL.

## Submit

```bash
EXPO_TOKEN="$(cat /tmp/expo_token.txt)" npx eas-cli@latest submit --platform ios --id <BUILD_ID> --profile production --non-interactive
```

- `--profile production` is required — it points EAS at the `submit.production.ios` block in `eas.json` which has the Apple ID and ASC app ID
- Do NOT use `--apple-id` or `--asc-app-id` flags — these don't exist in current eas-cli
- Do NOT set `"appleId": "$APPLE_ID"` in eas.json — EAS does not interpolate shell env vars there; use the literal email

## What NOT to do

- Don't inline the token: `EXPO_TOKEN=Qe7Nuio-DEpkKeJa-VTqGmX4JLvv--lpvsZULah7 npx ...` — the `--` breaks shell parsing
- Don't use `--apple-id` / `--asc-app-id` flags (removed from eas-cli)
- Don't set `appleId` to `"$APPLE_ID"` in eas.json (not interpolated)

## Known Billing Note

Build credits hit 100% monthly limit as of May 2026 — additional builds charge pay-as-you-go.
