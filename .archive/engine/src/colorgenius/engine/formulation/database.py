"""
Color Line Database.

Database schema and product information for professional color lines.
Supports Schwarzkopf, Redken, Wella, Matrix, and more.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Tuple
from enum import Enum

from colorgenius.engine.color_science.models import (
    ShadeProfile,
    ColorLevel,
    ToneFamily,
)


class Brand(str, Enum):
    """Supported professional hair color brands."""

    SCHWARZKOPF = "schwarzkopf"
    REDKEN = "redken"
    WELLA = "wella"
    MATRIX = "matrix"
    JOICO = "joico"
    PRAVANA = "pravana"
    PULP_RIOT = "pulp_riot"
    GOLDWELL = "goldwell"
    KENRA = "kenra"
    OLAPLEX = "olaplex"


class ProductLineCode(str, Enum):
    """Product line codes."""

    # Schwarzkopf
    IGORA_ROYAL = "SKIR"
    IGORA_VIBRANCE = "SKIV"
    BLONDME = "SKBM"

    # Redken
    SHADES_EQ = "RSEQ"
    COLOR_GELS = "RCGL"
    CHROMATICS = "RCHR"

    # Wella
    KOLESTON = "WKPM"
    ILLUMINA = "WILL"
    COLOR_TOUCH = "WCT"

    # Matrix
    SOCOLOR = "MTSC"
    COLOR_SYNC = "MTCS"

    # Joico
    LUMISHINE = "JOLS"
    VERO_KPAK = "JOVK"

    # Goldwell
    TOPCHIC = "GWTC"
    COLORANCE = "GWCR"


@dataclass
class ProductLine:
    """Product line specification."""

    code: str
    brand: Brand
    name: str

    color_type: str  # permanent, demi-permanent, semi-permanent, bleach, toner

    # Chemistry
    ammonia_free: bool = False
    plex_technology: Optional[str] = None  # 'olaplex', 'b3', etc.
    alkaline_agent: str = "ammonia"  # ammonia, mea, amp

    # Performance
    max_gray_coverage: int = 100
    max_lift_levels: int = 3

    # Mixing
    mixing_ratio: str = "1:1"
    developer_options: List[int] = field(default_factory=lambda: [10, 20, 30, 40])

    # Processing
    base_processing_time: int = 30
    max_processing_time: int = 45

    # Special shades
    has_clear: bool = False
    has_concentrates: bool = False  # Pure tone boosters

    def supports_volume(self, volume: int) -> bool:
        """Check if this product line supports the given developer volume."""
        return volume in self.developer_options

    def requires_ammonia(self) -> bool:
        """Check if this line requires ammonia (not ammonia-free)."""
        return not self.ammonia_free


@dataclass
class ShadeDatabaseEntry:
    """Complete shade information for database lookup."""

    shade_code: str
    shade_name: str
    product_line_code: str

    level: int  # 1-10
    primary_tone: str
    secondary_tone: Optional[str] = None

    # Color values (Lab)
    lab_l: float = 0.0
    lab_a: float = 0.0
    lab_b: float = 0.0

    # Properties
    is_natural: bool = False
    is_high_lift: bool = False
    is_clear: bool = False
    is_concentrate: bool = False

    # Usage hints
    best_for: List[str] = field(default_factory=list)
    not_recommended_for: List[str] = field(default_factory=list)

    def to_shade_profile(self) -> ShadeProfile:
        """Convert to ShadeProfile model."""
        from colorgenius.engine.color_science.models import RGBColor, LabColor, LCHColor
        from colorgenius.engine.color_science.conversions import ColorConverter

        converter = ColorConverter()
        lab = LabColor(l=self.lab_l, a=self.lab_a, b=self.lab_b)
        lch = converter.lab_to_lch(
            RGBColor(
                r=int(128 + self.lab_a * 2),
                g=int(128 - self.lab_a - self.lab_b),
                b=int(128 - self.lab_b * 2),
            )
        )

        return ShadeProfile(
            shade_code=self.shade_code,
            shade_name=self.shade_name,
            level=ColorLevel(self.level),
            primary_tone=ToneFamily.from_code(self.primary_tone),
            secondary_tone=ToneFamily.from_code(self.secondary_tone) if self.secondary_tone else None,
            lab=lab,
            lch=lch,
            is_natural=self.is_natural,
            is_high_lift=self.is_high_lift,
            is_clear=self.is_clear,
            undertone=self.primary_tone,
        )


class ColorLineDatabase:
    """
    Database of professional color line products and shades.

    Provides:
    - Shade lookup by level and tone
    - Product line information
    - Cross-brand equivalent shades
    - Formulation rules
    """

    def __init__(self):
        self._product_lines: Dict[str, ProductLine] = {}
        self._shade_database: Dict[str, List[ShadeDatabaseEntry]] = {}
        self._formulation_rules: Dict[str, List[Dict]] = {}

        self._initialize_product_lines()
        self._initialize_shade_database()
        self._initialize_formulation_rules()

    def _initialize_product_lines(self) -> None:
        """Initialize all supported product lines."""
        product_lines = [
            # Schwarzkopf IGORA ROYAL
            ProductLine(
                code="SKIR",
                brand=Brand.SCHWARZKOPF,
                name="IGORA ROYAL",
                color_type="permanent",
                ammonia_free=False,
                max_gray_coverage=100,
                max_lift_levels=3,
                mixing_ratio="1:1",
                developer_options=[6, 9, 12, 30, 40],
                base_processing_time=30,
                has_clear=True,
                has_concentrates=True,
            ),
            # Redken Shades EQ
            ProductLine(
                code="RSEQ",
                brand=Brand.REDKEN,
                name="Shades EQ",
                color_type="demi-permanent",
                ammonia_free=True,
                alkaline_agent="MEA",
                max_gray_coverage=75,
                max_lift_levels=0,
                mixing_ratio="1:1",
                developer_options=[10],
                base_processing_time=20,
            ),
            # Redken Color Gels Lacquers
            ProductLine(
                code="RCGL",
                brand=Brand.REDKEN,
                name="Color Gels Lacquers",
                color_type="permanent",
                ammonia_free=False,
                max_gray_coverage=100,
                max_lift_levels=2,
                mixing_ratio="1:1",
                developer_options=[10, 20, 30, 40],
                base_processing_time=35,
            ),
            # Wella Koleston Perfect ME+
            ProductLine(
                code="WKPM",
                brand=Brand.WELLA,
                name="Koleston Perfect ME+",
                color_type="permanent",
                ammonia_free=False,
                plex_technology="ME+",
                max_gray_coverage=100,
                max_lift_levels=4,
                mixing_ratio="1:1",
                developer_options=[6, 9, 12, 18, 24, 30, 40],
                base_processing_time=30,
                has_clear=True,
                has_concentrates=True,
            ),
            # Wella Illumina Color
            ProductLine(
                code="WILL",
                brand=Brand.WELLA,
                name="Illumina Color",
                color_type="permanent",
                ammonia_free=True,
                plex_technology="microlight",
                max_gray_coverage=100,
                max_lift_levels=2,
                mixing_ratio="1:1",
                developer_options=[6, 9, 12, 18, 24, 30],
                base_processing_time=25,
            ),
            # Matrix SoColor
            ProductLine(
                code="MTSC",
                brand=Brand.MATRIX,
                name="SoColor",
                color_type="permanent",
                ammonia_free=False,
                max_gray_coverage=100,
                max_lift_levels=2,
                mixing_ratio="1:1",
                developer_options=[10, 20, 30, 40],
                base_processing_time=35,
            ),
            # Matrix Color Sync
            ProductLine(
                code="MTCS",
                brand=Brand.MATRIX,
                name="Color Sync",
                color_type="demi-permanent",
                ammonia_free=True,
                max_gray_coverage=50,
                max_lift_levels=0,
                mixing_ratio="1:1",
                developer_options=[10],
                base_processing_time=20,
            ),
            # Schwarzkopf BlondMe
            ProductLine(
                code="SKBM",
                brand=Brand.SCHWARZKOPF,
                name="BlondMe",
                color_type="bleach",
                max_lift_levels=9,
                mixing_ratio="1:1.5",
                developer_options=[6, 9, 12, 20, 30, 40],
                base_processing_time=35,
            ),
        ]

        for pl in product_lines:
            self._product_lines[pl.code] = pl

    def _initialize_shade_database(self) -> None:
        """Initialize shade database with common shades."""
        # Common shade definitions (representative samples)
        # Production would load from actual product catalogs

        common_shades = [
            # Level 5 (Light Brown)
            ShadeDatabaseEntry(
                shade_code="5-0", shade_name="Light Brown Natural",
                product_line_code="SKIR", level=5, primary_tone="N",
                lab_l=42, lab_a=8, lab_b=18, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="5-1", shade_name="Light Brown Cendre",
                product_line_code="SKIR", level=5, primary_tone="A",
                lab_l=40, lab_a=5, lab_b=12, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="5-5", shade_name="Light Brown Gold",
                product_line_code="SKIR", level=5, primary_tone="G",
                lab_l=44, lab_a=10, lab_b=25, is_natural=True,
            ),
            # Level 6 (Dark Blonde)
            ShadeDatabaseEntry(
                shade_code="6-0", shade_name="Dark Blonde Natural",
                product_line_code="SKIR", level=6, primary_tone="N",
                lab_l=52, lab_a=6, lab_b=16, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="6-1", shade_name="Dark Blonde Cendre",
                product_line_code="SKIR", level=6, primary_tone="A",
                lab_l=50, lab_a=3, lab_b=10, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="6-5", shade_name="Dark Blonde Gold",
                product_line_code="SKIR", level=6, primary_tone="G",
                lab_l=54, lab_a=8, lab_b=24, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="6-99", shade_name="Dark Blonde Intense Violet",
                product_line_code="SKIR", level=6, primary_tone="V",
                lab_l=48, lab_a=12, lab_b=-8, is_natural=False,
            ),
            # Level 7 (Medium Blonde)
            ShadeDatabaseEntry(
                shade_code="7-0", shade_name="Medium Blonde Natural",
                product_line_code="SKIR", level=7, primary_tone="N",
                lab_l=60, lab_a=4, lab_b=14, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7-1", shade_name="Medium Blonde Cendre",
                product_line_code="SKIR", level=7, primary_tone="A",
                lab_l=58, lab_a=2, lab_b=8, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7-4", shade_name="Medium Blonde Beige",
                product_line_code="SKIR", level=7, primary_tone="B",
                lab_l=62, lab_a=3, lab_b=18, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7-77", shade_name="Medium Blonde Intense Copper",
                product_line_code="SKIR", level=7, primary_tone="C",
                lab_l=56, lab_a=22, lab_b=32, is_natural=False,
            ),
            # Level 8 (Light Blonde)
            ShadeDatabaseEntry(
                shade_code="8-0", shade_name="Light Blonde Natural",
                product_line_code="SKIR", level=8, primary_tone="N",
                lab_l=68, lab_a=2, lab_b=12, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8-1", shade_name="Light Blonde Cendre",
                product_line_code="SKIR", level=8, primary_tone="A",
                lab_l=66, lab_a=0, lab_b=6, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8-11", shade_name="Light Blonde Cendre Ash",
                product_line_code="SKIR", level=8, primary_tone="A",
                secondary_tone="A",
                lab_l=64, lab_a=-2, lab_b=3, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8-4", shade_name="Light Blonde Beige",
                product_line_code="SKIR", level=8, primary_tone="B",
                lab_l=70, lab_a=2, lab_b=16, is_natural=True,
            ),
            # Level 9 (Very Light Blonde)
            ShadeDatabaseEntry(
                shade_code="9-0", shade_name="Very Light Blonde Natural",
                product_line_code="SKIR", level=9, primary_tone="N",
                lab_l=76, lab_a=0, lab_b=10, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="9-1", shade_name="Very Light Blonde Cendre",
                product_line_code="SKIR", level=9, primary_tone="A",
                lab_l=74, lab_a=-2, lab_b=4, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="9-5", shade_name="Very Light Blonde Gold",
                product_line_code="SKIR", level=9, primary_tone="G",
                lab_l=78, lab_a=3, lab_b=20, is_natural=True,
            ),
            # Level 10 (Lightest Blonde)
            ShadeDatabaseEntry(
                shade_code="10-0", shade_name="Lightest Blonde Natural",
                product_line_code="SKIR", level=10, primary_tone="N",
                lab_l=84, lab_a=-1, lab_b=8, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="10-1", shade_name="Lightest Blonde Cendre",
                product_line_code="SKIR", level=10, primary_tone="A",
                lab_l=82, lab_a=-3, lab_b=2, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="12-11", shade_name="Special Blonde Cendre Ash",
                product_line_code="SKIR", level=12, primary_tone="A",
                secondary_tone="A",
                lab_l=90, lab_a=-4, lab_b=1, is_high_lift=True,
            ),
            # Redken Shades EQ
            ShadeDatabaseEntry(
                shade_code="6N", shade_name="Dark Blonde Natural",
                product_line_code="RSEQ", level=6, primary_tone="N",
                lab_l=52, lab_a=6, lab_b=16, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="6A", shade_name="Dark Blonde Ash",
                product_line_code="RSEQ", level=6, primary_tone="A",
                lab_l=50, lab_a=2, lab_b=8, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7N", shade_name="Medium Blonde Natural",
                product_line_code="RSEQ", level=7, primary_tone="N",
                lab_l=60, lab_a=4, lab_b=14, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7G", shade_name="Medium Blonde Gold",
                product_line_code="RSEQ", level=7, primary_tone="G",
                lab_l=62, lab_a=6, lab_b=22, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7V", shade_name="Medium Blonde Violet",
                product_line_code="RSEQ", level=7, primary_tone="V",
                lab_l=56, lab_a=10, lab_b=-12, is_natural=False,
            ),
            ShadeDatabaseEntry(
                shade_code="8N", shade_name="Light Blonde Natural",
                product_line_code="RSEQ", level=8, primary_tone="N",
                lab_l=68, lab_a=2, lab_b=12, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="9N", shade_name="Very Light Blonde Natural",
                product_line_code="RSEQ", level=9, primary_tone="N",
                lab_l=76, lab_a=0, lab_b=10, is_natural=True,
            ),
            # Wella Koleston
            ShadeDatabaseEntry(
                shade_code="6/0", shade_name="Dark Blonde Natural",
                product_line_code="WKPM", level=6, primary_tone="N",
                lab_l=52, lab_a=6, lab_b=16, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7/0", shade_name="Medium Blonde Natural",
                product_line_code="WKPM", level=7, primary_tone="N",
                lab_l=60, lab_a=4, lab_b=14, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7/1", shade_name="Medium Blonde Ash",
                product_line_code="WKPM", level=7, primary_tone="A",
                lab_l=58, lab_a=2, lab_b=8, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8/0", shade_name="Light Blonde Natural",
                product_line_code="WKPM", level=8, primary_tone="N",
                lab_l=68, lab_a=2, lab_b=12, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8/1", shade_name="Light Blonde Ash",
                product_line_code="WKPM", level=8, primary_tone="A",
                lab_l=66, lab_a=0, lab_b=6, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="9/0", shade_name="Very Light Blonde Natural",
                product_line_code="WKPM", level=9, primary_tone="N",
                lab_l=76, lab_a=0, lab_b=10, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="10/0", shade_name="Lightest Blonde Natural",
                product_line_code="WKPM", level=10, primary_tone="N",
                lab_l=84, lab_a=-1, lab_b=8, is_natural=True,
            ),
            # Matrix SoColor
            ShadeDatabaseEntry(
                shade_code="6N", shade_name="Dark Blonde Natural",
                product_line_code="MTSC", level=6, primary_tone="N",
                lab_l=52, lab_a=6, lab_b=16, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="7N", shade_name="Medium Blonde Natural",
                product_line_code="MTSC", level=7, primary_tone="N",
                lab_l=60, lab_a=4, lab_b=14, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8N", shade_name="Light Blonde Natural",
                product_line_code="MTSC", level=8, primary_tone="N",
                lab_l=68, lab_a=2, lab_b=12, is_natural=True,
            ),
            ShadeDatabaseEntry(
                shade_code="8G", shade_name="Light Blonde Gold",
                product_line_code="MTSC", level=8, primary_tone="G",
                lab_l=70, lab_a=4, lab_b=22, is_natural=True,
            ),
            # Clear/Diluter
            ShadeDatabaseEntry(
                shade_code="0-00", shade_name="Clear",
                product_line_code="SKIR", level=10, primary_tone="N",
                lab_l=100, lab_a=0, lab_b=0, is_clear=True,
            ),
        ]

        # Index by product line
        for shade in common_shades:
            if shade.product_line_code not in self._shade_database:
                self._shade_database[shade.product_line_code] = []
            self._shade_database[shade.product_line_code].append(shade)

    def _initialize_formulation_rules(self) -> None:
        """Initialize formulation rules per product line."""
        # Rules stored as condition -> action mappings
        self._formulation_rules = {
            "SKIR": [
                {
                    "rule": "High Lift shades require 30 or 40 vol",
                    "condition": {"shade_pattern": "^12-"},
                    "action": {"developer_required": [30, 40]},
                },
                {
                    "rule": "For resistant gray, mix with 0-00 Natural",
                    "condition": {"gray_percentage": ">70"},
                    "action": {"mix_with_clear": True, "ratio": "2:1"},
                },
            ],
            "RSEQ": [
                {
                    "rule": "For gray coverage >50%, use N series",
                    "condition": {"gray_percentage": ">50"},
                    "action": {"require_natural_series": True},
                },
            ],
            "WKPM": [
                {
                    "rule": "High Lift (12/) requires 30-40 vol",
                    "condition": {"shade_pattern": "^12/"},
                    "action": {"developer_required": [30, 40]},
                },
            ],
        }

    # -------------------------------------------------------------------------
    # Product Line Access
    # -------------------------------------------------------------------------

    def get_product_line(self, code: str) -> Optional[ProductLine]:
        """Get product line by code."""
        return self._product_lines.get(code)

    def get_product_lines_by_brand(self, brand: Brand) -> List[ProductLine]:
        """Get all product lines for a brand."""
        return [pl for pl in self._product_lines.values() if pl.brand == brand]

    def get_all_brands(self) -> List[Brand]:
        """Get list of all supported brands."""
        return list(set(pl.brand for pl in self._product_lines.values()))

    # -------------------------------------------------------------------------
    # Shade Lookup
    # -------------------------------------------------------------------------

    def find_shade(
        self,
        product_line_code: str,
        level: int,
        tone: str,
        tone_family: Optional[str] = None,
    ) -> Optional[ShadeDatabaseEntry]:
        """
        Find shade by product line, level, and tone.

        Args:
            product_line_code: Product line code (e.g., 'SKIR')
            level: 1-10
            tone: Tone code (N, A, G, V, etc.)
            tone_family: Optional secondary tone

        Returns:
            Matching shade or None
        """
        shades = self._shade_database.get(product_line_code, [])

        # Filter by level
        candidates = [s for s in shades if s.level == level]

        # Filter by tone
        tone = tone.upper()
        tone_candidates = [s for s in candidates if s.primary_tone == tone]

        if not tone_candidates and candidates:
            # Fallback: return any shade at this level
            tone_candidates = candidates

        # Prefer natural shades
        for shade in tone_candidates:
            if shade.is_natural:
                return shade

        return tone_candidates[0] if tone_candidates else None

    def find_shades_by_level(
        self,
        product_line_code: str,
        level: int,
    ) -> List[ShadeDatabaseEntry]:
        """Get all shades at a specific level for a product line."""
        shades = self._shade_database.get(product_line_code, [])
        return [s for s in shades if s.level == level]

    def find_natural_shade(
        self,
        product_line_code: str,
        level: int,
    ) -> Optional[ShadeDatabaseEntry]:
        """Find natural (N) shade at level for gray coverage."""
        shade = self.find_shade(product_line_code, level, "N")
        if shade:
            shade.is_natural = True
        return shade

    # -------------------------------------------------------------------------
    # Cross-Brand Equivalents
    # -------------------------------------------------------------------------

    def find_equivalent(
        self,
        shade: ShadeDatabaseEntry,
        target_brand: Brand,
    ) -> Optional[ShadeDatabaseEntry]:
        """
        Find equivalent shade in another brand.

        Args:
            shade: Source shade
            target_brand: Target brand

        Returns:
            Equivalent shade or None
        """
        target_lines = self.get_product_lines_by_brand(target_brand)

        for line in target_lines:
            candidates = self.find_shades_by_level(line.code, shade.level)
            for candidate in candidates:
                if candidate.primary_tone == shade.primary_tone:
                    return candidate
                # Check secondary tone
                if shade.secondary_tone and candidate.secondary_tone:
                    if candidate.secondary_tone == shade.secondary_tone:
                        return candidate

        return None

    # -------------------------------------------------------------------------
    # Formulation Rules
    # -------------------------------------------------------------------------

    def get_rules_for_line(self, product_line_code: str) -> List[Dict]:
        """Get formulation rules for a product line."""
        return self._formulation_rules.get(product_line_code, [])

    def apply_rules(
        self,
        product_line_code: str,
        context: Dict,
    ) -> Tuple[List[str], List[str]]:
        """
        Apply formulation rules to get warnings and actions.

        Args:
            product_line_code: Product line code
            context: Formulation context (gray_percentage, etc.)

        Returns:
            Tuple of (warnings, actions)
        """
        rules = self.get_rules_for_line(product_line_code)
        warnings = []
        actions = []

        for rule in rules:
            if self._rule_matches(rule["condition"], context):
                warnings.append(rule["rule"])
                actions.append(rule["action"])

        return warnings, actions

    def _rule_matches(self, condition: Dict, context: Dict) -> bool:
        """Check if a rule's condition matches the context."""
        for key, value in condition.items():
            if key.startswith("gray_percentage"):
                op = key.replace("gray_percentage", "")
                ctx_val = context.get("gray_percentage", 0)
                threshold = int(value.replace(">", "").replace("<", ""))
                if op == ">":
                    return ctx_val > threshold
                elif op == "<":
                    return ctx_val < threshold
            elif key == "shade_pattern":
                shade_code = context.get("shade_code", "")
                import re

                return bool(re.match(value, shade_code))
        return False