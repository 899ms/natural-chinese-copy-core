import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);

const ALLOWED_PROBLEMS = new Set([
  'english-logic',
  'template-feel',
  'flat-writing',
  'tense-aspect',
  'measure-word',
  'meta-leak',
  'subject-predicate-mismatch',
  'fact-error',
  'angle-error',
  'register-mismatch',
  'batch-repetition',
  'publishability-fail',
  'type-mismatch',
  'other',
]);

function readArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const hit = args.find((arg) => arg.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return fallback;
}

function readText(name, fallback = '') {
  const file = readArg(`${name}-file`);
  if (file) return fs.readFileSync(file, 'utf8').trim();
  return readArg(name, fallback).trim();
}

function defaultStorePath() {
  const pdocLog = path.join(process.cwd(), 'pdoc/log');
  if (fs.existsSync(pdocLog)) {
    return path.join(pdocLog, 'natural_chinese_copy_feedback.jsonl');
  }
  return path.join(process.cwd(), '.tmp/natural_chinese_copy_feedback.jsonl');
}

function parseProblems() {
  const values = [];
  for (const [index, arg] of args.entries()) {
    if (arg === '--problem' && args[index + 1]) values.push(args[index + 1]);
    if (arg.startsWith('--problem=')) values.push(arg.slice('--problem='.length));
    if (arg === '--problems' && args[index + 1]) values.push(args[index + 1]);
    if (arg.startsWith('--problems=')) values.push(arg.slice('--problems='.length));
  }
  const problems = values.flatMap((value) => value.split(',')).map((value) => value.trim()).filter(Boolean);
  return problems.length ? [...new Set(problems)] : ['other'];
}

function parseRating() {
  const raw = readArg('rating');
  if (!raw) return null;
  const rating = Number(raw);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('--rating must be an integer from 1 to 5');
  }
  return rating;
}

function readFacts() {
  const factsFile = readArg('facts-file', readArg('source-facts-file'));
  const rawFacts = readArg('facts', readArg('source-facts'));
  if (factsFile) {
    const text = fs.readFileSync(factsFile, 'utf8').trim();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(String);
      if (Array.isArray(parsed.facts)) return parsed.facts.map(String);
    } catch {
      return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    }
    return [text];
  }
  if (!rawFacts) return [];
  return rawFacts.split('|').map((item) => item.trim()).filter(Boolean);
}

const copyText = readText('copy');
const badSentence = readText('bad-sentence');
const betterSentence = readText('better-sentence');
const note = readText('note');
const rating = parseRating();
const problemTypes = parseProblems();

for (const problem of problemTypes) {
  if (!ALLOWED_PROBLEMS.has(problem)) {
    throw new Error(`Unknown problem type: ${problem}`);
  }
}

if (!copyText && !badSentence && !note) {
  throw new Error('Feedback needs --copy-file/--copy, --bad-sentence-file/--bad-sentence, or --note.');
}

const createdAt = new Date().toISOString();
const hash = crypto
  .createHash('sha1')
  .update([copyText, badSentence, betterSentence, note, createdAt].join('\n'))
  .digest('hex')
  .slice(0, 10);

const record = {
  schemaVersion: 'natural-chinese-feedback/v1',
  id: readArg('id', `feedback-${createdAt.replace(/[:.]/g, '-')}-${hash}`),
  createdAt,
  context: readArg('context'),
  copyText,
  sourceFacts: readFacts(),
  problemTypes,
  feedback: {
    rating,
    badSentence,
    betterSentence,
    note,
  },
  ruleDecision: 'unreviewed',
  autoApplyRule: false,
};

const storePath = path.resolve(readArg('store', defaultStorePath()));
fs.mkdirSync(path.dirname(storePath), { recursive: true });
fs.appendFileSync(storePath, `${JSON.stringify(record)}\n`, 'utf8');

console.log(JSON.stringify({
  status: 'captured',
  id: record.id,
  store: storePath,
  problemTypes,
  hasBadSentence: Boolean(badSentence),
  hasBetterSentence: Boolean(betterSentence),
}, null, 2));
