import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Sparkles,
  Bot,
  Sun,
  CloudRain,
  CloudLightning,
  Cloud,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { translations } from '../i18n/translations';
import {
  startVoiceRecognition,
  speakText,
  stopSpeech,
  cleanVoiceLocation
} from '../utils/speech';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
];

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  currentCity,
  currentLang,
  onLangChange,
  currentWeather
}) {
  const t = translations[currentLang] || translations.en;

  const [state, setState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Stop any active speech on modal unmount or close
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch (e) {}
      }
    };
  }, [recognitionInstance]);

  // When modal opens, introduce voice assistant if idle
  useEffect(() => {
    if (isOpen && state === 'idle' && !aiReply) {
      const welcomeMsg = currentLang === 'hi'
        ? `${currentCity} के लिए वॉयस सहायक तैयार है। माइक पर टैप करें और बोलें।`
        : currentLang === 'or'
        ? `${currentCity} ପାଇଁ ଭଏସ୍ ସହାୟକ ପ୍ରସ୍ତୁତ। ମାଇକ୍ ଛୁଇଁ କୁହନ୍ତୁ।`
        : currentLang === 'bn'
        ? `${currentCity}-এর ভয়েস সহায়ক প্রস্তুত। কথা বলতে মাইকে চাপ দিন।`
        : `Voice Assistant ready for ${currentCity}. Tap the microphone and speak your question.`;
      
      setAiReply(welcomeMsg);
    }
  }, [isOpen, currentCity, currentLang]);

  const handleStartListening = () => {
    stopSpeech();
    setState('listening');
    setTranscript('');

    const instance = startVoiceRecognition({
      lang: currentLang,
      onStart: () => {
        setState('listening');
      },
      onEnd: () => {
        // Will transition in onResult or if cancelled
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setState('idle');
      },
      onResult: (cleanedText, rawTranscript) => {
        const spoken = rawTranscript || cleanedText;
        if (spoken) {
          setTranscript(spoken);
          processVoiceQuery(spoken);
        } else {
          setState('idle');
        }
      }
    });

    setRecognitionInstance(instance);
  };

  const handleStopListening = () => {
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch (e) {}
    }
    setState('idle');
  };

  const processVoiceQuery = async (queryText) => {
    setState('thinking');
    try {
      const res = await sendChatMessage(queryText, currentCity, currentLang);
      const reply = res.reply || "I received your question and processed real weather data.";
      setAiReply(reply);
      setLastSpokenText(reply);

      // Auto-speak response out loud for rural/low-literacy users
      setState('speaking');
      speakText({
        text: reply,
        lang: currentLang,
        onStart: () => setState('speaking'),
        onEnd: () => setState('idle'),
        onError: () => setState('idle')
      });
    } catch (err) {
      console.error("Voice AI query error:", err);
      const errReply = "Unable to process weather request right now. Please tap the microphone to try again.";
      setAiReply(errReply);
      setState('idle');
    }
  };

  const handleReplayVoice = () => {
    if (!aiReply) return;
    stopSpeech();
    setState('speaking');
    speakText({
      text: aiReply,
      lang: currentLang,
      onStart: () => setState('speaking'),
      onEnd: () => setState('idle'),
      onError: () => setState('idle')
    });
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setState('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-card border border-slate-700/80 bg-[#0A0F1D]/95 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6 overflow-hidden">
        
        {/* Glow backdrop indicator based on state */}
        <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          state === 'listening' ? 'bg-red-500' : state === 'thinking' ? 'bg-cyan-500' : state === 'speaking' ? 'bg-blue-500' : 'bg-emerald-500'
        }`} />

        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Mic className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                {t.voiceCompanion}
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Voice In & Out
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {currentCity} • Designed for rural & voice accessibility
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              if (recognitionInstance) {
                try { recognitionInstance.stop(); } catch (e) {}
              }
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Quick Selector Pills */}
        <div className="w-full flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                stopSpeech();
                onLangChange(lang.code);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                currentLang === lang.code
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>

        {/* Central Giant Voice Button */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          {/* Ripple rings when listening */}
          {state === 'listening' && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-red-500/20 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-red-500/30 animate-pulse" />
            </>
          )}

          {/* Soundwave animation when speaking */}
          {state === 'speaking' && (
            <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/40 animate-spin-slow pointer-events-none" />
          )}

          <button
            onClick={state === 'listening' ? handleStopListening : handleStartListening}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
              state === 'listening'
                ? "bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/40 ring-4 ring-red-400/40 scale-105"
                : state === 'thinking'
                ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/40 animate-pulse"
                : state === 'speaking'
                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40 ring-4 ring-cyan-400/30"
                : "bg-gradient-to-tr from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/30 hover:scale-105"
            }`}
            title="Tap to Speak"
          >
            {state === 'listening' ? (
              <MicOff className="w-12 h-12 animate-pulse" />
            ) : state === 'speaking' ? (
              <Volume2 className="w-12 h-12 animate-bounce" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider mt-1">
              {state === 'listening' ? 'Stop' : state === 'thinking' ? 'Thinking' : state === 'speaking' ? 'Speaking' : 'Tap to Speak'}
            </span>
          </button>
        </div>

        {/* State Status Feedback Label */}
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-extrabold text-white flex items-center justify-center gap-2">
            {state === 'listening' && (
              <span className="text-red-400 animate-pulse flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                {t.voiceListeningPrompt}
              </span>
            )}
            {state === 'thinking' && (
              <span className="text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                {t.voiceThinking}
              </span>
            )}
            {state === 'speaking' && (
              <span className="text-blue-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-bounce" />
                {t.voiceSpeaking}
              </span>
            )}
            {state === 'idle' && (
              <span className="text-slate-300">
                {t.speakQuestion}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {t.ruralVoiceHelp}
          </p>
        </div>

        {/* Spoken Question Preview Box */}
        {transcript && (
          <div className="w-full bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-left">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
              You Asked:
            </span>
            <p className="text-xs sm:text-sm text-white font-medium italic">
              "{transcript}"
            </p>
          </div>
        )}

        {/* AI Answer & Voice Output Box */}
        {aiReply && (
          <div className="w-full bg-slate-900/80 border border-cyan-500/30 p-4 sm:p-5 rounded-2xl text-left space-y-3 shadow-lg shadow-cyan-500/5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>WeatherGPT Response</span>
              </div>
              <div className="flex items-center gap-2">
                {state === 'speaking' ? (
                  <button
                    onClick={handleStopSpeech}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-xs flex items-center gap-1"
                    title="Stop speaking"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReplayVoice}
                    className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs flex items-center gap-1"
                    title="Replay Voice"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Replay Voice</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
              {aiReply}
            </div>
          </div>
        )}

        {/* Action Buttons for Easy Voice Control */}
        <div className="w-full flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleStartListening}
            disabled={state === 'listening'}
            className="flex-1 max-w-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>{t.askAnother}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
