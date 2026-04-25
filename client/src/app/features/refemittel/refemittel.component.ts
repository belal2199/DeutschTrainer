import { Component, OnInit, signal, computed } from '@angular/core';
import { VocabService, Refemittel } from '../../core/services/vocab.service';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MarkBtnComponent } from '../../shared/components/mark-btn/mark-btn.component';

@Component({
  selector: 'app-refemittel',
  standalone: true,
  imports: [CategoryFilterComponent, SearchBarComponent, MarkBtnComponent],
  template: `
    <h1 class="page-title">Redemittel</h1>
    <p class="page-sub">{{ filtered().length }} Redemittel</p>
    <app-search-bar (searchChanged)="onSearch($event)" />
    <app-category-filter [categories]="categories()" (categorySelected)="onCategory($event)" />

    <div class="cards">
      @for (item of filtered(); track item._id) {
        <div class="card" [class.practiced]="item.practiced">
          <div class="head-row">
            <span class="cat-badge">{{ item.category }}</span>
            <app-mark-btn [practiced]="item.practiced" (toggled)="togglePracticed(item)" />
          </div>
          <p class="phrase">{{ item.phrase }}</p>
          <p class="english">{{ item.english }}</p>
          @if (item.useCase) {
            <p class="use-case">{{ item.useCase }}</p>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './refemittel.component.css'
})
export class RefemittelComponent implements OnInit {
  refemittel = signal<Refemittel[]>([]);
  search = signal('');
  category = signal('');

  categories = computed(() => [...new Set(this.refemittel().map(r => r.category))]);

  filtered = computed(() => {
    let list = this.refemittel();
    const cat = this.category();
    const q = this.search().toLowerCase();
    if (cat) list = list.filter(r => r.category === cat);
    if (q) {
      list = list.filter(r =>
        r.phrase.toLowerCase().includes(q) ||
        r.english.toLowerCase().includes(q) ||
        r.useCase.toLowerCase().includes(q)
      );
    }
    return list;
  });

  constructor(private vocab: VocabService, private progress: ProgressService) {}

  ngOnInit() {
    this.vocab.getRefemittel().subscribe(r => this.refemittel.set(r));
  }

  onSearch(q: string) { this.search.set(q); }
  onCategory(c: string) { this.category.set(c); }

  togglePracticed(item: Refemittel) {
    const prev = item.practiced;
    item.practiced = !item.practiced;
    if (!prev) this.progress.incrementRefemittel();
    this.vocab.toggleRefemittelPracticed(item._id).subscribe({
      next: (updated) => {
        this.refemittel.update(list => list.map(r => r._id === updated._id ? updated : r));
      },
      error: () => { item.practiced = prev; }
    });
  }
}
