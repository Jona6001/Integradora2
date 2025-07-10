import { API_ENDPOINTS } from '../config/api.js';

class ApiService {
  async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Agregar token si existe
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos para usuarios
  async login(credentials) {
    return this.request(API_ENDPOINTS.USERS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getAllUsers() {
    return this.request(API_ENDPOINTS.USERS.GET_ALL);
  }

  async createUser(userData) {
    return this.request(API_ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(API_ENDPOINTS.USERS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(API_ENDPOINTS.USERS.DELETE(id), {
      method: 'DELETE'
    });
  }

  async recoverPassword(email) {
    return this.request(API_ENDPOINTS.USERS.RECOVER_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Métodos para productos
  async getAllProducts() {
    return this.request(API_ENDPOINTS.PRODUCTS.GET_ALL);
  }

  async getProductById(id) {
    return this.request(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
  }

  async createProduct(productData) {
    return this.request(API_ENDPOINTS.PRODUCTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(API_ENDPOINTS.PRODUCTS.DELETE(id), {
      method: 'DELETE'
    });
  }

  // Métodos para stock
  async getAllStock() {
    return this.request(API_ENDPOINTS.STOCK.GET_ALL);
  }

  async getStockById(id) {
    return this.request(API_ENDPOINTS.STOCK.GET_BY_ID(id));
  }

  async createStock(stockData) {
    return this.request(API_ENDPOINTS.STOCK.CREATE, {
      method: 'POST',
      body: JSON.stringify(stockData)
    });
  }

  async updateStock(id, stockData) {
    return this.request(API_ENDPOINTS.STOCK.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(stockData)
    });
  }

  async deleteStock(id) {
    return this.request(API_ENDPOINTS.STOCK.DELETE(id), {
      method: 'DELETE'
    });
  }

  // Métodos para ventas
  async getAllSells() {
    return this.request(API_ENDPOINTS.SELLS.GET_ALL);
  }

  async getSellById(id) {
    return this.request(API_ENDPOINTS.SELLS.GET_BY_ID(id));
  }

  async createSell(sellData) {
    return this.request(API_ENDPOINTS.SELLS.CREATE, {
      method: 'POST',
      body: JSON.stringify(sellData)
    });
  }

  async updateSell(id, sellData) {
    return this.request(API_ENDPOINTS.SELLS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(sellData)
    });
  }

  async deleteSell(id) {
    return this.request(API_ENDPOINTS.SELLS.DELETE(id), {
      method: 'DELETE'
    });
  }
}

export default new ApiService();