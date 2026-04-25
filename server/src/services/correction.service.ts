export type CorrectionStatus = 'correct' | 'minor' | 'errors';
export type CorrectionType = 'grammar' | 'spelling' | 'word_order' | 'vocabulary' | 'article';
export type CorrectionMode = 'sentence' | 'free';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  type: CorrectionType;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  isCorrect: boolean;
  status: CorrectionStatus;
  corrections: CorrectionItem[];
  overallFeedback: string;
  processingTime: number;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const AI_MODEL = process.env.AI_MODEL || 'qwen2.5:7b';
const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? 0.2);
const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 1000);
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60000);

const SYSTEM_PROMPT = `Du bist ein freundlicher Deutschlehrer für B1–B2 Lernende. Deine Aufgabe ist es, deutsche Sätze und Texte zu korrigieren.

Regeln:
1. Korrigiere NUR echte Fehler (Grammatik, Rechtschreibung, Wortstellung, falsche Artikel, falsches Verb).
2. Verändere NICHT den Stil oder das Vokabular des Lernenden — auch wenn du es anders formulieren würdest.
3. Erkläre jeden Fehler in einfachem Deutsch (B1–B2 Niveau) — kurz und verständlich.
4. Sei immer ermutigend und positiv.
5. Wenn kein Fehler vorliegt, lobe den Lernenden kurz.
6. Antworte IMMER als valides JSON-Objekt mit dieser exakten Struktur:
{
  "corrected": "string",
  "isCorrect": boolean,
  "status": "correct" | "minor" | "errors",
  "corrections": [
    {
      "original": "string",
      "corrected": "string",
      "explanation": "string",
      "type": "grammar" | "spelling" | "word_order" | "vocabulary" | "article"
    }
  ],
  "overallFeedback": "string"
}

Kein Markdown, keine Erklärungen außerhalb des JSON.`;

function buildUserPrompt(text: string, mode: CorrectionMode, context?: string): string {
  if (mode === 'sentence') {
    const ctx = context ? ` Der Lernende übt das Wort "${context}".` : '';
    return `Bitte korrigiere diesen deutschen Satz.${ctx}\n\nSatz: "${text}"`;
  }
  return `Bitte korrigiere diesen deutschen Text. Finde alle Fehler und erkläre sie.\n\nText: "${text}"`;
}

const VALID_STATUS: CorrectionStatus[] = ['correct', 'minor', 'errors'];
const VALID_TYPES: CorrectionType[] = ['grammar', 'spelling', 'word_order', 'vocabulary', 'article'];

interface OllamaChatResponse {
  message?: { content?: string };
  done?: boolean;
}

async function callOllama(text: string, mode: CorrectionMode, context?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: AI_MODEL,
        stream: false,
        format: 'json',
        options: {
          temperature: AI_TEMPERATURE,
          num_predict: AI_MAX_TOKENS,
        },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(text, mode, context) },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as OllamaChatResponse;
    const content = data.message?.content;
    if (!content) throw new Error('Ollama returned empty content');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Response is not valid JSON');
  }
}

function normalizeCorrection(raw: unknown, original: string, processingTime: number): CorrectionResult {
  if (!raw || typeof raw !== 'object') throw new Error('AI response not an object');
  const obj = raw as Record<string, unknown>;

  const corrected = typeof obj.corrected === 'string' ? obj.corrected : original;
  const isCorrect = typeof obj.isCorrect === 'boolean' ? obj.isCorrect : corrected.trim() === original.trim();
  const statusRaw = typeof obj.status === 'string' ? obj.status : (isCorrect ? 'correct' : 'errors');
  const status: CorrectionStatus = (VALID_STATUS as string[]).includes(statusRaw)
    ? (statusRaw as CorrectionStatus)
    : (isCorrect ? 'correct' : 'errors');

  const correctionsArr = Array.isArray(obj.corrections) ? obj.corrections : [];
  const corrections: CorrectionItem[] = correctionsArr
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c) => {
      const t = typeof c.type === 'string' && (VALID_TYPES as string[]).includes(c.type)
        ? (c.type as CorrectionType)
        : 'grammar';
      return {
        original: String(c.original ?? ''),
        corrected: String(c.corrected ?? ''),
        explanation: String(c.explanation ?? ''),
        type: t,
      };
    });

  const overallFeedback = typeof obj.overallFeedback === 'string' && obj.overallFeedback.trim()
    ? obj.overallFeedback
    : (isCorrect ? 'Sehr gut! Dein Satz ist korrekt.' : 'Schau dir die Korrekturen an.');

  return { original, corrected, isCorrect, status, corrections, overallFeedback, processingTime };
}

export async function correctText(
  text: string,
  mode: CorrectionMode,
  context?: string,
): Promise<CorrectionResult> {
  const start = Date.now();
  let lastErr: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callOllama(text, mode, context);
      const parsed = extractJson(raw);
      return normalizeCorrection(parsed, text, Date.now() - start);
    } catch (err) {
      lastErr = err;
      const isJsonErr = err instanceof Error && /JSON/i.test(err.message);
      if (!isJsonErr) break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Correction failed');
}

export function isOllamaUnavailable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('fetch failed') ||
    msg.includes('econnrefused') ||
    msg.includes('aborted') ||
    msg.includes('ollama http 5')
  );
}
