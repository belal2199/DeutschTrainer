import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { VocabService } from './core/services/vocab.service';
import { NewsService } from './core/services/news.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private vocabService = inject(VocabService);
  news = inject(NewsService);

  streak = signal(0);
  unreadNews = computed(() => this.news.unreadCount());

  ngOnInit() {
    this.vocabService.getStats().subscribe({
      next: (stats) => this.streak.set(stats.streak),
      error: () => {}
    });
    this.news.loadNews();
  }
}
