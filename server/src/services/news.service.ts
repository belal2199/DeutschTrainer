import axios from 'axios';
import { createHash } from 'crypto';

export type Lang = 'de' | 'en';

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  language: Lang;
  savedForLater: boolean;
}

export interface FetchedBundle {
  articles: NewsArticle[];
  cached: boolean;
  lastUpdated: string;
  error?: string;
}

interface RawArticle {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  source?: { name?: string | null } | null;
}

interface NewsApiResponse {
  status?: string;
  articles?: RawArticle[];
}

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_URL = (process.env.NEWS_API_URL || 'https://newsapi.org/v2').replace(/\/$/, '');
const NEWS_CACHE_TTL = Number(process.env.NEWS_CACHE_TTL ?? 900) * 1000;

const TECH_DOMAINS_EN = [
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'arstechnica.com',
  'engadget.com',
].join(',');

const TECH_DOMAINS_DE = [
  'heise.de',
  'golem.de',
  't3n.de',
  'computerwoche.de',
].join(',');

const TECH_DOMAINS_ALL = `${TECH_DOMAINS_EN},${TECH_DOMAINS_DE}`;

interface CacheEntry {
  data: NewsArticle[];
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();

function hashUrl(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

function normalize(raw: RawArticle[], language: Lang): NewsArticle[] {
  return raw
    .filter((a) => !!a && !!a.url && a.title && a.title.trim() !== '[Removed]')
    .map((a) => ({
      id: hashUrl(a.url as string),
      title: a.title as string,
      description: a.description ?? null,
      url: a.url as string,
      urlToImage: a.urlToImage ?? null,
      publishedAt: a.publishedAt ?? new Date().toISOString(),
      source: { name: a.source?.name ?? 'Unknown' },
      language,
      savedForLater: false,
    }));
}

async function fetchHeadlines(lang: Lang, page = 1, q?: string): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) throw new Error('NEWS_API_KEY not configured');

  // NewsAPI free tier returns 0 results for top-headlines?language=de&category=technology,
  // so use /everything filtered to known German tech domains instead.
  const isDe = lang === 'de';
  const endpoint = isDe ? 'everything' : 'top-headlines';
  const params: Record<string, string | number> = isDe
    ? {
        domains: TECH_DOMAINS_DE,
        language: 'de',
        pageSize: 10,
        page,
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY,
      }
    : {
        category: 'technology',
        language: 'en',
        pageSize: 10,
        page,
        apiKey: NEWS_API_KEY,
      };
  if (q) params.q = q;

  const res = await axios.get<NewsApiResponse>(`${NEWS_API_URL}/${endpoint}`, {
    params,
    timeout: 12000,
  });
  if (res.data.status !== 'ok') throw new Error(`NewsAPI status: ${res.data.status}`);
  return normalize(res.data.articles ?? [], lang);
}

async function searchHeadlines(q: string, lang: Lang): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) throw new Error('NEWS_API_KEY not configured');
  const domains = lang === 'de' ? TECH_DOMAINS_DE : TECH_DOMAINS_EN;
  const res = await axios.get<NewsApiResponse>(`${NEWS_API_URL}/everything`, {
    params: {
      q,
      language: lang,
      domains,
      pageSize: 10,
      sortBy: 'publishedAt',
      apiKey: NEWS_API_KEY,
    },
    timeout: 12000,
  });
  if (res.data.status !== 'ok') throw new Error(`NewsAPI status: ${res.data.status}`);
  return normalize(res.data.articles ?? [], lang);
}

void TECH_DOMAINS_ALL;

function getCached(key: string): NewsArticle[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > NEWS_CACHE_TTL) return null;
  return entry.data;
}

function getStale(key: string): CacheEntry | null {
  return cache.get(key) ?? null;
}

function setCached(key: string, data: NewsArticle[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getTopHeadlines(opts: {
  lang: 'de' | 'en' | 'both';
  page?: number;
  q?: string;
  forceRefresh?: boolean;
}): Promise<FetchedBundle> {
  const { lang, page = 1, q, forceRefresh = false } = opts;
  const langs: Lang[] = lang === 'both' ? ['de', 'en'] : [lang];
  const cacheKey = `top:${langs.join(',')}:${page}:${q || ''}`;

  if (!forceRefresh) {
    const hit = getCached(cacheKey);
    if (hit) {
      return {
        articles: hit,
        cached: true,
        lastUpdated: new Date(cache.get(cacheKey)!.timestamp).toISOString(),
      };
    }
  }

  try {
    const results = await Promise.all(langs.map((l) => fetchHeadlines(l, page, q)));
    const articles = results.flat();
    setCached(cacheKey, articles);
    return { articles, cached: false, lastUpdated: new Date().toISOString() };
  } catch (err) {
    const stale = getStale(cacheKey);
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (stale) {
      return {
        articles: stale.data,
        cached: true,
        lastUpdated: new Date(stale.timestamp).toISOString(),
        error: `News service degraded: ${message}`,
      };
    }
    return { articles: [], cached: false, lastUpdated: new Date().toISOString(), error: message };
  }
}

export async function searchNews(q: string, lang: 'de' | 'en' | 'both'): Promise<FetchedBundle> {
  const langs: Lang[] = lang === 'both' ? ['de', 'en'] : [lang];
  const cacheKey = `search:${langs.join(',')}:${q}`;
  const hit = getCached(cacheKey);
  if (hit) {
    return { articles: hit, cached: true, lastUpdated: new Date(cache.get(cacheKey)!.timestamp).toISOString() };
  }
  try {
    const results = await Promise.all(langs.map((l) => searchHeadlines(q, l)));
    const articles = results.flat();
    setCached(cacheKey, articles);
    return { articles, cached: false, lastUpdated: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { articles: [], cached: false, lastUpdated: new Date().toISOString(), error: message };
  }
}
