"""Brand Conversion Engine — Core Algorithm (Python).
Bit-for-bit identical logic to dashboard/lib/conversion/engine.ts.
ADR-015 §3: Universal (level, toneFamily) matching with confidence scoring.
"""

from __future__ import annotations
import re
from typing import List, Dict, Optional, Tuple

from .types import (
    NormalizedShade,
    MatchCandidate,
    ConvertedShade,
    ConversionResult,
    DeveloperResult,
    MixingAmountsResult,
    ShadeConversionRequest,
    ToneFamily,
    ADJACENT_TONES,
    get_developer_intent,
    CONFIDENCE,
    MULTI_SHADE_PENALTY,
)
from .data_loader import (
    load_brand_shades,
    load_brand_specs,
    find_shade_by_code,
    get_preferred_line,
    get_all_brands,
)
from .tone_family_mappings import get_tone_family


# ─── Core Conversion: Single Shade ────────────────────────────────────────

async def convert_shade(
    source_shade: NormalizedShade,
    target_brand: str,
    target_line: Optional[str] = None,
) -> Optional[MatchCandidate]:
    """Convert a single shade with full confidence scoring.
    ADR-015 §3.1 — 4-tier matching with precise confidence values.
    """
    target_shades = load_brand_shades(target_brand)
    line_filter = target_line or get_preferred_line(target_brand)

    candidates: List[MatchCandidate] = []

    # ── Tier 1: Exact match ──
    exact_matches = [
        s for s in target_shades
        if s.level == source_shade.level
        and s.toneFamily == source_shade.toneFamily
        and (not target_line or s.line == target_line)
    ]
    if exact_matches:
        best = next((s for s in exact_matches if s.line == line_filter), exact_matches[0])
        candidates.append(MatchCandidate(
            shade=best,
            confidence=CONFIDENCE["EXACT"],
            matchType="exact",
            notes=f"Exact match: level {source_shade.level}, tone {source_shade.toneFamily}",
        ))

    # ── Tier 2: Adjacent tone ──
    if not candidates:
        adjacent = ADJACENT_TONES.get(source_shade.toneFamily, [])
        for adj_tone in adjacent:
            close_matches = [
                s for s in target_shades
                if s.level == source_shade.level
                and s.toneFamily == adj_tone
                and (not target_line or s.line == target_line)
            ]
            if close_matches:
                best = next((s for s in close_matches if s.line == line_filter), close_matches[0])
                candidates.append(MatchCandidate(
                    shade=best,
                    confidence=CONFIDENCE["ADJACENT_TONE"],
                    matchType="close",
                    notes=f"Adjacent tone match: level {source_shade.level}, tone {adj_tone} (adjacent to {source_shade.toneFamily})",
                ))
                break

    # ── Tier 3: Closest level ──
    if not candidates:
        for delta in (-1, 1):
            adj_level = source_shade.level + delta
            if adj_level < 1 or adj_level > 12:
                continue
            level_adj_matches = [
                s for s in target_shades
                if s.level == adj_level
                and s.toneFamily == source_shade.toneFamily
                and (not target_line or s.line == target_line)
            ]
            if level_adj_matches:
                best = next((s for s in level_adj_matches if s.line == line_filter), level_adj_matches[0])
                candidates.append(MatchCandidate(
                    shade=best,
                    confidence=CONFIDENCE["CLOSEST_LEVEL"],
                    matchType="level-adjusted",
                    notes=f"Closest level match: level {adj_level} (source was {source_shade.level}), tone {source_shade.toneFamily}",
                ))
                break

    # ── Tier 4: Fuzzy match ──
    if not candidates:
        adjacent = ADJACENT_TONES.get(source_shade.toneFamily, [])
        for delta in (-1, 1):
            adj_level = source_shade.level + delta
            if adj_level < 1 or adj_level > 12:
                continue
            for adj_tone in adjacent:
                weak_matches = [
                    s for s in target_shades
                    if s.level == adj_level
                    and s.toneFamily == adj_tone
                    and (not target_line or s.line == target_line)
                ]
                if weak_matches:
                    best = next((s for s in weak_matches if s.line == line_filter), weak_matches[0])
                    candidates.append(MatchCandidate(
                        shade=best,
                        confidence=CONFIDENCE["FUZZY"],
                        matchType="weak",
                        notes=f"Fuzzy match: level {adj_level} (source was {source_shade.level}), tone {adj_tone} (adjacent to {source_shade.toneFamily})",
                    ))
                    break
            if candidates:
                break

    if not candidates:
        return None

    candidates.sort(key=lambda x: x.confidence, reverse=True)
    return candidates[0]


