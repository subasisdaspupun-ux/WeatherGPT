import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const STORAGE_KEY = 'weathergpt_settings';

const DEFAULT_SETTINGS = {
  tempUnit: 'C',        // 'C' | 'F'
  windUnit: 'km/h',     // 'km/h' | 'mph' | 'm/s' | 'knots'
  pressureUnit: 'hPa',  // 'hPa' | 'mbar' | 'inHg' | 'mmHg'
  nightUpdate: false    // boolean
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Temperature Conversion Helper
  const formatTemp = (celsiusVal) => {
    if (celsiusVal === undefined || celsiusVal === null) return '--';
    const num = Number(celsiusVal);
    if (isNaN(num)) return '--';

    if (settings.tempUnit === 'F') {
      const f = Math.round((num * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${Math.round(num)}°C`;
  };

  // Raw numeric temp converter
  const convertTempNum = (celsiusVal) => {
    if (celsiusVal === undefined || celsiusVal === null) return 0;
    const num = Number(celsiusVal);
    if (isNaN(num)) return 0;
    return settings.tempUnit === 'F' ? Math.round((num * 9) / 5 + 32) : Math.round(num);
  };

  // Wind Speed Conversion Helper (input assumed in km/h)
  const formatWind = (kmhVal) => {
    if (kmhVal === undefined || kmhVal === null) return '--';
    const num = Number(kmhVal);
    if (isNaN(num)) return '--';

    switch (settings.windUnit) {
      case 'mph':
        return `${(num * 0.621371).toFixed(1)} mph`;
      case 'm/s':
        return `${(num / 3.6).toFixed(1)} m/s`;
      case 'knots':
        return `${(num * 0.539957).toFixed(1)} kn`;
      case 'km/h':
      default:
        return `${num.toFixed(1)} km/h`;
    }
  };

  // Pressure Conversion Helper (input assumed in hPa / mbar)
  const formatPressure = (hpaVal) => {
    if (hpaVal === undefined || hpaVal === null) return '--';
    const num = Number(hpaVal);
    if (isNaN(num)) return '--';

    switch (settings.pressureUnit) {
      case 'mbar':
        return `${Math.round(num)} mbar`;
      case 'inHg':
        return `${(num * 0.02953).toFixed(2)} inHg`;
      case 'mmHg':
        return `${(num * 0.750062).toFixed(1)} mmHg`;
      case 'hPa':
      default:
        return `${Math.round(num)} hPa`;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        updateSetting,
        formatTemp,
        convertTempNum,
        formatWind,
        formatPressure
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
