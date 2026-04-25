import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { NewsArticle, NewsService } from '../../core/services/news.service';
import { VocabService } from '../../core/services/vocab.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { VocabEntry, VocabHighlightPipe } from '../../shared/pipes/vocab-highlight.pipe';

interface Tooltip {
  word: string;
  english: string;
  perfekt?: string;
  category: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [FormsModule, TimeAgoPipe, VocabHighlightPipe],
  template: `
    <header class="hero">
      <h1 class="page-title">Tech News</h1>
      <p class="page-sub">Aktuelle Tech-Nachrichten zum Lesen — auf Deutsch und Englisch.</p>
    </header>

    <div class="toolbar">
      <input
        class="search"
        type="text"
        [(ngModel)]="searchQuery"
        (ngModelChange)="onSearchInput($event)"
        placeholder="Suchen…"
      />
      <div class="filters">
        <button class="pill" [class.active]="filter() === 'all'" (click)="setFilter('all')">Alle</button>
        <button class="pill" [class.active]="filter() === 'saved'" (click)="setFilter('saved')">
          Gespeichert ({{ news.savedArticles().length }})
        </button>
      </div>
      <div class="refresh-row">
        @if (news.lastUpdated()) {
          <span class="updated">Zuletzt aktualisiert: {{ news.lastUpdated()! | timeAgo }}</span>
        }
        <button class="refresh" (click)="refresh()" [disabled]="news.isLoading()">↻ Aktualisieren</button>
      </div>
    </div>

    @if (isMobile()) {
      <div class="tabs">
        <button class="tab" [class.active]="mobileTab() === 'de'" (click)="mobileTab.set('de')">🇩🇪 Deutsch</button>
        <button class="tab" [class.active]="mobileTab() === 'en'" (click)="mobileTab.set('en')">🇬🇧 English</button>
      </div>
    }

    @if (news.error()) {
      <div class="err">{{ news.error() }}</div>
    }

    <div class="columns" #columns (click)="onColumnsClick($event)">
      @if (showCol('de')) {
        <section class="col">
          <h2>🇩🇪 Auf Deutsch</h2>
          @if (news.isLoading() && germanList().length === 0) {
            @for (_ of [1,2,3]; track $index) { <div class="skeleton"></div> }
          } @else if (germanList().length === 0) {
            <div class="empty">
              <p>Keine Artikel gefunden. Bitte überprüfe deine Internetverbindung oder versuche es später nochmal.</p>
              <button class="refresh" (click)="refresh()">Erneut versuchen</button>
            </div>
          } @else {
            @for (article of germanList(); track article.id) {
              <article class="card" [attr.data-id]="article.id">
                <div class="meta-row">
                  <span class="src">{{ article.source.name }}</span>
                  <span class="lang-badge de">DE</span>
                  <span class="time">· {{ article.publishedAt | timeAgo }}</span>
                </div>
                @if (article.urlToImage) {
                  <img class="thumb" [src]="article.urlToImage" loading="lazy" alt=""
                       (error)="onImgError($event)" />
                } @else {
                  <div class="thumb placeholder"></div>
                }
                <h3 class="title">
                  <a [href]="article.url" target="_blank" rel="noopener noreferrer"
                     [innerHTML]="article.title | vocabHighlight: vocab()"></a>
                </h3>
                @if (article.description) {
                  <p class="desc" [innerHTML]="article.description | vocabHighlight: vocab()"></p>
                }
                <div class="actions">
                  <a class="read-btn" [href]="article.url" target="_blank" rel="noopener noreferrer">Lesen</a>
                  <button class="bookmark" [class.saved]="article.savedForLater"
                    (click)="onBookmark(article)" [attr.aria-label]="article.savedForLater ? 'Entfernen' : 'Speichern'">
                    {{ article.savedForLater ? '★' : '☆' }}
                  </button>
                </div>
              </article>
            }
          }
        </section>
      }

      @if (showCol('en')) {
        <section class="col">
          <h2>🇬🇧 In English</h2>
          @if (news.isLoading() && englishList().length === 0) {
            @for (_ of [1,2,3]; track $index) { <div class="skeleton"></div> }
          } @else if (englishList().length === 0) {
            <div class="empty">
              <p>No articles found. Please check your connection or try again later.</p>
              <button class="refresh" (click)="refresh()">Erneut versuchen</button>
            </div>
          } @else {
            @for (article of englishList(); track article.id) {
              <article class="card" [attr.data-id]="article.id">
                <div class="meta-row">
                  <span class="src">{{ article.source.name }}</span>
                  <span class="lang-badge en">EN</span>
                  <span class="time">· {{ article.publishedAt | timeAgo }}</span>
                </div>
                @if (article.urlToImage) {
                  <img class="thumb" [src]="article.urlToImage" loading="lazy" alt=""
                       (error)="onImgError($event)" />
                } @else {
                  <div class="thumb placeholder"></div>
                }
                <h3 class="title">
                  <a [href]="article.url" target="_blank" rel="noopener noreferrer">{{ article.title }}</a>
                </h3>
                @if (article.description) {
                  <p class="desc">{{ article.description }}</p>
                }
                <div class="actions">
                  <a class="read-btn" [href]="article.url" target="_blank" rel="noopener noreferrer">Lesen</a>
                  <button class="bookmark" [class.saved]="article.savedForLater"
                    (click)="onBookmark(article)" [attr.aria-label]="article.savedForLater ? 'Entfernen' : 'Speichern'">
                    {{ article.savedForLater ? '★' : '☆' }}
                  </button>
                </div>
              </article>
            }
          }
        </section>
      }
    </div>

    @if (tooltip(); as t) {
      <div class="tooltip" [style.top.px]="t.y" [style.left.px]="t.x">
        <div class="tt-word">{{ t.word }}</div>
        <div class="tt-en">{{ t.english }}</div>
        @if (t.perfekt) { <div class="tt-perf">Perfekt: {{ t.perfekt }}</div> }
        <div class="tt-cat">{{ t.category }}</div>
      </div>
    }

    @if (toast()) {
      <div class="toast">{{ toast() }}</div>
    }
  `,
  styleUrl: './news.component.css',
})
export class NewsComponent implements OnInit, OnDestroy {
  news = inject(NewsService);
  private vocabService = inject(VocabService);

