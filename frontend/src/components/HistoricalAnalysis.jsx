import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  History,
  TrendingUp,
  CloudRain,
  Sun,
  Flame,
  AlertTriangle,
  ArrowLeft,
  Volume2,
  RefreshCw,
  Sparkles,
  Leaf,
  Calendar
} from 'lucide-react';
import { fetchHistoricalAnalysis } from '../services/api';
import { translations } from '../i18n/translations';
import { useSettings } from '../context/SettingsContext';
import { speakText, stopSpeech } from '../utils/speech';

const AVAILABLE_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

export default function HistoricalAnalysis({ currentCity, currentLang, onBack }) {
  const t = translations[currentLang] || translations.en;
  const { convertTempNum, tempUnit } = useSettings();

  const [year1, setYear1] = useState(2020);
  const [year2, setYear2] = useState(2024);
  const [activeTab, setActiveTab] = useState('temp'); // 'temp' | 'rain' | 'multi'
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const loadData = async (y1, y2) => {
    setLoading(true);
    stopSpeech();
    setSpeaking(false);
    try {
      const data = await fetchHistoricalAnalysis(currentCity, y1, y2);
      setAnalysisData(data);
    } catch (err) {
      console.error("Historical fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(year1, year2);
    return () => {
      stopSpeech();
    };
  }, [currentCity, year1, year2]);

  const handleSpeakSummary = () => {
    if (!analysisData || !analysisData.climate_analysis) return;
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }

    const desc = `${analysisData.city}. ${analysisData.climate_analysis.trend_description}. ${analysisData.climate_analysis.agricultural_advisory}`;
    speakText({
      text: desc,
      lang: currentLang,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  // Format monthly comparison data for Recharts
  const monthlyChartData = analysisData?.year1_data?.monthly_data?.map((m1, idx) => {
    const m2 = analysisData?.year2_data?.monthly_data?.[idx] || {};
    return {
      month: m1.month,
      [`temp_${year1}`]: convertTempNum(m1.temp_mean_avg),
      [`temp_${year2}`]: convertTempNum(m2.temp_mean_avg || m1.temp_mean_avg),
      [`max_${year1}`]: convertTempNum(m1.temp_max_avg),
      [`max_${year2}`]: convertTempNum(m2.temp_max_avg || m1.temp_max_avg),
      [`rain_${year1}`]: m1.rainfall_sum_mm,
      [`rain_${year2}`]: m2.rainfall_sum_mm || 0
    };
  }) || [];

  // Multi-year trajectory data
  const multiYearData = analysisData?.multi_year_trend?.map(item => ({
    year: item.year.toString(),
    avgTemp: convertTempNum(item.avg_temp),
    totalRain: item.total_rainfall,
    heatwaveDays: item.heatwave_days
  })) || [];

  const anomaly = analysisData?.climate_analysis?.warming_anomaly_celsius || 0;
  const rainChange = analysisData?.climate_analysis?.rainfall_change_percent || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>{t.backToDashboard}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-black text-white tracking-tight">
                {t.climateAnalysis}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {currentCity} • Historical Weather & Climate Change Patterns
            </p>
          </div>
        </div>

        {/* Year Comparison Selector Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-xs">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">{t.baseYear}:</span>
            <select
              value={year1}
              onChange={(e) => setYear1(Number(e.target.value))}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {AVAILABLE_YEARS.map(y => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-bold text-xs">vs</div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/50 px-3 py-1.5 rounded-2xl text-xs shadow-md shadow-cyan-500/10">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">{t.targetYear}:</span>
            <select
              value={year2}
              onChange={(e) => setYear2(Number(e.target.value))}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {AVAILABLE_YEARS.map(y => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSpeakSummary}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
              speaking
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse shadow-lg shadow-cyan-500/20"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            }`}
            title="Narration"
          >
            <Volume2 className={`w-4 h-4 ${speaking ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{speaking ? t.stopSpeaking : t.speakWeather}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-72 flex flex-col items-center justify-center gap-4 glass-card rounded-3xl">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400 animate-pulse">
            Retrieving historical meteorological archive & generating climate comparison...
          </p>
        </div>
      ) : analysisData ? (
        <>
          {/* Key Climate Anomaly & Trend Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Warming Anomaly */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{t.warmingAnomaly}</span>
                <div className={`p-2 rounded-xl ${anomaly >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {anomaly > 0 ? `+${anomaly}` : anomaly}°{tempUnit}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Average warming change between {year1} and {year2}
              </p>
            </div>

            {/* Rainfall Shift */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{t.annualRain} Shift</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <CloudRain className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {rainChange > 0 ? `+${rainChange}` : rainChange}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {analysisData.year2_data.total_rainfall_mm} mm ({year2}) vs {analysisData.year1_data.total_rainfall_mm} mm ({year1})
              </p>
            </div>

            {/* Heatwave Days */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{t.heatwaveDays}</span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                  <Sun className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {analysisData.year2_data.heatwave_days} Days
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                vs {analysisData.year1_data.heatwave_days} days recorded in {year1}
              </p>
            </div>

            {/* Heavy Rain Episodes */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Heavy Rain Days (&gt;50mm)</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {analysisData.year2_data.heavy_rain_days} Days
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                vs {analysisData.year1_data.heavy_rain_days} in {year1}
              </p>
            </div>
          </div>

          {/* Interactive Comparison Charts */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {activeTab === 'temp' ? `${t.tempTrends} (${year1} vs ${year2})` : activeTab === 'rain' ? `${t.rainTrends} (${year1} vs ${year2})` : '5-Year Climate Trajectory'}
                </h3>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('temp')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'temp' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.tempTrends}
                </button>
                <button
                  onClick={() => setActiveTab('rain')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'rain' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.rainTrends}
                </button>
                <button
                  onClick={() => setActiveTab('multi')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'multi' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Multi-Year Trend
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-80 w-full">
              {activeTab === 'temp' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} unit={`°${tempUnit}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey={`temp_${year1}`}
                      name={`${year1} Mean Temp`}
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey={`temp_${year2}`}
                      name={`${year2} Mean Temp`}
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey={`max_${year2}`}
                      name={`${year2} Peak Summer`}
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : activeTab === 'rain' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit=" mm" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey={`rain_${year1}`} name={`${year1} Rainfall (mm)`} fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={`rain_${year2}`} name={`${year2} Rainfall (mm)`} fill="#00f5d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={multiYearData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="multiTempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} unit={`°${tempUnit}`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 12 }} unit=" mm" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '14px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="avgTemp" name={`Annual Avg Temp (°${tempUnit})`} stroke="#f59e0b" strokeWidth={3} fill="url(#multiTempGrad)" />
                    <Line yAxisId="right" type="monotone" dataKey="totalRain" name="Annual Rainfall (mm)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Climate Change & Rural Agricultural Advisory Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Trend Explanation */}
            <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  {t.climateChange} Summary
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {analysisData.climate_analysis.trend_description}
              </p>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>Hottest Year: {analysisData.climate_analysis.hottest_year_recorded}</span>
                <span>Wettest Year: {analysisData.climate_analysis.wettest_year_recorded}</span>
              </div>
            </div>

            {/* Rural & Agricultural Advisory */}
            <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-emerald-200 tracking-tight">
                  {t.agriAdvisory}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {analysisData.climate_analysis.agricultural_advisory}
              </p>
              <div className="text-[11px] text-emerald-400/80 pt-2 border-t border-emerald-500/20">
                💡 Useful for farmers adapting to monsoon shift and high-temperature stress windows.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
