import { Request, Response } from "express";
import Product from "../models/productos.models";

// Obtener todos los productos
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const productsList = await Product.find();
        res.json({ productsList });
    } catch (error) {
        res.status(500).json({ message: "Error al encontrar los productos", error });
    }
};

// Obtener un producto por ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: "Producto no encontrado" });
            return;
        }
        res.json({ product });
    } catch (error) {
        res.status(500).json({ message: "Error al buscar el producto", error });
    }
};



// Crear producto
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { _id, nombre, precio, tipo, status, imagen } = req.body; // <-- agrega imagen aquí
        const newProduct = new Product({
            _id,
            nombre,
            precio,
            tipo,
            status: status || "activo",
            creadoEn: new Date(),
            imagen // <-- agrega imagen aquí
        });
        const product = await newProduct.save();
        res.status(201).json({ message: "Producto creado exitosamente", product });
    } catch (error) {
        res.status(500).json({ message: "Error al crear producto", error });
    }
};

// Actualizar producto
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { nombre, precio, tipo, status, imagen } = req.body; // <-- agrega imagen aquí
        const updateData: any = {};
        if (nombre) updateData.nombre = nombre;
        if (precio) updateData.precio = precio;
        if (tipo) updateData.tipo = tipo;
        if (status) updateData.status = status;
        if (imagen !== undefined) updateData.imagen = imagen; // <-- agrega imagen aquí

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            res.status(404).json({ message: "Producto no encontrado" });
            return;
        }
        res.json({ message: "Producto actualizado", product });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar producto", error });
    }
};


// Eliminar (dar de baja) producto
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(
            id,
            { status: "inactivo" },
            { new: true }
        );
        if (!product) {
            res.status(404).json({ message: "No se pudo eliminar el producto" });
            return;
        }
        res.json({ message: "Producto dado de baja", product });
    } catch (error) {
        res.status(500).json({ message: "Error al dar de baja producto", error });
    }
};