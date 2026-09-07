import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, X, Sparkles, ShieldCheck, User, RefreshCw, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { translations } from '../i18n/translations';
import { speakText, stopSpeech, startVoiceRecognition } from '../utils/speech';

const QUICK_PROMPTS = [
  "Will it rain in Bhubaneswar tomorrow?",
  "Is there any cyclone or flood alert for Khordha?",
  "What is the temperature and humidity right now?",
  "ଭୁବନେଶ୍ୱରରେ ଆଜି ବର୍ଷା ହେବ କି?",
  "क्या कल बारिश होने की संभावना है?"
];

export default function ChatBox({ isOpen, onClose, currentCity, currentLang }) {
  const t = translations[currentLang] || translations.en;
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am **WeatherGPT** AI Assistant. Ask me anything about weather, rainfall predictions, or safety guidelines for **${currentCity}**. All answers are grounded strictly in real weather data.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleSpeakMessage = (idx, text) => {
    if (currentlySpeakingId === idx) {
      stopSpeech();
      setCurrentlySpeakingId(null);
      return;
    }

    stopSpeech();
    setCurrentlySpeakingId(idx);
    speakText({
      text,
      lang: currentLang,
      onStart: () => setCurrentlySpeakingId(idx),
      onEnd: () => setCurrentlySpeakingId(null),
      onError: () => setCurrentlySpeakingId(null)
    });
  };

  const handleSend = async (textToSend) => {
    const msg = textToSend || inputMsg;
    if (!msg.trim() || loading) return;

    const userEntry = {
      sender: 'user',
      text: msg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userEntry]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await sendChatMessage(msg, currentCity, currentLang);
      const aiEntry = {
        sender: 'ai',
        text: res.reply,
        riskLevel: res.risk_level,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiEntry]);

      // If auto-speak is enabled, speak out the reply
      if (autoSpeak && res.reply) {
        speakText({
          text: res.reply,
          lang: currentLang
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I am having trouble connecting to the weather service right now. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Input (Web Speech API) with auto-send
  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    startVoiceRecognition({
      lang: currentLang,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
      onResult: (cleaned, raw) => {
        setIsListening(false);
        const spoken = raw || cleaned;
        if (spoken) {
          setInputMsg(spoken);
          // Directly send spoken message for seamless hands-free voice experience
          handleSend(spoken);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-[#0A0F1D]/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              {t.aiAssistantTitle}
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Location: {currentCity}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Auto Speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? "Auto Voice: ON (AI speaks replies)" : "Auto Voice: OFF"}
            className={`p-2 rounded-xl border transition-all ${
              autoSpeak
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}

            <div
              className={`max-w-[84%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg shadow-cyan-500/20'
                  : 'glass-card border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/40 text-[10px]">
                {m.sender === 'ai' ? (
                  <button
                    onClick={() => handleSpeakMessage(idx, m.text)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
                    title="Listen to this answer"
                  >
                    {currentlySpeakingId === idx ? (
                      <>
                        <VolumeX className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 font-semibold">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                ) : <span />}

                <span className="opacity-60">{m.timestamp}</span>
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-blue-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <div className="glass-card border border-slate-800 p-3 rounded-2xl text-xs text-cyan-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Analyzing weather data & fetching AI answer...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] whitespace-nowrap bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700/60 transition-all shrink-0"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleVoice}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening ? 'bg-red-500/30 text-red-400 border-red-500/50 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title={isListening ? "Listening... speak question" : "Speak question"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={isListening ? "🎙️ Listening... speak question" : t.aiPlaceholder}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />

        <button
          type="submit"
          disabled={!inputMsg.trim() || loading}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold p-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