# ─── Developer Volume Translation ──────────────────────────────────────────

INTENT_TO_VOLUME: Dict[str, int] = {
    "deposit": 10,
    "1-2lift": 20,
    "2-3lift": 30,
    "3-4lift": 40,
    "4+lift": 40,
}


async def convert_developer(
    original_volume: int,
    target_brand: str,
) -> Dict[str, any]:
    """Convert developer volume based on semantic intent.
    ADR-015 §4.2: Map source developer to closest target developer
    by semantic intent, not numeric equivalence.
    """
    specs = load_brand_specs(target_brand)
    intent = get_developer_intent(original_volume)

    # Collect available volumes from brand specs
    available_volumes: List[int] = []

    if specs and specs.developerVolumes:
        available_volumes = specs.developerVolumes
    elif specs and specs.developers:
        devs = specs.developers
        if isinstance(devs, list):
            available_volumes = [d.get("volume") for d in devs if d.get("volume") is not None]
        elif isinstance(devs, dict) and devs.get("volumes"):
            available_volumes = devs["volumes"]

    # Fallback: try lines
    if not available_volumes and specs and specs.lines:
        for line in specs.lines:
            if line.get("developerVolumes"):
                available_volumes.extend(line["developerVolumes"])
        available_volumes = list(set(available_volumes))

    if not available_volumes:
        return {
            "volume": original_volume,
            "notes": f'Target brand "{target_brand}" has no developer volume data; using original {original_volume}vol',
        }

    target_preferred = INTENT_TO_VOLUME.get(intent, original_volume)

    # Find closest available volume
    sorted_volumes = sorted(available_volumes)
    closest = sorted_volumes[0]
    min_diff = abs(target_preferred - closest)

    for v in sorted_volumes:
        diff = abs(target_preferred - v)
        if diff < min_diff:
            min_diff = diff
            closest = v

    notes = None
    if closest != target_preferred:
        notes = f"Intent: {intent}. Target brand does not offer {target_preferred}vol; closest available is {closest}vol."
        if closest < target_preferred and specs and specs.formulationGuidelines:
            if specs.formulationGuidelines.get("processing_times"):
                notes += " Consider extending processing time per manufacturer guidelines."

    return {"volume": closest, "notes": notes}


# ─── Mixing Ratio Adjustment ─────────────────────────────────────────────

def _parse_ratio(ratio: str) -> Optional[Tuple[float, float]]:
    """Extract numeric ratio parts (e.g., '1:1.5' → (1, 1.5))."""
    match = re.search(r"(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)", ratio)
    if not match:
        return None
    return (float(match.group(1)), float(match.group(2)))


async def get_mixing_ratio(target_brand: str, target_line: Optional[str] = None) -> str:
    """Get the mixing ratio for the target brand/line."""
    specs = load_brand_specs(target_brand)

    if target_line and specs and specs.lines:
        line_spec = next((l for l in specs.lines if l.get("name") == target_line), None)
        if line_spec and line_spec.get("mixRatio"):
            return line_spec["mixRatio"]

    if specs and specs.mixRatio:
        return specs.mixRatio

    return "1:1"


async def calculate_mixing_amounts(
    source_brand: str,
    target_brand: str,
    source_line: Optional[str] = None,
    target_line: Optional[str] = None,
    grams: int = 30,
) -> MixingAmountsResult:
    """Calculate adjusted product amounts when converting across brands.
    ADR-015 §4.3: Different brands use different ratios.
    We preserve total formula weight but calculate per-component amounts.
    """
    source_ratio = await get_mixing_ratio(source_brand, source_line)
    target_ratio = await get_mixing_ratio(target_brand, target_line)

    source_parsed = _parse_ratio(source_ratio)
    target_parsed = _parse_ratio(target_ratio)

    if not source_parsed or not target_parsed:
        return MixingAmountsResult(
            colorGrams=grams,
            developerGrams=grams,
            sourceRatio=source_ratio,
            targetRatio=target_ratio,
            totalGrams=grams * 2,
            notes="Could not parse mixing ratios; defaulting to equal parts.",
        )

    s_color, s_dev = source_parsed
    t_color, t_dev = target_parsed

    source_total_parts = s_color + s_dev
    target_total_parts = t_color + t_dev

    # Calculate color amount to maintain same total output
    color_grams = round((grams * source_total_parts / s_color) * (t_color / target_total_parts))
    developer_grams = round(color_grams * (t_dev / t_color))
    total_grams = color_grams + developer_grams

    notes = None
    if source_ratio != target_ratio:
        notes = f"Mixing ratio changed from {source_ratio} to {target_ratio}. Total formula: {total_grams}g (color {color_grams}g + developer {developer_grams}g)."

    return MixingAmountsResult(
        colorGrams=color_grams,
        developerGrams=developer_grams,
        sourceRatio=source_ratio,
        targetRatio=target_ratio,
        totalGrams=total_grams,
        notes=notes,
    )


