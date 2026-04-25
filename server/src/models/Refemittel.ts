import mongoose, { Schema, Document } from 'mongoose';

export interface IRefemittel extends Document {
  phrase: string;
  english: string;
  useCase: string;
  category: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

const RefemittelSchema = new Schema<IRefemittel>({
  phrase: { type: String, required: true, unique: true },
  english: { type: String, required: true },
  useCase: { type: String, default: '' },
  category: { type: String, required: true },
  practiced: { type: Boolean, default: false },
  lastPracticed: { type: Date, default: null },
});

export default mongoose.model<IRefemittel>('Refemittel', RefemittelSchema);
