// Detectar si estamos en desarrollo local o móvil
const getApiBaseUrl = () => {
  // En desarrollo, detectar si es localhost o IP
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:6001';
  } else {
    // 👈 CAMBIA ESTA IP POR LA TUYA (ejecuta 'ipconfig' para obtenerla)
    return 'http://192.168.1.74:6001'; // Ejemplo: 'http://192.168.1.100:6001'
  }
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Usuarios
  USERS: {
    LOGIN: `${API_BASE_URL}/int/user/login`,
    GET_ALL: `${API_BASE_URL}/int/user/all`,
    CREATE: `${API_BASE_URL}/int/user/save`,
    UPDATE: (id) => `${API_BASE_URL}/int/user/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/int/user/delete/${id}`,
    RECOVER_PASSWORD: `${API_BASE_URL}/int/user/recover-pass`
  },
  // Productos
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/int/products/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/int/products/find/${id}`,
    CREATE: `${API_BASE_URL}/int/products/save`,
    UPDATE: (id) => `${API_BASE_URL}/int/products/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/int/products/delete/${id}`
  },
  // Stock
  STOCK: {
    GET_ALL: `${API_BASE_URL}/int/stock/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/int/stock/find/${id}`,
    CREATE: `${API_BASE_URL}/int/stock/save`,
    UPDATE: (id) => `${API_BASE_URL}/int/stock/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/int/stock/delete/${id}`
  },
  // Ventas
  SELLS: {
    GET_ALL: `${API_BASE_URL}/int/sells/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/int/sells/find/${id}`,
    CREATE: `${API_BASE_URL}/int/sells/save`,
    UPDATE: (id) => `${API_BASE_URL}/int/sells/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/int/sells/delete/${id}`
  }
};