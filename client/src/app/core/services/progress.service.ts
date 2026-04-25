import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Progress {
  _id?: string;
  date: string;
  verbsPracticed: number;
  nounsPracticed: number;
  adjsPracticed: number;
  sentencesPracticed: number;
  refemittelPracticed: number;
  flashcardScore: { correct: number; wrong: number };
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private session = {
    verbsPracticed: 0,
    nounsPracticed: 0,
    adjsPracticed: 0,
    sentencesPracticed: 0,
    refemittelPracticed: 0,
    flashcardScore: { correct: 0, wrong: 0 },
  };

  constructor(private http: HttpClient) {}

  incrementVerbs() { this.session.verbsPracticed++; }
  incrementNouns() { this.session.nounsPracticed++; }
  incrementAdjs() { this.session.adjsPracticed++; }
  incrementSentences() { this.session.sentencesPracticed++; }
  incrementRefemittel() { this.session.refemittelPracticed++; }

  addFlashcardCorrect() { this.session.flashcardScore.correct++; }
  addFlashcardWrong() { this.session.flashcardScore.wrong++; }

  getSession() { return this.session; }

  saveSession(): Observable<Progress> {
    return this.http.post<Progress>('/api/progress', this.session);
  }

  resetSession() {
    this.session = {
      verbsPracticed: 0, nounsPracticed: 0, adjsPracticed: 0,
      sentencesPracticed: 0, refemittelPracticed: 0, flashcardScore: { correct: 0, wrong: 0 },
    };
  }

  getProgress(): Observable<Progress[]> {
    return this.http.get<Progress[]>('/api/progress');
  }
}
