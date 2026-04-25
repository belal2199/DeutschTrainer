import { Router, Request, Response } from 'express';
import Noun from '../models/Noun';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (search) filter.word = { $regex: search as string, $options: 'i' };
  const nouns = await Noun.find(filter).sort({ category: 1, word: 1 });
  res.json(nouns);
});

router.patch('/:id/practiced', async (req: Request, res: Response) => {
  const noun = await Noun.findById(req.params.id);
  if (!noun) return res.status(404).json({ error: 'Not found' });
  noun.practiced = !noun.practiced;
  noun.lastPracticed = noun.practiced ? new Date() : null;
  await noun.save();
  res.json(noun);
});

export default router;
