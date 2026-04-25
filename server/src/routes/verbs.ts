import { Router, Request, Response } from 'express';
import Verb from '../models/Verb';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (search) filter.infinitiv = { $regex: search as string, $options: 'i' };
  const verbs = await Verb.find(filter).sort({ category: 1, infinitiv: 1 });
  res.json(verbs);
});

router.get('/:id', async (req: Request, res: Response) => {
  const verb = await Verb.findById(req.params.id);
  if (!verb) return res.status(404).json({ error: 'Not found' });
  res.json(verb);
});

router.patch('/:id/practiced', async (req: Request, res: Response) => {
  const verb = await Verb.findById(req.params.id);
  if (!verb) return res.status(404).json({ error: 'Not found' });
  verb.practiced = !verb.practiced;
  verb.lastPracticed = verb.practiced ? new Date() : null;
  await verb.save();
  res.json(verb);
});

export default router;
