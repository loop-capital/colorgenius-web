# Formulation Algorithm - Core Logic Specification

## Executive Summary

The Formulation Algorithm is the intelligent engine that transforms collected data into precise, professional-grade hair color formulas. This document details the decision trees, mathematical models, and AI-driven recommendations that generate formulations considering 10+ variables.

---

## Algorithm Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FORMULATION ALGORITHM PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           INPUT LAYER                                   │   │
│  │                                                                          │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │   │
│  │  │ Target Color  │  │ Current State │  │ Hair Profile  │              │   │
│  │  │               │  │               │  │               │              │   │
│  │  │ • Photo       │  │ • Photo       │  │ • Texture     │              │   │
│  │  │ • Level       │  │ • Level       │  │ • Porosity    │              │   │
│  │  │ • Tone        │  │ • Tone        │  │ • Density     │              │   │
│  │  │ • Intensity   │  │ • Color history│  │ • Elasticity  │              │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘              │   │
│  │                                                                          │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │   │
│  │  │ Client Factors│  │ Environmental │  │ Brand Pref    │              │   │
│  │  │               │  │               │  │               │              │   │
│  │  │ • Medications │  │ • Water quality│  │ • Redken      │              │   │
│  │  │ • Nutrients   │  │ • Sun exposure│  │ • Wella       │              │   │
│  │  │ • Scalp cond  │  │ • Chemicals   │  │ • Schwarzkopf │              │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                           │
│                                     ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       VALIDATION LAYER                                  │   │
│  │                                                                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ Feasibility     │  │ Safety          │  │ Compatibility   │         │   │
│  │  │ Check           │  │ Check           │  │ Check           │         │   │
│  │  │                 │  │                 │  │                 │         │   │
│  │  │ • Lift achievable?│ │ • Developer OK? │ │ • Products mix? │         │   │
│  │  │ • Tone possible?  │ │ • Time safe?    │ │ • History OK?   │         │   │
│  │  │ • Formula valid?  │ │ • Condition OK? │ │ • Gray OK?      │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  │                                                                          │   │
│  │  └────────────────────────────────────────────────────────────────────┘   │
│  │  IF INVALID: Generate warnings + Alternative recommendations              │
│  │  IF VALID: Proceed to formulation                                           │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                           │
│                                     ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      FORMULATION LAYER                                  │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Step 1: Determine Action Type                                   │   │   │
│  │  │                                                                  │   │   │
│  │  │  • Same level/Deposit → Deposit formula                          │   │   │
│  │  │  • Lift 1-2 levels → Lift + tone formula                         │   │   │
│  │  │  • Lift 3+ levels → Lightener + tone                             │   │   │
│  │  │  • Darken → Fill + deposit                                         │   │   │
│  │  │  • Corrective → Remove/fill/tone sequence                          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Step 2: Calculate Developer Volume                              │   │   │
│  │  │                                                                  │   │   │
│  │  │  Formula:                                                        │   │   │
│  │  │  Base = f(LiftRequired)                                          │   │   │
│  │  │  Adjusted = Base × PorosityFactor × ConditionFactor × TimeFactor │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Step 3: Generate Shade Formula                                  │   │   │
│  │  │                                                                  │   │   │
│  │  │  • Target shade selection                                        │   │   │
│  │  │  • Tone adjustment for neutralization                            │   │   │
│  │  │  • Gray coverage consideration                                   │   │   │
│  │  │  • Intensity adjustment                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Step 4: Determine Processing                                    │   │   │
│  │  │                                                                  │   │   │
│  │  │  • Time calculation                                              │   │   │
│  │  │  • Application sequence                                          │   │   │
│  │  │  • Technique recommendation                                      │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                           │
│                                     ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       OUTPUT LAYER                                      │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Complete Formulation Package                                       │   │   │
│  │  │                                                                    │   │   │
│  │  │ • Primary Formula (shades, ratios, developer)                    │   │   │
│  │  │ • Toning Formula (if needed)                                       │   │   │
│  │  │ • Application Instructions                                         │   │   │
│  │  │ • Processing Time                                                  │   │   │
│  │  │ • Cost Estimate                                                    │   │   │
│  │  │ • Pricing Suggestion                                               │   │   │
│  │  │ • Aftercare Recommendations                                        │   │   │
│  │  │ • Risk Warnings                                                    │   │   │
│  │  │ • Alternative Options                                              │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Input Schema

