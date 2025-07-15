import React, { useState, useEffect } from "react";
import apiService from "../services/api";

type Product = {
  _id: string;
  nombre: string;
  precio: number;
};

type CartItem = {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export default function DashboardPage({ user, setCurrentPage }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [sells, setSells] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estados para modal de venta directa
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vendedorId] = useState(1);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    loadDashboardData();
    
    // Timer para actualizar la hora cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const autoRefresh = localStorage.getItem('autoRefresh') !== 'false';
    if (autoRefresh) {
      const dataInterval = setInterval(() => {
        loadDashboardData();
      }, 30000);

      return () => {
        clearInterval(timeInterval);
        clearInterval(dataInterval);
      };
    }

    return () => clearInterval(timeInterval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar productos
      const productsResponse = await apiService.getAllProducts();
      if (productsResponse.productsList) {
        setProducts(productsResponse.productsList);
      }

      // Cargar stock
      const stockResponse = await apiService.getAllStock();
      if (stockResponse.stockList) {
        setStock(stockResponse.stockList);
      }

      // Cargar ventas
      const sellsResponse = await apiService.getAllSells();
      if (sellsResponse.sellsList) {
        setSells(sellsResponse.sellsList);
        
        const today = new Date().toDateString();
        const todaySales = sellsResponse.sellsList.filter(sale => 
          new Date(sale.fecha).toDateString() === today
        );
        
        setTodayStats({
          totalSales: todaySales.length,
          totalOrders: todaySales.length,
          totalRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
          lowStock: stockResponse.stockList?.filter(item => item.cantidad < 10).length || 0
        });

        // Calcular productos más vendidos REALES (últimos 5 días)
        calculateTopProducts(sellsResponse.sellsList);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular productos más vendidos en los últimos 5 días
  const calculateTopProducts = (salesList) => {
    const productSales = {};
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    // Filtrar ventas de los últimos 5 días
    const recentSales = salesList.filter(sale => 
      new Date(sale.fecha) >= fiveDaysAgo
    );
    
    // Contar ventas por producto en los últimos 5 días
    recentSales.forEach(sale => {
      if (sale.productos) {
        sale.productos.forEach(producto => {
          const productName = producto.nombre;
          if (productSales[productName]) {
            productSales[productName].totalSold += producto.cantidad;
            productSales[productName].totalRevenue += producto.subtotal;
          } else {
            productSales[productName] = {
              nombre: productName,
              totalSold: producto.cantidad,
              totalRevenue: producto.subtotal,
              precio: producto.precio_unitario
            };
          }
        });
      }
    });

    // Convertir a array y ordenar por cantidad vendida
    const topProductsArray = Object.values(productSales)
      .sort((a: any, b: any) => b.totalSold - a.totalSold)
      .slice(0, 3); // Top 3

    setTopProducts(topProductsArray);
  };

  const language = localStorage.getItem('language') || 'es';
  const theme = localStorage.getItem('theme') || 'light';

  const texts = {
    es: {
      title: "Panel de Control",
      sellNow: "Venta Rápida",
      quickSale: "Crear venta directa",
      salesToday: "Ventas Hoy",
      totalEarned: "Recaudado",
      quickActions: "Acciones Rápidas",
      manageInventory: "Inventario",
      stockControl: "Control de almacén",
      manageProducts: "Productos",
      catalog: "Catálogo completo",
      manageUsers: "Usuarios",
      workTeam: "Equipo de trabajo",
      bestSellers: "Más Vendidos (5 días)",
      noSales: "Sin ventas registradas",
      sold: "vendidos",
      totalSold: "Total vendido",
      stockStatus: "Estado del Stock",
      lowStockItems: "Productos con Stock Bajo",
      viewAll: "Ver Todo",
      loading: "Cargando...",
      newSale: "Nueva Venta",
      availableProducts: "Productos Disponibles",
      cart: "Carrito",
      emptyCart: "Carrito vacío",
      addToCart: "Agregar",
      total: "Total",
      completeSale: "Completar Venta",
      cancel: "Cancelar",
      catalogInfo: "Catálogo de Productos",
      totalProducts: "productos registrados"
    },
    en: {
      title: "Control Panel",
      sellNow: "Quick Sale",
      quickSale: "Create direct sale",
      salesToday: "Sales Today",
      totalEarned: "Earned",
      quickActions: "Quick Actions",
      manageInventory: "Inventory",
      stockControl: "Warehouse control",
      manageProducts: "Products",
      catalog: "Complete catalog",
      manageUsers: "Users",
      workTeam: "Work team",
      bestSellers: "Best Sellers (5 days)",
      noSales: "No sales recorded",
      sold: "sold",
      totalSold: "Total sold",
      stockStatus: "Stock Status",
      lowStockItems: "Low Stock Items",
      viewAll: "View All",
      loading: "Loading...",
      newSale: "New Sale",
      availableProducts: "Available Products",
      cart: "Cart",
      emptyCart: "Empty cart",
      addToCart: "Add",
      total: "Total",
      completeSale: "Complete Sale",
      cancel: "Cancel",
      catalogInfo: "Product Catalog",
      totalProducts: "registered products"
    }
  };

  const t = texts[language] || texts.es;

  // Funciones del carrito
  const addToCart = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.producto_id === productId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.producto_id === productId 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
          : item
      ));
    } else {
      setCart([...cart, {
        producto_id: product._id,
        nombre: product.nombre,
        cantidad: 1,
        precio_unitario: product.precio,
        subtotal: product.precio
      }]);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.producto_id !== productId));
      return;
    }

    setCart(cart.map(item => 
      item.producto_id === productId 
        ? { ...item, cantidad: newQuantity, subtotal: newQuantity * item.precio_unitario }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    try {
      const saleData = {
        productos: cart,
        total: calculateTotal(),
        vendedor_id: vendedorId,
        status: "activo"
      };
      
      await apiService.createSell(saleData);
      setCart([]);
      setShowSaleModal(false);
      loadDashboardData(); // Recargar datos para actualizar stats
      alert('Venta creada exitosamente');
    } catch (error) {
      console.error('Error creando venta:', error);
      alert('Error al crear la venta');
    }
  };

  const handleNewSale = () => setShowSaleModal(true);
  const handleInventory = () => setCurrentPage('stock');
  const handleProducts = () => setCurrentPage('products');
  const handleUsers = () => setCurrentPage('users');

  const quickActions = [
    {
      title: t.manageInventory,
      subtitle: t.stockControl,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-amber-600 to-amber-700",
      action: handleInventory
    },
    {
      title: t.manageProducts,
      subtitle: t.catalog,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "from-orange-600 to-orange-700",
      action: handleProducts
    },
    {
      title: t.manageUsers,
      subtitle: t.workTeam,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-slate-600 to-slate-700",
      action: handleUsers,
      adminOnly: true
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !action.adminOnly || (action.adminOnly && (user?.role === 'admin' || user?.role === 'gerente'))
  );

  // Formatear fecha y hora
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Obtener productos con stock bajo
  const getLowStockItems = () => {
    return stock.filter(item => {
      if (item.unidad === "piezas") {
        return item.cantidad <= 10;
      } else {
        return item.cantidad <= 500;
      }
    }).slice(0, 5); // Solo mostrar top 5
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200'
      }`}>
        <div className={`${
          theme === 'dark' 
            ? 'bg-slate-800/95 border-amber-600/30 text-amber-100' 
            : 'bg-white/95 border-slate-300 text-slate-700'
        } backdrop-blur-sm rounded-2xl shadow-xl p-8 border`}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
            <p className="font-medium">
              {t.loading}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------- Lo que se va a mostrar en pantalla -------------
  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200'
    }`}>
      
      {/* Header compacto - REDUCIDO */}
      <div className="relative">
      <div className={`${
  theme === 'dark' 
    ? 'bg-gradient-to-r from-slate-800/95 to-slate-700/95 border-slate-600/30'
    : 'bg-gradient-to-r from-amber-700 via-amber-800 to-orange-700 border-amber-900/30'
} backdrop-blur-sm border-b`}>
          
          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              
              {/* Info usuario */}
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-base font-semibold text-white">
                    {t.title}
                  </h1>
                  <p className="text-slate-200 text-xs">
                    {user?.nombre} • {user?.role}
                  </p>
                </div>
              </div>

              {/* Fecha y hora en tiempo real */}
              <div className="text-right">
                <div className="text-white font-medium text-sm">
                  {formatTime(currentTime)}
                </div>
                <div className="text-slate-200 text-xs">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-7">
        
        {/* Botón principal de venta rápida - Ancho completo */}
        <div className="mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <button
              onClick={handleNewSale}
              className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/30 p-3 rounded-xl">
                    <svg className="w-8 h-8 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-50 mb-1">
                      {t.sellNow}
                    </h2>
                    <p className="text-green-100 opacity-90">
                      {t.quickSale}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center">
                  <svg className="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Layout principal - 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          
          {/* Estadísticas del día - 2/3 */}
          <div className="lg:col-span-2">
            <h2 className={`text-xl font-semibold mb-4 text-center ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
            }`}>
              {t.salesToday}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Ventas del día */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-sm opacity-90">{t.totalEarned}</span>
                </div>
                <p className="text-2xl font-bold mb-1">${todayStats.totalRevenue}</p>
                <p className="text-sm opacity-80">{todayStats.totalOrders} órdenes completadas</p>
              </div>

              {/* Productos vendidos */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-sm opacity-90">Ventas</span>
                </div>
                <p className="text-2xl font-bold mb-1">{todayStats.totalSales}</p>
                <p className="text-sm opacity-80">Transacciones hoy</p>
              </div>
            </div>
          </div>

          {/* Productos más vendidos REALES - 1/3 */}
          <div className="lg:col-span-1">
            <h3 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
            }`}>
              {t.bestSellers}
            </h3>
            
            {topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div key={index} className={`${
                    theme === 'dark' 
                      ? 'bg-slate-800/95 border-slate-600/30 text-slate-100' 
                      : 'bg-white border-slate-300 text-slate-700'
                  } rounded-lg p-3 border transform hover:scale-105 transition-all duration-300 shadow-sm`}>
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {product.nombre}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-green-600 font-semibold">
                            {product.totalSold} {t.sold}
                          </span>
                          <span className="text-xs text-amber-600">
                            ${product.totalRevenue} {t.totalSold}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className={`${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-slate-600/30 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-600'
                } rounded-lg p-4 border`}>
                  <svg className="w-8 h-8 mx-auto mb-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm">{t.noSales}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-4">
          <h2 className={`text-xl font-semibold mb-3 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
          }`}>
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group relative"
              >
                <div className={`bg-gradient-to-r ${action.color} rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg border border-white/30">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm opacity-80">{action.subtitle}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Estado del Stock - Compacto al final */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
            }`}>
              {t.stockStatus}
            </h2>
            <button
              onClick={() => setCurrentPage('stock')}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              {t.viewAll} →
            </button>
          </div>
          
          <div className={`${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-slate-600/30' 
              : 'bg-white/80 border-slate-300'
          } rounded-xl p-3 border backdrop-blur-sm shadow-sm`}>
            
            {todayStats.lowStock > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className={`font-medium text-sm ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                  }`}>
                    {t.lowStockItems} ({todayStats.lowStock})
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {getLowStockItems().map((item, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <h4 className="font-medium text-red-800 text-sm">{item.producto}</h4>
                      <p className="text-xs text-red-600">
                        {item.cantidad} {item.unidad}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <svg className="w-6 h-6 mx-auto mb-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-600'
                }`}>
                  Stock en buen estado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información del catálogo - Minimalista al final */}
        <div>
          <div className={`${
            theme === 'dark' 
              ? 'bg-slate-800/30 border-slate-600/20' 
              : 'bg-white/60 border-slate-300'
          } rounded-lg p-3 border backdrop-blur-sm shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-amber-600/20' : 'bg-amber-100'
                }`}>
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-medium text-sm ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                  }`}>
                    {t.catalogInfo}
                  </h3>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {products.length} {t.totalProducts}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setCurrentPage('products')}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium px-2 py-1 rounded-lg border border-amber-600/30 hover:bg-amber-600/10 transition-colors"
              >
                {t.viewAll}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Venta Directa */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${
            theme === 'dark' 
              ? 'bg-slate-800 text-slate-100' 
              : 'bg-white text-slate-700'
          } rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
              <h2 className="text-xl font-bold">{t.newSale}</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* Productos disponibles */}
              <div>
                <h3 className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                }`}>{t.availableProducts}</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {products.map(product => (
                    <div key={product._id} className={`border rounded-lg p-3 transition-colors ${
                      theme === 'dark' 
                        ? 'border-slate-600 hover:bg-slate-700' 
                        : 'border-slate-300 hover:bg-slate-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`font-medium ${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                          }`}>{product.nombre}</h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>${product.precio}</p>
                        </div>
                        <button
                          onClick={() => addToCart(product._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          {t.addToCart}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrito */}
              <div>
                <h3 className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                }`}>{t.cart}</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <p>{t.emptyCart}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.producto_id} className={`border rounded-lg p-3 ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-slate-50 border-slate-300'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium ${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                          }`}>{item.nombre}</h4>
                          <button
                            onClick={() => setCart(cart.filter(i => i.producto_id !== item.producto_id))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(item.producto_id, item.cantidad - 1)}
                              className={`w-6 h-6 rounded flex items-center justify-center text-sm ${
                                theme === 'dark' 
                                  ? 'bg-slate-600 text-slate-100' 
                                  : 'bg-gray-200 text-slate-700'
                              }`}
                            >
                              -
                            </button>
                            <span className={`w-8 text-center text-sm ${
                              theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
                            }`}>{item.cantidad}</span>
                            <button
                              onClick={() => updateCartQuantity(item.producto_id, item.cantidad + 1)}
                              className={`w-6 h-6 rounded flex items-center justify-center text-sm ${
                                theme === 'dark' 
                                  ? 'bg-slate-600 text-slate-100' 
                                  : 'bg-gray-200 text-slate-700'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                            }`}>${item.precio_unitario} c/u</p>
                            <p className="font-bold text-amber-600">${item.subtotal}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className={theme === 'dark' ? 'text-slate-100' : 'text-slate-700'}>{t.total}:</span>
                        <span className="text-green-600">${calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className={`px-6 py-4 flex gap-3 ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
            }`}>
              <button
                onClick={() => {
                  setShowSaleModal(false);
                  setCart([]);
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 hover:bg-slate-500 text-slate-100' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t.completeSale} (${calculateTotal()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}