import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DailyLifeTopicSummary, DailyLifeTopicsService } from '../../core/services/daily-life-topics.service';

@Component({
  selector: 'app-daily-life-list',
  standalone: true,
  template: `
    <header class="hero">
      <h1 class="page-title">Daily Life Curriculum</h1>
      <p class="page-sub">20 reale Alltagsthemen in Deutsch (B1/B2) mit Ruhrdeutsch-Flavor.</p>
    </header>

    @if (loading()) {
      <div class="grid">
        @for (_ of [1,2,3,4,5,6]; track $index) {
          <article class="card skeleton"></article>
        }
      </div>
    } @else if (error()) {
      <div class="err">{{ error() }}</div>
    } @else {
      <div class="grid">
        @for (topic of topics(); track topic.topicId) {
          <button class="card" (click)="openTopic(topic)">
            <div class="emoji">{{ topic.emoji }}</div>
            <h2 class="title-de">{{ topic.titleDe }}</h2>
            <p class="title-en">{{ topic.title }}</p>
          </button>
        }
      </div>
    }
  `,
  styleUrl: './daily-life-list.component.css',
})
export class DailyLifeListComponent implements OnInit {
  private readonly service = inject(DailyLifeTopicsService);
  private readonly router = inject(Router);

  topics = signal<DailyLifeTopicSummary[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.service.getTopics().subscribe({
      next: (topics) => {
        this.topics.set(topics);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Daily Life Themen konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  openTopic(topic: DailyLifeTopicSummary): void {
    this.router.navigate(['/daily-life', topic.topicId]);
  }
}