import { Component, OnInit, signal, computed } from '@angular/core';
import { VocabService, Noun } from '../../core/services/vocab.service';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MarkBtnComponent } from '../../shared/components/mark-btn/mark-btn.component';
import { InlineCorrectorComponent } from '../../shared/components/inline-corrector/inline-corrector.component';

@Component({
  selector: 'app-nouns',
  standalone: true,
  imports: [CategoryFilterComponent, SearchBarComponent, MarkBtnComponent, InlineCorrectorComponent],
  template: `
    <h1 class="page-title">Nomen</h1>
    <p class="page-sub">{{ filtered().length }} Nomen</p>
    <app-search-bar (searchChanged)="onSearch($event)" />
    <app-category-filter [categories]="categories()" (categorySelected)="onCategory($event)" />
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Wort</th>
            <th>Plural</th>
            <th>English</th>
            <th>Kategorie</th>
            <th>Beispiel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (noun of filtered(); track noun._id) {
            <tr [class.practiced]="noun.practiced">
              <td class="word">{{ noun.word }}</td>
              <td class="plural">{{ noun.plural }}</td>
              <td class="english">{{ noun.english }}</td>
              <td><span class="cat-badge">{{ noun.category }}</span></td>
              <td class="example">
                <div>{{ noun.example }}</div>
                <app-inline-corrector [word]="noun.word" />
              </td>
              <td><app-mark-btn [practiced]="noun.practiced" (toggled)="togglePracticed(noun)" /></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './nouns.component.css'
})
export class NounsComponent implements OnInit {
  nouns = signal<Noun[]>([]);
  search = signal('');
  category = signal('');

  categories = computed(() => [...new Set(this.nouns().map(n => n.category))]);

  filtered = computed(() => {
    let list = this.nouns();
    const cat = this.category();
    const q = this.search().toLowerCase();
    if (cat) list = list.filter(n => n.category === cat);
    if (q) list = list.filter(n => n.word.toLowerCase().includes(q) || n.english.toLowerCase().includes(q));
    return list;
  });

  constructor(private vocab: VocabService, private progress: ProgressService) {}

  ngOnInit() {
    this.vocab.getNouns().subscribe(n => this.nouns.set(n));
  }

  onSearch(q: string) { this.search.set(q); }
  onCategory(c: string) { this.category.set(c); }

  togglePracticed(noun: Noun) {
    const prev = noun.practiced;
    noun.practiced = !noun.practiced;
    if (!prev) this.progress.incrementNouns();
    this.vocab.toggleNounPracticed(noun._id).subscribe({
      next: (updated) => {
        this.nouns.update(list => list.map(n => n._id === updated._id ? updated : n));
      },
      error: () => { noun.practiced = prev; }
    });
  }
}
