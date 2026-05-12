"""
Color Extraction from Hair Regions.

Extracts dominant colors, levels, and tones from hair in photos.
"""

from __future__ import annotations

from typing import Optional, Tuple, List
import numpy as np
from dataclasses import dataclass

try:
    from PIL import Image

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

from colorgenius.engine.color_science.models import (
    RGBColor,
    LabColor,
    LCHColor,
    ColorLevel,
)
from colorgenius.engine.color_science.conversions import ColorConverter
from colorgenius.engine.hair_analysis.models import (
    ColorExtractionResult,
    LevelAnalysisResult,
    ToneAnalysisResult,
    Undertone,
)


class ColorExtractor:
    """
    Extract color information from hair region in photos.

    Extracts:
    - Dominant color (RGB, Lab, LCH)
    - Color level (1-10)
    - Tone family (N, A, G, etc.)
    - Undertone (warm/cool/neutral)
    """

    def __init__(self):
        self.converter = ColorConverter()

    def extract_from_image(
        self,
        image: np.ndarray,
        mask: Optional[np.ndarray] = None,
        zone: str = "mid_lengths",
    ) -> ColorExtractionResult:
        """
        Extract color from image using optional mask.

        Args:
            image: RGB image array (H, W, 3)
            mask: Binary mask for hair region (H, W), 1 = hair
            zone: Which zone was analyzed (for metadata)

        Returns:
            ColorExtractionResult with extracted color data
        """
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow is required for color extraction")

        # Apply mask if provided
        if mask is not None:
            hair_region = image.copy()
            hair_region[mask == 0] = [0, 0, 0]
        else:
            # Assume entire image is hair (basic usage)
            hair_region = image

        # Get non-zero pixels
        if mask is not None:
            hair_pixels = hair_region[mask > 0]
        else:
            hair_pixels = hair_region.reshape(-1, 3)

        if len(hair_pixels) == 0:
            raise ValueError("No hair pixels found in image")

        # Calculate dominant color using histogram approach
        dominant_rgb = self._get_dominant_color(hair_pixels)
        dominant_lab = self.converter.rgb_to_lab(dominant_rgb)
        dominant_lch = self.converter.rgb_to_lch(dominant_rgb)

        # Get secondary color (for highlights/lowlights)
        secondary_rgb = self._get_secondary_color(hair_pixels, dominant_rgb)
        secondary_lab = (
            self.converter.rgb_to_lab(secondary_rgb)
            if secondary_rgb is not None
            else None
        )

        # Estimate level
        level, level_confidence = self.converter.estimate_level_from_rgb(dominant_rgb)

        # Detect tone
        tone, tone_confidence = self._detect_tone_from_rgb(dominant_rgb)

        # Detect undertone
        undertone, undertone_confidence = self._detect_undertone(dominant_lab)

        # Coverage
        if mask is not None:
            coverage = np.sum(mask > 0) / mask.size * 100
        else:
            coverage = 100.0

        return ColorExtractionResult(
            dominant_rgb=dominant_rgb.to_tuple(),
            dominant_lab=dominant_lab.to_tuple(),
            dominant_lch=dominant_lch.to_tuple(),
            secondary_rgb=secondary_rgb.to_tuple() if secondary_rgb else None,
            secondary_lab=secondary_lab.to_tuple() if secondary_lab else None,
            level=level,
            level_confidence=level_confidence,
            tone=tone,
            tone_confidence=tone_confidence,
            undertone=Undertone(undertone),
            undertone_confidence=undertone_confidence,
            pixels_analyzed=len(hair_pixels),
            coverage_percent=coverage,
        )

    def extract_from_file(
        self,
        image_path: str,
        mask: Optional[np.ndarray] = None,
    ) -> ColorExtractionResult:
        """
        Extract color from image file.

        Args:
            image_path: Path to image file
            mask: Optional pre-computed mask

        Returns:
            ColorExtractionResult
        """
        image = Image.open(image_path)
        image = image.convert("RGB")
        image_array = np.array(image)
        return self.extract_from_image(image_array, mask)

    def _get_dominant_color(self, pixels: np.ndarray) -> RGBColor:
        """
        Get dominant color using k-means clustering or histogram.

        Args:
            pixels: Array of RGB pixels (N, 3)

        Returns:
            Dominant RGB color
        """
        # Convert to integer representation for histogram
        r_pixels = np.clip(pixels[:, 0], 0, 255).astype(np.uint8)
        g_pixels = np.clip(pixels[:, 1], 0, 255).astype(np.uint8)
        b_pixels = np.clip(pixels[:, 2], 0, 255).astype(np.uint8)

        # 3D histogram
        bins = 32  # Reduced for efficiency
        hist, _ = np.histogramdd(
            pixels.astype(np.float32) / 255.0,
            bins=bins,
            range=[[0, 1], [0, 1], [0, 1]],
        )

        # Find peak
        max_idx = np.unravel_index(np.argmax(hist), hist.shape)
        scale = 255.0 / bins

        r = int(max_idx[0] * scale + scale / 2)
        g = int(max_idx[1] * scale + scale / 2)
        b = int(max_idx[2] * scale + scale / 2)

        return RGBColor(r=r, g=g, b=b)

    def _get_secondary_color(
        self,
        pixels: np.ndarray,
        dominant: RGBColor,
    ) -> Optional[RGBColor]:
        """
        Get secondary color (highlights or lowlights).

        Args:
            pixels: Array of pixels
            dominant: Dominant color to exclude

        Returns:
            Secondary RGB or None
        """
        # Convert to Lab for perceptual distance
        dominant_lab = self.converter.rgb_to_lab(dominant)

        # Calculate distance from dominant in Lab space
        pixel_labs = np.array(
            [self.converter.rgb_to_lab(RGBColor(r=p[0], g=p[1], b=p[2])).to_array() for p in pixels]
        )

        distances = np.sqrt(
            np.sum((pixel_labs - dominant_lab.to_array()) ** 2, axis=1)
        )

        # Find pixels that are significantly different
        threshold = np.percentile(distances, 15)  # 15% most different
        secondary_mask = distances > threshold

        if np.sum(secondary_mask) < len(pixels) * 0.05:
            return None

        secondary_pixels = pixels[secondary_mask]
        return self._get_dominant_color(secondary_pixels)

    def _detect_tone_from_rgb(self, rgb: RGBColor) -> Tuple[str, float]:
        """
        Detect tone from RGB values.

        Args:
            rgb: RGB color

        Returns:
            Tuple of (tone_code, confidence)
        """
        lab = self.converter.rgb_to_lab(rgb)
        tone, secondary = self.converter.detect_tone_from_lab(lab)

        # Calculate confidence based on how well it fits the tone profile
        confidence = 0.75  # Base confidence

        if tone == "N":
            # Natural: low saturation
            if lab.l > 30:
                confidence = 0.85
            else:
                confidence = 0.80

        elif tone == "A":
            # Ash: blue/violet base
            if lab.b < -10:
                confidence = 0.85

        elif tone == "G":
            # Gold: yellow base
            if lab.b > 15:
                confidence = 0.85

        elif tone == "C":
            # Copper: orange-red
            if lab.a > 15 and lab.b > 10:
                confidence = 0.85

        elif tone == "V":
            # Violet: purple
            if lab.b < -5 and lab.a > 10:
                confidence = 0.85

        return tone, confidence

    def _detect_undertone(
        self,
        lab: LabColor,
    ) -> Tuple[str, float]:
        """
        Detect undertone from Lab values.

        Args:
            lab: Lab color

        Returns:
            Tuple of (undertone, confidence)
        """
        undertone = self.converter.detect_undertone_from_lab(lab)

        # Confidence based on how strong the undertone is
        a, b = lab.a, lab.b
        intensity = abs(b) + abs(a) * 0.5

        if undertone == "neutral":
            confidence = 0.8 if intensity < 15 else 0.9
        else:
            confidence = 0.85 if abs(intensity) > 15 else 0.75

        return undertone, confidence


