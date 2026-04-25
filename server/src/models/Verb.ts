import mongoose, { Schema, Document } from 'mongoose';

export interface IVerb extends Document {
  infinitiv: string;
  english: string;
  perfekt: string;
  category: string;
  example: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

const VerbSchema = new Schema<IVerb>({
  infinitiv: { type: String, required: true, unique: true },
  english: { type: String, required: true },
  perfekt: { type: String, required: true },
  category: { type: String, required: true },
  example: { type: String, default: '' },
  practiced: { type: Boolean, default: false },
  lastPracticed: { type: Date, default: null },
});

export default mongoose.model<IVerb>('Verb', VerbSchema);
