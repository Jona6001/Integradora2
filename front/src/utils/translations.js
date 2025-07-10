export const translations = {
  es: {
    // Dashboard
    welcome: "¡Bienvenido",
    dashboardTitle: "Panel de Control - Lonches El Primo",
    quickActions: "Acciones Rápidas",
    todayStats: "Estadísticas de Hoy",
    
    // Stats
    salesToday: "Ventas Hoy",
    totalEarned: "Total recaudado",
    orders: "Órdenes",
    activeToday: "Activas hoy",
    products: "Productos",
    available: "Disponibles",
    lowStock: "Stock Bajo",
    toRestock: "Por reponer",
    
    // Actions
    sellLonches: "Vender Lonches",
    createNewSale: "Crear nueva venta - ¡Haz clic aquí!",
    manageInventory: "Gestionar Inventario",
    stockControl: "Control de stock",
    manageProducts: "Gestionar Productos",
    lonchesCatalog: "Catálogo de lonches",
    manageUsers: "Gestionar Usuarios",
    workTeam: "Equipo de trabajo",
    
    // Products
    bestSellers: "Productos Más Vendidos del Día",
    noProducts: "No hay productos disponibles",
    addProducts: "Agregar Productos",
    sales: "ventas",
    
    // Settings
    settings: "Configuración",
    theme: "Tema",
    language: "Idioma",
    notifications: "Notificaciones",
    autoRefresh: "Actualización Automática",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    spanish: "Español",
    english: "Inglés",
    
    // Buttons
    save: "Guardar",
    cancel: "Cancelar",
    close: "Cerrar",
    refresh: "Actualizar",
    
    // Loading
    loading: "Cargando dashboard...",
    
    // System
    salesSystemActive: "Sistema de ventas activo",
    updateData: "Actualizar datos"
  },
  en: {
    // Dashboard
    welcome: "Welcome",
    dashboardTitle: "Control Panel - Lonches El Primo",
    quickActions: "Quick Actions",
    todayStats: "Today's Statistics",
    
    // Stats
    salesToday: "Sales Today",
    totalEarned: "Total earned",
    orders: "Orders",
    activeToday: "Active today",
    products: "Products",
    available: "Available",
    lowStock: "Low Stock",
    toRestock: "To restock",
    
    // Actions
    sellLonches: "Sell Lonches",
    createNewSale: "Create new sale - Click here!",
    manageInventory: "Manage Inventory",
    stockControl: "Stock control",
    manageProducts: "Manage Products",
    lonchesCatalog: "Lonches catalog",
    manageUsers: "Manage Users",
    workTeam: "Work team",
    
    // Products
    bestSellers: "Best Selling Products Today",
    noProducts: "No products available",
    addProducts: "Add Products",
    sales: "sales",
    
    // Settings
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    notifications: "Notifications",
    autoRefresh: "Auto Refresh",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    spanish: "Spanish",
    english: "English",
    
    // Buttons
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    refresh: "Refresh",
    
    // Loading
    loading: "Loading dashboard...",
    
    // System
    salesSystemActive: "Sales system active",
    updateData: "Update data"
  }
};

export const useTranslation = (language) => {
  const t = (key) => {
    return translations[language]?.[key] || key;
  };
  
  return { t };
};