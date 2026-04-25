export type CorrectionStatus = 'correct' | 'minor' | 'errors';
export type CorrectionType = 'grammar' | 'spelling' | 'word_order' | 'vocabulary' | 'article';
export type CorrectionMode = 'sentence' | 'free';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  type: CorrectionType;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  isCorrect: boolean;
  status: CorrectionStatus;
  corrections: CorrectionItem[];
  overallFeedback: string;
  processingTime: number;
}

export interface CorrectionRequest {
  text: string;
  context?: string;
  mode: CorrectionMode;
}

export interface CorrectionHistoryItem {
  timestamp: Date;
  preview: string;
  status: CorrectionStatus;
  result: CorrectionResult;
}
