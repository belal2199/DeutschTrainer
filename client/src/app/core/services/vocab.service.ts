import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Verb {
  _id: string; infinitiv: string; english: string; perfekt: string;
  category: string; example: string; practiced: boolean; lastPracticed: string | null;
}
export interface Noun {
  _id: string; word: string; plural: string; english: string;
  category: string; example: string; practiced: boolean; lastPracticed: string | null;
}
export interface Adjective {
  _id: string; word: string; english: string; opposite: string;
  category: string; example: string; practiced: boolean; lastPracticed: string | null;
}
export interface Sentence {
  _id: string; german: string; english: string; verbUsed: string;
  nounUsed: string; adjUsed: string; category: string; practiced: boolean; lastPracticed: string | null;
}
export interface Refemittel {
  _id: string; phrase: string; english: string;
  useCase: string; category: string; practiced: boolean; lastPracticed: string | null;
}
export interface Stats {
  totalVerbs: number; totalNouns: number; totalAdjectives: number; totalSentences: number; totalRefemittel: number;
  practicedVerbs: number; practicedNouns: number; practicedAdjectives: number; practicedSentences: number; practicedRefemittel: number;
  streak: number;
}

@Injectable({ providedIn: 'root' })
export class VocabService {
  constructor(private http: HttpClient) {}

  private buildParams(category?: string, search?: string): HttpParams {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);
    return params;
  }

  getVerbs(category?: string, search?: string): Observable<Verb[]> {
    return this.http.get<Verb[]>('/api/verbs', { params: this.buildParams(category, search) });
  }
  toggleVerbPracticed(id: string): Observable<Verb> {
    return this.http.patch<Verb>(`/api/verbs/${id}/practiced`, {});
  }

  getNouns(category?: string, search?: string): Observable<Noun[]> {
    return this.http.get<Noun[]>('/api/nouns', { params: this.buildParams(category, search) });
  }
  toggleNounPracticed(id: string): Observable<Noun> {
    return this.http.patch<Noun>(`/api/nouns/${id}/practiced`, {});
  }

  getAdjectives(category?: string, search?: string): Observable<Adjective[]> {
    return this.http.get<Adjective[]>('/api/adjectives', { params: this.buildParams(category, search) });
  }
  toggleAdjectivePracticed(id: string): Observable<Adjective> {
    return this.http.patch<Adjective>(`/api/adjectives/${id}/practiced`, {});
  }

  getSentences(category?: string, search?: string): Observable<Sentence[]> {
    return this.http.get<Sentence[]>('/api/sentences', { params: this.buildParams(category, search) });
  }
  toggleSentencePracticed(id: string): Observable<Sentence> {
    return this.http.patch<Sentence>(`/api/sentences/${id}/practiced`, {});
  }

  getRefemittel(category?: string, search?: string): Observable<Refemittel[]> {
    return this.http.get<Refemittel[]>('/api/refemittel', { params: this.buildParams(category, search) });
  }
  toggleRefemittelPracticed(id: string): Observable<Refemittel> {
    return this.http.patch<Refemittel>(`/api/refemittel/${id}/practiced`, {});
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>('/api/stats');
  }
}
