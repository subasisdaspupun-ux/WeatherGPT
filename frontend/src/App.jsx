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
import { fetchWeather, detectLiveLocation } from './services/api';
import { Loader2, AlertCircle, Mic } from 'lucide-react';
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
    } catch {}
    return 'or'; // Default to Odia
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'login' | 'settings' | 'historical'
  const [user, setUser] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    } catch (e) {}
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
        } catch (e) {}
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
      } catch (e) {}

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
      } catch (e) {}

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
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
        />

        {/* Main Content: Dashboard, Historical Climate View, Login View, or Settings View */}
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
              {/* Alert Banner / Disaster Risk Assessment */}
              <AlertBanner
                alertsData={weatherData.alerts}
                currentLang={currentLang}
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
