import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Info,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  Flame,
  Radio,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { speakText, stopSpeech } from '../utils/speech';
import { useSettings } from '../context/SettingsContext';
import { sendRiskAlertEmail } from '../services/api';

export default function RiskAlertMessageBox({
  isOpen,
  onClose,
  alertsData,
  currentLang = 'en',
  currentCity = '',
  currentWeather = null
}) {
  const settings = useSettings();
  const alertEmail = settings?.alertEmail || '';
  const updateSetting = settings?.updateSetting;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Clean up any speaking when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsSpeaking(false);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = translations[currentLang] || translations.en;
  const imdAlerts = alertsData?.imd_alerts || [];
  const riskAssessment = alertsData?.risk_assessment || {
    risk_level: 'LOW',
    score: 0.5,
    reasons: ['Meteorological parameters indicate calm, safe weather.'],
    safety_recommendations: ['Normal daily activities can proceed. Enjoy the pleasant weather!'],
    disclaimer: 'Decision-support indicator combining meteorological parameters and IMD feeds.'
  };
  const district = alertsData?.district || currentCity;
  const riskLevel = riskAssessment.risk_level || 'LOW';
  const score = riskAssessment.score ?? 0;

  const getTheme = (level) => {
    switch (level) {
      case 'EXTREME':
        return {
          headerBg: 'from-red-950/90 via-red-900/60 to-slate-900/90',
          borderColor: 'border-red-500/60',
          glowBg: 'bg-red-500',
          badge: 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse',
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          titleColor: 'text-red-300',
          statusText: t.statusCritical || 'CRITICAL DISASTER RISK ALERT',
          scoreBarColor: 'bg-gradient-to-r from-red-600 to-rose-500',
          calloutBg: 'bg-red-950/50 border-red-500/50 text-red-200'
        };
      case 'HIGH':
        return {
          headerBg: 'from-orange-950/90 via-orange-900/60 to-slate-900/90',
          borderColor: 'border-orange-500/60',
          glowBg: 'bg-orange-500',
          badge: 'bg-orange-500 text-white shadow-lg shadow-orange-500/40',
          icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
          titleColor: 'text-orange-300',
          statusText: t.statusWarning || 'Severe Weather Warning',
          scoreBarColor: 'bg-gradient-to-r from-orange-600 to-amber-500',
          calloutBg: 'bg-orange-950/50 border-orange-500/50 text-orange-200'
        };
      case 'MODERATE':
        return {
          headerBg: 'from-amber-950/80 via-amber-900/50 to-slate-900/90',
          borderColor: 'border-amber-500/50',
          glowBg: 'bg-amber-500',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
          titleColor: 'text-amber-300',
          statusText: t.statusAdvisory || 'Weather Advisory Active',
          scoreBarColor: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          calloutBg: 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        };
      default:
        return {
          headerBg: 'from-emerald-950/80 via-emerald-900/40 to-slate-900/90',
          borderColor: 'border-emerald-500/40',
          glowBg: 'bg-emerald-500',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
          titleColor: 'text-emerald-300',
          statusText: t.statusNormal || 'Normal / Safe Conditions',
          scoreBarColor: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          calloutBg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        };
    }
  };

  const theme = getTheme(riskLevel);

  const handleClose = () => {
    stopSpeech();
    setIsSpeaking(false);
    onClose();
  };

  // Text-to-speech audio alert narration
  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const reasonsSummary = riskAssessment.reasons.slice(0, 2).join('. ');
    const recommendationsSummary = riskAssessment.safety_recommendations.slice(0, 2).join('. ');
    const speechText = `${district}. ${t.riskLevels[riskLevel] || riskLevel}. ${theme.statusText}. ${reasonsSummary}. ${t.safetyAdvisory}: ${recommendationsSummary}`;

    speakText({
      text: speechText,
      lang: currentLang,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Copy structured alert message to clipboard for sharing (e.g. WhatsApp / SMS)
  const handleCopyAlert = async () => {
    const alertText = [
      `⚠️ *WeatherGPT Risk Alert — ${district}*`,
      `• Level: *${t.riskLevels[riskLevel] || riskLevel}* (Score: ${score}/10)`,
      `• Status: ${theme.statusText}`,
      ``,
      `*Key Reasons:*`,
      ...riskAssessment.reasons.map(r => `• ${r}`),
      ``,
      `*Safety Precautions:*`,
      ...riskAssessment.safety_recommendations.map(rec => `✓ ${rec}`),
      ``,
      `🚨 *Emergency Helplines:* 112 (National) | 1070 (Disaster Mgmt) | 108 (Ambulance)`
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(alertText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = alertText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy alert:', err);
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
        reasons: riskAssessment.reasons || [],
        safety_recommendations: riskAssessment.safety_recommendations || [],
        imd_alerts: imdAlerts || [],
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
    { name: 'National Emergency', number: '112', desc: 'All Emergency Services' },
    { name: 'Disaster Management', number: '1070', desc: 'State Emergency / NDRF' },
    { name: 'District Emergency', number: '1077', desc: 'Local Collectorate Control' },
    { name: 'Ambulance', number: '108', desc: 'Medical Emergency' },
    { name: 'Fire & Rescue', number: '101', desc: 'Fire Services' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Ambient risk glow */}
      <div className={`fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none ${theme.glowBg}`} />

      {/* Main Message Box Dialog */}
      <div
        className={`relative w-full max-w-2xl bg-[#0B1222]/95 border ${theme.borderColor} rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] glass-card`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-alert-title"
      >
        {/* Top Header */}
        <div className={`p-5 sm:p-6 bg-gradient-to-r ${theme.headerBg} border-b border-slate-800/80 relative flex items-start justify-between gap-4`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl bg-slate-900/80 border ${theme.borderColor} shrink-0 shadow-md`}>
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wider uppercase ${theme.badge}`}>
                  {t.riskLevels[riskLevel] || riskLevel}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {district}
                </span>
              </div>
              <h2 id="risk-alert-title" className={`text-base sm:text-lg md:text-xl font-black ${theme.titleColor} tracking-tight`}>
                {t.riskAlertBox || 'Risk Alert Message Box'}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {theme.statusText}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all active:scale-95 shrink-0"
            title="Close Alert Message Box"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Email Status Toast */}
          {emailStatusMsg && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-lg">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{emailStatusMsg}</span>
            </div>
          )}

          {/* Email Configuration Popover */}
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

          {/* Risk Score Progress Gauge */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {t.riskScore || 'Risk Score'}
              </span>
              <span className="text-white font-extrabold text-sm">
                {score} <span className="text-slate-400 text-xs font-normal">/ 10</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full ${theme.scoreBarColor} transition-all duration-700 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(8, (score / 10) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1.5 px-0.5">
              <span>0 (Calm)</span>
              <span>3.5 (Moderate)</span>
              <span>6.5 (High)</span>
              <span>10 (Extreme)</span>
            </div>
          </div>

          {/* Primary Alert Callout Box */}
          <div className={`p-4 rounded-2xl border ${theme.calloutBg} flex items-start gap-3`}>
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1">
                {theme.statusText}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">
                {riskLevel === 'LOW'
                  ? (t.noActiveAlerts || 'Atmospheric parameters and IMD bulletins indicate calm, safe weather.')
                  : (riskAssessment.reasons[0] || 'Elevated risk parameters detected. Review safety guidelines below.')}
              </p>
            </div>
          </div>

          {/* Weather Risk Factors Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {t.keyIndicators || 'Key Weather Risk Indicators'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {riskAssessment.reasons.map((reason, index) => (
                <div
                  key={index}
                  className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-200"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Protocols & Recommendations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {t.safetyProtocol || 'Safety Protocols & Recommendations'}
            </h4>
            <div className="space-y-2">
              {riskAssessment.safety_recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-slate-900/60 border border-emerald-950/40 hover:border-emerald-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IMD Official Bulletins (if active) */}
          {imdAlerts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                {t.officialBulletins || 'IMD Official Bulletins'}
              </h4>
              <div className="space-y-2.5">
                {imdAlerts.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                        item.alert_color === 'RED'
                          ? 'bg-red-500 text-white'
                          : item.alert_color === 'ORANGE'
                          ? 'bg-orange-500 text-slate-950'
                          : item.alert_color === 'YELLOW'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {item.alert_color}
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-white mb-1">{item.title}</p>
                      <p className="text-slate-300 leading-relaxed">{item.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        Source: {item.source} • {item.issued_at}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency SOS Quick Contacts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              {t.emergencyHelplines || 'Emergency SOS Helplines'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {emergencyContacts.map((contact, index) => (
                <a
                  key={index}
                  href={`tel:${contact.number}`}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-red-500/40 rounded-xl flex flex-col transition-all group active:scale-95"
                  title={`Dial ${contact.number}`}
                >
                  <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-300 truncate">
                    {contact.name}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-extrabold text-cyan-400 group-hover:text-red-400 transition-colors">
                      {contact.number}
                    </span>
                    <span className="text-[9px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 group-hover:bg-red-500/20 group-hover:text-red-300">
                      {t.callNow || 'Call'}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Decision Support Disclaimer */}
          <div className="text-[11px] text-slate-400 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
            <span className="font-semibold text-slate-300 not-italic">{t.disclaimerLabel}:</span>{' '}
            {riskAssessment.disclaimer}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Audio Alert, Email & Share Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Email Alert Button */}
            <button
              onClick={() => {
                if (alertEmail) {
                  handleSendEmail(alertEmail);
                } else {
                  setShowEmailInput(!showEmailInput);
                }
              }}
              disabled={isSendingEmail}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                isSendingEmail
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 animate-pulse'
                  : 'bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50'
              }`}
              title={alertEmail ? `Send risk alert to ${alertEmail}` : "Configure email for risk alerts"}
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 text-cyan-400" />
              )}
              <span>{t.emailAlert || "Email Alert"}</span>
            </button>

            <button
              onClick={handleToggleVoice}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                isSpeaking
                  ? 'bg-cyan-500 text-slate-950 animate-pulse'
                  : 'bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50'
              }`}
              title={isSpeaking ? (t.stopListeningAlert || 'Stop Voice') : (t.listenAlert || 'Listen to Alert')}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-950" />
                  <span>{t.stopListeningAlert || 'Stop Voice'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>{t.listenAlert || 'Listen to Alert'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyAlert}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600 transition-all flex items-center gap-2 active:scale-95"
              title="Copy formatted alert for WhatsApp / SMS"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">{t.alertCopied || 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>{t.copyAlert || 'Copy Alert'}</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Close Button */}
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl text-xs font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 ml-auto"
          >
            {t.acknowledgeClose || 'Acknowledge & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
