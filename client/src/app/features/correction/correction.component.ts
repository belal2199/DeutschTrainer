import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CorrectionService, CorrectionResult, CorrectionType } from '../../core/services/correction.service';

interface DiffSegment {
  text: string;
  changed: boolean;
}

@Component({
  selector: 'app-correction',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1 class="page-title">Freie Textkorrektur</h1>
    <p class="page-sub">Schreib einen Text auf Deutsch — ich korrigiere ihn.</p>

    <div class="editor">
      <textarea
        [(ngModel)]="text"
        rows="6"
        maxlength="2000"
        placeholder="Schreib hier deinen deutschen Text…"
        [disabled]="loading()"
      ></textarea>
      <div class="meta">
        <span class="counter" [class.warn]="text.length > 1800">{{ text.length }} Zeichen</span>
      </div>
      <div class="actions">
        <button class="primary" (click)="submit()" [disabled]="loading() || !text.trim()">
          @if (loading()) { <span class="spinner"></span> Korrigiere… } @else { Korrigieren }
        </button>
        <button class="secondary" (click)="clear()" [disabled]="loading()">Löschen</button>
      </div>
    </div>

    @if (errorMsg()) {
      <div class="err">{{ errorMsg() }}</div>
    }

    @if (result(); as r) {
      <section class="result-panel">
        <div class="status-row">
          <span class="badge" [class.correct]="r.status === 'correct'"
                              [class.minor]="r.status === 'minor'"
                              [class.errors]="r.status === 'errors'">
            {{ statusLabel(r.status) }}
          </span>
          <span class="time">{{ r.processingTime }} ms</span>
        </div>

        <div class="diff">
          <div class="diff-col">
            <h3>Original</h3>
            <div class="diff-text">
              @for (seg of originalSegments(); track $index) {
                <span [class.wrong-hl]="seg.changed">{{ seg.text }}</span>
              }
            </div>
          </div>
          <div class="diff-col">
            <h3>Korrigiert</h3>
            <div class="diff-text">
              @for (seg of correctedSegments(); track $index) {
                <span [class.right-hl]="seg.changed">{{ seg.text }}</span>
              }
            </div>
          </div>
        </div>

        @if (r.corrections.length > 0) {
          <h3 class="section-h">Korrekturen</h3>
          <ol class="corrections">
            @for (c of r.corrections; track $index) {
              <li class="correction-card" [attr.data-type]="c.type">
                <div class="card-head">
                  <span class="type-badge">{{ typeLabel(c.type) }}</span>
                </div>
                <div class="card-diff">
                  <span class="wrong">{{ c.original }}</span>
                  <span class="arrow">→</span>
                  <span class="right">{{ c.corrected }}</span>
                </div>
                <p class="exp">{{ c.explanation }}</p>
              </li>
            }
          </ol>
        }

        <div class="overall">{{ r.overallFeedback }}</div>
      </section>
    }

    @if (history().length > 0) {
      <section class="history">
        <h2 class="section-h">Verlauf</h2>
        <ul>
          @for (h of history(); track h.timestamp) {
            <li>
              <span class="ts">{{ formatTime(h.timestamp) }}</span>
              <span class="prev">{{ h.preview }}</span>
              <span class="badge small" [class.correct]="h.status === 'correct'"
                                       [class.minor]="h.status === 'minor'"
                                       [class.errors]="h.status === 'errors'">
                {{ statusLabel(h.status) }}
              </span>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styleUrl: './correction.component.css',
})
export class CorrectionComponent {
  text = '';
  loading = signal(false);
  result = signal<CorrectionResult | null>(null);
  errorMsg = signal<string>('');

  readonly history;

  readonly originalSegments = computed<DiffSegment[]>(() => this.diff(this.result()?.original ?? '', this.result()?.corrected ?? ''));
  readonly correctedSegments = computed<DiffSegment[]>(() => this.diff(this.result()?.corrected ?? '', this.result()?.original ?? ''));

  constructor(private correction: CorrectionService) {
    this.history = correction.correctionHistory;
  }

  submit(): void {
    const t = this.text.trim();
    if (!t || this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.result.set(null);
    this.correction.correctFreeText(t).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.error || 'Korrektur fehlgeschlagen.');
        this.loading.set(false);
      },
    });
  }

  clear(): void {
    this.text = '';
    this.result.set(null);
    this.errorMsg.set('');
  }

  statusLabel(s: 'correct' | 'minor' | 'errors'): string {
    return s === 'correct' ? 'Kein Fehler' : s === 'minor' ? 'Kleinere Fehler' : 'Mehrere Fehler';
  }

  typeLabel(t: CorrectionType): string {
    return ({
      grammar: 'Grammatik',
      spelling: 'Rechtschreibung',
      word_order: 'Wortstellung',
      vocabulary: 'Vokabular',
      article: 'Artikel',
    } as Record<CorrectionType, string>)[t];
  }

  formatTime(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  private diff(a: string, b: string): DiffSegment[] {
    if (!a) return [];
    if (a === b) return [{ text: a, changed: false }];
    const aw = a.split(/(\s+)/);
    const bw = b.split(/(\s+)/);
    const bset = new Set(bw.filter((w) => w.trim()));
    return aw.map((w) => ({
      text: w,
      changed: w.trim().length > 0 && !bset.has(w),
    }));
  }
}
