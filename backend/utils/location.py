import sys
import os
import httpx
from typing import Optional

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
for p in (backend_dir, project_root):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from models.weather_model import LocationInfo
except ModuleNotFoundError:
    from backend.models.weather_model import LocationInfo

import urllib.parse
import re

DEFAULT_LOCATIONS = {
    "bhubaneswar": LocationInfo(name="Bhubaneswar", latitude=20.2961, longitude=85.8245, country="India", state="Odisha", district="Khordha", country_code="IN"),
    "delhi": LocationInfo(name="New Delhi", latitude=28.6139, longitude=77.2090, country="India", state="Delhi", district="New Delhi", country_code="IN"),
    "mumbai": LocationInfo(name="Mumbai", latitude=19.0760, longitude=72.8777, country="India", state="Maharashtra", district="Mumbai", country_code="IN"),
    "kolkata": LocationInfo(name="Kolkata", latitude=22.5726, longitude=88.3639, country="India", state="West Bengal", district="Kolkata", country_code="IN"),
    "chennai": LocationInfo(name="Chennai", latitude=13.0827, longitude=80.2707, country="India", state="Tamil Nadu", district="Chennai", country_code="IN"),
    "hyderabad": LocationInfo(name="Hyderabad", latitude=17.3850, longitude=78.4867, country="India", state="Telangana", district="Hyderabad", country_code="IN"),
    "bengaluru": LocationInfo(name="Bengaluru", latitude=12.9716, longitude=77.5946, country="India", state="Karnataka", district="Bengaluru Urban", country_code="IN"),
    "puri": LocationInfo(name="Puri", latitude=19.8135, longitude=85.8312, country="India", state="Odisha", district="Puri", country_code="IN"),
    "cuttack": LocationInfo(name="Cuttack", latitude=20.4625, longitude=85.8828, country="India", state="Odisha", district="Cuttack", country_code="IN"),
}

async def get_coordinates_for_city(city_query: str) -> LocationInfo:
    query_clean = city_query.strip()
    query_lower = query_clean.lower()
    
    if query_lower in DEFAULT_LOCATIONS:
        return DEFAULT_LOCATIONS[query_lower]

    # Check if query is latitude,longitude format (e.g., "51.5074,-0.1278" or "20.2961, 85.8245")
    coord_match = re.match(r"^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$", query_clean)
    if coord_match:
        try:
            parts = [float(x.strip()) for x in query_clean.split(",")]
            lat, lon = parts[0], parts[1]
            return LocationInfo(
                name=f"Coord ({lat:.2f}°, {lon:.2f}°)",
                latitude=lat,
                longitude=lon,
                country="World",
                state="Custom Location",
                district=f"{lat:.2f}°, {lon:.2f}°",
                country_code="GL"
            )
        except Exception:
            pass

    encoded_name = urllib.parse.quote(query_clean)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_name}&count=5&language=en&format=json"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                if "results" in data and len(data["results"]) > 0:
                    first = data["results"][0]
                    return LocationInfo(
                        name=first.get("name", query_clean.title()),
                        latitude=float(first.get("latitude")),
                        longitude=float(first.get("longitude")),
                        country=first.get("country", "Global"),
                        state=first.get("admin1"),
                        district=first.get("admin2") or first.get("admin1") or first.get("name"),
                        country_code=first.get("country_code")
                    )
    except Exception as e:
        print(f"Geocoding error for '{city_query}': {e}")
        
    # Fallback to default (Bhubaneswar) if geocoding fails
    return DEFAULT_LOCATIONS["bhubaneswar"]
