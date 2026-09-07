import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Globe2, 
  MapPin, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Wind, 
  Droplets, 
  CloudRain, 
  Thermometer, 
  Crosshair,
  Sparkles
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { useSettings } from '../context/SettingsContext';

// Tile Layer Configurations (100% Free & Open - No API Key Required)
const MAP_LAYERS = {
  dark: {
    name: 'Dark World',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  topo: {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
};

// Popular World Metros for Quick-Fly Navigation
const WORLD_METROS = [
  { name: 'Tokyo', country: 'Japan', query: 'Tokyo' },
  { name: 'London', country: 'UK', query: 'London' },
  { name: 'New York', country: 'USA', query: 'New York' },
  { name: 'Paris', country: 'France', query: 'Paris' },
  { name: 'Sydney', country: 'Australia', query: 'Sydney' },
  { name: 'Dubai', country: 'UAE', query: 'Dubai' },
  { name: 'Singapore', country: 'Singapore', query: 'Singapore' },
  { name: 'Bhubaneswar', country: 'India', query: 'Bhubaneswar' },
  { name: 'Delhi', country: 'India', query: 'New Delhi' },
  { name: 'Cairo', country: 'Egypt', query: 'Cairo' },
  { name: 'São Paulo', country: 'Brazil', query: 'Sao Paulo' }
];

// Custom Glowing Radar DivIcon for searched location
const createRadarIcon = (cityName, temp) => {
  return L.divIcon({
    className: 'custom-world-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        <!-- Expanding Radar Waves -->
        <div class="absolute w-12 h-12 rounded-full bg-cyan-400/30 radar-beacon"></div>
        <div class="absolute w-8 h-8 rounded-full bg-cyan-500/40 animate-ping"></div>
        
        <!-- Center Glowing Pin -->
        <div class="relative z-10 w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center text-white">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>

        <!-- City & Temp Floating Tag -->
        <div class="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md text-[10px] font-bold text-cyan-300 px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1">
          <span>${cityName}</span>
          ${temp !== undefined ? `<span class="text-white font-extrabold">${temp}°C</span>` : ''}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24]
  });
};

// Map Controller for Smooth FlyTo, Clicks and Zoom Handling
function MapController({ targetCoords, activeLayer, isFullscreen, onMapClick }) {
  const map = useMap();
  const prevCoordsRef = useRef(null);

  // Smooth FlyTo whenever searched target coordinates change
  useEffect(() => {
    if (!targetCoords || !map) return;
    const { lat, lng } = targetCoords;

    const isDifferent = !prevCoordsRef.current || 
      Math.abs(prevCoordsRef.current.lat - lat) > 0.001 || 
      Math.abs(prevCoordsRef.current.lng - lng) > 0.001;

    if (isDifferent) {
      prevCoordsRef.current = { lat, lng };
      
      // Calculate current zoom level
      const currentZoom = map.getZoom();
      const targetZoom = currentZoom < 5 ? 8 : Math.max(currentZoom, 8);

      map.flyTo([lat, lng], targetZoom, {
        animate: true,
        duration: 1.8,
        easeLinearity: 0.25
      });

      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetCoords, map]);

  // Adjust size on fullscreen toggles
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  // Handle map click events
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return null;
}

export default function WeatherMap({ location, current, currentLang, onSearchLocation }) {
  const [activeLayer, setActiveLayer] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clickedSpot, setClickedSpot] = useState(null);
  const mapRef = useRef(null);
  const { formatTemp, formatWind } = useSettings();

  if (!location) return null;
  const t = translations[currentLang] || translations.en;
  const { latitude, longitude, name, country, state, district } = location;

  const handleFlyToWorld = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([20, 0], 2, {
        animate: true,
        duration: 1.5
      });
    }
  };

  const handleFlyToLocation = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([latitude, longitude], 10, {
        animate: true,
        duration: 1.5
      });
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleMapClick = (lat, lng) => {
    setClickedSpot({ lat, lng });
  };

  const handleInspectClickedSpot = () => {
    if (clickedSpot && onSearchLocation) {
      onSearchLocation(`${clickedSpot.lat.toFixed(4)},${clickedSpot.lng.toFixed(4)}`);
      setClickedSpot(null);
    }
  };

  return (
    <div className={`glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 border border-slate-800/80 shadow-2xl ${
      isFullscreen ? 'fixed inset-4 z-50 bg-[#0A0F1D]/95 max-w-none' : 'w-full'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {t.interactiveMapTitle || 'Interactive World Map'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Global Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Real-time geospatial tracking & weather explorer
            </p>
          </div>
        </div>

        {/* Location Telemetry HUD Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-slate-300 shadow-inner">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-white font-bold">{name}</span>
          {country && <span className="text-slate-400">({country})</span>}
          <span className="text-cyan-400/80 font-mono text-[11px] hidden md:inline">
            {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
          </span>
        </div>
      </div>

      {/* Quick World Cities Exploration Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 scrollbar-none text-xs">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Explore:</span>
        </div>
        {WORLD_METROS.map((city) => (
          <button
            key={city.name}
            onClick={() => onSearchLocation && onSearchLocation(city.query)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 border ${
              name.toLowerCase().includes(city.name.toLowerCase())
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/70 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* World Map Viewport Container */}
      <div className={`w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-10 ${
        isFullscreen ? 'h-[calc(100%-140px)]' : 'h-80 sm:h-96'
      }`}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={8}
          minZoom={2}
          maxZoom={18}
          worldCopyJump={true}
          zoomControl={false}
          style={{ height: '100%', width: '100%', borderRadius: '1rem', background: '#0b1120' }}
          ref={mapRef}
        >
          {/* Active Cartography Layer */}
          <TileLayer
            key={activeLayer}
            attribution={MAP_LAYERS[activeLayer].attribution}
            url={MAP_LAYERS[activeLayer].url}
          />

          {/* Searched Location Active Radar Marker */}
          <Marker 
            position={[latitude, longitude]} 
            icon={createRadarIcon(name, current?.temperature)}
          >
            <Popup className="custom-dark-popup">
              <div className="p-3.5 min-w-[210px] text-slate-100 font-sans">
                <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2.5">
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {state ? `${state}, ` : ''}{country || 'Global'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Live
                  </span>
                </div>

                {current && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-red-400" /> Temp
                      </span>
                      <span className="font-bold text-white text-sm">{formatTemp(current.temperature)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Condition</span>
                      <span className="font-semibold text-cyan-300">{current.weather_condition}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span>{current.humidity}% Hum</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Wind className="w-3 h-3 text-emerald-400" />
                        <span>{formatWind(current.wind_speed)}</span>
                      </div>
                    </div>

                    {current.rain_probability_ml !== undefined && (
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <CloudRain className="w-3 h-3 text-cyan-400" /> Rain Prob
                        </span>
                        <span className="font-bold text-cyan-400">{current.rain_probability_ml}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Map Controller & Click Handler */}
          <MapController
            targetCoords={{ lat: latitude, lng: longitude }}
            activeLayer={activeLayer}
            isFullscreen={isFullscreen}
            onMapClick={handleMapClick}
          />
        </MapContainer>

        {/* Top-Right Map Controls Overlay */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
          {/* Layer Selector Dropdown */}
          <div className="relative group">
            <button
              title="Change Map Style"
              className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-cyan-400 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
            >
              <Layers className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:flex flex-col gap-1 bg-slate-950/95 border border-slate-700/90 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl min-w-[130px]">
              {Object.entries(MAP_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-between ${
                    activeLayer === key
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{layer.name}</span>
                  {activeLayer === key && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* World View (Full Globe) */}
          <button
            onClick={handleFlyToWorld}
            title="World View (Full Globe)"
            className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-cyan-300 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
          >
            <Globe2 className="w-4 h-4" />
          </button>

          {/* Center On Target Location */}
          <button
            onClick={handleFlyToLocation}
            title="Focus Searched Location"
            className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-emerald-400 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Zoom In / Out */}
          <div className="flex flex-col bg-slate-950/85 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-md overflow-hidden">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-9 h-8 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border-b border-slate-800"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-9 h-8 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Expansion Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
            className="w-9 h-9 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Map Click Floating Action Dialog */}
        {clickedSpot && (
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Selected Coordinates
              </span>
              <button
                onClick={() => setClickedSpot(null)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] font-mono text-cyan-300 mb-2.5">
              Lat: {clickedSpot.lat.toFixed(4)}°, Lon: {clickedSpot.lng.toFixed(4)}°
            </p>
            <button
              onClick={handleInspectClickedSpot}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs py-1.5 px-3 rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              Load Weather for this Spot
            </button>
          </div>
        )}

        {/* Bottom Interactive Guide Tip */}
        <div className="absolute bottom-3 right-3 z-[400] pointer-events-none hidden sm:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 px-3 py-1 rounded-full text-[10px] font-medium text-slate-400 backdrop-blur-md">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>Click anywhere on the world map to inspect weather</span>
        </div>
      </div>
    </div>
  );
}
