import { Component, input, output, signal, computed } from '@angular/core';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Entwicklung': { bg: '#E6F1FB', text: '#0C447C' },
  'Testing': { bg: '#E1F5EE', text: '#085041' },
  'Deployment': { bg: '#FAEEDA', text: '#633806' },
  'Datenbank': { bg: '#EEEDFE', text: '#3C3489' },
  'Allgemein': { bg: '#F1EFE8', text: '#444441' },
  'Code': { bg: '#E6F1FB', text: '#0C447C' },
  'Infrastruktur': { bg: '#FAEEDA', text: '#633806' },
  'Prozess': { bg: '#E1F5EE', text: '#085041' },
  'Technik': { bg: '#EEEDFE', text: '#3C3489' },
  'Qualität': { bg: '#FCE7E7', text: '#7C0C0C' },
  'Daten': { bg: '#E6F1FB', text: '#0C447C' },
  'Sicherheit': { bg: '#FCE7E7', text: '#7C0C0C' },
  'UI': { bg: '#F0E6FB', text: '#4C0C7C' },
};

@Component({
  selector: 'app-category-filter',
  standalone: true,
  template: `
    <div class="pills">
      <button class="pill" [class.active]="selected() === ''" (click)="select('')">Alle</button>
      @for (cat of categories(); track cat) {
        <button class="pill" [class.active]="selected() === cat"
          [style.--pill-bg]="getColor(cat).bg"
          [style.--pill-text]="getColor(cat).text"
          (click)="select(cat)">{{ cat }}</button>
      }
    </div>
  `,
  styles: [`
    .pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .pill {
      padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border);
      background: var(--surface2); color: var(--muted); cursor: pointer;
      font-family: var(--font-mono); font-size: 12px; transition: all 0.2s;
    }
    .pill:hover { border-color: var(--accent); color: var(--text); }
    .pill.active {
      background: var(--pill-bg, var(--accent)); color: var(--pill-text, #000);
      border-color: transparent;
    }
  `]
})
export class CategoryFilterComponent {
  categories = input<string[]>([]);
  categorySelected = output<string>();
  selected = signal('');

  select(cat: string) {
    this.selected.set(cat);
    this.categorySelected.emit(cat);
  }

  getColor(cat: string) {
    return CATEGORY_COLORS[cat] || { bg: '#F1EFE8', text: '#444441' };
  }
}
