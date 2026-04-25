import { Component, output, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-wrap">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input type="text" [ngModel]="query()" (ngModelChange)="onInput($event)"
        placeholder="Suchen..." class="search-input">
    </div>
  `,
  styles: [`
    .search-wrap {
      position: relative; display: flex; align-items: center;
      margin-bottom: 16px;
    }
    .icon {
      position: absolute; left: 12px; width: 16px; height: 16px;
      color: var(--muted);
    }
    .search-input {
      width: 100%; max-width: 360px; padding: 10px 12px 10px 36px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 8px; color: var(--text); font-family: var(--font-body);
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--muted); }
  `]
})
export class SearchBarComponent implements OnDestroy {
  searchChanged = output<string>();
  query = signal('');
  private subject = new Subject<string>();
  private sub = this.subject.pipe(debounceTime(300), distinctUntilChanged())
    .subscribe(val => this.searchChanged.emit(val));

  onInput(val: string) {
    this.query.set(val);
    this.subject.next(val);
  }

  ngOnDestroy() { this.sub.unsubscribe(); }
}
