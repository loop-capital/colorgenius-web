"""Data loader for the Brand Conversion Engine (Python).
Loads normalized shade data, brand specs, and tone family mappings.
"""

from __future__ import annotations
import json
import os
from typing import Dict, List, Optional, Any
from pathlib import Path

from .types import NormalizedShade, BrandSpecs


# Build path to workspace root
# packages/engine/src/colorgenius/engine/conversion/data_loader.py
# → go up 6 levels to reach workspace root
WORKSPACE_ROOT = Path(__file__).resolve().parents[6]
DATA_DIR = WORKSPACE_ROOT / "data" / "brands"


# ─── Shade Data Cache ───────────────────────────────────────────────────────

_shade_cache: Dict[str, List[NormalizedShade]] = {}
_specs_cache: Dict[str, BrandSpecs] = {}


def _load_json(path: Path) -> Any:
    """Load a JSON file, returning None on error."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def load_brand_shades(brand: str) -> List[NormalizedShade]:
    """Load normalized shades for a brand."""
    if brand in _shade_cache:
        return _shade_cache[brand]

    # Try multiple file locations (flat files and subdirectories)
    paths = [
        # Subdirectory structure (preferred)
        DATA_DIR / brand / "shades-normalized.json",
        DATA_DIR / brand / "shades.json",
        # Flat file fallback
        DATA_DIR / f"{brand}-shades.json",
    ]

    # Also try line-specific files for multi-line brands
    line_files = {
        "wella": ["color-touch-shades.json", "illumina-shades.json", "shinefinity-shades.json"],
        "redken": ["color-gels-lacquers-shades.json", "shades-eq-shades.json"],
        "joico": ["lumishine-permanent-shades.json", "lumishine-demi-liquid-shades.json", "lumishine-dimensional-deposit-shades.json"],
        "matrix": ["socolor-shades.json", "socolor-sync-shades.json", "super-sync-shades.json", "tonal-control-shades.json"],
        "pravana": ["chromasilk-shades.json", "vivids-shades.json"],
        "pulpriot": ["faction8-shades.json", "liquid-demi-shades.json"],
        "kenra": ["kenra-permanent-shades.json", "kenra-demi-permanent-shades.json", "simply-blonde.json"],
        "lorealpro": ["diacolor-shades.json", "dialight-shades.json", "inoa-shades.json", "majirel-shades.json"],
    }

    all_data: List[Dict] = []
    data = None

    # Try subdirectory first
    for p in paths:
        data = _load_json(p)
        if data is not None:
            break

    # If no direct file, try line-specific files
    if data is None and brand in line_files:
        for fname in line_files[brand]:
            # Try in brand subdir
            p = DATA_DIR / brand / fname
            file_data = _load_json(p)
            if file_data is not None:
                # Handle wrapper objects
                if isinstance(file_data, dict):
                    if "shades" in file_data:
                        file_data = file_data["shades"]
                    elif "toners" in file_data:
                        file_data = file_data["toners"]
                if isinstance(file_data, list):
                    all_data.extend(file_data)
        data = all_data if all_data else None

    # Try wella/redken/joico/matrix/pravana/pulp-riot/kenra/paul-mitchell/loreal-pro/alfaparf/oligo/kevin-murphy subdirs
    if data is None:
        subdirs = {
            "wella": "wella",
            "redken": "redken",
            "joico": "joico",
            "matrix": "matrix",
            "pravana": "pravana",
            "pulpriot": "pulp-riot",
            "kenra": "kenra",
            "paulmitchell": "paul-mitchell",
            "lorealpro": "loreal-pro",
            "alfaparf": "alfaparf",
            "oligo": "oligo",
            "kevinmurphy": "kevin-murphy",
        }
        if brand in subdirs:
            sub = subdirs[brand]
            # Try to find any shades file in the subdir
            subdir = DATA_DIR / sub
            if subdir.exists():
                for f in subdir.iterdir():
                    if f.is_file() and ("shade" in f.name or "toner" in f.name):
                        file_data = _load_json(f)
                        if file_data is not None:
                            if isinstance(file_data, dict):
                                if "shades" in file_data:
                                    file_data = file_data["shades"]
                                elif "toners" in file_data:
                                    file_data = file_data["toners"]
                            if isinstance(file_data, list):
                                all_data.extend(file_data)
                data = all_data if all_data else None

    if data is None:
        _shade_cache[brand] = []
        return []

    # Handle wrapper objects
    if isinstance(data, dict):
        if "shades" in data:
            data = data["shades"]
        elif "toners" in data:
            data = data["toners"]

    if not isinstance(data, list):
        _shade_cache[brand] = []
        return []

    shades = []
    for item in data:
        if not isinstance(item, dict):
            continue
        try:
            shade = NormalizedShade(
                code=item.get("code", ""),
                brand=item.get("brand", brand),
                line=item.get("line", ""),
                level=item.get("level", 0),
                toneFamily=item.get("toneFamily", "specialty"),
                toneCode=item.get("toneCode", ""),
                name=item.get("name", ""),
                hex=item.get("hex", "#000000"),
                isHighLift=item.get("isHighLift", False),
                isDemi=item.get("isDemi", False),
                grayCoverage=item.get("grayCoverage", None),
            )
            shades.append(shade)
        except Exception:
            continue

    _shade_cache[brand] = shades
    return shades


def load_brand_specs(brand: str) -> Optional[BrandSpecs]:
    """Load brand specs."""
    if brand in _specs_cache:
        return _specs_cache[brand]

    # Map brand slugs to spec file locations
    spec_paths = {
        "schwarzkopf": DATA_DIR / "schwarzkopf" / "specs.json",
        "moroccanoil": DATA_DIR / "moroccanoil" / "specs.json",
        "lanza": DATA_DIR / "lanza" / "specs.json",
        "davines": DATA_DIR / "davines" / "specs.json",
        "aveda": DATA_DIR / "aveda" / "specs.json",
        "oligo": DATA_DIR / "oligo" / "calura-specs.json",
        "lorealpro": DATA_DIR / "loreal-pro" / "loreal-pro-specs.json",
        "kevinmurphy": DATA_DIR / "kevin-murphy" / "kevin-murphy-specs.json",
        "wella": DATA_DIR / "wella" / "wella-specs.json",
        "redken": DATA_DIR / "redken" / "color-gels-lacquers-specs.json",
        "joico": DATA_DIR / "joico" / "lumishine-permanent-specs.json",
        "matrix": DATA_DIR / "matrix" / "socolor-specs.json",
        "pravana": DATA_DIR / "pravana" / "chromasilk-specs.json",
        "kenra": DATA_DIR / "kenra" / "kenra-specs.json",
        "paulmitchell": DATA_DIR / "paul-mitchell" / "shines-xg-specs.json",
        "pulpriot": DATA_DIR / "pulp-riot" / "faction8-specs.json",
        "alfaparf": DATA_DIR / "alfaparf" / "evolution-specs.json",
    }

    path = spec_paths.get(brand)
    if path is None:
        # Fallback
        path = DATA_DIR / f"{brand}-specs.json"

    data = _load_json(path)
    if data is None:
        return None

    specs = BrandSpecs(
        brand=data.get("brand", brand),
        productLine=data.get("productLine"),
        type=data.get("type"),
        mixRatio=data.get("mixRatio"),
        processingTime=data.get("processingTime"),
        grayProcessingTime=data.get("grayProcessingTime"),
        developers=data.get("developers"),
        developerVolumes=data.get("developerVolumes"),
        volumeSemantics=data.get("volumeSemantics"),
        lines=data.get("lines"),
        formulationGuidelines=data.get("formulationGuidelines"),
        grayCoverage=data.get("grayCoverage"),
    )

    _specs_cache[brand] = specs
    return specs


def get_all_brands() -> List[str]:
    """Return list of all available brand slugs."""
    return [
        "alfaparf", "schwarzkopf", "moroccanoil", "lanza", "davines",
        "aveda", "oligo", "lorealpro", "kevinmurphy", "wella",
        "redken", "joico", "matrix", "pravana", "kenra",
        "paulmitchell", "pulpriot",
    ]


def get_brand_display_name(brand: str) -> str:
    """Return human-readable brand name."""
    names = {
        "alfaparf": "Alfaparf Milano",
        "schwarzkopf": "Schwarzkopf Professional",
        "moroccanoil": "MoroccanOil",
        "lanza": "L'ANZA",
        "davines": "Davines",
        "aveda": "Aveda",
        "oligo": "Oligo Calura",
        "lorealpro": "L'Oréal Professionnel",
        "kevinmurphy": "Kevin Murphy COLOR.ME",
        "wella": "Wella Professionals",
        "redken": "Redken",
        "joico": "Joico",
        "matrix": "Matrix",
        "pravana": "Pravana",
        "kenra": "Kenra Professional",
        "paulmitchell": "Paul Mitchell",
        "pulpriot": "Pulp Riot",
    }
    return names.get(brand, brand)


def find_shade_by_code(brand: str, shade_code: str) -> Optional[NormalizedShade]:
    """Find a shade by its code within a brand."""
    shades = load_brand_shades(brand)
    # Try exact match
    for s in shades:
        if s.code == shade_code:
            return s
    # Try normalized match (replace dash with dot)
    normalized = shade_code.replace("-", ".")
    for s in shades:
        if s.code.replace("-", ".") == normalized:
            return s
    return None


def get_preferred_line(brand: str) -> str:
    """Get the preferred/permanent line for a brand."""
    specs = load_brand_specs(brand)
    if not specs or not specs.lines:
        return ""
    permanent = [l for l in specs.lines if l.get("type") == "permanent"]
    if permanent:
        return permanent[0].get("name", "")
    return specs.lines[0].get("name", "") if specs.lines else ""
