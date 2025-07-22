import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function SettingsPage({ setCurrentPage, user }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('es');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cargar configuraciones guardadas
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'es';
    const savedAutoRefresh = localStorage.getItem('autoRefresh') !== 'false';
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setAutoRefresh(savedAutoRefresh);
    
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Funciones para cambiar configuraciones
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    window.location.reload();
  };

  const toggleAutoRefresh = () => {
    const newAutoRefresh = !autoRefresh;
    setAutoRefresh(newAutoRefresh);
    localStorage.setItem('autoRefresh', newAutoRefresh.toString());
  };

  // Traducciones
  const texts = {
    es: {
      settings: "Configuración",
      theme: "Tema",
      language: "Idioma",
      autoRefreshSetting: "Actualización Automática",
      darkMode: "Modo Oscuro",
      lightMode: "Modo Claro",
      spanish: "Español",
      english: "Inglés",
      enabled: "Activado",
      disabled: "Desactivado",
      backToDashboard: "Volver al Dashboard",
      personalizeExperience: "Personaliza tu experiencia",
      themeDescription: "Cambia entre tema claro y oscuro para una mejor experiencia visual",
      languageDescription: "Cambia el idioma de toda la aplicación",
      autoRefreshDescription: "Actualización automática de datos en el dashboard",
      userSettings: "Configuraciones personalizadas del sistema"
    },
    en: {
      settings: "Settings",
      theme: "Theme",
      language: "Language",
      autoRefreshSetting: "Auto Refresh",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      spanish: "Spanish",
      english: "English",
      enabled: "Enabled",
      disabled: "Disabled",
      backToDashboard: "Back to Dashboard",
      personalizeExperience: "Customize your experience",
      themeDescription: "Switch between light and dark theme for better visual experience",
      languageDescription: "Change the language of the entire application",
      autoRefreshDescription: "Automatic data refresh in the dashboard",
    }
  };

  const t = texts[language] || texts.es;

return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-primary via-primary/80 to-secondary'
    }`}>
      {/* Header reducido */}
      <div className="relative">
        <div className="h-40 md:h-48 lg:h-32 relative overflow-hidden">
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-gray-900/90 to-gray-800/90' 
              : 'bg-gradient-to-r from-primary/90 to-secondary/90'
          }`}></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center text-white pt-8">
              <h1 
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                ⚙️ {t.settings}
              </h1>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors text-sm"
              >
                ← {t.backToDashboard}
              </button>
            </div>
          </div>
        </div>
      </div>
{/* Configuraciones más arriba */}
<div className="container mx-auto px-4 py-1 mt-0">
  <div className={`${
    theme === 'dark' ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
  } backdrop-blur-sm rounded-2xl shadow-2xl p-2 border`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            
                    {/* Tema */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center ${
              theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center mb-4 w-full">
                <span className="text-5xl mb-2 block">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
                <h3 className={`text-xl font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {t.theme}
                </h3>
                <p className={`text-base mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {theme === 'dark' ? t.darkMode : t.lightMode}
                </p>
                <div className="flex justify-center w-full">
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                      theme === 'dark' 
                        ? 'bg-primary' 
                        : 'bg-gray-300'
                    }`}
                    style={{ margin: '0 auto' }}
                  >
                    <span
                      className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg ${
                        theme === 'dark' ? 'translate-x-0' : 'translate-x-5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className={`text-xs text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {t.themeDescription}
              </p>
            </div>
            
            {/* Idioma */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center ${
              theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center mb-4 w-full">
                <span className="text-5xl mb-2 block">
                  {language === 'es' ? '🇲🇽' : '🇺🇸'}
                </span>
                <h3 className={`text-xl font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {t.language}
                </h3>
                <p className={`text-base mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'es' ? t.spanish : t.english}
                </p>
                <div className="flex justify-center w-full">
                  <button
                    onClick={toggleLanguage}
                    className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-secondary transition-colors font-semibold text-base"
                    style={{ margin: '0 auto' }}
                  >
                    {language === 'es' ? 'EN' : 'ES'}
                  </button>
                </div>
              </div>
              <p className={`text-xs text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {t.languageDescription}
              </p>
            </div>
            
            {/* Auto Refresh */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center ${
              theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center mb-4 w-full">
                <span className="text-5xl mb-2 block">
                  {autoRefresh ? '🔄' : '⏸️'}
                </span>
                <h3 className={`text-xl font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {t.autoRefreshSetting}
                </h3>
                <p className={`text-base mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {autoRefresh ? t.enabled : t.disabled}
                </p>
                <div className="flex justify-center w-full">
                  <button
                    onClick={toggleAutoRefresh}
                    className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors ${
                      autoRefresh 
                        ? 'bg-primary' 
                        : 'bg-gray-300'
                    }`}
                    style={{ margin: '0 auto' }}
                  >
                    <span
                      className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg ${
                        autoRefresh ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className={`text-xs text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {t.autoRefreshDescription}
              </p>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="mt-6 p-6 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user?.nombre} {user?.apellidos}</h3>
                <p className="text-base opacity-80">{user?.role} • {user?.email}</p>
                <p className="text-xs opacity-70 mt-1">
                  {t.userSettings}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SettingsPage.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  user: PropTypes.shape({
    nombre: PropTypes.string,
    apellidos: PropTypes.string,
    role: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
};