import { Request, Response } from "express";
import Sell from "../models/ventas.models";
import Stock from "../models/inventario.models";

// Mapeo EXACTO de productos a ingredientes de stock con tipos apropiados
const PRODUCT_INGREDIENTS_MAP: Record<string, string[]> = {
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
    
    // Bebidas - control directo (nombres EXACTOS)
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

// Función para actualizar stock después de una venta
const updateStockAfterSale = async (productos: any[]): Promise<void> => {
    try {
        console.log('\n🔄 ==> INICIANDO ACTUALIZACIÓN DE STOCK <==');
        console.log('🛍️ Productos en venta:', productos.map(p => `${p.nombre} (${p.cantidad})`));
        
        for (const producto of productos) {
            console.log(`\n📦 Procesando: "${producto.nombre}" (cantidad: ${producto.cantidad})`);
            
            // Verificar si existe mapeo para este producto
            const ingredientesRequeridos = PRODUCT_INGREDIENTS_MAP[producto.nombre];
            
            if (!ingredientesRequeridos) {
                console.log(`⚠️ "${producto.nombre}" NO está mapeado para reducir stock`);
                continue;
            }
            
            console.log(`✅ "${producto.nombre}" requiere: ${ingredientesRequeridos.join(', ')}`);
            
            // Reducir cada ingrediente del stock
            for (const ingrediente of ingredientesRequeridos) {
                console.log(`🔍 Buscando en stock: "${ingrediente}"`);
                
                // Buscar el producto EXACTO en stock
                const stockItem = await Stock.findOne({ 
                    producto: ingrediente,
                    status: "activo"
                });

                if (stockItem) {
                    const cantidadAnterior = stockItem.cantidad;
                    const cantidadAReducir = producto.cantidad;
                    const nuevaCantidad = Math.max(0, cantidadAnterior - cantidadAReducir);
                    
                    await Stock.findByIdAndUpdate(
                        stockItem._id,
                        { 
                            cantidad: nuevaCantidad,
                            actualizadoEn: new Date()
                        }
                    );

                    console.log(`✅ STOCK ACTUALIZADO: "${ingrediente}"`);
                    console.log(`   - Cantidad anterior: ${cantidadAnterior}`);
                    console.log(`   - Cantidad reducida: ${cantidadAReducir}`);
                    console.log(`   - Cantidad nueva: ${nuevaCantidad}`);
                } else {
                    console.error(`❌ INGREDIENTE "${ingrediente}" NO ENCONTRADO EN STOCK`);
                    
                    // Mostrar todos los productos disponibles para debug
                    const allStock = await Stock.find({ status: "activo" });
                    console.log('📋 Productos disponibles en stock:');
                    allStock.forEach(s => console.log(`   - "${s.producto}" (${s.cantidad} ${s.unidad})`));
                }
            }
        }
        
        console.log('✅ ACTUALIZACIÓN DE STOCK COMPLETADA\n');
    } catch (error) {
        console.error('❌ ERROR ACTUALIZANDO STOCK:', error);
        throw error;
    }
};

// Crear venta CON REDUCCIÓN DE STOCK
export const createSell = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productos, total, vendedor_id, status } = req.body;
        
        console.log('\n📝 ==> CREANDO NUEVA VENTA <==');
        console.log('📦 Productos recibidos:', JSON.stringify(productos, null, 2));
        
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            res.status(400).json({ message: "Se requiere al menos un producto" });
            return;
        }

        if (!total || total <= 0) {
            res.status(400).json({ message: "El total debe ser mayor a 0" });
            return;
        }

        // Crear la venta PRIMERO
        const newSell = new Sell({
            productos,
            total,
            vendedor_id,
            status: status || "activo",
            fecha: new Date()
        });
        
        const sell = await newSell.save();
        console.log('✅ Venta creada con ID:', sell._id);

        // Actualizar stock DESPUÉS de crear la venta
        await updateStockAfterSale(productos);
        
        res.status(201).json({ 
            message: "Venta creada exitosamente y stock actualizado", 
            sell 
        });
    } catch (error) {
        console.error('❌ ERROR CREANDO VENTA:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ message: "Error al crear venta", error: errorMessage });
    }
};

// Obtener todas las ventas
export const getAllSells = async (req: Request, res: Response): Promise<void> => {
    try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 15);
        
        const sellsList = await Sell.find({
            fecha: { $gte: fechaLimite },
            status: { $ne: "inactivo" }
        }).sort({ fecha: -1 });
        
        res.json({ sellsList });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las ventas", error });
    }
};

// Obtener una venta por ID
export const getSellById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const sell = await Sell.findById(id);
        if (!sell) {
            res.status(404).json({ message: "Venta no encontrada" });
            return;
        }
        res.json({ sell });
    } catch (error) {
        res.status(500).json({ message: "Error al buscar la venta", error });
    }
};

// Actualizar venta
export const updateSell = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { productos, total, vendedor_id, status } = req.body;
        
        const existingSell = await Sell.findById(id);
        if (!existingSell) {
            res.status(404).json({ message: "Venta no encontrada" });
            return;
        }

        const updateData: any = {};
        if (productos && Array.isArray(productos) && productos.length > 0) {
            updateData.productos = productos;
        }
        if (total !== undefined && total > 0) {
            updateData.total = total;
        }
        if (vendedor_id !== undefined) {
            updateData.vendedor_id = vendedor_id;
        }
        if (status) {
            updateData.status = status;
        }

        const sell = await Sell.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ message: "Venta actualizada exitosamente", sell });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar venta", error });
    }
};

// Eliminar venta
export const deleteSell = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const sell = await Sell.findByIdAndUpdate(
            id,
            { status: "inactivo" },
            { new: true }
        );

        if (!sell) {
            res.status(404).json({ message: "No se pudo eliminar la venta" });
            return;
        }

        res.json({ message: "Venta eliminada exitosamente", sell });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar venta", error });
    }
};

// Endpoint de debug para verificar mapeo
export const debugStockMapping = async (req: Request, res: Response): Promise<void> => {
    try {
        const stockList = await Stock.find({ status: "activo" });
        
        res.json({
            message: "Debug de mapeo stock-productos",
            mapeoProductos: PRODUCT_INGREDIENTS_MAP,
            stockDisponible: stockList.map(s => ({
                id: s._id,
                producto: s.producto,
                cantidad: s.cantidad,
                unidad: s.unidad
            })),
            verificacion: {
                productosConMapeo: Object.keys(PRODUCT_INGREDIENTS_MAP).length,
                productosEnStock: stockList.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en debug", error });
    }
};