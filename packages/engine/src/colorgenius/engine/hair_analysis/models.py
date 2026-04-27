"""Data models for hair analysis results."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from enum import Enum


class HairTexture(str, Enum):
    """Hair strand thickness classification."""

    FINE = "fine"
    MEDIUM = "medium"
    COARSE = "coarse"


class HairDensity(str, Enum):
    """Hair density classification."""

    THIN = "thin"
    MEDIUM = "medium"
    THICK = "thick"


class HairPorosity(str, Enum):
    """Hair porosity level."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


class CurlPattern(str, Enum):
    """Hair curl pattern classification."""

    STRAIGHT = "straight"
    WAVY = "wavy"
    CURLY = "curly"
    COILY = "coily"


class Undertone(str, Enum):
    """Hair undertone classification."""

    WARM = "warm"
    COOL = "cool"
    NEUTRAL = "neutral"


@dataclass
class LevelAnalysisResult:
    """Result of hair color level analysis."""

    level: int  # 1-10
    confidence: float  # 0-1
    distribution: List[float]  # Probability across all 10 levels
    undertone: Undertone
    rgb_mean: List[int]  # [R, G, B]
    lab_mean: List[float]  # [L*, a*, b*]
    zone_analyzed: str = "mid_lengths"  # Which zone was used


@dataclass
class ToneAnalysisResult:
    """Result of hair tone analysis."""

    primary_tone: str  # N, A, G, V, etc.
    secondary_tone: Optional[str] = None
    confidence: float = 0.0  # 0-1
    hue_angle: Optional[float] = None  # degrees
    saturation: Optional[float] = None  # 0-100


@dataclass
class TextureAnalysisResult:
    """Result of hair texture analysis."""

    thickness: HairTexture
    thickness_confidence: float = 0.0
    thickness_scores: Dict[str, float] = field(default_factory=dict)

    density: HairDensity = HairDensity.MEDIUM
    density_confidence: float = 0.0

    porosity: HairPorosity = HairPorosity.NORMAL
    porosity_confidence: float = 0.0
    porosity_indicators: Dict[str, float] = field(default_factory=dict)

    curl_pattern: CurlPattern = CurlPattern.STRAIGHT
    curl_pattern_confidence: float = 0.0
    curl_pattern_scores: Dict[str, float] = field(default_factory=dict)


@dataclass
class DamageAnalysisResult:
    """Result of hair damage assessment."""

    overall_score: float = 0.0  # 0-1, higher = more damaged
    category: str = "minimal"  # minimal, moderate, significant

    split_ends: Dict[str, Any] = field(default_factory=dict)
    breakage: Dict[str, Any] = field(default_factory=dict)
    chemical_damage: Dict[str, Any] = field(default_factory=dict)
    heat_damage: Dict[str, Any] = field(default_factory=dict)

    recommendations: List[str] = field(default_factory=list)


@dataclass
class ColorExtractionResult:
    """Result of color extraction from hair region."""

    dominant_rgb: List[int]
    dominant_lab: List[float]
    dominant_lch: List[float]

    secondary_rgb: Optional[List[int]] = None
    secondary_lab: Optional[List[float]] = None

    level: int = 0
    level_confidence: float = 0.0

    tone: str = "N"
    tone_confidence: float = 0.0

    undertone: Undertone = Undertone.NEUTRAL
    undertone_confidence: float = 0.0

    pixels_analyzed: int = 0
    coverage_percent: float = 0.0


@dataclass
class HairAnalysisResult:
    """
    Complete hair analysis result from photo input.
    """

    # Color analysis
    level: LevelAnalysisResult
    tone: ToneAnalysisResult
    color_extraction: ColorExtractionResult

    # Physical analysis
    texture: TextureAnalysisResult
    damage: DamageAnalysisResult

    # Overall confidence
    confidence: float = 0.0

    # Processing metadata
    processing_time_ms: float = 0.0
    zones_analyzed: List[str] = field(default_factory=list)
    corrections_applied: List[str] = field(default_factory=list)

    # Face/skin analysis (optional)
    skin_tone: Optional[str] = None
    skin_undertone: Optional[str] = None

    def summary(self) -> str:
        """Return human-readable summary."""
        return (
            f"Level {self.level.level} {self.tone.primary_tone} "
            f"({self.level.confidence:.0%} confidence)"
        )