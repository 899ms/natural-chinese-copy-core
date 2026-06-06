import fs from 'node:fs';

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

const ALLOWED_RULE_DECISIONS = new Set([
  'unreviewed',
  'sample-only',
  'proposal-needed',
  'needs-human-triage',
]);

function readInputPath() {
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0 && args[fileIndex + 1]) return args[fileIndex + 1];
  if (args[0] && !args[0].startsWith('--')) return args[0];
  return null;
}

const inputPath = readInputPath();
if (!inputPath) {
  console.error('Missing --file <feedback.jsonl>');
  process.exit(2);
}

const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean);
const issues = [];

function issue(severity, line, id, reason, detail = '') {
  issues.push({ severity, line, id, reason, detail });
}

for (const [index, line] of lines.entries()) {
  let row;
  const lineNumber = index + 1;
  try {
    row = JSON.parse(line);
  } catch (error) {
    issue('hard', lineNumber, '', 'invalid JSON', error.message);
    continue;
  }

  const id = row.id || '';
  if (row.schemaVersion !== 'natural-chinese-feedback/v1') {
    issue('hard', lineNumber, id, 'invalid schemaVersion');
  }
  if (!id) issue('hard', lineNumber, id, 'missing id');
  if (!row.createdAt || Number.isNaN(Date.parse(row.createdAt))) {
    issue('hard', lineNumber, id, 'invalid createdAt');
  }
  if (!Array.isArray(row.problemTypes) || row.problemTypes.length === 0) {
    issue('hard', lineNumber, id, 'problemTypes must be a non-empty array');
  } else {
    for (const problem of row.problemTypes) {
      if (!ALLOWED_PROBLEMS.has(problem)) {
        issue('hard', lineNumber, id, 'unknown problem type', problem);
      }
    }
  }

  const feedback = row.feedback || {};
  const rating = feedback.rating;
  if (rating !== null && rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    issue('hard', lineNumber, id, 'rating must be an integer from 1 to 5');
  }

  const badSentence = String(feedback.badSentence || '').trim();
  const betterSentence = String(feedback.betterSentence || '').trim();
  const note = String(feedback.note || '').trim();

  if (rating !== null && rating !== undefined && rating <= 3 && !badSentence && !note) {
    issue('hard', lineNumber, id, 'low rating needs badSentence or note');
  }
  if (badSentence && betterSentence && badSentence === betterSentence) {
    issue('hard', lineNumber, id, 'badSentence and betterSentence are identical');
  }
  if (badSentence && row.copyText && !String(row.copyText).includes(badSentence)) {
    issue('warn', lineNumber, id, 'badSentence is not found in copyText');
  }
  if (row.autoApplyRule === true) {
    issue('hard', lineNumber, id, 'feedback record must not auto-apply rules');
  }
  if (row.ruleDecision && !ALLOWED_RULE_DECISIONS.has(row.ruleDecision)) {
    issue('hard', lineNumber, id, 'invalid ruleDecision', row.ruleDecision);
  }
}

const hardCount = issues.filter((item) => item.severity === 'hard').length;
const result = {
  status: hardCount > 0 ? 'fail' : 'pass',
  totalRows: lines.length,
  hardCount,
  warnCount: issues.length - hardCount,
  issues,
};

console.log(JSON.stringify(result, null, 2));
process.exit(hardCount > 0 ? 1 : 0);