```python
@dataclass
class FormulationInput:
    """Complete input specification for formulation algorithm."""
    
    # Target specification
    target: TargetColor
    
    # Current state
    current: CurrentHairState
    
    # Hair characteristics
    hair_profile: HairProfile
    
    # Client factors
    client: ClientFactors
    
    # Environmental factors
    environment: EnvironmentalFactors
    
    # Preferences
    preferences: FormulationPreferences

@dataclass
class TargetColor:
    """Desired end result."""
    
    # From photo analysis or manual input
    source: str  # "photo", "manual", "shade_code"
    
    # Level (1-10)
    level: int
    level_confidence: float  # 0-1
    
    # Tone family
    primary_tone: str  # "N", "A", "G", "V", etc.
    secondary_tone: Optional[str]
    tone_confidence: float
    
    # Intensity (0-1, where 1 = vivid, 0 = pastel)
    intensity: float
    
    # If known
    specific_shade_code: Optional[str]
    
    # Visual reference (if from photo)
    reference_image_id: Optional[str]

@dataclass
class CurrentHairState:
    """Current hair condition and color."""
    
    # From photo analysis
    level: int
    tone: str
    
    # Virgin vs previously colored
    is_virgin: bool
    previous_color_type: Optional[str]  # "permanent", "demi", "semi", "bleach"
    months_since_color: Optional[int]
    
    # Color history
    previous_formulas: List[PreviousFormula]
    
    # Visible issues
    has_banding: bool
    has_buildup: bool
    has_overlapping: bool
    root_regrowth_inches: float
    
    # Chemical processing history
    processes: List[ChemicalProcess]

@dataclass
class HairProfile:
    """Physical hair characteristics."""
    
    # From photo analysis
    texture: str  # "fine", "medium", "coarse"
    texture_confidence: float
    
    density: str  # "thin", "medium", "thick"
    density_confidence: float
    
    porosity: str  # "low", "normal", "high"
    porosity_confidence: float
    
    # Elasticity (% stretch before break)
    elasticity_percent: Optional[float]
    
    # Damage assessment
    damage_score: float  # 0-1
    damage_indicators: List[str]
    
    # Curl pattern
    curl_pattern: str  # "straight", "wavy", "curly", "coily"

@dataclass
class ClientFactors:
    """Client-specific considerations."""
    
    # Gray percentage
    gray_percentage: int  # 0-100
    gray_texture: str  # "wiry", "normal", "soft"
    
    # Medications affecting hair
    medications: List[str]  # "thyroid", "blood_thinner", "chemo", etc.
    
    # Nutritional status
    nutrient_deficiencies: List[str]  # "iron", "biotin", "zinc", etc.
    
    # Scalp condition
    scalp_condition: str  # "normal", "sensitive", "oily", "dry", "irritated"
    
    # Allergies
    has_ppd_allergy: bool
    has_ammonia_sensitivity: bool
    
    # Lifestyle
    washing_frequency: str  # "daily", "every_2_3_days", "weekly"
    heat_styling_frequency: str  # "daily", "few_times_week", "rarely", "never"
    swimming_frequency: str  # "daily", "weekly", "rarely", "never"

@dataclass
class EnvironmentalFactors:
    """External environmental influences."""
    
    # Water quality
    water_hardness: str  # "soft", "moderate", "hard", "very_hard"
    well_water: bool
    water_ph: Optional[float]
    
    # Sun exposure
    sun_exposure_hours: int  # per week
    
    # Chlorine/salt exposure
    pool_frequency: str
    ocean_frequency: str
    
    # Climate
    humidity_level: str  # "low", "moderate", "high"
    climate: str  # "dry", "temperate", "humid", "tropical"

@dataclass
class FormulationPreferences:
    """Stylist and client preferences."""
    
    # Brand preference
    preferred_brand: str  # "redken", "wella", "schwarzkopf", etc.
    alternative_brands: List[str]
    
    # Product type preference
    prefer_ammonia_free: bool
    prefer_plex_technology: bool
    
    # Budget considerations
    max_product_cost: Optional[float]
    
    # Time constraints
    max_appointment_time: Optional[int]  # minutes
    
    # Client preferences
    client_wants_low_maintenance: bool
    client_wants_vivid_result: bool
    client_wants_natural_look: bool
```

