import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { useSettings } from '../context/SettingsContext';

export default function WeatherChart({ hourly, currentLang }) {
  const [activeTab, setActiveTab] = useState('temp'); // 'temp' or 'rain'
  if (!hourly || !hourly.time || hourly.time.length === 0) return null;
  const t = translations[currentLang] || translations.en;
  const { convertTempNum, tempUnit } = useSettings();

  const chartData = hourly.time.map((tStr, idx) => {
    const d = new Date(tStr);
    const hourLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      time: hourLabel,
      temp: convertTempNum(hourly.temperature_2m[idx]),
      rainProb: hourly.precipitation_probability[idx],
      humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[idx] : 70
    };
  });

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            {t.hourlyTrend}
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'temp' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Temperature (°{tempUnit})
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'rain' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Precipitation (%)
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        {activeTab === 'temp' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} interval={3} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val) => [`${val}°${tempUnit}`, 'Temperature']}
              />
              <Area type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} interval={3} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val) => [`${val}%`, 'Rain Chance']}
              />
              <Bar dataKey="rainProb" fill="#00f5d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
