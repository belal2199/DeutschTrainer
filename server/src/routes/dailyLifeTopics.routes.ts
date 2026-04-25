import { Router, Request, Response } from 'express';
import DailyLifeTopic from '../models/DailyLifeTopic';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const topics = await DailyLifeTopic.find({}, { _id: 0, topicId: 1, title: 1, titleDe: 1, emoji: 1 })
    .sort({ topicId: 1 })
    .lean();
  res.json(topics);
});

router.get('/:topicId', async (req: Request, res: Response) => {
  const topic = await DailyLifeTopic.findOne({ topicId: req.params.topicId }, { _id: 0, __v: 0 }).lean();
  if (!topic) return res.status(404).json({ error: 'Topic not found' });
  res.json(topic);
});

export default router;