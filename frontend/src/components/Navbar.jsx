import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe, CloudRain, Bot, ShieldAlert, User, LogIn, LogOut, ArrowLeft, Smartphone, Mic, MicOff, Volume2, VolumeX, Settings, History, X, CornerDownLeft } from 'lucide-react';
import { translations } from '../i18n/translations';
import InstallAppModal from './InstallAppModal';
import { startVoiceRecognition, isVoiceRecognitionSupported } from '../utils/speech';
import { POPULAR_CITIES } from '../services/api';


const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' }
];

export default function Navbar({
  currentCity,
  onSearch,
  currentLang,
  onLangChange,
  toggleChat,
  riskLevel,
  user,
  onOpenLogin,
  onLogout,
  currentView,
  onBackToDashboard,
  autoSpeak = true,
  onToggleAutoSpeak,
  isSpeaking = false,
  onOpenSettings,
  onOpenHistorical,
  onOpenVoiceModal
}) {
  const [inputVal, setInputVal] = useState('');
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      setInstallModalOpen(true);
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const instance = startVoiceRecognition({
      lang: currentLang,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: (err) => {
        console.warn('Voice recognition error:', err);
        setIsListening(false);
      },
      onResult: (cleanedCity, rawTranscript) => {
        setIsListening(false);
        const cityToUse = cleanedCity || rawTranscript;
        if (cityToUse) {
          setInputVal(cityToUse);
          onSearch(cityToUse);
          setShowSuggestions(false);
          if (onBackToDashboard) onBackToDashboard();
        }
      }
    });
    setRecognitionInstance(instance);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = inputVal.trim();
    if (query) {
      onSearch(query);
      setInputVal('');
      setShowSuggestions(false);
      if (onBackToDashboard) onBackToDashboard();
    }
  };

  const handleSelectCity = (cityName) => {
    setInputVal('');
    setShowSuggestions(false);
    onSearch(cityName);
    if (onBackToDashboard) onBackToDashboard();
  };

  const handleLocateMe = () => {
    setShowSuggestions(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSearch(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          onSearch('Bhubaneswar');
        }
      );
    } else {
      onSearch('Bhubaneswar');
    }
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  const filteredSuggestions = POPULAR_CITIES.filter(c =>
    !inputVal || c.toLowerCase().includes(inputVal.toLowerCase().trim())
  );

  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'EXTREME': return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MODERATE': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand & Optional Back Button */}
          <div className="flex items-center gap-3">
            {currentView === 'login' || currentView === 'historical' || currentView === 'settings' ? (
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-cyan-400 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : null}

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onSearch('Bhubaneswar'); if (onBackToDashboard) onBackToDashboard(); }}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center">
                  <CloudRain className="w-7 h-7 text-cyan-400 animate-bounce" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                    Weather<span className="text-cyan-400">GPT</span>
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI + IMD
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Search Bar with Suggestions */}
          <div ref={searchContainerRef} className="flex-1 min-w-[240px] md:min-w-[320px] max-w-lg relative">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              {/* Left Search Icon */}
              <div className="absolute left-3 pointer-events-none text-slate-400 z-10 flex items-center">
                <Search className="w-4 h-4 text-cyan-400/70" />
              </div>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder={isListening ? (t.voiceListening || "🎙️ Listening... Speak city name") : t.searchPlaceholder}
                className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-24 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-all ${
                  isListening
                    ? "border-red-500/80 ring-2 ring-red-500/30 bg-red-950/20"
                    : "border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                }`}
              />

              {/* Action Buttons inside right of search input */}
              <div className="absolute right-1.5 flex items-center gap-1">
                {/* Clear Input Button */}
                {inputVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputVal('');
                      setShowSuggestions(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Voice Command Search Button */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title={isListening ? "Listening... (Click to stop)" : (t.voiceSearch || "Voice Search")}
                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                    isListening
                      ? "bg-red-500/30 text-red-400 border border-red-500/50 animate-pulse shadow-lg shadow-red-500/40"
                      : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-3.5 h-3.5 text-red-400 animate-ping" />
                  ) : (
                    <Mic className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Auto Locate Button */}
                <button
                  type="button"
                  onClick={handleLocateMe}
                  title={t.autoLocate}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>

                {/* Sleek Compact Search Submit Button */}
                <button
                  type="submit"
                  title={t.searchBtn || "Search"}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-1.5 rounded-lg flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Search className="w-3.5 h-3.5 font-bold" />
                </button>
              </div>
            </form>

            {/* City Autocomplete Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0F1D] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80 flex items-center justify-between">
                  <span>Suggested Locations</span>
                  <span className="text-slate-500 font-normal">Click to search</span>
                </div>
                {filteredSuggestions.slice(0, 7).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:text-cyan-300 hover:bg-slate-800/80 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      <span className="font-semibold text-white">{city}</span>
                    </div>
                    <CornerDownLeft className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Voice Narration Mode Toggle Button */}
            <button
              onClick={onToggleAutoSpeak}
              title={autoSpeak ? (t.autoVoiceOn || "Auto Voice: ON") : (t.autoVoiceOff || "Auto Voice: OFF")}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center group ${
                autoSpeak
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-slate-700/70 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-4 h-4 text-cyan-300 animate-bounce" />
              ) : autoSpeak ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Install App Button (Matching User Screenshot) */}
            <button
              onClick={handleInstallClick}
              title="Install Mobile App"
              className="flex items-center gap-2 bg-[#131C31] hover:bg-[#1A2642] border border-[#23355A] hover:border-cyan-400 px-3 py-1.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer group shrink-0"
            >
              <Smartphone className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors shrink-0" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[11px] font-extrabold text-white tracking-tight">Install</span>
                <span className="text-[11px] font-extrabold text-white tracking-tight">App</span>
              </div>
            </button>

            {/* Risk Level Pill */}
            {riskLevel && currentView !== 'login' && (
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${getRiskBadgeColor()}`}>
                <ShieldAlert className="w-4 h-4" />
                <span>{t.riskLevels[riskLevel] || riskLevel}</span>
              </div>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-700/70 px-3 py-2 rounded-xl text-sm">
              <Globe className="w-4 h-4 text-cyan-400" />
              <select
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Climate Trends View Button */}
            <button
              onClick={onOpenHistorical}
              title={t.climateAnalysis}
              className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all flex items-center gap-2 font-semibold text-xs ${
                currentView === 'historical'
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-slate-600"
              }`}
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">{t.climateTrends}</span>
            </button>

            {/* Accessible Voice AI Assistant Button */}
            <button
              onClick={onOpenVoiceModal}
              title={t.voiceCompanion}
              className="relative p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 font-extrabold text-xs transition-all flex items-center gap-2 shadow-md shadow-cyan-500/10 active:scale-95 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline">{t.voiceCompanion}</span>
            </button>

            {/* Settings Page Button */}
            <button
              onClick={onOpenSettings}
              title="Application Settings"
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                currentView === 'settings'
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-slate-600"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* AI Chat Button */}
            <button
              onClick={toggleChat}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <Bot className="w-4 h-4 animate-spin-slow" />
              <span className="hidden xl:inline">Ask AI Assistant</span>
            </button>


            {/* User Account / Login Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden xl:inline max-w-[90px] truncate">{user.name}</span>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        onInstallPrompt={handleInstallClick}
      />
    </>
  );
}
