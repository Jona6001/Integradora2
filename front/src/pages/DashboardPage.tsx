import React, { useState, useEffect } from "react";
import apiService from "../services/api";

type Product = {
  _id: string;
  nombre: string;
  precio: number;
  // Add other fields if needed
};

export default function DashboardPage({ user, setCurrentPage }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Cargar tema guardado solo para aplicarlo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh cada 30 segundos si está activado
    const autoRefresh = localStorage.getItem('autoRefresh') !== 'false';
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
        setLastRefresh(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const productsResponse = await apiService.getAllProducts();
      if (productsResponse.productsList) {
        setProducts(productsResponse.productsList.slice(0, 3));
      }

      const sellsResponse = await apiService.getAllSells();
      if (sellsResponse.sellsList) {
        const today = new Date().toDateString();
        const todaySales = sellsResponse.sellsList.filter(sale => 
          new Date(sale.fecha).toDateString() === today
        );
        
        setTodayStats({
          totalSales: todaySales.length,
          totalOrders: todaySales.length,
          totalRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
          lowStock: Math.floor(Math.random() * 5) + 1
        });
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener idioma guardado para traducciones
  const language = localStorage.getItem('language') || 'es';
  const theme = localStorage.getItem('theme') || 'light';

  // Traducciones
  const texts = {
    es: {
      welcome: "¡Bienvenido",
      title: "Panel de Control - Lonches El Primo",
      sellLonches: "Vender Lonches",
      createSale: "Crear nueva venta - ¡Haz clic aquí!",
      systemActive: "Sistema de ventas activo",
      salesToday: "Ventas Hoy",
      totalEarned: "Total recaudado",
      orders: "Órdenes",
      activeToday: "Activas hoy",
      products: "Productos",
      available: "Disponibles",
      lowStock: "Stock Bajo",
      toRestock: "Por reponer",
      quickActions: "Acciones Rápidas",
      manageInventory: "Gestionar Inventario",
      stockControl: "Control de stock",
      manageProducts: "Gestionar Productos",
      catalog: "Catálogo de lonches",
      manageUsers: "Gestionar Usuarios",
      workTeam: "Equipo de trabajo",
      bestSellers: "Productos Más Vendidos del Día",
      noProducts: "No hay productos disponibles",
      addProducts: "Agregar Productos",
      sales: "ventas",
      loading: "Cargando dashboard...",
      updateData: "Actualizar datos",
      lastUpdate: "Última actualización"
    },
    en: {
      welcome: "Welcome",
      title: "Control Panel - Lonches El Primo",
      sellLonches: "Sell Lonches",
      createSale: "Create new sale - Click here!",
      systemActive: "Sales system active",
      salesToday: "Sales Today",
      totalEarned: "Total earned",
      orders: "Orders",
      activeToday: "Active today",
      products: "Products",
      available: "Available",
      lowStock: "Low Stock",
      toRestock: "To restock",
      quickActions: "Quick Actions",
      manageInventory: "Manage Inventory",
      stockControl: "Stock control",
      manageProducts: "Manage Products",
      catalog: "Lonches catalog",
      manageUsers: "Manage Users",
      workTeam: "Work team",
      bestSellers: "Best Selling Products Today",
      noProducts: "No products available",
      addProducts: "Add Products",
      sales: "sales",
      loading: "Loading dashboard...",
      updateData: "Update data",
      lastUpdate: "Last update"
    }
  };

  const t = texts[language] || texts.es;

  const handleNewSale = () => {
    setCurrentPage('sells');
  };

  const handleInventory = () => {
    setCurrentPage('stock');
  };

  const handleProducts = () => {
    setCurrentPage('products');
  };

  const handleUsers = () => {
    setCurrentPage('users');
  };

  const quickActions = [
    {
      title: t.manageInventory,
      subtitle: t.stockControl,
      icon: "📦",
      color: "from-blue-500 to-indigo-600",
      action: handleInventory
    },
    {
      title: t.manageProducts,
      subtitle: t.catalog,
      icon: "🍽️",
      color: "from-green-500 to-emerald-600",
      action: handleProducts
    },
    {
      title: t.manageUsers,
      subtitle: t.workTeam,
      icon: "👥",
      color: "from-purple-500 to-pink-600",
      action: handleUsers,
      adminOnly: true
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !action.adminOnly || (action.adminOnly && (user?.role === 'admin' || user?.role === 'gerente'))
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-primary to-secondary'
      }`}>
        <div className={`${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
        } backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className={`text-center mt-4 font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-primary'
          }`}>
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-primary via-primary/80 to-secondary'
    }`}>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="relative bg-cover bg-center py-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')`,
          }}
        >
          <div className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-gray-900/90 to-gray-800/90' 
              : 'bg-gradient-to-r from-primary/90 to-secondary/90'
          }`}></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center text-white">
              <h1 
                className="text-5xl md:text-6xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.welcome}, {user?.nombre}!
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90">
                {t.title}
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <span className="bg-white/30 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {user?.role}
                  </span>
                  <button 
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => {
                      loadDashboardData();
                      setLastRefresh(new Date());
                    }}
                    title={t.updateData}
                  >
                    🔄
                  </button>
                </div>
              </div>
              <p className="text-sm opacity-70">
                {t.lastUpdate}: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Botón principal - Vender Lonches */}
        <div className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <button
              onClick={handleNewSale}
              className="relative w-full bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between p-8">
                <div className="flex-1 text-left">
                  <h2 
                    className="text-4xl md:text-5xl font-bold mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    🥪 {t.sellLonches}
                  </h2>
                  <p className="text-xl md:text-2xl opacity-90">
                    {t.createSale}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                      {t.systemActive}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl">
                      🥪
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Estadísticas Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: t.salesToday,
              value: `$${todayStats.totalRevenue}`,
              subtitle: t.totalEarned,
              color: "from-green-500 to-emerald-600",
              icon: "💰"
            },
            {
              title: t.orders,
              value: todayStats.totalOrders,
              subtitle: t.activeToday,
              color: "from-blue-500 to-indigo-600",
              icon: "📋"
            },
            {
              title: t.products,
              value: products.length,
              subtitle: t.available,
              color: "from-purple-500 to-pink-600",
              icon: "🍽️"
            },
            {
              title: t.lowStock,
              value: todayStats.lowStock,
              subtitle: t.toRestock,
              color: "from-orange-500 to-red-600",
              icon: "⚠️"
            }
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-75 rounded-2xl blur transition duration-500"></div>
                <div className={`relative bg-gradient-to-r ${stat.color} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <div className="bg-white/20 rounded-full p-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-12">
          <h2 
            className="text-3xl font-bold text-white text-center mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-75 rounded-2xl blur transition duration-500"></div>
                <div className={`relative bg-gradient-to-r ${action.color} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300`}>
                  <div className="text-center">
                    <div className="text-5xl mb-4">{action.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                    <p className="opacity-80">{action.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div>
          <h2 
            className="text-3xl font-bold text-white text-center mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.bestSellers}
          </h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div key={product._id} className="group">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                    <div className={`relative ${
                      theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'
                    } backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300`}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-${index === 0 ? '1504674900247-0877df9cc836' : '1565299624946-b28f40a0ca4b'}?auto=format&fit=crop&w=600&q=80`}
                          alt={product.nombre}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 
                          className={`text-xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {product.nombre}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ${product.precio}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {Math.floor(Math.random() * 50) + 10} {t.sales}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-white text-xl">{t.noProducts}</p>
                <button 
                  onClick={handleProducts}
                  className="mt-4 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  {t.addProducts}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}