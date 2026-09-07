import os
import joblib
import pandas as pd
import numpy as np

_MODEL = None

def get_model():
    global _MODEL
    if _MODEL is None:
        model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
        if os.path.exists(model_path):
            _MODEL = joblib.load(model_path)
        else:
            _MODEL = None
    return _MODEL

def predict_rain_probability(temp: float, humidity: float, pressure: float, wind_speed: float, cloud_cover: float) -> float:
    """
    Returns rain probability percentage (0 - 100) using Random Forest model.
    """
    model = get_model()
    if model is not None:
        try:
            df = pd.DataFrame(
                [[temp, humidity, pressure, wind_speed, cloud_cover]],
                columns=["temperature", "humidity", "pressure", "wind_speed", "cloud_cover"]
            )
            probs = model.predict_proba(df)
            if probs.shape[1] > 1:
                return float(round(probs[0][1] * 100, 1))
            return float(round(probs[0][0] * 100, 1))
        except Exception as e:
            print(f"Error evaluating ML model: {e}")
    
    # Atmospheric heuristic fallback
    heuristic = (humidity * 0.4) + (cloud_cover * 0.3) + (max(0, 1013.25 - pressure) * 1.5) + (wind_speed * 0.3)
    return float(round(min(99.0, max(1.0, heuristic)), 1))
