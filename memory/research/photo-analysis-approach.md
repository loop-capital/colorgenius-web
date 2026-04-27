# Photo Analysis Algorithm Research

## Executive Summary

Photo analysis for hair color/condition assessment is a specialized computer vision problem. No turnkey open-source solution exists for professional salon-grade analysis (color level 1–10, tone family, condition, porosity). The practical path is a **hybrid approach**: API-based vision model (OpenAI GPT-4o / Google Gemini) for rapid MVP, with on-device segmentation + regression as the medium-term target. A robust manual fallback must be available from Day 1 because lighting, phone-camera variance, and ethnic pigmentation make fully automated analysis unreliable without a large labeled dataset.

## 1. What We Need to Detect

| Attribute | Detail | Why It Matters |
|---|---|---|
| **Color Level** | 1 (black) → 10 (lightest blonde) | Determines developer volume and whether lightening is required |
| **Tone Family** | Warm, Cool, Neutral, Ash, Golden, Beige, Red, Copper, Violet, Blue | Determines which color family (ash, gold, violet, etc.) to select |
| **Hair Condition** | Healthy / Moderate / Damaged / Severely Damaged | Determines if lower developer, treatments, or postponing service is needed |
| **Porosity Indicators** | Cuticle lay-down, frizz, curl pattern openness, previous chemical damage | Determines color absorption rate and developer selection |
| **White/Grey %** | Approximate percentage | Determines if grey coverage formulations are needed |

## 2. Open-Source Tools & Libraries

### Hair Segmentation
Segmentation is the prerequisite step — isolate hair pixels before any color analysis.

| Tool | Approach | Notes |
|---|---|---|
| **BiSeNet / DeepLabV3** (PyTorch/TensorFlow) | Semantic segmentation (bilateral segmentation / atrous convolution) | General-purpose; needs fine-tuning on hair-specific datasets. Good backbone for on-device if distilled. |
| **U-Net** (various implementations) | Encoder-decoder segmentation | Proven for medical segmentation; works for hair if trained on Figaro or custom data. |
| **MediaPipe Hair Segmentation** (Google) | Lightweight on-device TF Lite model | **Best MVP option** — runs on mobile in real-time, provides a hair mask. Does NOT give color/level. |
| **MODNet / PortraitNet** | Portrait matting/segmentation | Can isolate hair as part of portrait; needs adaptation. |

### Pre-trained Color Classification Models

| Model | Classes | Accuracy | Source |
|---|---|---|---|
| `enzostvs/hair-color` (ViT-B/16) | black, blond, bald, red, white | 73.2% | Hugging Face |
| `justingrammens/hair-color` (ViT-B/16) | black, blonde, brown, grey, red | 59.1% | Hugging Face |
| `deepghs/anime_ch_hair_color` | anime character hair colors | N/A | Hugging Face — **not suitable for real hair** |

**Assessment:** These models are **insufficient** for professional use. They classify broad color categories (black vs. brown) but do not distinguish between Level 5 and Level 6, nor do they detect tone families (ash vs. golden). They are trained on web-scraped images with uncontrolled lighting and pose.

### Key Repositories

- `digital-nomad-cheng/Hair_Segmentation_Keras` — segmentation + color similarity calculation
- `Ys-sudo/hair-coloring-app` — uses MediaPipe segmentation for AR hair coloring
- `nganngants/hair-dye-web-app` — web-based hair dye simulation
- `Papich23691/Hair-Detection` — Mask R-CNN based hair detection

## 3. Computer Vision Approaches

### Option A: API-Based Vision Model (Fastest to MVP)

**Approach:** Send hair photo to a multimodal LLM (GPT-4o, Google Gemini, or Anthropic Claude) with a structured prompt asking for color level, tone, condition assessment, and porosity indicators.

**Pros:**
- Zero training data required
- Handles lighting variation better than simple classifiers
- Can provide natural-language reasoning
- Can be prompted to return structured JSON

**Cons:**
- Cost per image (~$0.005–$0.02)
- Latency (~1–3 seconds)
- Requires internet connectivity
- Not deterministic; prompt engineering required for consistency
- May hallucinate or be inconsistent across lighting conditions

