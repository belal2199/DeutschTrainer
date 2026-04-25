import { Router, Request, Response } from 'express';
import Verb from '../models/Verb';
import Noun from '../models/Noun';
import Adjective from '../models/Adjective';
import Sentence from '../models/Sentence';
import Refemittel from '../models/Refemittel';
import Progress from '../models/Progress';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const [totalVerbs, practicedVerbs, totalNouns, practicedNouns, totalAdj, practicedAdj, totalSent, practicedSent, totalRefemittel, practicedRefemittel] =
    await Promise.all([
      Verb.countDocuments(),
      Verb.countDocuments({ practiced: true }),
      Noun.countDocuments(),
      Noun.countDocuments({ practiced: true }),
      Adjective.countDocuments(),
      Adjective.countDocuments({ practiced: true }),
      Sentence.countDocuments(),
      Sentence.countDocuments({ practiced: true }),
      Refemittel.countDocuments(),
      Refemittel.countDocuments({ practiced: true }),
    ]);

  // Calculate streak
  const progressDocs = await Progress.find().sort({ date: -1 }).limit(60);
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dayStr = checkDate.toISOString().slice(0, 10);
    const found = progressDocs.find((p) => {
      const pDate = new Date(p.date);
      return pDate.toISOString().slice(0, 10) === dayStr;
    });
    if (found) {
      const total =
        found.verbsPracticed + found.nounsPracticed + found.adjsPracticed + found.sentencesPracticed + found.refemittelPracticed;
      if (total >= 10) {
        streak++;
      } else {
        break;
      }
    } else {
      if (i === 0) continue; // today might not have progress yet
      break;
    }
  }

  res.json({
    totalVerbs,
    totalNouns,
    totalAdjectives: totalAdj,
    totalSentences: totalSent,
    totalRefemittel,
    practicedVerbs,
    practicedNouns,
    practicedAdjectives: practicedAdj,
    practicedSentences: practicedSent,
    practicedRefemittel,
    streak,
  });
});

export default router;