---

## Core Algorithm Implementation

```python
class FormulationEngine:
    """
    Main formulation algorithm implementing multi-stage decision logic.
    """
    
    def __init__(self):
        self.color_line_db = ColorLineDatabase()
        self.science_engine = ColorScienceEngine()
        self.validator = FormulaValidator()
        self.learning_system = LearningSystem()
    
    def formulate(self, input_data: FormulationInput) -> FormulationResult:
        """
        Generate complete formulation from input parameters.
        """
        # Step 1: Validate feasibility
        validation = self._validate_formulation(input_data)
        if not validation.is_valid:
            return self._generate_error_response(validation)
        
        # Step 2: Determine action type
        action_type = self._determine_action_type(input_data)
        
        # Step 3: Generate base formula
        base_formula = self._generate_base_formula(input_data, action_type)
        
        # Step 4: Apply adjustments
        adjusted_formula = self._apply_adjustments(base_formula, input_data)
        
        # Step 5: Generate toning (if needed)
        toning_formula = self._generate_toning(adjusted_formula, input_data)
        
        # Step 6: Calculate processing
        processing = self._calculate_processing(adjusted_formula, input_data)
        
        # Step 7: Generate recommendations
        recommendations = self._generate_recommendations(adjusted_formula, input_data)
        
        # Step 8: Apply learning system adjustments
        final_formula = self.learning_system.enhance_formula(
            adjusted_formula, 
            input_data.preferences.preferred_brand,
            input_data.target
        )
        
        return FormulationResult(
            primary_formula=final_formula,
            toning_formula=toning_formula,
            processing_instructions=processing,
            recommendations=recommendations,
            cost_estimate=self._calculate_cost(final_formula, input_data),
            pricing_suggestion=self._suggest_pricing(final_formula, input_data),
            warnings=validation.warnings,
            alternatives=validation.alternatives,
            confidence_score=self._calculate_confidence(final_formula, input_data)
        )
    
    def _validate_formulation(self, input_data: FormulationInput) -> ValidationResult:
        """
        Validate if formulation is feasible and safe.
        """
        issues = []
        warnings = []
        alternatives = []
        
        # Check lift feasibility
        lift_needed = input_data.target.level - input_data.current.level
        
        if lift_needed > 4:
            if input_data.current.is_virgin:
                issues.append("Maximum lift with color is 4 levels")
                alternatives.append("Recommend lightener (bleach) instead")
            else:
                issues.append("Color cannot lift through previous color")
                alternatives.append("Remove previous color first")
        
        # Check hair condition
        if input_data.hair_profile.damage_score > 0.7 and lift_needed > 2:
            warnings.append("Significant lift on damaged hair - recommend bond builder")
        
        if input_data.hair_profile.porosity == "high" and lift_needed > 2:
            warnings.append("High porosity may process unevenly")
        
        # Check developer safety
        required_developer = self._calculate_required_developer(lift_needed)
        
        if required_developer >= 40 and input_data.hair_profile.damage_score > 0.5:
            warnings.append("40 volume on compromised hair - proceed with caution")
        
        # Check gray coverage
        if input_data.client.gray_percentage > 50:
            if input_data.target.primary_tone != "N":
                warnings.append("Non-N series may not cover resistant gray completely")
        
        # Check medication interactions
        if "chemo" in input_data.client.medications:
            issues.append("Recent chemotherapy - hair may be fragile")
            alternatives.append("Wait 6+ months post-treatment")
        
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            warnings=warnings,
            alternatives=alternatives
        )
    
    def _determine_action_type(self, input_data: FormulationInput) -> ActionType:
        """
        Determine the primary action required.
        """
        level_diff = input_data.target.level - input_data.current.level
        
        # Corrective takes precedence
        if input_data.current.has_banding or input_data.current.has_buildup:
            return ActionType.CORRECTIVE
        
        # Check if filling required (depositing on light hair)
        if level_diff < -3:
            return ActionType.FILL_THEN_DEPOSIT
        
        # Lightening
        if level_diff > 0:
            if level_diff <= 2 and input_data.current.is_virgin:
                return ActionType.LIFT_WITH_COLOR
            else:
                return ActionType.LIGHTEN_THEN_TONE
        
        # Same level
        if level_diff == 0:
            return ActionType.DEPOSIT_TONE
        
        # Darkening (deposit)
        return ActionType.DEPOSIT_ONLY
    
    def _generate_base_formula(
        self, 
        input_data: FormulationInput,
        action_type: ActionType
    ) -> BaseFormula:
        """
        Generate base formula based on action type.
        """
        brand = input_data.preferences.preferred_brand
        product_line = self._select_product_line(brand, action_type)
        
        if action_type == ActionType.DEPOSIT_ONLY:
            return self._generate_deposit_formula(input_data, product_line)
        
        elif action_type == ActionType.LIFT_WITH_COLOR:
            return self._generate_lift_formula(input_data, product_line)
        
        elif action_type == ActionType.LIGHTEN_THEN_TONE:
            return self._generate_lighten_formula(input_data, product_line)
        
        elif action_type == ActionType.FILL_THEN_DEPOSIT:
            return self._generate_fill_formula(input_data, product_line)
        
        elif action_type == ActionType.CORRECTIVE:
            return self._generate_corrective_formula(input_data, product_line)
        
        else:
            raise ValueError(f"Unknown action type: {action_type}")
    
    def _generate_deposit_formula(
        self, 
        input_data: FormulationInput,
        product_line: ProductLine
    ) -> BaseFormula:
        """
        Generate deposit-only formula (same level or darker).
        """
        target_level = input_data.target.level
        target_tone = input_data.target.primary_tone
        
        # Select shade
        shade = self.color_line_db.find_shade(
            product_line.id,
            level=target_level,
            tone=target_tone
        )
        
        # Handle gray coverage
        if input_data.client.gray_percentage > 30:
            shade = self._adjust_for_gray(shade, input_data)
        
        # Determine developer
        developer = self._select_developer(
            product_line,
            lift_needed=0,
            gray_percentage=input_data.client.gray_percentage,
            porosity=input_data.hair_profile.porosity
        )
        
        # Calculate mixing ratio
        ratio = product_line.mixing_ratio
        
        return BaseFormula(
            product_line=product_line,
            components=[
                FormulaComponent(
                    shade=shade,
                    amount_ratio=1.0,
                    purpose="primary"
                )
            ],
            developer=developer,
            mixing_ratio=ratio,
            total_volume_oz=self._calculate_volume(input_data.hair_profile.density)
        )
    
    def _generate_lift_formula(
        self,
        input_data: FormulationInput,
        product_line: ProductLine
    ) -> BaseFormula:
        """
        Generate formula for lifting with permanent color.
        """
        levels_to_lift = input_data.target.level - input_data.current.level
        
        # Select target shade
        target_shade = self.color_line_db.find_shade(
            product_line.id,
            level=input_data.target.level,
            tone=input_data.target.primary_tone
        )
        
        # Adjust for exposed undertone during lift
        underlying_tone = self.science_engine.get_underlying_tone(
            input_data.current.level,
            levels_to_lift
        )
        
        # Calculate neutralization needed
        if underlying_tone in ["orange", "red"]:
            target_shade = self._adjust_for_neutralization(target_shade, "A")  # Add ash
        elif underlying_tone == "yellow":
            target_shade = self._adjust_for_neutralization(target_shade, "V")  # Add violet
        
        # Select developer
        developer = self._select_developer(
            product_line,
            lift_needed=levels_to_lift,
            porosity=input_data.hair_profile.porosity,
            condition=input_data.hair_profile.damage_score
        )
        
        return BaseFormula(
            product_line=product_line,
            components=[
                FormulaComponent(
                    shade=target_shade,
                    amount_ratio=1.0,
                    purpose="primary"
                )
            ],
            developer=developer,
            mixing_ratio=product_line.mixing_ratio,
            total_volume_oz=self._calculate_volume(input_data.hair_profile.density)
        )
    
    def _generate_lighten_formula(
        self,
        input_data: FormulationInput,
        product_line: ProductLine
    ) -> BaseFormula:
        """
        Generate lightener (bleach) formula for significant lift.
        """
        levels_to_lift = input_data.target.level - input_data.current.level
        
        # Get lightener product
        lightener = self.color_line_db.get_lightener(product_line.brand_id)
        
        # Select developer
        developer = self._select_developer(
            product_line,
            lift_needed=levels_to_lift,
            porosity=input_data.hair_profile.porosity,
            condition=input_data.hair_profile.damage_score
        )
        
        # Add bond builder if available and needed
        bond_builder = None
        if input_data.preferences.prefer_plex_technology or input_data.hair_profile.damage_score > 0.4:
            bond_builder = self.color_line_db.get_bond_builder()
        
        return BaseFormula(
            product_line=lightener.product_line if hasattr(lightener, 'product_line') else product_line,
            components=[
                FormulaComponent(
                    shade=lightener,
                    amount_ratio=1.0,
                    purpose="lightener"
                )
            ],
            developer=developer,
            bond_builder=bond_builder,
            mixing_ratio=lightener.mixing_ratio if hasattr(lightener, 'mixing_ratio') else "1:1.5",
            total_volume_oz=self._calculate_volume(input_data.hair_profile.density) * 1.5  # More for bleach
        )
    
    def _apply_adjustments(
        self,
        base_formula: BaseFormula,
        input_data: FormulationInput
    ) -> BaseFormula:
        """
        Apply all adjustments to base formula.
        """
        formula = base_formula
        
        # Porosity adjustments
        formula = self._adjust_for_porosity(formula, input_data.hair_profile.porosity)
        
        # Texture adjustments
        formula = self._adjust_for_texture(formula, input_data.hair_profile.texture)
        
        # Gray adjustments
        if input_data.client.gray_percentage > 0:
            formula = self._adjust_for_gray(formula, input_data.client.gray_percentage)
        
        # Previous color adjustments
        if not input_data.current.is_virgin:
            formula = self._adjust_for_previous_color(formula, input_data.current)
        
        # Medication adjustments
        if input_data.client.medications:
            formula = self._adjust_for_medications(formula, input_data.client.medications)
        
        # Water quality adjustments
        formula = self._adjust_for_water_quality(formula, input_data.environment.water_hardness)
        
        return formula
    
    def _adjust_for_porosity(
        self,
        formula: BaseFormula,
        porosity: str
    ) -> BaseFormula:
        """
        Adjust formula based on porosity.
        """
        if porosity == "high":
            # High porosity absorbs color quickly
            formula.developer = min(formula.developer, 20)
            formula.processing_time_multiplier = 0.85
            formula.warnings.append("High porosity - monitor closely to avoid over-processing")
            
        elif porosity == "low":
            # Low porosity is resistant
            formula.processing_time_multiplier = 1.15
            formula.recommendations.append("Consider pre-softening for resistant hair")
        
        return formula
    
    def _calculate_processing(
        self,
        formula: BaseFormula,
        input_data: FormulationInput
    ) -> ProcessingInstructions:
        """
        Calculate processing time and application sequence.
        """
        # Base processing time from developer
        base_time = self._get_base_processing_time(formula.developer)
        
        # Adjust for gray
        if input_data.client.gray_percentage > 50:
            base_time += 10
        
        # Adjust for porosity
        base_time *= formula.processing_time_multiplier
        
        # Adjust for texture
        if input_data.hair_profile.texture == "coarse":
            base_time *= 1.1
        elif input_data.hair_profile.texture == "fine":
            base_time *= 0.95
        
        # Determine application sequence
        sequence = self._determine_application_sequence(
            formula,
            input_data.current.has_banding,
            input_data.current.root_regrowth_inches
        )
        
        return ProcessingInstructions(
            total_time_minutes=round(base_time),
            application_sequence=sequence,
            room_temperature_recommended=True,
            heat_optional=(input_data.hair_profile.porosity == "low"),
            processing_notes=self._generate_processing_notes(formula, input_data)
        )
    
    def _determine_application_sequence(
        self,
        formula: BaseFormula,
        has_banding: bool,
        regrowth: float
    ) -> List[ApplicationStep]:
        """
        Determine application sequence based on hair condition.
        """
        steps = []
        
        if has_banding:
            # Color-banded hair requires zone-specific timing
            steps = [
                ApplicationStep(
                    zone="mid_lengths",
                    duration=10,
                    description="Apply to mid-lengths (most resistant)"
                ),
                ApplicationStep(
                    zone="ends",
                    duration=5,
                    description="Apply to ends"
                ),
                ApplicationStep(
                    zone="roots",
                    duration=formula.processing_time - 15,
                    description="Apply to roots (fresh growth, process less)"
                )
            ]
        elif regrowth > 0.5:
            # Root touch-up
            steps = [
                ApplicationStep(
                    zone="roots",
                    duration=20,
                    description="Apply to regrowth"
                ),
                ApplicationStep(
                    zone="mids_to_ends",
                    duration=10,
                    description="Pull through to refresh"
                )
            ]
        else:
            # Full application
            steps = [
                ApplicationStep(
                    zone="all",
                    duration=formula.processing_time,
                    description="Full head application"
                )
            ]
        
        return steps
```

