import { Router, Request, Response } from 'express';
import Progress from '../models/Progress';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const progress = await Progress.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });
  res.json(progress);
});

router.post('/', async (req: Request, res: Response) => {
  const progress = new Progress({
    date: new Date(),
    ...req.body,
  });
  await progress.save();
  res.status(201).json(progress);
});

export default router;
