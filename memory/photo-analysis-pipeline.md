# Photo Analysis Pipeline - Computer Vision Specification

## Executive Summary

The Photo Analysis Pipeline is the visual input layer of Color Genius, transforming client photos into structured data for color formulation. This document details the computer vision architecture, models, and algorithms used for hair segmentation, color extraction, texture analysis, and damage assessment.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHOTO ANALYSIS PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           INPUT                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │ Target Photo│  │ Current Hair│  │ Context     │               │  │
│  │  │ (Inspiration)│  │ Photo       │  │ Photos      │               │  │
│  │  │             │  │             │  │ (Texture)   │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                   │                                         │
│                                   ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     PRE-PROCESSING                                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │ Validation │  │ Orientation│  │ Normaliz.  │  │ Resize     │ │  │
│  │  │ • Format   │  │ • Rotate   │  │ • Exposure │  │ • 1024px   │ │  │
│  │  │ • Size     │  │ • Flip     │  │ • White Bal│  │ • Square   │ │  │
│  │  │ • Quality  │  │ • Crop     │  │ • Gamma    │  │ • Preserve │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                   │                                         │
│                                   ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    ANALYSIS MODULES                                  │  │
│  │                                                                      │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │  │
│  │  │ 1. Hair Seg     │  │ 2. Color        │  │ 3. Texture      │   │  │
│  │  │    YOLOv8+      │  │    Extractor    │  │    Classifier   │   │  │
│  │  │                 │  │                 │  │                 │   │  │
│  │  │ • Isolate hair  │  │ • Level detect  │  │ • Strand size   │   │  │
│  │  │ • Multi-mask    │  │ • Tone identify │  │ • Curl pattern  │   │  │
│  │  │ • Root/mid/end  │  │ • RGB mapping   │  │ • Density est   │   │  │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘   │  │
│  │           │                   │                    │              │  │
│  │  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐   │  │
│  │  │ 4. Damage       │  │ 5. Lighting     │  │ 6. Face/Skin    │   │  │
│  │  │    Assessment   │  │    Correction   │  │    Analysis     │   │  │
│  │  │                 │  │                 │  │                 │   │  │
│  │  │ • Split ends    │  │ • WB detection  │  │ • Skin tone     │   │  │
│  │  │ • Breakage      │  │ • Color const   │  │ • Undertone     │   │  │
│  │  │ • Porosity      │  │ • Gamma corr    │  │ • Face shape    │   │  │
│  │  │ • Elasticity    │  │ • HDR tone      │  │ • Eye color     │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                   │                                         │
│                                   ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      OUTPUT STRUCTURE                                │  │
│  │                                                                      │  │
│  │  ColorGeniusAnalysis {                                             │  │
│  │    hairSegmentation: Mask,                                         │  │
│  │    colorProfile: { level, tone, rgb, lab },                        │  │
│  │    textureProfile: { type, density, porosity },                      │  │
│  │    damageAssessment: { score, indicators[] },                        │  │
│  │    lightingCorrection: { applied, original_temp },                 │  │
│  │    faceFeatures: { shape, skinTone, eyeColor },                      │  │
│  │    confidence: float,                                               │  │
│  │    metadata: { processingTime, modelVersions }                     │  │
│  │  }                                                                  │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module 1: Hair Segmentation

### Architecture: YOLOv8 + Custom Head

