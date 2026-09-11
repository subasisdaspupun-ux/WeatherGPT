import sys
import os
import json
import asyncio
import socket
from typing import Any

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from models.weather_model import LocationInfo, CurrentWeather, ForecastDay, RiskReport
except ModuleNotFoundError:
    from backend.models.weather_model import LocationInfo, CurrentWeather, ForecastDay, RiskReport

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "or": "Odia",
    "bn": "Bengali",
    "te": "Telugu",
    "ta": "Tamil",
}

# Retry settings
_RETRY_ATTEMPTS = 3
_RETRY_BASE_DELAY = 1.5  # seconds; doubles each attempt

# Network errors that should trigger a retry
_NETWORK_ERRORS = (
    "wsarecv",
    "stream reading error",
    "ConnectionAborted",
    "ConnectionReset",
    "RemoteDisconnected",
    "BrokenPipe",
    "Connection aborted",
    "Read timed out",
    "EOF occurred",
    "An established connection was aborted",
)


# ---------------------------------------------------------------------------
# Helpers for the professional fallback engine
# ---------------------------------------------------------------------------

def _rain_line(ml_rain, condition):
    if ml_rain >= 75:
        return ("Rain is highly likely right now -- our model puts the probability at"
                f" **{ml_rain}%**, and the sky is already showing {condition.lower()}.")
    if ml_rain >= 45:
        return (f"There is a moderate chance of rain (**{ml_rain}%**) based on current"
                " atmospheric readings. Worth carrying an umbrella.")
    if ml_rain >= 20:
        return (f"Rain is possible but not very likely at **{ml_rain}%**."
                " Conditions could shift, so stay aware.")
    return f"The skies are holding for now -- rain probability is just **{ml_rain}%**."


def _wind_line(wind):
    if wind >= 60:
        return f"Winds are dangerously strong at **{wind} km/h** -- avoid outdoor activity."
    if wind >= 35:
        return f"It is quite breezy at **{wind} km/h**. Hold on to loose items."
    if wind >= 15:
        return f"A gentle breeze of **{wind} km/h** is blowing."
    return f"Wind is calm at **{wind} km/h**."


def _humidity_line(humidity, temp):
    if humidity > 85 and temp > 32:
        return (f"High humidity (**{humidity}%**) combined with the heat is making it feel"
                " particularly oppressive -- stay hydrated.")
    if humidity > 70:
        return (f"Humidity is elevated at **{humidity}%**, so the air feels heavier"
                " than the thermometer alone suggests.")
    return f"Humidity sits at a comfortable **{humidity}%**."


def _forecast_line(forecast):
    try:
        t = forecast[1] if len(forecast) > 1 else forecast[0]
        return (f"Tomorrow expect a high of **{t.temp_max} C** and a low of"
                f" **{t.temp_min} C** with {t.weather_condition.lower()} --"
                f" precipitation chance around **{t.precipitation_probability}%**.")
    except Exception:
        return ""


def _risk_tone(risk_lvl):
    return {
        "LOW":      "Things look calm out there.",
        "MODERATE": "A few things worth keeping an eye on.",
        "HIGH":     "Conditions are getting serious -- please take care.",
        "EXTREME":  "This is a critical weather situation. Stay safe.",
    }.get(risk_lvl, "")


# ---------------------------------------------------------------------------
# Professional, intent-aware fallback engine
# ---------------------------------------------------------------------------

