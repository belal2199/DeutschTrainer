import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLifeNoun {
  article: 'der' | 'die' | 'das';
  german: string;
  english: string;
}

export interface IDailyLifeVerb {
  infinitiv: string;
  english: string;
}

export interface IDailyLifeSentence {
  german: string;
  english: string;
}

export interface IDailyLifeTopic extends Document {
  topicId: string;
  title: string;
  titleDe: string;
  emoji: string;
  level: 'B1/B2';
  nouns: IDailyLifeNoun[];
  verbs: IDailyLifeVerb[];
  sentencesHear: IDailyLifeSentence[];
  sentencesSay: IDailyLifeSentence[];
  dialect: string[];
  proTip: string;
}

const nounSchema = new Schema<IDailyLifeNoun>(
  {
    article: { type: String, enum: ['der', 'die', 'das'], required: true },
    german: { type: String, required: true },
    english: { type: String, required: true },
  },
  { _id: false },
);

const verbSchema = new Schema<IDailyLifeVerb>(
  {
    infinitiv: { type: String, required: true },
    english: { type: String, required: true },
  },
  { _id: false },
);

const sentenceSchema = new Schema<IDailyLifeSentence>(
  {
    german: { type: String, required: true },
    english: { type: String, required: true },
  },
  { _id: false },
);

const DailyLifeTopicSchema = new Schema<IDailyLifeTopic>(
  {
    topicId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleDe: { type: String, required: true },
    emoji: { type: String, required: true },
    level: { type: String, default: 'B1/B2', required: true },
    nouns: { type: [nounSchema], default: [] },
    verbs: { type: [verbSchema], default: [] },
    sentencesHear: { type: [sentenceSchema], default: [] },
    sentencesSay: { type: [sentenceSchema], default: [] },
    dialect: { type: [String], default: [] },
    proTip: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model<IDailyLifeTopic>('DailyLifeTopic', DailyLifeTopicSchema);