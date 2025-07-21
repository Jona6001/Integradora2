import { Schema, model, Document } from 'mongoose';

interface IExtraIngredient {
  name: string;
  price: number;
  icon: string;
  quantity: number;
}

interface IProductoVenta {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  extraIngredients?: IExtraIngredient[];
}

export interface IVenta extends Document {
  fecha: Date;
  productos: IProductoVenta[];
  total: number;
  vendedor_id?: number;
  status?: string;
}

const extraIngredientSchema = new Schema<IExtraIngredient>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String },
  quantity: { type: Number, required: true }
}, { _id: false });

const productoVentaSchema = new Schema<IProductoVenta>({
  producto_id: { type: Number, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  extraIngredients: [extraIngredientSchema],
}, { _id: false });

const ventaSchema = new Schema<IVenta>({
  fecha: { type: Date, default: Date.now },
  productos: [productoVentaSchema],
  total: { type: Number, required: true },
  vendedor_id: { type: Number },
  status: { type: String, default: 'activo' }
});

export default model<IVenta>('Venta', ventaSchema);