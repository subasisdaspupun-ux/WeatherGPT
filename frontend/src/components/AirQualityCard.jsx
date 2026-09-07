import React from 'react';
import { Wind, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function AirQualityCard({ airQuality, currentLang }) {
  if (!airQuality) return null;
  const t = translations[currentLang] || translations.en;

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Good' };
    if (aqi <= 100) return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Moderate' };
    if (aqi <= 150) return { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Unhealthy for Sensitive' };
    return { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Unhealthy / Poor' };
  };

  const aqiTheme = getAQIColor(airQuality.us_aqi);

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            {t.airQualityTitle}
          </h3>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${aqiTheme.bg}`}>
          {airQuality.us_aqi} AQI • {airQuality.quality_label || aqiTheme.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <p className="text-[11px] text-slate-400 font-medium">PM2.5</p>
          <p className="text-base font-extrabold text-white mt-0.5">{airQuality.pm2_5} <span className="text-[10px] text-slate-400">µg/m³</span></p>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <p className="text-[11px] text-slate-400 font-medium">PM10</p>
          <p className="text-base font-extrabold text-white mt-0.5">{airQuality.pm10} <span className="text-[10px] text-slate-400">µg/m³</span></p>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <p className="text-[11px] text-slate-400 font-medium">Ozone (O₃)</p>
          <p className="text-base font-extrabold text-white mt-0.5">{airQuality.ozone} <span className="text-[10px] text-slate-400">µg/m³</span></p>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <p className="text-[11px] text-slate-400 font-medium">NO₂</p>
          <p className="text-base font-extrabold text-white mt-0.5">{airQuality.nitrogen_dioxide} <span className="text-[10px] text-slate-400">µg/m³</span></p>
        </div>
      </div>
    </div>
  );
}
