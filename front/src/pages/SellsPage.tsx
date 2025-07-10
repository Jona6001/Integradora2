import React, { useState, useEffect } from "react";
import apiService from "../services/api";

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
  extraIngredients?: ExtraIngredient[];
  isTorta?: boolean;
};

export default function SellsPage({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const [sells, setSells] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSell, setSelectedSell] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vendedorId] = useState(1);

  // Mapeo de productos a ingredientes (NOMBRES EXACTOS como en stock)
  const PRODUCT_INGREDIENTS_MAP = {
    // Tortas - todas requieren Pan
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
    
    // Bebidas - control directo (nombres exactos)
    "Coca-Cola": ["Coca-Cola"],
    "Pepsi": ["Pepsi"],
    "Agua Natural": ["Agua Natural"],
    "Agua de Horchata": ["Agua de Horchata"],
    "Agua de Jamaica": ["Agua de Jamaica"],
    "Agua de Tamarindo": ["Agua de Tamarindo"],
    "Refresco": ["Refresco"],
    
    // Pan individual
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
      const [sellsResponse, productsResponse, stockResponse] = await Promise.all([
        apiService.getAllSells(),
        apiService.getAllProducts(),
        apiService.getAllStock()
      ]);
      
      if (sellsResponse.sellsList) {
        setSells(sellsResponse.sellsList);
      }
      if (productsResponse.productsList) {
        setProducts(productsResponse.productsList.filter(p => p.status === 'activo'));
      }
      if (stockResponse.stockList) {
        setStock(stockResponse.stockList.filter(s => s.status === 'activo'));
        
        // Debug mejorado
        console.log('🔍 DEBUG STOCK FRONTEND:');
        console.log('📦 Stock cargado:');
        stockResponse.stockList.filter(s => s.status === 'activo').forEach(s => {
          console.log(`  - "${s.producto}": ${s.cantidad} ${s.unidad}`);
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
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
  const addToCart = (productId) => {
    const product = products.find(p => p._id === parseInt(productId));
    if (!product) return;

    const existingItem = cart.find(item => item.producto_id === product._id);
    const currentQuantity = existingItem ? existingItem.cantidad : 0;
    const newQuantity = currentQuantity + 1;

    // Verificar ingredientes disponibles
    const ingredientCheck = checkIngredientsAvailability(product.nombre, newQuantity);
    if (!ingredientCheck.available) {
      alert(ingredientCheck.message);
      return;
    }
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.producto_id === product._id 
          ? { 
              ...item, 
              cantidad: newQuantity, 
              subtotal: (newQuantity * item.precio_unitario) + (item.extraIngredients?.reduce((sum, extra) => sum + (extra.price * extra.quantity * newQuantity), 0) || 0)
            }
          : item
      ));
    } else {
      setCart([...cart, {
        producto_id: product._id,
        nombre: product.nombre,
        cantidad: 1,
        precio_unitario: product.precio,
        subtotal: product.precio,
        extraIngredients: [],
        isTorta: isTorta(product.nombre)
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.producto_id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p._id === productId);
    if (product) {
      const ingredientCheck = checkIngredientsAvailability(product.nombre, newQuantity);
      if (!ingredientCheck.available) {
        alert(ingredientCheck.message);
        return;
      }
    }

    setCart(cart.map(item => 
      item.producto_id === productId 
        ? { 
            ...item, 
            cantidad: newQuantity, 
            subtotal: (newQuantity * item.precio_unitario) + (item.extraIngredients?.reduce((sum, extra) => sum + (extra.price * extra.quantity * newQuantity), 0) || 0)
          }
        : item
    ));
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

  const handleCreateSale = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Agrega al menos un producto al carrito');
      return;
    }

    // Verificación final de ingredientes antes de enviar
    for (const item of cart) {
      const ingredientCheck = checkIngredientsAvailability(item.nombre, item.cantidad);
      if (!ingredientCheck.available) {
        alert(ingredientCheck.message);
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
      
      console.log('📤 Enviando venta:', saleData);
      
      await apiService.createSell(saleData);
      setCart([]);
      setShowCreateModal(false);
      loadData(); // Recargar datos para ver el stock actualizado
      alert('Venta creada exitosamente y stock actualizado');
    } catch (error) {
      console.error('Error creando venta:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error al crear la venta');
      }
    }
  };

  const handleDeleteSell = async (sellId) => {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      try {
        await apiService.deleteSell(sellId);
        loadData();
        alert('Venta eliminada exitosamente');
      } catch (error) {
        console.error('Error eliminando venta:', error);
        alert('Error al eliminar la venta');
      }
    }
  };

  const openViewModal = (sell) => {
    setSelectedSell(sell);
    setShowViewModal(true);
  };

  // Función para obtener el tipo de producto
  const getProductType = (productName) => {
    if (productName.toLowerCase().includes('torta')) return 'torta';
    if (productName.toLowerCase().includes('coca') || productName.toLowerCase().includes('pepsi') || productName.toLowerCase().includes('agua')) return 'bebida';
    if (productName.toLowerCase().includes('pan') || productName.toLowerCase().includes('bolillo')) return 'pan';
    return 'otro';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-primary font-semibold">Cargando ventas...</p>
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
              💰 Gestión de Ventas
            </h1>
            <p className="text-white/70">Control de ventas con reducción automática de stock</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
          >
            🛒 Nueva Venta
          </button>
        </div>

        {/* Info panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 text-white">
            <div className="text-2xl">🌮</div>
            <div>
              <h3 className="font-semibold">Sistema de Reducción Automática de Stock</h3>
              <p className="text-sm text-white/80">
                Las tortas reducen "Pan" del stock automáticamente. Las bebidas reducen su producto específico.
              </p>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-left">Productos</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Vendedor</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sells.map((sell, index) => (
                  <tr key={sell._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-mono text-sm">#{sell._id}</td>
                    <td className="px-6 py-4">
                      {new Date(sell.fecha).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {sell.productos?.length || 0} productos
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600 text-lg">${sell.total}</span>
                    </td>
                    <td className="px-6 py-4">ID: {sell.vendedor_id || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sell.status === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sell.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openViewModal(sell)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition"
                        >
                          👁️ Ver
                        </button>
                        <button 
                          onClick={() => handleDeleteSell(sell._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {sells.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-white text-xl mb-4">No hay ventas registradas</p>
              <p className="text-white/60 mb-6">en los últimos 15 días</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300"
              >
                Realizar primera venta
              </button>
            </div>
          </div>
        )}

        {/* Create Sale Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-primary">🛒 Nueva Venta</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productos disponibles */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Productos Disponibles</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
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
                        <div key={product._id} className={`border rounded-lg p-3 ${
                          !canMake ? 'bg-red-50 border-red-200' : ''
                        }`}>
                          <div className="flex justify-between items-start">
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Carrito */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Carrito de Compra</h3>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>Carrito vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map(item => {
                        const requiredIngredients = getRequiredIngredients(item.nombre, item.cantidad);
                        
                        return (
                          <div key={item.producto_id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
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
                              <button
                                onClick={() => removeFromCart(item.producto_id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateCartQuantity(item.producto_id, item.cantidad - 1)}
                                  className="bg-gray-200 w-6 h-6 rounded flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{item.cantidad}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.producto_id, item.cantidad + 1)}
                                  className="bg-gray-200 w-6 h-6 rounded flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">${item.precio_unitario} base</p>
                                <p className="font-bold">${item.subtotal}</p>
                              </div>
                            </div>

                            {/* Ingredientes extra - Solo para tortas */}
                            {item.isTorta && (
                              <div className="border-t pt-3">
                                <h5 className="text-sm font-semibold mb-2">🌶️ Ingredientes Extra (+$5 c/u)</h5>
                                
                                {/* Mostrar ingredientes agregados */}
                                {item.extraIngredients && item.extraIngredients.length > 0 && (
                                  <div className="mb-2">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {item.extraIngredients.map(extra => (
                                        <span key={extra.name} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                          {extra.icon} {extra.name} x{extra.quantity}
                                          <button
                                            onClick={() => removeExtraIngredient(item.producto_id, extra.name)}
                                            className="text-red-500 hover:text-red-700 ml-1"
                                          >
                                            ✕
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Botones para agregar ingredientes */}
                                <div className="grid grid-cols-3 gap-1">
                                  {EXTRA_INGREDIENTS.map(ingredient => (
                                    <button
                                      key={ingredient.name}
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

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCart([]);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSale}
                  disabled={cart.length === 0}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Completar Venta (${calculateTotal()})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedSell && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-primary">👁️ Detalles de Venta</h2>
              
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
                    <p className="font-semibold">ID: {selectedSell.vendedor_id}</p>
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
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
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
  );
}