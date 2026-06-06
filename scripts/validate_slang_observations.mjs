import fs from 'node:fs';

const args = process.argv.slice(2);

function readInput() {
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0 && args[fileIndex + 1]) {
    return fs.readFileSync(args[fileIndex + 1], 'utf8');
  }
  if (args[0] && !args[0].startsWith('--')) {
    return fs.readFileSync(args[0], 'utf8');
  }
  return fs.readFileSync(0, 'utf8');
}

const required = [
  'term',
  'observedAt',
  'source',
  'sourceQuality',
  'platform',
  'status',
  'autoUse',
  'notes',
];

const allowedQuality = new Set(['A', 'B', 'C', 'D']);
const allowedStatus = new Set([
  'emerging',
  'current',
  'mainstream',
  'mainstream-risky',
  'stale',
  'ironic',
  'platform-bound',
  'needs-check',
]);

const now = new Date();
const maxAutoUseAgeMs = 180 * 24 * 60 * 60 * 1000;
const lines = readInput().split(/\r?\n/).filter((line) => line.trim());
const issues = [];

for (const [lineIndex, line] of lines.entries()) {
  let row;
  try {
    row = JSON.parse(line);
  } catch (error) {
    issues.push({
      severity: 'hard',
      line: lineIndex + 1,
      reason: 'invalid JSONL row',
      detail: error.message,
    });
    continue;
  }

  for (const key of required) {
    if (!(key in row) || row[key] === '') {
      issues.push({
        severity: 'hard',
        line: lineIndex + 1,
        term: row.term ?? '',
        reason: `missing required field: ${key}`,
      });
    }
  }

  if (!allowedQuality.has(row.sourceQuality)) {
    issues.push({
      severity: 'hard',
      line: lineIndex + 1,
      term: row.term,
      reason: 'invalid sourceQuality',
    });
  }

  if (!allowedStatus.has(row.status)) {
    issues.push({
      severity: 'hard',
      line: lineIndex + 1,
      term: row.term,
      reason: 'invalid status',
    });
  }

  const observedAt = new Date(`${row.observedAt}T00:00:00`);
  if (Number.isNaN(observedAt.getTime())) {
    issues.push({
      severity: 'hard',
      line: lineIndex + 1,
      term: row.term,
      reason: 'invalid observedAt',
    });
  }

  if (row.autoUse === true) {
    const ageMs = now.getTime() - observedAt.getTime();
    const qualityOk = row.sourceQuality === 'A' || row.sourceQuality === 'B';
    const statusOk = row.status === 'current' || row.status === 'mainstream';
    const freshOk = ageMs >= 0 && ageMs <= maxAutoUseAgeMs;

    if (!qualityOk || !statusOk || !freshOk) {
      issues.push({
        severity: 'hard',
        line: lineIndex + 1,
        term: row.term,
        reason: 'autoUse true without source, status, and freshness support',
      });
    }
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
