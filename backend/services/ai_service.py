import sys
import os
import json
from typing import Dict, Any, Optional

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from models.weather_model import LocationInfo, CurrentWeather, ForecastDay, RiskReport
except ModuleNotFoundError:
    from backend.models.weather_model import LocationInfo, CurrentWeather, ForecastDay, RiskReport

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "bn": "Bengali (বাংলা)",
    "te": "Telugu (తెలుగు)",
    "ta": "Tamil (தமிழ்)"
}

def generate_fallback_ai_reply(user_message: str, location: LocationInfo, current: CurrentWeather, forecast: list, risk: RiskReport, language: str = "en") -> str:
    loc_name = location.name
    temp = current.temperature
    condition = current.weather_condition
    humidity = current.humidity
    wind = current.wind_speed
    ml_rain = current.rain_probability_ml
    risk_lvl = risk.risk_level
    recs = " ".join(risk.safety_recommendations)

    if language == "hi":
        return (
            f"**{loc_name} का मौसम अपडेट:**\n"
            f"वर्तमान तापमान **{temp}°C** है और स्थिति **{condition}** बनी हुई है। "
            f"आर्द्रता **{humidity}%** और हवा की गति **{wind} किमी/घंटा** है।\n"
            f"एआई बारिश की संभावना: **{ml_rain}%**। "
            f"आपदा जोखिम स्तर: **{risk_lvl}**।\n"
            f"सुरक्षा सलाह: {recs}"
        )
    elif language == "or":
        return (
            f"**{loc_name} ର ପାଣିପାଗ ସୂଚନା:**\n"
            f"ବର୍ତ୍ତମାନର ତାପମାତ୍ରା **{temp}°C** ଏବଂ ଅବସ୍ଥା **{condition}** ରହିଛି। "
            f"ଆର୍ଦ୍ରତା **{humidity}%** ଏବଂ ପବନର ବେଗ **{wind} କିମି/ଘଣ୍ଟା**।\n"
            f"ବର୍ଷା ସମ୍ଭାବନା (AI ମଡେଲ): **{ml_rain}%**। "
            f"ବିପତ୍ତି ବିପଦ ସ୍ତର: **{risk_lvl}**।\n"
            f"ସୁରକ୍ଷା ପରାମର୍ଶ: {recs}"
        )
    elif language == "bn":
        return (
            f"**{loc_name}-এর আবহাওয়ার পূর্বাভাস:**\n"
            f"বর্তমান তাপমাত্রা **{temp}°C** এবং অবস্থা **{condition}**। "
            f"আর্দ্রতা **{humidity}%** এবং বাতাসের গতি **{wind} কিমি/ঘণ্টা**।\n"
            f"বৃষ্টির সম্ভাবনা: **{ml_rain}%**। "
            f"দুর্যোগের ঝুঁকি স্তর: **{risk_lvl}**।\n"
            f"সুরক্ষা পরামর্শ: {recs}"
        )
    elif language == "te":
        return (
            f"**{loc_name} వాతావరణ సమాచారం:**\n"
            f"ప్రస్తుత ఉష్ణోగ్రత **{temp}°C** మరియు పరిస్థితి **{condition}**.\n"
            f"తేమ **{humidity}%** మరియు గాలి వేగం **{wind} km/h**.\n"
            f"వర్షం సంభావ్యత: **{ml_rain}%**.\n"
            f"ప్రమాద స్థాయి: **{risk_lvl}**.\n"
            f"సురక్షిత సిఫార్సులు: {recs}"
        )
    elif language == "ta":
        return (
            f"**{loc_name} வானிலை அறிக்கை:**\n"
            f"தற்போதைய வெப்பநிலை **{temp}°C** மற்றும் நிலை **{condition}**.\n"
            f"ஈரப்பதம் **{humidity}%** மற்றும் காற்று வேகம் **{wind} km/h**.\n"
            f"மழை வாய்ப்பு: **{ml_rain}%**.\n"
            f"அபாய நிலை: **{risk_lvl}**.\n"
            f"பாதுகாப்பு ஆலோசனை: {recs}"
        )
    else:  # English
        return (
            f"**Weather Report for {loc_name}:**\n"
            f"Currently, the temperature is **{temp}°C** with **{condition}**. "
            f"Humidity is at **{humidity}%** and wind speed is **{wind} km/h**.\n"
            f"ML Rain Prediction: **{ml_rain}%** probability.\n"
            f"Disaster Risk Indicator: **{risk_lvl}**.\n"
            f"💡 **Safety Advisory:** {recs}"
        )

async def generate_grounded_weather_response(
    user_message: str,
    location: LocationInfo,
    current: CurrentWeather,
    forecast: list,
    risk: RiskReport,
    air_quality: Any,
    language: str = "en"
) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    weather_context = {
        "location": location.name,
        "district": location.district or location.name,
        "state": location.state,
        "country": location.country,
        "current": {
            "temperature_celsius": current.temperature,
            "feels_like_celsius": current.apparent_temperature,
            "humidity_percent": current.humidity,
            "wind_speed_kmh": current.wind_speed,
            "pressure_hpa": current.pressure,
            "weather_condition": current.weather_condition,
            "cloud_cover_percent": current.cloud_cover,
            "uv_index": current.uv_index,
            "ml_predicted_rain_probability_percent": current.rain_probability_ml
        },
        "disaster_risk": {
            "risk_level": risk.risk_level,
            "score": risk.score,
            "reasons": risk.reasons,
            "safety_recommendations": risk.safety_recommendations
        },
        "air_quality": {
            "us_aqi": air_quality.us_aqi,
            "quality_label": air_quality.quality_label,
            "pm2_5": air_quality.pm2_5
        },
        "7_day_forecast": [
            {
                "date": f.date,
                "temp_max": f.temp_max,
                "temp_min": f.temp_min,
                "condition": f.weather_condition,
                "precipitation_probability": f.precipitation_probability
            } for f in forecast[:7]
        ]
    }

    if not api_key:
        return generate_fallback_ai_reply(user_message, location, current, forecast, risk, language)

    try:
        from google import genai

        lang_name = LANGUAGE_NAMES.get(language, "English")
        
        system_instruction = (
            "You are WeatherGPT, an expert AI weather and disaster-risk assistant.\n"
            "STRICT GROUNDING RULE: You must ONLY use the provided real weather JSON context to answer user questions.\n"
            "DO NOT fabricate, invent, or guess temperature, rainfall, or wind metrics. If a specific metric isn't in the context, state that it's unavailable.\n"
            f"Always reply in the requested target language: {lang_name}.\n"
            "Keep answers clear, helpful, well-structured with markdown bullet points, and include severe weather safety advice if risk level is MODERATE, HIGH, or EXTREME."
        )

        prompt = (
            f"USER QUESTION: {user_message}\n\n"
            f"REAL WEATHER DATA CONTEXT:\n```json\n{json.dumps(weather_context, indent=2)}\n```\n\n"
            f"Generate a friendly, concise, natural-language response in {lang_name} addressing the user's question directly based ONLY on the data above."
        )

        client = genai.Client(api_key=api_key)

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={'system_instruction': system_instruction}
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e1:
            print(f"gemini-2.5-flash failed, trying gemini-2.0-flash: {e1}")
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt,
                    config={'system_instruction': system_instruction}
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e2:
                print(f"gemini-2.0-flash failed: {e2}")

    except Exception as err:
        print(f"Gemini API invocation error: {err}")

    return generate_fallback_ai_reply(user_message, location, current, forecast, risk, language)
