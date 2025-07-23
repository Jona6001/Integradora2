import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import Swal from 'sweetalert2';

type Product = {
  _id: string;
  nombre: string;
  precio: number;
  imagen?: string;
};

type CartItem = {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  extraIngredients?: ExtraIngredient[]; 
  imagen?: string;
};

type ExtraIngredient = {
  name: string;
  price: number;
  icon: string;
  quantity: number;
};

const TORTA_NAMES = [
  "Torta de Adobada SENCILLA", "Torta de Adobada MIXTO", "Torta de Adobada TRIPLE",
  "Torta de Asada SENCILLA", "Torta de Asada MIXTO", "Torta de Asada TRIPLE",
  "Torta de Pierna SENCILLA", "Torta de Pierna MIXTO", "Torta de Pierna TRIPLE",
  "Torta de Jamón SENCILLA", "Torta de Jamón MIXTO", "Torta de Jamón TRIPLE"
];

// Helper function to check if a product is a torta
const isTorta = (nombre: string) => TORTA_NAMES.includes(nombre);

const EXTRA_INGREDIENTS: ExtraIngredient[] = [
  { name: "Queso", price: 5, icon: "🧀", quantity: 0 },
  { name: "Jamón", price: 5, icon: "🥓", quantity: 0 },
  { name: "Aguacate", price: 5, icon: "🥑", quantity: 0 },
  { name: "Queso de Puerco", price: 5, icon: "🧀", quantity: 0 },
  { name: "Mortadela", price: 5, icon: "🥩", quantity: 0 },
  { name: "Queso Amarillo", price: 5, icon: "🧀", quantity: 0 },
  { name: "Asada", price: 5, icon: "🥩", quantity: 0 },
  { name: "Pierna", price: 5, icon: "🍗", quantity: 0 },
  { name: "Adobada", price: 5, icon: "🌶️", quantity: 0 },
  { name: "Cebolla", price: 5, icon: "🧅", quantity: 0 },
  { name: "Tomate", price: 5, icon: "🍅", quantity: 0 },
  { name: "Chile", price: 5, icon: "🌶️", quantity: 0 }
];

