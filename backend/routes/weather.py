import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException

try:
    from utils.location import get_coordinates_for_city
    from services.weather_service import get_complete_weather, fetch_open_meteo_air_quality
    from services.imd_service import get_imd_alerts_for_location
    from services.alert_service import evaluate_disaster_risk
    from models.weather_model import WeatherDataResponse, AirQuality, AlertsResponse
except ModuleNotFoundError:
    from backend.utils.location import get_coordinates_for_city
    from backend.services.weather_service import get_complete_weather, fetch_open_meteo_air_quality
    from backend.services.imd_service import get_imd_alerts_for_location
    from backend.services.alert_service import evaluate_disaster_risk
    from backend.models.weather_model import WeatherDataResponse, AirQuality, AlertsResponse

router = APIRouter(prefix="/api", tags=["Weather"])

@router.get("/weather/{city}")
async def get_current_weather_endpoint(city: str):
    try:
        location = await get_coordinates_for_city(city)
        weather_data = await get_complete_weather(location)
        imd_alerts = get_imd_alerts_for_location(location)
        risk_report = evaluate_disaster_risk(location, weather_data["current"], imd_alerts)

        alerts_resp = AlertsResponse(
            district=location.district or location.name,
            location=location,
            imd_alerts=imd_alerts,
            risk_assessment=risk_report
        )

        return WeatherDataResponse(
            location=location,
            current=weather_data["current"],
            hourly=weather_data["hourly"],
            forecast=weather_data["forecast"],
            air_quality=weather_data["air_quality"],
            alerts=alerts_resp
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather for '{city}': {str(e)}")

@router.get("/forecast/{city}")
async def get_forecast_endpoint(city: str):
    try:
        location = await get_coordinates_for_city(city)
        weather_data = await get_complete_weather(location)
        return {
            "location": location,
            "forecast": weather_data["forecast"],
            "hourly": weather_data["hourly"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast for '{city}': {str(e)}")

@router.get("/air-quality/{city}", response_model=AirQuality)
async def get_air_quality_endpoint(city: str):
    try:
        location = await get_coordinates_for_city(city)
        aqi_data = await fetch_open_meteo_air_quality(location)
        return aqi_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality for '{city}': {str(e)}")