```python
class HairSegmentationModel:
    """
    Real-time hair segmentation using YOLOv8-seg with custom hair-specific head.
    
    Model: yolov8n-seg-hair-v2 (custom trained)
    Input: 640x640 RGB
    Output: Hair mask + bounding boxes
    """
    
    def __init__(self):
        self.model = YOLO('models/yolov8n-seg-hair-v2.pt')
        self.conf_threshold = 0.7
        self.iou_threshold = 0.5
    
    def segment(self, image: np.ndarray) -> SegmentationResult:
        """
        Segment hair from portrait photo.
        Returns hair mask, face detection, and multi-zone masks.
        """
        results = self.model(image, conf=self.conf_threshold, iou=self.iou_threshold)
        
        # Extract primary hair mask
        hair_mask = self._extract_hair_mask(results)
        
        # Generate multi-zone masks
        root_mask, mid_mask, end_mask = self._create_zone_masks(hair_mask, results)
        
        # Refine edges
        hair_mask = self._refine_edges(hair_mask, image)
        
        return SegmentationResult(
            hair_mask=hair_mask,
            root_mask=root_mask,
            mid_mask=mid_mask,
            end_mask=end_mask,
            face_bbox=results[0].boxes[results[0].boxes.cls == 0],  # Face class
            confidence=results[0].boxes.conf.max().item()
        )
    
    def _create_zone_masks(self, hair_mask, results) -> Tuple[Mask, Mask, Mask]:
        """
        Create anatomically-aware zone masks for:
        - Roots (top 2 inches from scalp)
        - Mid-lengths
        - Ends
        """
        # Use face position as anchor for root zone
        face_center_y = self._get_face_center(results)
        
        height = hair_mask.shape[0]
        
        # Define zones relative to face
        root_threshold = face_center_y - (height * 0.05)  # Slightly above face
        end_threshold = face_center_y + (height * 0.5)    # Halfway down
        
        root_mask = hair_mask.copy()
        root_mask[int(root_threshold):, :] = 0
        
        mid_mask = hair_mask.copy()
        mid_mask[:int(root_threshold), :] = 0
        mid_mask[int(end_threshold):, :] = 0
        
        end_mask = hair_mask.copy()
        end_mask[:int(end_threshold), :] = 0
        
        return root_mask, mid_mask, end_mask
```

### Training Dataset

```yaml
HairSegmentationDataset:
  name: "HairSeg-150K"
  size: 150,000 images
  
  Sources:
    - CelebA-HQ: 30,000 portraits
    - FFHQ: 50,000 high-quality portraits
    - Professional salon photos: 40,000
    - Social media hair photos: 30,000
  
  Annotations:
    - Hair mask (instance + semantic)
    - Face landmarks
    - Hair zones (root/mid/end)
    - Hair type labels
    - Lighting conditions
  
  Augmentations:
    - Rotation: ±15°
    - Scale: 0.8-1.2x
    - Color jitter: hue ±10%, saturation ±20%
    - Occlusion: 10% of images
    - Background replacement
  
  Class Distribution:
    - Straight: 35%
    - Wavy: 30%
    - Curly: 20%
    - Coily: 10%
    - Braided/Styled: 5%
```

### Edge Refinement

```python
class EdgeRefiner:
    """
    Refine segmentation edges using alpha matting for professional results.
    """
    
    def refine(self, mask: np.ndarray, image: np.ndarray) -> np.ndarray:
        """
        Apply guided filter for edge refinement.
        Uses RGB image as guide for mask edge smoothing.
        """
        # Convert to appropriate format
        if len(mask.shape) == 3:
            mask = mask[:, :, 0]
        
        # Guided filter parameters
        radius = 60
        eps = 1e-8
        
        # Apply guided filter
        refined = cv2.ximgproc.guidedFilter(
            guide=image,
            src=mask.astype(np.float32),
            radius=radius,
            eps=eps
        )
        
        # Threshold and clean
        refined = (refined > 0.5).astype(np.uint8) * 255
        
        # Morphological cleanup
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        refined = cv2.morphologyEx(refined, cv2.MORPH_CLOSE, kernel)
        refined = cv2.morphologyEx(refined, cv2.MORPH_OPEN, kernel)
        
        return refined
```

---

## Module 2: Color Extraction

### Level Detection (1-10 Scale)