export default function DashboardPage({ user, setCurrentPage }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [sells, setSells] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{[productId: string]: string[]}>({});
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
        // Buscar la imagen del producto en la lista de productos
        const productInfo = products.find(p => p.nombre === productName);
        if (productSales[productName]) {
        productSales[productName].totalSold += producto.cantidad;
        productSales[productName].totalRevenue += producto.subtotal;
        } else {
        productSales[productName] = {
          nombre: productName,
          totalSold: producto.cantidad,
          totalRevenue: producto.subtotal,
          precio: producto.precio_unitario,
          imagen: productInfo?.imagen // Agrega la imagen si existe
        };
        }
      });
      }
    });
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
      loading: "Cargando Inicio...",
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
      loading: "Loading Home...",
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
const addToCart = (productId: string, extraIngredients: ExtraIngredient[] = []) => {
  const product = products.find(p => p._id === productId);
  if (!product) return;

  // Solo fusiona si el producto y los ingredientes extra son iguales
  const existingItem = cart.find(item =>
    item.producto_id === product._id &&
    JSON.stringify(item.extraIngredients || []) === JSON.stringify(extraIngredients || [])
  );

  const isTortaProduct = isTorta(product.nombre);

  if (existingItem) {
    const newQuantity = existingItem.cantidad + 1;
    setCart(cart.map(item =>
      item.producto_id === product._id &&
      JSON.stringify(item.extraIngredients || []) === JSON.stringify(extraIngredients || [])
        ? {
            ...item,
            cantidad: newQuantity,
            subtotal: (newQuantity * item.precio_unitario) +
              ((item.extraIngredients as ExtraIngredient[] | undefined)?.reduce((sum, extra) => sum + (extra.price * extra.quantity * newQuantity), 0) || 0)
          }
        : item
    ));
  } else {
    setCart([...cart, {
      producto_id: product._id,
      nombre: product.nombre,
      cantidad: 1,
      precio_unitario: product.precio,
      subtotal: product.precio +
        ((extraIngredients as ExtraIngredient[]).reduce((sum, extra) => sum + (extra.price * extra.quantity), 0) || 0),
      imagen: product.imagen,
      extraIngredients: isTortaProduct ? extraIngredients : []
    }]);
  }
};

   const addExtraIngredient = (productId, ingredient) => {
  setCart(prevCart => {
    // Busca el item original
    const item = prevCart.find(i => i.producto_id === productId);
    if (!item) return prevCart;

    // Crea el nuevo array de ingredientes extra
    let updatedExtras;
    const existingExtra = item.extraIngredients?.find(extra => extra.name === ingredient.name);
    if (existingExtra) {
      updatedExtras = (item.extraIngredients ?? []).map(extra =>
        extra.name === ingredient.name
          ? { ...extra, quantity: extra.quantity + 1 }
          : extra
      );
    } else {
      updatedExtras = [...(item.extraIngredients || []), { ...ingredient, quantity: 1 }];
    }

    // Si ya existe una torta con esa combinación de ingredientes, suma cantidad
    const alreadyExists = prevCart.find(i =>
      i.producto_id === item.producto_id &&
      JSON.stringify(i.extraIngredients || []) === JSON.stringify(updatedExtras)
    );
    if (alreadyExists) {
      return prevCart.map(i =>
        i.producto_id === item.producto_id &&
        JSON.stringify(i.extraIngredients || []) === JSON.stringify(updatedExtras)
          ? { ...i, cantidad: i.cantidad + 1, subtotal: ((i.cantidad + 1) * i.precio_unitario) + updatedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity * (i.cantidad + 1)), 0) }
          : i
      ).filter(i =>
        !(i.producto_id === item.producto_id &&
          JSON.stringify(i.extraIngredients || []) === JSON.stringify(item.extraIngredients || []) &&
          i.cantidad === 1)
      );
    } else {
      // Quita una unidad del item original y agrega el nuevo item con los ingredientes extra
      const newCart = prevCart.map(i =>
        i.producto_id === item.producto_id &&
        JSON.stringify(i.extraIngredients || []) === JSON.stringify(item.extraIngredients || [])
          ? { ...i, cantidad: i.cantidad - 1, subtotal: ((i.cantidad - 1) * i.precio_unitario) + (i.extraIngredients ?? []).reduce((sum, extra) => sum + (extra.price * extra.quantity * (i.cantidad - 1)), 0) }
          : i
      ).filter(i => i.cantidad > 0);

      return [
        ...newCart,
        {
          ...item,
          cantidad: 1,
          extraIngredients: updatedExtras,
          subtotal: item.precio_unitario + updatedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
        }
      ];
    }
  });
};
  
