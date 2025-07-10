import { useState, useEffect } from 'react';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'es',
    notifications: true,
    autoRefresh: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleTheme = () => {
    updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    updateSetting('language', settings.language === 'es' ? 'en' : 'es');
  };

  return {
    settings,
    updateSetting,
    toggleTheme,
    toggleLanguage
  };
};