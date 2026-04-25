import { Router, Request, Response } from 'express';
import Adjective from '../models/Adjective';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (search) filter.word = { $regex: search as string, $options: 'i' };
  const adjectives = await Adjective.find(filter).sort({ category: 1, word: 1 });
  res.json(adjectives);
});

router.patch('/:id/practiced', async (req: Request, res: Response) => {
  const adj = await Adjective.findById(req.params.id);
  if (!adj) return res.status(404).json({ error: 'Not found' });
  adj.practiced = !adj.practiced;
  adj.lastPracticed = adj.practiced ? new Date() : null;
  await adj.save();
  res.json(adj);
});

export default router;
