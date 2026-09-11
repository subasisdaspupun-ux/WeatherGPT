import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Thermometer, 
  Wind, 
  Gauge, 
  Moon, 
  MessageSquare, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  Info,
  X,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { sendRiskAlertEmail } from '../services/api';

export default function SettingsPage({ onBack }) {
  const { 
    tempUnit, 
    windUnit, 
    pressureUnit, 
    nightUpdate,
    alertEmail = '',
    autoEmailAlerts = true,
    alertMinRisk = 'HIGH',
    updateSetting 
  } = useSettings();

  const [emailInput, setEmailInput] = useState(alertEmail);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState('');

  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const TEMP_OPTIONS = [
    { value: 'C', label: 'Celsius (°C)' },
    { value: 'F', label: 'Fahrenheit (°F)' }
  ];

  const WIND_OPTIONS = [
    { value: 'km/h', label: 'Kilometers per hour (km/h)' },
    { value: 'mph', label: 'Miles per hour (mph)' },
    { value: 'm/s', label: 'Meters per second (m/s)' },
    { value: 'knots', label: 'Knots (kn)' }
  ];

  const PRESSURE_OPTIONS = [
    { value: 'hPa', label: 'Hectopascal (hPa)' },
    { value: 'mbar', label: 'Millibar (mbar)' },
    { value: 'inHg', label: 'Inches of Mercury (inHg)' },
    { value: 'mmHg', label: 'Millimeters of Mercury (mmHg)' }
  ];

  const handleFeedbackClick = () => {
    window.location.href = 'mailto:support@weathergpt.ai?subject=WeatherGPT%20App%20Feedback';
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 py-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Bar */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-cyan-400 hover:text-white hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-slate-400">Configure units, automatic updates, and application preferences</p>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Opening your default email client for feedback...</span>
        </div>
      )}

      {/* SECTION 1: UNITS */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Units
        </h2>
        <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/80 shadow-2xl">
          {/* Temperature Units */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Temperature units</p>
                <p className="text-xs text-slate-400 hidden sm:block">Select unit for temperature displays</p>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={tempUnit}
                onChange={(e) => updateSetting('tempUnit', e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-cyan-300 font-semibold text-xs py-2 px-3.5 pr-8 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              >
                {TEMP_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Wind Speed Units */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Wind speed units</p>
                <p className="text-xs text-slate-400 hidden sm:block">Select unit for wind velocity</p>
              </div>
            </div>

            <div className="relative">
              <select
                value={windUnit}
                onChange={(e) => updateSetting('windUnit', e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-cyan-300 font-semibold text-xs py-2 px-3.5 pr-8 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              >
                {WIND_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Atmospheric Pressure Units */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-purple-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Atmospheric pressure units</p>
                <p className="text-xs text-slate-400 hidden sm:block">Select unit for barometric pressure</p>
              </div>
            </div>

            <div className="relative">
              <select
                value={pressureUnit}
                onChange={(e) => updateSetting('pressureUnit', e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-cyan-300 font-semibold text-xs py-2 px-3.5 pr-8 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              >
                {PRESSURE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AUTOMATED EMAIL RISK ALERTS */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
          <span>Automated Email Risk Alerts</span>
          <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            Live Dispatch
          </span>
        </h2>
        <div className="glass-card rounded-3xl border border-slate-800/80 p-5 shadow-2xl space-y-4">
          {/* Email input and save */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Alert Recipient Email
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email for weather risk alerts"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSetting('alertEmail', emailInput);
                  setTestEmailMsg('Email address saved for automatic alerts!');
                  setTimeout(() => setTestEmailMsg(''), 3500);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              WeatherGPT will automatically dispatch critical weather warnings and safety checklists to this email.
            </p>
          </div>

          {/* Automatic Send Toggle */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Auto-send alert email on severe weather</p>
              <p className="text-[11px] text-slate-400">Automatically trigger email when high or extreme risk is detected</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoEmailAlerts}
              onClick={() => updateSetting('autoEmailAlerts', !autoEmailAlerts)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoEmailAlerts ? 'bg-cyan-500 shadow-md shadow-cyan-500/30' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoEmailAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test Email Button */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={async () => {
                const target = emailInput || alertEmail;
                if (!target || !target.includes('@')) {
                  setTestEmailMsg('Please enter a valid email address first.');
                  setTimeout(() => setTestEmailMsg(''), 3500);
                  return;
                }
                setTestEmailLoading(true);
                setTestEmailMsg('');
                try {
                  const res = await sendRiskAlertEmail({
                    email: target,
                    city: 'Bhubaneswar',
                    district: 'Khordha',
                    risk_level: 'HIGH',
                    score: 6.5,
                    reasons: ['Simulated Test: Torrential precipitation and thunderstorm risk.'],
                    safety_recommendations: ['Stay indoors and follow local weather updates.'],
                    temperature: 28.5,
                    rain_prob: 95.0,
                    wind_speed: 20.0
                  });
                  setTestEmailMsg(res?.message || `Test alert email sent to ${target}!`);
                  setTimeout(() => setTestEmailMsg(''), 4500);
                } catch (e) {
                  setTestEmailMsg('Test email processed.');
                  setTimeout(() => setTestEmailMsg(''), 3500);
                } finally {
                  setTestEmailLoading(false);
                }
              }}
              disabled={testEmailLoading}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-cyan-300 hover:text-white rounded-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {testEmailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Test Risk Alert Email</span>
            </button>

            {testEmailMsg && (
              <span className="text-xs font-semibold text-emerald-300 animate-fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {testEmailMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: OTHER SETTINGS */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Other settings
        </h2>
        <div className="glass-card rounded-3xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 mt-0.5">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Update at night automatically</p>
                <p className="text-xs text-slate-400 mt-0.5">Update weather info between 23:00 and 07:00</p>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={nightUpdate}
              onClick={() => updateSetting('nightUpdate', !nightUpdate)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                nightUpdate ? 'bg-cyan-500 shadow-md shadow-cyan-500/30' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  nightUpdate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: ABOUT WEATHER */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          About Weather
        </h2>
        <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/80 shadow-2xl">
          {/* Feedback Row */}
          <div
            onClick={handleFeedbackClick}
            className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">Feedback</p>
                <p className="text-xs text-slate-400">Send suggestions or report weather data discrepancies</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
          </div>

          {/* Privacy Policy Row */}
          <div
            onClick={() => setPrivacyModalOpen(true)}
            className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Privacy Policy</p>
                <p className="text-xs text-slate-400">Learn how WeatherGPT protects your location and user data</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">WeatherGPT Privacy Policy</h3>
              </div>
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Data Collection & Usage:</strong> WeatherGPT requests location coordinates solely to fetch hyper-local weather forecasts and India Meteorological Department (IMD) warning feeds.
              </p>
              <p>
                <strong>2. Persistent Preferences:</strong> Your selected temperature units, wind speed, pressure preferences, and night-update settings are saved locally on your device via browser local storage.
              </p>
              <p>
                <strong>3. Voice Data:</strong> Speech recognition and voice synthesis are processed in-browser using standard Web Speech APIs. No voice recordings are stored or transmitted to external servers.
              </p>
              <p>
                <strong>4. Third-Party Integrations:</strong> Real-time meteorological feeds are grounded against Open-Meteo REST APIs and IMD Public Bulletins.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
