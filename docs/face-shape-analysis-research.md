# Face Shape Analysis Research — Phase 2 Consumer App

**Date:** 2026-04-27  
**Status:** Research Complete  
**For:** LookGenius / ColorGenius Discover consumer app

---

## Executive Summary

**Recommended approach:** MediaPipe Face Mesh (468 landmarks) + custom classification algorithm, running client-side via WASM.

---

## Options Compared

| Feature | MediaPipe Face Mesh | dlib Shape Predictor | OpenCV + Haar |
|---------|-------------------|----------------------|---------------|
| **Landmarks** | 468 points | 68 points | Bounding box only |
| **Accuracy** | ★★★★★ | ★★★★ | ★★ |
| **Runtime (web)** | ~15ms | ~40ms (WASM) | ~5ms |
| **Bundle size** | ~2.5MB (WASM) | ~100MB (model) | ~500KB |
| **Face shapes** | 6+ (custom classifier) | 5 (custom classifier) | No shape detection |
| **License** | Apache 2.0 | Boost 1.0 | Apache 2.0 |
| **Next.js compat** | ✅ WASM + Canvas | ⚠️ Requires WASM build | ✅ Native |
| **Mobile support** | ✅ iOS + Android | ❌ Desktop only | ✅ Limited |
| **Maintenance** | Active Google team | Community | OpenCV team |

---

## Detailed Analysis

### 1. MediaPipe Face Mesh (RECOMMENDED)

**How it works:**
- Uses ML model to detect 468 3D facial landmarks in real-time
- Runs entirely client-side via WebAssembly
- Provides x, y, z coordinates for each point

**Classification approach:**
```
1. Extract key landmarks:
   - Forehead width (points 10, 338)
   - Cheekbone width (points 234, 454)
   - Jaw width (points 172, 397)
   - Face length (point 10 to point 152)

2. Compute ratios:
   - Face length / forehead width
   - Cheekbone width / jaw width
   - Forehead width / jaw width

3. Classify:
   - Oval: length > width, jaw < cheekbone
   - Round: length ≈ width, soft jaw
   - Square: jaw ≈ cheekbone ≈ forehead
   - Heart: forehead > jaw, wide cheekbones
   - Diamond: cheekbone > forehead > jaw
   - Oblong: length >> width
```

**Pros:**
- 468 landmarks gives precise geometry
- 3D coordinates handle angle/tilt
- Real-time performance on mobile
- Well-documented, active community
- Works with camera stream (live try-on)

**Cons:**
- 2.5MB WASM initial download
- Requires warm-up (first inference slower)
- Google dependency risk

**Integration with Next.js:**
```typescript
import { FaceMesh } from '@mediapipe/face_mesh'

// Or use the newer @mediapipe/tasks-vision
import { FaceLandmarker } from '@mediapipe/tasks-vision'

const faceLandmarker = await FaceLandmarker.createFromOptions(
  vision, {
    baseOptions: { modelAssetPath: '/models/face_landmarker.task' },
    runningMode: 'IMAGE', // or 'VIDEO' for live
    numFaces: 1,
  }
)

const result = faceLandmarker.detect(imageElement)
// result.faceLandmarks[0] → 468 landmarks
```

### 2. dlib Shape Predictor

**How it works:**
- 68-point facial landmark model
- Requires C++ compilation or WASM port
- Pre-trained model: shape_predictor_68_face_landmarks.dat

**Pros:**
- Well-established, heavily cited in research
- Compact landmark set (68 points sufficient for shape classification)
- Boost license is permissive

**Cons:**
- 100MB+ model file
- No official WASM build — requires custom compilation
- Desktop-focused, no mobile optimization
- Slower inference than MediaPipe
- Community-maintained, less active development

**Verdict:** Viable but not recommended for web/mobile. Better for backend processing or native apps.

### 3. OpenCV + Haar Cascades

**How it works:**
- Haar cascade classifier for face detection
- Returns bounding box, not landmarks
- Would need to add landmark detection separately

**Pros:**
- Very fast (5ms)
- Small bundle
- Well-documented

**Cons:**
- No facial landmarks — can't determine face shape
- Only detects face location
- Would need DNN module for landmarks
- Not accurate enough for classification

**Verdict:** Insufficient for face shape classification. Only useful for face detection preprocessing.

---

## Implementation Plan

### Phase 1: MVP (Month 6)
1. Integrate MediaPipe FaceLandmarker via WASM
2. Build custom face shape classifier (6 shapes)
3. Map shapes to hair style recommendations:
   - Oval: Most styles work, emphasize versatility
   - Round: Long layers, side parts, height at crown
   - Square: Soft layers, waves, side-swept bangs
   - Heart: Chin-length bobs, side parts, volume at jaw
   - Diamond: Wide bangs, volume at temples
   - Oblong: Bangs, width at cheeks, chin-length cuts

### Phase 2: Enhanced (Month 8)
1. Add hair texture detection (fine/medium/coarse)
2. Add skin tone analysis (warm/cool/neutral undertone)
3. Combine face shape + skin tone for color recommendations
4. Add "Try It On" AR overlay using MediaPipe Face Mesh

### Phase 3: Advanced (Month 10)
1. Train custom ML model on labeled face shape dataset
2. Personalized recommendations based on client history
3. Collaborative filtering ("People with your face shape loved this style")

---

## Style Recommendation Matrix

| Face Shape | Best Cuts | Avoid | Best Colors | Avoid |
|-----------|-----------|-------|-------------|-------|
| Oval | Almost anything | Overly long (elongates) | Universal | — |
| Round | Long layers, asymmetrical, pixie | Chin-length bob, center part | Warm highlights, dimensional | Solid dark (flattens) |
| Square | Soft waves, side-swept bangs | Straight blunt cuts | Warm tones, caramel | Harsh platinum |
| Heart | Chin bob, side part, textured ends | Volume at temples, high pony | Cool tones, ash blonde | Warm reds at roots |
| Diamond | Wide bangs, cheek-volume | Flat slicked looks | Rich coppers, auburn | Washed-out pastels |
| Oblong | Bangs, chin-length, wide layers | Very long straight | Multi-tonal, highlights | Single flat color |

---

## Technical Dependencies

```json
{
  "@mediapipe/tasks-vision": "^0.10.x",
  "@mediapipe/face_mesh": "^0.4.x"
}
```

**Model file:** Download `face_landmarker.task` (~4.2MB) and serve from `/public/models/`

---

## Cost Estimate

| Item | Cost |
|------|------|
| MediaPipe WASM | Free (Apache 2.0) |
| Custom classifier development | 2-3 days engineering |
| Style recommendation mapping | 1 day with Eiza (domain expert) |
| AR overlay prototype | 3-5 days engineering |
| Custom ML training (Phase 3) | 1-2 weeks + GPU costs |

---

*Research by Iris (colorgenius-ceo) · Ready for Phase 2 implementation · Locked until consumer app development begins*