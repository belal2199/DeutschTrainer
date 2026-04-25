import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-mark-btn',
  standalone: true,
  template: `
    <button class="mark-btn" [class.practiced]="practiced()" (click)="toggle()">
      {{ practiced() ? '\u2713 Ge\u00FCbt' : '\u00DCben' }}
    </button>
  `,
  styles: [`
    .mark-btn {
      padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--surface2); color: var(--muted); cursor: pointer;
      font-family: var(--font-mono); font-size: 12px; transition: all 0.2s;
      white-space: nowrap;
    }
    .mark-btn:hover { border-color: var(--accent); color: var(--accent); }
    .mark-btn.practiced {
      background: rgba(74,222,128,0.12); color: var(--accent);
      border-color: rgba(74,222,128,0.3);
    }
  `]
})
export class MarkBtnComponent {
  practiced = input(false);
  toggled = output<void>();

  toggle() {
    this.toggled.emit();
  }
}