---

## Developer Selection Logic

```python
def select_developer(
    lift_required: int,
    hair_porosity: str,
    hair_condition: float,  # damage score 0-1
    gray_percentage: int,
    previous_color: bool
) -> int:
    """
    Select appropriate developer volume based on multiple factors.
    """
    # Base developer by lift requirement
    base_developer = {
        0: 10,   # Deposit only
        1: 20,   # 1 level
        2: 20,   # 2 levels
        3: 30,   # 3 levels
        4: 40,   # 4 levels
    }.get(lift_required, 40)
    
    # Adjustments
    developer = base_developer
    
    # Porosity adjustments
    if hair_porosity == "high":
        developer = min(developer, 20)
    elif hair_porosity == "low":
        developer = max(developer, 20)  # Need oxidative power
    
    # Condition adjustments
    if hair_condition > 0.6:
        developer = min(developer, 20)
    elif hair_condition > 0.4:
        developer = min(developer, 30)
    
    # Gray coverage
    if gray_percentage > 50 and developer < 20:
        developer = 20  # Minimum for gray
    
    # Previous color limitation
    if previous_color and lift_required > 2:
        developer = min(developer, 30)  # Cannot lift more through color
    
    return developer
```

---

## Tone Neutralization Calculator

```python
def calculate_neutralization(
    current_undertone: str,
    target_tone: str
) -> Optional[str]:
    """
    Calculate if and what neutralization is needed.
    
    Args:
        current_undertone: "red", "orange", "yellow", "gold", "neutral"
        target_tone: Target tone code
    
    Returns:
        Additional tone to add for neutralization, or None
    """
    # If already neutral or matching, no neutralization needed
    if current_undertone == "neutral":
        return None
    
    # If target is warm and undertone is warm, neutralization optional
    if target_tone in ["G", "W", "C", "R"] and current_undertone in ["yellow", "gold", "orange"]:
        return None  # Embrace warmth
    
    # If target is cool, must neutralize
    if target_tone in ["A", "V", "B", "P"]:
        if current_undertone in ["orange", "red"]:
            return "A"  # Ash neutralizes orange/red
        elif current_undertone in ["yellow", "gold"]:
            return "V"  # Violet neutralizes yellow
    
    return None
```