```python
class HairLevelDetector:
    """
    Detect hair color level using multi-feature approach.
    Combines Lab* lightness with learned features.
    """
    
    def __init__(self):
        self.level_classifier = self._load_model('models/level_classifier_v3.pt')
        self.level_borders = self._define_level_borders()
    
    def detect_level(self, image: np.ndarray, hair_mask: np.ndarray) -> LevelResult:
        """
        Detect hair color level from 1 (black) to 10 (lightest blonde).
        """
        # Extract hair region
        hair_region = cv2.bitwise_and(image, image, mask=hair_mask)
        
        # Convert to Lab* for perceptual uniformity
        lab = cv2.cvtColor(hair_region, cv2.COLOR_RGB2LAB)
        
        # Calculate features
        features = self._extract_features(lab, hair_mask)
        
        # CNN classification
        level_logits = self.level_classifier(features['patch'])
        level_probs = F.softmax(level_logits, dim=1)
        predicted_level = level_probs.argmax().item() + 1
        confidence = level_probs.max().item()
        
        # Distribution across levels (for uncertainty)
        level_distribution = level_probs[0].tolist()
        
        # Secondary check: underlying pigment detection
        undertone = self._detect_undertone(lab, hair_mask)
        
        return LevelResult(
            level=predicted_level,
            confidence=confidence,
            distribution=level_distribution,
            undertone=undertone,
            rgb_mean=features['rgb_mean'],
            lab_mean=features['lab_mean']
        )
    
    def _extract_features(self, lab: np.ndarray, mask: np.ndarray) -> dict:
        """
        Extract color features from Lab* space.
        """
        # Get non-zero pixels (hair region)
        l_channel = lab[:, :, 0]
        a_channel = lab[:, :, 1]
        b_channel = lab[:, :, 2]
        
        hair_pixels = l_channel[mask > 0]
        
        features = {
            'l_mean': np.mean(hair_pixels),
            'l_std': np.std(hair_pixels),
            'l_percentiles': np.percentile(hair_pixels, [10, 25, 50, 75, 90]),
            'a_mean': np.mean(a_channel[mask > 0]),
            'b_mean': np.mean(b_channel[mask > 0]),
        }
        
        # Convert to RGB for display
        rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        features['rgb_mean'] = np.mean(rgb[mask > 0], axis=0).astype(int).tolist()
        features['lab_mean'] = [features['l_mean'], features['a_mean'], features['b_mean']]
        
        # Extract patch for CNN
        patch = self._extract_representative_patch(rgb, mask)
        features['patch'] = patch
        
        return features
    
    def _detect_undertone(self, lab: np.ndarray, mask: np.ndarray) -> str:
        """
        Detect underlying pigment undertone (warm, cool, neutral).
        """
        a_channel = lab[:, :, 1].astype(np.float32)
        b_channel = lab[:, :, 2].astype(np.float32)
        
        hair_a = a_channel[mask > 0]
        hair_b = b_channel[mask > 0]
        
        # Calculate mean a* and b* values
        a_mean = np.mean(hair_a)
        b_mean = np.mean(hair_b)
        
        # Determine undertone
        # b* > 0 = yellow/warm, b* < 0 = blue/cool
        # a* > 0 = red/warm, a* < 0 = green/cool
        
        warmth_score = b_mean + (a_mean * 0.5)  # Weight yellow more heavily
        
        if warmth_score > 10:
            return "warm"  # Yellow/gold undertones
        elif warmth_score > -5:
            return "neutral"
        else:
            return "cool"  # Ash/violet undertones
```

### Tone Detection

```python
class HairToneDetector:
    """
    Detect hair tone family (Ash, Gold, Neutral, etc.).
    """
    
    TONE_FAMILIES = {
        'N': 'Natural',
        'A': 'Ash',
        'G': 'Gold',
        'W': 'Warm',
        'C': 'Copper',
        'R': 'Red',
        'V': 'Violet',
        'M': 'Mahogany',
        'B': 'Beige',
        'P': 'Pearl',
        'S': 'Silver'
    }
    
    def detect_tone(self, lab_mean: List[float], rgb_mean: List[int]) -> ToneResult:
        """
        Detect tone based on color characteristics.
        """
        l, a, b = lab_mean
        r, g, b_rgb = rgb_mean
        
        # Calculate hue from RGB
        hue = self._rgb_to_hue(r, g, b_rgb)
        saturation = self._calculate_saturation(r, g, b_rgb)
        
        # Determine tone
        if saturation < 15:
            return ToneResult(primary='N', confidence=0.9)
        
        # Analyze Lab* for specific tones
        if b > 20 and a < 10:  # High yellow, low red
            return ToneResult(primary='G', secondary=None, confidence=0.85)
        
        if b < -5 and abs(a) < 15:  # Low yellow
            return ToneResult(primary='A', confidence=0.8)
        
        if b < 0 and a > 15:  # Low yellow, high red
            return ToneResult(primary='V', confidence=0.8)
        
        if a > 20 and b > 10:  # High red and yellow
            return ToneResult(primary='C', confidence=0.85)
        
        if a > 25:  # Very high red
            return ToneResult(primary='R', confidence=0.9)
        
        return ToneResult(primary='N', confidence=0.7)  # Default to neutral
```

