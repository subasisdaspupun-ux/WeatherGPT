import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Bot,
  ShieldAlert,
  LogIn,
  LogOut,
  ArrowLeft,
  Smartphone,
  Mic,
  Volume2,
  VolumeX,
  Settings,
  History,
  Sparkles,
  Globe
} from 'lucide-react';
import { translations } from '../i18n/translations';
import InstallAppModal from './InstallAppModal';

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
  detectedCountryCode,
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
  onOpenFutureScope,
  onOpenVoiceModal,
  onOpenRiskAlert
}) {
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

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
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand & Optional Back Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {currentView === 'login' || currentView === 'historical' || currentView === 'settings' || currentView === 'scope' ? (
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : null}

            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => { if (onBackToDashboard) onBackToDashboard(); }}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center">
                  <CloudRain className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 animate-bounce" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                    Weather<span className="text-cyan-400">GPT</span>
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI + IMD
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden md:block">
                  {t.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Voice Narration Mode Toggle Button */}
            <button
              onClick={onToggleAutoSpeak}
              title={autoSpeak ? (t.autoVoiceOn || "Auto Voice: ON") : (t.autoVoiceOff || "Auto Voice: OFF")}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all flex items-center justify-center group cursor-pointer ${
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

            {/* Install App Button */}
            <button
              onClick={handleInstallClick}
              title="Install Mobile App"
              className="hidden 2xl:flex items-center gap-1.5 bg-[#131C31] hover:bg-[#1A2642] border border-[#23355A] hover:border-cyan-400 p-2 2xl:px-2.5 2xl:py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer group shrink-0"
            >
              <Smartphone className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors shrink-0" />
              <span className="text-[11px] font-bold text-white tracking-tight hidden 2xl:inline">Install</span>
            </button>

            {/* Risk Level Pill & Alert Box Button */}
            {riskLevel && currentView !== 'login' && (
              <button
                type="button"
                onClick={onOpenRiskAlert}
                title="Click to open Risk Alert Message Box"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer ${getRiskBadgeColor()}`}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.riskLevels[riskLevel] || riskLevel}</span>
                <span className="sm:hidden">{riskLevel}</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative flex items-center gap-1.5 bg-slate-900 border border-slate-700/70 px-2.5 py-1.5 rounded-xl text-xs" title="Select Application Language">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                title="Select Application Language"
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
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 font-semibold text-xs cursor-pointer ${
                currentView === 'historical'
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-slate-600"
              }`}
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">{t.climateTrends}</span>
            </button>

            {/* Future Scope & Social Impact View Button */}
            <button
              onClick={onOpenFutureScope}
              title={t.futureScopeTitle || "Future Scope & Social Impact"}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 font-semibold text-xs cursor-pointer ${
                currentView === 'scope'
                  ? "bg-gradient-to-r from-cyan-500/25 to-purple-500/25 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-slate-600"
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">{t.futureScopeBtn || "Future Scope"}</span>
            </button>

            {/* Accessible Voice AI Assistant Button */}
            <button
              onClick={onOpenVoiceModal}
              title={t.voiceCompanion}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/10 active:scale-95 group cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline">{t.voiceCompanion}</span>
            </button>

            {/* Settings Page Button */}
            <button
              onClick={onOpenSettings}
              title="Application Settings"
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
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
              title="WeatherGPT AI Chat"
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 shrink-0 cursor-pointer"
            >
              <Bot className="w-4 h-4 animate-spin-slow" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* User Account / Login Button */}
            <div className="pl-2 border-l border-slate-800 flex items-center shrink-0">
              {user ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 border border-cyan-500/40 pl-1.5 pr-2.5 py-1.5 rounded-xl shrink-0 shadow-md transition-all hover:border-cyan-400" title={user.name}>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-100 max-w-[85px] truncate">{user.name}</span>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 shrink-0 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
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
