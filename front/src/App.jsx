import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SellsPage from './pages/SellsPage';
import StockPage from './pages/StockPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage'; 
import SettingsPage from "./pages/SettingsPage";
import logo from './assets/website/logo.jpg'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }

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

  const texts = {
    es: {
      dashboard: "Inicio",
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
      dashboard: "Home",
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

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Navbar mejorado con mejor contraste */}
      <nav className={`fixed top-0 left-0 right-0 shadow-2xl backdrop-blur-lg z-[9999] m-0 p-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' 
          : 'bg-gradient-to-r from-amber-700 via-amber-800 to-orange-700'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-26 rounded-full overflow-hidden flex items-center justify-center bg-white shadow">
              <img src={logo} alt="Logo Lonches El Primo" className="object-cover w-full h-full" />
             </div>
              <div className="hidden md:block">
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  El primo Lonches  
                </h1>
                <p className="text-xs text-white/80">Sistema de Gestión</p>
              </div>
            </div>

            
                      {/* Desktop Navigation */}
                      <div className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
                        {[
                          { 
                            id: 'dashboard', 
                            icon: (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            ), 
                            label: t.dashboard 
                          },
                          { 
                            id: 'products', 
                            icon: (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            ), 
                            label: t.products 
                          },
                          { 
                            id: 'sells', 
                            icon: (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            ), 
                            label: t.sells 
                          },
                          { 
                            id: 'stock', 
                            icon: (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            ), 
                            label: t.stock 
                          },
                          ...(user?.role === 'admin' || user?.role === 'gerente' ? [{
                            id: 'users', 
                            icon: (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            ), 
                            label: t.users 
                          }] : [])
                        ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentPage(item.id)}
                          className={`flex items-center gap-3 px-3.5 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-102 ${
                            currentPage === item.id
                              ? (theme === 'dark'
                                  ? 'bg-white text-amber-800 shadow-lg'
                                  : 'bg-white text-black shadow-lg')
                              : (theme === 'dark'
                                  ? 'text-white hover:bg-white/10'
                                  : 'text-amber-900 bg-white/60 hover:bg-white/80')
                          }`}
                          >
                            {item.icon}
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
                <svg className="w-4 h-4 text-white/80 hidden md:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu mejorado */}
              {showUserMenu && (
                <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden z-[10000] ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  {/* User Info Header */}
                  <div className={`p-4 text-white ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-600'
                      : 'bg-gradient-to-r from-amber-700 to-orange-700'
                  }`}>
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{t.profile}</span>
                    </button>

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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-amber-800/90'
        }`}>
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-center gap-1 overflow-x-auto">
              {[
                { 
                  id: 'dashboard', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ), 
                  label: t.dashboard 
                },
                { 
                  id: 'products', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ), 
                  label: t.products 
                },
                { 
                  id: 'sells', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  ), 
                  label: t.sells 
                },
                { 
                  id: 'stock', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ), 
                  label: t.stock 
                },
                ...(user?.role === 'admin' || user?.role === 'gerente' ? [{
                  id: 'users', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ), 
                  label: t.users 
                }] : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-white text-amber-800'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Contenido principal */}
      <div className="pt-20 md:pt-20">
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