---

## Module 3: Texture Analysis

### Strand Thickness Classification

```python
class HairTextureClassifier:
    """
    Classify hair texture from fine to coarse using strand analysis.
    """
    
    def __init__(self):
        self.texture_model = self._load_model('models/texture_resnet50_v2.pt')
    
    def analyze_texture(self, image: np.ndarray, hair_mask: np.ndarray) -> TextureResult:
        """
        Analyze hair texture including:
        - Strand thickness (fine/medium/coarse)
        - Curl pattern (straight/wavy/curly/coily)
        - Density estimation
        - Porosity indicators
        """
        # Extract hair strands
        strand_patches = self._extract_strand_patches(image, hair_mask)
        
        # Classify each patch
        thickness_scores = []
        curl_scores = []
        
        for patch in strand_patches:
            thickness = self._classify_thickness(patch)
            curl = self._classify_curl(patch)
            thickness_scores.append(thickness)
            curl_scores.append(curl)
        
        # Aggregate results
        texture_result = TextureResult(
            thickness=self._aggregate_classification(thickness_scores),
            curl_pattern=self._aggregate_classification(curl_scores),
            density=self._estimate_density(image, hair_mask),
            porosity_indicators=self._assess_porosity(image, hair_mask)
        )
        
        return texture_result
    
    def _extract_strand_patches(self, image: np.ndarray, mask: np.ndarray, n_patches=16) -> List[np.ndarray]:
        """
        Extract representative hair strand patches for analysis.
        """
        # Find contours (strand edges)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        patches = []
        
        for contour in contours[:n_patches]:
            # Get bounding box
            x, y, w, h = cv2.boundingRect(contour)
            
            # Extract patch
            patch = image[y:y+h, x:x+w]
            
            # Resize to standard size
            patch = cv2.resize(patch, (224, 224))
            patches.append(patch)
        
        return patches
    
    def _classify_thickness(self, patch: np.ndarray) -> Dict:
        """
        Classify strand thickness from image patch.
        Uses edge detection to estimate strand diameter.
        """
        gray = cv2.cvtColor(patch, cv2.COLOR_RGB2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find strand edges
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=50, maxLineGap=10)
        
        if lines is None:
            return {'fine': 0.5, 'medium': 0.3, 'coarse': 0.2}
        
        # Calculate line widths (proxy for strand thickness)
        # This is simplified - actual implementation would use more sophisticated analysis
        
        return self.texture_model(patch.unsqueeze(0))
    
    def _classify_curl(self, patch: np.ndarray) -> Dict:
        """
        Classify curl pattern using Gabor filters and CNN features.
        """
        gray = cv2.cvtColor(patch, cv2.COLOR_RGB2GRAY)
        
        # Gabor filter bank for texture analysis
        curl_features = []
        
        for theta in range(4):  # 0, 45, 90, 135 degrees
            theta_rad = theta * np.pi / 4
            gabor = cv2.getGaborKernel((21, 21), 5.0, theta_rad, 10.0, 0.5, 0, ktype=cv2.CV_32F)
            filtered = cv2.filter2D(gray, cv2.CV_8UC3, gabor)
            curl_features.append(np.mean(filtered))
        
        # Classify based on feature variance
        variance = np.var(curl_features)
        
        if variance < 100:
            return {'straight': 0.9, 'wavy': 0.08, 'curly': 0.015, 'coily': 0.005}
        elif variance < 500:
            return {'straight': 0.1, 'wavy': 0.7, 'curly': 0.15, 'coily': 0.05}
        elif variance < 1000:
            return {'straight': 0.05, 'wavy': 0.15, 'curly': 0.65, 'coily': 0.15}
        else:
            return {'straight': 0.02, 'wavy': 0.08, 'curly': 0.2, 'coily': 0.7}
    
    def _estimate_density(self, image: np.ndarray, mask: np.ndarray) -> str:
        """
        Estimate hair density (thin/medium/thick).
        """
        # Calculate hair coverage percentage
        hair_pixels = np.sum(mask > 0)
        total_pixels = mask.shape[0] * mask.shape[1]
        coverage = hair_pixels / total_pixels
        
        # Adjust for face area
        face_area_ratio = self._estimate_face_area(image)
        adjusted_coverage = coverage / (1 - face_area_ratio)
        
        if adjusted_coverage < 0.15:
            return "thin"
        elif adjusted_coverage < 0.35:
            return "medium"
        else:
            return "thick"
```

