"""Color data models for type-safe color representations."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Tuple, List
import numpy as np


class ToneFamily(str, Enum):
    """Professional hair color tone families."""

    NATURAL = "N"  # Natural/Neutral
    ASH = "A"  # Cool ash (blue-violet base)
    GOLD = "G"  # Warm gold (yellow base)
    WARM = "W"  # Golden warmth
    COPPER = "C"  # Orange-red
    RED = "R"  # Red
    VIOLET = "V"  # Violet/cool
    MAHOGANY = "M"  # Red-brown
    BEIGE = "B"  # Neutral-warm beige
    PEARL = "P"  # Iridescent cool
    SILVER = "S"  # Metallic gray
    CAMOUFLAGE = "K"  # Copper-brown (Matrix)

    # Schwarzkopf-specific
    CENDRE = "1"  # Ash (French term)
    SANDAL = "11"  # Warm sand

    @classmethod
    def from_code(cls, code: str) -> ToneFamily:
        """Parse tone from shade code string."""
        code_upper = code.upper().strip()

        # Direct mapping
        mapping = {
            "N": cls.NATURAL,
            "A": cls.ASH,
            "G": cls.GOLD,
            "W": cls.WARM,
            "C": cls.COPPER,
            "R": cls.RED,
            "V": cls.VIOLET,
            "M": cls.MAHOGANY,
            "B": cls.BEIGE,
            "P": cls.PEARL,
            "S": cls.SILVER,
            "K": cls.CAMOUFLAGE,
            "1": cls.CENDRE,
            "11": cls.SANDAL,
        }

        # Handle multi-character codes
        if len(code_upper) >= 2:
            for key, val in mapping.items():
                if code_upper.startswith(key) and len(key) > 1:
                    return val

        return mapping.get(code_upper[0], cls.NATURAL)

    def is_warm(self) -> bool:
        """Check if tone is warm family."""
        return self in {
            ToneFamily.GOLD,
            ToneFamily.WARM,
            ToneFamily.COPPER,
            ToneFamily.RED,
            ToneFamily.BEIGE,
        }

    def is_cool(self) -> bool:
        """Check if tone is cool family."""
        return self in {
            ToneFamily.ASH,
            ToneFamily.VIOLET,
            ToneFamily.PEARL,
            ToneFamily.SILVER,
            ToneFamily.CENDRE,
        }

    def neutralizes(self) -> Optional[ToneFamily]:
        """Return the tone that neutralizes this one."""
        neutralizers = {
            ToneFamily.ASH: ToneFamily.GOLD,  # Ash neutralizes gold/orange
            ToneFamily.GOLD: ToneFamily.ASH,  # Gold neutralizes ash
            ToneFamily.VIOLET: ToneFamily.GOLD,  # Violet neutralizes yellow
            ToneFamily.COPPER: ToneFamily.ASH,  # Copper needs ash/green
            ToneFamily.RED: ToneFamily.GREEN,  # Red neutralizes green
            ToneFamily.GOLD: ToneFamily.ASH,  # Gold needs ash
            ToneFamily.WARM: ToneFamily.ASH,
        }
        return neutralizers.get(self)


class ColorLevel(int, Enum):
    """
    Professional hair color levels (1-10 scale).

    Level determines melanin concentration and underlying pigment.
    """

    LEVEL_1 = 1  # Black - 95% melanin
    LEVEL_2 = 2  # Very Dark Brown - 85%
    LEVEL_3 = 3  # Dark Brown - 75%
    LEVEL_4 = 4  # Medium Brown - 60%
    LEVEL_5 = 5  # Light Brown - 45%
    LEVEL_6 = 6  # Dark Blonde - 30%
    LEVEL_7 = 7  # Medium Blonde - 20%
    LEVEL_8 = 8  # Light Blonde - 12%
    LEVEL_9 = 9  # Very Light Blonde - 6%
    LEVEL_10 = 10  # Platinummm/Lightest - 2%

    def melanin_percent(self) -> float:
        """Return approximate melanin concentration."""
        percentages = {
            1: 95.0,
            2: 85.0,
            3: 75.0,
            4: 60.0,
            5: 45.0,
            6: 30.0,
            7: 20.0,
            8: 12.0,
            9: 6.0,
            10: 2.0,
        }
        return percentages.get(self.value, 50.0)

    def underlying_pigment(self) -> str:
        """Return exposed undertone when lifted."""
        undertones = {
            1: "red-orange",
            2: "red-orange",
            3: "red",
            4: "red-orange",
            5: "orange",
            6: "orange-gold",
            7: "yellow-gold",
            8: "pale yellow",
            9: "almost white",
            10: "white",
        }
        return undertones.get(self.value, "unknown")

    def lift_required_to_reach(self, target: ColorLevel) -> int:
        """Calculate levels needed to reach target from this level."""
        return max(0, target.value - self.value)

    @classmethod
    def from_lab_l(cls, l_value: float) -> ColorLevel:
        """Estimate level from L* (lightness) value."""
        # L* in Lab color space roughly maps to level
        # Level 1 ≈ L* 15-20, Level 10 ≈ L* 90+
        if l_value < 20:
            return cls.LEVEL_1
        elif l_value < 28:
            return cls.LEVEL_2
        elif l_value < 36:
            return cls.LEVEL_3
        elif l_value < 44:
            return cls.LEVEL_4
        elif l_value < 52:
            return cls.LEVEL_5
        elif l_value < 60:
            return cls.LEVEL_6
        elif l_value < 68:
            return cls.LEVEL_7
        elif l_value < 76:
            return cls.LEVEL_8
        elif l_value < 84:
            return cls.LEVEL_9
        else:
            return cls.LEVEL_10

    def max_lift_with_color(self, volume: int) -> int:
        """
        Return max levels color can lift from this level.

        Args:
            volume: Developer volume (10, 20, 30, 40)

        Returns:
            Maximum additional levels achievable
        """
        # Professional color lift capabilities
        lift_table = {
            10: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0},
            20: {1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 1, 9: 1, 10: 0},
            30: {1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1, 10: 0},
            40: {1: 4, 2: 4, 3: 4, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 1, 10: 0},
        }
        return lift_table.get(volume, {}).get(self.value, 0)


@dataclass(frozen=True)
class RGBColor:
    """RGB color representation."""

    r: int  # 0-255
    g: int  # 0-255
    b: int  # 0-255

    def __post_init__(self):
        if not (0 <= self.r <= 255):
            raise ValueError(f"R must be 0-255, got {self.r}")
        if not (0 <= self.g <= 255):
            raise ValueError(f"G must be 0-255, got {self.g}")
        if not (0 <= self.b <= 255):
            raise ValueError(f"B must be 0-255, got {self.b}")

    def to_tuple(self) -> Tuple[int, int, int]:
        """Return as tuple."""
        return (self.r, self.g, self.b)

    def to_normalized(self) -> Tuple[float, float, float]:
        """Return normalized 0-1 values."""
        return (self.r / 255.0, self.g / 255.0, self.b / 255.0)

    def to_array(self) -> np.ndarray:
        """Return as numpy array."""
        return np.array([self.r, self.g, self.b], dtype=np.uint8)

    def to_hex(self) -> str:
        """Return hex string."""
        return f"#{self.r:02x}{self.g:02x}{self.b:02x}"

    @classmethod
    def from_hex(cls, hex_str: str) -> RGBColor:
        """Parse from hex string."""
        hex_str = hex_str.lstrip("#")
        if len(hex_str) != 6:
            raise ValueError(f"Invalid hex: {hex_str}")
        return cls(
            r=int(hex_str[0:2], 16),
            g=int(hex_str[2:4], 16),
            b=int(hex_str[4:6], 16),
        )

    @classmethod
    def from_lab_l_value(cls, level: int, warmth: float = 0.0) -> RGBColor:
        """
        Approximate RGB for a given hair level with warmth bias.

        Args:
            level: 1-10
            warmth: -1 (cool) to 1 (warm)
        """
        # Approximate L* values by level
        l_values = {1: 18, 2: 25, 3: 32, 4: 40, 5: 48, 6: 56, 7: 64, 8: 72, 9: 80, 10: 88}
        l = l_values.get(level, 50)

        # Approximate a*, b* from warmth
        a = warmth * 15
        b = (1 - abs(warmth)) * 20 if warmth > 0 else warmth * 10

        # Convert Lab to RGB (simplified)
        from colorgenius.engine.color_science.conversions import ColorConverter

        converter = ColorConverter()
        lab = LabColor(l=l, a=a, b=b)
        return converter.lab_to_rgb(lab)


@dataclass(frozen=True)
class LabColor:
    """CIEL*a*b* color representation (perceptually uniform)."""

    l: float  # Lightness: 0-100
    a: float  # Red-green axis: approx -128 to 127
    b: float  # Yellow-blue axis: approx -128 to 127

    def to_tuple(self) -> Tuple[float, float, float]:
        """Return as tuple."""
        return (self.l, self.a, self.b)

    def to_array(self) -> np.ndarray:
        """Return as numpy array."""
        return np.array([self.l, self.a, self.b], dtype=np.float64)

    @classmethod
    def from_rgb(cls, rgb: RGBColor) -> LabColor:
        """Create from RGB."""
        from colorgenius.engine.color_science.conversions import ColorConverter

        converter = ColorConverter()
        return converter.rgb_to_lab(rgb)

    def perceived_lightness(self) -> float:
        """Return perceptual lightness (L*)."""
        return self.l


@dataclass(frozen=True)
class LCHColor:
    """
    LCH color representation (Lightness, Chroma, Hue).

    More intuitive than Lab for color specification.
    """

    l: float  # Lightness: 0-100
    c: float  # Chroma (saturation): 0-150+
    h: float  # Hue angle: 0-360 degrees

    def to_tuple(self) -> Tuple[float, float, float]:
        """Return as tuple."""
        return (self.l, self.c, self.h)

    @classmethod
    def from_lab(cls, lab: LabColor) -> LCHColor:
        """Convert from Lab color space."""
        import math

        c = math.sqrt(lab.a**2 + lab.b**2)
        h = math.degrees(math.atan2(lab.b, lab.a)) % 360
        return cls(l=lab.l, c=c, h=h)

    def to_lab(self) -> LabColor:
        """Convert to Lab color space."""
        import math

        h_rad = math.radians(self.h)
        a = self.c * math.cos(h_rad)
        b = self.c * math.sin(h_rad)
        return LabColor(l=self.l, a=a, b=b)


@dataclass(frozen=True)
class HSLColor:
    """HSL color representation (Hue, Saturation, Lightness)."""

    h: float  # Hue: 0-360 degrees
    s: float  # Saturation: 0-100
    l: float  # Lightness: 0-100

    def to_tuple(self) -> Tuple[float, float, float]:
        """Return as tuple."""
        return (self.h, self.s, self.l)

    @classmethod
    def from_rgb(cls, rgb: RGBColor) -> HSLColor:
        """Convert from RGB."""
        r, g, b = rgb.to_normalized()

        max_c = max(r, g, b)
        min_c = min(r, g, b)
        delta = max_c - min_c

        # Lightness
        l = (max_c + min_c) / 2 * 100

        # Saturation
        if delta == 0:
            s = 0.0
        else:
            s = delta / (1 - abs(2 * l / 100 - 1)) * 100

        # Hue
        if delta == 0:
            h = 0.0
        elif max_c == r:
            h = 60 * (((g - b) / delta) % 6)
        elif max_c == g:
            h = 60 * ((b - r) / delta + 2)
        else:
            h = 60 * ((r - g) / delta + 4)

        return cls(h=h % 360, s=s, l=l)


@dataclass
class ShadeProfile:
    """
    Complete shade profile for a specific hair color product.
    """

    shade_code: str
    shade_name: str
    level: ColorLevel
    primary_tone: ToneFamily
    secondary_tone: Optional[ToneFamily] = None
    tertiary_tone: Optional[ToneFamily] = None

    # Color values
    rgb: Optional[RGBColor] = None
    lab: Optional[LabColor] = None
    lch: Optional[LCHColor] = None

    # Shade properties
    is_natural: bool = False
    is_high_lift: bool = False
    is_clear: bool = False
    is_mix_toner: bool = False

    # Confidence & metadata
    intensity_score: float = 0.5  # 0-1
    undertone: Optional[str] = None
    description: Optional[str] = None
    best_for: List[str] = field(default_factory=list)
    not_recommended_for: List[str] = field(default_factory=list)

    def tone_string(self) -> str:
        """Return formatted tone string like 'N', 'A', 'G'."""
        tones = [self.primary_tone.value]
        if self.secondary_tone:
            tones.append(self.secondary_tone.value)
        if self.tertiary_tone:
            tones.append(self.tertiary_tone.value)
        return "".join(tones)

    def display_name(self) -> str:
        """Return 'Level Tone' formatted name."""
        return f"{self.level.value} {self.tone_string()}"

    def complement_codes(self) -> List[str]:
        """Return shade codes that mix well with this shade."""
        # Standard complementary mixing rules
        if self.primary_tone == ToneFamily.ASH:
            return [f"{self.level.value}G", f"{self.level.value}N"]
        if self.primary_tone == ToneFamily.GOLD:
            return [f"{self.level.value}A", f"{self.level.value}N"]
        if self.primary_tone == ToneFamily.COPPER:
            return [f"{self.level.value}R", f"{self.level.value}G"]
        if self.primary_tone == ToneFamily.VIOLET:
            return [f"{self.level.value}A", f"{self.level.value}P"]
        return []
