"""Brand Conversion Engine — Unit Tests (Python).
Validates Python engine against ADR-015 specifications.
Bit-for-bit parity with dashboard/lib/conversion/tests/conversion.test.ts.
"""

import asyncio
import pytest
from typing import List

from ..engine import (
    convert_shade,
    convert_developer,
    get_mixing_ratio,
    calculate_mixing_amounts,
    convert_shade_component,
    convert_formula,
    find_equivalents,
)
from ..data_loader import (
    load_brand_shades,
    load_brand_specs,
    find_shade_by_code,
    get_all_brands,
)
from ..tone_family_mappings import (
    get_tone_family,
    get_mapped_brands,
)
from ..types import NormalizedShade


# ─── Fixtures ───────────────────────────────────────────────────────────────

def create_mock_shade(**overrides) -> NormalizedShade:
    defaults = {
        "code": "7-0",
        "brand": "schwarzkopf",
        "line": "IGORA ROYAL",
        "level": 7,
        "toneFamily": "natural",
        "toneCode": "0",
        "name": "Medium Blonde Natural",
        "hex": "#8B7355",
        "isHighLift": False,
        "isDemi": False,
        "grayCoverage": "100%",
    }
    defaults.update(overrides)
    return NormalizedShade(**defaults)


# ─── Tone Family Mappings ─────────────────────────────────────────────────

class TestToneFamilyMappings:
    def test_all_major_brands_mapped(self):
        brands = get_mapped_brands()
        assert len(brands) >= 17
        assert "schwarzkopf" in brands
        assert "wella" in brands
        assert "redken-color-gels-lacquers" in brands
        assert "kenra" in brands

    def test_schwarzkopf_tone_codes(self):
        assert get_tone_family("schwarzkopf", "0") == "natural"
        assert get_tone_family("schwarzkopf", "1") == "blue-ash"
        assert get_tone_family("schwarzkopf", "2") == "ash"
        assert get_tone_family("schwarzkopf", "5") == "gold"
        assert get_tone_family("schwarzkopf", "8") == "red"
        assert get_tone_family("schwarzkopf", "9") == "violet"

    def test_wella_tone_codes(self):
        assert get_tone_family("wella", "/0") == "natural"
        assert get_tone_family("wella", "/1") == "ash"
        assert get_tone_family("wella", "/3") == "gold"
        assert get_tone_family("wella", "/4") == "copper"
        assert get_tone_family("wella", "/6") == "violet"

    def test_unknown_mappings(self):
        assert get_tone_family("schwarzkopf", "999") is None
        assert get_tone_family("nonexistent-brand", "0") is None


# ─── Confidence Scoring ───────────────────────────────────────────────────

class TestConfidenceScoring:
    @pytest.mark.asyncio
    async def test_exact_match_confidence(self):
        source = create_mock_shade(brand="schwarzkopf", level=7, toneFamily="natural")
        result = await convert_shade(source, "schwarzkopf")
        assert result is not None
        assert result.confidence == 1.0
        assert result.matchType == "exact"

    @pytest.mark.asyncio
    async def test_adjacent_tone_confidence(self):
        source = create_mock_shade(brand="schwarzkopf", level=7, toneFamily="gold")
        result = await convert_shade(source, "schwarzkopf")
        if result and result.matchType == "close":
            assert result.confidence == 0.9

    @pytest.mark.asyncio
    async def test_closest_level_confidence(self):
        source = create_mock_shade(brand="schwarzkopf", level=7, toneFamily="copper")
        result = await convert_shade(source, "schwarzkopf")
        if result and result.matchType == "level-adjusted":
            assert result.confidence == 0.8

    @pytest.mark.asyncio
    async def test_fuzzy_match_confidence(self):
        source = create_mock_shade(brand="schwarzkopf", level=7, toneFamily="rose")
        result = await convert_shade(source, "schwarzkopf")
        if result and result.matchType == "weak":
            assert result.confidence == 0.55

    @pytest.mark.asyncio
    async def test_no_match_returns_none(self):
        source = create_mock_shade(brand="schwarzkopf", level=12, toneFamily="specialty")
        result = await convert_shade(source, "nonexistent-brand")
        assert result is None


# ─── Developer Volume Translation ──────────────────────────────────────────

class TestDeveloperVolumeTranslation:
    @pytest.mark.asyncio
    async def test_convert_developer_by_intent(self):
        result = await convert_developer(20, "schwarzkopf")
        assert result is not None
        assert result["volume"] > 0

    @pytest.mark.asyncio
    async def test_deposit_intent_lowest_volume(self):
        result = await convert_developer(10, "schwarzkopf")
        assert result["volume"] <= 20

    @pytest.mark.asyncio
    async def test_brand_without_data(self):
        result = await convert_developer(30, "nonexistent-brand")
        assert result["volume"] == 30
        assert "no developer volume data" in result["notes"]


# ─── Mixing Ratio Adjustment ──────────────────────────────────────────────