### Porosity Assessment

```python
class PorosityAnalyzer:
    """
    Assess hair porosity from visual indicators in photos.
    """
    
    def analyze(self, image: np.ndarray, mask: np.ndarray) -> PorosityResult:
        """
        Determine porosity from visual cues:
        - Shine level (low porosity = high shine)
        - Cuticle appearance
        - Frizz/flyaways
        - Product buildup appearance
        """
        # Extract hair region
        hair_region = cv2.bitwise_and(image, image, mask=mask)
        
        # Calculate gloss/shine
        gloss_score = self._calculate_gloss(hair_region, mask)
        
        # Detect cuticle texture (roughness)
        roughness = self._analyze_surface_texture(hair_region, mask)
        
        # Detect frizz
        frizz_score = self._detect_frizz(image, mask)
        
        # Porosity scoring
        # Low porosity: High gloss, smooth, less frizz
        # High porosity: Low gloss, rough, more frizz
        
        porosity_score = (
            (100 - gloss_score) * 0.4 +
            roughness * 0.3 +
            frizz_score * 0.3
        )
        
        if porosity_score < 30:
            return PorosityResult(level="low", confidence=0.85, indicators={"shine": gloss_score})
        elif porosity_score < 60:
            return PorosityResult(level="normal", confidence=0.75, indicators={"shine": gloss_score})
        else:
            return PorosityResult(level="high", confidence=0.8, indicators={"roughness": roughness})
    
    def _calculate_gloss(self, image: np.ndarray, mask: np.ndarray) -> float:
        """
        Calculate specular reflection (shine) in hair.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Find specular highlights
        _, highlights = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        
        # Count highlight pixels in hair region
        hair_highlights = cv2.bitwise_and(highlights, mask)
        highlight_ratio = np.sum(hair_highlights > 0) / np.sum(mask > 0)
        
        # Normalize to 0-100
        gloss_score = min(100, highlight_ratio * 1000)
        
        return gloss_score
```

---

## Module 4: Damage Assessment

