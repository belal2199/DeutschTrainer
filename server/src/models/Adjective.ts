import mongoose, { Schema, Document } from 'mongoose';

export interface IAdjective extends Document {
  word: string;
  english: string;
  opposite: string;
  category: string;
  example: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

const AdjectiveSchema = new Schema<IAdjective>({
  word: { type: String, required: true, unique: true },
  english: { type: String, required: true },
  opposite: { type: String, default: '' },
  category: { type: String, required: true },
  example: { type: String, default: '' },
  practiced: { type: Boolean, default: false },
  lastPracticed: { type: Date, default: null },
});

export default mongoose.model<IAdjective>('Adjective', AdjectiveSchema);
