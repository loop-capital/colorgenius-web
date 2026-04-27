"""
Main Hair Analyzer.

Orchestrates all hair analysis modules for complete photo-based analysis.
"""

from __future__ import annotations

from typing import Optional, List
import time
import numpy as np

try:
    from PIL import Image

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

from colorgenius.engine.hair_analysis.models import (
    HairAnalysisResult,
    LevelAnalysisResult,
    ToneAnalysisResult,
    TextureAnalysisResult,
    DamageAnalysisResult,
    ColorExtractionResult,
    HairTexture,
    HairDensity,
    HairPorosity,
    CurlPattern,
    Undertone,
)
from colorgenius.engine.hair_analysis.color_extract import ColorExtractor, UndertoneDetector
from colorgenius.engine.color_science.conversions import ColorConverter
from colorgenius.engine.color_science.models import (
    RGBColor,
    LabColor,
    ColorLevel,
)


class HairAnalyzer:
    """
    Complete hair analysis from photos.

    Analyzes:
    - Color level (1-10 scale)
    - Tone family (N, A, G, V, etc.)
    - Undertone (warm/cool/neutral)
    - Texture (fine/medium/coarse)
    - Density (thin/medium/thick)
    - Porosity (low/normal/high)
    - Curl pattern (straight/wavy/curly/coily)
    - Damage indicators
    """

    def __init__(self):
        self.converter = ColorConverter()
        self.color_extractor = ColorExtractor()
        self.undertone_detector = UndertoneDetector()

    def analyze(
        self,
        image: np.ndarray,
        mask: Optional[np.ndarray] = None,
        return_masks: bool = False,
    ) -> HairAnalysisResult:
        """
        Analyze hair from image.

        Args:
            image: RGB image array (H, W, 3)
            mask: Optional hair region mask
            return_masks: Whether to return intermediate masks

        Returns:
            Complete HairAnalysisResult
        """
        start_time = time.time()

        # If no mask, create basic mask (basic hair detection)
        if mask is None:
            mask = self._create_basic_mask(image)

        # Step 1: Color extraction
        color_result = self.color_extractor.extract_from_image(
            image, mask, zone="mid_lengths"
        )

        # Step 2: Build level analysis
        level_result = self._build_level_result(color_result)

        # Step 3: Build tone analysis
        tone_result = self._build_tone_result(color_result)

        # Step 4: Texture analysis (basic implementation)
        texture_result = self._analyze_texture(image, mask)

        # Step 5: Damage assessment (basic implementation)
        damage_result = self._assess_damage(image, mask)

        # Calculate overall confidence
        confidence = self._calculate_confidence(
            level_result, tone_result, texture_result
        )

        processing_time = (time.time() - start_time) * 1000

        return HairAnalysisResult(
            level=level_result,
            tone=tone_result,
            color_extraction=color_result,
            texture=texture_result,
            damage=damage_result,
            confidence=confidence,
            processing_time_ms=processing_time,
            zones_analyzed=["mid_lengths"],
            corrections_applied=[],
        )

    def analyze_from_file(
        self,
        image_path: str,
        mask: Optional[np.ndarray] = None,
    ) -> HairAnalysisResult:
        """Analyze hair from image file."""
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow is required for file analysis")

        image = Image.open(image_path)
        image = image.convert("RGB")
        image_array = np.array(image)

        return self.analyze(image_array, mask)

    def _create_basic_mask(self, image: np.ndarray) -> np.ndarray:
        """
        Create basic hair mask using color-based segmentation.

        This is a simple implementation. Production would use
        YOLOv8 or similar for accurate hair segmentation.

        Args:
            image: RGB image

        Returns:
            Binary mask (H, W) where 1 = hair
        """
        # Simple approach: mask based on skin-tone exclusion
        # This is a fallback for when no proper segmentation is available

        h, w = image.shape[:2]
        mask = np.ones((h, w), dtype=np.uint8)

        # Convert to HSV for skin detection
        try:
            import cv2

            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)

            # Rough skin mask (HSV ranges)
            lower_skin = np.array([0, 20, 40])
            upper_skin = np.array([30, 180, 255])

            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_mask = cv2.dilate(skin_mask, np.ones((15, 15), np.uint8))

            # Assume non-skin areas might be hair
            mask = (skin_mask == 0).astype(np.uint8)

            # Clean up small noise
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

        except ImportError:
            # No cv2 - return full image mask
            pass

        return mask

    def _build_level_result(
        self,
        color_result: ColorExtractionResult,
    ) -> LevelAnalysisResult:
        """Build LevelAnalysisResult from color extraction."""
        return LevelAnalysisResult(
            level=color_result.level,
            confidence=color_result.level_confidence,
            distribution=self._get_level_distribution(
                color_result.level, color_result.level_confidence
            ),
            undertone=color_result.undertone,
            rgb_mean=color_result.dominant_rgb,
            lab_mean=color_result.dominant_lab,
        )

    def _build_tone_result(
        self,
        color_result: ColorExtractionResult,
    ) -> ToneAnalysisResult:
        """Build ToneAnalysisResult from color extraction."""
        return ToneAnalysisResult(
            primary_tone=color_result.tone,
            secondary_tone=None,
            confidence=color_result.tone_confidence,
        )

    def _analyze_texture(
        self,
        image: np.ndarray,
        mask: np.ndarray,
    ) -> TextureAnalysisResult:
        """
        Analyze hair texture from image.

        Basic implementation using image analysis.
        Production would use trained CNN models.
        """
        try:
            import cv2

            # Convert hair region to grayscale
            hair_region = cv2.bitwise_and(image, image, mask=mask)
            gray = cv2.cvtColor(hair_region, cv2.COLOR_RGB2GRAY)

            # Calculate texture metrics from the hair region
            hair_pixels = gray[mask > 0]

            if len(hair_pixels) == 0:
                return self._default_texture_result()

            # Edge density as proxy for texture thickness
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges[mask > 0] > 0) / np.sum(mask > 0)

            # Classify thickness based on edge density
            if edge_density < 0.15:
                thickness = HairTexture.FINE
                scores = {"fine": 0.7, "medium": 0.25, "coarse": 0.05}
            elif edge_density < 0.30:
                thickness = HairTexture.MEDIUM
                scores = {"fine": 0.2, "medium": 0.6, "coarse": 0.2}
            else:
                thickness = HairTexture.COARSE
                scores = {"fine": 0.1, "medium": 0.3, "coarse": 0.6}

            # Estimate density from hair coverage
            coverage = np.sum(mask > 0) / mask.size
            if coverage < 0.15:
                density = HairDensity.THIN
            elif coverage < 0.35:
                density = HairDensity.MEDIUM
            else:
                density = HairDensity.THICK

            # Estimate porosity from shine (inverse relationship)
            # High shine = low porosity
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            bright_pixels = np.sum(blur[mask > 0] > 200)
            shine_ratio = bright_pixels / np.sum(mask > 0)

            if shine_ratio > 0.1:
                porosity = HairPorosity.LOW
            elif shine_ratio > 0.03:
                porosity = HairPorosity.NORMAL
            else:
                porosity = HairPorosity.HIGH

            # Simplified curl pattern detection
            # Would use Gabor filters or CNN in production
            curl_scores = {"straight": 0.6, "wavy": 0.3, "curly": 0.08, "coily": 0.02}
            curl_pattern = CurlPattern.STRAIGHT

            return TextureAnalysisResult(
                thickness=thickness,
                thickness_confidence=0.7,
                thickness_scores=scores,
                density=density,
                density_confidence=0.6,
                porosity=porosity,
                porosity_confidence=0.65,
                porosity_indicators={"shine": float(shine_ratio)},
                curl_pattern=curl_pattern,
                curl_pattern_confidence=0.5,
                curl_pattern_scores=curl_scores,
            )

        except ImportError:
            return self._default_texture_result()

    def _default_texture_result(self) -> TextureAnalysisResult:
        """Return default texture result when analysis fails."""
        return TextureAnalysisResult(
            thickness=HairTexture.MEDIUM,
            thickness_confidence=0.5,
            thickness_scores={"fine": 0.33, "medium": 0.34, "coarse": 0.33},
            density=HairDensity.MEDIUM,
            density_confidence=0.5,
            porosity=HairPorosity.NORMAL,
            porosity_confidence=0.5,
            porosity_indicators={},
            curl_pattern=CurlPattern.STRAIGHT,
            curl_pattern_confidence=0.5,
            curl_pattern_scores={"straight": 0.4, "wavy": 0.3, "curly": 0.2, "coily": 0.1},
        )

    def _assess_damage(
        self,
        image: np.ndarray,
        mask: np.ndarray,
    ) -> DamageAnalysisResult:
        """
        Assess hair damage from visual indicators.

        Basic implementation. Production would use trained damage segmentation.
        """
        try:
            import cv2

            # Analyze hair region for damage indicators
            hair_region = cv2.bitwise_and(image, image, mask=mask)
            gray = cv2.cvtColor(hair_region, cv2.COLOR_RGB2GRAY)

            damage_score = 0.0
            indicators = {}

            # Split end detection (frayed ends in lower portion)
            h = image.shape[0]
            end_region = mask[int(h * 0.7) :, :].copy()
            end_region_mask = cv2.Canny(gray[int(h * 0.7) :, :], 100, 200)
            split_indicator = np.sum(end_region_mask > 0) / (end_region.size * 0.1)
            if split_indicator > 0.5:
                damage_score += 0.2
                indicators["split_ends"] = {"present": True, "severity": 0.3}
            else:
                indicators["split_ends"] = {"present": False, "severity": 0.0}

            # Breakage detection (irregular lengths)
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if len(contours) > 0:
                lengths = [cv2.arcLength(c, False) for c in contours]
                if len(lengths) > 1:
                    cv_breakage = np.std(lengths) / np.mean(lengths)
                    if cv_breakage > 0.4:
                        damage_score += 0.15
                        indicators["breakage"] = {"present": True, "severity": cv_breakage * 0.3}
                    else:
                        indicators["breakage"] = {"present": False, "severity": 0.0}
                else:
                    indicators["breakage"] = {"present": False, "severity": 0.0}
            else:
                indicators["breakage"] = {"present": False, "severity": 0.0}

            # Color damage (irregular color distribution)
            color_variance = np.std(image[mask > 0], axis=0).mean()
            if color_variance > 50:
                damage_score += 0.1
                indicators["color_damage"] = {"present": True, "severity": 0.2}
            else:
                indicators["color_damage"] = {"present": False, "severity": 0.0}

            indicators["chemical_damage"] = {"present": False, "severity": 0.0}
            indicators["heat_damage"] = {"present": False, "severity": 0.0}

            # Categorize
            if damage_score < 0.15:
                category = "minimal"
                recommendations = ["Condition regularly", "Regular trims"]
            elif damage_score < 0.35:
                category = "moderate"
                recommendations = ["Use bond-building treatments", "Reduce heat styling"]
            else:
                category = "significant"
                recommendations = ["Consult professional", "Consider cut", "Plex treatments"]

            return DamageAnalysisResult(
                overall_score=min(1.0, damage_score),
                category=category,
                split_ends=indicators["split_ends"],
                breakage=indicators["breakage"],
                chemical_damage=indicators["chemical_damage"],
                heat_damage=indicators["heat_damage"],
                recommendations=recommendations,
            )

        except ImportError:
            return DamageAnalysisResult(
                overall_score=0.0,
                category="minimal",
                recommendations=["No data available"],
            )

    def _get_level_distribution(
        self,
        primary_level: int,
        confidence: float,
    ) -> List[float]:
        """
        Generate probability distribution across levels.

        Args:
            primary_level: Most likely level
            confidence: Confidence in the prediction

        Returns:
            List of 10 probabilities summing to 1.0
        """
        # Create a distribution centered on primary level
        dist = np.zeros(10)
        center = primary_level - 1  # 0-indexed

        # Gaussian-ish distribution
        for i in range(10):
            distance = abs(i - center)
            if distance == 0:
                dist[i] = confidence
            elif distance == 1:
                dist[i] = (1 - confidence) * 0.4
            elif distance == 2:
                dist[i] = (1 - confidence) * 0.15
            else:
                dist[i] = (1 - confidence) * 0.05

        # Normalize
        dist = dist / dist.sum()
        return dist.tolist()

    def _calculate_confidence(
        self,
        level: LevelAnalysisResult,
        tone: ToneAnalysisResult,
        texture: TextureAnalysisResult,
    ) -> float:
        """Calculate overall analysis confidence."""
        return (
            level.confidence * 0.4
            + tone.confidence * 0.3
            + texture.thickness_confidence * 0.15
            + texture.porosity_confidence * 0.15
        )