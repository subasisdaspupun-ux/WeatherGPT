import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe, CloudRain, Bot, ShieldAlert, User, LogIn, LogOut, ArrowLeft, Smartphone, Mic, MicOff, Volume2, VolumeX, Settings, History, X, CornerDownLeft, ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';
import InstallAppModal from './InstallAppModal';
import { startVoiceRecognition, isVoiceRecognitionSupported } from '../utils/speech';
import { POPULAR_CITIES, detectLiveLocation } from '../services/api';
import { COUNTRIES, DEFAULT_COUNTRY, getCountryByCode, getCountryFlag, ODISHA_DISTRICTS, INDIA_MAJOR_CITIES } from '../services/countries';


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
  onOpenVoiceModal
}) {
  const [inputVal, setInputVal] = useState('');
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try {
      const saved = localStorage.getItem('weathergpt_selected_country');
      if (saved) {
        return getCountryByCode(saved);
      }
    } catch (e) {}
    return DEFAULT_COUNTRY;
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryFilterText, setCountryFilterText] = useState('');
  const [geoSuggestions, setGeoSuggestions] = useState([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [indiaCategory, setIndiaCategory] = useState('all'); // 'all' | 'odisha' | 'india'
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const searchContainerRef = useRef(null);
  const countryPickerRef = useRef(null);

  // Sync country pill when live location or searched city has a resolved country code
  useEffect(() => {
    if (detectedCountryCode) {
      const matched = getCountryByCode(detectedCountryCode);
      if (matched && matched.code !== selectedCountry.code) {
        setSelectedCountry(matched);
      }
    }
  }, [detectedCountryCode]);

  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Close suggestions and country picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (countryPickerRef.current && !countryPickerRef.current.contains(e.target)) {
        setShowCountryPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setCountryFilterText('');
    try {
      localStorage.setItem('weathergpt_selected_country', country.code);
    } catch (e) {}
  };

  // Debounced live geocoding suggestions with cross-country fallback and prioritization
  useEffect(() => {
    const query = inputVal.trim();
    if (query.length < 2) {
      setGeoSuggestions([]);
      setIsSearchingGeo(false);
      return;
    }

    let active = true;
    setIsSearchingGeo(true);
    const timer = setTimeout(async () => {
      try {
        const isGlobal = selectedCountry.code === 'GLOBAL';
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=12&language=en&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        if (!active) return;
        if (data && data.results) {
          const allResults = data.results;
          if (isGlobal) {
            setGeoSuggestions(allResults.slice(0, 10));
          } else {
            const inSelected = allResults.filter(r =>
              (r.country_code && r.country_code.toUpperCase() === selectedCountry.code.toUpperCase()) ||
              (r.country && r.country.toLowerCase() === selectedCountry.name.toLowerCase())
            );
            const inOthers = allResults.filter(r =>
              !((r.country_code && r.country_code.toUpperCase() === selectedCountry.code.toUpperCase()) ||
              (r.country && r.country.toLowerCase() === selectedCountry.name.toLowerCase()))
            );
            setGeoSuggestions([...inSelected, ...inOthers].slice(0, 10));
          }
        } else {
          setGeoSuggestions([]);
        }
      } catch (err) {
        if (active) setGeoSuggestions([]);
      } finally {
        if (active) setIsSearchingGeo(false);
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputVal, selectedCountry]);

  const handleSelectGeoItem = (item) => {
    const matchedCountry = getCountryByCode(item.country_code, item.country);
    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
      try {
        localStorage.setItem('weathergpt_selected_country', matchedCountry.code);
      } catch (e) {}
    }
    setInputVal('');
    setShowSuggestions(false);
    onSearch(item.name, matchedCountry || selectedCountry);
    if (onBackToDashboard) onBackToDashboard();
  };

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
          onSearch(cityToUse, selectedCountry);
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
      onSearch(query, selectedCountry);
      setInputVal('');
      setShowSuggestions(false);
      if (onBackToDashboard) onBackToDashboard();
    }
  };

  const handleSelectCity = (cityName) => {
    setInputVal('');
    setShowSuggestions(false);
    onSearch(cityName, selectedCountry);
    if (onBackToDashboard) onBackToDashboard();
  };

  const handleLocateMe = async () => {
    if (isLocating) return;
    setIsLocating(true);
    setShowSuggestions(false);
    setLocationNotice(null);
    try {
      const loc = await detectLiveLocation({ requireGps: true });
      // Pass null country so live coordinates are not restricted to current country filter
      onSearch(loc, null);
    } catch (err) {
      console.warn('Live location error:', err);
      setLocationNotice('Location blocked by browser. Click the 🔒 lock icon near your address bar to allow Location access.');
      setTimeout(() => setLocationNotice(null), 9000);
    } finally {
      setIsLocating(false);
    }
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  const countryPopularCities = selectedCountry.popularCities || POPULAR_CITIES;

  // Filtered list for India combining Odisha districts and major Indian cities
  const filteredIndiaLocations = (() => {
    let list = [];
    if (indiaCategory === 'odisha') {
      list = ODISHA_DISTRICTS;
    } else if (indiaCategory === 'india') {
      list = INDIA_MAJOR_CITIES;
    } else {
      list = [...ODISHA_DISTRICTS, ...INDIA_MAJOR_CITIES];
    }
    if (!inputVal) return list;
    const q = inputVal.toLowerCase().trim();
    return list.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.district && item.district.toLowerCase().includes(q)) ||
      (item.state && item.state.toLowerCase().includes(q)) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.region && item.region.toLowerCase().includes(q))
    );
  })();

  const filteredStaticCities = countryPopularCities.filter(c =>
    !inputVal || c.toLowerCase().includes(inputVal.toLowerCase().trim())
  );

  const QUICK_COUNTRIES = [
    COUNTRIES.find(c => c.code === 'IN') || DEFAULT_COUNTRY,
    COUNTRIES.find(c => c.code === 'US'),
    COUNTRIES.find(c => c.code === 'GB'),
    COUNTRIES.find(c => c.code === 'AE'),
    COUNTRIES.find(c => c.code === 'GLOBAL')
  ].filter(Boolean);

  const filteredCountries = COUNTRIES.filter(c =>
    !countryFilterText ||
    c.name.toLowerCase().includes(countryFilterText.toLowerCase().trim()) ||
    c.code.toLowerCase().includes(countryFilterText.toLowerCase().trim())
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
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-7 h-20 flex items-center justify-between gap-3 lg:gap-6">
          {/* Brand & Optional Back Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {currentView === 'login' || currentView === 'historical' || currentView === 'settings' ? (
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-cyan-400 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : null}

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { if (onBackToDashboard) onBackToDashboard(); }}>
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

          {/* Interactive Search Bar with Country Selector and Suggestions */}
          <div ref={searchContainerRef} className="flex-1 min-w-[190px] max-w-2xl mx-1 sm:mx-2 relative">
            <form onSubmit={handleSubmit} className="relative flex items-center w-full">
              <div className={`relative flex items-center w-full bg-slate-900/90 hover:bg-slate-900 border rounded-2xl transition-all shadow-inner ${
                isListening
                  ? "border-red-500/80 ring-2 ring-red-500/30 bg-red-950/20"
                  : "border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400"
              }`}>

                {/* Integrated Country Selector Pill / Button */}
                <div ref={countryPickerRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCountryPicker(!showCountryPicker);
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-xs font-semibold text-slate-200 hover:text-cyan-300 border-r border-slate-700/70 hover:bg-slate-800/60 rounded-l-2xl transition-colors cursor-pointer"
                    title={`Selected Country: ${selectedCountry.name}. Click to change country.`}
                  >
                    <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
                    <span className="text-xs font-bold text-slate-200 max-w-[45px] sm:max-w-[70px] md:max-w-[85px] truncate">
                      {selectedCountry.code === 'GLOBAL' ? 'Global' : selectedCountry.name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showCountryPicker ? 'rotate-180 text-cyan-400' : ''}`} />
                  </button>

                  {/* Country Picker Dropdown Popover */}
                  {showCountryPicker && (
                    <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-[#0A0F1D] border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn divide-y divide-slate-800/80">
                      <div className="p-2.5 bg-slate-900/95">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Select Country First</span>
                          <span className="text-[10px] text-slate-500 font-normal">{COUNTRIES.length} countries</span>
                        </div>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={countryFilterText}
                            onChange={(e) => setCountryFilterText(e.target.value)}
                            placeholder="Search country..."
                            autoFocus
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40 py-1">
                        {filteredCountries.map((c) => {
                          const isSelected = selectedCountry.code === c.code;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => handleSelectCountry(c)}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                                  : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="text-base select-none">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Search Input */}
                <div className="relative flex-1 flex items-center">
                  <Search className="w-3.5 h-3.5 text-cyan-400/80 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setShowCountryPicker(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e);
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder={
                      isListening
                        ? (t.voiceListening || "🎙️ Listening... Speak location")
                        : (selectedCountry.code === 'GLOBAL'
                            ? (t.searchPlaceholder || "Search any location...")
                            : `Search in ${selectedCountry.name}...`)
                    }
                    className="w-full bg-transparent pl-9 pr-24 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
                  />

                  {/* Action Buttons inside right of search input */}
                  <div className="absolute right-2 flex items-center gap-1">
                    {/* Clear Input Button */}
                    {inputVal && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputVal('');
                          setShowSuggestions(false);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
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
                      <Mic className="w-3.5 h-3.5" />
                    </button>

                    {/* Current Location Detect Button */}
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      title={isLocating ? "Detecting your live location..." : (t.autoLocate || "Locate Me")}
                      className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                        isLocating
                          ? "text-cyan-300 bg-cyan-500/20 animate-pulse cursor-wait"
                          : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800 cursor-pointer"
                      }`}
                    >
                      {isLocating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Sleek Search Submit Button */}
                    <button
                      type="submit"
                      title={t.searchBtn || "Search"}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-1.5 px-2 rounded-xl flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 font-bold" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Browser Permission / Location Alert Notice */}
            {locationNotice && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-amber-950/95 border border-amber-500/50 text-amber-200 text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-2.5 animate-fadeIn backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] leading-tight">{locationNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationNotice(null)}
                  className="text-amber-400 hover:text-white p-1 rounded-lg hover:bg-amber-900/40 shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* City Autocomplete Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0F1D] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {/* Prominent Country Selector in Dropdown Header */}
                <div className="p-2.5 sm:p-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Country:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCountryPicker(!showCountryPicker);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#131C31] hover:bg-[#1A2642] border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold text-white transition-all shadow-md shadow-cyan-500/10 cursor-pointer group"
                      title="Click to select another country"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="text-cyan-300 group-hover:text-white font-bold">{selectedCountry.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${showCountryPicker ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Quick Switch Pills */}
                  <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] text-slate-500 mr-0.5">Quick:</span>
                    {QUICK_COUNTRIES.map((qc) => (
                      <button
                        key={qc.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCountry(qc);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          selectedCountry.code === qc.code
                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80'
                        }`}
                        title={`Switch country to ${qc.name}`}
                      >
                        <span>{qc.flag}</span> {qc.code === 'GLOBAL' ? 'All' : qc.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expandable Country Picker Grid inside Dropdown */}
                {showCountryPicker && (
                  <div className="p-3 bg-[#070B14] border-b border-cyan-500/30 animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Select Country ({COUNTRIES.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCountryPicker(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative mb-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={countryFilterText}
                        onChange={(e) => setCountryFilterText(e.target.value)}
                        placeholder="Search country name or code..."
                        autoFocus
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 py-1">
                      {filteredCountries.map((c) => {
                        const isSelected = selectedCountry.code === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCountry(c)}
                            className={`text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-base select-none">{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Category tabs when India is selected */}
                {selectedCountry.code === 'IN' && (
                  <div className="px-3.5 py-1.5 bg-[#080d19] border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIndiaCategory('all');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                        indiaCategory === 'all'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      🌟 All India & Odisha ({ODISHA_DISTRICTS.length + INDIA_MAJOR_CITIES.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIndiaCategory('odisha');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                        indiaCategory === 'odisha'
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                      }`}
                    >
                      🌊 Odisha (All 30 Districts)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIndiaCategory('india');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                        indiaCategory === 'india'
                          ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                      }`}
                    >
                      🇮🇳 Major Cities ({INDIA_MAJOR_CITIES.length})
                    </button>
                  </div>
                )}

                {/* Live Geocoded Results (when user types) */}
                {geoSuggestions.length > 0 && (
                  <div>
                    <div className="px-3.5 py-1.5 text-[9px] font-bold text-cyan-400/90 bg-slate-900/60 uppercase flex items-center justify-between border-b border-slate-800/50">
                      <span>Matching Locations</span>
                      <span className="text-slate-500 font-normal">Select location & country</span>
                    </div>
                    {geoSuggestions.map((item, idx) => {
                      const displayCity = item.name;
                      const adminInfo = item.admin1 || '';
                      const itemCountryFlag = getCountryFlag(item.country_code);
                      return (
                        <button
                          key={`geo-${item.id || idx}`}
                          type="button"
                          onClick={() => handleSelectGeoItem(item)}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:text-cyan-300 hover:bg-slate-800/80 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">{displayCity}</span>
                              {adminInfo && (
                                <span className="text-[11px] text-slate-400 ml-1.5 truncate">
                                  ({adminInfo})
                                </span>
                              )}
                            </div>
                            {item.country && (
                              <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-full ml-auto flex items-center gap-1 shrink-0">
                                <span>{itemCountryFlag}</span>
                                <span className="max-w-[85px] truncate">{item.country}</span>
                              </span>
                            )}
                          </div>
                          <CornerDownLeft className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Filtered static locations for India or other countries */}
                {selectedCountry.code === 'IN' ? (
                  filteredIndiaLocations.length > 0 && (
                    <div>
                      {geoSuggestions.length > 0 && (
                        <div className="px-3.5 py-1 text-[9px] font-semibold text-slate-400 bg-slate-900/40 uppercase">
                          {indiaCategory === 'odisha' ? 'Odisha Districts & Towns' : 'Locations in India'}
                        </div>
                      )}
                      <div className="divide-y divide-slate-800/40 max-h-64 overflow-y-auto">
                        {filteredIndiaLocations
                          .filter(l => !geoSuggestions.some(g => g.name.toLowerCase() === l.name.toLowerCase()))
                          .slice(0, 25)
                          .map((loc) => (
                            <button
                              key={`${loc.name}-${loc.district || loc.state}`}
                              type="button"
                              onClick={() => handleSelectCity(loc.name)}
                              className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:text-cyan-300 hover:bg-slate-800/80 flex items-center justify-between transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <MapPin className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${loc.isOdisha ? 'text-emerald-400' : 'text-cyan-400'}`} />
                                <span className="font-semibold text-white group-hover:text-cyan-200">{loc.name}</span>
                                {loc.isOdisha ? (
                                  <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded ml-1">
                                    🌊 Odisha • {loc.type || loc.district}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-300 bg-slate-800/80 border border-slate-700/60 px-1.5 py-0.5 rounded ml-1">
                                    {loc.state} {loc.region ? `• ${loc.region}` : ''}
                                  </span>
                                )}
                              </div>
                              <CornerDownLeft className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                            </button>
                          ))}
                      </div>
                    </div>
                  )
                ) : (
                  filteredStaticCities.length > 0 && (
                    <div>
                      {geoSuggestions.length > 0 && (
                        <div className="px-3.5 py-1 text-[9px] font-semibold text-slate-400 bg-slate-900/40 uppercase">
                          Suggested Cities
                        </div>
                      )}
                      {filteredStaticCities
                        .filter(c => !geoSuggestions.some(g => g.name.toLowerCase() === c.toLowerCase()))
                        .slice(0, 10)
                        .map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleSelectCity(city)}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:text-cyan-300 hover:bg-slate-800/80 flex items-center justify-between transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                              <span className="font-semibold text-white">{city}</span>
                              <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/60 ml-1">
                                {selectedCountry.code === 'GLOBAL' ? 'Global' : selectedCountry.name}
                              </span>
                            </div>
                            <CornerDownLeft className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                    </div>
                  )
                )}

                {/* Fallback if no matching static cities and no geocode results */}
                {geoSuggestions.length === 0 && (selectedCountry.code === 'IN' ? filteredIndiaLocations.length === 0 : filteredStaticCities.length === 0) && (
                  <div className="px-4 py-3 text-center text-xs text-slate-400">
                    {isSearchingGeo ? (
                      <span>Searching locations in {selectedCountry.name}...</span>
                    ) : (
                      <span>
                        Press Enter to search "<span className="text-cyan-300 font-semibold">{inputVal}</span>" in {selectedCountry.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Voice Narration Mode Toggle Button */}
            <button
              onClick={onToggleAutoSpeak}
              title={autoSpeak ? (t.autoVoiceOn || "Auto Voice: ON") : (t.autoVoiceOff || "Auto Voice: OFF")}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center group ${
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
              className="hidden sm:flex items-center gap-1.5 bg-[#131C31] hover:bg-[#1A2642] border border-[#23355A] hover:border-cyan-400 p-2 2xl:px-2.5 2xl:py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer group shrink-0"
            >
              <Smartphone className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors shrink-0" />
              <span className="text-[11px] font-bold text-white tracking-tight hidden 2xl:inline">Install</span>
            </button>

            {/* Risk Level Pill */}
            {riskLevel && currentView !== 'login' && (
              <div className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${getRiskBadgeColor()}`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.riskLevels[riskLevel] || riskLevel}</span>
              </div>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative flex items-center gap-1 bg-slate-900 border border-slate-700/70 px-2 py-1.5 rounded-xl text-xs" title="Select Application Language">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
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
              className={`p-2 2xl:px-2.5 2xl:py-2 rounded-xl border transition-all flex items-center gap-1.5 font-semibold text-xs ${
                currentView === 'historical'
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-slate-700/70 text-slate-300 hover:text-cyan-400 hover:border-slate-600"
              }`}
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span className="hidden 2xl:inline">{t.climateTrends}</span>
            </button>

            {/* Accessible Voice AI Assistant Button */}
            <button
              onClick={onOpenVoiceModal}
              title={t.voiceCompanion}
              className="relative p-2 2xl:px-2.5 2xl:py-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/10 active:scale-95 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden 2xl:inline">{t.voiceCompanion}</span>
            </button>

            {/* Settings Page Button */}
            <button
              onClick={onOpenSettings}
              title="Application Settings"
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
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
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-2.5 sm:px-3 py-2 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 shrink-0"
            >
              <Bot className="w-4 h-4 animate-spin-slow" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>


            {/* User Account / Login Button */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2 py-1.5 rounded-xl shrink-0" title={user.name}>
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden 2xl:inline max-w-[80px] truncate">{user.name}</span>
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
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all shrink-0"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Login</span>
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
