import sys
import os

# Ensure backend directory and project root are in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(backend_dir, ".."))
for path in (backend_dir, project_root):
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv(os.path.join(backend_dir, ".env"))

try:
    from routes.weather import router as weather_router
    from routes.alerts import router as alerts_router
    from routes.chat import router as chat_router
    from routes.historical import router as historical_router
    from routes.websocket import router as websocket_router
except ModuleNotFoundError:
    from backend.routes.weather import router as weather_router
    from backend.routes.alerts import router as alerts_router
    from backend.routes.chat import router as chat_router
    from backend.routes.historical import router as historical_router
    from backend.routes.websocket import router as websocket_router

app = FastAPI(
    title="WeatherGPT API",
    description="AI-powered, Multilingual Weather & Disaster-Risk Assistant Grounded in Real Weather Data",
    version="1.0.0"
)

# CORS middleware configuration
origins_str = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in origins_str.split(",")] if origins_str != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(weather_router)
app.include_router(alerts_router)
app.include_router(chat_router)
app.include_router(historical_router)
app.include_router(websocket_router)

@app.get("/api")
async def api_status():
    return {
        "app": "WeatherGPT API",
        "status": "online",
        "endpoints": [
            "/api/weather/{city}",
            "/api/forecast/{city}",
            "/api/alerts/{district}",
            "/api/air-quality/{city}",
            "/api/chat"
        ]
    }

# Serve built frontend static files if dist directory exists
dist_dir = os.path.abspath(os.path.join(backend_dir, "..", "frontend", "dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_index():
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return await api_status()
else:
    @app.get("/")
    async def root():
        return await api_status()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
