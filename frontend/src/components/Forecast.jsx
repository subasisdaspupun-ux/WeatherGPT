import React from 'react';
import { Sun, Cloud, CloudRain, Calendar, Umbrella } from 'lucide-react';
import { translations } from '../i18n/translations';
import { useSettings } from '../context/SettingsContext';

export default function Forecast({ forecast, currentLang }) {
  if (!forecast || forecast.length === 0) return null;
  const t = translations[currentLang] || translations.en;
  const { formatTemp } = useSettings();

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(currentLang === 'or' ? 'or-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getWeatherIcon = (code) => {
    if ([0, 1].includes(code)) return <Sun className="w-6 h-6 text-amber-400" />;
    if ([2, 3, 45, 48].includes(code)) return <Cloud className="w-6 h-6 text-slate-300" />;
    return <CloudRain className="w-6 h-6 text-cyan-400" />;
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
        <Calendar className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          {t.forecast7Day}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {forecast.map((day, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <p className="text-xs font-semibold text-slate-300 mb-2">
              {idx === 0 ? 'Today' : formatDate(day.date)}
            </p>

            <div className="my-2 transform group-hover:scale-110 transition-transform">
              {getWeatherIcon(day.weather_code)}
            </div>

            <p className="text-xs font-medium text-slate-400 my-1 truncate w-full px-1">
              {day.weather_condition}
            </p>

            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-sm font-extrabold text-white">{formatTemp(day.temp_max)}</span>
              <span className="text-xs font-semibold text-slate-500">{formatTemp(day.temp_min)}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium mt-2">
              <Umbrella className="w-3 h-3" />
              <span>{Math.round(day.precipitation_probability)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
