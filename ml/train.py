import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

def train_rain_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.abspath(os.path.join(current_dir, "..", "data", "sample_weather.csv"))
    
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Creating synthetic training set.")
        np.random.seed(42)
        n_samples = 200
        temp = np.random.uniform(20, 40, n_samples)
        humidity = np.random.uniform(30, 99, n_samples)
        pressure = np.random.uniform(1000, 1020, n_samples)
        wind = np.random.uniform(2, 35, n_samples)
        clouds = np.random.uniform(0, 100, n_samples)
        
        # Simple heuristic formula for rain target
        rain_prob = (humidity / 100.0 * 0.4) + (clouds / 100.0 * 0.3) + ((1020 - pressure) / 20.0 * 0.2) + (wind / 35.0 * 0.1)
        target = (rain_prob > 0.55).astype(int)
        
        df = pd.DataFrame({
            "temperature": temp,
            "humidity": humidity,
            "pressure": pressure,
            "wind_speed": wind,
            "cloud_cover": clouds,
            "rain_occurred": target
        })
    else:
        df = pd.read_csv(data_path)

    X = df[["temperature", "humidity", "pressure", "wind_speed", "cloud_cover"]]
    y = df["rain_occurred"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    accuracy = accuracy_score(y_test, preds)
    print(f"RandomForest Model trained successfully! Accuracy: {accuracy * 100:.2f}%")

    model_file = os.path.join(current_dir, "model.pkl")
    joblib.dump(model, model_file)
    print(f"Model saved to {model_file}")
    return model_file

if __name__ == "__main__":
    train_rain_model()