---

## Cost & Pricing Calculations

```python
class CostCalculator:
    """
    Calculate product costs and suggest pricing.
    """
    
    def calculate_cost(
        self,
        formula: BaseFormula,
        input_data: FormulationInput
    ) -> CostEstimate:
        """
        Calculate cost of products used.
        """
        total_cost = 0.0
        components = []
        
        for comp in formula.components:
            # Cost per ounce varies by brand
            cost_per_oz = self._get_product_cost(comp.shade)
            amount_oz = formula.total_volume_oz * comp.amount_ratio
            
            component_cost = cost_per_oz * amount_oz
            total_cost += component_cost
            
            components.append({
                "product": comp.shade.name,
                "amount_oz": round(amount_oz, 2),
                "cost": round(component_cost, 2)
            })
        
        # Add developer cost
        dev_cost = self._get_developer_cost(formula.developer)
        dev_amount = formula.total_volume_oz * self._parse_ratio(formula.mixing_ratio)
        total_cost += dev_cost * dev_amount
        
        # Add bond builder if used
        if formula.bond_builder:
            bond_cost = self._get_bond_builder_cost()
            total_cost += bond_cost
        
        return CostEstimate(
            total_product_cost=round(total_cost, 2),
            components=components,
            developer_cost=round(dev_cost * dev_amount, 2),
            bond_builder_cost=round(bond_cost if formula.bond_builder else 0, 2)
        )
    
    def suggest_pricing(
        self,
        formula: BaseFormula,
        input_data: FormulationInput,
        cost: CostEstimate
    ) -> PricingSuggestion:
        """
        Suggest client pricing based on service type and market.
        """
        # Base pricing by service complexity
        base_price = self._get_base_service_price(formula.action_type)
        
        # Adjustments
        price = base_price
        
        # Correction multiplier
        if input_data.current.has_banding or input_data.current.has_buildup:
            price *= 1.5  # Corrective color premium
        
        # Length/density adjustment
        if input_data.hair_profile.density == "thick":
            price += 25
        elif input_data.hair_profile.density == "thin":
            price -= 15
        
        # Product cost markup
        min_service_price = cost.total_product_cost * 3  # 3x product cost minimum
        price = max(price, min_service_price)
        
        # Market adjustment (based on salon type)
        # In practice, this would be based on salon's historical pricing
        
        return PricingSuggestion(
            recommended_price=round(price, -1),  # Round to nearest $10
            price_range=(round(price * 0.9, -1), round(price * 1.2, -1)),
            breakdown={
                "base_service": base_price,
                "product_cost": cost.total_product_cost,
                "correction_premium": 1.5 if input_data.current.has_banding else 1.0,
                "density_adjustment": 25 if input_data.hair_profile.density == "thick" else 0
            }
        )
```

