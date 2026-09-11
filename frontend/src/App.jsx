import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import WeatherCard from './components/WeatherCard';
import Forecast from './components/Forecast';
import AlertBanner from './components/AlertBanner';
import WeatherChart from './components/WeatherChart';
import WeatherMap from './components/WeatherMap';
import AirQualityCard from './components/AirQualityCard';
import ChatBox from './components/ChatBox';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import RiskAlertMessageBox from './components/RiskAlertMessageBox';
import FutureScope from './components/FutureScope';
import DashboardSearchBar from './components/DashboardSearchBar';
import { fetchWeather, detectLiveLocation, sendRiskAlertEmail } from './services/api';
import { Loader2, AlertCircle, Mic, AlertTriangle, ShieldAlert, Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { speakWeatherReport, stopSpeech, generateWeatherSpeechText } from './utils/speech';
import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  const [currentCity, setCurrentCity] = useState(() => {
    try {
      const saved = localStorage.getItem('weathergpt_current_city');
      if (saved && !saved.toLowerCase().includes('mumbai') && !saved.toLowerCase().includes('detecting')) {
        return saved;
      }
    } catch {
      return 'Bhubaneswar';
    }
    return 'Bhubaneswar';
  });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem('weathergpt_lang');
      if (saved && ['en', 'hi', 'or', 'bn', 'te', 'ta'].includes(saved)) {
        return saved;
      }
    } catch { }
    return 'or'; // Default to Odia
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'login' | 'settings' | 'historical'
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [autoEmailNotice, setAutoEmailNotice] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastEmailedRef = useRef({});

  // Reference to track whether speech was triggered
  const autoSpeakRef = useRef(autoSpeak);
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  const speakCurrentWeather = (dataToSpeak = weatherData, langToUse = currentLang) => {
    if (!dataToSpeak) return;
    const text = generateWeatherSpeechText(dataToSpeak, langToUse);
    speakWeatherReport({
      text,
      lang: langToUse,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('weathergpt_lang', lang);
    } catch (e) { }
    if (isSpeaking && weatherData) {
      handleStopSpeech();
      speakCurrentWeather(weatherData, lang);
    }
  };

  const loadCityWeather = async (city, triggerVoice = autoSpeakRef.current, country = null) => {
    setLoading(true);
    setError(null);
    handleStopSpeech();
    try {
      const data = await fetchWeather(city, country);
      setWeatherData(data);
      if (data.location && data.location.name) {
        setCurrentCity(data.location.name);
        try {
          localStorage.setItem('weathergpt_current_city', data.location.name);
        } catch (e) { }
      }
      // Speak the weather of the searched location if voice narration is active
      if (triggerVoice) {
        setTimeout(() => {
          speakCurrentWeather(data, currentLang);
        }, 400);
      }
    } catch (err) {
      console.error(err);
      setError(`Unable to fetch weather data for "${city}". Please check city name or network.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initLiveLocation = async () => {
      // Clear any outdated 'Mumbai' or 'Detecting...' stored from earlier ISP fallback
      try {
        const saved = localStorage.getItem('weathergpt_current_city');
        if (saved && (saved.toLowerCase().includes('mumbai') || saved.toLowerCase().includes('detecting'))) {
          localStorage.removeItem('weathergpt_current_city');
        }
      } catch (e) { }

      // If user previously granted GPS permission, load true GPS coordinates
      try {
        if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
          const perm = await navigator.permissions.query({ name: 'geolocation' });
          if (perm.state === 'granted') {
            const liveTarget = await detectLiveLocation({ requireGps: true });
            if (isMounted && liveTarget) {
              await loadCityWeather(liveTarget, false);
              return;
            }
          }
        }
      } catch (e) { }

      // Otherwise load valid saved city or default to Bhubaneswar
      try {
        const saved = localStorage.getItem('weathergpt_current_city');
        const target = (saved && !saved.toLowerCase().includes('mumbai') && !saved.toLowerCase().includes('detecting'))
          ? saved
          : 'Bhubaneswar';
        if (isMounted) {
          await loadCityWeather(target, false);
        }
      } catch (err) {
        if (isMounted) {
          await loadCityWeather('Bhubaneswar', false);
        }
      }
    };

    initLiveLocation();
    return () => { isMounted = false; };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Automated Risk Alert Email Dispatcher
  useEffect(() => {
    if (!weatherData || !weatherData.alerts) return;

    const riskAssessment = weatherData.alerts.risk_assessment;
    const currentRisk = riskAssessment?.risk_level || 'LOW';

    // 1. Resolve alert recipient email
    let email = user?.email || '';
    let autoEnabled = true;
    let minRisk = 'HIGH';

    try {
      const saved = localStorage.getItem('weathergpt_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.alertEmail) email = parsed.alertEmail;
        if (parsed.autoEmailAlerts !== undefined) autoEnabled = parsed.autoEmailAlerts;
        if (parsed.alertMinRisk) minRisk = parsed.alertMinRisk;
      }
    } catch (e) { }

    if (!email) {
      try {
        const directEmail = localStorage.getItem('weathergpt_alert_email');
        if (directEmail) email = directEmail;
      } catch (e) { }
    }

    if (!email || !autoEnabled) return;

    // 2. Check risk threshold (LOW, MODERATE, HIGH, EXTREME)
    const riskLevels = ['LOW', 'MODERATE', 'HIGH', 'EXTREME'];
    const currentIdx = riskLevels.indexOf(currentRisk);
    const minIdx = riskLevels.indexOf(minRisk);
    if (currentIdx < minIdx || currentIdx < 2) {
      return; // Below threshold or below HIGH
    }

    const cityName = weatherData.location?.name || currentCity;
    const dedupeKey = `${cityName}_${currentRisk}`;
    const now = Date.now();
    const COOLDOWN_MS = 30 * 60 * 1000; // 30-minute cooldown per city & risk level

    if (lastEmailedRef.current[dedupeKey] && (now - lastEmailedRef.current[dedupeKey] < COOLDOWN_MS)) {
      return;
    }

    lastEmailedRef.current[dedupeKey] = now;

    // 3. Dispatch automated risk email
    sendRiskAlertEmail({
      to_email: email,
      city: cityName,
      risk_level: currentRisk,
      risk_score: riskAssessment?.risk_score || 0,
      dominant_hazard: riskAssessment?.dominant_hazard || 'Severe Atmospheric Hazard',
      primary_warning: weatherData.alerts?.imd_warnings?.[0]?.headline || `${currentRisk} Risk Alert for ${cityName}`,
      safety_actions: riskAssessment?.actionable_guidelines || ['Stay indoors and keep emergency kits ready.'],
      weather_metrics: {
        temperature_c: weatherData.current?.temperature_2m,
        wind_speed_kmh: weatherData.current?.wind_speed_10m,
        precipitation_probability: weatherData.current?.precipitation_probability ?? 0,
        relative_humidity: weatherData.current?.relative_humidity_2m
      }
    }).then((res) => {
      if (res?.status === 'sent' || res?.status === 'simulated') {
        setAutoEmailNotice({
          email,
          city: cityName,
          riskLevel: currentRisk,
          status: res.status
        });
        setTimeout(() => setAutoEmailNotice(null), 8000);
      }
    }).catch((err) => {
      console.error('Automated risk email failed:', err);
    });
  }, [weatherData, user]);

  const riskLevel = weatherData?.alerts?.risk_assessment?.risk_level || 'LOW';

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-[#0A0F1D] text-slate-100 font-sans flex flex-col">
        {/* Navigation Header */}
        <Navbar
          currentCity={currentCity}
          detectedCountryCode={weatherData?.location?.country_code}
          onSearch={(city, country) => {
            loadCityWeather(city, true, country);
            setCurrentView('dashboard');
          }}
          currentLang={currentLang}
          onLangChange={handleLangChange}
          toggleChat={() => setChatOpen(!chatOpen)}
          riskLevel={riskLevel}
          user={user}
          onOpenLogin={() => setCurrentView('login')}
          onLogout={handleLogout}
          currentView={currentView}
          onBackToDashboard={() => setCurrentView('dashboard')}
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={() => {
            if (isSpeaking) handleStopSpeech();
            setAutoSpeak(!autoSpeak);
          }}
          isSpeaking={isSpeaking}
          onOpenSettings={() => setCurrentView(currentView === 'settings' ? 'dashboard' : 'settings')}
          onOpenHistorical={() => setCurrentView(currentView === 'historical' ? 'dashboard' : 'historical')}
          onOpenFutureScope={() => setCurrentView(currentView === 'scope' ? 'dashboard' : 'scope')}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
          onOpenRiskAlert={() => setRiskModalOpen(true)}
        />
        {/* Floating Automated Risk Alert Dispatched Notification */}
        {autoEmailNotice && (
          <aside aria-label="Alert Notification" className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md bg-slate-900/95 border border-cyan-500/50 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-black text-xs sm:text-sm text-cyan-300 tracking-tight">Auto-Alert Email Dispatched</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${autoEmailNotice.riskLevel === 'EXTREME' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                  {autoEmailNotice.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Emergency risk warning for <strong className="text-white">{autoEmailNotice.city}</strong> was automatically sent to <span className="text-cyan-300 font-mono text-[11px] break-all">{autoEmailNotice.email}</span>.
              </p>
            </div>
            <button
              onClick={() => setAutoEmailNotice(null)}
              className="text-slate-400 hover:text-white text-base leading-none p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              title="Close notification"
            >
              ×
            </button>
          </aside>
        )}

        {/* Main Content: Dashboard, Historical Climate View, Login View, Settings View, or Future Scope View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {currentView === 'login' ? (
            <LoginPage
              onBack={() => setCurrentView('dashboard')}
              onLoginSuccess={handleLoginSuccess}
            />
          ) : currentView === 'settings' ? (
            <SettingsPage
              onBack={() => setCurrentView('dashboard')}
            />
          ) : currentView === 'historical' ? (
            <HistoricalAnalysis
              currentCity={currentCity}
              currentLang={currentLang}
              onBack={() => setCurrentView('dashboard')}
            />
          ) : currentView === 'scope' ? (
            <FutureScope
              onBack={() => setCurrentView('dashboard')}
              currentLang={currentLang}
            />
          ) : loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-400 animate-pulse">
                Fetching real-time weather & IMD warning feeds for {currentCity}...
              </p>
            </div>
          ) : error ? (
            <div className="glass-card border border-red-500/30 bg-red-950/20 p-8 rounded-3xl text-center max-w-xl mx-auto my-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Weather Search Error</h3>
              <p className="text-xs text-slate-300 mb-6">{error}</p>
              <button
                onClick={() => loadCityWeather('Bhubaneswar')}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                Reset to Bhubaneswar
              </button>
            </div>
          ) : weatherData ? (
            <>
              {/* Prominent Dashboard Search & Quick Location Bar */}
              <DashboardSearchBar
                onSearch={(city, country) => loadCityWeather(city, true, country)}
                currentCity={currentCity}
                currentLang={currentLang}
              />

              {/* Urgent Warning Message Box Banner for Elevated/Extreme Risks */}
              {(riskLevel === 'HIGH' || riskLevel === 'EXTREME') && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl transition-all ${riskLevel === 'EXTREME'
                      ? 'bg-red-950/70 border-red-500 text-red-100 animate-pulse'
                      : 'bg-orange-950/70 border-orange-500 text-orange-100'
                    }`}
                >
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className={`p-2.5 rounded-xl shrink-0 ${riskLevel === 'EXTREME' ? 'bg-red-500/30 text-red-300' : 'bg-orange-500/30 text-orange-300'}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
                        <span>{riskLevel === 'EXTREME' ? 'CRITICAL DISASTER RISK ALERT' : 'SEVERE WEATHER WARNING'}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase">
                          {weatherData.location?.name}
                        </span>
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        High atmospheric danger indicators detected. Review safety procedures immediately.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRiskModalOpen(true)}
                    className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Open Alert Message Box</span>
                  </button>
                </div>
              )}

              {/* Alert Message Box in Dashboard */}
              <AlertBanner
                alertsData={weatherData.alerts}
                currentLang={currentLang}
                onOpenRiskModal={() => setRiskModalOpen(true)}
                currentWeather={weatherData.current}
              />

              {/* Top Grid: Weather Card & Interactive World Map */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6">
                  <WeatherCard
                    data={weatherData}
                    currentLang={currentLang}
                    isSpeaking={isSpeaking}
                    onSpeakCurrent={() => speakCurrentWeather(weatherData, currentLang)}
                    onStopSpeech={handleStopSpeech}
                  />
                </div>
                <div className="lg:col-span-6">
                  <WeatherMap
                    location={weatherData.location}
                    current={weatherData.current}
                    currentLang={currentLang}
                    onSearchLocation={(city) => loadCityWeather(city, true)}
                  />
                </div>
              </div>

              {/* 7-Day Forecast */}
              <Forecast
                forecast={weatherData.forecast}
                currentLang={currentLang}
              />

              {/* Hourly Trend Chart & Air Quality Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <WeatherChart
                    hourly={weatherData.hourly}
                    currentLang={currentLang}
                  />
                </div>
                <div className="lg:col-span-5">
                  <AirQualityCard
                    airQuality={weatherData.air_quality}
                    currentLang={currentLang}
                  />
                </div>
              </div>

              {/* SIH 2026: Future Scope & Social Impact Showcase Banner */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1627] to-slate-900 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      SIH 2026 Strategic Vision
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Slide Deck 09 • 10 • 11</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>Applications, Social Impact & Future Scope</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Move from a dashboard prototype toward a proactive weather intelligence platform supporting 6 core social sectors (Agriculture, Travel, Local Administration, Education, General Public, Emergency Services) and an 8-point technological roadmap.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('scope')}
                  className="shrink-0 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>Explore Future Scope & Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : null}
        </main>

        {/* Floating Quick Voice Interaction Trigger Button (Bottom Left - Especially handy for rural/mobile users) */}
        {!voiceModalOpen && (
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="fixed bottom-6 left-6 z-30 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-2.5 transform hover:scale-105 active:scale-95 transition-all group font-extrabold text-xs sm:text-sm"
            title="Speak Weather Question"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            <span className="tracking-tight">Speak with AI 🎙️</span>
          </button>
        )}

        {/* Floating AI Assistant Trigger Button (Bottom Right) */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-4 rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all group"
          >
            <div className="w-3 h-3 rounded-full bg-cyan-300 animate-ping"></div>
            <span className="font-extrabold text-sm tracking-tight">WeatherGPT AI</span>
          </button>
        )}

        {/* Dedicated Voice Assistant Modal for Rural / Low-Literacy users */}
        <VoiceAssistantModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          currentCity={currentCity}
          currentLang={currentLang}
          onLangChange={handleLangChange}
          currentWeather={weatherData}
        />

        {/* Disaster Risk Alert Message Box Modal */}
        <RiskAlertMessageBox
          isOpen={riskModalOpen}
          onClose={() => setRiskModalOpen(false)}
          alertsData={weatherData?.alerts}
          currentLang={currentLang}
          currentCity={currentCity}
          currentWeather={weatherData?.current}
        />

        {/* Chat Assistant Drawer */}
        <ChatBox
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentCity={currentCity}
          currentLang={currentLang}
          currentWeather={weatherData}
        />

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070B14] py-6 mt-12 text-center text-xs text-slate-500">
          <p>WeatherGPT — AI-Powered Multilingual Weather & Disaster-Risk Assistant</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Grounded Data Sources: Open-Meteo REST API • India Meteorological Department (IMD) Bulletins • Open-Meteo Historical Archive
          </p>
        </footer>
      </div>
    </SettingsProvider>
  );
}