  @ViewChild('columns') columnsRef?: ElementRef<HTMLDivElement>;

  searchQuery = '';
  filter = signal<'all' | 'saved'>('all');
  mobileTab = signal<'de' | 'en'>('de');
  isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  vocab = signal<VocabEntry[]>([]);
  tooltip = signal<Tooltip | null>(null);
  toast = signal<string | null>(null);

  germanList = computed<NewsArticle[]>(() =>
    this.filter() === 'saved'
      ? this.news.savedArticles().filter((a) => a.language === 'de')
      : this.news.germanArticles()
  );
  englishList = computed<NewsArticle[]>(() =>
    this.filter() === 'saved'
      ? this.news.savedArticles().filter((a) => a.language === 'en')
      : this.news.englishArticles()
  );

  private searchSubject = new Subject<string>();
  private resizeHandler = () => this.isMobile.set(window.innerWidth < 768);
  private outsideClickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('vocab-highlight')) this.tooltip.set(null);
  };
  private toastTimer?: ReturnType<typeof setTimeout>;
  private tooltipTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadVocab();
    this.news.loadNews();
    this.news.markVisited();

    this.searchSubject
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((q) => (q.trim().length >= 2 ? this.news.searchNews(q.trim(), 'both') : (this.news.loadNews(), of(null)))),
      )
      .subscribe();

    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('click', this.outsideClickHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('click', this.outsideClickHandler);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.tooltipTimer) clearTimeout(this.tooltipTimer);
  }

  setFilter(f: 'all' | 'saved'): void {
    this.filter.set(f);
  }

  showCol(lang: 'de' | 'en'): boolean {
    return !this.isMobile() || this.mobileTab() === lang;
  }

  refresh(): void {
    this.news.loadNews(true);
  }

  onSearchInput(q: string): void {
    this.searchSubject.next(q);
  }

  onBookmark(article: NewsArticle): void {
    const nowSaved = this.news.toggleSaved(article);
    this.showToast(nowSaved ? 'Gespeichert' : 'Entfernt');
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onColumnsClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('vocab-highlight')) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = target.getBoundingClientRect();
    const containerRect = this.columnsRef?.nativeElement.getBoundingClientRect();
    if (!containerRect) return;
    this.tooltip.set({
      word: target.dataset['word'] || '',
      english: target.dataset['en'] || '',
      perfekt: target.dataset['perfekt'] || undefined,
      category: target.dataset['cat'] || '',
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top - 8,
    });
    if (this.tooltipTimer) clearTimeout(this.tooltipTimer);
    this.tooltipTimer = setTimeout(() => this.tooltip.set(null), 4000);
  }

  private loadVocab(): void {
    forkJoin({
      verbs: this.vocabService.getVerbs(),
      nouns: this.vocabService.getNouns(),
      adjs: this.vocabService.getAdjectives(),
    }).subscribe({
      next: ({ verbs, nouns, adjs }) => {
        const entries: VocabEntry[] = [
          ...verbs.map((v) => ({ word: v.infinitiv, english: v.english, perfekt: v.perfekt, category: v.category })),
          ...nouns.map((n) => ({ word: n.word, english: n.english, category: n.category })),
          ...adjs.map((a) => ({ word: a.word, english: a.english, category: a.category })),
        ];
        this.vocab.set(entries);
      },
      error: () => this.vocab.set([]),
    });
  }

  private showToast(message: string): void {
    this.toast.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 1800);
  }
}
