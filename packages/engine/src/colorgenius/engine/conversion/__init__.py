"""ColorGenius Brand Conversion Engine — Python Implementation.

Bit-for-bit identical logic to dashboard/lib/conversion/engine.ts.
ADR-015 §7: Dual-engine parity.
"""

from .engine import (
    convert_shade,
    convert_developer,
    get_mixing_ratio,
    calculate_mixing_amounts,
    convert_shade_component,
    convert_formula,
    find_equivalents,
)

__all__ = [
    "convert_shade",
    "convert_developer",
    "get_mixing_ratio",
    "calculate_mixing_amounts",
    "convert_shade_component",
    "convert_formula",
    "find_equivalents",
]
