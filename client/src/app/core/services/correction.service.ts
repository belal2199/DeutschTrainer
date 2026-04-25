import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

export interface CorrectionHistoryItem {
  timestamp: Date;
  preview: string;
  status: CorrectionStatus;
  result: CorrectionResult;
}

const HISTORY_LIMIT = 5;

@Injectable({ providedIn: 'root' })
export class CorrectionService {
  readonly correctionHistory = signal<CorrectionHistoryItem[]>([]);

  constructor(private http: HttpClient) {}

  correctSentence(text: string, context?: string): Observable<CorrectionResult> {
    return this.http
      .post<CorrectionResult>('/api/correct', { text, context, mode: 'sentence' });
  }

  correctFreeText(text: string): Observable<CorrectionResult> {
    return this.http
      .post<CorrectionResult>('/api/correct', { text, mode: 'free' })
      .pipe(tap((result) => this.pushHistory(text, result)));
  }

  clearHistory(): void {
    this.correctionHistory.set([]);
  }

  private pushHistory(originalText: string, result: CorrectionResult): void {
    const item: CorrectionHistoryItem = {
      timestamp: new Date(),
      preview: originalText.slice(0, 60) + (originalText.length > 60 ? '…' : ''),
      status: result.status,
      result,
    };
    this.correctionHistory.update((list) => [item, ...list].slice(0, HISTORY_LIMIT));
  }
}
