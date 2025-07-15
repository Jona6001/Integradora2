import { Schema, model, Document } from 'mongoose';
export interface IProducto extends Document {
  _id: number;
  nombre: string;
  precio: number;
  tipo: 'torta' | 'bebida' | 'ingrediente';
  status?: 'activo' | 'inactivo';
  creadoEn?: Date;
  imagen?: string; 
}

const productoSchema = new Schema<IProducto>({
  _id: { type: Number, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  tipo: { type: String, enum: ['torta', 'bebida', 'ingrediente'], required: true },
  status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  creadoEn: { type: Date, default: Date.now },
  imagen: { type: String }  
});

export default model<IProducto>('Producto', productoSchema);