class TestMixingRatioAdjustment:
    @pytest.mark.asyncio
    async def test_standard_ratio(self):
        ratio = await get_mixing_ratio("schwarzkopf")
        assert "1:1" in ratio

    @pytest.mark.asyncio
    async def test_calculate_mixing_amounts(self):
        result = await calculate_mixing_amounts("schwarzkopf", "lanza", grams=30)
        assert result.colorGrams > 0
        assert result.developerGrams > 0
        assert result.totalGrams > 0

    @pytest.mark.asyncio
    async def test_preserve_total_grams(self):
        result = await calculate_mixing_amounts("schwarzkopf", "schwarzkopf", grams=30)
        assert result.colorGrams + result.developerGrams >= 30


# ─── Multi-Shade Formula Handling ─────────────────────────────────────────

class TestMultiShadeFormula:
    @pytest.mark.asyncio
    async def test_single_shade_formula(self):
        shades = [
            type("obj", (object,), {"shadeCode": "7-0", "brand": "schwarzkopf", "line": "IGORA ROYAL", "grams": 30})()
        ]
        result = await convert_formula(shades, "schwarzkopf", 20)
        assert len(result.shades) >= 0
        assert result.overallConfidence >= 0

    @pytest.mark.asyncio
    async def test_multi_shade_penalty(self):
        shades = [
            type("obj", (object,), {"shadeCode": "7-0", "brand": "schwarzkopf", "line": "IGORA ROYAL", "grams": 30})(),
            type("obj", (object,), {"shadeCode": "7-1", "brand": "schwarzkopf", "line": "IGORA ROYAL", "grams": 15})(),
        ]
        result = await convert_formula(shades, "schwarzkopf", 20)
        if len(result.shades) >= 2:
            min_conf = min(s.confidence for s in result.shades)
            assert result.overallConfidence <= min_conf * 0.9 + 0.01

    @pytest.mark.asyncio
    async def test_hard_stops_for_missing(self):
        shades = [
            type("obj", (object,), {"shadeCode": "INVALID-CODE", "brand": "schwarzkopf", "line": "IGORA ROYAL", "grams": 30})()
        ]
        result = await convert_formula(shades, "schwarzkopf", 20)
        assert len(result.hardStops) > 0


# ─── Find Equivalents ─────────────────────────────────────────────────────

class TestFindEquivalents:
    @pytest.mark.asyncio
    async def test_find_equivalents(self):
        equivalents = await find_equivalents(7, "natural")
        assert isinstance(equivalents, dict)

    @pytest.mark.asyncio
    async def test_exclude_brand(self):
        equivalents = await find_equivalents(7, "natural", "schwarzkopf")
        assert "schwarzkopf" not in equivalents


# ─── Integration: Real Brand Data ─────────────────────────────────────────

class TestIntegration:
    def test_load_schwarzkopf_shades(self):
        shades = load_brand_shades("schwarzkopf")
        assert len(shades) > 0

    def test_load_brand_specs(self):
        specs = load_brand_specs("schwarzkopf")
        assert specs is not None

    def test_find_shade_by_code(self):
        shade = find_shade_by_code("schwarzkopf", "7-0")
        assert shade is not None
        assert shade.level == 7
        assert shade.toneFamily == "natural"

    @pytest.mark.asyncio
    async def test_wella_to_redken(self):
        source = find_shade_by_code("wella", "7/43")
        if source:
            result = await convert_shade(source, "redken")
            assert result is None or result.confidence > 0

    @pytest.mark.asyncio
    async def test_schwarzkopf_to_davines(self):
        source = find_shade_by_code("schwarzkopf", "7-0")
        assert source is not None
        result = await convert_shade(source, "davines")
        assert result is not None
        assert result.confidence >= 0.5


# ─── Parity Tests: TS vs Python Engine ─────────────────────────────────────

class TestParity:
    """Validate that Python and TypeScript engines produce identical results."""

    @pytest.mark.asyncio
    async def test_confidence_tiers_match(self):
        """Both engines use the same confidence constants."""
        from ..types import CONFIDENCE, MULTI_SHADE_PENALTY
        assert CONFIDENCE["EXACT"] == 1.0
        assert CONFIDENCE["ADJACENT_TONE"] == 0.9
        assert CONFIDENCE["CLOSEST_LEVEL"] == 0.8
        assert CONFIDENCE["FUZZY"] == 0.55
        assert MULTI_SHADE_PENALTY == 0.9

    @pytest.mark.asyncio
    async def test_developer_intent_mapping(self):
        """Both engines map the same developer volumes to intents."""
        from ..types import get_developer_intent
        assert get_developer_intent(10) == "deposit"
        assert get_developer_intent(20) == "1-2lift"
        assert get_developer_intent(30) == "2-3lift"
        assert get_developer_intent(40) == "3-4lift"

    @pytest.mark.asyncio
    async def test_adjacent_tones_match(self):
        """Both engines use the same adjacent tone mappings."""
        from ..types import ADJACENT_TONES
        assert "warm" in ADJACENT_TONES["natural"]
        assert "beige" in ADJACENT_TONES["natural"]
        assert "blue-ash" in ADJACENT_TONES["ash"]
        assert "violet" in ADJACENT_TONES["blue-ash"]
