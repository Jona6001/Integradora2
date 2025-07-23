import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaFilter, FaSearch, FaCheckCircle, FaTimesCircle, FaImage, FaDollarSign, FaHashtag } from "react-icons/fa";
import Swal from 'sweetalert2';



type Product = {
  _id: number | string;
  nombre: string;   
  precio: number | string;
  tipo: string;
  status: string;
  creadoEn?: string;
  imagen?: string;
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
    status: "activo",
    imagen: ""
  });

  // Detectar tema correctamente (soporta Tailwind y data-theme)
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ||
    document.body.dataset.theme === "dark" ||
    localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.dataset.theme === "dark" ||
        localStorage.getItem("theme") === "dark";
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

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
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product._id.toString().includes(searchTerm)
      );
    }
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(product => product.tipo === selectedCategory);
    }
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

const getNextProductId = () => {
  if (products.length === 0) return 1;
  // Busca el mayor id y suma 1
  const maxId = Math.max(...products.map(p => Number(p._id) || 0));
  return maxId + 1;
};


const handleCreateProduct = async (e) => {
  e.preventDefault();
  try {
    const productData = {
      _id: getNextProductId(),
      nombre: newProduct.nombre,
      precio: parseFloat(String(newProduct.precio)),
      tipo: newProduct.tipo,
      status: "activo",
      imagen: newProduct.imagen
    };
    await apiService.createProduct(productData);
    setNewProduct({ _id: "", nombre: "", precio: "", tipo: "torta", status: "activo", imagen: "" });
    setShowCreateModal(false);
    loadProducts();
    Swal.fire('Producto creado', 'El producto fue creado exitosamente', 'success');
  } catch (error) {
    console.error('Error creando producto:', error);
    Swal.fire('Error', 'Error al crear producto. Revisa que el ID no esté duplicado.', 'error');
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
      status: selectedProduct.status,
      imagen: selectedProduct.imagen
    };
    await apiService.updateProduct(selectedProduct._id, productData);
    setShowEditModal(false);
    setSelectedProduct(null);
    loadProducts();
    Swal.fire('Producto actualizado', 'El producto fue actualizado exitosamente', 'success');
  } catch (error) {
    console.error('Error actualizando producto:', error);
    Swal.fire('Error', 'Error al actualizar producto.', 'error');
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
      case 'torta': return <FaBoxOpen className="inline-block mr-1" />;
      case 'bebida': return <FaFilter className="inline-block mr-1" />;
      case 'ingrediente': return <FaImage className="inline-block mr-1" />;
      default: return <FaBoxOpen className="inline-block mr-1" />;
    }
  };

  const getProductTypeColor = (tipo) => {
    if (theme === "dark") {
      switch(tipo) {
        case 'torta': return 'bg-orange-900 text-orange-200';
        case 'bebida': return 'bg-blue-900 text-blue-200';
        case 'ingrediente': return 'bg-green-900 text-green-200';
        default: return 'bg-gray-800 text-gray-200';
      }
    } else {
      switch(tipo) {
        case 'torta': return 'bg-orange-100 text-orange-800';
        case 'bebida': return 'bg-blue-100 text-blue-800';
        case 'ingrediente': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  // Mejor contraste para modo claro
  const cardBg = theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200";
  const cardText = theme === "dark" ? "text-slate-100" : "text-gray-900";
  const modalBg = theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200";
  const modalTitle = theme === "dark" ? "text-amber-400" : "text-primary";
  const inputBg = theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300";
  const inputPlaceholder = theme === "dark" ? "placeholder:text-slate-400" : "placeholder:text-gray-500";

 if (loading) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-primary to-secondary"}`}>
      <div className={`${modalBg} rounded-3xl shadow-2xl p-8`}>
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mb-4"></div>
          <p className={`text-center mt-4 font-semibold ${modalTitle}`}>Cargando productos...</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className={`min-h-screen ${theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      : "bg-gradient-to-br from-primary via-primary/80 to-secondary"
    } transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className={`text-4xl font-bold mb-2 ${
                theme === "dark" ? "text-amber-300" : "text-white"
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <FaBoxOpen className="inline-block mb-1 mr-2" /> Gestión de Productos
            </h1>
            <p className={theme === "dark" ? "text-slate-300" : "text-white"}>
              Administra el catálogo de lonches
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 ${
              theme === "dark"
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-primary text-white hover:bg-secondary"
            } px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg`}
          >
            <FaPlus /> Agregar Producto
          </button>
        </div>


        {/* Barra de búsqueda y filtros */}
        <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm rounded-3xl p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barra de búsqueda */}
            <div className="md:col-span-2">
              <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}><FaSearch className="inline mr-2" />Buscar productos</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${inputBg} ${inputPlaceholder}`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FaSearch className={theme === "dark" ? "text-slate-400" : "text-gray-400"} />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FaTimesCircle />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por categoría */}
            <div>
              <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}><FaFilter className="inline mr-2" />Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${inputBg}`}
              >
                <option value="todos">🌟 Todos</option>
                <option value="torta">🥪 Tortas</option>
                <option value="bebida">🥤 Bebidas</option>
              </select>
            </div>

            {/* Filtro por status */}
            <div>
              <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}><FaCheckCircle className="inline mr-2" />Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${inputBg}`}
              >
                <option value="todos">🌟 Todos</option>
                <option value="activo">✅ Activos</option>
                <option value="inactivo">❌ Inactivos</option>
              </select>
            </div>
          </div>

          {/* Resultados y botón limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-white/20">
            <div className={theme === "dark" ? "text-slate-200 mb-2 sm:mb-0" : "text-gray-800 mb-2 sm:mb-0"}>
              <span className="font-semibold">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && (
                <span className="ml-2">para "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
            {(searchTerm || selectedCategory !== "todos" || selectedStatus !== "todos") && (
              <button
                onClick={clearFilters}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  : "bg-primary text-white hover:bg-secondary"
                } px-4 py-2 rounded-lg transition-all duration-200 font-semibold`}
              >
                <FaTimesCircle /> Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className={`${cardBg} ${cardText} rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300`}>
              <div className="relative h-48 overflow-hidden">
                {/* Imagen del producto */}
                {product.imagen ? (
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-5xl ${theme === "dark" ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-400"}`}>
                    {getProductTypeIcon(product.tipo)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    product.status === 'activo'
                      ? (theme === "dark" ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800")
                      : (theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800")
                  }`}>
                    {product.status === "activo" ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {product.status}
                  </span>
                </div>
                {/* Product Type */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getProductTypeColor(product.tipo)}`}>
                    {getProductTypeIcon(product.tipo)} {product.tipo}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {product.nombre}
                  </h3>
                  <span className="text-sm text-gray-500">#{product._id}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-bold ${theme === "dark" ? "text-amber-400" : "text-primary"}`}>${product.precio}</span>
                  <span className="text-sm text-gray-500">
                    {product.creadoEn ? new Date(product.creadoEn).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="flex gap-2">
              <button
                onClick={() => openEditModal(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition font-semibold"
              >
                <FaEdit /> Editar
              </button>
              {product.status === "inactivo" ? (
                <button
                  onClick={async () => {
                    await apiService.updateProduct(product._id, { ...product, status: "activo" });
                    loadProducts();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition font-semibold"
                >
                  <FaCheckCircle /> Activar
                </button>
              ) : (
                <button
                  onClick={() => openDeleteModal(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition font-semibold"
                >
                  <FaTrash /> Eliminar
                </button>
              )}
            </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío cuando no hay resultados */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12">
            <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm rounded-3xl p-8 inline-block`}>
              <div className="text-6xl mb-4"><FaSearch /></div>
              <p className={`${theme === "dark" ? "text-slate-100" : "text-gray-800"} text-xl mb-4`}>No se encontraron productos</p>
              <p className={`${theme === "dark" ? "text-slate-400" : "text-gray-600"} mb-4`}>
                {searchTerm && `con el término "${searchTerm}"`}
                {selectedCategory !== "todos" && ` en la categoría "${selectedCategory}"`}
                {selectedStatus !== "todos" && ` con status "${selectedStatus}"`}
              </p>
              <button
                onClick={clearFilters}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  : "bg-primary text-white hover:bg-secondary"
                } px-6 py-3 rounded-full font-semibold transition-all duration-300`}
              >
                <FaTimesCircle /> Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Estado vacío cuando no hay productos */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm rounded-3xl p-8 inline-block`}>
              <div className="text-6xl mb-4"><FaBoxOpen /></div>
              <p className={`${theme === "dark" ? "text-slate-100" : "text-gray-800"} text-xl mb-4`}>No hay productos registrados</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-primary text-white hover:bg-secondary"
                } px-6 py-3 rounded-full font-semibold transition-all duration-300`}
              >
                <FaPlus /> Crear primer producto
              </button>
            </div>
          </div>
        )}

        {/* Modal para crear producto */}
            
          {showCreateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50">
    <div className="w-full flex justify-center min-h-screen">
      <div className={`${modalBg} rounded-2xl p-0 w-full max-w-2xl flex flex-row shadow-xl mx-2 mt-24 mb-8`}>
        {/* Panel decorativo izquierdo */}
        <div className={`hidden md:flex flex-col items-center justify-center px-4 py-8 rounded-l-2xl ${theme === "dark" ? "bg-slate-900" : "bg-primary/90"}`}>
          <FaBoxOpen className={`text-4xl mb-2 ${theme === "dark" ? "text-amber-400" : "text-white"}`} />
          <span className={`text-lg font-bold text-center ${theme === "dark" ? "text-amber-200" : "text-white"}`}>Nuevo Producto</span>
        </div>
        {/* Formulario a la derecha */}
        <div className="flex-1 px-4 py-6 text-[18px]">
          <h2 className={`text-[20px] font-bold mb-3 ${modalTitle}`}>Crear Nuevo Producto</h2>
          <form onSubmit={handleCreateProduct}>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                <FaHashtag className="text-primary" /> ID del Producto
              </label>
              <input
                type="number"
                value={getNextProductId()}
                disabled
                className={`w-full px-2 py-1 border rounded-lg bg-gray-100 cursor-not-allowed text-base ${inputBg}`}
                placeholder="ID autogenerado"
              />
              <span className="text-xs text-gray-500">El ID se asigna automáticamente</span>
            </div>
            {/* ...resto del formulario igual... */}
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                <FaBoxOpen className="text-primary" /> Nombre
              </label>
              <input
                type="text"
                value={newProduct.nombre}
                onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
                placeholder="Ej: Torta de Jamón"
              />
            </div>
            {/* ...resto igual... */}
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                <FaDollarSign className="text-primary" /> Precio
              </label>
              <input
                type="number"
                step="0.01"
                value={newProduct.precio}
                onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
                placeholder="Ej: 35.50"
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                <FaFilter className="text-primary" /> Tipo
              </label>
              <select
                value={newProduct.tipo}
                onChange={(e) => setNewProduct({ ...newProduct, tipo: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
              >
                <option value="torta">🥪 Torta</option>
                <option value="bebida">🥤 Bebida</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                <FaImage className="text-primary" /> Imagen
              </label>
              <input
                type="text"
                value={newProduct.imagen}
                onChange={(e) => setNewProduct({ ...newProduct, imagen: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                placeholder="https://ejemplo.com/imagen.jpg o /src/assets/lonches.png"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 bg-gray-200 text-gray-800 py-1 rounded-lg font-semibold hover:bg-gray-300 transition text-base`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 bg-primary text-white py-1 rounded-lg font-semibold hover:bg-secondary transition text-base`}
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}



        {/* Edit Modal */}
                {showEditModal && selectedProduct && (
          <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
            onClick={e => {
              if (e.target === e.currentTarget) setShowEditModal(false);
            }}
          >
            <div className="w-full flex justify-center min-h-screen">
              <div className={`${modalBg} rounded-2xl p-0 w-full max-w-2xl flex flex-row shadow-xl mx-2 mt-24 mb-8`}>
                {/* Panel decorativo izquierdo */}
                <div className={`hidden md:flex flex-col items-center justify-center px-4 py-8 rounded-l-2xl ${theme === "dark" ? "bg-slate-900" : "bg-primary/90"}`}>
                  <FaEdit className={`text-4xl mb-2 ${theme === "dark" ? "text-blue-400" : "text-white"}`} />
                  <span className={`text-lg font-bold text-center ${theme === "dark" ? "text-blue-200" : "text-white"}`}>Editar Producto</span>
                </div>
                {/* Formulario a la derecha */}
                <div className="flex-1 px-4 py-6 text-[18px]">
                  <h2 className={`text-[20px] font-bold mb-3 ${modalTitle}`}>Editar Producto</h2>
                  <form onSubmit={handleEditProduct}>
                    <div className="mb-2">
                      <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                        <FaHashtag className="text-primary" /> ID (No editable)
                      </label>
                      <input
                        type="number"
                        value={selectedProduct._id}
                        className={`w-full px-2 py-1 border rounded-lg bg-gray-100 cursor-not-allowed text-base ${theme === "dark" ? "bg-slate-900 text-slate-400 border-slate-700" : ""}`}
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                        <FaBoxOpen className="text-primary" /> Nombre
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.nombre}
                        onChange={(e) => setSelectedProduct({...selectedProduct, nombre: e.target.value})}
                        className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                        <FaDollarSign className="text-primary" /> Precio
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedProduct.precio}
                        onChange={(e) => setSelectedProduct({...selectedProduct, precio: e.target.value})}
                        className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                        <FaFilter className="text-primary" /> Tipo
                      </label>
                      <select
                        value={selectedProduct.tipo}
                        onChange={(e) => setSelectedProduct({...selectedProduct, tipo: e.target.value})}
                        className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                        required
                      >
                        <option value="torta">🥪 Torta</option>
                        <option value="bebida">🥤 Bebida</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                        <FaImage className="text-primary" /> Imagen
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.imagen || ""}
                        onChange={(e) => setSelectedProduct({...selectedProduct, imagen: e.target.value})}
                        className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                        placeholder="https://ejemplo.com/imagen.jpg o /src/assets/lonches.png"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block font-semibold mb-1 text-base flex items-center gap-1">
                        <FaCheckCircle className="text-primary" /> Status
                      </label>
                      <select
                        value={selectedProduct.status}
                        onChange={(e) => setSelectedProduct({...selectedProduct, status: e.target.value})}
                        className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                        required
                      >
                        <option value="activo">✅ Activo</option>
                        <option value="inactivo">❌ Inactivo</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className={`flex-1 bg-gray-200 text-gray-800 py-1 rounded-lg font-semibold hover:bg-gray-300 transition text-base`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 bg-blue-500 text-white py-1 rounded-lg font-semibold hover:bg-blue-600 transition text-base`}
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${modalBg} rounded-2xl p-8 w-full max-w-md`}>
              <h2 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-2"><FaTrash /> Eliminar Producto</h2>
              <div className="mb-6">
                <p className={theme === "dark" ? "text-slate-200 mb-4" : "text-gray-800 mb-4"}>¿Estás seguro de que deseas eliminar este producto?</p>
                <div className={`${theme === "dark" ? "bg-slate-900 text-slate-200" : "bg-gray-50 text-gray-800"} p-4 rounded-lg`}>
                  <p className="font-semibold">#{selectedProduct._id} - {selectedProduct.nombre}</p>
                  <p className="text-sm">Precio: ${selectedProduct.precio}</p>
                  <p className="text-sm">Tipo: {selectedProduct.tipo}</p>
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