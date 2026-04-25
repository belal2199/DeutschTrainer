export interface Verb {
  _id?: string;
  infinitiv: string;
  english: string;
  perfekt: string;
  category: string;
  example: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

export interface Noun {
  _id?: string;
  word: string;
  plural: string;
  english: string;
  category: string;
  example: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

export interface Adjective {
  _id?: string;
  word: string;
  english: string;
  opposite: string;
  category: string;
  example: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

export interface Sentence {
  _id?: string;
  german: string;
  english: string;
  verbUsed: string;
  nounUsed: string;
  adjUsed: string;
  category: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

export interface Refemittel {
  _id?: string;
  phrase: string;
  english: string;
  useCase: string;
  category: string;
  practiced: boolean;
  lastPracticed: Date | null;
}

export interface Progress {
  _id?: string;
  date: Date;
  verbsPracticed: number;
  nounsPracticed: number;
  adjsPracticed: number;
  sentencesPracticed: number;
  refemittelPracticed: number;
  flashcardScore: { correct: number; wrong: number };
}

export interface Stats {
  totalVerbs: number;
  totalNouns: number;
  totalAdjectives: number;
  totalSentences: number;
  totalRefemittel: number;
  practicedVerbs: number;
  practicedNouns: number;
  practicedAdjectives: number;
  practicedSentences: number;
  practicedRefemittel: number;
  streak: number;
}
