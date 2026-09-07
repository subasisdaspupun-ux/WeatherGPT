import sys
import os
from typing import List

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from models.weather_model import CurrentWeather, AlertItem, RiskReport, LocationInfo
except ModuleNotFoundError:
    from backend.models.weather_model import CurrentWeather, AlertItem, RiskReport, LocationInfo

DISCLAIMER_TEXT = (
    "Decision-Support Indicator: This automated risk assessment combines meteorological parameters "
    "(rain intensity, wind gust speed, extreme heat index, humidity) with active IMD district bulletins. "
    "It is intended for situational awareness and decision support, not as an official emergency warning."
)

def evaluate_disaster_risk(location: LocationInfo, current: CurrentWeather, imd_alerts: List[AlertItem]) -> RiskReport:
    score = 0.0
    reasons = []
    recommendations = []

    # 1. Temperature / Heatwave evaluation
    if current.temperature >= 42.0:
        score += 3.5
        reasons.append(f"Severe extreme heat detected ({current.temperature}°C). High heatwave risk.")
        recommendations.append("Stay indoors during peak daylight hours (11 AM - 4 PM) and remain hydrated.")
    elif current.temperature >= 38.0:
        score += 2.0
        reasons.append(f"Elevated temperatures ({current.temperature}°C). Moderate heat stress.")
        recommendations.append("Drink plenty of water and wear light cotton clothing.")

    # 2. Rainfall & ML Rain Probability evaluation
    if current.weather_code in [65, 82, 95, 96, 99]:
        score += 4.0
        reasons.append("Torrential rainfall / Severe thunderstorm occurring.")
        recommendations.append("Avoid low-lying flood-prone roads and waterlogged underpasses.")
    elif current.weather_code in [61, 63, 80, 81] or current.rain_probability_ml > 70.0:
        score += 2.0
        reasons.append(f"High precipitation likelihood (ML prediction: {current.rain_probability_ml}%).")
        recommendations.append("Carry an umbrella or raincoat when heading outdoors.")

    # 3. Wind Speed evaluation
    if current.wind_speed >= 50.0:
        score += 4.0
        reasons.append(f"Gale force winds ({current.wind_speed} km/h) detected.")
        recommendations.append("Secure loose outdoor objects and stay clear of trees, billboards, and power lines.")
    elif current.wind_speed >= 30.0:
        score += 1.5
        reasons.append(f"Breezy/Gusty wind conditions ({current.wind_speed} km/h).")

    # 4. Humidity & Oppressiveness
    if current.humidity > 85.0 and current.temperature > 32.0:
        score += 1.5
        reasons.append(f"High humidity ({current.humidity}%) creating muggy, uncomfortable heat index.")

    # 5. IMD Alert Color multiplier
    has_red = any(a.alert_color == "RED" for a in imd_alerts)
    has_orange = any(a.alert_color == "ORANGE" for a in imd_alerts)
    has_yellow = any(a.alert_color == "YELLOW" for a in imd_alerts)

    if has_red:
        score += 5.0
        reasons.append("Official IMD RED Alert active for district.")
        recommendations.append("Follow instructions from local disaster management authorities immediately.")
    elif has_orange:
        score += 3.0
        reasons.append("Official IMD ORANGE Alert active for district.")
        recommendations.append("Be prepared for severe weather disruptions and monitor local weather bulletins.")
    elif has_yellow:
        score += 1.5
        reasons.append("Official IMD YELLOW Alert active for district.")

    # Determine final Risk Level
    if score >= 7.0 or has_red:
        risk_level = "EXTREME"
        if not recommendations:
            recommendations.append("Take immediate safety precautions and remain in secure shelter.")
    elif score >= 4.5 or has_orange:
        risk_level = "HIGH"
        if not recommendations:
            recommendations.append("Prepare for severe weather disruptions and avoid non-essential travel.")
    elif score >= 2.0 or has_yellow:
        risk_level = "MODERATE"
        if not recommendations:
            recommendations.append("Keep updated with local forecasts and carry rain/sun protection.")
    else:
        risk_level = "LOW"
        reasons.append("Meteorological parameters and IMD bulletins indicate calm, safe weather.")
        recommendations.append("Normal daily activities can proceed. Enjoy the pleasant weather!")

    return RiskReport(
        risk_level=risk_level,
        score=round(score, 1),
        reasons=reasons,
        safety_recommendations=recommendations,
        disclaimer=DISCLAIMER_TEXT
    )