def generate_fallback_ai_reply(user_message, location, current, forecast, risk, language="en"):
    loc      = location.name
    temp     = current.temperature
    feel     = current.apparent_temperature
    cond     = current.weather_condition
    humid    = current.humidity
    wind     = current.wind_speed
    ml_rain  = current.rain_probability_ml
    risk_lvl = risk.risk_level
    recs     = risk.safety_recommendations
    rec_txt  = recs[0] if recs else "No specific precautions needed right now."
    q        = user_message.lower()

    if language == "hi":
        rain_txt = (f"Barish ki sambhavna **{ml_rain}%** hai." if ml_rain >= 40
                    else f"Barish ki sambhavna kam (**{ml_rain}%**) hai.")
        if any(w in q for w in ["barish", "baarish", "rain"]):
            extra = ("Bahar jaate samay chhata zaroor rakhein." if ml_rain >= 40
                     else "Filhaal bahar nikalna surakshit hai.")
            return f"{loc} mein abhi temperature **{temp} C** aur mausam **{cond}** hai. {rain_txt} {extra}"
        return (f"{loc} mein mausam abhi **{cond}** hai. Temperature **{temp} C** "
                f"(mehsoos: **{feel} C**), aardrata **{humid}%** aur hawa **{wind} km/h**.\n\n"
                f"{rain_txt}\n\nJokhim star: **{risk_lvl}** -- {rec_txt}")

    if language == "or":
        rain_txt = (f"Barsha sambhavana **{ml_rain}%**." if ml_rain >= 40
                    else f"Barsha sambhavana kam (**{ml_rain}%**).")
        return (f"{loc}re bartaman abahawa **{cond}** aste. Tapamaatra **{temp} C** "
                f"(anubhuta: **{feel} C**), aardrata **{humid}%**, pabana **{wind} km/h**.\n\n"
                f"{rain_txt}\n\nBipad stara: **{risk_lvl}** -- {rec_txt}")

    if language == "bn":
        rain_txt = (f"Brustir sambhavana **{ml_rain}%**." if ml_rain >= 40
                    else f"Brustir sambhavana kom (**{ml_rain}%**).")
        return (f"{loc}-e ekhon abohawa **{cond}**. Tapamaatra **{temp} C** "
                f"(anubhut: **{feel} C**), aardrata **{humid}%**, batash **{wind} km/h**.\n\n"
                f"{rain_txt}\n\nZhuki matra: **{risk_lvl}** -- {rec_txt}")

    if language == "te":
        rain_txt = (f"Varsham sambhavata **{ml_rain}%**." if ml_rain >= 40
                    else f"Varsham sambhavata takkuva (**{ml_rain}%**).")
        return (f"{loc}lo prastuta vatavaranam **{cond}**. Ushnograta **{temp} C** "
                f"(anubhavam: **{feel} C**), temu **{humid}%**, gali **{wind} km/h**.\n\n"
                f"{rain_txt}\n\nPramada sthayi: **{risk_lvl}** -- {rec_txt}")

    if language == "ta":
        rain_txt = (f"Mazhai vaippu **{ml_rain}%**." if ml_rain >= 40
                    else f"Mazhai vaippu kuraivaanathu (**{ml_rain}%**).")
        return (f"{loc}-l ippoatu vaanilai **{cond}**. Veppanilai **{temp} C** "
                f"(unarvom: **{feel} C**), eerappam **{humid}%**, kaatru **{wind} km/h**.\n\n"
                f"{rain_txt}\n\nApaya nilai: **{risk_lvl}** -- {rec_txt}")

    # English -- smart intent detection
    rain_s    = _rain_line(ml_rain, cond)
    wind_s    = _wind_line(wind)
    humid_s   = _humidity_line(humid, temp)
    fore_s    = _forecast_line(forecast)
    risk_tone = _risk_tone(risk_lvl)

    is_rain_q     = any(w in q for w in ["rain", "umbrella", "wet", "drizzle", "shower", "flood"])
    is_temp_q     = any(w in q for w in ["temperature", "hot", "cold", "warm", "cool", "heat", "feel"])
    is_safe_q     = any(w in q for w in ["safe", "safety", "go out", "outdoor", "precaution", "travel"])
    is_wind_q     = any(w in q for w in ["wind", "storm", "gust", "breeze"])
    is_forecast_q = any(w in q for w in ["tomorrow", "forecast", "week", "days", "next", "coming"])

    if is_rain_q:
        tip = f"Tip: {rec_txt}" if risk_lvl != "LOW" else ""
        return (f"{rain_s}\n\nRight now in **{loc}**, it is **{temp} C** with"
                f" {cond.lower()}. {humid_s}\n\n{tip}").strip()

    if is_temp_q:
        diff = round(feel - temp, 1)
        direction = "warmer" if diff > 0 else "cooler"
        if abs(diff) > 1:
            feel_note = (f"The feels-like temperature is **{feel} C** -- that is **{abs(diff)} C"
                         f" {direction}** than the actual reading, driven by humidity and wind.")
        else:
            feel_note = f"The feels-like temperature closely matches the actual at **{feel} C**."
        return (f"In **{loc}**, the temperature is currently **{temp} C**. {feel_note}\n\n"
                f"{humid_s} {wind_s}")

    if is_safe_q:
        return (f"Here is a quick safety read for **{loc}** right now:\n\n"
                f"- Conditions: **{cond}**, **{temp} C**\n"
                f"- Rain probability: **{ml_rain}%**\n"
                f"- Wind speed: **{wind} km/h**\n"
                f"- Overall risk level: **{risk_lvl}**\n\n"
                f"{risk_tone} {rec_txt}")

    if is_wind_q:
        return f"{wind_s}\n\nIn **{loc}**, it is **{temp} C** with {cond.lower()}. {rain_s}"

    if is_forecast_q:
        return f"{fore_s}\n\nToday in **{loc}** -- **{temp} C**, {cond.lower()}. {rain_s}"

    return (f"Right now in **{loc}**, the weather is **{cond}** with a temperature of"
            f" **{temp} C** (feels like **{feel} C**).\n\n"
            f"{rain_s} {wind_s} {humid_s}\n\n"
            f"{fore_s}\n\n"
            f"**Risk level: {risk_lvl}** -- {risk_tone} {rec_txt}").strip()