---

## Confidence Scoring

```python
def calculate_confidence(
    formula: BaseFormula,
    input_data: FormulationInput,
    validation: ValidationResult
) -> ConfidenceScore:
    """
    Calculate overall confidence in formulation.
    """
    scores = {
        "input_quality": 0.0,
        "target_clarity": 0.0,
        "formula_validity": 0.0,
        "experience_match": 0.0
    }
    
    # Input quality (photo analysis confidence)
    scores["input_quality"] = (
        input_data.current.level_confidence * 0.3 +
        input_data.target.level_confidence * 0.3 +
        input_data.hair_profile.texture_confidence * 0.2 +
        input_data.hair_profile.porosity_confidence * 0.2
    )
    
    # Target clarity
    if input_data.target.specific_shade_code:
        scores["target_clarity"] = 0.95
    elif input_data.target.source == "photo":
        scores["target_clarity"] = 0.85
    else:
        scores["target_clarity"] = 0.75
    
    # Formula validity
    scores["formula_validity"] = 1.0 if validation.is_valid else 0.5
    if validation.warnings:
        scores["formula_validity"] -= len(validation.warnings) * 0.1
    
    # Experience match (from learning system)
    # Would query learning system for similar successful formulas
    scores["experience_match"] = 0.8  # Placeholder
    
    # Weighted average
    weights = {
        "input_quality": 0.3,
        "target_clarity": 0.25,
        "formula_validity": 0.25,
        "experience_match": 0.2
    }
    
    overall = sum(scores[k] * weights[k] for k in scores)
    
    return ConfidenceScore(
        overall=round(overall, 2),
        components=scores,
        interpretation="High" if overall > 0.8 else "Medium" if overall > 0.6 else "Low"
    )
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** che-architect (ClawStudio)
