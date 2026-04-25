import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { getTopHeadlines, searchNews } from '../services/news.service';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
});
router.use(limiter);

function parseLang(value: unknown): 'de' | 'en' | 'both' {
  return value === 'de' || value === 'en' ? value : 'both';
}

router.get('/', async (req: Request, res: Response) => {
  const lang = parseLang(req.query.lang);
  const page = Math.max(1, Number(req.query.page) || 1);
  const q = typeof req.query.q === 'string' && req.query.q.trim() ? req.query.q.trim() : undefined;
  const forceRefresh = req.query.refresh === 'true';

  const bundle = await getTopHeadlines({ lang, page, q, forceRefresh });
  const germanCount = bundle.articles.filter((a) => a.language === 'de').length;
  const englishCount = bundle.articles.filter((a) => a.language === 'en').length;

  res.json({
    articles: bundle.articles,
    germanCount,
    englishCount,
    cached: bundle.cached,
    lastUpdated: bundle.lastUpdated,
    ...(bundle.error ? { error: bundle.error } : {}),
  });
});

router.get('/search', async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2) {
    return res.status(400).json({ error: 'Suchbegriff muss mindestens 2 Zeichen haben.' });
  }
  const lang = parseLang(req.query.lang);
  const bundle = await searchNews(q, lang);
  const germanCount = bundle.articles.filter((a) => a.language === 'de').length;
  const englishCount = bundle.articles.filter((a) => a.language === 'en').length;

  res.json({
    articles: bundle.articles,
    germanCount,
    englishCount,
    cached: bundle.cached,
    lastUpdated: bundle.lastUpdated,
    ...(bundle.error ? { error: bundle.error } : {}),
  });
});

export default router;
