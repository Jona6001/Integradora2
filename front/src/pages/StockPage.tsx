import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { FaPlus } from "react-icons/fa"; 


type StockItem = {
  _id: number | string;
  producto: string;
  cantidad: number;
  unidad: string;
  status: string;
  actualizadoEn?: string;
  imagen?: string;
};

export default function StockPage({ setCurrentPage }) {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [filteredStock, setFilteredStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [stockAlert, setStockAlert] = useState("todos");
  const [newStock, setNewStock] = useState<StockItem>({
    _id: "",
    producto: "",
    cantidad: 0,
    unidad: "piezas",
    status: "activo"
  });

  const [showFillModal, setShowFillModal] = useState(false);
  const [fillAmount, setFillAmount] = useState(0);

// Función para abrir el modal de rellenar
const openFillModal = (item) => {
  setSelectedStock(item);
  setFillAmount(0);
  setShowFillModal(true);
};

// Función para rellenar el stock
const handleFillStock = async (e) => {
  e.preventDefault();
  if (!selectedStock) return;
  try {
    const newCantidad = Number(selectedStock.cantidad) + Number(fillAmount);
    const stockData = {
      ...selectedStock,
      cantidad: newCantidad,
    };
    await apiService.updateStock(selectedStock._id, stockData);
    setShowFillModal(false);
    setSelectedStock(null);
    setFillAmount(0);
    loadData();
    alert('Stock rellenado exitosamente');
  } catch (error) {
    console.error('Error rellenando stock:', error);
    alert('Error al rellenar stock.');
  }
};


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
    loadData();
  }, []);

  useEffect(() => {
    filterStock();
  }, [stock, searchTerm, selectedUnit, selectedStatus, stockAlert]);

  const loadData = async () => {
    try {
      setLoading(true);
      const stockResponse = await apiService.getAllStock();
      if (stockResponse.stockList) {
        setStock(stockResponse.stockList);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStock = () => {
    let filtered = [...stock];
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item =>
        item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item._id.toString().includes(searchTerm)
      );
    }
    if (selectedUnit !== "todos") {
      filtered = filtered.filter(item => item.unidad === selectedUnit);
    }
    if (selectedStatus !== "todos") {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    if (stockAlert === "bajo") {
      filtered = filtered.filter(item => {
        if (item.unidad === "piezas") {
          return item.cantidad <= 10;
        } else {
          return item.cantidad <= 500;
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

const getNextStockId = () => {
  if (stock.length === 0) return 1;
  const maxId = Math.max(...stock.map(s => Number(s._id) || 0));
  return maxId + 1;
};


const handleCreateStock = async (e) => {
  e.preventDefault();
  try {
    const stockData = {
      _id: getNextStockId(), // <-- autoincrementa
      producto: newStock.producto,
      cantidad: parseFloat(String(newStock.cantidad)),
      unidad: newStock.unidad,
      status: "activo",
      imagen: newStock.imagen
    };
    await apiService.createStock(stockData);
    setNewStock({ _id: "", producto: "", cantidad: 0, unidad: "piezas", status: "activo", imagen: "" });
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
  if (!selectedStock) {
    alert('No hay producto seleccionado para editar.');
    return;
  }
  try {
    const stockData = {
      producto: selectedStock.producto,
      cantidad: parseFloat(String(selectedStock.cantidad)),
      unidad: selectedStock.unidad,
      status: selectedStock.status,
      imagen: selectedStock.imagen // <-- AGREGA ESTA LÍNEA
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
    if (!selectedStock) {
      alert('No hay producto seleccionado para eliminar.');
      return;
    }
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
      return { status: 'agotado', color: theme === "dark" ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800', icon: '🚫' };
    } else if (unidad === "piezas" && cantidad <= 10) {
      return { status: 'bajo', color: theme === "dark" ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else if (unidad === "gramos" && cantidad <= 500) {
      return { status: 'bajo', color: theme === "dark" ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else {
      return { status: 'bueno', color: theme === "dark" ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800', icon: '✅' };
    }
  };

  const getUnitIcon = (unidad) => {
    return unidad === "piezas" ? "🥤" : "⚖️";
  };

  const isCountableProduct = (producto) => {
    const countableKeywords = ['agua', 'refresco', 'jugo', 'bebida', 'leche', 'yogurt'];
    return countableKeywords.some(keyword =>
      producto.toLowerCase().includes(keyword)
    );
  };

  // Estilos adaptados para modo claro/oscuro
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
          <p className={`text-center mt-4 font-semibold ${modalTitle}`}>Cargando Stock...</p>
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
            <h1 className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-amber-300" : "text-white"}`} style={{ fontFamily: "'Playfair Display', serif" }}>
              Gestión de Stock
            </h1>
            <p className={theme === "dark" ? "text-slate-300" : "text-white/70"}>
              Control de inventario y productos contables
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
            <FaPlus /> Agregar al Stock
          </button>
        </div>

        {/* Filtros */}
        <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm rounded-3xl p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Barra de búsqueda */}
            <div className="md:col-span-2">
             <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}>🔍 Buscar en stock</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por producto o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${inputBg} ${inputPlaceholder}`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className={theme === "dark" ? "text-slate-400" : "text-white/60"}>🔍</span>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
          {/* Filtro por unidad */}
          <div>
            <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}>
              📏 Unidad
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${inputBg}`}
            >
              <option value="todos">🌟 Todas</option>
              <option value="piezas">🥤 Piezas</option>
            </select>
          </div>
          {/* Filtro por status */}
          <div>
            <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}>
              Status
            </label>
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
          {/* Filtro por alertas */}
          <div>
            <label className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}>
              🚨 Alertas
            </label>
            <select
              value={stockAlert}
              onChange={(e) => setStockAlert(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${inputBg}`}
            >
              <option value="todos">🌟 Todos</option>
              <option value="bajo">⚠️ Stock Bajo</option>
              <option value="agotado">🚫 Agotados</option>
            </select>
          </div>
          </div>

          {/* Resultados y botón limpiar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-white/20">
            <div className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}  >
              <span className="font-semibold">{filteredStock.length}</span> producto{filteredStock.length !== 1 ? 's' : ''} en stock
              {searchTerm && (
                <span className="ml-2">para "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
            {(searchTerm || selectedUnit !== "todos" || selectedStatus !== "todos" || stockAlert !== "todos") && (
              <button
                onClick={clearFilters}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  : "bg-primary text-white hover:bg-secondary"
                } px-4 py-2 rounded-lg transition-all duration-200 font-semibold`}
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
              <div key={item._id} className={`${cardBg} ${cardText} rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${isCountable ? 'ring-2 ring-blue-300' : ''}`}>
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/20"></div>

                  {/* Imagen centrada */}
            {item.imagen ? (
              <img
                src={item.imagen}
                alt={item.producto}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg z-10"
                style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
              />
            ) : (
              <div
                className={`w-20 h-20 flex items-center justify-center rounded-full border-4 border-white shadow-lg z-10 ${theme === "dark" ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-400"}`}
                style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
              >
                📦
              </div>
            )}

                  {/* Badges superiores */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'activo'
                        ? (theme === "dark" ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                        : (theme === "dark" ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
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
                <div className="flex items-center gap-3 mb-2">
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.producto}
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                  ) : (
                    <div className={`w-14 h-14 flex items-center justify-center rounded-full ${theme === "dark" ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-400"}`}>
                      📦
                    </div>
                  )}
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {item.producto}
                  </h3>
                  <span className="text-sm text-gray-500">#{item._id}</span>
                </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Actualizado: {item.actualizadoEn ? new Date(item.actualizadoEn).toLocaleDateString() : "N/A"}
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
                    onClick={() => openFillModal(item)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition font-semibold"
                    title="Rellenar stock"
                  >
                    ♻️ Rellenar
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
            <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm rounded-3xl p-8 inline-block`}>
              <div className="text-6xl mb-4">🔍</div>
              <p className={`${theme === "dark" ? "text-slate-100" : "text-gray-800"} text-xl mb-4`}>No se encontraron productos</p>
              <p className={`${theme === "dark" ? "text-slate-400" : "text-white/70"} mb-4`}>
                {searchTerm && `con el término "${searchTerm}"`}
                {selectedUnit !== "todos" && ` en unidad "${selectedUnit}"`}
                {selectedStatus !== "todos" && ` con status "${selectedStatus}"`}
              </p>
              <button
                onClick={clearFilters}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  : "bg-primary text-white hover:bg-secondary"
                } px-6 py-3 rounded-full font-semibold transition-all duration-300`}
              >
                🧹 Limpiar filtros
              </button>
            </div>
          </div>
        )}
        

        {/* Estado vacío cuando no hay stock */}
        {stock.length === 0 && (
          <div className="text-center py-12">
            <div className={`block font-semibold mb-2 ${theme === "dark" ? "text-amber-200" : "text-gray-800"}`}>
              <div className="text-6xl mb-4">📦</div>
              <p className={`${theme === "dark" ? "text-slate-100" : "text-gray-800"} text-xl mb-4`}>No hay productos en stock</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-primary text-white hover:bg-secondary"
                } px-6 py-3 rounded-full font-semibold transition-all duration-300`}
              >
                Agregar primer producto
              </button>
            </div>
          </div>
        )}



        {/* Create Modal */}
{showCreateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50">
    <div className="w-full flex justify-center min-h-screen">
      <div className={`${modalBg} rounded-2xl p-0 w-full max-w-2xl flex flex-row shadow-xl mx-2 mt-24 mb-8`}>
        {/* Panel decorativo izquierdo */}
        <div className={`hidden md:flex flex-col items-center justify-center px-4 py-8 rounded-l-2xl ${theme === "dark" ? "bg-slate-900" : "bg-primary/90"}`}>
          <FaPlus className={`text-4xl mb-2 ${theme === "dark" ? "text-amber-400" : "text-white"}`} />
          <span className={`text-lg font-bold text-center ${theme === "dark" ? "text-amber-200" : "text-white"}`}>Nuevo Stock</span>
        </div>
        {/* Formulario a la derecha */}
        <div className="flex-1 px-4 py-6 text-[18px]">
          <h2 className={`text-[20px] font-bold mb-3 ${modalTitle}`}>Agregar al Stock</h2>
          <form onSubmit={handleCreateStock}>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">ID del Stock</label>
              <input
                type="number"
                value={getNextStockId()}
                disabled
                className={`w-full px-2 py-1 border rounded-lg bg-gray-100 cursor-not-allowed text-base ${inputBg}`}
                placeholder="ID autogenerado"
              />
              <span className="text-xs text-gray-500">El ID se asigna automáticamente</span>
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Producto</label>
              <input
                type="text"
                value={newStock.producto}
                onChange={(e) => setNewStock({ ...newStock, producto: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
                placeholder="Ej: Agua de Horchata"
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Cantidad</label>
              <input
                type="number"
                step="0.01"
                value={newStock.cantidad}
                onChange={(e) => setNewStock({ ...newStock, cantidad: Number(e.target.value) })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
                placeholder="Ej: 50"
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Unidad</label>
              <select
                value={newStock.unidad}
                onChange={(e) => setNewStock({ ...newStock, unidad: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
              >
                <option value="piezas">🥤 Piezas (bebidas, productos contables)</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Imagen</label>
              <input
                type="text"
                value={newStock.imagen || ""}
                onChange={(e) => setNewStock({ ...newStock, imagen: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                placeholder="URL de la imagen o /src/assets/stock.png"
              />
              {newStock.imagen && (
                <img src={newStock.imagen} alt="Vista previa" className="w-20 h-20 mt-2 rounded-full object-cover border" />
              )}
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1 text-base">Status</label>
              <select
                value={newStock.status}
                onChange={(e) => setNewStock({ ...newStock, status: e.target.value })}
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
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 bg-gray-200 text-gray-800 py-1 rounded-lg font-semibold hover:bg-gray-300 transition text-base`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 bg-primary text-white py-1 rounded-lg font-semibold hover:bg-secondary transition text-base`}
              >
                Agregar al Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}



{/* Editar Modal */}

{showEditModal && selectedStock && (
  <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50">
    <div className="w-full flex justify-center min-h-screen">
      <div className={`${modalBg} rounded-1xl p-0 w-full max-w-md flex flex-row shadow-xl mx-5  mt-24 mb-9`}>
        {/* Panel decorativo izquierdo */}
        <div className={`hidden md:flex flex-col items-center justify-center px-3 py-6 rounded-l-2xl ${theme === "dark" ? "bg-blue-900" : "bg-blue-100"}`}>
          <FaPlus className={`text-3xl mb-2 ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`} />
          <span className={`text-base font-bold text-center ${theme === "dark" ? "text-blue-200" : "text-blue-700"}`}>Editar Stock</span>
        </div>
        {/* Formulario a la derecha */}
        <div className="flex-1 px-3 py-5 text-[15px]">
          <h2 className={`text-[17px] font-bold mb-2 ${modalTitle}`}>Editar Producto de Stock</h2>
          <form onSubmit={handleEditStock}>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">ID (No editable)</label>
              <input
                type="number"
                value={selectedStock._id}
                className={`w-full px-2 py-1 border rounded-lg bg-gray-100 cursor-not-allowed text-base ${theme === "dark" ? "bg-slate-900 text-slate-400 border-slate-700" : ""}`}
                disabled
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Producto</label>
              <input
                type="text"
                value={selectedStock.producto}
                onChange={(e) => setSelectedStock({ ...selectedStock, producto: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Cantidad</label>
              <input
                type="number"
                step="0.01"
                value={selectedStock.cantidad}
                onChange={(e) => setSelectedStock({ ...selectedStock, cantidad: Number(e.target.value) })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Unidad</label>
              <select
                value={selectedStock.unidad}
                onChange={(e) => setSelectedStock({ ...selectedStock, unidad: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                required
              >
                <option value="piezas">🥤 Piezas</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1 text-base">Imagen</label>
              <input
                type="text"
                value={selectedStock.imagen || ""}
                onChange={(e) => setSelectedStock({ ...selectedStock, imagen: e.target.value })}
                className={`w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base ${inputBg}`}
                placeholder="URL de la imagen o /src/assets/stock.png"
              />
              {selectedStock.imagen && (
                <img src={selectedStock.imagen} alt="Vista previa" className="w-14 h-14 mt-2 rounded-full object-cover border" />
              )}
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1 text-base">Status</label>
              <select
                value={selectedStock.status}
                onChange={(e) => setSelectedStock({ ...selectedStock, status: e.target.value })}
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
                Actualizar Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Rellenar Stock Modal */}
    {showFillModal && selectedStock && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className={`${modalBg} rounded-2xl p-8 w-full max-w-md`}>
      <h2 className={`text-2xl font-bold mb-6 ${modalTitle}`}>Rellenar Stock</h2>
      <form onSubmit={handleFillStock}>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Producto</label>
          <input
            type="text"
            value={selectedStock.producto}
            disabled
            className={`w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed ${inputBg}`}
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Cantidad actual</label>
          <input
            type="number"
            value={selectedStock.cantidad}
            disabled
            className={`w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed ${inputBg}`}
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-2">¿Cuántas piezas deseas agregar?</label>
         <input
  type="number"
  min={1}
  value={fillAmount === 0 ? "" : fillAmount}
  onChange={e => {
    const val = Number(e.target.value);
    setFillAmount(isNaN(val) ? 0 : val);
  }}
  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputBg}`}
  required
  placeholder="Ej: 10"
/>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowFillModal(false)}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Rellenar
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Delete Modal */}
        {showDeleteModal && selectedStock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${modalBg} rounded-2xl p-8 w-full max-w-md`}>
              <h2 className="text-2xl font-bold mb-6 text-red-600">Eliminar del Stock</h2>
              <div className="mb-6">
                <p className={theme === "dark" ? "text-slate-200 mb-4" : "text-gray-700 mb-4"}>¿Estás seguro de que deseas eliminar este producto del stock?</p>
                <div className={`${theme === "dark" ? "bg-slate-900 text-slate-200" : "bg-gray-50 text-gray-800"} p-4 rounded-lg`}>
                  <p className="font-semibold">#{selectedStock._id} - {selectedStock.producto}</p>
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




