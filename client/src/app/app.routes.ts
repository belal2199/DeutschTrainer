import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'verbs', loadComponent: () => import('./features/verbs/verbs.component').then(m => m.VerbsComponent) },
  { path: 'nouns', loadComponent: () => import('./features/nouns/nouns.component').then(m => m.NounsComponent) },
  { path: 'adjectives', loadComponent: () => import('./features/adjectives/adjectives.component').then(m => m.AdjectivesComponent) },
  { path: 'sentences', loadComponent: () => import('./features/sentences/sentences.component').then(m => m.SentencesComponent) },
  { path: 'redemittel', loadComponent: () => import('./features/refemittel/refemittel.component').then(m => m.RefemittelComponent) },
  { path: 'refemittel', redirectTo: 'redemittel' },
  { path: 'flashcards', loadComponent: () => import('./features/flashcards/flashcards.component').then(m => m.FlashcardsComponent) },
  { path: 'daily-life', loadComponent: () => import('./features/daily-life/daily-life-list.component').then(m => m.DailyLifeListComponent) },
  { path: 'daily-life/:topicId', loadComponent: () => import('./features/daily-life/daily-life-detail.component').then(m => m.DailyLifeDetailComponent) },
  { path: 'script', loadComponent: () => import('./features/script/script.component').then(m => m.ScriptComponent) },
  { path: 'korrektur', loadComponent: () => import('./features/correction/correction.component').then(m => m.CorrectionComponent) },
  { path: 'news', loadComponent: () => import('./features/news/news.component').then(m => m.NewsComponent) },
  { path: '**', redirectTo: '' },
];