# ---------------------------------------------------------------------------
# Force IPv4 to avoid wsarecv / IPv6 connection aborts on Windows
# ---------------------------------------------------------------------------

def _patch_ipv4():
    # Monkey-patches socket.getaddrinfo to return only IPv4 addresses.
    _original = socket.getaddrinfo

    def _ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
        return _original(host, port, socket.AF_INET, type, proto, flags)

    socket.getaddrinfo = _ipv4_only
    return _original


def _restore_socket(original):
    # Restores the original socket.getaddrinfo.
    if original is not None:
        socket.getaddrinfo = original


# ---------------------------------------------------------------------------
# Main grounded response generator
# ---------------------------------------------------------------------------

async def generate_grounded_weather_response(
    user_message: str,
    location: LocationInfo,
    current: CurrentWeather,
    forecast: list,
    risk: RiskReport,
    air_quality: Any,
    language: str = "en",
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
            "ml_rain_probability_percent": current.rain_probability_ml,
        },
        "disaster_risk": {
            "risk_level": risk.risk_level,
            "score": risk.score,
            "reasons": risk.reasons,
            "recommendations": risk.safety_recommendations,
        },
        "air_quality": {
            "us_aqi": air_quality.us_aqi,
            "quality_label": air_quality.quality_label,
            "pm2_5": air_quality.pm2_5,
        },
        "7_day_forecast": [
            {
                "date": f.date,
                "temp_max": f.temp_max,
                "temp_min": f.temp_min,
                "condition": f.weather_condition,
                "precipitation_probability": f.precipitation_probability,
            }
            for f in forecast[:7]
        ],
    }

    if not api_key:
        return generate_fallback_ai_reply(user_message, location, current, forecast, risk, language)

    original_resolver = None
    try:
        from google import genai

        lang_name = LANGUAGE_NAMES.get(language, "English")

        system_instruction = (
            f"You are WeatherGPT, a knowledgeable, calm, and professional weather assistant.\n\n"
            f"Tone and style rules:\n"
            f"- Speak like a trusted meteorologist friend, not a textbook or chatbot template.\n"
            f"- Use natural, flowing sentences. Avoid bullet-point dumps unless the user asks.\n"
            f"- Interpret data meaningfully -- tell the user what it means for them.\n"
            f"- Be concise but complete. One clear paragraph beats five fragmented lines.\n"
            f"- If risk is MODERATE, HIGH, or EXTREME, weave safety guidance naturally into the reply.\n"
            f"- Never say 'Based on the provided data...' or 'According to the JSON...'. Just answer.\n"
            f"- STRICT: Use ONLY the supplied weather data. Never invent or guess any metric.\n"
            f"- Always respond in {lang_name}."
        )

        prompt = (
            f"LIVE WEATHER DATA (real-time, grounded):\n"
            f"```json\n{json.dumps(weather_context, indent=2)}\n```\n\n"
            f"USER: {user_message}\n\n"
            f"Reply naturally in {lang_name}. Address what the user actually asked. "
            f"Be conversational, informative, and genuinely useful."
        )

        # Patch to IPv4-only BEFORE creating the client to avoid IPv6 abort errors
        original_resolver = _patch_ipv4()
        client = genai.Client(api_key=api_key)

        async def _try_model(model_name: str):
            delay = _RETRY_BASE_DELAY
            for attempt in range(1, _RETRY_ATTEMPTS + 1):
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config={
                            "system_instruction": system_instruction,
                            "http_options": {"timeout": 30},
                        },
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception as exc:
                    err_str = str(exc)
                    is_network = any(p in err_str for p in _NETWORK_ERRORS)
                    if is_network and attempt < _RETRY_ATTEMPTS:
                        print(
                            f"[WeatherGPT] Network error on {model_name} "
                            f"(attempt {attempt}/{_RETRY_ATTEMPTS}), "
                            f"retrying in {delay:.1f}s -- {exc}"
                        )
                        await asyncio.sleep(delay)
                        delay *= 2
                    else:
                        print(f"[WeatherGPT] {model_name} failed (attempt {attempt}): {exc}")
                        return None
            return None

        result = await _try_model("gemini-2.5-flash")
        if result:
            return result

        print("[WeatherGPT] Primary model unavailable, trying gemini-2.0-flash...")
        result = await _try_model("gemini-2.0-flash")
        if result:
            return result

    except Exception as err:
        print(f"[WeatherGPT] Gemini client error: {err}")
    finally:
        _restore_socket(original_resolver)

    print("[WeatherGPT] All Gemini attempts exhausted -- using professional fallback engine.")
    return generate_fallback_ai_reply(user_message, location, current, forecast, risk, language)
