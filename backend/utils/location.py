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
    # All 30 Districts and Key Locations of Odisha
    "bhubaneswar": LocationInfo(name="Bhubaneswar", latitude=20.2961, longitude=85.8245, country="India", state="Odisha", district="Khordha", country_code="IN"),
    "cuttack": LocationInfo(name="Cuttack", latitude=20.4625, longitude=85.8828, country="India", state="Odisha", district="Cuttack", country_code="IN"),
    "puri": LocationInfo(name="Puri", latitude=19.8135, longitude=85.8312, country="India", state="Odisha", district="Puri", country_code="IN"),
    "rourkela": LocationInfo(name="Rourkela", latitude=22.2604, longitude=84.8536, country="India", state="Odisha", district="Sundargarh", country_code="IN"),
    "berhampur": LocationInfo(name="Berhampur", latitude=19.3150, longitude=84.7941, country="India", state="Odisha", district="Ganjam", country_code="IN"),
    "sambalpur": LocationInfo(name="Sambalpur", latitude=21.4669, longitude=83.9812, country="India", state="Odisha", district="Sambalpur", country_code="IN"),
    "balasore": LocationInfo(name="Balasore", latitude=21.4934, longitude=86.9135, country="India", state="Odisha", district="Balasore", country_code="IN"),
    "bhadrak": LocationInfo(name="Bhadrak", latitude=21.0574, longitude=86.4959, country="India", state="Odisha", district="Bhadrak", country_code="IN"),
    "baripada": LocationInfo(name="Baripada", latitude=21.9333, longitude=86.7333, country="India", state="Odisha", district="Mayurbhanj", country_code="IN"),
    "paradeep": LocationInfo(name="Paradeep", latitude=20.3167, longitude=86.6111, country="India", state="Odisha", district="Jagatsinghpur", country_code="IN"),
    "jharsuguda": LocationInfo(name="Jharsuguda", latitude=21.8554, longitude=84.0062, country="India", state="Odisha", district="Jharsuguda", country_code="IN"),
    "bargarh": LocationInfo(name="Bargarh", latitude=21.3333, longitude=83.6167, country="India", state="Odisha", district="Bargarh", country_code="IN"),
    "balangir": LocationInfo(name="Balangir", latitude=20.7100, longitude=83.4900, country="India", state="Odisha", district="Balangir", country_code="IN"),
    "angul": LocationInfo(name="Angul", latitude=20.8392, longitude=85.1013, country="India", state="Odisha", district="Angul", country_code="IN"),
    "dhenkanal": LocationInfo(name="Dhenkanal", latitude=20.6667, longitude=85.6000, country="India", state="Odisha", district="Dhenkanal", country_code="IN"),
    "kendujhar": LocationInfo(name="Kendujhar", latitude=21.6300, longitude=85.5800, country="India", state="Odisha", district="Keonjhar", country_code="IN"),
    "keonjhar": LocationInfo(name="Kendujhar", latitude=21.6300, longitude=85.5800, country="India", state="Odisha", district="Keonjhar", country_code="IN"),
    "jajpur": LocationInfo(name="Jajpur", latitude=20.8500, longitude=86.3300, country="India", state="Odisha", district="Jajpur", country_code="IN"),
    "kendrapara": LocationInfo(name="Kendrapara", latitude=20.5000, longitude=86.4200, country="India", state="Odisha", district="Kendrapara", country_code="IN"),
    "jagatsinghpur": LocationInfo(name="Jagatsinghpur", latitude=20.2570, longitude=86.1685, country="India", state="Odisha", district="Jagatsinghpur", country_code="IN"),
    "nayagarh": LocationInfo(name="Nayagarh", latitude=20.1258, longitude=85.1064, country="India", state="Odisha", district="Nayagarh", country_code="IN"),
    "khordha": LocationInfo(name="Khordha", latitude=20.1800, longitude=85.6200, country="India", state="Odisha", district="Khordha", country_code="IN"),
    "koraput": LocationInfo(name="Koraput", latitude=18.8135, longitude=82.7118, country="India", state="Odisha", district="Koraput", country_code="IN"),
    "jeypore": LocationInfo(name="Jeypore", latitude=18.8500, longitude=82.5700, country="India", state="Odisha", district="Koraput", country_code="IN"),
    "rayagada": LocationInfo(name="Rayagada", latitude=19.1667, longitude=83.4167, country="India", state="Odisha", district="Rayagada", country_code="IN"),
    "bhawanipatna": LocationInfo(name="Bhawanipatna", latitude=19.9000, longitude=83.1700, country="India", state="Odisha", district="Kalahandi", country_code="IN"),
    "kalahandi": LocationInfo(name="Bhawanipatna", latitude=19.9000, longitude=83.1700, country="India", state="Odisha", district="Kalahandi", country_code="IN"),
    "nuapada": LocationInfo(name="Nuapada", latitude=20.8333, longitude=82.5333, country="India", state="Odisha", district="Nuapada", country_code="IN"),
    "nabarangpur": LocationInfo(name="Nabarangpur", latitude=19.2300, longitude=82.5500, country="India", state="Odisha", district="Nabarangpur", country_code="IN"),
    "malkangiri": LocationInfo(name="Malkangiri", latitude=18.3500, longitude=81.9000, country="India", state="Odisha", district="Malkangiri", country_code="IN"),
    "phulbani": LocationInfo(name="Phulbani", latitude=20.4700, longitude=84.2300, country="India", state="Odisha", district="Kandhamal", country_code="IN"),
    "kandhamal": LocationInfo(name="Phulbani", latitude=20.4700, longitude=84.2300, country="India", state="Odisha", district="Kandhamal", country_code="IN"),
    "daringbadi": LocationInfo(name="Daringbadi", latitude=19.9100, longitude=84.1300, country="India", state="Odisha", district="Kandhamal", country_code="IN"),
    "boudh": LocationInfo(name="Boudh", latitude=20.8400, longitude=84.3200, country="India", state="Odisha", district="Boudh", country_code="IN"),
    "subarnapur": LocationInfo(name="Subarnapur", latitude=20.8400, longitude=83.9200, country="India", state="Odisha", district="Subarnapur", country_code="IN"),
    "sonepur": LocationInfo(name="Subarnapur", latitude=20.8400, longitude=83.9200, country="India", state="Odisha", district="Subarnapur", country_code="IN"),
    "paralakhemundi": LocationInfo(name="Paralakhemundi", latitude=18.7800, longitude=84.0900, country="India", state="Odisha", district="Gajapati", country_code="IN"),
    "gajapati": LocationInfo(name="Paralakhemundi", latitude=18.7800, longitude=84.0900, country="India", state="Odisha", district="Gajapati", country_code="IN"),
    "debagarh": LocationInfo(name="Debagarh", latitude=21.5300, longitude=84.7300, country="India", state="Odisha", district="Deogarh", country_code="IN"),
    "deogarh": LocationInfo(name="Debagarh", latitude=21.5300, longitude=84.7300, country="India", state="Odisha", district="Deogarh", country_code="IN"),
    "konark": LocationInfo(name="Konark", latitude=19.8876, longitude=86.0945, country="India", state="Odisha", district="Puri", country_code="IN"),
    "gopalpur": LocationInfo(name="Gopalpur", latitude=19.2600, longitude=84.9100, country="India", state="Odisha", district="Ganjam", country_code="IN"),
    "chandipur": LocationInfo(name="Chandipur", latitude=21.4700, longitude=87.0200, country="India", state="Odisha", district="Balasore", country_code="IN"),
    "talcher": LocationInfo(name="Talcher", latitude=20.9500, longitude=85.2200, country="India", state="Odisha", district="Angul", country_code="IN"),
    "chhatrapur": LocationInfo(name="Chhatrapur", latitude=19.3500, longitude=84.9800, country="India", state="Odisha", district="Ganjam", country_code="IN"),

    # Major Cities of India
    "delhi": LocationInfo(name="New Delhi", latitude=28.6139, longitude=77.2090, country="India", state="Delhi", district="New Delhi", country_code="IN"),
    "new delhi": LocationInfo(name="New Delhi", latitude=28.6139, longitude=77.2090, country="India", state="Delhi", district="New Delhi", country_code="IN"),
    "mumbai": LocationInfo(name="Mumbai", latitude=19.0760, longitude=72.8777, country="India", state="Maharashtra", district="Mumbai", country_code="IN"),
    "kolkata": LocationInfo(name="Kolkata", latitude=22.5726, longitude=88.3639, country="India", state="West Bengal", district="Kolkata", country_code="IN"),
    "chennai": LocationInfo(name="Chennai", latitude=13.0827, longitude=80.2707, country="India", state="Tamil Nadu", district="Chennai", country_code="IN"),
    "hyderabad": LocationInfo(name="Hyderabad", latitude=17.3850, longitude=78.4867, country="India", state="Telangana", district="Hyderabad", country_code="IN"),
    "bengaluru": LocationInfo(name="Bengaluru", latitude=12.9716, longitude=77.5946, country="India", state="Karnataka", district="Bengaluru Urban", country_code="IN"),
    "pune": LocationInfo(name="Pune", latitude=18.5204, longitude=73.8567, country="India", state="Maharashtra", district="Pune", country_code="IN"),
    "ahmedabad": LocationInfo(name="Ahmedabad", latitude=23.0225, longitude=72.5714, country="India", state="Gujarat", district="Ahmedabad", country_code="IN"),
    "jaipur": LocationInfo(name="Jaipur", latitude=26.9124, longitude=75.7873, country="India", state="Rajasthan", district="Jaipur", country_code="IN"),
    "varanasi": LocationInfo(name="Varanasi", latitude=25.3176, longitude=82.9739, country="India", state="Uttar Pradesh", district="Varanasi", country_code="IN"),
    "kochi": LocationInfo(name="Kochi", latitude=9.9312, longitude=76.2673, country="India", state="Kerala", district="Ernakulam", country_code="IN"),
    "shimla": LocationInfo(name="Shimla", latitude=31.1048, longitude=77.1734, country="India", state="Himachal Pradesh", district="Shimla", country_code="IN"),

    # Global
    "london": LocationInfo(name="London", latitude=51.5074, longitude=-0.1278, country="United Kingdom", state="England", district="Greater London", country_code="GB"),
    "tokyo": LocationInfo(name="Tokyo", latitude=35.6762, longitude=139.6503, country="Japan", state="Kanto", district="Tokyo", country_code="JP"),
    "new york": LocationInfo(name="New York", latitude=40.7128, longitude=-74.0060, country="United States", state="New York", district="New York City", country_code="US"),
    "newyork": LocationInfo(name="New York", latitude=40.7128, longitude=-74.0060, country="United States", state="New York", district="New York City", country_code="US"),
    "dubai": LocationInfo(name="Dubai", latitude=25.2048, longitude=55.2708, country="United Arab Emirates", state="Dubai", district="Dubai", country_code="AE"),
    "paris": LocationInfo(name="Paris", latitude=48.8566, longitude=2.3522, country="France", state="Ile-de-France", district="Paris", country_code="FR"),
}

