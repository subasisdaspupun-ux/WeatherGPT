import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, Gauge, Eye, Sparkles, Volume2, VolumeX, Radio } from 'lucide-react';
import { translations } from '../i18n/translations';
import { useSettings } from '../context/SettingsContext';

export default function WeatherCard({ data, currentLang, isSpeaking = false, onSpeakCurrent, onStopSpeech }) {
  if (!data) return null;
  const t = translations[currentLang] || translations.en;
  const { location, current } = data;
  const { formatTemp, convertTempNum, tempUnit, formatWind, formatPressure } = useSettings();

  const getWeatherIcon = (code) => {
    if ([0, 1].includes(code)) return <Sun className="w-16 h-16 text-amber-400 animate-pulse" />;
    if ([2, 3, 45, 48].includes(code)) return <Cloud className="w-16 h-16 text-slate-300" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className="w-16 h-16 text-purple-400 animate-bounce" />;
    return <CloudRain className="w-16 h-16 text-cyan-400" />;
  };

  const mainTempNum = convertTempNum(current.temperature);
  const feelsLikeFormatted = formatTemp(current.apparent_temperature);

  return (
    <div className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar Location & Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{location.name}</h2>
            {location.country_code && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                {location.country_code}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {location.district && `${location.district}, `}{location.state ? `${location.state}, ` : ''}{location.country}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Speak Aloud Button */}
          <button
            onClick={() => {
              if (isSpeaking) {
                if (onStopSpeech) onStopSpeech();
              } else {
                if (onSpeakCurrent) onSpeakCurrent();
              }
            }}
            title={isSpeaking ? (t.stopSpeaking || "Stop Voice") : (t.speakWeather || "Speak Weather Report")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-md active:scale-95 cursor-pointer ${
              isSpeaking
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse shadow-cyan-500/30"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>{t.stopSpeaking || "Stop Voice"}</span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full"></span>
                  <span className="w-1 h-4 bg-cyan-300 animate-pulse delay-75 rounded-full"></span>
                  <span className="w-1 h-2 bg-cyan-400 animate-pulse delay-150 rounded-full"></span>
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>{t.speakWeather || "Speak Weather"}</span>
              </>
            )}
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Data: {current.source}
          </span>
        </div>
      </div>

      {/* Main Temperature & Icon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
        <div className="md:col-span-7 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-inner">
            {getWeatherIcon(current.weather_code)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white tracking-tight">
                {mainTempNum}
              </span>
              <span className="text-3xl font-bold text-cyan-400">°{tempUnit}</span>
            </div>
            <p className="text-lg font-semibold text-slate-200 mt-1">
              {current.weather_condition}
            </p>
            <p className="text-xs text-slate-400">
              {t.feelsLike} <span className="text-slate-200 font-semibold">{feelsLikeFormatted}</span>
            </p>
          </div>
        </div>

        {/* ML Rain Prediction Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900/90 to-cyan-950/40 p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                {t.rainPredictionML}
              </span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
              Random Forest ML
            </span>
          </div>
          
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{current.rain_probability_ml}%</span>
            <span className="text-xs text-slate-300 font-medium">
              {current.rain_probability_ml > 60 ? 'High Rain Chance' : current.rain_probability_ml > 30 ? 'Moderate Rain Chance' : 'Low Rain Chance'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(5, current.rain_probability_ml)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{t.humidity}</p>
            <p className="text-sm font-bold text-white">{current.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <Wind className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{t.windSpeed}</p>
            <p className="text-sm font-bold text-white">{formatWind(current.wind_speed)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <Gauge className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{t.pressure}</p>
            <p className="text-sm font-bold text-white">{formatPressure(current.pressure)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <Eye className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{t.visibility}</p>
            <p className="text-sm font-bold text-white">{current.visibility} km</p>
          </div>
        </div>
      </div>
    </div>
  );
}