# ─── Multi-Shade Formula Handling ──────────────────────────────────────────

async def convert_shade_component(
    shade_req: ShadeConversionRequest,
    target_brand: str,
    target_line: Optional[str] = None,
) -> Dict[str, any]:
    """Convert a single shade component (used by multi-shade formulas)."""
    source_shade = find_shade_by_code(shade_req.brand, shade_req.shadeCode)
    if not source_shade:
        return {
            "converted": None,
            "hardStop": f'Source shade "{shade_req.shadeCode}" not found in {shade_req.brand} data.',
        }

    match = await convert_shade(source_shade, target_brand, target_line)

    if not match:
        return {
            "converted": None,
            "hardStop": f"No equivalent shade found for {shade_req.shadeCode} (level {source_shade.level}, tone {source_shade.toneFamily}) in {target_brand}. Recommend custom formulation.",
        }

    result = ConvertedShade(
        originalCode=shade_req.shadeCode,
        originalBrand=shade_req.brand,
        convertedCode=match.shade.code,
        convertedBrand=match.shade.brand,
        convertedLine=match.shade.line,
        convertedName=match.shade.name,
        convertedHex=match.shade.hex,
        grams=shade_req.grams,
        confidence=match.confidence,
        matchType=match.matchType,
        notes=match.notes,
    )

    warning = None
    if match.matchType == "weak":
        warning = f"Weak match for {shade_req.shadeCode} → {match.shade.code}. Review with senior colorist."

    return {"converted": result, "warning": warning}


# ─── Main Conversion Entry Point ───────────────────────────────────────────

async def convert_formula(
    shades: List[ShadeConversionRequest],
    target_brand: str,
    developer_volume: int,
    target_line: Optional[str] = None,
) -> ConversionResult:
    """Convert a formula (single or multi-shade) with full confidence scoring.
    ADR-015 §3.2: Multi-shade formulas — overall confidence = lowest shade confidence × 0.9
    """
    hard_stops: List[str] = []
    warnings: List[str] = []
    converted_shades: List[ConvertedShade] = []

    for shade_req in shades:
        result = await convert_shade_component(shade_req, target_brand, target_line)

        if result.get("hardStop"):
            hard_stops.append(result["hardStop"])
        if result.get("warning"):
            warnings.append(result["warning"])
        if result.get("converted"):
            converted_shades.append(result["converted"])

    # Developer and mixing ratio
    dev_conversion = await convert_developer(developer_volume, target_brand)
    mixing_ratio = await get_mixing_ratio(target_brand, target_line)

    # Calculate overall confidence
    confidences = [s.confidence for s in converted_shades]

    if not confidences:
        overall_confidence = 0.0
    elif len(confidences) == 1:
        overall_confidence = confidences[0]
    else:
        # Multi-shade: lowest shade confidence × penalty factor
        min_confidence = min(confidences)
        overall_confidence = round(min_confidence * MULTI_SHADE_PENALTY, 2)

    # Warnings for low confidence
    if overall_confidence < 0.7 and converted_shades:
        warnings.append(
            f"Overall confidence ({int(overall_confidence * 100)}%) is low. Manual review recommended."
        )

    return ConversionResult(
        shades=converted_shades,
        developer=DeveloperResult(
            originalVolume=developer_volume,
            convertedVolume=dev_conversion["volume"],
            mixingRatio=mixing_ratio,
            notes=dev_conversion.get("notes"),
        ),
        overallConfidence=round(overall_confidence, 2),
        hardStops=hard_stops,
        warnings=warnings,
    )


# ─── Find Equivalents Across Brands ──────────────────────────────────────

async def find_equivalents(
    level: int,
    tone_family: str,
    exclude_brand: Optional[str] = None,
) -> Dict[str, List[NormalizedShade]]:
    """Find equivalent shades across all brands for a given level + tone family."""
    brands = [b for b in get_all_brands() if b != (exclude_brand or "").lower()]
    equivalents: Dict[str, List[NormalizedShade]] = {}

    for brand in brands:
        shades = load_brand_shades(brand)
        matches = [s for s in shades if s.level == level and s.toneFamily == tone_family]
        if matches:
            equivalents[brand] = matches

    return equivalents
