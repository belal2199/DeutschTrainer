import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import verbsRouter from './routes/verbs';
import nounsRouter from './routes/nouns';
import adjectivesRouter from './routes/adjectives';
import sentencesRouter from './routes/sentences';
import refemittelRouter from './routes/refemittel';
import statsRouter from './routes/stats';
import progressRouter from './routes/progress';
import correctionRouter from './routes/correction';
import newsRouter from './routes/news';
import dailyLifeTopicsRouter from './routes/dailyLifeTopics.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/verbs', verbsRouter);
app.use('/api/nouns', nounsRouter);
app.use('/api/adjectives', adjectivesRouter);
app.use('/api/sentences', sentencesRouter);
app.use('/api/refemittel', refemittelRouter);
app.use('/api/stats', statsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/correct', correctionRouter);
app.use('/api/news', newsRouter);
app.use('/api/daily-life-topics', dailyLifeTopicsRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
