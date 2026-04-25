import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DailyLifeTopic, DailyLifeTopicsService } from '../../core/services/daily-life-topics.service';

type DailyLifeTab = 'vocab' | 'sentences' | 'dialect' | 'proTip';

@Component({
  selector: 'app-daily-life-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/daily-life" class="back">← Alle Daily Life Themen</a>

    @if (loading()) {
      <div class="skeleton hero"></div>
      <div class="skeleton body"></div>
    } @else if (error()) {
      <div class="err">{{ error() }}</div>
    } @else {
      @if (topic(); as t) {
        <header class="hero">
          <div class="badge">{{ t.level }}</div>
          <h1 class="page-title">{{ t.emoji }} {{ t.titleDe }}</h1>
          <p class="page-sub">{{ t.title }}</p>
        </header>

        <div class="tabs">
          <button class="tab" [class.active]="activeTab() === 'vocab'" (click)="activeTab.set('vocab')">📚 Vokabeln</button>
          <button class="tab" [class.active]="activeTab() === 'sentences'" (click)="activeTab.set('sentences')">💬 Sätze</button>
          <button class="tab" [class.active]="activeTab() === 'dialect'" (click)="activeTab.set('dialect')">🗣️ Ruhrdeutsch</button>
          <button class="tab" [class.active]="activeTab() === 'proTip'" (click)="activeTab.set('proTip')">💡 Pro-Tip</button>
        </div>

        @if (activeTab() === 'vocab') {
          <section class="panel">
            <h2>Nomen</h2>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Artikel</th>
                    <th>Deutsch</th>
                    <th>English</th>
                  </tr>
                </thead>
                <tbody>
                  @for (noun of nouns(); track $index) {
                    <tr>
                      <td><span class="article">{{ noun.article }}</span></td>
                      <td class="word">{{ noun.german }}</td>
                      <td class="english">{{ noun.english }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <h2 class="verbs-title">Verben</h2>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Infinitiv</th>
                    <th>English</th>
                  </tr>
                </thead>
                <tbody>
                  @for (verb of verbs(); track $index) {
                    <tr>
                      <td class="word">{{ verb.infinitiv }}</td>
                      <td class="english">{{ verb.english }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (activeTab() === 'sentences') {
          <section class="panel grid-2">
            <div>
              <h2>Was du hörst</h2>
              <div class="sentence-list">
                @for (item of hear(); track $index) {
                  <article class="sentence-card">
                    <p class="de">{{ item.german }}</p>
                    <p class="en">{{ item.english }}</p>
                  </article>
                }
              </div>
            </div>
            <div>
              <h2>Was du sagst</h2>
              <div class="sentence-list">
                @for (item of say(); track $index) {
                  <article class="sentence-card">
                    <p class="de">{{ item.german }}</p>
                    <p class="en">{{ item.english }}</p>
                  </article>
                }
              </div>
            </div>
          </section>
        }

        @if (activeTab() === 'dialect') {
          <section class="panel">
            <h2>Ruhrdeutsch Flavor</h2>
            <ul class="dialect-list">
              @for (tip of dialect(); track $index) {
                <li>{{ tip }}</li>
              }
            </ul>
          </section>
        }

        @if (activeTab() === 'proTip') {
          <section class="panel">
            <h2>Kultureller Pro-Tip</h2>
            <article class="pro-tip-card">
              {{ proTip() }}
            </article>
          </section>
        }
      }
    }
  `,
  styleUrl: './daily-life-detail.component.css',
})
export class DailyLifeDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(DailyLifeTopicsService);
  private sub?: Subscription;

  topic = signal<DailyLifeTopic | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activeTab = signal<DailyLifeTab>('vocab');

  nouns = computed(() => this.topic()?.nouns ?? []);
  verbs = computed(() => this.topic()?.verbs ?? []);
  hear = computed(() => this.topic()?.sentencesHear ?? []);
  say = computed(() => this.topic()?.sentencesSay ?? []);
  dialect = computed(() => this.topic()?.dialect ?? []);
  proTip = computed(() => this.topic()?.proTip ?? '');

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const topicId = params.get('topicId');
      if (!topicId) {
        this.error.set('Ungueltige Topic-ID.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.error.set(null);
      this.activeTab.set('vocab');

      this.service.getTopic(topicId).subscribe({
        next: (topic) => {
          this.topic.set(topic);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Thema konnte nicht geladen werden.');
          this.loading.set(false);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}