import React, { useState } from 'react';
import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Zap, Laptop, Package } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, onInstallPrompt }) {
  const [downloadSuccess, setDownloadSuccess] = useState('');

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    try {
      const link = document.createElement('a');
      link.href = 'WeatherGPT.apk';
      link.download = 'WeatherGPT.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess('WeatherGPT.apk downloaded! Tap to install on your Android phone.');
      setTimeout(() => {
        setDownloadSuccess('');
      }, 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadHtmlApp = () => {
    try {
      const link = document.createElement('a');
      link.href = 'WeatherGPT.html';
      link.download = 'WeatherGPT-App.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess('WeatherGPT-App.html downloaded!');
      setTimeout(() => {
        setDownloadSuccess('');
      }, 4000);
    } catch (e) {
      console.error(e);
    }
    if (onInstallPrompt) {
      onInstallPrompt();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="text-center mt-2 mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Download WeatherGPT Mobile APK</h3>
          <p className="text-xs text-slate-400 mt-1">Install the native Android app package or download the offline browser version.</p>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="space-y-3 mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Native Android APK (`WeatherGPT.apk`)</p>
              <p className="text-[11px] text-slate-400">Direct install package compiled for Android mobile devices.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Laptop className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Laptop & Mobile Standalone App File</p>
              <p className="text-[11px] text-slate-400">Save to Downloads and launch in Chrome/Edge anytime offline.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleDownloadApk}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Download Android APK (`WeatherGPT.apk`)</span>
          </button>

          <button
            onClick={handleDownloadHtmlApp}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span>Download Offline Web App File (`.html`)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-transparent text-slate-500 hover:text-slate-300 font-medium text-xs rounded-xl transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
