import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaCalendarAlt, FaDollarSign, FaEdit, FaTrash, FaEye, FaBoxOpen } from "react-icons/fa";
import apiService from "../services/api";
import Swal from 'sweetalert2';
import { FaPlus } from "react-icons/fa"; 


type ExtraIngredient = {
  name: string;
  price: number;
  icon: string;
  quantity: number;
};

type CartItem = {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen?: string;
  extraIngredients?: ExtraIngredient[];
  isTorta?: boolean;
};

export default function SellsPage({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const [sells, setSells] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSell, setSelectedSell] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editCart, setEditCart] = useState<CartItem[]>([]);
  const [vendedorId] = useState(1);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
  const cardBg = theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200";
  const cardText = theme === "dark" ? "text-slate-100" : "text-gray-900";
  const modalBg = theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200";
  const modalTitle = theme === "dark" ? "text-amber-400" : "text-primary";

  // Mapeo de productos a ingredientes (NOMBRES EXACTOS como en stock)
  const PRODUCT_INGREDIENTS_MAP = {
    "Torta de Adobada SENCILLA": ["Pan"],
    "Torta de Adobada MIXTO": ["Pan"],
    "Torta de Adobada TRIPLE": ["Pan"],
    "Torta de Asada SENCILLA": ["Pan"],
    "Torta de Asada MIXTO": ["Pan"],
    "Torta de Asada TRIPLE": ["Pan"],
    "Torta de Pierna SENCILLA": ["Pan"],
    "Torta de Pierna MIXTO": ["Pan"],
    "Torta de Pierna TRIPLE": ["Pan"],
    "Torta de Jamón SENCILLA": ["Pan"],
    "Torta de Jamón MIXTO": ["Pan"],
    "Torta de Jamón TRIPLE": ["Pan"],
    "Coca-Cola": ["Coca-Cola"],
    "Pepsi": ["Pepsi"],
    "Agua Natural": ["Agua Natural"],
    "Agua de Horchata": ["Agua de Horchata"],
    "Agua de Jamaica": ["Agua de Jamaica"],
    "Agua de Tamarindo": ["Agua de Tamarindo"],
    "Refresco": ["Refresco"],
    "Pan Individual": ["Pan"],
    "Bolillo": ["Pan"],
    "Pan": ["Pan"]
  };

  // Ingredientes extra disponibles
  const EXTRA_INGREDIENTS = [
    { name: "Queso", price: 5, icon: "🧀" },
    { name: "Jamón", price: 5, icon: "🥓" },
    { name: "Aguacate", price: 5, icon: "🥑" },
    { name: "Queso de Puerco", price: 5, icon: "🧀" },
    { name: "Mortadela", price: 5, icon: "🥩" },
    { name: "Queso Amarillo", price: 5, icon: "🧀" },
    { name: "Asada", price: 5, icon: "🥩" },
    { name: "Pierna", price: 5, icon: "🍗" },
    { name: "Adobada", price: 5, icon: "🌶️" },
    { name: "Cebolla", price: 5, icon: "🧅" },
    { name: "Tomate", price: 5, icon: "🍅" },
    { name: "Chile", price: 5, icon: "🌶️" }
  ];

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    setLoading(true);
    const [sellsResponse, productsResponse, stockResponse, usersResponse] = await Promise.all([
      apiService.getAllSells(),
      apiService.getAllProducts(),
      apiService.getAllStock(),
      apiService.getAllUsers()
    ]);
      if (sellsResponse.sellsList) {
        // Filtrar ventas de los últimos 15 días
        const now = new Date();
        setSells(sellsResponse.sellsList.filter(sell => {
          const fechaVenta = new Date(sell.fecha);
          return (now.getTime() - fechaVenta.getTime()) / (1000 * 60 * 60 * 24) <= 15;
        }));
      }
      if (productsResponse.productsList) {
        setProducts(productsResponse.productsList.filter(p => p.status === 'activo'));
      }
      if (stockResponse.stockList) {
        setStock(stockResponse.stockList.filter(s => s.status === 'activo'));
      }
      if (usersResponse.usersList) {
        setUsers(usersResponse.usersList);
      }
       if (Array.isArray(usersResponse)) {
      setUsers(usersResponse);
    } else if (usersResponse.usersList) {
      setUsers(usersResponse.usersList);
    } 
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener nombre de usuario por id
const getUserName = (id) => {
  const user = users.find(u => String(u._id) === String(id));
  return user ? user.nombre : `ID: ${id}`;
};

  // Función para verificar si un producto es una torta
  const isTorta = (productName) => {
    return productName.toLowerCase().includes('torta');
  };

  // Función para obtener ingredientes necesarios para un producto
  const getRequiredIngredients = (productName, quantity) => {
    const ingredients = PRODUCT_INGREDIENTS_MAP[productName] || [];
    return ingredients.map(ingredient => ({
      ingredient,
      required: quantity
    }));
  };

  // Función para verificar si hay suficiente stock de ingredientes
  const checkIngredientsAvailability = (productName, requestedQuantity) => {
    const requiredIngredients = getRequiredIngredients(productName, requestedQuantity);
    for (const { ingredient, required } of requiredIngredients) {
      const stockItem = stock.find(s => s.producto === ingredient);
      const available = stockItem ? stockItem.cantidad : 0;
      if (available < required) {
        return {
          available: false,
          message: `Stock insuficiente para hacer ${productName}. Se necesita ${ingredient}: ${required}, disponible: ${available}`
        };
      }
    }
    return { available: true };
  };

  // Función para obtener el stock disponible de un ingrediente
  const getAvailableStock = (ingredientName) => {
    const stockItem = stock.find(s => s.producto === ingredientName);
    return stockItem ? stockItem.cantidad : 0;
  };

  // Funciones para carrito
 const addToCart = (productId: number, extraIngredients: ExtraIngredient[] = []) => {
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
      extraIngredients: isTortaProduct ? extraIngredients : [],
      isTorta: isTortaProduct
    }]);
  }
};

  // Función para agregar ingrediente extra
  const addExtraIngredient = (productId, ingredient) => {
    setCart(cart.map(item => {
      if (item.producto_id === productId) {
        const existingExtra = item.extraIngredients?.find(extra => extra.name === ingredient.name);
        let updatedExtras;
        if (existingExtra) {
          updatedExtras = (item.extraIngredients ?? []).map(extra =>
            extra.name === ingredient.name
              ? { ...extra, quantity: extra.quantity + 1 }
              : extra
          );
        } else {
          updatedExtras = [...(item.extraIngredients || []), { ...ingredient, quantity: 1 }];
        }
        const extraCost = updatedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity * item.cantidad), 0);
        const newSubtotal = (item.cantidad * item.precio_unitario) + extraCost;
        return {
          ...item,
          extraIngredients: updatedExtras,
          subtotal: newSubtotal
        };
      }
      return item;
    }));
  };

  // Función para remover ingrediente extra
  const removeExtraIngredient = (productId, ingredientName) => {
    setCart(cart.map(item => {
      if (item.producto_id === productId) {
        const updatedExtras = item.extraIngredients?.map(extra =>
          extra.name === ingredientName
            ? { ...extra, quantity: Math.max(0, extra.quantity - 1) }
            : extra
        ).filter(extra => extra.quantity > 0) || [];
        const extraCost = updatedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity * item.cantidad), 0);
        const newSubtotal = (item.cantidad * item.precio_unitario) + extraCost;
        return {
          ...item,
          extraIngredients: updatedExtras,
          subtotal: newSubtotal
        };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  // Editar venta (solo si dentro de 1hr)
  const canEditSell = (sell) => {
    const now = new Date();
    const fechaVenta = new Date(sell.fecha);
    return (now.getTime() - fechaVenta.getTime()) / (1000 * 60 * 60) <= 1;
  };

 const handleCreateSale = async (e) => {
  e.preventDefault();
  if (cart.length === 0) {
    Swal.fire('Carrito vacío', 'Agrega al menos un producto al carrito', 'warning');
    return;
  }
  for (const item of cart) {
    const ingredientCheck = checkIngredientsAvailability(item.nombre, item.cantidad);
    if (!ingredientCheck.available) {
      Swal.fire('Stock insuficiente', ingredientCheck.message, 'error');
      return;
    }
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
    setShowCreateModal(false);
    loadData();
    Swal.fire('Venta creada', 'Venta creada exitosamente y stock actualizado', 'success');
  } catch (error) {
    console.error('Error creando venta:', error);
    if (error.response?.data?.message) {
      Swal.fire('Error', error.response.data.message, 'error');
    } else {
      Swal.fire('Error', 'Error al crear la venta', 'error');
    }
  }
};

  // Editar venta
const handleEditSell = async () => {
  if (!selectedSell) return;
  try {
    const saleData = {
      productos: editCart,
      total: editCart.reduce((total, item) => total + item.subtotal, 0),
      vendedor_id: selectedSell.vendedor_id,
      status: selectedSell.status
    };
    await apiService.updateSell(selectedSell._id, saleData);
    setShowEditModal(false);
    setSelectedSell(null);
    loadData();
    Swal.fire('Venta actualizada', 'Venta editada exitosamente', 'success');
  } catch (error) {
    console.error('Error editando venta:', error);
    Swal.fire('Error', 'Error al editar la venta', 'error');
  }
};


  // Eliminar venta (solo si dentro de 15 días)
const handleDeleteSell = async (sellId) => {
  const sell = sells.find(s => s._id === sellId);
  if (!sell) return;
  const now = new Date();
  const fechaVenta = new Date(sell.fecha);
  if ((now.getTime() - fechaVenta.getTime()) / (1000 * 60 * 60 * 24) > 15) {
    Swal.fire('No permitido', 'Solo puedes eliminar ventas realizadas en los últimos 15 días', 'warning');
    return;
  }
  const result = await Swal.fire({
    title: '¿Eliminar venta?',
    text: '¿Estás seguro de eliminar esta venta?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });
  if (!result.isConfirmed) return;
  try {
    await apiService.deleteSell(sellId);
    loadData();
    Swal.fire('Eliminada', 'Venta eliminada exitosamente', 'success');
  } catch (error) {
    console.error('Error eliminando venta:', error);
    Swal.fire('Error', 'Error al eliminar la venta', 'error');
  }
};

  const openViewModal = (sell) => {
    setSelectedSell(sell);
    setShowViewModal(true);
  };

  const openEditModal = (sell) => {
    setSelectedSell(sell);
    setEditCart(sell.productos.map(p => ({
      ...p,
      imagen: products.find(prod => prod._id === p.producto_id)?.imagen,
      isTorta: isTorta(p.nombre) 
    })));
    setShowEditModal(true);
  };

  // Función para obtener el tipo de producto
  const getProductType = (productName) => {
    if (productName.toLowerCase().includes('torta')) return 'torta';
    if (productName.toLowerCase().includes('coca') || productName.toLowerCase().includes('pepsi') || productName.toLowerCase().includes('agua')) return 'bebida';
    if (productName.toLowerCase().includes('pan') || productName.toLowerCase().includes('bolillo')) return 'pan';
    return 'otro';
  };

// Mejor contraste para modo claro900 border-gray-300";


if (loading) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-primary to-secondary"}`}>
      <div className={`${modalBg} rounded-3xl shadow-2xl p-8`}>
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mb-4"></div>
          <p className={`text-center mt-4 font-semibold ${modalTitle}`}>Cargando ventas...</p>
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
      <div className="min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          
         <div>
            <h1
              className={`text-4xl font-bold mb-2 flex items-center gap-2 ${
                theme === "dark" ? "text-amber-200" : "text-white"
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <FaShoppingCart className="mb-1" /> Gestión de Ventas
            </h1>
          </div>

              <button
                onClick={() => setShowCreateModal(true)} 
               className={`flex items-center gap-2 ${
          theme === "dark"
            ? "bg-amber-700 text-white hover:bg-amber-800"
            : "bg-primary text-white hover:bg-secondary"
        } px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg`}
      >
        <FaShoppingCart /> Agregar Venta
      </button>
        </div>
        <div className="overflow-x-auto mb-10 mt-8">
          <div className={`rounded-2xl shadow-xl overflow-hidden ${theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200"}`}>
            <div className={`text-right font-medium text-xl px-6 pt-4 ${theme === "dark" ? "text-amber-200" : "text-primary"}`}>
              {currentTime.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              <div className={`${theme === "dark" ? "text-amber-300/70" : "text-primary/70"} text-xs`}>
                {currentTime.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
<table className="w-full mt-8">
  <thead className={`${theme === "dark" ? "bg-slate-600 text-amber-100" : "bg-primary text-white"}`}>
    <tr>
      <th className="px-6 py-4 text-left"><FaCalendarAlt className="inline mr-1" />Fecha</th>
      <th className="px-6 py-4 text-left"><FaShoppingCart className="inline mr-1" />Productos</th>
      <th className="px-6 py-4 text-left"><FaDollarSign className="inline mr-1" />Total</th>
      <th className="px-6 py-4 text-left"><FaUser className="inline mr-1" />Vendedor</th>
      <th className="px-6 py-4 text-left">Status</th>
      <th className="px-6 py-4 text-left">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {sells.map((sell, index) => (
      <tr
        key={sell._id}
        className={`
          ${index % 2 === 0
            ? theme === "dark" ? "bg-slate-900" : "bg-gray-50"
            : theme === "dark" ? "bg-slate-800" : "bg-white"}
          transition-colors
        `}
      >
        <td className="px-6 py-4">
          {new Date(sell.fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {sell.productos?.map((p, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs
                  ${theme === "dark" ? "bg-blue-950 text-blue-200" : "bg-blue-100 text-blue-800"}
                `}
              >
                {products.find((prod) => prod._id === p.producto_id && prod.imagen) ? (
                  <img
                    src={products.find((prod) => prod._id === p.producto_id).imagen}
                    alt={p.nombre}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <FaBoxOpen className="w-5 h-5" />
                )}
                <span>{p.nombre}</span>
                <span className="font-bold">x{p.cantidad}</span>
              </div>
            ))}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`font-bold text-lg ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
            ${sell.total}
          </span>
        </td>
        <td className="px-6 py-4">
      {getUserName(sell.vendedor_id)}
    </td>
        <td className="px-6 py-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${sell.status === 'activo'
              ? theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
              : theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"}
          `}>
            {sell.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-1">
            <button
              onClick={() => openViewModal(sell)}
              className={`
                px-2 py-1 rounded text-xs flex items-center gap-1 transition
                ${theme === "dark"
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-blue-500 text-white hover:bg-blue-600"}
              `}
            >
              <FaEye /> Ver
            </button>
            {canEditSell(sell) && (
              <button
                onClick={() => openEditModal(sell)}
                className={`
                  px-2 py-1 rounded text-xs flex items-center gap-1 transition
                  ${theme === "dark"
                    ? "bg-yellow-700 text-white hover:bg-yellow-800"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"}
                `}
              >
                <FaEdit /> Editar
              </button>
            )}
            <button
              onClick={() => handleDeleteSell(sell._id)}
              className={`
                px-2 py-1 rounded text-xs flex items-center gap-1 transition
                ${theme === "dark"
                  ? "bg-red-700 text-white hover:bg-red-800"
                  : "bg-red-500 text-white hover:bg-red-600"}
              `}
            >
              <FaTrash /> Eliminar
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>


          </div>
        </div>
        {sells.length === 0 && (
          <div className="text-center py-12">
            <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/10"} backdrop-blur-sm rounded-3xl p-8 inline-block`}>
              <div className={`${theme === "dark" ? "text-amber-300" : "text-4xl"} mb-4`}><FaShoppingCart /></div>
              <p className={`${theme === "dark" ? "text-amber-200" : "text-white"} text-xl mb-4`}>No hay ventas registradas</p>
              <p className={`${theme === "dark" ? "text-amber-100/60" : "text-white/60"} mb-6`}>en los últimos 15 días</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300
                  ${theme === "dark"
                    ? "bg-amber-400 text-slate-900 hover:bg-primary hover:text-white"
                    : "bg-white text-primary hover:bg-primary hover:text-white"}
                `}
              >
                <FaShoppingCart /> Realizar primera venta
              </button>
            </div>
          </div>
        )}

{showCreateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className={`${modalBg} rounded-2xl p-0 w-full max-w-5xl flex flex-col shadow-xl mt-24`}>
      {/* Título arriba, fuera del panel lateral */}
      <div className="flex items-center gap-4 px-8 pt-8 pb-2 border-b">
        <FaShoppingCart className={`text-4xl ${theme === "dark" ? "text-amber-400" : "text-primary"}`} />
        <h2 className={`text-2xl font-bold ${modalTitle}`}>Crear Nueva Venta</h2>
      </div>
      <div className="flex flex-row w-full">
       
        {/* Formulario a la derecha, más ancho */}
        <div className="flex-1 px-8 py-8 text-[17px] overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleCreateSale}>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Productos disponibles */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Productos Disponibles</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {products.map(product => {
                    const productType = getProductType(product.nombre);
                    const requiredIngredients = getRequiredIngredients(product.nombre, 1);
                    let canMake = true;
                    let stockInfo = "";
                    if (requiredIngredients.length > 0) {
                      for (const { ingredient, required } of requiredIngredients) {
                        const available = getAvailableStock(ingredient);
                        if (available < required) {
                          canMake = false;
                        }
                        stockInfo += `${ingredient}: ${available} `;
                      }
                    }
                    return (
                      <div key={product._id} className={`border rounded-lg p-3 flex gap-3 items-center ${!canMake ? 'bg-red-50 border-red-200' : ''}`}>
                        <div>
                          {product.imagen ? (
                            <img src={product.imagen} alt={product.nombre} className="w-14 h-14 rounded-full object-cover border" />
                          ) : (
                            <FaBoxOpen className="w-14 h-14 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{product.nombre}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              productType === 'torta' ? 'bg-orange-100 text-orange-800' :
                              productType === 'bebida' ? 'bg-blue-100 text-blue-800' :
                              productType === 'pan' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {productType === 'torta' ? '🌮' :
                                productType === 'bebida' ? '🥤' :
                                  productType === 'pan' ? '🍞' : '📦'} {productType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            ${product.precio} - {product.tipo}
                          </p>
                          {requiredIngredients.length > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Requiere: </span>
                              {stockInfo}
                              {!canMake && <span className="text-red-500 font-medium">⚠️ Sin stock</span>}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(product._id)}
                          disabled={!canMake}
                          className={`px-3 py-1 rounded text-sm transition ${
                            !canMake
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-secondary'
                          }`}
                        >
                          + Agregar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Carrito de compra */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Carrito de Compra</h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2"><FaShoppingCart /></div>
                    <p>Carrito vacío</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {cart.map(item => {
                      const requiredIngredients = getRequiredIngredients(item.nombre, item.cantidad);
                      function updateCartQuantity(producto_id: number, newQuantity: number): void {
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
                        <div key={item.producto_id} className="border rounded-lg p-4 flex gap-3 items-center">
                          <div>
                            {item.imagen ? (
                              <img src={item.imagen} alt={item.nombre} className="w-12 h-12 rounded-full object-cover border" />
                            ) : (
                              <FaBoxOpen className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{item.nombre}</h4>
                              {requiredIngredients.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Usa: </span>
                                  {requiredIngredients.map(({ ingredient, required }) => (
                                    <span key={ingredient}>{ingredient} ({required}) </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.producto_id, item.cantidad - 1)}
                                className={`w-6 h-6 rounded flex items-center justify-center font-bold transition
                                  ${theme === "dark"
                                    ? "bg-slate-700 text-amber-300 hover:bg-amber-500 hover:text-white border border-slate-600"
                                    : "bg-gray-200 text-gray-800 hover:bg-primary hover:text-white"}
                                `}
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.cantidad}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.producto_id, item.cantidad + 1)}
                                className={`w-6 h-6 rounded flex items-center justify-center font-bold transition
                                  ${theme === "dark"
                                    ? "bg-slate-700 text-amber-300 hover:bg-amber-500 hover:text-white border border-slate-600"
                                    : "bg-gray-200 text-gray-800 hover:bg-primary hover:text-white"}
                                `}
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">${item.precio_unitario} base</p>
                              <p className="font-bold">${item.subtotal}</p>
                            </div>
                            {item.isTorta && (
                              <div className="border-t pt-3">
                                <h5 className="text-sm font-semibold mb-2">🌶️ Ingredientes Extra (+$5 c/u)</h5>
                                {item.extraIngredients && item.extraIngredients.length > 0 && (
                                  <div className="mb-2">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {item.extraIngredients.map(extra => (
                                        <span key={extra.name} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                          {extra.icon} {extra.name} x{extra.quantity}
                                          <button
                                            type="button"
                                            onClick={() => removeExtraIngredient(item.producto_id, extra.name)}
                                            className={`ml-1 font-bold rounded-full transition
                                              ${theme === "dark"
                                                ? "bg-red-700 text-white hover:bg-red-500 border border-red-800"
                                                : "text-red-500 hover:text-red-700"}
                                            `}
                                          >
                                            ✕
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-3 gap-1">
                                  {EXTRA_INGREDIENTS.map(ingredient => (
                                    <button
                                      key={ingredient.name}
                                      type="button"
                                      onClick={() => addExtraIngredient(item.producto_id, ingredient)}
                                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100 transition border border-blue-200"
                                      title={`Agregar ${ingredient.name} (+$${ingredient.price})`}
                                    >
                                      {ingredient.icon} {ingredient.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">${calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCart([]);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cart.length === 0}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Completar Venta (${calculateTotal()})
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}


        
      {showEditModal && selectedSell && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className={`${modalBg} rounded-2xl p-0 w-full max-w-5xl flex flex-col shadow-xl mt-24`}>
      {/* Título arriba */}
      <div className="flex items-center gap-4 px-8 pt-8 pb-2 border-b">
        <FaEdit className={`text-3xl ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
        <h2 className={`text-2xl font-bold ${modalTitle}`}>Editar Venta</h2>
      </div>
      <div className="px-10 py-10 text-[18px] overflow-y-auto max-h-[70vh]">
        <form onSubmit={e => { e.preventDefault(); handleEditSell(); }}>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Productos en venta */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Productos en Venta</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {editCart.map(item => (
                  <div key={item.producto_id} className="border rounded-lg p-4 flex gap-3 items-center">
                    <div>
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="w-12 h-12 rounded-full object-cover border" />
                      ) : (
                        <FaBoxOpen className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.nombre}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setEditCart(editCart.map(i => i.producto_id === item.producto_id ? { ...i, cantidad: Math.max(1, i.cantidad - 1), subtotal: (Math.max(1, i.cantidad - 1) * i.precio_unitario) } : i))}
                          className="bg-gray-200 w-6 h-6 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => setEditCart(editCart.map(i => i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1, subtotal: ((i.cantidad + 1) * i.precio_unitario) } : i))}
                          className="bg-gray-200 w-6 h-6 rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">${item.precio_unitario} base</p>
                        <p className="font-bold">${item.subtotal}</p>
                      </div>
                      {item.isTorta && (
                        <div className="border-t pt-3">
                          <h5 className="text-sm font-semibold mb-2">🌶️ Ingredientes Extra (+$5 c/u)</h5>
                          {item.extraIngredients && item.extraIngredients.length > 0 && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.extraIngredients.map(extra => (
                                  <span key={extra.name} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                    {extra.icon} {extra.name} x{extra.quantity}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditCart(editCart.map(i =>
                                          i.producto_id === item.producto_id
                                            ? {
                                                ...i,
                                                extraIngredients: (i.extraIngredients ?? [])
                                                  .map(e =>
                                                    e.name === extra.name
                                                      ? { ...e, quantity: Math.max(0, e.quantity - 1) }
                                                      : e
                                                  )
                                                  .filter(e => e.quantity > 0),
                                                subtotal:
                                                  (i.cantidad * i.precio_unitario) +
                                                  ((i.extraIngredients ?? [])
                                                    .map(e =>
                                                      e.name === extra.name
                                                        ? { ...e, quantity: Math.max(0, e.quantity - 1) }
                                                        : e
                                                    )
                                                    .filter(e => e.quantity > 0)
                                                    .reduce((sum, e) => sum + (e.price * e.quantity * i.cantidad), 0))
                                              }
                                            : i
                                        ));
                                      }}
                                      className="text-red-500 hover:text-red-700 ml-1"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-1">
                            {EXTRA_INGREDIENTS.map(ingredient => (
                              <button
                                key={ingredient.name}
                                type="button"
                                onClick={() => {
                                  setEditCart(editCart.map(i => {
                                    if (i.producto_id === item.producto_id) {
                                      const existingExtra = i.extraIngredients?.find(e => e.name === ingredient.name);
                                      let updatedExtras;
                                      if (existingExtra) {
                                        updatedExtras = (i.extraIngredients ?? []).map(e =>
                                          e.name === ingredient.name
                                            ? { ...e, quantity: e.quantity + 1 }
                                            : e
                                        );
                                      } else {
                                        updatedExtras = [...(i.extraIngredients || []), { ...ingredient, quantity: 1 }];
                                      }
                                      const extraCost = updatedExtras.reduce((sum, e) => sum + (e.price * e.quantity * i.cantidad), 0);
                                      return {
                                        ...i,
                                        extraIngredients: updatedExtras,
                                        subtotal: (i.cantidad * i.precio_unitario) + extraCost
                                      };
                                    }
                                    return i;
                                  }));
                                }}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100 transition border border-blue-200"
                                title={`Agregar ${ingredient.name} (+$${ingredient.price})`}
                              >
                                {ingredient.icon} {ingredient.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditCart(editCart.filter(i => i.producto_id !== item.producto_id))}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Agregar productos */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Agregar Productos</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {products.map(product => (
                  <div key={product._id} className="border rounded-lg p-3 flex gap-3 items-center">
                    <div>
                      {product.imagen ? (
                        <img src={product.imagen} alt={product.nombre} className="w-12 h-12 rounded-full object-cover border" />
                      ) : (
                        <FaBoxOpen className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{product.nombre}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        ${product.precio} - {product.tipo}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editCart.find(i => i.producto_id === product._id)) {
                          setEditCart([...editCart, {
                            producto_id: product._id,
                            nombre: product.nombre,
                            cantidad: 1,
                            precio_unitario: product.precio,
                            subtotal: product.precio,
                            imagen: product.imagen,
                            extraIngredients: [],
                            isTorta: isTorta(product.nombre)
                          }]);
                        }
                      }}
                      className="px-3 py-1 rounded text-sm bg-primary text-white hover:bg-secondary"
                    >
                      + Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Botones fijos abajo */}
          <div className="sticky bottom-0 left-0 right-0 px-1 py-1 flex gap-2 z-40 bg-white/95 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}


        
        {showViewModal && selectedSell && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === "dark" ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200"} rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme === "dark" ? "text-amber-400" : "text-primary"}`}><FaEye /> Detalles de Venta</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID de Venta</p>
                    <p className="font-semibold">#{selectedSell._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-semibold">
                      {new Date(selectedSell.fecha).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vendedor</p>
                    <p className="font-semibold">{getUserName(selectedSell.vendedor_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedSell.status === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSell.status}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Productos</h3>
                  <div className="space-y-2">
                    {selectedSell.productos?.map((producto, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 flex gap-3 items-center">
                        <div>
                          {products.find(prod => prod._id === producto.producto_id && prod.imagen) ? (
                            <img src={products.find(prod => prod._id === producto.producto_id).imagen} alt={producto.nombre} className="w-10 h-10 rounded-full object-cover border" />
                          ) : (
                            <FaBoxOpen className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            ${producto.precio_unitario} x {producto.cantidad}
                          </p>
                          {producto.extraIngredients && producto.extraIngredients.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">Extras:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {producto.extraIngredients.map(extra => (
                                  <span key={extra.name} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {extra.icon} {extra.name} x{extra.quantity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${producto.subtotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${selectedSell.total}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)
};