import React, { useState, useEffect } from "react";
import apiService from "../services/api";

type Product = {
  _id: number | string;
  nombre: string;
  precio: number | string;
  tipo: string;
  status: string;
  creadoEn?: string;
};

export default function ProductsPage({ setCurrentPage }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [newProduct, setNewProduct] = useState<Product>({
    _id: "",
    nombre: "",
    precio: "",
    tipo: "torta",
    status: "activo"
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllProducts();
      if (response.productsList) {
        setProducts(response.productsList);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product._id.toString().includes(searchTerm)
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(product => product.tipo === selectedCategory);
    }

    // Filtrar por status
    if (selectedStatus !== "todos") {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("todos");
    setSelectedStatus("todos");
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        _id: parseInt(String(newProduct._id)),
        nombre: newProduct.nombre,
        precio: parseFloat(String(newProduct.precio)),
        tipo: newProduct.tipo,
        status: newProduct.status
      };
      
      await apiService.createProduct(productData);
      setNewProduct({ _id: "", nombre: "", precio: "", tipo: "torta", status: "activo" });
      setShowCreateModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al crear producto. Revisa que el ID no esté duplicado.');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const productData = {
        nombre: selectedProduct.nombre,
        precio: parseFloat(String(selectedProduct.precio)),
        tipo: selectedProduct.tipo,
        status: selectedProduct.status
      };
      
      await apiService.updateProduct(selectedProduct._id, productData);
      setShowEditModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar producto.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await apiService.deleteProduct(selectedProduct._id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar producto.');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct({ ...product });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getProductTypeIcon = (tipo) => {
    switch(tipo) {
      case 'torta': return '🥪';
      case 'bebida': return '🥤';
      case 'ingrediente': return '🥬';
      default: return '🍽️';
    }
  };

  const getProductTypeColor = (tipo) => {
    switch(tipo) {
      case 'torta': return 'bg-orange-100 text-orange-800';
      case 'bebida': return 'bg-blue-100 text-blue-800';
      case 'ingrediente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-primary font-semibold">Cargando productos...</p>
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
              🍽️ Gestión de Productos
            </h1>
            <p className="text-white/70">Administra el catálogo de lonches</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
          >
            ➕ Agregar Producto
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barra de búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2">🔍 Buscar productos</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
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

            {/* Filtro por categoría */}
            <div>
              <label className="block text-white font-semibold mb-2">📂 Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              >
                <option value="todos" className="text-gray-800">🌟 Todos</option>
                <option value="torta" className="text-gray-800">🥪 Tortas</option>
                <option value="bebida" className="text-gray-800">🥤 Bebidas</option>
                <option value="ingrediente" className="text-gray-800">🥬 Ingredientes</option>
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
          </div>

          {/* Resultados y botón limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-white/20">
            <div className="text-white/80 mb-2 sm:mb-0">
              <span className="font-semibold">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && (
                <span className="ml-2">para "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
            {(searchTerm || selectedCategory !== "todos" || selectedStatus !== "todos") && (
              <button
                onClick={clearFilters}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 font-semibold"
              >
                🧹 Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product._id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1504674900247-0877df9cc836' : '1565299624946-b28f40a0ca4b'}?auto=format&fit=crop&w=600&q=80`}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </div>

                {/* Product Type */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProductTypeColor(product.tipo)}`}>
                    {getProductTypeIcon(product.tipo)} {product.tipo}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {product.nombre}
                  </h3>
                  <span className="text-sm text-gray-500">#{product._id}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">${product.precio}</span>
                  <span className="text-sm text-gray-500">
                    {product.creadoEn ? new Date(product.creadoEn).toLocaleDateString() : ""}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition font-semibold"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => openDeleteModal(product)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition font-semibold"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío cuando no hay resultados */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white text-xl mb-4">No se encontraron productos</p>
              <p className="text-white/70 mb-4">
                {searchTerm && `con el término "${searchTerm}"`}
                {selectedCategory !== "todos" && ` en la categoría "${selectedCategory}"`}
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

        {/* Estado vacío cuando no hay productos */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-white text-xl mb-4">No hay productos registrados</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300"
              >
                Crear primer producto
              </button>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-primary">Crear Nuevo Producto</h2>
              <form onSubmit={handleCreateProduct}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">ID del Producto</label>
                  <input
                    type="number"
                    value={newProduct._id}
                    onChange={(e) => setNewProduct({...newProduct, _id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Ej: 1, 2, 3..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newProduct.nombre}
                    onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Ej: Torta de Jamón"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.precio}
                    onChange={(e) => setNewProduct({...newProduct, precio: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Ej: 35.50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                  <select
                    value={newProduct.tipo}
                    onChange={(e) => setNewProduct({...newProduct, tipo: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="torta">🥪 Torta</option>
                    <option value="bebida">🥤 Bebida</option>
                    <option value="ingrediente">🥬 Ingrediente</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
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
                    Crear Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-primary">Editar Producto</h2>
              <form onSubmit={handleEditProduct}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">ID (No editable)</label>
                  <input
                    type="number"
                    value={selectedProduct._id}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={selectedProduct.nombre}
                    onChange={(e) => setSelectedProduct({...selectedProduct, nombre: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedProduct.precio}
                    onChange={(e) => selectedProduct && setSelectedProduct({ ...selectedProduct, precio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                  <select
                    value={selectedProduct.tipo}
                    onChange={(e) => setSelectedProduct({...selectedProduct, tipo: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="torta">🥪 Torta</option>
                    <option value="bebida">🥤 Bebida</option>
                    <option value="ingrediente">🥬 Ingrediente</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    value={selectedProduct.status}
                    onChange={(e) => setSelectedProduct({...selectedProduct, status: e.target.value})}
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
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-red-600">Eliminar Producto</h2>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">¿Estás seguro de que deseas eliminar este producto?</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800">#{selectedProduct._id} - {selectedProduct.nombre}</p>
                  <p className="text-gray-600">Precio: ${selectedProduct.precio}</p>
                  <p className="text-gray-600">Tipo: {selectedProduct.tipo}</p>
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
                  onClick={handleDeleteProduct}
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