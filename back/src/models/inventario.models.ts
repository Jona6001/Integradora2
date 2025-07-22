import { Schema, model, Document } from 'mongoose';

export interface IStock extends Document {
  _id: number;
  producto: string;
  cantidad: number;
  unidad: 'piezas'; // Solo piezas
  status?: 'activo' | 'inactivo';
  actualizadoEn?: Date;
  imagen?: string; // <-- Nuevo campo
}

const stockSchema = new Schema<IStock>({
  _id: { type: Number, required: true },
  producto: { type: String, required: true },
  cantidad: { type: Number, default: 0 },
  unidad: { type: String, enum: ['piezas'], required: true }, // Solo piezas
  status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  actualizadoEn: { type: Date, default: Date.now },
  imagen: { type: String } // <-- Nuevo campo
});

export default model<IStock>('Stock', stockSchema);
