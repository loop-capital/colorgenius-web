# Bluetooth Scale Research — Salon / Hair Color Formulation

**Date:** 2026-05-03
**Agent:** colorgenius-research
**Task:** Evaluate Bluetooth scales suitable for salon/hair color use. Focus on: accuracy for small amounts (grams), BLE connectivity, battery life, durability, SDK/API availability, and cost.

---

## Executive Summary

For salon/hair color formulation use, 0.1g accuracy is strongly preferred over 0.2g. Three BLE-connected scales stand out for integration with a custom app like ColorGenius:

1. **Decent Half Decent Scale (HDS)** — Best for open development ($140)
2. **Acaia Pearl 2021** — Best balance of features + official SDK ($150)
3. **Skale 2 (Atomax)** — Best budget option with open SDK (~$80)

Industry-specific options (SalonScale, Vish) exist but are app-locked with no public developer APIs, making them unsuitable for integration into a third-party formulation platform.

---

## Detailed Comparison

| Feature | **Decent HDS** | **Acaia Pearl 2021** | **Skale 2**
|---|---|---|---|
| **Price** | ~$140 | ~$140–150 | ~$80 |
| **Accuracy** | 0.1g | 0.1g | 0.1g |
| **Max Capacity** | Unknown (espresso focus) | 2,000g | 2,000g |
| **Min Weight** | 0.1g | 0.1g | 0.1g |
| **Connectivity** | BLE 5.0, USB-C, Wi-Fi | BLE 4.0 (2021) / BLE 5.0 (Model S) | BLE |
| **Battery** | Rechargeable (USB-C) | Li-ion 1100mAh, 30–40 hrs, USB-C | Unknown (USB rechargeable) |
| **Water/Chem Resistance** | Not specified / not waterproof | Not waterproof; clean with soft cloth + warm water only | Not specified |
| **Dimensions** | 158 × 103 × 14 mm (slim) | 160 × 160 × 32 mm | Unknown |
| **Weight** | Unknown | 500g | Unknown |
| **SDK/API** | **Open-source firmware, open API, Python lib, JS lib** | Official iOS SDK + Android SDK on GitHub | Open SDK (iOS, Android, macOS, Flutter) |
| **Languages** | Python, JavaScript, C++ (Arduino/ESP32) | Swift/Obj-C, Java/Kotlin | Java, Kotlin, Swift, Flutter |
| **License** | GPL3 firmware + apps | Proprietary SDK (free to use) | MIT License (SkaleKit) |
| **Platform** | iOS, Android, Web (BLE/USB/Wi-Fi) | iOS, Android | iOS, Android, macOS, Flutter |
| **Salon Suitability** | Good — compact, accurate, open; not chemically sealed | Good — accurate, proven reliability; needs care around chemicals | Good — budget option; care needed around chemicals |

---

## Option 1: Decent Half Decent Scale (HDS)

### Pros
- **Fully open-source**: Firmware (GPL3), hardware based on ESP32 Arduino, full programmer’s guide
- **Multiple connectivity paths**: BLE, USB-C serial, and Wi-Fi — most flexible of any option
- **Active developer community**: JavaScript web apps, Python library (`pydecentscale`), GitHub repos
- **Compact and slim**: Fits tight salon station spaces (14mm height)
- **Built-in rechargeable battery** + can run on continuous USB power
- **Calibration weight included**

### Cons
- Not marketed or tested for salon/chemical environments
- No official IP rating for water/chemical resistance
- ESP32-based; may require more developer effort than off-the-shelf SDKs
- Smaller platform than Acaia; fewer existing apps in wild

### Developer Resources
- Programmer’s Guide: https://decentespresso.com/docs/programmers_guide_to_the_half_decent_scale
- GitHub (OpenScale): https://github.com/decentespresso/openscale
- Python Library: https://github.com/lucapinello/pydecentscale
- Web Apps: https://decentespresso.com/docs/introducing_half_decent_scale_web_apps

### Verdict
**Best choice if ColorGenius wants maximum control, open-source compliance, and the ability to customize firmware.** Ideal for a tech-forward salon app that may eventually want to embed scale logic directly into its own hardware or workflow automation.

---

## Option 2: Acaia Pearl 2021

### Pros
- **Official SDKs** for iOS and Android maintained by Acaia on GitHub
- **Proven 0.1g accuracy** with fast response time (40% faster than original Pearl)
- **Reputable brand** with strong coffee-industry reliability track record
- **USB-C charging**, 30–40 hour battery life, 1100mAh Li-ion
- **2-year warranty** (US/EU)
- Supported by SalonScale app already — proves salon viability

### Cons
- **Not waterproof or water-resistant** — chemical spills must be wiped immediately
- SDK is proprietary (free but not open-source)
- Bluetooth 4.0 on 2021 model (Model S has 5.0 but costs ~$220)
- PC plastic body may degrade with repeated chemical exposure over time

### Developer Resources
- iOS SDK: https://github.com/acaia/acaia_sdk_ios
- Android SDK: https://github.com/acaia/acaia_sdk_android
- SDK Announcement: https://acaia.co/blogs/news/new-ios-sdk-api-release
- Third-party JS: https://github.com/bpowers/btscale

