from pydantic import BaseModel

class PithCoords(BaseModel):
    cx: int
    cy: int

class ImageDimensions(BaseModel):
    width: int
    height: int

class RingPoint(BaseModel):
    x: float
    y: float

class RingShape(BaseModel):
    ring_number: int          # Parsed from label string
    label: str                # Original label from labelme ("1", "2", etc.)
    inner_radius_px: float    # Radius of previous ring (0 for ring 1)
    outer_radius_px: float    # Mean distance from pith to this ring's polygon
    width_px: float           # outer_radius - inner_radius
    estimated_year: int       # birth_year + (ring_number - 1)
    eccentricity: float       # std_radius / mean_radius (how non-circular)
    points: list[list[float]] # Raw polygon points [[x,y], ...] from labelme

class Statistics(BaseModel):
    mean: float
    median: float
    std: float
    cv_percent: float         # Coefficient of variation
    min: float
    max: float
    range: float
    moving_averages: list[dict]  # [{"ring": int, "value": float}]

class TrendData(BaseModel):
    direction: str            # "Increasing", "Decreasing", "Stable", etc.
    slope: float              # Linear regression slope
    interpretation: str       # Plain language explanation
    early_growth: float       # Mean of first half
    late_growth: float        # Mean of second half
    change_percent: float     # Percentage change from early to late

class HealthComponents(BaseModel):
    growth_rate: int
    consistency: int
    stress_resistance: int
    recovery_ability: int

class HealthData(BaseModel):
    score: int                # 0-100
    label: str                # "Excellent", "Good", "Fair", "Poor"
    detail: str               # Explanation sentence
    components: HealthComponents

class AnomalyItem(BaseModel):
    ring: int
    year: int
    width: float
    deviation: float
    type: str                 # "severe_stress", "moderate_stress", "exceptional_growth", "favorable"
    label: str                # Human readable label
    interpretation: str       # Plain language cause

class PhaseItem(BaseModel):
    name: str
    years: str
    avg_width: float
    description: str

class CarbonData(BaseModel):
    estimated_biomass_kg: float
    carbon_stored_kg: float
    co2_equivalent_kg: float
    car_km_offset: float
    note: str

class MetricsData(BaseModel):
    precision: float | None = None
    recall: float | None = None
    f1_score: float | None = None
    rmse: float | None = None

class AnalysisResult(BaseModel):
    # Identity
    id: str                   # e.g., "analysis_20240117_142305_F02a"
    image_name: str           # e.g., "F02a.png"
    analyzed_at: str          # ISO timestamp
    processing_time_seconds: float

    # Image info
    pith: PithCoords
    image_dimensions: ImageDimensions

    # Core results
    ring_count: int
    estimated_age: int
    birth_year: int

    # Ring-by-ring data
    rings: list[RingShape]    # One entry per detected ring

    # Analysis outputs (from generate_full_analysis)
    statistics: Statistics
    trend: TrendData
    health: HealthData
    anomalies: list[AnomalyItem]
    phases: list[PhaseItem]
    biography: str
    carbon: CarbonData

    # Accuracy metrics (null unless ground truth available)
    metrics: MetricsData

    # Rendered overlay image
    overlay_image_base64: str | None = None  # data:image/png;base64,...

class SampleImage(BaseModel):
    name: str                 # e.g., "F02a"
    filename: str             # e.g., "F02a.png"
    cx: int
    cy: int
    gt_ring_count: int | None = None
    thumbnail_url: str        # e.g., "/api/samples/F02a/thumbnail"

class HealthResponse(BaseModel):
    status: str               # "ok"
    version: str              # "1.0.0"
    cstrd_available: bool
    results_dir: str
