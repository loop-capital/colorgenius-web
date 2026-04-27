"""
Undertone Detection for Hair Color.

Specialized analysis of warm/cool/neutral undertones for color formulation.
"""

from __future__ import annotations

from typing import Optional, Tuple, Dict
import numpy as np

from colorgenius.engine.color_science.models import (
    LabColor,
    RGBColor,
    ColorLevel,
    ToneFamily,
)
from colorgenius.engine.color_science.conversions import ColorConverter


class UndertoneDetector:
    """
    Specialized undertone detection for professional hair color.

    Determines:
    - Warm undertones (yellow/gold)
    - Cool undertones (blue/violet/ash)
    - Neutral
    - Which undertones need neutralization during lifting
    """

    def __init__(self):
        self.converter = ColorConverter()

    def detect(self, lab: LabColor) -> Tuple[str, float, Dict]:
        """
        Detect undertone from Lab color.

        Args:
            lab: Lab color to analyze

        Returns:
            Tuple of (undertone, confidence, details)
        """
        a, b = lab.a, lab.b

        # Warmth score
        warmth_score = b + a * 0.5

        if warmth_score > 10:
            undertone = "warm"
            confidence = 0.9 if warmth_score > 20 else 0.8
        elif warmth_score < -5:
            undertone = "cool"
            confidence = 0.9 if warmth_score < -15 else 0.8
        else:
            undertone = "neutral"
            confidence = 0.85

        details = {
            "warmth_score": warmth_score,
            "b_axis": b,
            "a_axis": a,
            "interpretation": self._interpret(warmth_score, a, b),
        }

        return undertone, confidence, details

    def detect_from_rgb(self, rgb: RGBColor) -> Tuple[str, float, Dict]:
        """Detect undertone from RGB color."""
        lab = self.converter.rgb_to_lab(rgb)
        return self.detect(lab)

    def _interpret(self, warmth_score: float, a: float, b: float) -> str:
        """Human-readable interpretation of undertone."""
        if warmth_score > 25:
            return "Strong warm undertone (gold/yellow)"
        elif warmth_score > 10:
            return "Moderate warm undertone"
        elif warmth_score > 5:
            return "Slight warm undertone"
        elif warmth_score > -5:
            return "Neutral"
        elif warmth_score > -15:
            return "Moderate cool undertone (ash)"
        else:
            return "Strong cool undertone (violet/blue)"

    def calculate_neutralization(
        self,
        current_undertone: str,
        current_lab: LabColor,
        target_tone: str,
    ) -> Optional[str]:
        """
        Calculate tone needed for neutralization.

        Args:
            current_undertone: Current undertone (warm/cool/neutral)
            current_lab: Current color in Lab
            target_tone: Target tone code

        Returns:
            Tone code to add, or None if not needed
        """
        # If neutral, no neutralization needed
        if current_undertone == "neutral":
            return None

        # If targeting warm and currently warm, optional
        if target_tone in ["G", "W", "C", "R"] and current_undertone == "warm":
            return None

        # Cool targets need neutralization of warm undertones
        if target_tone in ["A", "V", "B", "P"]:
            if current_undertone == "warm":
                if current_lab.b > 15:
                    return "V"  # Violet for yellow
                elif current_lab.b > 5:
                    return "A"  # Ash for orange
                else:
                    return "A"  # Default to ash

        return None

    def predict_undertone_from_level(
        self,
        level: int,
        is_virgin: bool = True,
    ) -> str:
        """
        Predict underlying undertone when hair is lifted.

        Args:
            level: Current level (1-10)
            is_virgin: Whether hair is virgin (uncolored)

        Returns:
            Predicted undertone when lifted
        """
        if not is_virgin:
            return "neutral"  # Unknown from previous color

        # Underlying pigment when lifting
        if level <= 3:
            return "red"  # Dark hair exposes red-orange
        elif level <= 5:
            return "orange"
        elif level <= 7:
            return "gold"
        else:
            return "yellow"

    def recommend_neutralizer_for_level(self, level: int) -> str:
        """
        Recommend neutralizer for exposed undertone at given level.

        Args:
            level: Target level after lift

        Returns:
            Recommended tone for neutralization
        """
        if level <= 4:
            return "A"  # Ash for orange/red
        elif level <= 6:
            return "A"  # Ash for orange
        elif level <= 8:
            return "V"  # Violet for yellow
        else:
            return "V"  # Violet for pale yellow