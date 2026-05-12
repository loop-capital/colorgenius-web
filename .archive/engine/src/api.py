"""
ColorGenius Color Science Engine API

FastAPI server exposing hair color science calculations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn

app = FastAPI(
    title="ColorGenius Color Science Engine",
    description="Scientific computing engine for hair color analysis and formulation",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODELS
# ============================================================


class RGBColor(BaseModel):
    r: int = Field(ge=0, le=255, description="Red component")
    g: int = Field(ge=0, le=255, description="Green component")
    b: int = Field(ge=0, le=255, description="Blue component")


class LABColor(BaseModel):
    l: float = Field(ge=0, le=100, description="Luminance")
    a: float = Field(description="a* component (green-red)")
    b: float = Field(description="b* component (blue-yellow)")


class ColorAnalysisRequest(BaseModel):
    rgb: RGBColor
    source: str = Field(default="extracted", description="Source of color data")


class ColorAnalysisResponse(BaseModel):
    level: int = Field(ge=1, le=10, description="Hair level (1-10)")
    level_confidence: float = Field(ge=0, le=1)
    primary_tone: str
    undertone: str
    rgb: RGBColor
    lab: LABColor
    delta_e_to_target: Optional[float] = None


class DeveloperRequest(BaseModel):
    levels_to_lift: int = Field(ge=0, le=5, description="Number of levels to lift")
    porosity: str = Field(default="normal", description="Hair porosity: low, normal, high")
    hair_condition: float = Field(ge=0, le=1, default=0.3, description="Damage score 0-1")
    gray_percentage: int = Field(ge=0, le=100, default=0)
    previous_color: bool = False


class DeveloperResponse(BaseModel):
    recommended_volume: int = Field(description="Developer volume (10, 20, 30, or 40)")
    processing_time_minutes: int
    rationale: list[str]
    warnings: list[str]


class LevelRequest(BaseModel):
    current_level: int = Field(ge=1, le=10)
    target_level: int = Field(ge=1, le=10)


class LevelResponse(BaseModel):
    levels_to_lift: int
    levels_to_deposit: int
    action_type: str
    underlying_pigment: dict
    warnings: list[str]


class DeltaERequest(BaseModel):
    color1: RGBColor
    color2: RGBColor


class DeltaEResponse(BaseModel):
    delta_e: float = Field(description="CIE76 Delta E color difference")
    interpretation: str
    perceptible: bool = Field(description="Delta E > 2.0")


# ============================================================
# UTILITIES
# ============================================================


# Professional hair color level system
# Level 1 = Black, Level 10 = Lightest Blonde
# Based on melanin concentration and underlying pigment

UNDERLYING_PIGMENTS: dict[int, dict] = {
    1: {"eumelanin": 95, "pheomelanin": 5, "visible": "black"},
    2: {"eumelanin": 90, "pheomelanin": 10, "visible": "darkest brown"},
    3: {"eumelanin": 80, "pheomelanin": 15, "visible": "dark brown"},
    4: {"eumelanin": 70, "pheomelanin": 20, "visible": "medium brown"},
    5: {"eumelanin": 60, "pheomelanin": 25, "visible": "light brown"},
    6: {"eumelanin": 45, "pheomelanin": 30, "visible": "dark blonde"},
    7: {"eumelanin": 30, "pheomelanin": 35, "visible": "medium blonde"},
    8: {"eumelanin": 15, "pheomelanin": 40, "visible": "light blonde"},
    9: {"eumelanin": 5, "pheomelanin": 45, "visible": "very light blonde"},
    10: {"eumelanin": 0, "pheomelanin": 50, "visible": "lightest blonde"},
}

# Approximate RGB values for each level (natural hair)
LEVEL_APPROX_RGB: dict[int, tuple[int, int, int]] = {
    1: (20, 15, 10),
    2: (40, 28, 20),
    3: (60, 42, 30),
    4: (90, 60, 40),
    5: (120, 85, 60),
    6: (150, 115, 80),
    7: (175, 145, 100),
    8: (200, 175, 130),
    9: (220, 200, 160),
    10: (240, 230, 200),
}

# Developer volume to lift mapping
VOLUME_LIFT_BASE: dict[int, int] = {
    10: 0,
    20: 1,
    30: 2,
    40: 3,
}


def rgb_to_lab(r: int, g: int, b: int) -> tuple[float, float, float]:
    """
    Convert RGB to LAB color space.
    Simplified conversion using standard sRGB matrices.
    """
    # Normalize RGB
    r_norm = r / 255.0
    g_norm = g / 255.0
    b_norm = b / 255.0

    # Apply gamma correction
    def gamma(c):
        if c > 0.04045:
            return ((c + 0.055) / 1.055) ** 2.4
        return c / 12.92

    r_gamma = gamma(r_norm)
    g_gamma = gamma(g_norm)
    b_gamma = gamma(b_norm)

    # sRGB to XYZ
    x = r_gamma * 0.4124564 + g_gamma * 0.3575761 + b_gamma * 0.1804375
    y = r_gamma * 0.2126729 + g_gamma * 0.7151522 + b_gamma * 0.0721750
    z = r_gamma * 0.0193339 + g_gamma * 0.1191920 + b_gamma * 0.9503041

    # XYZ to LAB (D65 illuminant)
    def f(t: float) -> float:
        if t > 0.008856:
            return t ** (1 / 3)
        return 7.787 * t + 16 / 116

    x /= 0.95047
    y /= 1.00000
    z /= 1.08883

    L = 116 * f(y) - 16
    a = 500 * (f(x) - f(y))
    b_lab = 200 * (f(y) - f(z))

    return (L, a, b_lab)


def delta_e_cie76(lab1: tuple[float, float, float], lab2: tuple[float, float, float]) -> float:
    """
    Calculate CIE76 Delta E color difference.
    Delta E < 1.0: Imperceptible
    Delta E 1.0-2.0: Perceptible through close observation
    Delta E 2.0-3.5: Perceptible at a glance
    Delta E 3.5-5.0: Clearly noticeable
    Delta E > 5.0: Major difference
    """
    import math
    return math.sqrt(
        (lab1[0] - lab2[0]) ** 2 +
        (lab1[1] - lab2[1]) ** 2 +
        (lab1[2] - lab2[2]) ** 2
    )


def find_closest_level(r: int, g: int, b: int) -> tuple[int, float]:
    """
    Find the closest hair level based on RGB color.
    Returns (level, confidence) where confidence is inverse of delta.
    """
    import math

    rgb = (r, g, b)
    best_level = 5  # default
    best_delta = float('inf')

    for level, level_rgb in LEVEL_APPROX_RGB.items():
        delta = math.sqrt(
            (r - level_rgb[0]) ** 2 +
            (g - level_rgb[1]) ** 2 +
            (b - level_rgb[2]) ** 2
        )
        if delta < best_delta:
            best_delta = delta
            best_level = level

    # Convert delta to confidence (0-1)
    # Max delta for opposite colors would be ~441 (0,0,0 vs 255,255,255)
    confidence = max(0, 1 - (best_delta / 150))
    return best_level, confidence


def detect_tone(r: int, g: int, b: int) -> tuple[str, float]:
    """
    Detect hair tone from RGB values.
    Simplified tone detection based on color relationships.
    """
    # Calculate color characteristics
    is_cool = (b > g)  # Blue > Green indicates cool tones
    is_warm = (r > g and g > b)  # Red > Green > Blue indicates warm

    # Ash tones have more blue/green
    if is_cool and b > 50:
        return "ash", 0.7
    # Gold tones have high red and green, low blue
    elif r > 100 and g > 80 and b < 60:
        return "gold", 0.7
    # Red tones have high red
    elif r > 120 and r > g * 1.2:
        return "red", 0.6
    # Violet tones (would appear in very dark with blue)
    elif b > r and b > g * 1.1:
        return "violet", 0.5
    # Natural/neutral
    else:
        return "neutral", 0.5


# ============================================================
# ENDPOINTS
# ============================================================


@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "color-science-engine",
        "version": "0.1.0",
    }


@app.post("/analyze/color", response_model=ColorAnalysisResponse)
async def analyze_color(request: ColorAnalysisRequest):
    """
    Analyze a color sample and determine hair level and tone.
    """
    r, g, b = request.rgb.r, request.rgb.g, request.rgb.b

    # Find closest level
    level, level_confidence = find_closest_level(r, g, b)

    # Detect tone
    tone, tone_confidence = detect_tone(r, g, b)

    # Calculate LAB
    lab = rgb_to_lab(r, g, b)

    return ColorAnalysisResponse(
        level=level,
        level_confidence=level_confidence,
        primary_tone=tone,
        undertone=tone,
        rgb=request.rgb,
        lab=LABColor(l=lab[0], a=lab[1], b=lab[2]),
        delta_e_to_target=None,
    )


@app.post("/formulate/developer", response_model=DeveloperResponse)
async def recommend_developer(request: DeveloperRequest):
    """
    Recommend developer volume based on lift requirements and hair condition.
    """
    warnings: list[str] = []
    rationale: list[str] = []

    # Base developer by lift requirement
    levels = request.levels_to_lift
    if levels <= 0:
        base_volume = 10
        rationale.append("No lift needed - deposit only")
    elif levels == 1:
        base_volume = 20
        rationale.append("1 level lift requires 20 volume")
    elif levels == 2:
        base_volume = 20
        rationale.append("2 level lift - 20 volume standard")
    elif levels == 3:
        base_volume = 30
        rationale.append("3 level lift requires 30 volume")
    else:
        base_volume = 40
        rationale.append("4+ levels requires 40 volume (maximum safe lift)")

    developer = base_volume

    # Porosity adjustments
    if request.porosity == "high":
        developer = min(developer, 20)
        warnings.append("High porosity - capped at 20 vol to prevent over-processing")
        rationale.append("Reduced volume for high porosity hair")
    elif request.porosity == "low":
        rationale.append("Low porosity - standard volume for penetration")

    # Condition adjustments
    if request.hair_condition > 0.6:
        developer = min(developer, 20)
        warnings.append("Significant damage detected - reduced developer volume")
        rationale.append("Gentle processing for compromised hair")
    elif request.hair_condition > 0.4:
        developer = min(developer, 30)

    # Gray coverage requirements
    if request.gray_percentage > 50:
        if developer < 20:
            developer = 20
            warnings.append("Increased to 20 vol for resistant gray coverage")
            rationale.append("Minimum 20 vol for gray coverage over 50%")

    # Previous color limitation
    if request.previous_color and levels > 2:
        developer = min(developer, 30)
        warnings.append("Previous color limits lift - cannot lift more than 2 levels through color")
        rationale.append("Color cannot lift through color buildup")

    # Calculate processing time
    base_times = {10: 20, 20: 30, 30: 35, 40: 45}
    processing_time = base_times.get(developer, 30)

    if request.gray_percentage > 50:
        processing_time += 10  # Add time for resistant gray

    return DeveloperResponse(
        recommended_volume=developer,
        processing_time_minutes=processing_time,
        rationale=rationale,
        warnings=warnings,
    )


@app.post("/formulate/level", response_model=LevelResponse)
async def calculate_level_change(request: LevelRequest):
    """
    Calculate level change requirements and underlying pigment exposure.
    """
    current = request.current_level
    target = request.target_level

    levels_to_lift = max(0, target - current)
    levels_to_deposit = max(0, current - target)

    warnings: list[str] = []

    if levels_to_lift > 4:
        warnings.append("Color cannot lift more than 4 levels - consider lightener")
        action_type = "lighten_then_tone"
    elif levels_to_lift > 0:
        action_type = "lift_with_color"
    elif levels_to_deposit > 0:
        action_type = "deposit_only"
    else:
        action_type = "tone_only"

    # Get underlying pigment that will be exposed during lift
    if levels_to_lift > 0:
        exposed_level = min(current + levels_to_lift, 10)
    else:
        exposed_level = current

    underlying = UNDERLYING_PIGMENTS.get(exposed_level, UNDERLYING_PIGMENTS[5])

    return LevelResponse(
        levels_to_lift=levels_to_lift,
        levels_to_deposit=levels_to_deposit,
        action_type=action_type,
        underlying_pigment=underlying,
        warnings=warnings,
    )


@app.post("/color/delta-e", response_model=DeltaEResponse)
async def calculate_delta_e(request: DeltaERequest):
    """
    Calculate color difference (Delta E) between two colors.
    """
    lab1 = rgb_to_lab(request.color1.r, request.color1.g, request.color1.b)
    lab2 = rgb_to_lab(request.color2.r, request.color2.g, request.color2.b)

    delta_e = delta_e_cie76(lab1, lab2)

    if delta_e < 1.0:
        interpretation = "Imperceptible difference"
    elif delta_e < 2.0:
        interpretation = "Perceptible through close observation"
    elif delta_e < 3.5:
        interpretation = "Perceptible at a glance"
    elif delta_e < 5.0:
        interpretation = "Clearly noticeable difference"
    else:
        interpretation = "Major color difference"

    return DeltaEResponse(
        delta_e=round(delta_e, 2),
        interpretation=interpretation,
        perceptible=delta_e > 2.0,
    )


if __name__ == "__main__":
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)