import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CorrectionService, CorrectionResult } from '../../../core/services/correction.service';

@Component({
  selector: 'app-inline-corrector',
  standalone: true,
  imports: [FormsModule],
  template: `
    <button type="button" class="trigger" (click)="toggle()">
      {{ open() ? 'Schließen' : 'Satz üben' }}
    </button>

    @if (open()) {
      <div class="panel" [style.borderLeftColor]="borderColor || '#4ade80'">
        <label class="lbl">Schreib einen Satz mit '{{ word }}':</label>
        <div class="input-row">
          <input
            type="text"
            [(ngModel)]="inputText"
            placeholder="Dein Satz auf Deutsch…"
            (keydown.enter)="submit()"
            [disabled]="loading()"
          />
          <button type="button" class="primary" (click)="submit()" [disabled]="loading() || !inputText.trim()">
            @if (loading()) { <span class="spinner"></span> } @else { Korrigieren }
          </button>
        </div>

        @if (errorMsg()) {
          <div class="err">{{ errorMsg() }}</div>
        }

        @if (result(); as r) {
          <div class="result">
            <span class="badge" [class.correct]="r.status === 'correct'"
                                [class.minor]="r.status === 'minor'"
                                [class.errors]="r.status === 'errors'">
              {{ statusLabel(r.status) }}
            </span>
            <div class="corrected-box" [class.unchanged]="r.isCorrect">{{ r.corrected }}</div>
            @if (r.corrections.length > 0) {
              <ul class="explanations">
                @for (c of r.corrections; track $index) {
                  <li>
                    <span class="wrong">{{ c.original }}</span>
                    <span class="arrow">→</span>
                    <span class="right">{{ c.corrected }}</span>
                    <div class="exp">{{ c.explanation }}</div>
                  </li>
                }
              </ul>
            } @else {
              <div class="encourage">{{ r.overallFeedback }}</div>
            }
          </div>
        }
      </div>
    }
  `,
  styleUrl: './inline-corrector.component.css',
})
export class InlineCorrectorComponent {
  @Input({ required: true }) word!: string;
  @Input() borderColor?: string;

  open = signal(false);
  loading = signal(false);
  result = signal<CorrectionResult | null>(null);
  errorMsg = signal<string>('');
  inputText = '';

  constructor(private correction: CorrectionService) {}

  toggle(): void {
    this.open.update((v) => !v);
  }

  submit(): void {
    const text = this.inputText.trim();
    if (!text || this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.result.set(null);
    this.correction.correctSentence(text, this.word).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.error || 'Korrektur fehlgeschlagen.';
        this.errorMsg.set(msg);
        this.loading.set(false);
      },
    });
  }

  statusLabel(s: 'correct' | 'minor' | 'errors'): string {
    return s === 'correct' ? 'Korrekt' : s === 'minor' ? 'Fast korrekt' : 'Mit Fehlern';
  }
}
