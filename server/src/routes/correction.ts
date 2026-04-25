import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { correctText, isOllamaUnavailable, CorrectionMode } from '../services/correction.service';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
});

router.use(limiter);

router.post('/', async (req: Request, res: Response) => {
  const { text, context, mode } = req.body ?? {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Bitte gib einen Text ein.' });
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text ist zu lang. Maximal 2000 Zeichen.' });
  }
  if (mode !== 'sentence' && mode !== 'free') {
    return res.status(400).json({ error: 'Ungültiger Modus.' });
  }
  const ctx = typeof context === 'string' && context.trim() ? context.trim() : undefined;

  try {
    const result = await correctText(text.trim(), mode as CorrectionMode, ctx);
    return res.json(result);
  } catch (err) {
    console.error('Correction error:', err);
    if (isOllamaUnavailable(err)) {
      return res.status(503).json({ error: 'KI-Service nicht verfügbar. Bitte versuche es später.' });
    }
    return res.status(500).json({ error: 'Fehler bei der Korrektur. Bitte versuche es erneut.' });
  }
});

export default router;