const removeExtraIngredient = (productId, ingredientName) => {
  setCart(prevCart => {
    const item = prevCart.find(i => i.producto_id === productId);
    if (!item) return prevCart;

    // Quita el ingrediente
    const updatedExtras = (item.extraIngredients ?? [])
      .map(extra =>
        extra.name === ingredientName
          ? { ...extra, quantity: Math.max(0, extra.quantity - 1) }
          : extra
      )
      .filter(extra => extra.quantity > 0);

    // Si ya existe una torta con esa combinación, suma cantidad
    const alreadyExists = prevCart.find(i =>
      i.producto_id === item.producto_id &&
      JSON.stringify(i.extraIngredients || []) === JSON.stringify(updatedExtras)
    );
    if (alreadyExists) {
      return prevCart.map(i =>
        i.producto_id === item.producto_id &&
        JSON.stringify(i.extraIngredients || []) === JSON.stringify(updatedExtras)
          ? { ...i, cantidad: i.cantidad + 1, subtotal: ((i.cantidad + 1) * i.precio_unitario) + updatedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity * (i.cantidad + 1)), 0) }
          : i
      ).filter(i =>
        !(i.producto_id === item.producto_id &&
          JSON.stringify(i.extraIngredients || []) === JSON.stringify(item.extraIngredients || []) &&
          i.cantidad === 1)
      );
    } else {
      // Quita una unidad del item original y agrega el nuevo item con los ingredientes extra
      const newCart = prevCart.map(i =>
        i.producto_id === item.producto_id &&
        JSON.stringify(i.extraIngredients || []) === JSON.stringify(item.extraIngredients || [])
          ? { ...i, cantidad: i.cantidad - 1, subtotal: ((i.cantidad - 1) * i.precio_unitario) + (i.extraIngredients ?? []).reduce((sum, extra) => sum + (extra.price * extra.quantity * (i.cantidad - 1)), 0) }
          : i
      ).filter(i => i.cantidad > 0);

      return [
        ...newCart,
        {
          ...item,
          cantidad: 1,
          extraIngredients: updatedExtras,
          subtotal: item.precio_unitario + updatedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0)
        }
      ];
    }
  });
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
  if (cart.length === 0) {
    Swal.fire('Carrito vacío', 'Agrega al menos un producto al carrito', 'warning');
    return;
  }
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
    loadDashboardData();
    Swal.fire('Venta creada', 'Venta creada exitosamente y stock actualizado', 'success');
  } catch (error) {
    console.error('Error creando venta:', error);
    Swal.fire('Error', 'Error al crear la venta', 'error');
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
      theme === "dark"
        ? "bg-gradient-to-br from-slate-900 to-slate-800"
        : "bg-gradient-to-br from-primary to-secondary"
    }`}>
      <div className={`${
        theme === "dark"
          ? "bg-slate-800/95 border-amber-600/30 text-amber-100"
          : "bg-white/95 border-slate-300 text-slate-700"
      } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mb-4"></div>
          <p className={`text-center mt-4 font-semibold ${
            theme === "dark" ? "text-amber-400" : "text-primary"
          }`}>
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
      
      {/* Header */}
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
        
        {/* Botón principal de venta rápida */}
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
                  <div key={product.nombre} className={`${
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
  <h2 className={`text-2xl font-bold mb-6 text-center ${
    theme === 'dark' ? 'text-amber-300 drop-shadow' : 'text-amber-700 drop-shadow'
  }`}>
    {t.quickActions}
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {filteredActions.map((action) => (
      <button
        key={action.title}
        onClick={action.action}
        className={`group relative rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-2xl
          border-4
          ${theme === 'dark'
            ? 'border-[#2a170a] bg-gradient-to-br from-[#3a220e] via-[#6b3f1e] to-[#2a170a]'
            : 'border-[#4e2e0e] bg-gradient-to-br from-[#b97a3a] via-[#8d5524] to-[#4e2e0e]'}
        `}
        style={{ minHeight: "140px" }}
      >
        <div className="flex flex-col items-center justify-center h-full p-7 gap-4">
          <div className={`p-5 rounded-full border-2 shadow-lg flex items-center justify-center
            ${theme === 'dark'
              ? 'bg-amber-900/40 border-amber-700'
              : 'bg-amber-200/60 border-amber-400'}
          `}>
            {action.icon}
          </div>
          <div className="text-center">
            <h3 className={`text-xl font-extrabold mb-1 drop-shadow
              ${theme === 'dark' ? 'text-amber-200' : 'text-white'}
            `}>
              {action.title}
            </h3>
            <p className={`text-base font-medium
              ${theme === 'dark' ? 'text-amber-100 opacity-90' : 'text-amber-50 opacity-95'}
            `}>
              {action.subtitle}
            </p>
          </div>
        </div>
        {/* Glow madera más oscuro */}
        <div className="absolute inset-0 pointer-events-none animate-wood-glow"></div>
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
                  {getLowStockItems().map((item) => (
                    <div key={item.producto} className="bg-red-50 border border-red-200 rounded-lg p-2">
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

        {/* Información del catálogo  */}
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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
    <div className={`${
      theme === 'dark' 
        ? 'bg-slate-800 text-slate-100' 
        : 'bg-white text-slate-700'
    } rounded-xl shadow-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col`}>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <h2 className="text-xl font-bold">{t.newSale}</h2>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">

        <div>
          <h3 className={`font-semibold mb-3 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-700'
          }`}>{t.availableProducts}</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">


            
            {products.map(product => (
              <div key={product._id} className={`border rounded-lg p-2 flex gap-2 items-center transition-colors ${
                theme === 'dark' 
                  ? 'border-slate-600 hover:bg-slate-700' 
                  : 'border-slate-300 hover:bg-slate-50'
              }`}>
                <div>
                  {product.imagen ? (
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-700'}`}>{product.nombre}</h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>${product.precio}</p>
                </div>
                <button
                  onClick={() => addToCart(product._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  {t.addToCart}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-700'}`}>{t.cart}</h3>
          {cart.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <div className="text-3xl mb-2">
                <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <p>{t.emptyCart}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {cart.map(item => {
                const isTorta = TORTA_NAMES.includes(item.nombre);
                const requiredIngredients = [];

                function updateCartQuantity(producto_id: string, newQuantity: number): void {
                  if (newQuantity < 1) {
                    setCart(cart.filter(item => item.producto_id !== producto_id));
                    return;
                  }
                  setCart(cart.map(item => {
                    if (item.producto_id === producto_id) {
                      const extraCost = (item.extraIngredients ?? []).reduce(
                        (sum, extra) => sum + (extra.price * extra.quantity * newQuantity),
                        0
                      );
                      return {
                        ...item,
                        cantidad: newQuantity,
                        subtotal: (newQuantity * item.precio_unitario) + extraCost
                      };
                    }
                    return item;
                  }));
                }

                return (
                  <div key={item.producto_id} className="border rounded-lg p-3 flex gap-2 items-center">
                    <div>
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="w-10 h-10 rounded-full object-cover border" />
                      ) : (
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <h4 className="font-medium text-sm">{item.nombre}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => updateCartQuantity(item.producto_id, item.cantidad - 1)} className="w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold transition bg-gray-200 text-gray-800 hover:bg-primary hover:text-white">-</button>
                        <span className="w-6 text-center text-sm">{item.cantidad}</span>
                        <button onClick={() => updateCartQuantity(item.producto_id, item.cantidad + 1)} className="w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold transition bg-gray-200 text-gray-800 hover:bg-primary hover:text-white">+</button>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-600">${item.precio_unitario} base</p>
                        <p className="font-bold">${item.subtotal}</p>
                      </div>
                      {isTorta && (
                        <div className="border-t pt-2">
                          <h5 className="text-xs font-semibold mb-1">🌶️ Ingredientes Extra (+$5 c/u)</h5>
                          {item.extraIngredients && item.extraIngredients.length > 0 && (
                            <div className="mb-1">
                              <div className="flex flex-wrap gap-1">
                                {item.extraIngredients.map(extra => (
                                  <span key={extra.name} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                    {extra.icon} {extra.name} x{extra.quantity}
                                    <button onClick={() => removeExtraIngredient(item.producto_id, extra.name)} className="ml-1 font-bold text-red-500 hover:text-red-700">✕</button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-1">
                            {EXTRA_INGREDIENTS.map(ingredient => (
                              <button key={ingredient.name} onClick={() => addExtraIngredient(item.producto_id, ingredient)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100 transition border border-blue-200">
                                {ingredient.icon} {ingredient.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setCart(cart.filter(i => i.producto_id !== item.producto_id))} className="ml-1 text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center text-base font-bold">
                  <span className={theme === 'dark' ? 'text-slate-100' : 'text-slate-700'}>{t.total}:</span>
                  <span className="text-green-600">${calculateTotal()}</span>
                </div>
              </div>
            </div>
          )}

          <div className={`sticky bottom-0 left-0 right-0 px-1 py-1 flex gap-2 z-40
            ${theme === 'dark' ? 'bg-slate-800/95 border-t border-slate-500' : 'bg-white/95 border-t border-gray-200'}
          `}>
            <button type="button" onClick={() => { setShowSaleModal(false); setCart([]); }} className={`flex-1 py-1 rounded-md font-semibold text-xs transition-all duration-200 shadow hover:scale-105 ${
              theme === 'dark'
                ? 'bg-slate-600 hover:bg-slate-500 text-slate-100 border border-slate-700'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300'
            }`}>
              <span className="flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t.cancel}
              </span>
            </button>

            <button type="button" onClick={handleCompleteSale} disabled={cart.length === 0} className={`flex-1 py-1 rounded-md font-semibold text-xs transition-all duration-200 shadow hover:scale-105 ${
              cart.length === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-green-700 hover:bg-green-600 text-white border border-green-900'
                  : 'bg-green-600 hover:bg-green-700 text-white border border-green-700'
            }`}>
              <span className="flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.completeSale} (${calculateTotal()})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}