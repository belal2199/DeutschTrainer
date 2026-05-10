import mongoose, { Schema, Document } from 'mongoose';

export interface INoun extends Document {
  word: string;
  plural: string;
  english: string;
  category: string;
  example: string;
  exampleEn: string;
  level: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

const NounSchema = new Schema<INoun>({
  word: { type: String, required: true, unique: true },
  plural: { type: String, default: '' },
  english: { type: String, required: true },
  category: { type: String, required: true },
  example: { type: String, default: '' },
  exampleEn: { type: String, default: '' },
  level: { type: String, default: 'A2' },
  practiced: { type: Boolean, default: false },
  lastPracticed: { type: Date, default: null },
});

export default mongoose.model<INoun>('Noun', NounSchema);
