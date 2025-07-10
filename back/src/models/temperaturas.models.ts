import { Schema, model, Document } from 'mongoose';

export interface ITemperatura extends Document {
  fecha: Date;
  temperatura: number;
}

const temperaturaSchema = new Schema<ITemperatura>({
  fecha: { type: Date, default: Date.now },
  temperatura: { type: Number, required: true }
});

export default model<ITemperatura>('Temperatura', temperaturaSchema);
