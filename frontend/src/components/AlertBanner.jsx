import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Info, ChevronRight, ShieldCheck } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function AlertBanner({ alertsData, currentLang }) {
  if (!alertsData) return null;
  const t = translations[currentLang] || translations.en;
  const { imd_alerts, risk_assessment, district } = alertsData;

  const getRiskTheme = (level) => {
    switch (level) {
      case 'EXTREME':
        return {
          bg: 'bg-red-950/40 border-red-500/50',
          badge: 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse',
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          titleText: 'text-red-300'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/40 border-orange-500/50',
          badge: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
          icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
          titleText: 'text-orange-300'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/40 border-amber-500/40',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
          titleText: 'text-amber-300'
        };
      default:
        return {
          bg: 'bg-emerald-950/30 border-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
          titleText: 'text-emerald-300'
        };
    }
  };

  const theme = getRiskTheme(risk_assessment.risk_level);

  return (
    <div className={`rounded-3xl p-6 border ${theme.bg} glass-card relative overflow-hidden`}>
      {/* Risk Assessment Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {theme.icon}
          <div>
            <h3 className={`text-lg font-extrabold ${theme.titleText} tracking-tight`}>
              {t.disasterRiskTitle} — {district}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Risk Score: <span className="text-slate-200 font-bold">{risk_assessment.score} / 10</span>
            </p>
          </div>
        </div>

        <span className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase ${theme.badge}`}>
          {t.riskLevels[risk_assessment.risk_level] || risk_assessment.risk_level}
        </span>
      </div>

      {/* Reasons & Safety Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
        {/* Reasons */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Key Weather Indicators
          </h4>
          <ul className="space-y-1.5">
            {risk_assessment.reasons.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Protocol */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {t.safetyAdvisory}
          </h4>
          <ul className="space-y-1.5">
            {risk_assessment.safety_recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-200 font-medium flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* IMD Official Bulletins */}
      {imd_alerts && imd_alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            IMD Official Bulletin
          </h4>
          {imd_alerts.map((item, idx) => (
            <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-slate-950 uppercase shrink-0 ${
                item.alert_color === 'RED' ? 'bg-red-500' : item.alert_color === 'ORANGE' ? 'bg-orange-500' : item.alert_color === 'YELLOW' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}>
                {item.alert_color}
              </span>
              <div>
                <p className="font-bold text-white mb-0.5">{item.title}</p>
                <p className="text-slate-300">{item.description}</p>
                <p className="text-[10px] text-slate-500 mt-1">Source: {item.source} • {item.issued_at}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 text-[10px] text-slate-500 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
        <span className="font-semibold text-slate-400">{t.disclaimerLabel}:</span> {risk_assessment.disclaimer}
      </div>
    </div>
  );
}
