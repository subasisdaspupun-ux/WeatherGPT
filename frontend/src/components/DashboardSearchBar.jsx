import React, { useState } from 'react';
import { Search, MapPin, Mic, MicOff, Loader2, Sparkles, Navigation } from 'lucide-react';
import { startVoiceRecognition, isVoiceRecognitionSupported } from '../utils/speech';
import { detectLiveLocation } from '../services/api';

const QUICK_CITIES = [
  { name: 'Bhubaneswar', label: '🌊 Bhubaneswar' },
  { name: 'Cuttack', label: '🏛️ Cuttack' },
  { name: 'New Delhi', label: '🏛️ New Delhi' },
  { name: 'Mumbai', label: '🏙️ Mumbai' },
  { name: 'Bengaluru', label: '💻 Bengaluru' },
  { name: 'Puri', label: '🌴 Puri' },
  { name: 'Balasore', label: '🌊 Balasore' },
  { name: 'Kolkata', label: '🌉 Kolkata' },
  { name: 'London', label: '🇬🇧 London' },
  { name: 'Tokyo', label: '🇯🇵 Tokyo' }
];

export default function DashboardSearchBar({ onSearch, currentCity, currentLang = 'en' }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clean = query.trim();
    if (clean) {
      onSearch(clean);
      setQuery('');
    }
  };

  const handleVoiceSearch = () => {
    if (!isVoiceRecognitionSupported()) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startVoiceRecognition({
      lang: currentLang,
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript) {
          const clean = transcript.replace(/[.,?!]/g, '').trim();
          setQuery(clean);
          onSearch(clean);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false)
    });
  };

  const handleLiveLocation = async () => {
    setIsLocating(true);
    setLocationNotice({ type: 'info', text: '📡 Detecting live location (GPS / Network)...' });
    try {
      const liveCity = await detectLiveLocation({ allowIpFallback: true });
      if (liveCity) {
        setLocationNotice({ type: 'success', text: '📍 Live location detected! Loading realtime weather...' });
        onSearch(liveCity);
      } else {
        setLocationNotice({ type: 'error', text: 'Unable to detect location. Please type city name above.' });
      }
    } catch (err) {
      console.error('Location detection error:', err);
      setLocationNotice({ type: 'error', text: 'Location detection error. You can search directly.' });
    } finally {
      setIsLocating(false);
      setTimeout(() => {
        setLocationNotice(null);
      }, 4500);
    }
  };

  return (
    <div className="glass-card border border-cyan-500/30 bg-gradient-to-r from-slate-900/95 via-[#0c1527]/95 to-slate-900/95 p-4 sm:p-5 rounded-3xl shadow-xl shadow-cyan-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {locationNotice && (
        <div className={`mb-3 px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
          locationNotice.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' :
          locationNotice.type === 'error' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' :
          'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
        }`}>
          {isLocating && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />}
          <span>{locationNotice.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Main Search Input Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 relative flex items-center">
          <div className="relative w-full flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 rounded-2xl transition-all shadow-inner">
            <Search className="w-5 h-5 text-cyan-400/80 absolute left-4 pointer-events-none" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isListening
                  ? "🎙️ Listening... Speak city or district name"
                  : `Search any city, district, or PIN code (Current: ${currentCity || 'Bhubaneswar'})...`
              }
              className="w-full bg-transparent pl-12 pr-32 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-medium"
            />

            {/* In-bar Actions: Voice + Live GPS */}
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {isVoiceRecognitionSupported() && (
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search Location"
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={handleLiveLocation}
                disabled={isLocating}
                title="Detect Live GPS Location"
                className="p-2 bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /> : <Navigation className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all transform active:scale-95 cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Live GPS Quick Pill */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLiveLocation}
            disabled={isLocating}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <MapPin className="w-4 h-4 text-cyan-400" />}
            <span>GPS Auto-Detect</span>
          </button>
        </div>
      </div>

      {/* Quick City Filter Chips */}
      <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Cities:</span>
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {QUICK_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSearch(city.name)}
              className={`px-3 py-1 rounded-xl font-semibold text-xs whitespace-nowrap transition-all border cursor-pointer ${
                currentCity?.toLowerCase() === city.name.toLowerCase()
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