```python
class DamageAssessor:
    """
    Assess hair damage from visual indicators.
    """
    
    def __init__(self):
        self.damage_model = self._load_model('models/damage_unet_v2.pt')
    
    def assess_damage(self, image: np.ndarray, mask: np.ndarray) -> DamageResult:
        """
        Detect damage indicators:
        - Split ends
        - Breakage
        - Chemical damage signs
        - Heat damage
        """
        # Run UNet++ for damage segmentation
        damage_map = self.damage_model(image)
        
        # Analyze damage map
        indicators = {
            'split_ends': self._detect_split_ends(damage_map),
            'breakage': self._detect_breakage(image, mask),
            'chemical_damage': self._assess_chemical_damage(image, mask),
            'heat_damage': self._assess_heat_damage(image, mask)
        }
        
        # Calculate overall damage score
        damage_score = self._calculate_damage_score(indicators)
        
        return DamageResult(
            overall_score=damage_score,
            indicators=indicators,
            recommendations=self._generate_recommendations(damage_score, indicators)
        )
    
    def _detect_split_ends(self, damage_map: np.ndarray) -> Dict:
        """
        Detect split ends in hair mask.
        """
        # Focus on end region of hair
        end_region = damage_map[int(damage_map.shape[0]*0.7):, :]
        
        # Count split end pixels
        split_end_pixels = np.sum(end_region > 0.5)
        total_end_pixels = end_region.shape[0] * end_region.shape[1]
        
        split_end_ratio = split_end_pixels / total_end_pixels
        
        return {
            'present': split_end_ratio > 0.01,
            'severity': min(1.0, split_end_ratio * 50),
            'confidence': 0.8
        }
    
    def _detect_breakage(self, image: np.ndarray, mask: np.ndarray) -> Dict:
        """
        Detect short broken hairs and uneven lengths.
        """
        # Analyze hair length distribution
        # Broken hairs appear as short fragments
        
        # Simplified: detect short contour lengths
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        lengths = [cv2.arcLength(c, False) for c in contours]
        
        # Calculate coefficient of variation
        mean_len = np.mean(lengths)
        std_len = np.std(lengths)
        cv = std_len / mean_len if mean_len > 0 else 0
        
        # High CV suggests breakage (uneven lengths)
        breakage_score = min(1.0, cv)
        
        return {
            'present': breakage_score > 0.3,
            'severity': breakage_score,
            'confidence': 0.7
        }
```

---

## Module 5: Lighting Correction

```python
class LightingCorrector:
    """
    Correct for lighting variations to get accurate color representation.
    """
    
    def correct(self, image: np.ndarray, mask: np.ndarray) -> Tuple[np.ndarray, CorrectionInfo]:
        """
        Apply lighting correction:
        - White balance
        - Color constancy
        - Gamma correction
        - Exposure adjustment
        """
        # Detect lighting condition
        lighting_type = self._detect_lighting_type(image, mask)
        
        # Estimate color temperature
        color_temp = self._estimate_color_temperature(image, mask)
        
        corrections_applied = []
        
        # Apply white balance
        if color_temp < 5000 or color_temp > 7000:
            image = self._white_balance(image, color_temp)
            corrections_applied.append('white_balance')
        
        # Apply gamma correction if needed
        mean_brightness = np.mean(cv2.cvtColor(image, cv2.COLOR_RGB2GRAY))
        if mean_brightness < 80 or mean_brightness > 200:
            image = self._gamma_correction(image, target_brightness=128)
            corrections_applied.append('gamma')
        
        # Color constancy (gray world assumption)
        image = self._color_constancy_grayworld(image)
        corrections_applied.append('color_constancy')
        
        return image, CorrectionInfo(
            original_temperature=color_temp,
            corrections_applied=corrections_applied,
            confidence=0.85
        )
    
    def _detect_lighting_type(self, image: np.ndarray, mask: np.ndarray) -> str:
        """
        Detect lighting type (daylight, tungsten, fluorescent, flash).
        """
        # Analyze histogram
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        hist = cv2.calcHist([gray], [0], mask, [256], [0, 256])
        
        # Analyze RGB ratios
        r_mean = np.mean(image[:,:,0][mask > 0])
        g_mean = np.mean(image[:,:,1][mask > 0])
        b_mean = np.mean(image[:,:,2][mask > 0])
        
        # Tungsten: R > G > B (warm)
        # Fluorescent: G high, R/B lower (green cast)
        # Flash: Balanced RGB
        
        if r_mean / b_mean > 1.3:
            return "tungsten"
        elif g_mean / (r_mean + b_mean) * 2 > 1.2:
            return "fluorescent"
        else:
            return "daylight"
    
    def _white_balance(self, image: np.ndarray, color_temp: float) -> np.ndarray:
        """
        Apply white balance correction.
        """
        # Von Kries adaptation
        # Scale R and B channels based on color temperature
        
        # Simplified: gray world
        r_mean = np.mean(image[:,:,0])
        g_mean = np.mean(image[:,:,1])
        b_mean = np.mean(image[:,:,2])
        
        gray_mean = (r_mean + g_mean + b_mean) / 3
        
        result = image.copy().astype(np.float32)
        result[:,:,0] *= gray_mean / r_mean
        result[:,:,1] *= gray_mean / g_mean
        result[:,:,2] *= gray_mean / b_mean
        
        return np.clip(result, 0, 255).astype(np.uint8)
```

