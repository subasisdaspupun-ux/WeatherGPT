from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LocationInfo(BaseModel):
    name: str
    latitude: float
    longitude: float
    country: str
    state: Optional[str] = None
    district: Optional[str] = None
    country_code: Optional[str] = None

class CurrentWeather(BaseModel):
    temperature: float
    apparent_temperature: float
    humidity: float
    wind_speed: float
    wind_direction: float
    pressure: float
    uv_index: float
    visibility: float
    weather_code: int
    weather_condition: str
    is_day: bool
    cloud_cover: float
    rain_probability_ml: float
    source: str  # "Open-Meteo" or "IMD + Open-Meteo"

class ForecastDay(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    precipitation_sum: float
    precipitation_probability: float
    weather_code: int
    weather_condition: str
    uv_index_max: float
    wind_speed_max: float

class HourlyForecast(BaseModel):
    time: List[str]
    temperature_2m: List[float]
    precipitation_probability: List[float]
    rain: List[float]
    wind_speed_10m: List[float]
    relative_humidity_2m: List[float]

class AirQuality(BaseModel):
    city: str
    pm2_5: float
    pm10: float
    us_aqi: int
    european_aqi: int
    ozone: float
    nitrogen_dioxide: float
    sulphur_dioxide: float
    quality_label: str

class RiskReport(BaseModel):
    risk_level: str  # LOW, MODERATE, HIGH, EXTREME
    score: float
    reasons: List[str]
    safety_recommendations: List[str]
    disclaimer: str

class AlertItem(BaseModel):
    district: str
    state: str
    alert_color: str  # GREEN, YELLOW, ORANGE, RED
    title: str
    description: str
    issued_at: str
    source: str

class AlertsResponse(BaseModel):
    district: str
    location: LocationInfo
    imd_alerts: List[AlertItem]
    risk_assessment: RiskReport

class WeatherDataResponse(BaseModel):
    location: LocationInfo
    current: CurrentWeather
    hourly: HourlyForecast
    forecast: List[ForecastDay]
    air_quality: AirQuality
    alerts: AlertsResponse

class ChatRequest(BaseModel):
    message: str
    location: Optional[str] = "Bhubaneswar"
    language: Optional[str] = "en"  # en, hi, or, bn, te, ta

class ChatResponse(BaseModel):
    reply: str
    language: str
    location: LocationInfo
    weather_data_summary: Dict[str, Any]
    risk_level: str
    grounded: bool = True

class MonthlyClimateRecord(BaseModel):
    month: str
    month_num: int
    temp_max_avg: float
    temp_min_avg: float
    temp_mean_avg: float
    rainfall_sum_mm: float
    rainy_days_count: int

class YearlyClimateSummary(BaseModel):
    year: int
    annual_avg_temp: float
    annual_max_temp: float
    annual_min_temp: float
    total_rainfall_mm: float
    heatwave_days: int
    heavy_rain_days: int
    monthly_data: List[MonthlyClimateRecord]

class ClimateTrendAnalysis(BaseModel):
    warming_anomaly_celsius: float
    rainfall_change_percent: float
    hottest_year_recorded: int
    wettest_year_recorded: int
    trend_description: str
    agricultural_advisory: str

class HistoricalComparisonResponse(BaseModel):
    city: str
    location: LocationInfo
    year1_data: YearlyClimateSummary
    year2_data: YearlyClimateSummary
    multi_year_trend: List[Dict[str, Any]]
    climate_analysis: ClimateTrendAnalysis
    source: str = "Open-Meteo Historical Archive & Climate Engine"

