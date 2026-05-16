"""Type definitions for the Brand Conversion Engine (Python).
Mirrors dashboard/lib/conversion/types.ts exactly.
"""

from __future__ import annotations
from typing import TypedDict, List, Dict, Optional, Literal, Union
from dataclasses import dataclass


# ─── Tone Family Type ───────────────────────────────────────────────────────

ToneFamily = Literal[
    "natural", "ash", "blue-ash", "green-ash", "gold", "copper", "red",
    "violet", "pearl", "beige", "mahogany", "chocolate", "warm", "matte",
    "rose", "cool", "specialty",
]


# ─── Adjacent Tones Mapping ─────────────────────────────────────────────────

ADJACENT_TONES: Dict[ToneFamily, List[ToneFamily]] = {
    "natural": ["warm", "beige"],
    "ash": ["blue-ash", "matte", "pearl"],
    "blue-ash": ["ash", "violet"],
    "green-ash": ["ash", "matte"],
    "gold": ["warm", "copper", "beige"],
    "copper": ["gold", "red", "mahogany"],
    "red": ["copper", "mahogany", "rose"],
    "violet": ["blue-ash", "pearl", "rose"],
    "pearl": ["ash", "violet", "beige"],
    "beige": ["natural", "gold", "pearl"],
    "mahogany": ["copper", "red", "chocolate"],
    "chocolate": ["mahogany", "warm"],
    "warm": ["natural", "gold", "chocolate"],
    "matte": ["ash"],
    "rose": ["red", "violet"],
    "cool": ["ash", "blue-ash"],
    "specialty": [],
}


# ─── Developer Intent Mapping ─────────────────────────────────────────────────

DEVELOPER_INTENT: Dict[int, str] = {
    5: "deposit",
    10: "deposit",
    13: "deposit",
    15: "deposit",
    20: "1-2lift",
    25: "1-2lift",
    30: "2-3lift",
    40: "3-4lift",
    50: "4+lift",
}


def get_developer_intent(volume: int) -> str:
    """Convert any developer volume to semantic intent."""
    if volume in DEVELOPER_INTENT:
        return DEVELOPER_INTENT[volume]
    volumes = sorted(DEVELOPER_INTENT.keys())
    for v in volumes:
        if v >= volume:
            return DEVELOPER_INTENT[v]
    return DEVELOPER_INTENT[volumes[-1]] if volumes else "deposit"


# ─── Data Models ───────────────────────────────────────────────────────────

@dataclass
class NormalizedShade:
    code: str
    brand: str
    line: str
    level: int
    toneFamily: ToneFamily
    toneCode: str
    name: str
    hex: str
    isHighLift: bool
    isDemi: bool
    grayCoverage: Optional[str]


@dataclass
class BrandSpecs:
    brand: str
    productLine: Optional[str] = None
    type: Optional[str] = None
    mixRatio: Optional[str] = None
    processingTime: Optional[str] = None
    grayProcessingTime: Optional[str] = None
    developers: Optional[List[Dict]] = None
    developerVolumes: Optional[List[int]] = None
    volumeSemantics: Optional[Dict[str, str]] = None
    lines: Optional[List[Dict]] = None
    formulationGuidelines: Optional[Dict] = None
    grayCoverage: Optional[Dict] = None


MatchType = Literal["exact", "close", "level-adjusted", "weak"]


@dataclass
class MatchCandidate:
    shade: NormalizedShade
    confidence: float
    matchType: MatchType
    notes: Optional[str] = None


@dataclass
class ConvertedShade:
    originalCode: str
    originalBrand: str
    convertedCode: str
    convertedBrand: str
    convertedLine: str
    convertedName: str
    convertedHex: str
    grams: int
    confidence: float
    matchType: MatchType
    notes: Optional[str] = None


@dataclass
class DeveloperResult:
    originalVolume: int
    convertedVolume: int
    mixingRatio: str
    notes: Optional[str] = None


@dataclass
class ConversionResult:
    shades: List[ConvertedShade]
    developer: DeveloperResult
    overallConfidence: float
    hardStops: List[str]
    warnings: List[str]


@dataclass
class ShadeConversionRequest:
    shadeCode: str
    brand: str
    line: str
    grams: int


@dataclass
class MixingAmountsResult:
    colorGrams: int
    developerGrams: int
    sourceRatio: str
    targetRatio: str
    totalGrams: int
    notes: Optional[str] = None


# ─── Confidence Scoring Constants ───────────────────────────────────────────

CONFIDENCE = {
    "EXACT": 1.0,
    "ADJACENT_TONE": 0.9,
    "CLOSEST_LEVEL": 0.8,
    "FUZZY": 0.55,
}

MULTI_SHADE_PENALTY = 0.9
