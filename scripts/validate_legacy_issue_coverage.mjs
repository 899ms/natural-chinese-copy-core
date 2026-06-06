import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(__dirname, '..');
const registryPath = path.join(baseDir, 'references', 'legacy_issue_registry.jsonl');
const validatorPath = path.join(baseDir, 'scripts', 'validate_chinese_copy.mjs');
const feedbackPath = path.join(baseDir, 'references', 'feedback_sample_cases.jsonl');
const selfEvolutionPath = path.join(baseDir, 'references', 'self_evolution_cases.jsonl');
const publishabilityPath = path.join(baseDir, 'references', 'publishability_review.md');

function readJsonl(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => ({ line: index + 1, row: JSON.parse(line) }));
}

function includesText(filePath, text) {
  return fs.readFileSync(filePath, 'utf8').includes(text);
}

const registry = readJsonl(registryPath);
const feedbackRows = readJsonl(feedbackPath);
const selfEvolutionRows = readJsonl(selfEvolutionPath);
const issues = [];

for (const { line, row } of registry) {
  if (!row.id || !row.label || !row.policy || !row.feedbackCaseId || !row.publishabilityPattern) {
    issues.push({ severity: 'hard', line, id: row.id || '(missing-id)', reason: 'registry row missing required field' });
    continue;
  }

  if (!feedbackRows.find((item) => item.row.id === row.feedbackCaseId)) {
    issues.push({ severity: 'hard', line, id: row.id, reason: `missing feedback case ${row.feedbackCaseId}` });
  }

  if (!includesText(publishabilityPath, row.publishabilityPattern)) {
    issues.push({ severity: 'hard', line, id: row.id, reason: `publishability review missing pattern ${row.publishabilityPattern}` });
  }

  if (row.policy === 'hard') {
    if (!row.validatorReason) {
      issues.push({ severity: 'hard', line, id: row.id, reason: 'hard policy missing validatorReason' });
    } else if (!includesText(validatorPath, row.validatorReason)) {
      issues.push({ severity: 'hard', line, id: row.id, reason: `validator missing reason ${row.validatorReason}` });
    }
  }

  if (row.selfEvolutionCaseId && !selfEvolutionRows.find((item) => item.row.id === row.selfEvolutionCaseId)) {
    issues.push({ severity: 'hard', line, id: row.id, reason: `missing self evolution case ${row.selfEvolutionCaseId}` });
  }
}

const result = {
  status: issues.length === 0 ? 'pass' : 'fail',
  totalRows: registry.length,
  hardCount: issues.length,
  issues,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(issues.length === 0 ? 0 : 1);
