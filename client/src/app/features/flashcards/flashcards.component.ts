import { Component, OnInit, signal, computed } from '@angular/core';
import { VocabService, Verb, Noun, Adjective, Sentence, Refemittel } from '../../core/services/vocab.service';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';

type DeckType = 'Verben' | 'Nomen' | 'Adjektive' | 'Sätze' | 'Redemittel';
type CardItem = (Verb | Noun | Adjective | Sentence | Refemittel) & { _type: DeckType };

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CategoryFilterComponent],
  template: `
    @if (finished()) {
      <div class="summary">
        <h1>Runde beendet!</h1>
        <div class="score-row">
          <div class="score correct">{{ score().correct }} richtig</div>
          <div class="score wrong">{{ score().wrong }} falsch</div>
          <div class="score skip">{{ score().skipped }} übersprungen</div>
        </div>
        <div class="summary-actions">
          <button class="btn" (click)="restart()">Nochmal</button>
          <button class="btn primary" (click)="shuffle()">Neu mischen</button>
        </div>
      </div>
    } @else if (deck().length === 0) {
      <div class="empty">
        <h1>Flashcards</h1>
        <p>Wähle einen Deck-Typ und eine Kategorie, um zu starten.</p>
      </div>
    } @else {
      <div class="header">
        <h1>Flashcards</h1>
        <span class="counter">{{ currentIndex() + 1 }} / {{ deck().length }}</span>
      </div>
    }

    <div class="controls">
      <div class="deck-selector">
        @for (d of deckTypes; track d) {
          <button class="deck-btn" [class.active]="selectedDeck() === d" (click)="selectDeck(d)">{{ d }}</button>
        }
      </div>
      @if (allCategories().length > 0) {
        <app-category-filter [categories]="allCategories()" (categorySelected)="onCategory($event)" />
      }
    </div>

    @if (!finished() && deck().length > 0) {
      <div class="progress-dots">
        @for (item of deck(); track $index) {
          <span class="dot"
            [class.done]="$index < currentIndex()"
            [class.current]="$index === currentIndex()"></span>
        }
      </div>

      <div class="card-container" (click)="flip()">
        @for (card of currentCardList(); track card._id) {
          <div class="card" [class.flipped]="flipped()">
            <div class="card-face front">
              <span class="card-cat">{{ card.category }}</span>
              <p class="card-word">{{ getFront(card) }}</p>
              <p class="card-hint">{{ getHint(card) }}</p>
            </div>
            <div class="card-face back">
              <p class="card-translation">{{ getBack(card) }}</p>
              @if (card._type === 'Verben') {
                <p class="card-perfekt">{{ asCast(card, 'verb').perfekt }}</p>
              }
              <p class="card-example">{{ getExample(card) }}</p>
            </div>
          </div>
        }
      </div>

      <div class="actions">
        <button class="btn danger" (click)="markWrong()">&#10007; Nochmal</button>
        <button class="btn" (click)="skip()">&#8594; Überspringen</button>
        <button class="btn success" (click)="markCorrect()">&#10003; Gewusst</button>
      </div>
    }
  `,
  styleUrl: './flashcards.component.css'
})
export class FlashcardsComponent implements OnInit {
  deckTypes: DeckType[] = ['Verben', 'Nomen', 'Adjektive', 'Sätze', 'Redemittel'];
  selectedDeck = signal<DeckType>('Verben');
  selectedCategory = signal('');
  allItems = signal<CardItem[]>([]);
  deck = signal<CardItem[]>([]);
  currentIndex = signal(0);
  flipped = signal(false);
  finished = signal(false);
  score = signal({ correct: 0, wrong: 0, skipped: 0 });

  allCategories = computed(() => {
    return [...new Set(this.allItems().map(i => i.category))];
  });

  currentCard = computed(() => this.deck()[this.currentIndex()] ?? null);
  currentCardList = computed(() => {
    const card = this.currentCard();
    return card ? [card] : [];
  });

  constructor(private vocab: VocabService, private progress: ProgressService) {}

  ngOnInit() { this.loadDeck('Verben'); }

  selectDeck(d: DeckType) {
    this.selectedDeck.set(d);
    this.selectedCategory.set('');
    this.loadDeck(d);
  }

  onCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.filterAndShuffle();
  }

  loadDeck(type: DeckType) {
    const tag = (items: any[], t: DeckType): CardItem[] => items.map(i => ({ ...i, _type: t }));
    switch (type) {
      case 'Verben': this.vocab.getVerbs().subscribe(v => { this.allItems.set(tag(v, 'Verben')); this.filterAndShuffle(); }); break;
      case 'Nomen': this.vocab.getNouns().subscribe(n => { this.allItems.set(tag(n, 'Nomen')); this.filterAndShuffle(); }); break;
      case 'Adjektive': this.vocab.getAdjectives().subscribe(a => { this.allItems.set(tag(a, 'Adjektive')); this.filterAndShuffle(); }); break;
      case 'Sätze': this.vocab.getSentences().subscribe(s => { this.allItems.set(tag(s, 'Sätze')); this.filterAndShuffle(); }); break;
      case 'Redemittel': this.vocab.getRefemittel().subscribe(r => { this.allItems.set(tag(r, 'Redemittel')); this.filterAndShuffle(); }); break;
    }
  }

  filterAndShuffle() {
    let items = this.allItems();
    const cat = this.selectedCategory();
    if (cat) items = items.filter(i => i.category === cat);
    this.deck.set(this.shuffleArray([...items]));
    this.currentIndex.set(0);
    this.flipped.set(false);
    this.finished.set(false);
    this.score.set({ correct: 0, wrong: 0, skipped: 0 });
  }

  flip() { this.flipped.update(f => !f); }

  markCorrect() {
    const card = this.currentCard();
    if (card) {
      this.score.update(s => ({ ...s, correct: s.correct + 1 }));
      this.progress.addFlashcardCorrect();
      this.togglePracticed(card);
    }
    this.next();
  }

  markWrong() {
    this.score.update(s => ({ ...s, wrong: s.wrong + 1 }));
    this.progress.addFlashcardWrong();
    this.next();
  }

  skip() {
    this.score.update(s => ({ ...s, skipped: s.skipped + 1 }));
    this.next();
  }

  next() {
    if (this.currentIndex() >= this.deck().length - 1) {
      this.finished.set(true);
      this.progress.saveSession().subscribe();
    } else {
      this.flipped.set(false);
      this.currentIndex.update(i => i + 1);
    }
  }

  restart() { this.filterAndShuffle(); }
  shuffle() { this.filterAndShuffle(); }

  getFront(card: CardItem): string {
    switch (card._type) {
      case 'Verben': return (card as any).infinitiv;
      case 'Nomen': return (card as any).word;
      case 'Adjektive': return (card as any).word;
      case 'Sätze': return (card as any).german;
      case 'Redemittel': return (card as any).phrase;
    }
  }

  getBack(card: CardItem): string {
    return (card as any).english;
  }

  getHint(card: CardItem): string {
    switch (card._type) {
      case 'Verben': return (card as any).perfekt;
      case 'Nomen': return 'Plural: ' + (card as any).plural;
      case 'Adjektive': return 'Gegenteil: ' + (card as any).opposite;
      case 'Sätze': return '';
      case 'Redemittel': return 'Use case: ' + (card as any).useCase;
    }
  }

  getExample(card: CardItem): string {
    return (card as any).example || '';
  }

  asCast(card: CardItem, _type: string): any { return card; }

  private togglePracticed(card: CardItem) {
    switch (card._type) {
      case 'Verben': this.vocab.toggleVerbPracticed(card._id).subscribe(); this.progress.incrementVerbs(); break;
      case 'Nomen': this.vocab.toggleNounPracticed(card._id).subscribe(); this.progress.incrementNouns(); break;
      case 'Adjektive': this.vocab.toggleAdjectivePracticed(card._id).subscribe(); this.progress.incrementAdjs(); break;
      case 'Sätze': this.vocab.toggleSentencePracticed(card._id).subscribe(); this.progress.incrementSentences(); break;
      case 'Redemittel': this.vocab.toggleRefemittelPracticed(card._id).subscribe(); this.progress.incrementRefemittel(); break;
    }
  }

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
