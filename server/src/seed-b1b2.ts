import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Verb from './models/Verb';
import Noun from './models/Noun';
import Adjective from './models/Adjective';

type Section = 'verb' | 'noun' | 'adj' | null;

const SOURCE_FILE = path.resolve(__dirname, '..', '..', 'deutsch_trainer_b1_b2_vocab_verbs.txt');

interface ParsedVerb {
  infinitiv: string; english: string; perfekt: string;
  level: string; category: string; example: string; exampleEn: string;
}
interface ParsedNoun {
  word: string; plural: string; english: string;
  level: string; category: string; example: string; exampleEn: string;
}
interface ParsedAdj {
  word: string; english: string; opposite: string;
  level: string; category: string; example: string; exampleEn: string;
}

interface Parsed {
  verbs: ParsedVerb[];
  nouns: ParsedNoun[];
  adjectives: ParsedAdj[];
}

function detectSection(line: string): Section | undefined {
  if (/SECTION\s+\d+\s+—\s+B[12]\s+VERBS/i.test(line)) return 'verb';
  if (/SECTION\s+\d+\s+—\s+B[12]\s+NOUNS/i.test(line)) return 'noun';
  if (/SECTION\s+\d+\s+—\s+B[12]\s+ADJECTIVES/i.test(line)) return 'adj';
  return undefined;
}

function splitRow(line: string): string[] {
  return line.split('|').map((c) => c.trim());
}

function parseFile(content: string): Parsed {
  const verbs: ParsedVerb[] = [];
  const nouns: ParsedNoun[] = [];
  const adjectives: ParsedAdj[] = [];
  let section: Section = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const next = detectSection(line);
    if (next !== undefined) {
      section = next;
      continue;
    }

    if (!section) continue;
    if (!/^\d+\s*\|/.test(line)) continue;

    const cols = splitRow(line);

    if (section === 'verb' && cols.length >= 8) {
      const [, infinitiv, english, perfekt, level, category, example, exampleEn] = cols;
      if (!infinitiv) continue;
      verbs.push({ infinitiv, english, perfekt, level, category, example, exampleEn });
    } else if (section === 'noun' && cols.length >= 8) {
      const [, article, german, english, level, category, example, exampleEn] = cols;
      if (!german) continue;
      const word = `${article} ${german}`.trim();
      const plural = /\(pl\.\)/i.test(german) ? '(pl.)' : '';
      nouns.push({ word, plural, english, level, category, example, exampleEn });
    } else if (section === 'adj' && cols.length >= 7) {
      const [, german, english, level, category, example, exampleEn] = cols;
      if (!german) continue;
      adjectives.push({ word: german, english, opposite: '', level, category, example, exampleEn });
    }
  }

  return { verbs, nouns, adjectives };
}

const RUHRDEUTSCH_ADJ: ParsedAdj[] = [
  { word: 'krass', english: 'extreme / insane', opposite: '', level: 'B1', category: 'Ruhrdeutsch', example: 'Das war krass gut heute!', exampleEn: 'That was insanely good today!' },
  { word: 'geil', english: 'awesome / cool', opposite: '', level: 'B1', category: 'Ruhrdeutsch', example: 'Die neue Wohnung ist echt geil!', exampleEn: 'The new flat is really awesome!' },
  { word: 'bescheuert', english: 'stupid / ridiculous', opposite: '', level: 'B1', category: 'Ruhrdeutsch', example: 'Das ist doch bescheuert, ne?', exampleEn: "That's just ridiculous, isn't it?" },
  { word: 'mega', english: 'super / mega', opposite: '', level: 'B1', category: 'Ruhrdeutsch', example: 'Mega günstig hier, Alter!', exampleEn: 'Super cheap here, dude!' },
  { word: 'hammermäßig', english: 'amazing', opposite: '', level: 'B1', category: 'Ruhrdeutsch', example: 'Das Essen war hammermäßig!', exampleEn: 'The food was amazing!' },
  { word: 'langweilig', english: 'boring', opposite: 'spannend', level: 'B1', category: 'Ruhrdeutsch', example: 'Der Film war so langweilig.', exampleEn: 'The movie was so boring.' },
  { word: 'anstrengend', english: 'exhausting', opposite: 'erholsam', level: 'B1', category: 'Ruhrdeutsch', example: 'Der Tag war echt anstrengend.', exampleEn: 'The day was really exhausting.' },
  { word: 'spannend', english: 'exciting / interesting', opposite: 'langweilig', level: 'B1', category: 'Ruhrdeutsch', example: 'Das Thema finde ich super spannend.', exampleEn: 'I find the topic super exciting.' },
];

async function run() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Source file not found: ${SOURCE_FILE}`);
    process.exit(1);
  }
  const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const parsed = parseFile(content);
  parsed.adjectives.push(...RUHRDEUTSCH_ADJ);

  console.log(`Parsed: ${parsed.verbs.length} verbs, ${parsed.nouns.length} nouns, ${parsed.adjectives.length} adjectives`);

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/deutsch_trainer';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let v = 0;
  for (const item of parsed.verbs) {
    await Verb.findOneAndUpdate(
      { infinitiv: item.infinitiv },
      {
        $set: {
          english: item.english,
          perfekt: item.perfekt,
          category: item.category,
          example: item.example,
          exampleEn: item.exampleEn,
          level: item.level,
        },
        $setOnInsert: { practiced: false, lastPracticed: null },
      },
      { upsert: true, new: true },
    );
    v++;
  }
  console.log(`Upserted ${v} verbs`);

  let n = 0;
  for (const item of parsed.nouns) {
    await Noun.findOneAndUpdate(
      { word: item.word },
      {
        $set: {
          plural: item.plural,
          english: item.english,
          category: item.category,
          example: item.example,
          exampleEn: item.exampleEn,
          level: item.level,
        },
        $setOnInsert: { practiced: false, lastPracticed: null },
      },
      { upsert: true, new: true },
    );
    n++;
  }
  console.log(`Upserted ${n} nouns`);

  let a = 0;
  for (const item of parsed.adjectives) {
    await Adjective.findOneAndUpdate(
      { word: item.word },
      {
        $set: {
          english: item.english,
          opposite: item.opposite,
          category: item.category,
          example: item.example,
          exampleEn: item.exampleEn,
          level: item.level,
        },
        $setOnInsert: { practiced: false, lastPracticed: null },
      },
      { upsert: true, new: true },
    );
    a++;
  }
  console.log(`Upserted ${a} adjectives`);

  await mongoose.disconnect();
  console.log('B1/B2 seed complete!');
}

run().catch((err) => {
  console.error('B1/B2 seed error:', err);
  process.exit(1);
});
