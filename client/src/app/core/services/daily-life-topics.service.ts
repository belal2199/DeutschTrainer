import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DailyLifeNoun {
  article: 'der' | 'die' | 'das';
  german: string;
  english: string;
}

export interface DailyLifeVerb {
  infinitiv: string;
  english: string;
}

export interface DailyLifeSentence {
  german: string;
  english: string;
}

export interface DailyLifeTopicSummary {
  topicId: string;
  title: string;
  titleDe: string;
  emoji: string;
}

export interface DailyLifeTopic extends DailyLifeTopicSummary {
  level: string;
  nouns: DailyLifeNoun[];
  verbs: DailyLifeVerb[];
  sentencesHear: DailyLifeSentence[];
  sentencesSay: DailyLifeSentence[];
  dialect: string[];
  proTip: string;
}

@Injectable({ providedIn: 'root' })
export class DailyLifeTopicsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/daily-life-topics`;

  constructor(private http: HttpClient) {}

  getTopics(): Observable<DailyLifeTopicSummary[]> {
    return this.http.get<DailyLifeTopicSummary[]>(this.baseUrl);
  }

  getTopic(topicId: string): Observable<DailyLifeTopic> {
    return this.http.get<DailyLifeTopic>(`${this.baseUrl}/${topicId}`);
  }
}