### Verdict
**Best choice if ColorGenius wants a stable, commercial-grade SDK with minimal integration risk.** The fact that SalonScale already integrates Acaia scales validates this model for salon use. Recommended for fastest time-to-market.

---

## Option 3: Skale 2 (Atomax)

### Pros
- **Lowest price** (~$80)
- **Open SDK** with MIT license for iOS, Android, macOS, and Flutter
- **0.1g readability**, rapid response, 2kg capacity
- **Straightforward API**: `onWeightUpdate(weight: Float)`, `tare()`, `requestBatteryLevel()`
- Good for Flutter cross-platform apps if ColorGenius goes that route

### Cons
- Less brand recognition and long-term support visibility than Acaia
- No detailed specifications on battery capacity or chemical resistance
- Plastic construction; similar chemical vulnerability to Acaia
- Fewer third-party libraries and community resources

### Developer Resources
- Open SDK: https://skale.cc/en/skale_open_sdk.html
- Android SDK (GitHub): https://github.com/atomaxinc/SkaleKitAndroid
- App Store: https://itunes.apple.com/us/app/skale/id956134929
- Google Play: https://play.google.com/store/apps/details?id=com.atomaxinc.skale.skale

### Verdict
**Best choice if budget is the primary constraint and the team can tolerate slightly less ecosystem maturity.** The MIT-licensed SDK and Flutter support are strong positives for a lean startup build.

---

## Industry-Specific Options (Not Recommended for Integration)

### SalonScale
- Offers two Bluetooth scales: Precision Scale (0.2g, $60, black, rechargeable) and higher-end model (0.1g, USB-C, white/black)
- **App-locked**: Scale is designed to connect only to SalonScale app
- **No public developer SDK or API** found
- Pricing is subscription-based ($49–199/month for software)
- Not viable for ColorGenius integration unless partnering with SalonScale directly

### Vish
- Proprietary Bluetooth scale pairs exclusively with Vish app
- LED display turns off when connected to app
- Includes onboarding/training for salon teams
- **No public SDK or third-party integration path**
- Not viable for independent app integration

---

## Recommendations

### For ColorGenius (Integration-First Approach)

| Priority | Scale | Rationale |
|---|---|---|
| **1st** | **Acaia Pearl 2021** | Official SDKs, proven salon use (via SalonScale), best balance of reliability and dev support |
| **2nd** | **Decent HDS** | If team wants open-source control, custom firmware, or USB/Wi-Fi flexibility |
| **3rd** | **Skale 2** | If budget is tight and Flutter/cross-platform is the target architecture |

### Durability Notes for Salon Use
- **None of these scales are waterproof or chemically resistant.**
- All require immediate wipe-down after color/chemical contact.
- Consider providing colorists with a silicone mat or protective cover.
- For maximum longevity, store scales away from direct chemical splashes and clean with warm water only (no detergents on Acaia PC body).

### Next Steps
1. **Evaluate Acaia SDK** — clone `acaia/acaia_sdk_ios` and `acaia/acaia_sdk_android`, run sample apps, assess latency and weight-stability callbacks.
2. **Test Decent HDS Python lib** — install `pydecentscale`, connect via BLE on a Linux/Mac dev machine, verify 0.1g stability with small color-bowl weights.
3. **Buy and test one unit** of top choice in a real salon environment (Pleij) for chemical exposure and daily-use battery validation.
4. **Contact SalonScale** to explore partnership or API access if interested in co-marketing or integration.

---

## Appendix: Key Specifications

### Acaia Pearl 2021
- Model: AP007 / AP008
- Dimensions: 160 × 160 × 32 mm
- Weight: 500g ± 5g
- Max Capacity: 2,000g / 70.55 oz
- Readability: 0.1g
- Repeatability: 0.1g
- Battery: Li-ion rechargeable 3.7V 1100mAh
- Battery Life: 30–40 hours continuous
- Power: 5V / 500mA USB-C
- Connectivity: Bluetooth 4.0
- Warranty: 2 years (US/EU), 1 year (other)

### Acaia Pearl Model S (for reference)
- Price: ~$220
- Battery: 3.7V 2200mAh (16–40 hours)
- Max Capacity: 3,000g
- Connectivity: Bluetooth 5.0
- Adds: flow-rate display, brewguide mode, voice notifications

### Decent Half Decent Scale
- Price: ~$140
- Accuracy: 0.1g
- Connectivity: BLE, USB-C, Wi-Fi
- Power: Built-in rechargeable battery + USB-C continuous power
- Firmware: Open-source (GPL3), ESP32 Arduino based
- Programmer’s Guide: https://decentespresso.com/docs/programmers_guide_to_the_half_decent_scale

### Skale 2
- Price: ~$80
- Accuracy: 0.1g
- Capacity: 2,000g
- Connectivity: BLE
- SDK: MIT License, supports iOS/Android/macOS/Flutter
- Repo: https://github.com/atomaxinc/SkaleKitAndroid
