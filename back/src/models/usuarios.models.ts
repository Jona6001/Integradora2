import { Schema, model, Document } from 'mongoose';

export interface IUsuario extends Document {
  nombre: string;
  apellidos: string;
  role: 'empleado' | 'gerente' | 'admin';
  telefono?: string;
  direccion?: string;
  password: string;
  email: string;
  status?: 'activo' | 'inactivo';
  creadoEn?: Date;
}

const usuarioSchema = new Schema<IUsuario>({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  role: { type: String, enum: ['empleado', 'gerente', 'admin'], required: true },
  telefono: { type: String },
  direccion: { type: String },
  password: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El formato del correo no es válido']
  },
  status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  creadoEn: { type: Date, default: Date.now }
});

export default model<IUsuario>('Usuario', usuarioSchema);
