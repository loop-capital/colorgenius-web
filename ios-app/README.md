# ColorGenius iOS App

Native iOS app for iPad with Bluetooth scale integration.

## Features
- Bluetooth scale connection (BLE)
- Real-time weight display
- Tare functionality
- Formula component tracking
- Dark theme (matches web app)

## Prerequisites
- macOS with Xcode 14+
- iOS 16+ device or simulator
- Node.js 18+

## Setup

```bash
# Install dependencies
npm install

# iOS specific setup
cd ios && pod install && cd ..

# Start Metro bundler
npx expo start

# Run on iOS simulator
npx expo run:ios

# Or run on physical device (requires Apple Developer account)
npx expo run:ios --device
```

## Building for Production

```bash
# Build iOS archive
npx expo prebuild
npx expo run:ios --configuration Release

# Or use EAS Build
npx eas build --platform ios
```

## Bluetooth Permissions

The app requires Bluetooth permissions. Add to `ios/ColorGenius/Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>ColorGenius needs Bluetooth to connect to your scale for precise color mixing.</string>
```

## Architecture

- **React Native** with Expo
- **react-native-ble-plx** for Bluetooth LE
- **Dark theme** matching web app design system
- **State management** via React hooks (can add Redux/Zustand later)

## Integration Points

### Web App Sync
The iOS app can sync with the web app via:
1. **Shared API** — Same backend endpoints
2. **Authentication** — OAuth or JWT
3. **Formula sync** — Fetch formulas from web, send usage data back

### Scale Protocol
- Standard BLE Weight Scale Service (0x181D)
- Compatible with SalonScale, Vish scales, SKALE
- Reads weight in grams with 0.1g precision

## Next Steps

1. Add formula management (CRUD)
2. Add client database
3. Add formulation history
4. Add photo capture (before/after)
5. Add offline support
6. Add analytics

## Notes

- iPad UI is optimized for tablet use
- Supports landscape and portrait
- Tested with iOS 16+ and iPadOS 16+