class UndertoneDetector:
    """
    Specialized undertone detection for hair color.
    """

    def __init__(self):
        self.converter = ColorConverter()

    def detect_from_image(
        self,
        image: np.ndarray,
        mask: Optional[np.ndarray] = None,
    ) -> Tuple[str, float]:
        """
        Detect undertone from image.

        Args:
            image: RGB image array
            mask: Optional hair mask

        Returns:
            Tuple of (undertone, confidence)
        """
        extractor = ColorExtractor()
        result = extractor.extract_from_image(image, mask)

        return result.undertone.value, result.undertone_confidence

    def detect_neutralization_need(
        self,
        current_lab: LabColor,
        target_tone: str,
    ) -> Optional[str]:
        """
        Determine if neutralization is needed.

        Args:
            current_lab: Current color in Lab
            target_tone: Target tone code (N, A, G, V, etc.)

        Returns:
            Tone code to add for neutralization, or None
        """
        current_undertone = self.converter.detect_undertone_from_lab(current_lab)

        # If already neutral or targeting warm, neutralization optional
        if current_undertone == "neutral":
            return None

        if target_tone in ["G", "W", "C", "R"] and current_undertone == "warm":
            return None

        # Target is cool, must neutralize warm undertones
        if target_tone in ["A", "V", "B", "P"]:
            if current_undertone == "warm":
                if current_lab.b > 10:  # Strong yellow
                    return "V"  # Violet neutralizes yellow
                else:
                    return "A"  # Ash for orange

        return None