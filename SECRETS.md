# GitHub Secrets Setup

## Expo Token
Token: dfMQk4uHsT3zSNqUmmAKziBVQU9cEroWIpg4WlAn

## Setup Instructions

1. Go to https://github.com/jasonopland/colorgenius/settings/secrets/actions

2. Click "New repository secret"

3. Name: `EXPO_TOKEN`
   Value: `dfMQk4uHsT3zSNqUmmAKziBVQU9cEroWIpg4WlAn`

4. Click "Add secret"

## What This Enables

GitHub Actions will:
- Authenticate with Expo using this token
- Build iOS apps in the cloud
- No Mac required

## Security Note

This token is stored in GitHub's encrypted secrets. It will NOT be visible in logs or accessible to users.
