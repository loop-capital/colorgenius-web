# ColorGenius iOS App — Setup Guide

## Overview
This is a native iOS app for iPad with Bluetooth scale integration, built with Expo and React Native.

## Prerequisites
- Node.js 18+
- Expo account (free)
- Apple Developer account ($99/year) — for App Store distribution
- Git

## Initial Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd colorgenius/ios-app
npm install
```

### 2. Expo Account Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
npx eas login

# Configure project (run once)
npx eas build:configure
```

### 3. iOS Build Options

#### Option A: Development Build (Testing)
```bash
# Build for iOS simulator (no Apple Developer account needed)
npx eas build --platform ios --profile preview

# Build for physical device (requires Apple Developer account)
npx eas build --platform ios --profile development
```

#### Option B: Production Build (App Store)
```bash
# Build for App Store submission
npx eas build --platform ios --profile production
```

### 4. Apple Developer Setup (Required for Device/Store)

1. Create Apple Developer account: https://developer.apple.com
2. Create App ID in Apple Developer Portal
3. Create provisioning profiles
4. Update `eas.json` with your `ascAppId`

### 5. Environment Variables

Create `.env` file:
```
API_URL=https://your-api-url.com
API_KEY=your-api-key
```

## Building Without a Mac

### Using EAS Build (Recommended)
```bash
# Build in the cloud (Expo's servers)
npx eas build --platform ios --profile preview

# Download the .ipa or run on simulator
```

### Using GitHub Actions (CI/CD)
A GitHub Actions workflow is included for automatic builds on push.

## Local Development (Requires Mac)

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Start Metro bundler
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on physical device
npx expo run:ios --device
```

## Project Structure
```
ios-app/
├── App.tsx              # Main app component
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
├── index.ts             # Entry point
├── package.json         # Dependencies
├── assets/              # Icons, splash screen
├── src/
│   ├── components/       # Reusable components
│   ├── screens/         # Screen components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API calls, Bluetooth
│   └── utils/           # Utilities
└── README.md
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run web` | Run in browser |
| `npx eas build` | Build with EAS |
| `npx eas submit` | Submit to App Store |

## Features
- Bluetooth scale integration (BLE)
- Real-time weight display
- Tare functionality
- Formula component tracking
- Dark theme
- Offline support (future)

## Troubleshooting

### Bluetooth Not Working
- Check iOS permissions in Settings > ColorGenius
- Ensure scale is powered on and in pairing mode
- Restart the app

### Build Fails
- Clean build: `npx expo prebuild --clean`
- Update dependencies: `npm update`
- Check EAS logs: `npx eas build:logs`

## Multi-Project Setup

This EAS configuration can be reused for other projects:

### UpLook App
```bash
cd uplook/ios-app
# Copy eas.json and app.json structure
# Update bundleIdentifier and projectId
```

### New Project
```bash
npx create-expo-app my-app
cd my-app
# Copy eas.json from this project
# Update project-specific values
```

## Resources
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)
- [Apple Developer Portal](https://developer.apple.com)

## Support
For issues or questions, contact the ColorGenius team.
