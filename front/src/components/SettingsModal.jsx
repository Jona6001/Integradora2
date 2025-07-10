import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function SettingsModal({ isOpen, onClose, user }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'es';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Recargar para aplicar cambios inmediatamente
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Recargar para aplicar cambios de idioma
    window.location.reload();
  };

  // Traducciones para el modal
  const texts = {
    es: {
      settings: "Configuración",
      theme: "Tema",
      language: "Idioma",
      darkMode: "Modo Oscuro",
      lightMode: "Modo Claro",
      spanish: "Español",
      english: "Inglés",
      close: "Cerrar",
      personalizeExperience: "Personaliza tu experiencia"
    },
    en: {
      settings: "Settings",
      theme: "Theme",
      language: "Language",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      spanish: "Spanish",
      english: "English",
      close: "Close",
      personalizeExperience: "Customize your experience"
    }
  };

  const t = texts[language] || texts.es;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            ⚙️ {t.settings}
          </h2>
          <button
            onClick={onClose}
            className={`${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-500 hover:text-gray-700'
            } transition-colors p-2`}
          >
            ✕
          </button>
        </div>

        <p className={`text-center mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {t.personalizeExperience}
        </p>

        <div className="space-y-6">
          {/* Tema */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {t.theme}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {theme === 'dark' ? t.darkMode : t.lightMode}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'bg-primary' 
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Idioma */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">
                  {language === 'es' ? '🇲🇽' : '🇺🇸'}
                </span>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {t.language}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {language === 'es' ? t.spanish : t.english}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleLanguage}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="p-6 bg-gradient-to-r from-primary to-secondary rounded-xl text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user?.nombre} {user?.apellidos}</h3>
                <p className="text-sm opacity-80">{user?.role} • {user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-semibold transition-colors border ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'
            }`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    nombre: PropTypes.string,
    apellidos: PropTypes.string,
    role: PropTypes.string,
    email: PropTypes.string,
  }),
};