async def get_coordinates_for_city(city_query: str) -> LocationInfo:
    query_clean = city_query.strip()
    query_lower = query_clean.lower()
    
    if query_lower in DEFAULT_LOCATIONS:
        return DEFAULT_LOCATIONS[query_lower]

    # Check if query contains latitude,longitude format (e.g. "20.2961,85.8245", "20.2961, 85.8245", or "20.2961, 85.8245, India")
    coord_match = re.search(r"([-+]?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?))\s*,\s*([-+]?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))", query_clean)
    if coord_match:
        try:
            lat = float(coord_match.group(1))
            lon = float(coord_match.group(2))

            loc_name = f"Location ({lat:.2f}°, {lon:.2f}°)"
            country = "Global"
            state = "Custom Location"
            district = f"{lat:.2f}°, {lon:.2f}°"
            country_code = "GL"

            # 1. Reverse geocoding lookup
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    rev_url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
                    rev_res = await client.get(rev_url)
                    if rev_res.status_code == 200:
                        rd = rev_res.json()
                        loc_name = rd.get("city") or rd.get("locality") or rd.get("principalSubdivision") or loc_name
                        country = rd.get("countryName") or country
                        state = rd.get("principalSubdivision") or state
                        district = rd.get("locality") or rd.get("city") or loc_name
                        country_code = rd.get("countryCode") or country_code
            except Exception:
                pass

            # 2. Proximity check against DEFAULT_LOCATIONS if reverse geocoding returned default placeholder
            if loc_name.startswith("Location ("):
                for def_loc in DEFAULT_LOCATIONS.values():
                    if abs(def_loc.latitude - lat) < 0.30 and abs(def_loc.longitude - lon) < 0.30:
                        loc_name = def_loc.name
                        country = def_loc.country
                        state = def_loc.state
                        district = def_loc.district
                        country_code = def_loc.country_code
                        break

            return LocationInfo(
                name=loc_name,
                latitude=lat,
                longitude=lon,
                country=country,
                state=state,
                district=district,
                country_code=country_code
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
