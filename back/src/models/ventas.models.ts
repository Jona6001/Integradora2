import { Schema, model, Document } from 'mongoose';

interface IProductoVenta {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface IVenta extends Document {
  fecha: Date;
  productos: IProductoVenta[];
  total: number;
  vendedor_id?: number;
  status?: string;
}

const productoVentaSchema = new Schema<IProductoVenta>({
  producto_id: { type: Number, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const ventaSchema = new Schema<IVenta>({
  fecha: { type: Date, default: Date.now },
  productos: [productoVentaSchema],
  total: { type: Number, required: true },
  vendedor_id: { type: Number },
  status: { type: String, default: 'activo' }
});

export default model<IVenta>('Venta', ventaSchema);
