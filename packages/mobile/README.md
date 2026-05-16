# ColorGenius Mobile App

This is the Expo React Native wrapper for the ColorGenius web dashboard.

## Development

To run the app in development:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then use the Expo Go app on your device to scan the QR code.

## Building for EAS

To build for Expo Application Services (EAS):

```bash
# Login to EAS (if not already logged in)
eas login

# Build for development
eas build --profile development

# Build for preview (TestFlight)
eas build --profile preview

# Build for production (App Store)
eas build --profile production
```

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

- `EXPO_PUBLIC_API_URL`: URL to your ColorGenius API
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Deep Linking

The app supports deep linking for formula sharing. URLs like `colorgenius://formula/abc123` will be handled appropriately.

## Camera Permissions

The app requests camera permissions for photo-based hair analysis features.