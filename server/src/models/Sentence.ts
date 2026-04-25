import mongoose, { Schema, Document } from 'mongoose';

export interface ISentence extends Document {
  german: string;
  english: string;
  verbUsed: string;
  nounUsed: string;
  adjUsed: string;
  category: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

const SentenceSchema = new Schema<ISentence>({
  german: { type: String, required: true, unique: true },
  english: { type: String, required: true },
  verbUsed: { type: String, default: '' },
  nounUsed: { type: String, default: '' },
  adjUsed: { type: String, default: '' },
  category: { type: String, required: true },
  practiced: { type: Boolean, default: false },
  lastPracticed: { type: Date, default: null },
});

export default mongoose.model<ISentence>('Sentence', SentenceSchema);
