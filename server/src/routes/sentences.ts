import { Router, Request, Response } from 'express';
import Sentence from '../models/Sentence';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (search) filter.german = { $regex: search as string, $options: 'i' };
  const sentences = await Sentence.find(filter).sort({ category: 1 });
  res.json(sentences);
});

router.patch('/:id/practiced', async (req: Request, res: Response) => {
  const sentence = await Sentence.findById(req.params.id);
  if (!sentence) return res.status(404).json({ error: 'Not found' });
  sentence.practiced = !sentence.practiced;
  sentence.lastPracticed = sentence.practiced ? new Date() : null;
  await sentence.save();
  res.json(sentence);
});

export default router;