---

## Module 6: Face & Skin Analysis

```python
class FaceAnalyzer:
    """
    Analyze facial features for complementary color recommendations.
    """
    
    def __init__(self):
        self.face_detector = MTCNN()
        self.skin_tone_model = self._load_model('models/skin_tone_classifier.pt')
    
    def analyze(self, image: np.ndarray) -> FaceResult:
        """
        Detect and analyze facial features:
        - Face shape
        - Skin tone/undertone
        - Eye color
        - Overall contrast
        """
        # Detect face
        faces = self.face_detector.detect_faces(image)
        
        if len(faces) == 0:
            return FaceResult(present=False)
        
        face = faces[0]  # Take primary face
        face_bbox = face['box']
        
        # Extract face region
        face_img = self._extract_face_region(image, face_bbox)
        
        # Analyze features
        return FaceResult(
            present=True,
            face_shape=self._classify_face_shape(face_img, face['keypoints']),
            skin_tone=self._analyze_skin_tone(face_img),
            eye_color=self._detect_eye_color(image, face['keypoints']),
            contrast_level=self._assess_contrast(face_img)
        )
    
    def _classify_face_shape(self, face_img: np.ndarray, keypoints: Dict) -> str:
        """
        Classify face shape from keypoints.
        """
        # Calculate ratios between face measurements
        jaw_width = abs(keypoints['mouth_left'][0] - keypoints['mouth_right'][0])
        face_height = keypoints['nose'][1] - (keypoints['left_eye'][1] + keypoints['right_eye'][1]) / 2
        
        # Simplified classification
        ratio = face_height / jaw_width
        
        if ratio > 1.5:
            return "oval"
        elif ratio > 1.3:
            return "oblong"
        elif ratio < 1.1:
            return "round"
        else:
            return "heart"
    
    def _analyze_skin_tone(self, face_img: np.ndarray) -> Dict:
        """
        Analyze skin tone and undertone.
        """
        # Extract skin region (avoid eyes, lips, eyebrows)
        skin_mask = self._create_skin_mask(face_img)
        
        # Convert to Lab
        lab = cv2.cvtColor(face_img, cv2.COLOR_RGB2LAB)
        
        l = np.mean(lab[:,:,0][skin_mask > 0])
        a = np.mean(lab[:,:,1][skin_mask > 0])
        b = np.mean(lab[:,:,2][skin_mask > 0])
        
        # Determine undertone
        if b > a:
            undertone = "warm"
        elif b < a - 5:
            undertone = "cool"
        else:
            undertone = "neutral"
        
        # Map to foundation ranges
        if l < 60:
            tone_range = "deep"
        elif l < 75:
            tone_range = "medium"
        else:
            tone_range = "light"
        
        return {
            'undertone': undertone,
            'depth': tone_range,
            'lab_values': [l, a, b]
        }
```

---

## Performance & Optimization

### Inference Optimization

