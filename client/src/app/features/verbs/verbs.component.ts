import { Component, OnInit, signal, computed } from '@angular/core';
import { VocabService, Verb } from '../../core/services/vocab.service';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MarkBtnComponent } from '../../shared/components/mark-btn/mark-btn.component';
import { InlineCorrectorComponent } from '../../shared/components/inline-corrector/inline-corrector.component';

@Component({
  selector: 'app-verbs',
  standalone: true,
  imports: [CategoryFilterComponent, SearchBarComponent, MarkBtnComponent, InlineCorrectorComponent],
  template: `
    <h1 class="page-title">Verben</h1>
    <p class="page-sub">{{ filtered().length }} Verben</p>
    <app-search-bar (searchChanged)="onSearch($event)" />
    <app-category-filter [categories]="categories()" (categorySelected)="onCategory($event)" />
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Infinitiv</th>
            <th>English</th>
            <th>Perfekt</th>
            <th>Kategorie</th>
            <th>Beispiel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (verb of filtered(); track verb._id) {
            <tr [class.practiced]="verb.practiced">
              <td class="word">{{ verb.infinitiv }}</td>
              <td class="english">{{ verb.english }}</td>
              <td class="perfekt">
                <span class="aux-badge" [class.haben]="verb.perfekt.startsWith('hat')"
                  [class.sein]="verb.perfekt.startsWith('ist')">
                  {{ verb.perfekt.startsWith('hat') ? 'haben' : 'sein' }}
                </span>
                {{ verb.perfekt }}
              </td>
              <td><span class="cat-badge">{{ verb.category }}</span></td>
              <td class="example">
                <div>{{ verb.example }}</div>
                <app-inline-corrector [word]="verb.infinitiv" />
              </td>
              <td><app-mark-btn [practiced]="verb.practiced" (toggled)="togglePracticed(verb)" /></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './verbs.component.css'
})
export class VerbsComponent implements OnInit {
  verbs = signal<Verb[]>([]);
  search = signal('');
  category = signal('');

  categories = computed(() => [...new Set(this.verbs().map(v => v.category))]);

  filtered = computed(() => {
    let list = this.verbs();
    const cat = this.category();
    const q = this.search().toLowerCase();
    if (cat) list = list.filter(v => v.category === cat);
    if (q) list = list.filter(v => v.infinitiv.toLowerCase().includes(q) || v.english.toLowerCase().includes(q));
    return list;
  });

  constructor(private vocab: VocabService, private progress: ProgressService) {}

  ngOnInit() {
    this.vocab.getVerbs().subscribe(v => this.verbs.set(v));
  }

  onSearch(q: string) { this.search.set(q); }
  onCategory(c: string) { this.category.set(c); }

  togglePracticed(verb: Verb) {
    const prev = verb.practiced;
    verb.practiced = !verb.practiced;
    if (!prev) this.progress.incrementVerbs();
    this.vocab.toggleVerbPracticed(verb._id).subscribe({
      next: (updated) => {
        this.verbs.update(list => list.map(v => v._id === updated._id ? updated : v));
      },
      error: () => { verb.practiced = prev; }
    });
  }
}
