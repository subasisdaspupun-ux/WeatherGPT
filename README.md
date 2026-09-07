# WeatherGPT 🌦️🤖

**WeatherGPT** is an AI-powered, multilingual weather and disaster-risk assistant. It delivers location-aware, accurate weather insights grounded strictly in real weather data fetched from **Open-Meteo** and **India Meteorological Department (IMD)** feeds — accompanied by severe weather safety advisories and decision-support risk indicators without hallucination.

---

## 🌟 Core Features

1. **Grounded AI Weather Chatbot (Gemini API)**:
   - Ask natural-language questions in **English**, **Hindi (हिन्दी)**, **Odia (ଓଡ଼ିଆ)**, **Bengali (বাংলা)**, **Telugu (తెలుగు)**, or **Tamil (தமிழ்)**.
   - Built on a strict *"fetch real data first, then explain"* paradigm — the AI never fabricates or invents weather numbers.
   - Integrated speech-to-text voice input.

2. **Real-Time Weather & 16-Day Forecast**:
   - Current temperature, apparent feel, relative humidity, wind velocity, surface pressure, visibility, and UV index.
   - 7-day daily forecast grid & 24-hour hourly trend visualizer.

3. **Disaster Risk Engine & IMD Warning Bulletins**:
   - Automated multi-parameter disaster risk engine computing **LOW**, **MODERATE**, **HIGH**, or **EXTREME** decision-support risk levels.
   - Direct integration with IMD district warning color levels (**GREEN**, **YELLOW**, **ORANGE**, **RED**).
   - Actionable safety protocols and emergency guidance.

4. **Machine Learning Rain Prediction**:
   - Trained **Random Forest Classifier** (`ml/train.py`) estimating short-term rain probability based on real-time atmospheric inputs.

5. **Interactive Weather Maps & Data Visualizations**:
   - Leaflet + OpenStreetMap interactive location map.
   - Recharts visualizer for 24-hour temperature curves and rainfall probability bars.
   - Air Quality Index (AQI) card with PM2.5, PM10, Ozone, and NO₂ pollutant metrics.

---

## 🏗️ Tech Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet, React-Leaflet, Axios.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, HTTPX, PyJWT.
- **AI / NLP**: Google Gemini API (`google-genai` SDK).
- **Weather Data**: Open-Meteo Forecast & Air Quality APIs + IMD District Warning feeds + Open-Meteo Geocoding.
- **Machine Learning**: Scikit-Learn (RandomForestClassifier), Joblib, Pandas, NumPy.

---

## 📂 Project Structure

```
WeatherGPT/
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Backend dependencies
│   ├── .env.example             # Environment variable template
│   ├── models/                  # Pydantic schemas (weather, chat, risk, alerts)
│   ├── routes/                  # API routers (weather, alerts, chat)
│   ├── services/                # Open-Meteo, IMD, Risk Engine & Gemini AI services
│   └── utils/                   # Geocoding location resolver
├── frontend/
│   ├── package.json             # React dependencies
│   ├── vite.config.js           # Vite dev server configuration
│   ├── tailwind.config.js       # Tailwind CSS theme settings
│   └── src/
│       ├── App.jsx              # Main Dashboard App Shell
│       ├── i18n/                # Multilingual translations (EN, HI, OR, BN, TE, TA)
│       ├── services/            # Axios API client
│       └── components/          # Navbar, WeatherCard, Forecast, AlertBanner, WeatherChart, WeatherMap, AirQualityCard, ChatBox
├── data/
│   └── sample_weather.csv       # Training dataset for rain prediction
├── ml/
│   ├── train.py                 # Random Forest training script
│   ├── predict.py               # ML inference module
│   └── model.pkl                # Trained scikit-learn model artifact
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Set your Gemini API key inside .env (Optional; fallback grounded engine active if key is blank)
# GEMINI_API_KEY=your_actual_key_here

# Train the ML model
python ../ml/train.py

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000`. Documentation available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server
npm run dev
```
Frontend Web Dashboard will be live at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/weather/{city}` | Returns complete current weather, 7-day forecast, hourly data, AQI, and risk report |
| `GET` | `/api/forecast/{city}` | Returns 16-day forecast and hourly metrics |
| `GET` | `/api/alerts/{district}` | Returns IMD district alerts & Disaster Risk Engine report |
| `GET` | `/api/air-quality/{city}` | Returns AQI index and detailed atmospheric pollutant concentrations |
| `POST` | `/api/chat` | Natural language grounded Q&A with Gemini AI (`{ message, location, language }`) |

---

## 🛡️ License & Disclaimers

Automated risk levels (**LOW**, **MODERATE**, **HIGH**, **EXTREME**) are decision-support indicators calculated from meteorological observations and district warning bulletins. Official warnings are directly sourced from the India Meteorological Department (IMD).
