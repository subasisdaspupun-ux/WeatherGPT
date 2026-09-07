# pyright: reportMissingImports=false
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    import backend.main as backend_main
    app = backend_main.app
except ImportError:
    import main  # type: ignore
    app = main.app

from fastapi.testclient import TestClient

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200

def test_api_status_endpoint():
    response = client.get("/api")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "WeatherGPT API"
    assert data["status"] == "online"

def test_weather_endpoint():
    response = client.get("/api/weather/Bhubaneswar")
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["name"] == "Bhubaneswar"
    assert "temperature" in data["current"]

def test_alerts_endpoint():
    response = client.get("/api/alerts/Khordha")
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Khordha"
    assert "risk_assessment" in data

def test_chat_endpoint():
    payload = {
        "message": "Will it rain in Bhubaneswar today?",
        "location": "Bhubaneswar",
        "language": "en"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data

def test_historical_climate_endpoint():
    response = client.get("/api/historical/Bhubaneswar?year1=2020&year2=2024")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Bhubaneswar"
    assert "year1_data" in data
    assert "year2_data" in data
    assert "climate_analysis" in data
    assert len(data["year1_data"]["monthly_data"]) == 12
    assert len(data["year2_data"]["monthly_data"]) == 12
    assert "warming_anomaly_celsius" in data["climate_analysis"]

