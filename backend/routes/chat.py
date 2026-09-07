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
    from services.ai_service import generate_grounded_weather_response
    from models.weather_model import ChatRequest, ChatResponse
except ModuleNotFoundError:
    from backend.utils.location import get_coordinates_for_city
    from backend.services.weather_service import get_complete_weather
    from backend.services.imd_service import get_imd_alerts_for_location
    from backend.services.alert_service import evaluate_disaster_risk
    from backend.services.ai_service import generate_grounded_weather_response
    from backend.models.weather_model import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["Chat AI"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_weather_ai(req: ChatRequest):
    try:
        city_target = req.location or "Bhubaneswar"
        location = await get_coordinates_for_city(city_target)
        weather_data = await get_complete_weather(location)
        imd_alerts = get_imd_alerts_for_location(location)
        risk_report = evaluate_disaster_risk(location, weather_data["current"], imd_alerts)

        ai_reply = await generate_grounded_weather_response(
            user_message=req.message,
            location=location,
            current=weather_data["current"],
            forecast=weather_data["forecast"],
            risk=risk_report,
            air_quality=weather_data["air_quality"],
            language=req.language or "en"
        )

        summary = {
            "city": location.name,
            "temp": weather_data["current"].temperature,
            "condition": weather_data["current"].weather_condition,
            "humidity": weather_data["current"].humidity,
            "wind": weather_data["current"].wind_speed,
            "ml_rain_probability": weather_data["current"].rain_probability_ml,
            "risk_level": risk_report.risk_level
        }

        return ChatResponse(
            reply=ai_reply,
            language=req.language or "en",
            location=location,
            weather_data_summary=summary,
            risk_level=risk_report.risk_level,
            grounded=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat error: {str(e)}")
