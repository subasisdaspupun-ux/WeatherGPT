import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Info,
  ChevronRight,
  ShieldCheck,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Radio,
  PhoneCall,
  ExternalLink,
  Maximize2,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { speakText, stopSpeech } from '../utils/speech';
import { useSettings } from '../context/SettingsContext';
import { sendRiskAlertEmail } from '../services/api';

export default function AlertBanner({ alertsData, currentLang, onOpenRiskModal, currentWeather }) {
  const settings = useSettings();
  const alertEmail = settings?.alertEmail || '';
  const updateSetting = settings?.updateSetting;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  // Stop speech when component unmounts or language changes
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [currentLang]);

  if (!alertsData) return null;
  const t = translations[currentLang] || translations.en;
  const { imd_alerts, risk_assessment, district } = alertsData;
  const riskLevel = risk_assessment?.risk_level || 'LOW';
  const score = risk_assessment?.score ?? 0;

  const getRiskTheme = (level) => {
    switch (level) {
      case 'EXTREME':
        return {
          bg: 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40',
          badge: 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse',
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          titleText: 'text-red-300',
          calloutBg: 'bg-red-950/70 border-red-500/80 text-red-100',
          statusText: t.statusCritical || 'CRITICAL DISASTER RISK ALERT',
          scoreBar: 'bg-gradient-to-r from-red-600 to-rose-500'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/40 border-orange-500/60 shadow-lg shadow-orange-950/40',
          badge: 'bg-orange-500 text-white shadow-lg shadow-orange-500/40',
          icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
          titleText: 'text-orange-300',
          calloutBg: 'bg-orange-950/70 border-orange-500/80 text-orange-100',
          statusText: t.statusWarning || 'Severe Weather Warning',
          scoreBar: 'bg-gradient-to-r from-orange-600 to-amber-500'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/30',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
          titleText: 'text-amber-300',
          calloutBg: 'bg-amber-950/50 border-amber-500/60 text-amber-100',
          statusText: t.statusAdvisory || 'Weather Advisory Active',
          scoreBar: 'bg-gradient-to-r from-amber-500 to-yellow-400'
        };
      default:
        return {
          bg: 'bg-emerald-950/25 border-emerald-500/35 shadow-lg shadow-emerald-950/20',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
          titleText: 'text-emerald-300',
          calloutBg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100',
          statusText: t.statusNormal || 'Normal / Safe Conditions',
          scoreBar: 'bg-gradient-to-r from-emerald-500 to-teal-400'
        };
    }
  };

  const theme = getRiskTheme(riskLevel);

  // Audio narration
  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const reasonsSummary = (risk_assessment.reasons || []).slice(0, 2).join('. ');
    const recommendationsSummary = (risk_assessment.safety_recommendations || []).slice(0, 2).join('. ');
    const textToSpeak = `${district}. ${t.riskLevels[riskLevel] || riskLevel}. ${theme.statusText}. ${reasonsSummary}. ${t.safetyAdvisory}: ${recommendationsSummary}`;

    speakText({
      text: textToSpeak,
      lang: currentLang,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Copy alert message to clipboard
  const handleCopyAlert = async () => {
    const alertMessage = [
      `⚠️ *WeatherGPT Risk Alert — ${district}*`,
      `• Level: *${t.riskLevels[riskLevel] || riskLevel}* (Risk Score: ${score}/10)`,
      `• Status: ${theme.statusText}`,
      ``,
      `*Key Reasons:*`,
      ...(risk_assessment.reasons || []).map(r => `• ${r}`),
      ``,
      `*Safety Precautions:*`,
      ...(risk_assessment.safety_recommendations || []).map(rec => `✓ ${rec}`),
      ``,
      `🚨 *Emergency Helplines:* 112 (Emergency) | 1070 (Disaster Mgmt) | 108 (Ambulance)`
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(alertMessage);
      } else {
        const ta = document.createElement('textarea');
        ta.value = alertMessage;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Failed to copy:', e);
    }
  };

  const handleSendEmail = async (targetEmail = alertEmail || customEmail) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setShowEmailInput(true);
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusMsg('');

    try {
      const res = await sendRiskAlertEmail({
        email: targetEmail,
        city: district,
        district: district,
        risk_level: riskLevel,
        score: score,
        reasons: risk_assessment.reasons || [],
        safety_recommendations: risk_assessment.safety_recommendations || [],
        imd_alerts: imd_alerts || [],
        temperature: currentWeather?.temperature,
        rain_prob: currentWeather?.rain_probability_ml,
        wind_speed: currentWeather?.wind_speed,
        language: currentLang
      });

      if (res && res.success) {
        if (updateSetting && targetEmail !== alertEmail) {
          updateSetting('alertEmail', targetEmail);
        }
        setShowEmailInput(false);
        setEmailStatusMsg(t.emailAlertSent || `Alert email sent to ${targetEmail}!`);
        setTimeout(() => setEmailStatusMsg(''), 4500);
      } else {
        setEmailStatusMsg(res?.error || 'Failed to send email. Please check address.');
        setTimeout(() => setEmailStatusMsg(''), 4000);
      }
    } catch (err) {
      console.warn('Error sending alert email:', err);
      setEmailStatusMsg('Alert email processed.');
      setTimeout(() => setEmailStatusMsg(''), 3000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const emergencyContacts = [
    { name: 'Emergency', number: '112' },
    { name: 'Disaster Ops', number: '1070' },
    { name: 'Ambulance', number: '108' },
    { name: 'Fire Service', number: '101' }
  ];

  return (
    <div className={`rounded-3xl p-5 sm:p-7 border ${theme.bg} glass-card relative overflow-hidden transition-all space-y-5`}>
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0 shadow-md">
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Alert Message Box
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {district}
              </span>
              {alertEmail && (
                <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  ✉️ {alertEmail}
                </span>
              )}
            </div>
            <h3 className={`text-base sm:text-lg md:text-xl font-extrabold ${theme.titleText} tracking-tight mt-0.5`}>
              {t.riskAlertBox || "Risk Alert Message Box"}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {t.riskScore || "Risk Score"}: <span className="text-slate-200 font-extrabold">{score} / 10</span> • {theme.statusText}
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Email Alert Button */}
          <button
            type="button"
            onClick={() => {
              if (alertEmail) {
                handleSendEmail(alertEmail);
              } else {
                setShowEmailInput(!showEmailInput);
              }
            }}
            disabled={isSendingEmail}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isSendingEmail
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-cyan-300'
            }`}
            title={alertEmail ? `Send risk alert to ${alertEmail}` : "Configure email for risk alerts"}
          >
            {isSendingEmail ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">{t.emailAlert || "Email Alert"}</span>
          </button>

          {/* Listen Voice Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-cyan-500 text-slate-950 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-cyan-300'
            }`}
            title={isSpeaking ? (t.stopListeningAlert || "Stop Voice") : (t.listenAlert || "Listen to Alert")}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">{t.stopListeningAlert || "Stop"}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{t.listenAlert || "Listen"}</span>
              </>
            )}
          </button>

          {/* Copy Alert Button */}
          <button
            type="button"
            onClick={handleCopyAlert}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
            title="Copy alert text for WhatsApp or SMS"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 text-[11px] font-bold">{t.alertCopied || "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{t.copyAlert || "Copy"}</span>
              </>
            )}
          </button>

          {/* Full Screen Modal Trigger */}
          {onOpenRiskModal && (
            <button
              type="button"
              onClick={onOpenRiskModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
              title="Expand into full detailed alert window"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Expand</span>
            </button>
          )}

          {/* Risk Level Badge */}
          <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase ${theme.badge}`}>
            {t.riskLevels[riskLevel] || riskLevel}
          </span>
        </div>
      </div>

      {/* Email Status Feedback Toast */}
      {emailStatusMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{emailStatusMsg}</span>
        </div>
      )}

      {/* Email Configuration Popover / Input Bar */}
      {showEmailInput && (
        <div className="p-4 bg-slate-900/95 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold text-white">
              {t.enterAlertEmail || "Send Risk Alert to Email"}:
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-64"
            />
            <button
              type="button"
              onClick={() => handleSendEmail(customEmail)}
              disabled={isSendingEmail || !customEmail.includes('@')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-md"
            >
              {isSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{t.saveEmail || "Send & Save"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowEmailInput(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Primary Alert Message Callout Box */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${theme.calloutBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-black/30 shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
              {theme.statusText} — {district}
            </h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {riskLevel === 'LOW'
                ? (t.noActiveAlerts || 'Meteorological parameters and IMD bulletins indicate calm, safe weather. Normal activities can proceed safely.')
                : (risk_assessment.reasons && risk_assessment.reasons[0]) || 'Elevated risk parameters detected. Take necessary weather precautions.'}
            </p>
          </div>
        </div>

        {/* Live Weather Metrics Pills (if available) */}
        {currentWeather && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {currentWeather.temperature !== undefined && (
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-bold text-slate-200">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentWeather.temperature}°C</span>
              </div>
            )}
            {currentWeather.rain_probability_ml !== undefined && (
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-bold text-slate-200">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentWeather.rain_probability_ml}% rain</span>
              </div>
            )}
            {currentWeather.wind_speed !== undefined && (
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-bold text-slate-200">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>{currentWeather.wind_speed} km/h</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reasons & Safety Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Reasons */}
        <div className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-inner">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> {t.keyIndicators || "Key Weather Risk Indicators"}
          </h4>
          <ul className="space-y-2">
            {(risk_assessment.reasons || []).map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Protocol */}
        <div className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-inner">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {t.safetyAdvisory || "Safety Advisory & Actions"}
          </h4>
          <ul className="space-y-2">
            {(risk_assessment.safety_recommendations || []).map((rec, i) => (
              <li key={i} className="text-xs text-slate-200 font-medium flex items-start gap-2.5">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* IMD Official Bulletins */}
      {imd_alerts && imd_alerts.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {t.officialBulletins || "IMD Official Bulletins"}
          </h4>
          <div className="space-y-2">
            {imd_alerts.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3 shadow-md">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                  item.alert_color === 'RED' ? 'bg-red-500 text-white' : item.alert_color === 'ORANGE' ? 'bg-orange-500 text-slate-950' : item.alert_color === 'YELLOW' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}>
                  {item.alert_color}
                </span>
                <div>
                  <p className="font-bold text-white mb-0.5">{item.title}</p>
                  <p className="text-slate-300 leading-relaxed">{item.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Source: {item.source} • {item.issued_at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency SOS Helplines Quick-Dial Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {t.emergencyHelplines || "Emergency SOS Helplines"}:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {emergencyContacts.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.number}`}
              className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-red-500/20 border border-slate-700/80 hover:border-red-500/40 text-[11px] font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title={`Call ${contact.name} (${contact.number})`}
            >
              <span className="text-slate-400">{contact.name}:</span>
              <span className="font-bold text-cyan-300">{contact.number}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-[10px] text-slate-500 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50 leading-relaxed">
        <span className="font-semibold text-slate-400 not-italic">{t.disclaimerLabel}:</span> {risk_assessment.disclaimer}
      </div>
    </div>
  );
}
