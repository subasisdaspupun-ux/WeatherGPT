import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

try:
    from utils.location import get_coordinates_for_city
    from services.weather_service import get_complete_weather
    from services.imd_service import get_imd_alerts_for_location
    from services.alert_service import evaluate_disaster_risk
    from services.email_service import send_risk_alert_email
    from models.weather_model import AlertsResponse
except ModuleNotFoundError:
    from backend.utils.location import get_coordinates_for_city
    from backend.services.weather_service import get_complete_weather
    from backend.services.imd_service import get_imd_alerts_for_location
    from backend.services.alert_service import evaluate_disaster_risk
    from backend.services.email_service import send_risk_alert_email
    from backend.models.weather_model import AlertsResponse

router = APIRouter(prefix="/api", tags=["Alerts"])

class EmailAlertRequest(BaseModel):
    email: str
    city: str
    district: Optional[str] = None
    risk_level: str
    score: float
    reasons: Optional[List[str]] = []
    safety_recommendations: Optional[List[str]] = []
    imd_alerts: Optional[List[Any]] = []
    temperature: Optional[float] = None
    rain_prob: Optional[float] = None
    wind_speed: Optional[float] = None
    language: Optional[str] = "en"

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

@router.post("/alerts/send-email")
async def send_alert_email_endpoint(payload: EmailAlertRequest):
    try:
        result = send_risk_alert_email(
            recipient_email=payload.email,
            city=payload.city,
            district=payload.district or payload.city,
            risk_level=payload.risk_level,
            score=payload.score,
            reasons=payload.reasons or [],
            recommendations=payload.safety_recommendations or [],
            imd_alerts=payload.imd_alerts or [],
            temp=payload.temperature,
            rain_prob=payload.rain_prob,
            wind_speed=payload.wind_speed
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to send email"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process email alert: {str(e)}")
