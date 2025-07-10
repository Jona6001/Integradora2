import React, { useState, useEffect } from "react";
import apiService from "../services/api";

export default function StockPage({ setCurrentPage }) {
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [stockAlert, setStockAlert] = useState("todos");
  const [newStock, setNewStock] = useState({
    _id: "",
    producto: "",
    cantidad: "",
    unidad: "piezas",
    status: "activo"
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStock();
  }, [stock, searchTerm, selectedUnit, selectedStatus, stockAlert]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockResponse, productsResponse] = await Promise.all([
        apiService.getAllStock(),
        apiService.getAllProducts()
      ]);
      
      if (stockResponse.stockList) {
        setStock(stockResponse.stockList);
      }
      if (productsResponse.productsList) {
        setProducts(productsResponse.productsList);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStock = () => {
    let filtered = [...stock];

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item =>
        item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item._id.toString().includes(searchTerm)
      );
    }

    // Filtrar por unidad
    if (selectedUnit !== "todos") {
      filtered = filtered.filter(item => item.unidad === selectedUnit);
    }

    // Filtrar por status
    if (selectedStatus !== "todos") {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Filtrar por alertas de stock
    if (stockAlert === "bajo") {
      filtered = filtered.filter(item => {
        if (item.unidad === "piezas") {
          return item.cantidad <= 10; // Stock bajo para bebidas/piezas
        } else {
          return item.cantidad <= 500; // Stock bajo para gramos
        }
      });
    } else if (stockAlert === "agotado") {
      filtered = filtered.filter(item => item.cantidad === 0);
    }

    setFilteredStock(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedUnit("todos");
    setSelectedStatus("todos");
    setStockAlert("todos");
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    try {
      const stockData = {
        _id: parseInt(newStock._id),
        producto: newStock.producto,
        cantidad: parseFloat(newStock.cantidad),
        unidad: newStock.unidad,
        status: newStock.status
      };
      
      await apiService.createStock(stockData);
      setNewStock({ _id: "", producto: "", cantidad: "", unidad: "piezas", status: "activo" });
      setShowCreateModal(false);
      loadData();
      alert('Producto de stock creado exitosamente');
    } catch (error) {
      console.error('Error creando stock:', error);
      alert('Error al crear producto de stock. Revisa que el ID no esté duplicado.');
    }
  };

  const handleEditStock = async (e) => {
    e.preventDefault();
    try {
      const stockData = {
        producto: selectedStock.producto,
        cantidad: parseFloat(selectedStock.cantidad),
        unidad: selectedStock.unidad,
        status: selectedStock.status
      };
      
      await apiService.updateStock(selectedStock._id, stockData);
      setShowEditModal(false);
      setSelectedStock(null);
      loadData();
      alert('Stock actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar stock.');
    }
  };

  const handleDeleteStock = async () => {
    try {
      await apiService.deleteStock(selectedStock._id);
      setShowDeleteModal(false);
      setSelectedStock(null);
      loadData();
      alert('Producto de stock eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando stock:', error);
      alert('Error al eliminar producto de stock.');
    }
  };

  const openEditModal = (stockItem) => {
    setSelectedStock({ ...stockItem });
    setShowEditModal(true);
  };

  const openDeleteModal = (stockItem) => {
    setSelectedStock(stockItem);
    setShowDeleteModal(true);
  };

  const getStockStatus = (cantidad, unidad) => {
    if (cantidad === 0) {
      return { status: 'agotado', color: 'bg-red-100 text-red-800', icon: '🚫' };
    } else if (unidad === "piezas" && cantidad <= 10) {
      return { status: 'bajo', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else if (unidad === "gramos" && cantidad <= 500) {
      return { status: 'bajo', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else {
      return { status: 'bueno', color: 'bg-green-100 text-green-800', icon: '✅' };
    }
  };

  const getUnitIcon = (unidad) => {
    return unidad === "piezas" ? "🥤" : "⚖️";
  };

  const isCountableProduct = (producto) => {
    // Productos contables son principalmente bebidas y algunos ingredientes específicos
    const countableKeywords = ['agua', 'refresco', 'jugo', 'bebida', 'leche', 'yogurt'];
    return countableKeywords.some(keyword => 
      producto.toLowerCase().includes(keyword)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-primary font-semibold">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              📦 Gestión de Stock
            </h1>
            <p className="text-white/70">Control de inventario y productos contables</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
          >
            ➕ Agregar al Stock
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Barra de búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2">🔍 Buscar en stock</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por producto o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-white/60">🔍</span>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por unidad */}
            <div>
              <label className="block text-white font-semibold mb-2">📏 Unidad</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              >
                <option value="todos" className="text-gray-800">🌟 Todas</option>
                <option value="piezas" className="text-gray-800">🥤 Piezas</option>
                <option value="gramos" className="text-gray-800">⚖️ Gramos</option>
              </select>
            </div>

            {/* Filtro por status */}
            <div>
              <label className="block text-white font-semibold mb-2">⚡ Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              >
                <option value="todos" className="text-gray-800">🌟 Todos</option>
                <option value="activo" className="text-gray-800">✅ Activos</option>
                <option value="inactivo" className="text-gray-800">❌ Inactivos</option>
              </select>
            </div>

            {/* Filtro por alertas */}
            <div>
              <label className="block text-white font-semibold mb-2">🚨 Alertas</label>
              <select
                value={stockAlert}
                onChange={(e) => setStockAlert(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              >
                <option value="todos" className="text-gray-800">🌟 Todos</option>
                <option value="bajo" className="text-gray-800">⚠️ Stock Bajo</option>
                <option value="agotado" className="text-gray-800">🚫 Agotados</option>
              </select>
            </div>
          </div>

          {/* Resultados y botón limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-white/20">
            <div className="text-white/80 mb-2 sm:mb-0">
              <span className="font-semibold">{filteredStock.length}</span> producto{filteredStock.length !== 1 ? 's' : ''} en stock
              {searchTerm && (
                <span className="ml-2">para "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
            {(searchTerm || selectedUnit !== "todos" || selectedStatus !== "todos" || stockAlert !== "todos") && (
              <button
                onClick={clearFilters}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 font-semibold"
              >
                🧹 Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStock.map((item, index) => {
            const stockStatus = getStockStatus(item.cantidad, item.unidad);
            const isCountable = isCountableProduct(item.producto);
            
            return (
              <div key={item._id} className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${isCountable ? 'ring-2 ring-blue-300' : ''}`}>
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Badges superiores */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                      {stockStatus.icon} {stockStatus.status}
                    </span>
                  </div>

                  {/* Indicador de producto contable */}
                  {isCountable && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        📊 Contable
                      </span>
                    </div>
                  )}

                  {/* Cantidad grande */}
                  <div className="absolute bottom-4 right-4 text-white">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{item.cantidad}</div>
                      <div className="text-sm opacity-80">{getUnitIcon(item.unidad)} {item.unidad}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {item.producto}
                    </h3>
                    <span className="text-sm text-gray-500">#{item._id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Actualizado: {new Date(item.actualizadoEn).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition font-semibold"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => openDeleteModal(item)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition font-semibold"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estado vacío cuando no hay resultados */}
        {filteredStock.length === 0 && stock.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white text-xl mb-4">No se encontraron productos</p>
              <p className="text-white/70 mb-4">
                {searchTerm && `con el término "${searchTerm}"`}
                {selectedUnit !== "todos" && ` en unidad "${selectedUnit}"`}
                {selectedStatus !== "todos" && ` con status "${selectedStatus}"`}
              </p>
              <button
                onClick={clearFilters}
                className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300"
              >
                🧹 Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Estado vacío cuando no hay stock */}
        {stock.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-white text-xl mb-4">No hay productos en stock</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300"
              >
                Agregar primer producto
              </button>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-primary">Agregar al Stock</h2>
              <form onSubmit={handleCreateStock}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">ID del Stock</label>
                  <input
                    type="number"
                    value={newStock._id}
                    onChange={(e) => setNewStock({...newStock, _id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Ej: 1, 2, 3..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Producto</label>
                  <input
                    type="text"
                    value={newStock.producto}
                    onChange={(e) => setNewStock({...newStock, producto: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Ej: Agua de Horchata"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStock.cantidad}
                    onChange={(e) => setNewStock({...newStock, cantidad: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Ej: 50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Unidad</label>
                  <select
                    value={newStock.unidad}
                    onChange={(e) => setNewStock({...newStock, unidad: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="piezas">🥤 Piezas (bebidas, productos contables)</option>
                    <option value="gramos">⚖️ Gramos (ingredientes, condimentos)</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    value={newStock.status}
                    onChange={(e) => setNewStock({...newStock, status: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">❌ Inactivo</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition"
                  >
                    Agregar al Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedStock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-primary">Editar Stock</h2>
              <form onSubmit={handleEditStock}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">ID (No editable)</label>
                  <input
                    type="number"
                    value={selectedStock._id}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Producto</label>
                  <input
                    type="text"
                    value={selectedStock.producto}
                    onChange={(e) => setSelectedStock({...selectedStock, producto: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedStock.cantidad}
                    onChange={(e) => setSelectedStock({...selectedStock, cantidad: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Unidad</label>
                  <select
                    value={selectedStock.unidad}
                    onChange={(e) => setSelectedStock({...selectedStock, unidad: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="piezas">🥤 Piezas</option>
                    <option value="gramos">⚖️ Gramos</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    value={selectedStock.status}
                    onChange={(e) => setSelectedStock({...selectedStock, status: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">❌ Inactivo</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Actualizar Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedStock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-red-600">Eliminar del Stock</h2>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">¿Estás seguro de que deseas eliminar este producto del stock?</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800">#{selectedStock._id} - {selectedStock.producto}</p>
                  <p className="text-gray-600">Cantidad: {selectedStock.cantidad} {selectedStock.unidad}</p>
                  <p className="text-gray-600">Status: {selectedStock.status}</p>
                </div>
                <p className="text-sm text-red-600 mt-2">Esta acción cambiará el status a "inactivo"</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteStock}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}