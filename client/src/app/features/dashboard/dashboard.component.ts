import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { VocabService, Stats } from '../../core/services/vocab.service';
import { ProgressService, Progress } from '../../core/services/progress.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hero">
      <h1>Dein täglicher<br><span class="accent">Deutsch Trainer</span></h1>
      <p class="sub">Technisches Deutsch für Software-Entwickler</p>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-num">{{ stats().totalVerbs }}</span>
        <span class="stat-label">Verben</span>
        <span class="stat-practiced">{{ stats().practicedVerbs }} geübt</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats().totalNouns }}</span>
        <span class="stat-label">Nomen</span>
        <span class="stat-practiced">{{ stats().practicedNouns }} geübt</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats().totalAdjectives }}</span>
        <span class="stat-label">Adjektive</span>
        <span class="stat-practiced">{{ stats().practicedAdjectives }} geübt</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats().totalSentences }}</span>
        <span class="stat-label">Sätze</span>
        <span class="stat-practiced">{{ stats().practicedSentences }} geübt</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats().totalRefemittel }}</span>
        <span class="stat-label">Redemittel</span>
        <span class="stat-practiced">{{ stats().practicedRefemittel }} geübt</span>
      </div>
      <div class="stat-card streak">
        <span class="stat-num">{{ stats().streak }}</span>
        <span class="stat-label">Tage Streak</span>
      </div>
    </div>

    <div class="chart-section">
      <h2>Letzte 7 Tage</h2>
      <div class="chart">
        <canvas #chartCanvas width="700" height="200"></canvas>
      </div>
    </div>

    <div class="quick-links">
      <a routerLink="/flashcards" class="qlink">Flashcards starten</a>
      <a routerLink="/verbs" class="qlink">Verben üben</a>
      <a routerLink="/redemittel" class="qlink">Redemittel üben</a>
      <a routerLink="/script" class="qlink">Interview Script</a>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  stats = signal<Stats>({
    totalVerbs: 0, totalNouns: 0, totalAdjectives: 0, totalSentences: 0, totalRefemittel: 0,
    practicedVerbs: 0, practicedNouns: 0, practicedAdjectives: 0, practicedSentences: 0, practicedRefemittel: 0,
    streak: 0
  });
  progressData = signal<Progress[]>([]);

  constructor(private vocab: VocabService, private progressService: ProgressService) {}

  ngOnInit() {
    this.vocab.getStats().subscribe(s => this.stats.set(s));
    this.progressService.getProgress().subscribe(p => {
      this.progressData.set(p);
      this.drawChart();
    });
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  drawChart() {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('de-DE', { weekday: 'short' });
      const match = this.progressData().filter(p => new Date(p.date).toISOString().slice(0, 10) === key);
      const total = match.reduce((sum, p) => sum + p.verbsPracticed + p.nounsPracticed + p.adjsPracticed + p.sentencesPracticed + p.refemittelPracticed, 0);
      days.push({ label: dayLabel, total });
    }

    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;
    const barWidth = (w - padding * 2) / 7 * 0.6;
    const gap = (w - padding * 2) / 7;
    const maxVal = Math.max(...days.map(d => d.total), 10);

    ctx.clearRect(0, 0, w, h);

    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (h - padding * 2) * (1 - i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // bars
    days.forEach((day, i) => {
      const x = padding + i * gap + (gap - barWidth) / 2;
      const barH = (day.total / maxVal) * (h - padding * 2);
      const y = h - padding - barH;

      const gradient = ctx.createLinearGradient(x, y, x, h - padding);
      gradient.addColorStop(0, '#4ade80');
      gradient.addColorStop(1, 'rgba(74,222,128,0.2)');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 4);
      ctx.fill();

      // label
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(day.label, x + barWidth / 2, h - 12);

      // value
      if (day.total > 0) {
        ctx.fillStyle = '#e8eaf0';
        ctx.font = '12px DM Mono';
        ctx.fillText(String(day.total), x + barWidth / 2, y - 8);
      }
    });
  }
}
