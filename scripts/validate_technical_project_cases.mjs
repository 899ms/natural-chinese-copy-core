import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);

function readInputPath() {
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0 && args[fileIndex + 1]) return args[fileIndex + 1];
  if (args[0] && !args[0].startsWith('--')) return args[0];
  return null;
}

const inputPath = readInputPath();
if (!inputPath) {
  console.error('Missing --file <technical_project_cases.jsonl>');
  process.exit(2);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const copyValidator = path.join(__dirname, 'validate_chinese_copy.mjs');
const required = ['id', 'taskType', 'register', 'facts', 'bad', 'pass', 'focus'];
const allowedTaskTypes = new Set([
  'readme-summary',
  'github-trending',
  'open-source-recommendation',
  'tool-comparison',
  'stability-boundary',
  'deployment-note',
  'readme-promo-filter',
  'feature-list-to-usage-path',
]);
const allowedRegisters = new Set(['formal', 'plain', 'casual', 'close-chat']);
const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean);
const issues = [];

for (const [index, line] of lines.entries()) {
  let row;
  try {
    row = JSON.parse(line);
  } catch (error) {
    issues.push({ severity: 'hard', line: index + 1, reason: 'invalid JSON', detail: error.message });
    continue;
  }

  for (const key of required) {
    if (!(key in row)) {
      issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: `missing ${key}` });
    }
  }

  if (!allowedTaskTypes.has(row.taskType)) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'invalid taskType' });
  }

  if (!allowedRegisters.has(row.register)) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'invalid register' });
  }

  if (!Array.isArray(row.facts) || row.facts.length === 0) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'facts must be a non-empty array' });
  }

  if (!Array.isArray(row.focus) || row.focus.length === 0) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'focus must be a non-empty array' });
  }

  const tempPath = path.join(process.env.TEMP || process.cwd(), `technical-pass-${process.pid}-${index}.txt`);
  fs.writeFileSync(tempPath, row.pass ?? '', 'utf8');
  const validationArgs = [copyValidator, '--file', tempPath];
  if (row.taskType !== 'deployment-note') {
    validationArgs.push('--require-tool-project-opening');
  }
  const validation = spawnSync(process.execPath, validationArgs, { encoding: 'utf8' });
  fs.rmSync(tempPath, { force: true });

  if (validation.status !== 0) {
    issues.push({
      severity: 'hard',
      line: index + 1,
      id: row.id,
      reason: 'pass sample failed validate_chinese_copy',
      detail: validation.stdout.trim(),
    });
  }
}

const hardCount = issues.filter((issue) => issue.severity === 'hard').length;
const result = {
  status: hardCount > 0 ? 'fail' : 'pass',
  totalRows: lines.length,
  hardCount,
  issues,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(hardCount > 0 ? 1 : 0);
