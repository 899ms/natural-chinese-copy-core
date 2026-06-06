import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);

const HARD_CANDIDATE_TYPES = new Set([
  'english-logic',
  'tense-aspect',
  'measure-word',
  'meta-leak',
  'subject-predicate-mismatch',
  'fact-error',
]);

const SAMPLE_FIRST_TYPES = new Set([
  'template-feel',
  'flat-writing',
  'angle-error',
  'register-mismatch',
  'batch-repetition',
  'publishability-fail',
  'type-mismatch',
]);

function readArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const hit = args.find((arg) => arg.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return fallback;
}

function readInputPath() {
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0 && args[fileIndex + 1]) return args[fileIndex + 1];
  if (args[0] && !args[0].startsWith('--')) return args[0];
  return path.join(process.cwd(), 'pdoc/log/natural_chinese_copy_feedback.jsonl');
}

function loadRows(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => ({ line: index + 1, row: JSON.parse(line) }));
}

function decisionFor(row) {
  const problems = row.problemTypes || [];
  const feedback = row.feedback || {};
  const hasBadPassPair = Boolean(String(feedback.badSentence || '').trim() && String(feedback.betterSentence || '').trim());
  if (problems.some((item) => HARD_CANDIDATE_TYPES.has(item)) && hasBadPassPair) {
    return {
      decision: 'hard-gate-candidate',
      reason: 'deterministic problem type with bad/pass sentence pair',
    };
  }
  if (problems.some((item) => SAMPLE_FIRST_TYPES.has(item))) {
    return {
      decision: 'sample-only',
      reason: 'judgment or batch-shape feedback should train samples before hard rules',
    };
  }
  return {
    decision: 'needs-human-triage',
    reason: 'feedback is useful, but the rule target is not clear yet',
  };
}

function oneLine(text = '') {
  return String(text).replace(/\s+/g, ' ').trim();
}

function countByProblem(rows) {
  const counts = new Map();
  for (const { row } of rows) {
    for (const problem of row.problemTypes || []) {
      counts.set(problem, (counts.get(problem) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

const inputPath = path.resolve(readInputPath());
const rows = loadRows(inputPath);
const generatedAt = new Date().toISOString();
const proposals = rows.map(({ line, row }) => {
  const decision = decisionFor(row);
  return {
    line,
    id: row.id,
    rating: row.feedback?.rating ?? null,
    problemTypes: row.problemTypes || [],
    badSentence: row.feedback?.badSentence || '',
    betterSentence: row.feedback?.betterSentence || '',
    note: row.feedback?.note || '',
    ...decision,
  };
});

const summary = {
  generatedAt,
  inputPath,
  totalFeedback: rows.length,
  problemCounts: countByProblem(rows).map(([problem, count]) => ({ problem, count })),
  decisions: proposals.reduce((acc, item) => {
    acc[item.decision] = (acc[item.decision] || 0) + 1;
    return acc;
  }, {}),
  proposals,
};

const markdown = [
  '# Natural Chinese Copy Feedback Evolution Proposal',
  '',
  `Generated: ${generatedAt}`,
  `Input: ${inputPath}`,
  `Total feedback: ${rows.length}`,
  '',
  '## Policy',
  '',
  '- Rating is a weak signal.',
  '- A marked bad sentence plus a better rewrite is training evidence.',
  '- Hard gates need deterministic symptoms, a bad/pass pair, and regression tests.',
  '- Taste, angle, register, and batch-shape feedback stay sample-first until repeated evidence proves a stable trigger.',
  '- This proposal does not edit rule files.',
  '',
  '## Problem Counts',
  '',
  '| Problem | Count |',
  '| :--- | ---: |',
  ...summary.problemCounts.map((item) => `| ${item.problem} | ${item.count} |`),
  '',
  '## Proposed Actions',
  '',
  '| ID | Rating | Problems | Decision | Reason |',
  '| :--- | :--- | :--- | :--- | :--- |',
  ...proposals.map((item) => `| ${item.id} | ${item.rating ?? ''} | ${item.problemTypes.join(', ')} | ${item.decision} | ${item.reason} |`),
  '',
  '## Evidence',
  '',
  ...proposals.flatMap((item) => [
    `### ${item.id}`,
    '',
    `Decision: ${item.decision}`,
    '',
    `Bad: ${oneLine(item.badSentence) || '(empty)'}`,
    '',
    `Better: ${oneLine(item.betterSentence) || '(empty)'}`,
    '',
    `Note: ${oneLine(item.note) || '(empty)'}`,
    '',
  ]),
  '## Regression Commands',
  '',
  '```bash',
  'node natural-chinese-copy-core/scripts/validate_feedback_cases.mjs --file <feedback.jsonl>',
  'node natural-chinese-copy-core/scripts/validate_chinese_copy.mjs --file <new-pass-sample.txt>',
  'node natural-chinese-copy-core/scripts/validate_batch_cases.mjs --file natural-chinese-copy-core/references/batch_sample_cases.jsonl',
  'node natural-chinese-copy-core/scripts/validate_technical_project_cases.mjs --file natural-chinese-copy-core/references/technical_project_cases.jsonl',
  '```',
  '',
].join('\n');

const outPath = path.resolve(readArg('out', path.join(process.cwd(), '.tmp', `feedback_evolution_${generatedAt.replace(/[:.]/g, '-')}.md`)));
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, markdown, 'utf8');

const jsonOut = readArg('json-out');
if (jsonOut) {
  const jsonOutPath = path.resolve(jsonOut);
  fs.mkdirSync(path.dirname(jsonOutPath), { recursive: true });
  fs.writeFileSync(jsonOutPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  status: 'proposal-written',
  out: outPath,
  totalFeedback: rows.length,
  decisions: summary.decisions,
}, null, 2));
