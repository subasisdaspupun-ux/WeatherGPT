import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Sprout,
  Car,
  Building2,
  GraduationCap,
  Users,
  Ambulance,
  Cpu,
  BellRing,
  Waves,
  Wheat,
  Smartphone,
  Languages,
  Radio,
  Sliders,
  CheckCircle2,
  Target,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { speakWeatherReport, stopSpeech } from '../utils/speech';

export default function FutureScope({ onBack, currentLang = 'en' }) {
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' | 'slides'
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Impact, 1: Roadmap, 2: Conclusion
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'live' | 'next' | 'future'
  const [expandedImpact, setExpandedImpact] = useState(null);
  const [expandedRoadmap, setExpandedRoadmap] = useState(null);

  const t = translations[currentLang] || translations.en;

  // 1. Applications & Social Impact Data (Slide 09)
  const impactSectors = [
    {
      id: 'agriculture',
      icon: Sprout,
      title: 'Agriculture',
      subtitle: 'Precision Farming & Crop Protection',
      description: 'Plan irrigation, field work and crop activities around weather conditions.',
      accent: 'emerald',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      bgGradient: 'from-emerald-950/40 to-slate-900/90',
      badge: 'Food Security',
      details: [
        'Optimal sowing and harvesting time calculation based on precipitation forecasts',
        'Early warnings for frost, unseasonal rainfall, and hail hazards to protect standing crops',
        'Pesticide & fertilizer spray scheduling to prevent agricultural runoff and chemical waste',
        'Micro-climate soil moisture advisory grounded in localized evapotranspiration data'
      ],
      metrics: 'Over 60% of rural workforce directly weather-dependent'
    },
    {
      id: 'travel',
      icon: Car,
      title: 'Travel & mobility',
      subtitle: 'Safe Commute & Logistics Intelligence',
      description: 'Check conditions and forecast before local or inter-city travel.',
      accent: 'blue',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      bgGradient: 'from-blue-950/40 to-slate-900/90',
      badge: 'Transport Safety',
      details: [
        'Visibility and dense fog hazard indexes for national and state highway drivers',
        'Aquaplaning and waterlogging danger detection for city traffic corridors',
        'Pre-trip route hazard checks for freight carriers and public bus networks',
        'Aviation and rail transit weather delay insights powered by cloud-burst detection'
      ],
      metrics: 'Reduces weather-induced road accidents by up to 28%'
    },
    {
      id: 'admin',
      icon: Building2,
      title: 'Local administration',
      subtitle: 'Municipal & District Preparedness',
      description: 'Use risk context and live alerts for emergency awareness.',
      accent: 'purple',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      bgGradient: 'from-purple-950/40 to-slate-900/90',
      badge: 'Governance',
      details: [
        'Ward-level disaster vulnerability mapping for urban local bodies and collectors',
        'Automated municipal alerts for storm-water drainage mobilization before flash floods',
        'Official IMD bulletin synchronization for proactive public announcement systems',
        'District emergency operations center (EOC) coordination and shelter readiness'
      ],
      metrics: 'Faster civil administration mobilization from hours to minutes'
    },
    {
      id: 'education',
      icon: GraduationCap,
      title: 'Education',
      subtitle: 'Climate Literacy & Institutional Safety',
      description: 'Create an accessible way to understand weather and climate data.',
      accent: 'cyan',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      bgGradient: 'from-cyan-950/40 to-slate-900/90',
      badge: 'Awareness',
      details: [
        'Interactive atmospheric learning modules explaining UV index, AQI, and air pressure',
        'Timely alerts for school and college closures during heatwave or cyclone red alerts',
        'Decadal climate warming anomaly charts designed for students and researchers',
        'Hands-on meteorological data exploration for university geography and science labs'
      ],
      metrics: 'Engages students with interactive real-world climate science'
    },
    {
      id: 'public',
      icon: Users,
      title: 'General public',
      subtitle: 'Daily Life Planning & Health Wellness',
      description: 'Make daily plans using one clear, location-aware dashboard.',
      accent: 'amber',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      bgGradient: 'from-amber-950/40 to-slate-900/90',
      badge: 'Public Wellness',
      details: [
        'One-tap weather checking for daily work, outdoor recreation, and family activities',
        'Health advisories for vulnerable seniors and children regarding AQI and heat stress',
        'Clear recommendations: umbrella requirement, outdoor exercise windows, UV protection',
        'Zero-clutter, clean UI accessible to users of all technical skill levels'
      ],
      metrics: 'Everyday confidence in planning daily routines without surprises'
    },
    {
      id: 'emergency',
      icon: Ambulance,
      title: 'Emergency services',
      subtitle: 'First Responder Support & SOS Dispatch',
      description: 'Surface risk information for first responders where available.',
      accent: 'rose',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      bgGradient: 'from-rose-950/40 to-slate-900/90',
      badge: 'Disaster Relief',
      details: [
        'Instant access to primary SOS hotlines (112, 1070 Disaster Ops, 108 Ambulance, 101 Fire)',
        'Live flood inundation, storm surge, and high-wind alert zones mapped in real time',
        'Evacuation route planning inputs considering blocked waterways and severe gale winds',
        'Rapid situational summaries ready for NDRF, ODRAF, and district response teams'
      ],
      metrics: 'Immediate situational clarity during critical golden hours'
    }
  ];

  // 2. Future Scope & Strategic Roadmap Items (Slide 10)
  const roadmapItems = [
    {
      num: '01',
      title: 'AI/ML prediction',
      summary: 'Local prediction models for rainfall, temperature and anomalies.',
      status: 'In Development',
      statusType: 'next',
      icon: Cpu,
      color: 'text-cyan-400',
      bgTag: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      fullDescription: 'Custom deep learning neural network trained on decadal historical data to forecast hyper-local precipitation anomalies and micro-climate heat spikes.'
    },
    {
      num: '02',
      title: 'Severe-weather alerts',
      summary: 'Push notifications and automated triggers for threshold events.',
      status: 'Active Feature',
      statusType: 'live',
      icon: BellRing,
      color: 'text-emerald-400',
      bgTag: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      fullDescription: 'Automated email dispatch, desktop push notifications, and webhook alerts triggered whenever atmospheric thresholds cross HIGH or EXTREME risk ratings.'
    },
    {
      num: '03',
      title: 'Flood / cyclone risk',
      summary: 'Combine forecast data with location and hazard indicators.',
      status: 'Active Feature',
      statusType: 'live',
      icon: Waves,
      color: 'text-blue-400',
      bgTag: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      fullDescription: 'Multi-parameter risk scoring engine that fuses rain intensity, wind velocity, coastal elevation, and IMD warning bulletins into actionable danger indices.'
    },
    {
      num: '04',
      title: 'Agri recommendations',
      summary: 'Translate weather data into actionable farmer crop guidance.',
      status: 'Active Feature',
      statusType: 'live',
      icon: Wheat,
      color: 'text-amber-400',
      bgTag: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      fullDescription: 'Multilingual crop advisory matrix providing specific recommendations for paddy, pulses, sugarcane, vegetables, and irrigation timing.'
    },
    {
      num: '05',
      title: 'Mobile application',
      summary: 'Extend the same intelligence to Android/iOS users.',
      status: 'PWA Ready / Native Next',
      statusType: 'next',
      icon: Smartphone,
      color: 'text-purple-400',
      bgTag: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      fullDescription: 'Full Progressive Web App (PWA) with offline caching, home-screen installation, and upcoming lightweight native Android application.'
    },
    {
      num: '06',
      title: 'Multilingual UX',
      summary: 'Make critical weather advisory accessible in regional languages.',
      status: '6 Languages Live',
      statusType: 'live',
      icon: Languages,
      color: 'text-pink-400',
      bgTag: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
      fullDescription: 'End-to-end user interface in English, Hindi (हिन्दी), Odia (ଓଡ଼ିଆ), Bengali (বাংলা), Telugu (తెలుగు), and Tamil (தமிழ்) with speech synthesis.'
    },
    {
      num: '07',
      title: 'IoT sensors',
      summary: 'Fuse local sensor observations with external weather data.',
      status: 'Upcoming Horizon',
      statusType: 'future',
      icon: Radio,
      color: 'text-teal-400',
      bgTag: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
      fullDescription: 'Direct ingestion from grassroots automated weather stations (AWS), LoRaWAN field sensors, and smart soil telemetry to calibrate global satellite feeds.'
    },
    {
      num: '08',
      title: 'Personalized alerts',
      summary: 'Let users choose preferred alert channels & notification preferences.',
      status: 'Configurable in Settings',
      statusType: 'live',
      icon: Sliders,
      color: 'text-indigo-400',
      bgTag: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      fullDescription: 'Fine-grained settings to configure recipient email, minimum risk thresholds, voice auto-narration preferences, and custom notification parameters.'
    }
  ];

  // Voice narration of the scope and vision
  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const narrationText = `WeatherGPT Smart India Hackathon 2026 Future Scope and Social Impact.
One platform supports multiple weather-sensitive decisions across Agriculture, Travel, Local Administration, Education, General Public, and Emergency Services.
Our 8-point strategic roadmap moves from a dashboard prototype toward a proactive weather intelligence platform, including AI/ML prediction models, automated severe-weather alerts, flood and cyclone risk assessment, agricultural recommendations, mobile application, multilingual user experience, grassroots IoT sensors, and personalized notification alerts.
From weather data to better decisions.`;

    setIsSpeaking(true);
    speakWeatherReport({
      text: narrationText,
      lang: 'en',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const filteredRoadmap = roadmapItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return item.statusType === 'live';
    if (activeFilter === 'next') return item.statusType === 'next';
    if (activeFilter === 'future') return item.statusType === 'future';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isSpeaking) stopSpeech();
              onBack();
            }}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SIH 2026 Presentation
              </span>
              <span className="text-xs text-slate-400 font-mono hidden md:inline">Slide Deck 09 • 10 • 11</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
              <span>Future Scope & Social Impact</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
          </div>
        </div>

        {/* View Switcher & Audio Narration */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Listen to Future Scope & Vision"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-cyan-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isSpeaking ? 'Stop Voice' : 'Listen with AI'}</span>
          </button>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Mode
            </button>
            <button
              onClick={() => setViewMode('slides')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'slides'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Slide Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SLIDE DECK VIEW (Exact Match to Presentation Slides) */}
      {/* ========================================================================= */}
      {viewMode === 'slides' && (
        <div className="space-y-6">
          {/* Slide Navigation Header */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 px-4 rounded-xl text-xs">
            <span className="text-slate-400 font-mono">
              Slide <strong className="text-cyan-400">{currentSlide + 9}</strong> of 11: {' '}
              <span className="text-white font-semibold">
                {currentSlide === 0 && '09 • Applications & Social Impact'}
                {currentSlide === 1 && '10 • Future Scope & Strategic Roadmap'}
                {currentSlide === 2 && '11 • Conclusion & Strategic Vision'}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {[0, 1, 2].map(idx => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide(prev => Math.min(2, prev + 1))}
                disabled={currentSlide === 2}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SLIDE 09: Applications & Social Impact */}
          {currentSlide === 0 && (
            <div className="bg-[#080d19] border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-8">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                  SIH 2026 • WeatherGPT
                </span>
                <span className="text-xs font-mono text-slate-500">Slide 09 / 11</span>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">09 • IMPACT</p>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Applications & Social Impact
                </h3>
                <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
                  One platform can support multiple weather-sensitive decisions.
                </p>
              </div>

              {/* 6 Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
                {impactSectors.map((sector) => {
                  const Icon = sector.icon;
                  return (
                    <div
                      key={sector.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-white text-base">{sector.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {sector.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Impact Focus Pill */}
              <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl text-center">
                <p className="text-xs sm:text-sm font-semibold text-cyan-300 tracking-wide">
                  <span className="text-slate-400">Impact focus:</span>{' '}
                  <span className="text-white">accessibility</span> •{' '}
                  <span className="text-cyan-300">preparedness</span> •{' '}
                  <span className="text-emerald-300">clearer decisions</span> •{' '}
                  <span className="text-purple-300">reusable public-service interface</span>
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 10: Future Scope */}
          {currentSlide === 1 && (
            <div className="bg-[#080d19] border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-8">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                  SIH 2026 • WeatherGPT
                </span>
                <span className="text-xs font-mono text-slate-500">Slide 10 / 11</span>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">10 • ROADMAP</p>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Future Scope
                </h3>
                <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
                  Move from a dashboard prototype toward a proactive weather intelligence platform.
                </p>
              </div>

              {/* 8 Roadmap Items in 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-8">
                {roadmapItems.map((item) => {
                  return (
                    <div
                      key={item.num}
                      className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl flex items-start gap-3.5 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-black shrink-0">
                        {item.num}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm tracking-tight">{item.title}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${item.bgTag}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>SIH 2026 • WeatherGPT Intelligence Engine</span>
                <span className="text-cyan-400">Roadmap Milestones 01 to 08</span>
              </div>
            </div>
          )}

          {/* SLIDE 11: Conclusion */}
          {currentSlide === 2 && (
            <div className="bg-[#080d19] border border-cyan-500/40 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center min-h-[440px] flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest mb-4">
                SIH 2026 • CONCLUSION
              </span>

              <h2 className="text-3xl sm:text-6xl font-black text-white tracking-tight max-w-3xl leading-tight">
                From weather data to{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  better decisions.
                </span>
              </h2>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mt-6 leading-relaxed">
                WeatherGPT bridges raw meteorological observation APIs with actionable, localized, and multilingual intelligence.
                Empowering farmers, travelers, educators, municipal authorities, and emergency responders across India.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  Return to Live Dashboard
                </button>
                <button
                  onClick={() => setCurrentSlide(0)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  Review Slide 09 & 10
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INTERACTIVE DASHBOARD VIEW (Full-Fidelity Deep Dive) */}
      {/* ========================================================================= */}
      {viewMode === 'interactive' && (
        <div className="space-y-12">
          {/* SECTION 1: APPLICATIONS & SOCIAL IMPACT (Slide 09) */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-cyan-400 font-mono uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    09 • IMPACT
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Real-world decision matrix</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Applications & Social Impact
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  One platform can support multiple weather-sensitive decisions.
                </p>
              </div>

              {/* Quick Tagline */}
              <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>6 Core Social Sectors</span>
              </div>
            </div>

            {/* 6 High-Fidelity Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {impactSectors.map((sector) => {
                const Icon = sector.icon;
                const isExpanded = expandedImpact === sector.id;
                return (
                  <div
                    key={sector.id}
                    onClick={() => setExpandedImpact(isExpanded ? null : sector.id)}
                    className={`bg-gradient-to-br ${sector.bgGradient} border ${sector.borderColor} rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between group hover:shadow-cyan-500/10`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300">
                          {sector.badge}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-white tracking-tight">{sector.title}</h4>
                      <p className="text-[11px] font-semibold text-cyan-300 mb-2">{sector.subtitle}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sector.description}
                      </p>

                      {/* Expandable Deep Dive Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 animate-in fade-in duration-200">
                          <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                            Key Functional Capabilities:
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {sector.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />
                            <span>{sector.metrics}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-cyan-400">
                      <span>{isExpanded ? 'Click to collapse' : 'Click to see capabilities'}</span>
                      <ArrowUpRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Impact Focus Banner (from slide 09) */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Strategic Impact Pillars</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Designed as a reliable, reusable public-service interface for smart governance.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  accessibility
                </span>
                <span className="text-slate-600">•</span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  preparedness
                </span>
                <span className="text-slate-600">•</span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  clearer decisions
                </span>
                <span className="text-slate-600">•</span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  reusable public-service interface
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 2: FUTURE SCOPE & STRATEGIC ROADMAP (Slide 10) */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-cyan-400 font-mono uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    10 • ROADMAP
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Strategic Milestones 01 to 08</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Future Scope
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Move from a dashboard prototype toward a proactive weather intelligence platform.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All (8)
                </button>
                <button
                  onClick={() => setActiveFilter('live')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'live' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  Active Live
                </button>
                <button
                  onClick={() => setActiveFilter('next')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'next' ? 'bg-purple-500 text-slate-950' : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  Next Phase
                </button>
                <button
                  onClick={() => setActiveFilter('future')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeFilter === 'future' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-teal-300'
                  }`}
                >
                  Upcoming Horizon
                </button>
              </div>
            </div>

            {/* 8 Milestone Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredRoadmap.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedRoadmap === item.num;
                return (
                  <div
                    key={item.num}
                    onClick={() => setExpandedRoadmap(isExpanded ? null : item.num)}
                    className="bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-5 transition-all shadow-md hover:shadow-xl hover:shadow-cyan-500/5 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-black text-sm group-hover:scale-105 transition-transform">
                          {item.num}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <span>{item.title}</span>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.bgTag}`}>
                            {item.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {item.summary}
                        </p>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 animate-in fade-in duration-200">
                            <p className="font-medium text-slate-300 leading-relaxed">
                              {item.fullDescription}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-cyan-400/90">
                          <span className="text-slate-500">
                            {isExpanded ? 'Hide details' : 'View architecture details'}
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 3: CONCLUSION & VISION (Slide 11) */}
          <section className="bg-gradient-to-b from-[#080d19] via-slate-950 to-[#0A0F1D] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <span className="text-xs font-mono text-cyan-400 font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              SIH 2026 • CONCLUSION
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-6 max-w-2xl mx-auto leading-tight">
              From weather data to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                better decisions.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed">
              Moving beyond traditional passive forecasts toward a proactive, multimodal decision platform.
              Equipping citizens and administrators with the right alerts at the right time.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setViewMode('slides');
                  setCurrentSlide(0);
                }}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                Open Slide Deck Presentation Mode
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
