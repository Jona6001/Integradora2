import { Request, Response } from "express";
import Stock from "../models/inventario.models";

// Obtener todos los productos de Stock
export const getAllStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const stockList = await Stock.find();
        res.json({ stockList });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el stock", error });
    }
};

// Obtener un producto de Stock por ID
export const getStockById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const stock = await Stock.findById(id);
        if (!stock) {
            res.status(404).json({ message: "Producto de stock no encontrado" });
            return;
        }
        res.json({ stock });
    } catch (error) {
        res.status(500).json({ message: "Error al buscar el producto de stock", error });
    }
};

// Crear producto de Stock
export const createStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { _id, producto, cantidad, unidad, status } = req.body;
        const newStock = new Stock({
            _id,
            producto,
            cantidad,
            unidad,
            status: status || "activo",
            actualizadoEn: new Date()
        });
        const stock = await newStock.save();
        res.status(201).json({ message: "Producto de stock creado exitosamente", stock });
    } catch (error) {
        res.status(500).json({ message: "Error al crear producto de stock", error });
    }
};

// Actualizar producto de Stock
export const updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { producto, cantidad, unidad, status } = req.body;
        const updateData: any = {};
        if (producto) updateData.producto = producto;
        if (cantidad !== undefined) updateData.cantidad = cantidad;
        if (unidad) updateData.unidad = unidad;
        if (status) updateData.status = status;
        updateData.actualizadoEn = new Date();

        const stock = await Stock.findByIdAndUpdate(id, updateData, { new: true });
        if (!stock) {
            res.status(404).json({ message: "Producto de stock no encontrado" });
            return;
        }
        res.json({ message: "Producto de stock actualizado", stock });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar producto de stock", error });
    }
};

// Eliminar (dar de baja) producto de Stock
export const deleteStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const stock = await Stock.findByIdAndUpdate(
            id,
            { status: "inactivo", actualizadoEn: new Date() },
            { new: true }
        );
        if (!stock) {
            res.status(404).json({ message: "No se pudo eliminar el producto de stock" });
            return;
        }
        res.json({ message: "Producto de stock dado de baja", stock });
    } catch (error) {
        res.status(500).json({ message: "Error al dar de baja producto de stock", error });
    }
};