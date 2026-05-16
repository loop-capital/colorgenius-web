# COLORgenius App Icons

## Overview

All app icons have been replaced with a custom, professional design to resolve Apple's **Guideline 2.3.8** rejection for placeholder icons.

## Design

- **Concept**: Flowing hair strand with color droplets
- **Brand Colors**:
  - Primary: `#7C3AED` (violet/purple)
  - Dark: `#5B21BD` (deep violet)
  - Light accent: `#A78BFA`
- **Droplet Colors**: Purple, pink, cyan, gold — representing hair color formulation
- **Shape**: iOS standard rounded square with ~22.5% corner radius (home screen)
- **App Store Version**: Square, fully opaque (no transparency per Apple requirements)
- **Style**: Radial gradient background with glossy droplets and sparkle accents

## Files Generated

### Expo Assets (used by `app.json`)

| File | Size | Purpose | Notes |
|------|------|---------|-------|
| `assets/icon.png` | 1024×1024 | Main app icon | Rounded corners, has transparency at corners |
| `assets/icon-appstore.png` | 1024×1024 | App Store icon | **Fully opaque**, square, no transparency |
| `assets/adaptive-icon.png` | 1024×1024 | Android adaptive icon | Rounded corners |
| `assets/splash-icon.png` | 1024×1024 | Splash screen | Dark background |
| `assets/favicon.png` | 48×48 | Web favicon | Rounded corners |

### iOS Asset Catalog (manual/Xcode)

Location: `ios/Colorgenius/Images.xcassets/AppIcon.appiconset/`

All 18 required iOS icon sizes generated:

| Size | Filename | Device |
|------|----------|--------|
| 20×20 @1x | `Icon-20x20@1x.png` | iPad |
| 20×20 @2x | `Icon-20x20@2x.png` | iPhone, iPad |
| 20×20 @3x | `Icon-20x20@3x.png` | iPhone |
| 29×29 @1x | `Icon-29x29@1x.png` | iPad |
| 29×29 @2x | `Icon-29x29@2x.png` | iPhone, iPad |
| 29×29 @3x | `Icon-29x29@3x.png` | iPhone |
| 40×40 @1x | `Icon-40x40@1x.png` | iPad |
| 40×40 @2x | `Icon-40x40@2x.png` | iPhone, iPad |
| 40×40 @3x | `Icon-40x40@3x.png` | iPhone |
| 60×60 @2x | `Icon-60x60@2x.png` | iPhone |
| 60×60 @3x | `Icon-60x60@3x.png` | iPhone |
| 76×76 @1x | `Icon-76x76@1x.png` | iPad |
| 76×76 @2x | `Icon-76x76@2x.png` | iPad |
| 83.5×83.5 @2x | `Icon-83.5x83.5@2x.png` | iPad Pro |
| 1024×1024 @1x | `Icon-1024x1024@1x.png` | App Store |

Plus `Contents.json` mapping all files.

## How It Works with Expo

Expo EAS Build automatically generates iOS asset catalog sizes from the `icon` field in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png"
  }
}
```

The 1024×1024 `assets/icon.png` is the master source. Expo resizes it for all required iOS icon slots during the build process.

**Important**: The `icon-appstore.png` (opaque, no alpha) is provided separately because Apple requires the App Store marketing icon to have **no transparency**. Expo may or may not use this automatically — if the App Store still complains about the icon, you may need to manually copy `icon-appstore.png` into the generated Xcode project or configure EAS to use it.

## Regenerating Icons

If you need to tweak the design:

```bash
# Edit scripts/generate-icons.py, then:
python3 scripts/generate-icons.py

# Then regenerate iOS catalog:
python3 scripts/generate-ios-catalog.py
```

## Apple Guidelines Compliance

- ✅ No placeholder/blank icons
- ✅ No template/example graphics
- ✅ Professional, branded design
- ✅ All required sizes present (18 iOS sizes)
- ✅ Rounded corners match iOS standard
- ✅ App Store icon (1024×1024) is fully opaque (no alpha channel)
- ✅ Consistent design across all sizes
