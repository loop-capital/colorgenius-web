# Bluetooth Scale Integration — Phase 1

## Goal
Directly compete with Vish by integrating Bluetooth scale support into ColorGenius for precise color mixing and inventory tracking.

## Compatible Scales

### 1. SalonScale
- **Accuracy:** 0.1g
- **BLE Protocol:** Standard Weight Scale Service (WSS) — UUID `0x181D`
- **Price:** ~$150-200
- **URL:** https://www.salonscale.com/bluetooth-scale
- **Status:** Actively marketed to salons, iOS/Android app

### 2. Sustain Beauty Co Bluetooth Scale
- **Accuracy:** 0.1g (lab-grade)
- **BLE Protocol:** Standard WSS
- **Price:** ~$120-150
- **URL:** https://sustainbeauty.co/product/bluetooth-color-scale-vish-color-system-ready/
- **Note:** "Vish Color System Ready" — implies standard BLE protocol

### 3. SKALE (Open Source SDK)
- **Accuracy:** 0.1g
- **BLE Protocol:** Open source SDK available
- **URL:** https://skale.cc/en/skale_open_sdk.html
- **Advantage:** Open SDK = easier integration, community support

## BLE Protocol (Standard WSS)

### Service UUID: `0x181D` — Weight Scale Service

### Characteristics:
| Characteristic | UUID | Properties | Description |
|----------------|------|------------|-------------|
| Weight Measurement | `0x2A9D` | Notify | Weight in kg or lbs |
| Weight Scale Feature | `0x2A9E` | Read | Scale capabilities |
| Date Time | `0x2A08` | Read/Write | Timestamp |
| User Index | `0x2A9A` | Read/Write | User profile |

### Weight Measurement Data Format:
```
Flags (1 byte):
  Bit 0: Weight in kg (0) or lbs (1)
  Bit 1: User ID present
  Bit 2: BMI present
  Bit 3: Height present
  Bit 4-7: Reserved

Weight (4 bytes, float32):
  Resolution: 0.005 kg or 0.01 lbs
```

## Web Bluetooth API Implementation

### Browser Support:
| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 70+ | ✅ Full | Windows, macOS, Linux, Android |
| Edge 79+ | ✅ Full | Windows, macOS |
| Safari | ❌ None | iOS requires native app |
| Firefox | ❌ None | No Web Bluetooth support |

### Code Example:
```typescript
// Connect to BLE scale
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['weight_scale'] }], // 0x181D
  optionalServices: ['device_information']
});

const server = await device.gatt.connect();
const service = await server.getPrimaryService('weight_scale');
const characteristic = await service.getCharacteristic('weight_measurement');

// Start notifications
await characteristic.startNotifications();
characteristic.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value;
  const flags = value.getUint8(0);
  const weightKg = value.getFloat32(1, true); // little-endian
  console.log(`Weight: ${weightKg} kg`);
});
```

## ColorGenius Integration Plan

### Phase 1A: Basic Scale Support (Week 1-2)
1. **Web Bluetooth connection** — "Pair Scale" button in Formulate page
2. **Live weight display** — Show current weight in mixing interface
3. **Tare function** — Zero the scale before adding color
4. **Auto-log consumption** — Log grams used per formula component

### Phase 1B: Inventory Integration (Week 3-4)
1. **Product database** — Link scale readings to product SKUs
2. **Auto-deduct inventory** — Subtract used grams from stock levels
3. **Low stock alerts** — Notify when products below threshold
4. **Usage analytics** — Track consumption patterns per stylist

### Phase 1C: Advanced Features (Week 5-6)
1. **Multi-product mixing** — Track multiple products in one bowl
2. **Waste calculation** — Reweigh bowl post-application, calculate waste
3. **Cost tracking** — Cost per service based on actual usage
4. **Predictive ordering** — Suggest reorders based on usage + appointments

## iOS/iPad Solution

Since Safari doesn't support Web Bluetooth:

### Option A: Native Wrapper (Recommended)
- **React Native** or **Capacitor** wrapper
- Full Bluetooth stack access
- Same codebase, native bridge for BLE
- Publish to App Store

### Option B: PWA with Native Helper
- Web app + small native iOS helper app
- Helper handles BLE, passes data to PWA
- More complex, two apps to maintain

### Option C: iPad-Only via Chrome
- iPad supports Chrome but Web Bluetooth is disabled
- Not viable without jailbreak

## Hardware Testing Plan

1. **Purchase scales:**
   - SalonScale ($150) — most popular, test first
   - SKALE ($120) — open SDK, backup option
   
2. **Test protocol:**
   - Pair via Chrome on Windows/Mac
   - Read weight data stream
   - Test tare/stability detection
   - Document any non-standard behavior

3. **Fallback:**
   - If scale doesn't use standard WSS, sniff BLE traffic
   - Use nRF Connect app to inspect GATT services
   - Document proprietary protocol

## Vish Competitive Comparison

| Feature | Vish | ColorGenius + Scale |
|---------|------|---------------------|
| AI Formulation | ❌ | ✅ |
| Scale Integration | ✅ | ✅ |
| Inventory Tracking | ✅ | ✅ |
| Predictive Ordering | ✅ | ✅ |
| Multi-brand Support | ✅ | ✅ |
| Cost per Service | ✅ | ✅ |
| Waste Tracking | ✅ | ✅ |
| Web-based | ❌ (iPad app) | ✅ (PWA + optional native) |
| Hardware Cost | $200+ scale | $120-150 scale |
| Monthly Cost | $$$ | $ or free tier |

## Next Steps

1. **Order test scales** — SalonScale + SKALE
2. **Build BLE connection prototype** — Basic weight read
3. **Add "Pair Scale" UI** to Formulate page
4. **Test on Windows/Mac Chrome** — Verify protocol
5. **Plan iOS wrapper** — React Native or Capacitor
6. **Document API** — For future distributor integration

---
*Research compiled 2026-04-27*
