import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SellsPage from './pages/SellsPage';
import StockPage from './pages/StockPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage'; 
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }

    // Cargar tema y aplicarlo
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'es';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Traducciones para la navbar
  const texts = {
    es: {
      dashboard: "Dashboard",
      products: "Productos", 
      sells: "Ventas",
      stock: "Stock",
      users: "Usuarios",
      profile: "Mi Perfil",
      settings: "Configuración",
      logout: "Cerrar Sesión",
      userManagement: "Gestión de Usuarios"
    },
    en: {
      dashboard: "Dashboard",
      products: "Products",
      sells: "Sales", 
      stock: "Stock",
      users: "Users",
      profile: "My Profile",
      settings: "Settings",
      logout: "Logout",
      userManagement: "User Management"
    }
  };

  const t = texts[language] || texts.es;

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Renderizar la página actual según el estado
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
      case 'products':
        return <ProductsPage setCurrentPage={setCurrentPage} />;
      case 'sells':
        return <SellsPage setCurrentPage={setCurrentPage} />;
      case 'stock':
        return <StockPage setCurrentPage={setCurrentPage} />;
      case 'users':
        return <UsersPage setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} user={user} onUpdateUser={handleUpdateUser} />;
      case 'settings':
        return <SettingsPage setCurrentPage={setCurrentPage} user={user} />;
      default:
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className={`App min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Navbar Moderno - FIJO SIN ESPACIOS */}
      <nav className={`fixed top-0 left-0 right-0 shadow-2xl backdrop-blur-lg z-[9999] m-0 p-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' 
          : 'bg-gradient-to-r from-primary via-primary/90 to-secondary'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="text-3xl md:text-4xl">🌮</div>
              <div className="hidden md:block">
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Lonches El Primo
                </h1>
                <p className="text-xs text-white/80">Sistema de Gestión</p>
              </div>
            </div>

            {/* Desktop Navigation - CENTRADO */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
              {[
                { id: 'dashboard', icon: '📊', label: t.dashboard },
                { id: 'products', icon: '🍽️', label: t.products },
                { id: 'sells', icon: '💰', label: t.sells },
                { id: 'stock', icon: '📦', label: t.stock },
                // AGREGAR USUARIOS SOLO PARA ADMIN/GERENTE
                ...(user?.role === 'admin' || user?.role === 'gerente' ? [{ id: 'users', icon: '👥', label: t.users }] : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    currentPage === item.id
                      ? 'bg-white text-primary shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-sm">{user?.nombre}</p>
                  <p className="text-xs text-white/80">{user?.role}</p>
                </div>
                <span className="text-white/80 text-xs hidden md:inline">▼</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden z-[10000] ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  {/* User Info Header */}
                  <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user?.nombre?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{user?.nombre} {user?.apellidos}</h3>
                        <p className="text-sm text-white/80">{user?.role}</p>
                        <p className="text-xs text-white/70">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setCurrentPage('profile');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">👤</span>
                      <span>{t.profile}</span>
                    </button>

                    {/* BOTÓN DE USUARIOS SOLO PARA ADMIN/GERENTE */}
                    {(user?.role === 'admin' || user?.role === 'gerente') && (
                      <button
                        onClick={() => {
                          setCurrentPage('users');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">👥</span>
                        <span>{t.userManagement}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setCurrentPage('settings');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>{t.settings}</span>
                    </button>
                    
                    <hr className={`my-2 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`} />
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="text-lg">🚪</span>
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-primary/90'
        }`}>
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-center gap-1 overflow-x-auto">
              {[
                { id: 'dashboard', icon: '📊', label: t.dashboard },
                { id: 'products', icon: '🍽️', label: t.products },
                { id: 'sells', icon: '💰', label: t.sells },
                { id: 'stock', icon: '📦', label: t.stock },
                // USUARIOS TAMBIÉN EN MOBILE PARA ADMIN/GERENTE
                ...(user?.role === 'admin' || user?.role === 'gerente' ? [{ id: 'users', icon: '👥', label: t.users }] : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-white text-primary'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Contenido principal - AJUSTADO */}
      <div className="pt-20 md:pt-24">
        {renderCurrentPage()}
      </div>

      {/* Click overlay para cerrar menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[9998]"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
}

export default App;