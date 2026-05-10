import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  Adjective,
  Noun,
  Sentence,
  Verb,
  VocabService,
} from '../../core/services/vocab.service';

type CardType = 'verb' | 'noun' | 'adjective' | 'sentence';
type Phase = 'idle' | 'loading' | 'active' | 'done';

interface TrainingCard {
  type: CardType;
  prompt: string;
  promptHint: string;
  answer: string;
  detail: string;
  category: string;
}

interface TypeToggle {
  type: CardType;
  label: string;
  enabled: boolean;
}

const ENCOURAGE_MESSAGES = [
  'Sehr gut! Schon wieder ein Schritt vorwärts. 🎯',
  'Bleib dran — kleine Sessions, große Wirkung!',
  'Klasse! Konsequenz schlägt Talent. 💪',
  'Du machst dat richtig. Weiter so!',
  'Jeden Tag ein bisschen — so klappt es mit Deutsch.',
];

@Component({
  selector: 'app-quick-training',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (phase() === 'idle') {
      <header class="hero">
        <h1 class="page-title">30-Min Training</h1>
        <p class="page-sub">
          Kurze Session — gemischt aus Verben, Nomen, Adjektiven und Sätzen.
          Schon ein paar Minuten reichen, um in Übung zu bleiben.
        </p>
      </header>

      <section class="config">
        <div class="config-block">
          <h3>Dauer</h3>
          <div class="duration-pills">
            @for (min of durations; track min) {
              <button
                type="button"
                class="pill"
                [class.active]="durationMinutes() === min"
                (click)="durationMinutes.set(min)"
              >
                {{ min }} Min
              </button>
            }
          </div>
        </div>

        <div class="config-block">
          <h3>Was möchtest du üben?</h3>
          <div class="type-toggles">
            @for (t of toggles(); track t.type) {
              <button
                type="button"
                class="pill"
                [class.active]="t.enabled"
                (click)="toggleType(t.type)"
              >
                {{ t.label }}
              </button>
            }
          </div>
        </div>

        <button class="cta" (click)="startSession()" [disabled]="!canStart()">
          Los geht's →
        </button>
      </section>
    }

    @if (phase() === 'loading') {
      <div class="loading">
        <div class="spinner"></div>
        <p>Mische Karten…</p>
      </div>
    }

    @if (phase() === 'active' && currentCard(); as card) {
      <header class="status-bar">
        <div class="timer" [class.warn]="secondsLeft() < 60">
          ⏱ {{ formatTime(secondsLeft()) }}
        </div>
        <div class="counter">
          {{ currentIndex() + 1 }} / {{ deckSize() }}
        </div>
        <div class="score">
          ✓ {{ correctCount() }} · ✗ {{ wrongCount() }} · ↷ {{ skipCount() }}
        </div>
      </header>

      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="progressPercent()"></div>
      </div>

      <article class="train-card" [attr.data-type]="card.type">
        <div class="type-label">
          <span class="type-badge">{{ typeLabel(card.type) }}</span>
          <span class="cat-badge">{{ card.category }}</span>
        </div>

        <p class="hint">{{ card.promptHint }}</p>
        <h2 class="prompt">{{ card.prompt }}</h2>

        @if (revealed()) {
          <div class="answer-block">
            <div class="answer-label">Antwort</div>
            <div class="answer">{{ card.answer }}</div>
            @if (card.detail) {
              <div class="detail">{{ card.detail }}</div>
            }
          </div>

          <div class="actions">
            <button class="btn wrong" (click)="next('wrong')">Nochmal üben</button>
            <button class="btn skip" (click)="next('skip')">Überspringen</button>
            <button class="btn correct" (click)="next('correct')">Wusste ich ✓</button>
          </div>
        } @else {
          <button class="reveal" (click)="reveal()">Antwort zeigen</button>
        }
      </article>

      <button class="end-early" (click)="endSession()">Session beenden</button>
    }

    @if (phase() === 'done') {
      <section class="summary">
        <h1 class="page-title">Zeit ist um! 🎉</h1>
        <p class="encourage">{{ encouragement() }}</p>

        <div class="stat-grid">
          <div class="stat">
            <div class="stat-num">{{ correctCount() + wrongCount() + skipCount() }}</div>
            <div class="stat-label">Karten gesehen</div>
          </div>
          <div class="stat">
            <div class="stat-num accent">{{ correctCount() }}</div>
            <div class="stat-label">Wusste ich</div>
          </div>
          <div class="stat">
            <div class="stat-num warn">{{ wrongCount() }}</div>
            <div class="stat-label">Nochmal üben</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ accuracy() }}%</div>
            <div class="stat-label">Trefferquote</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ formatTime(elapsedSeconds()) }}</div>
            <div class="stat-label">Echtzeit</div>
          </div>
        </div>

        <div class="actions">
          <button class="cta" (click)="reset()">Nochmal trainieren</button>
        </div>
      </section>
    }
  `,
  styleUrl: './quick-training.component.css',
})
export class QuickTrainingComponent implements OnInit, OnDestroy {
  private vocab = inject(VocabService);

  readonly durations = [10, 20, 30];
  durationMinutes = signal<number>(10);

  toggles = signal<TypeToggle[]>([
    { type: 'verb', label: 'Verben', enabled: true },
    { type: 'noun', label: 'Nomen', enabled: true },
    { type: 'adjective', label: 'Adjektive', enabled: true },
    { type: 'sentence', label: 'Sätze', enabled: true },
  ]);

  phase = signal<Phase>('idle');
  deck = signal<TrainingCard[]>([]);
  currentIndex = signal<number>(0);
  revealed = signal<boolean>(false);
  correctCount = signal<number>(0);
  wrongCount = signal<number>(0);
  skipCount = signal<number>(0);
  secondsLeft = signal<number>(0);

  private startTime = 0;
  private endTime = 0;
  private timerHandle?: ReturnType<typeof setInterval>;

  deckSize = computed(() => this.deck().length);
  currentCard = computed<TrainingCard | undefined>(() => this.deck()[this.currentIndex()]);
  progressPercent = computed(() => {
    const size = this.deckSize();
    if (!size) return 0;
    return Math.min(100, (this.currentIndex() / size) * 100);
  });
  accuracy = computed(() => {
    const seen = this.correctCount() + this.wrongCount();
    if (!seen) return 0;
    return Math.round((this.correctCount() / seen) * 100);
  });
  elapsedSeconds = computed(() => Math.max(0, Math.round((this.endTime - this.startTime) / 1000)));
  canStart = computed(() => this.toggles().some((t) => t.enabled));
  encouragement = signal<string>('');

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.clearTimer();
  }

  toggleType(type: CardType): void {
    this.toggles.update((list) =>
      list.map((t) => (t.type === type ? { ...t, enabled: !t.enabled } : t)),
    );
  }

  startSession(): void {
    if (!this.canStart()) return;
    this.phase.set('loading');
    this.resetCounters();

    forkJoin({
      verbs: this.vocab.getVerbs(),
      nouns: this.vocab.getNouns(),
      adjectives: this.vocab.getAdjectives(),
      sentences: this.vocab.getSentences(),
    }).subscribe({
      next: ({ verbs, nouns, adjectives, sentences }) => {
        const enabled = new Set(this.toggles().filter((t) => t.enabled).map((t) => t.type));
        const pool: TrainingCard[] = [];
        if (enabled.has('verb')) pool.push(...verbs.map(this.verbToCard));
        if (enabled.has('noun')) pool.push(...nouns.map(this.nounToCard));
        if (enabled.has('adjective')) pool.push(...adjectives.map(this.adjToCard));
        if (enabled.has('sentence')) pool.push(...sentences.map(this.sentenceToCard));

        if (pool.length === 0) {
          this.phase.set('idle');
          return;
        }

        const shuffled = this.shuffle(pool);
        // Cap deck at a reasonable max so the user can finish even on long durations.
        const capped = shuffled.slice(0, Math.min(shuffled.length, this.durationMinutes() * 8));
        this.deck.set(capped);
        this.currentIndex.set(0);
        this.revealed.set(false);
        this.startTime = Date.now();
        this.secondsLeft.set(this.durationMinutes() * 60);
        this.startTimer();
        this.phase.set('active');
      },
      error: () => {
        this.phase.set('idle');
      },
    });
  }

  reveal(): void {
    this.revealed.set(true);
  }

  next(result: 'correct' | 'wrong' | 'skip'): void {
    if (result === 'correct') this.correctCount.update((n) => n + 1);
    else if (result === 'wrong') this.wrongCount.update((n) => n + 1);
    else this.skipCount.update((n) => n + 1);

    const nextIdx = this.currentIndex() + 1;
    if (nextIdx >= this.deckSize()) {
      this.endSession();
      return;
    }
    this.currentIndex.set(nextIdx);
    this.revealed.set(false);
  }

  endSession(): void {
    this.clearTimer();
    this.endTime = Date.now();
    this.encouragement.set(ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)]);
    this.phase.set('done');
  }

  reset(): void {
    this.clearTimer();
    this.resetCounters();
    this.deck.set([]);
    this.phase.set('idle');
  }

  formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  typeLabel(type: CardType): string {
    return ({ verb: 'Verb', noun: 'Nomen', adjective: 'Adjektiv', sentence: 'Satz' } as Record<CardType, string>)[type];
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerHandle = setInterval(() => {
      this.secondsLeft.update((s) => s - 1);
      if (this.secondsLeft() <= 0) {
        this.endSession();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }

  private resetCounters(): void {
    this.correctCount.set(0);
    this.wrongCount.set(0);
    this.skipCount.set(0);
    this.currentIndex.set(0);
    this.revealed.set(false);
  }

  private shuffle<T>(arr: T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  private verbToCard = (v: Verb): TrainingCard => ({
    type: 'verb',
    promptHint: 'Was bedeutet dieses Verb?',
    prompt: v.infinitiv,
    answer: v.english,
    detail: `Perfekt: ${v.perfekt}${v.example ? ' · ' + v.example : ''}`,
    category: v.category,
  });

  private nounToCard = (n: Noun): TrainingCard => ({
    type: 'noun',
    promptHint: 'Was bedeutet dieses Nomen?',
    prompt: n.word,
    answer: n.english,
    detail: `${n.plural ? 'Plural: ' + n.plural : ''}${n.example ? (n.plural ? ' · ' : '') + n.example : ''}`,
    category: n.category,
  });

  private adjToCard = (a: Adjective): TrainingCard => ({
    type: 'adjective',
    promptHint: 'Was bedeutet dieses Adjektiv?',
    prompt: a.word,
    answer: a.english,
    detail: `${a.opposite ? 'Gegenteil: ' + a.opposite : ''}${a.example ? (a.opposite ? ' · ' : '') + a.example : ''}`,
    category: a.category,
  });

  private sentenceToCard = (s: Sentence): TrainingCard => ({
    type: 'sentence',
    promptHint: 'Übersetze diesen Satz:',
    prompt: s.german,
    answer: s.english,
    detail: '',
    category: s.category,
  });
}
