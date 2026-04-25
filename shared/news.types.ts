export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  language: 'de' | 'en';
  savedForLater: boolean;
}

export interface NewsResponse {
  articles: NewsArticle[];
  germanCount: number;
  englishCount: number;
  cached: boolean;
  lastUpdated: string;
  error?: string;
}
