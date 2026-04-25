import { Router, Request, Response } from 'express';
import Refemittel from '../models/Refemittel';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { phrase: { $regex: search as string, $options: 'i' } },
      { english: { $regex: search as string, $options: 'i' } },
    ];
  }
  const refemittel = await Refemittel.find(filter).sort({ category: 1, phrase: 1 });
  res.json(refemittel);
});

router.patch('/:id/practiced', async (req: Request, res: Response) => {
  const item = await Refemittel.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.practiced = !item.practiced;
  item.lastPracticed = item.practiced ? new Date() : null;
  await item.save();
  res.json(item);
});

export default router;