**Prompt Strategy Example:**
```
You are a professional hair colorist. Analyze this hair photo under salon lighting.
Return ONLY a JSON object with these fields:
- color_level: integer 1-10 (1=black, 10=lightest blonde)
- tone_family: one of [warm, cool, neutral, ash, golden, beige, red, copper, violet, blue]
- underlying_pigment: one of [red-orange, orange, yellow-orange, yellow, pale yellow, none visible]
- condition: one of [healthy, moderate, damaged, severely_damaged]
- porosity: one of [low, normal, high, severely_high]
- white_percentage: integer 0-100
- confidence: low/medium/high
- reasoning: brief explanation
```

### Option B: On-Device Pipeline (Medium-Term)

**Pipeline:**
1. **Segmentation** → MediaPipe Hair Segmentation (TF Lite, runs on mobile)
2. **Color Analysis** → Extract median/average color from segmented hair region; convert to CIELAB color space
3. **Level Mapping** → Map CIELAB lightness (L*) to hair color level using a calibrated lookup table
4. **Tone Classification** → Train a small classifier (MobileNetV3 / EfficientNet-Lite) on segmented hair crops to classify tone family
5. **Condition/Health** → Train a separate classifier on texture features (entropy, edge detection, shine analysis)

**Pros:**
- Works offline
- Low latency (< 200ms on modern phones)
- Privacy-preserving (no photo leaves device)

**Cons:**
- Requires labeled training dataset (see Section 4)
- Needs calibration per device/lighting condition
- Complex engineering pipeline

### Option C: Cloud CV API + Custom Post-Processing

**Approach:** Use Google Cloud Vision or AWS Rekognition for base image analysis, then apply custom hair-specific post-processing.

**Assessment:** General-purpose vision APIs do not have hair-color-specific models. This is **not recommended** as a primary approach. The APIs can detect dominant colors but not map them to professional hair color levels.

## 4. Training Data Requirements

To build a salon-grade model, we need:

| Data Type | Quantity | Specification |
|---|---|---|
| **Labeled Hair Photos** | 5,000–10,000 | Professional salon photos with known level (1–10), tone, condition, porosity. Multiple angles per client. Consistent lighting or lighting-normalized. |
| **Segmentation Masks** | 5,000+ | Pixel-level hair masks for training segmentation model. Can use synthetic data or manual annotation. |
| **Multi-Lighting Photos** | 2,000+ | Same hair under different lighting (daylight, salon, flash, dim) to build robustness. |
| **Ethnic Diversity** | Proportional | Ensure representation across Asian, African, Hispanic, Caucasian hair types and pigment levels. |
| **Before/After Pairs** | 2,000+ | To validate level prediction accuracy against actual formulation outcomes. |

### Data Sources
- **Internal:** Partner with Jason's wife's salon and 2–3 other salons to collect photos with stylist annotations
- **Synthetic:** Use 3D hair rendering (e.g., USC HairSim, Blender hair systems) to generate labeled training data
- **Existing Datasets:**
  - **Figaro 1K** — hair segmentation dataset (1,000 images with masks)
  - **LFW (Labeled Faces in the Wild)** — contains hair but not color labels
  - **CelebA** — celebrity faces with 40 attribute labels including hair color (broad categories only)

## 5. Fallback Approach: Colorist-Driven Manual Input

**This is REQUIRED from Day 1.** Automated photo analysis should be treated as a convenience feature, not a dependency.

### Manual Input UI Design

| Field | Input Type | Options |
|---|---|---|
| **Current Level** | Slider or picker | 1–10 with visual swatches |
| **Current Tone** | Multi-select or chips | Warm, Cool, Neutral, Ash, Golden, Beige, Red, Copper, Violet, Blue |
| **Hair Condition** | Segmented control | Healthy, Moderate, Damaged, Severely Damaged |
| **Porosity** | Segmented control | Low, Normal, High |
| **Previous Treatments** | Checkboxes | None, Color, Highlights, Balayage, Bleach, Relaxer, Keratin, Perm |
| **White/Grey %** | Slider | 0%, 25%, 50%, 75%, 100% |
| **Photo Upload** | Optional | "Upload a photo for AI-assisted analysis (beta)" |

