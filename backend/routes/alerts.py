import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException

try:
    from utils.location import get_coordinates_for_city
    from services.weather_service import get_complete_weather
    from services.imd_service import get_imd_alerts_for_location
    from services.alert_service import evaluate_disaster_risk
    from models.weather_model import AlertsResponse
except ModuleNotFoundError:
    from backend.utils.location import get_coordinates_for_city
    from backend.services.weather_service import get_complete_weather
    from backend.services.imd_service import get_imd_alerts_for_location
    from backend.services.alert_service import evaluate_disaster_risk
    from backend.models.weather_model import AlertsResponse

router = APIRouter(prefix="/api", tags=["Alerts"])

@router.get("/alerts/{district}", response_model=AlertsResponse)
async def get_district_alerts_endpoint(district: str):
    try:
        location = await get_coordinates_for_city(district)
        weather_data = await get_complete_weather(location)
        imd_alerts = get_imd_alerts_for_location(location)
        risk_report = evaluate_disaster_risk(location, weather_data["current"], imd_alerts)

        return AlertsResponse(
            district=location.district or location.name,
            location=location,
            imd_alerts=imd_alerts,
            risk_assessment=risk_report
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts for district '{district}': {str(e)}")
