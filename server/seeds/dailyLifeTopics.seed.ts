import { runDailyLifeTopicsSeed } from '../src/seeds/dailyLifeTopics.seed';

runDailyLifeTopicsSeed().catch((err) => {
  console.error('Failed to seed Daily Life topics:', err);
  process.exit(1);
});
