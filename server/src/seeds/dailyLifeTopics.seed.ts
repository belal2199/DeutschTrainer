import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import DailyLifeTopic, { IDailyLifeTopic } from '../models/DailyLifeTopic';

type PlainTopic = Omit<
  IDailyLifeTopic,
  keyof mongoose.Document | 'id' | '_id' | 'createdAt' | 'updatedAt'
>;

const EMOJI_MAP: Record<string, string> = {
  topic_01: '🛒',
  topic_02: '🏓',
  topic_03: '🩺',
  topic_04: '🚌',
  topic_05: '💊',
  topic_06: '🥨',
  topic_07: '📦',
  topic_08: '🏦',
  topic_09: '🏋️',
  topic_10: '🍽️',
  topic_11: '💇',
  topic_12: '🏠',
  topic_13: '🏢',
  topic_14: '🏘️',
  topic_15: '♻️',
  topic_16: '🛠️',
  topic_17: '🥕',
  topic_18: '⚽',
  topic_19: '⛽',
  topic_20: '📚',
};

function normalizeTitle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Doctor'S", "Doctor's")
    .replace('At The', 'At the')
    .replace('The Public', 'the Public');
}

function normalizeTopicId(topicNum: string): string {
  return `topic_${topicNum.padStart(2, '0')}`;
}

function extractSection(block: string, sectionName: string, nextSectionNames: string[]): string {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const next = nextSectionNames
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const rx = new RegExp(`--- ${escaped} ---\\s*([\\s\\S]*?)(?=--- (?:${next}) ---|$)`, 'i');
  const match = block.match(rx);
  return match ? match[1].trim() : '';
}

function parseNouns(text: string): PlainTopic['nouns'] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.includes('—'))
    .map((line) => {
      const [left, right] = line.split('—').map((p) => p.trim());
      const articleMatch = left.match(/^(der|die|das)\s+(.+)$/i);
      if (!articleMatch) return null;
      return {
        article: articleMatch[1].toLowerCase() as 'der' | 'die' | 'das',
        german: articleMatch[2].trim(),
        english: right,
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);
}

function parseVerbs(text: string): PlainTopic['verbs'] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.includes('—'))
    .map((line) => {
      const [left, right] = line.split('—').map((p) => p.trim());
      return {
        infinitiv: left,
        english: right,
      };
    });
}

function parseSentencePairs(text: string): PlainTopic['sentencesHear'] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const result: PlainTopic['sentencesHear'] = [];
  let currentGerman = '';

  for (const line of lines) {
    if (line.startsWith('"') && line.endsWith('"')) {
      currentGerman = line.slice(1, -1);
      continue;
    }
    if (line.startsWith('→') && currentGerman) {
      result.push({
        german: currentGerman,
        english: line.replace(/^→\s*/, ''),
      });
      currentGerman = '';
    }
  }

  return result;
}

function parseDialect(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const items: string[] = [];
  let current = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('•')) {
      if (current) items.push(current.trim());
      current = line.replace(/^•\s*/, '').trim();
      continue;
    }

    if (current) {
      current = `${current} ${line}`;
    }
  }

  if (current) items.push(current.trim());
  return items;
}

function parseProTip(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseDailyLifeTopics(rawText: string): PlainTopic[] {
  const topicHeaderRx = /^TOPIC\s+(\d{2})\s+—\s+(.+?)\s*\((.+)\)\s*$/gm;
  const matches = [...rawText.matchAll(topicHeaderRx)];
  const topics: PlainTopic[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const topicNum = match[1];
    const title = normalizeTitle(match[2].trim());
    const titleDe = match[3].trim();
    const start = match.index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? rawText.length) : rawText.length;
    const block = rawText.slice(start, end);

    const nounsBlock = extractSection(block, 'NOUNS', ['VERBS', 'SENTENCES YOU WILL HEAR']);
    const verbsBlock = extractSection(block, 'VERBS', ['SENTENCES YOU WILL HEAR', 'SENTENCES YOU CAN SAY']);
    const hearBlock = extractSection(block, 'SENTENCES YOU WILL HEAR', ['SENTENCES YOU CAN SAY', 'RUHRGEBIET FLAVOR']);
    const sayBlock = extractSection(block, 'SENTENCES YOU CAN SAY', ['RUHRGEBIET FLAVOR', 'PRO TIP']);
    const dialectBlock = extractSection(block, 'RUHRGEBIET FLAVOR', ['PRO TIP']);
    const proTipBlock = extractSection(block, 'PRO TIP', ['NOUNS']);

    const topicId = normalizeTopicId(topicNum);
    topics.push({
      topicId,
      title,
      titleDe,
      emoji: EMOJI_MAP[topicId] || '📘',
      level: 'B1/B2',
      nouns: parseNouns(nounsBlock),
      verbs: parseVerbs(verbsBlock),
      sentencesHear: parseSentencePairs(hearBlock),
      sentencesSay: parseSentencePairs(sayBlock),
      dialect: parseDialect(dialectBlock),
      proTip: parseProTip(proTipBlock),
    });
  }

  return topics;
}

export async function runDailyLifeTopicsSeed(): Promise<void> {
  const filePath = path.resolve(__dirname, '../../../deutsch_trainer_daily_life_curriculum.txt');
  const file = fs.readFileSync(filePath, 'utf8');
  const topics = parseDailyLifeTopics(file);

  if (topics.length !== 20) {
    throw new Error(`Expected 20 topics, got ${topics.length}`);
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/deutsch_trainer';
  await mongoose.connect(mongoUri);

  await DailyLifeTopic.deleteMany({});
  await DailyLifeTopic.insertMany(topics);

  console.log(`Seeded ${topics.length} Daily Life topics`);
  await mongoose.disconnect();
}

if (require.main === module) {
  runDailyLifeTopicsSeed().catch(async (err) => {
    console.error('Failed to seed Daily Life topics:', err);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect errors
    }
    process.exit(1);
  });
}