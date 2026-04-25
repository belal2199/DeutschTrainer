import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  language: 'de' | 'en';
  savedForLater: boolean;
}

export interface NewsResponse {
  articles: NewsArticle[];
  germanCount: number;
  englishCount: number;
  cached: boolean;
  lastUpdated: string;
  error?: string;
}

const SAVED_KEY = 'dt_saved_articles';
const LAST_VISIT_KEY = 'dt_last_news_visit';

@Injectable({ providedIn: 'root' })
export class NewsService {
  germanArticles = signal<NewsArticle[]>([]);
  englishArticles = signal<NewsArticle[]>([]);
  isLoading = signal<boolean>(false);
  lastUpdated = signal<Date | null>(null);
  error = signal<string | null>(null);
  savedArticles = signal<NewsArticle[]>([]);

  unreadCount = computed(() => {
    const last = this.lastVisit();
    if (!last) return this.germanArticles().length + this.englishArticles().length;
    const all = [...this.germanArticles(), ...this.englishArticles()];
    return all.filter((a) => new Date(a.publishedAt).getTime() > last).length;
  });

  private lastVisit = signal<number | null>(this.readLastVisit());

  constructor(private http: HttpClient) {
    this.savedArticles.set(this.readSaved());
  }

  loadNews(forceRefresh = false): void {
    this.isLoading.set(true);
    this.error.set(null);
    let params = new HttpParams().set('lang', 'both');
    if (forceRefresh) params = params.set('refresh', 'true');
    this.http.get<NewsResponse>('/api/news', { params }).subscribe({
      next: (res) => {
        const savedIds = new Set(this.savedArticles().map((a) => a.id));
        const annotated = res.articles.map((a) => ({ ...a, savedForLater: savedIds.has(a.id) }));
        this.germanArticles.set(annotated.filter((a) => a.language === 'de'));
        this.englishArticles.set(annotated.filter((a) => a.language === 'en'));
        this.lastUpdated.set(res.lastUpdated ? new Date(res.lastUpdated) : new Date());
        if (res.error) this.error.set(res.error);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Nachrichten konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  searchNews(query: string, lang: 'de' | 'en' | 'both' = 'both'): Observable<NewsResponse> {
    const params = new HttpParams().set('q', query).set('lang', lang);
    return this.http.get<NewsResponse>('/api/news/search', { params }).pipe(
      tap((res) => {
        const savedIds = new Set(this.savedArticles().map((a) => a.id));
        const annotated = res.articles.map((a) => ({ ...a, savedForLater: savedIds.has(a.id) }));
        this.germanArticles.set(annotated.filter((a) => a.language === 'de'));
        this.englishArticles.set(annotated.filter((a) => a.language === 'en'));
        this.lastUpdated.set(res.lastUpdated ? new Date(res.lastUpdated) : new Date());
      }),
    );
  }

  toggleSaved(article: NewsArticle): boolean {
    const current = this.savedArticles();
    const exists = current.some((a) => a.id === article.id);
    const next = exists
      ? current.filter((a) => a.id !== article.id)
      : [{ ...article, savedForLater: true }, ...current];
    this.savedArticles.set(next);
    this.persistSaved(next);
    this.markStateInLists(article.id, !exists);
    return !exists;
  }

  getSavedArticles(): NewsArticle[] {
    return this.savedArticles();
  }

  markVisited(): void {
    const now = Date.now();
    this.lastVisit.set(now);
    try { localStorage.setItem(LAST_VISIT_KEY, String(now)); } catch {}
  }

  private markStateInLists(id: string, saved: boolean): void {
    const flip = (list: NewsArticle[]) => list.map((a) => a.id === id ? { ...a, savedForLater: saved } : a);
    this.germanArticles.update(flip);
    this.englishArticles.update(flip);
  }

  private persistSaved(list: NewsArticle[]): void {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {}
  }

  private readSaved(): NewsArticle[] {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private readLastVisit(): number | null {
    try {
      const raw = localStorage.getItem(LAST_VISIT_KEY);
      return raw ? Number(raw) || null : null;
    } catch {
      return null;
    }
  }
}