### AI-Assisted Fallback
When a photo is uploaded:
1. If AI analysis succeeds with `confidence: high` → pre-populate manual fields, let stylist confirm/edit
2. If AI analysis returns `confidence: low` → show the photo alongside empty manual fields with a tooltip: "AI analysis was uncertain. Please enter details manually."
3. Always allow stylist to override any AI-suggested value

### Benefits of Fallback
- Ensures app works even without photos
- Builds trust with stylists (they remain in control)
- Provides ground-truth data for improving the AI model over time (stylist corrections = labeled training data)

## 6. Recommended Implementation Path

### Phase 1: MVP (Weeks 1–2)
- Build manual input UI as primary path
- Add **optional** photo upload that calls OpenAI GPT-4o Vision with structured prompt
- Use AI response to pre-populate manual fields; stylist confirms
- Collect photos + confirmed manual inputs into a training dataset

### Phase 2: Enhanced AI (Weeks 3–6)
- Train a lightweight segmentation model (MediaPipe or custom U-Net) using collected data
- Implement CIELAB-based color level mapping from segmented hair regions
- Add a tone classifier (MobileNetV3) trained on collected data
- Move processing to on-device where possible (TensorFlow Lite / Core ML)

### Phase 3: Full Automation (Months 3–6)
- Expand training dataset to 10,000+ labeled photos
- Fine-tune a multimodal model or custom vision transformer on hair-specific data
- Add condition/health classification based on texture analysis
- Validate accuracy against salon outcomes; target >90% first-try match

## 7. Technical Stack Recommendations

| Component | MVP | Medium-Term |
|---|---|---|
| **Photo Upload** | React Native Image Picker / Web `<input type="file">` | Same |
| **Segmentation** | MediaPipe Hair Segmentation (client-side) | Custom U-Net or BiSeNet (TF Lite / Core ML) |
| **Color Analysis** | OpenAI GPT-4o Vision API | On-device CIELAB mapping + MobileNetV3 tone classifier |
| **Level Mapping** | API-based with prompt engineering | Calibrated CIELAB L* → level lookup table |
| **Storage** | S3 / Cloud Storage with presigned URLs | Same |
| **Training Pipeline** | Collect data manually; use Google Colab / Vertex AI | AWS SageMaker or GCP Vertex AI |

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Poor lighting in client photos | AI misclassifies level/tone | Require photo guidelines (natural light, no filters); use multiple angles; fallback to manual input |
| Phone camera color variance | Color inconsistency | Normalize to sRGB; use relative analysis (compare to known swatches) rather than absolute color |
| Lack of training data | Model never improves | Prioritize manual input collection; partner with salons from Day 1; offer free tool in exchange for data |
| API costs scale with users | Unsustainable unit economics | Plan for on-device migration by Phase 2; set photo analysis limits in early pricing tiers |
| Ethnic hair pigmentation bias | Model underperforms on darker hair types | Ensure diverse dataset; specifically validate on Type 3 and Type 4 hair |

## 9. Key References

- Ileni, T.A., Borza, D.L., Darabant, A.S. (2018). *A Deep Learning Approach to Hair Segmentation and Color Extraction from Facial Images*. Springer.
- Ileni, T.A. et al. (2019). *Fast In-the-Wild Hair Segmentation and Color Classification*. VISIGRAPP.
- Bokaris, P.A. et al. (2019). *Hair Tone Estimation at Roots via Imaging Device with Embedded Deep Learning*. Electronic Imaging.
- MediaPipe Hair Segmentation: https://developers.google.com/mediapipe/solutions/vision/hair_segmenter
- Hugging Face Hair Color Models: https://huggingface.co/models?pipeline_tag=image-classification&search=hair+color

---
*Research completed: 2026-04-25*
*Next steps: Build manual input UI; integrate GPT-4o Vision as optional photo analysis; begin data collection at partner salons.*
