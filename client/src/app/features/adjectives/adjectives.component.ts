import { Component, OnInit, signal, computed } from '@angular/core';
import { VocabService, Adjective } from '../../core/services/vocab.service';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MarkBtnComponent } from '../../shared/components/mark-btn/mark-btn.component';
import { InlineCorrectorComponent } from '../../shared/components/inline-corrector/inline-corrector.component';

@Component({
  selector: 'app-adjectives',
  standalone: true,
  imports: [CategoryFilterComponent, SearchBarComponent, MarkBtnComponent, InlineCorrectorComponent],
  template: `
    <h1 class="page-title">Adjektive</h1>
    <p class="page-sub">{{ filtered().length }} Adjektive</p>
    <app-search-bar (searchChanged)="onSearch($event)" />
    <app-category-filter [categories]="categories()" (categorySelected)="onCategory($event)" />
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Wort</th>
            <th>English</th>
            <th>Gegenteil</th>
            <th>Kategorie</th>
            <th>Beispiel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (adj of filtered(); track adj._id) {
            <tr [class.practiced]="adj.practiced">
              <td class="word">{{ adj.word }}</td>
              <td class="english">{{ adj.english }}</td>
              <td class="opposite">{{ adj.opposite }}</td>
              <td><span class="cat-badge">{{ adj.category }}</span></td>
              <td class="example">
                <div>{{ adj.example }}</div>
                <app-inline-corrector [word]="adj.word" />
              </td>
              <td><app-mark-btn [practiced]="adj.practiced" (toggled)="togglePracticed(adj)" /></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './adjectives.component.css'
})
export class AdjectivesComponent implements OnInit {
  adjectives = signal<Adjective[]>([]);
  search = signal('');
  category = signal('');

  categories = computed(() => [...new Set(this.adjectives().map(a => a.category))]);

  filtered = computed(() => {
    let list = this.adjectives();
    const cat = this.category();
    const q = this.search().toLowerCase();
    if (cat) list = list.filter(a => a.category === cat);
    if (q) list = list.filter(a => a.word.toLowerCase().includes(q) || a.english.toLowerCase().includes(q));
    return list;
  });

  constructor(private vocab: VocabService, private progress: ProgressService) {}

  ngOnInit() {
    this.vocab.getAdjectives().subscribe(a => this.adjectives.set(a));
  }

  onSearch(q: string) { this.search.set(q); }
  onCategory(c: string) { this.category.set(c); }

  togglePracticed(adj: Adjective) {
    const wasPracticed = adj.practiced;
    this.adjectives.update(list =>
      list.map(a => a._id === adj._id ? { ...a, practiced: !wasPracticed } : a),
    );
    if (!wasPracticed) this.progress.incrementAdjs();
    this.vocab.toggleAdjectivePracticed(adj._id).subscribe({
      next: (updated) => {
        this.adjectives.update(list => list.map(a => a._id === updated._id ? updated : a));
      },
      error: () => {
        this.adjectives.update(list =>
          list.map(a => a._id === adj._id ? { ...a, practiced: wasPracticed } : a),
        );
      },
    });
  }
}
