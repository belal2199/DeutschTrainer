import { Component, OnInit, signal, computed } from '@angular/core';
import { VocabService, Sentence } from '../../core/services/vocab.service';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MarkBtnComponent } from '../../shared/components/mark-btn/mark-btn.component';

@Component({
  selector: 'app-sentences',
  standalone: true,
  imports: [CategoryFilterComponent, SearchBarComponent, MarkBtnComponent],
  template: `
    <h1 class="page-title">Sätze</h1>
    <p class="page-sub">{{ filtered().length }} Sätze</p>
    <app-search-bar (searchChanged)="onSearch($event)" />
    <app-category-filter [categories]="categories()" (categorySelected)="onCategory($event)" />
    <div class="cards">
      @for (s of filtered(); track s._id) {
        <div class="card" [class.practiced]="s.practiced">
          <p class="german">{{ s.german }}</p>
          <p class="english">{{ s.english }}</p>
          <div class="tags">
            @if (s.verbUsed) { <span class="tag verb">{{ s.verbUsed }}</span> }
            @if (s.nounUsed) { <span class="tag noun">{{ s.nounUsed }}</span> }
            @if (s.adjUsed) { <span class="tag adj">{{ s.adjUsed }}</span> }
            <span class="tag cat">{{ s.category }}</span>
          </div>
          <app-mark-btn [practiced]="s.practiced" (toggled)="togglePracticed(s)" />
        </div>
      }
    </div>
  `,
  styleUrl: './sentences.component.css'
})
export class SentencesComponent implements OnInit {
  sentences = signal<Sentence[]>([]);
  search = signal('');
  category = signal('');

  categories = computed(() => [...new Set(this.sentences().map(s => s.category))]);

  filtered = computed(() => {
    let list = this.sentences();
    const cat = this.category();
    const q = this.search().toLowerCase();
    if (cat) list = list.filter(s => s.category === cat);
    if (q) list = list.filter(s => s.german.toLowerCase().includes(q) || s.english.toLowerCase().includes(q));
    return list;
  });

  constructor(private vocab: VocabService, private progress: ProgressService) {}

  ngOnInit() {
    this.vocab.getSentences().subscribe(s => this.sentences.set(s));
  }

  onSearch(q: string) { this.search.set(q); }
  onCategory(c: string) { this.category.set(c); }

  togglePracticed(sentence: Sentence) {
    const wasPracticed = sentence.practiced;
    this.sentences.update(list =>
      list.map(s => s._id === sentence._id ? { ...s, practiced: !wasPracticed } : s),
    );
    if (!wasPracticed) this.progress.incrementSentences();
    this.vocab.toggleSentencePracticed(sentence._id).subscribe({
      next: (updated) => {
        this.sentences.update(list => list.map(s => s._id === updated._id ? updated : s));
      },
      error: () => {
        this.sentences.update(list =>
          list.map(s => s._id === sentence._id ? { ...s, practiced: wasPracticed } : s),
        );
      },
    });
  }
}
