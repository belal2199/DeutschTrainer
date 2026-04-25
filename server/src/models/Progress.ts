import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  date: Date;
  verbsPracticed: number;
  nounsPracticed: number;
  adjsPracticed: number;
  sentencesPracticed: number;
  refemittelPracticed: number;
  flashcardScore: { correct: number; wrong: number };
}

const ProgressSchema = new Schema<IProgress>({
  date: { type: Date, required: true },
  verbsPracticed: { type: Number, default: 0 },
  nounsPracticed: { type: Number, default: 0 },
  adjsPracticed: { type: Number, default: 0 },
  sentencesPracticed: { type: Number, default: 0 },
  refemittelPracticed: { type: Number, default: 0 },
  flashcardScore: {
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
  },
});

export default mongoose.model<IProgress>('Progress', ProgressSchema);
