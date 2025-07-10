import { Schema, model, Document } from 'mongoose';

export interface IStock extends Document {
  _id: number;
  producto: string;
  cantidad: number;
  unidad: 'piezas' | 'gramos';
  status?: 'activo' | 'inactivo';
  actualizadoEn?: Date;
}

const stockSchema = new Schema<IStock>({
  _id: { type: Number, required: true },
  producto: { type: String, required: true },
  cantidad: { type: Number, default: 0 },
  unidad: { type: String, enum: ['piezas', 'gramos'], required: true },
  status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  actualizadoEn: { type: Date, default: Date.now }
});

export default model<IStock>('Stock', stockSchema);