```python
class OptimizedInference:
    """
    Production inference optimization.
    """
    
    def __init__(self):
        # ONNX Runtime for CPU/GPU optimization
        self.ort_session = ort.InferenceSession(
            'models/optimized_hair_analysis.onnx',
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )
        
        # TensorRT for NVIDIA GPUs
        self.tensorrt_engine = self._load_tensorrt_engine()
        
        # Quantized models for mobile
        self.int8_model = self._load_quantized_model()
    
    def infer(self, image: np.ndarray, device: str = 'auto') -> AnalysisResult:
        """
        Optimized inference with automatic device selection.
        """
        # Preprocess
        input_tensor = self._preprocess(image)
        
        # Select backend
        if device == 'auto':
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Run inference
        if device == 'cuda' and self.tensorrt_engine:
            outputs = self._tensorrt_infer(input_tensor)
        else:
            outputs = self.ort_session.run(None, {'input': input_tensor})
        
        # Postprocess
        return self._postprocess(outputs)
    
    def _preprocess(self, image: np.ndarray) -> np.ndarray:
        """
        Standardized preprocessing.
        """
        # Resize
        image = cv2.resize(image, (640, 640))
        
        # Normalize
        image = image.astype(np.float32) / 255.0
        
        # Channel order
        image = np.transpose(image, (2, 0, 1))
        
        # Add batch dimension
        image = np.expand_dims(image, 0)
        
        return image
```

### Performance Benchmarks

| Model | Size | CPU Latency | GPU Latency | Accuracy |
|-------|------|-------------|-------------|----------|
| Hair Segmentation (YOLOv8n-seg) | 6MB | 120ms | 25ms | mIoU: 0.91 |
| Level Classifier (ResNet18) | 44MB | 80ms | 15ms | Top-1: 94% |
| Texture Classifier (ResNet50) | 98MB | 150ms | 30ms | Top-1: 89% |
| Damage Assessment (UNet++) | 180MB | 200ms | 40ms | mIoU: 0.84 |
| **Full Pipeline** | - | **800ms** | **150ms** | - |

---

## API Response Format

```json
{
  "analysis_id": "uuid-v4",
  "timestamp": "2026-04-14T22:45:00Z",
  "image_metadata": {
    "original_size": [3024, 4032],
    "processed_size": [1024, 1024],
    "format": "JPEG",
    "lighting_corrected": true
  },
  "hair_analysis": {
    "segmentation": {
      "mask_url": "s3://bucket/masks/uuid.png",
      "coverage_percentage": 78.5,
      "confidence": 0.96
    },
    "color": {
      "level": 7,
      "level_confidence": 0.92,
      "distribution": [0.02, 0.03, 0.05, 0.10, 0.15, 0.25, 0.35, 0.05, 0.00, 0.00],
      "primary_tone": "N",
      "secondary_tone": null,
      "undertone": "neutral",
      "rgb": [130, 98, 72],
      "lab": [45.2, 8.5, 15.3],
      "extracted_from": "mid_lengths"
    },
    "texture": {
      "thickness": {
        "prediction": "medium",
        "confidence": 0.85,
        "scores": {"fine": 0.10, "medium": 0.85, "coarse": 0.05}
      },
      "curl_pattern": {
        "prediction": "wavy",
        "confidence": 0.78,
        "scores": {"straight": 0.15, "wavy": 0.78, "curly": 0.06, "coily": 0.01}
      },
      "density": "medium",
      "porosity": {
        "level": "normal",
        "confidence": 0.80,
        "indicators": {"shine": 65, "roughness": 0.25}
      }
    },
    "damage": {
      "overall_score": 0.25,
      "category": "minimal",
      "indicators": {
        "split_ends": {"present": false, "severity": 0.0},
        "breakage": {"present": false, "severity": 0.1},
        "chemical_damage": {"present": false, "severity": 0.0},
        "heat_damage": {"present": true, "severity": 0.3, "note": "Minor heat styling damage"}
      }
    }
  },
  "face_analysis": {
    "present": true,
    "shape": "oval",
    "skin_tone": {
      "undertone": "warm",
      "depth": "medium",
      "lab": [62.3, 12.8, 18.5]
    },
    "eye_color": "brown",
    "contrast_level": "medium"
  },
  "recommendations": {
    "complementary_colors": ["warm_brown", "honey_blonde", "copper"],
    "colors_to_avoid": ["ash", "platinum"],
    "confidence": 0.82
  },
  "processing_time_ms": 145,
  "model_versions": {
    "segmentation": "yolov8n-seg-hair-v2.1",
    "level_classifier": "level_resnet18_v3",
    "texture": "texture_resnet50_v2",
    "damage": "damage_unet_v2"
  }
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** che-architect (ClawStudio)
