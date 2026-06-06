import fs from 'node:fs';

const args = process.argv.slice(2);

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : '';
}

function readText(name) {
  const file = argValue(name);
  if (!file) return '';
  return fs.readFileSync(file, 'utf8');
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function removeContainedClaims(items) {
  const ordered = unique(items).sort((a, b) => b.length - a.length);
  const kept = [];
  for (const item of ordered) {
    if (!kept.some((claim) => claim !== item && claim.includes(item))) {
      kept.push(item);
    }
  }
  return kept.sort((a, b) => items.indexOf(a) - items.indexOf(b));
}

function extractClaims(text) {
  const value = String(text || '');
  return removeContainedClaims([
    ...value.match(/\b\d+(?:\.\d+)?\s?(?:MB|GB|TB|KB|ms|s|秒|分钟|小时|天|周|个月|年|%|美元|美金|元|亿元|万元|万|亿)\b/gi) || [],
    ...value.match(/\b\d+(?:\.\d+)?\s?(?:B|M|K)\b/g) || [],
    ...value.match(/\d{4}年\d{1,2}月\d{1,2}日/g) || [],
    ...value.match(/\d{4}-\d{1,2}-\d{1,2}/g) || [],
    ...value.match(/\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?/g) || [],
    ...value.match(/v?\d+\.\d+(?:\.\d+)?/gi) || [],
  ]).map((item) => item.trim());
}

const source = readText('--source');
const output = readText('--output') || fs.readFileSync(0, 'utf8');
const sourceClaims = new Set(extractClaims(source));
const outputClaims = extractClaims(output);
const unsupported = outputClaims.filter((claim) => !sourceClaims.has(claim));

const issues = unsupported.map((claim) => ({
  severity: 'hard',
  reason: 'ungrounded data claim',
  match: claim,
}));

const result = {
  status: issues.length ? 'fail' : 'pass',
  hardCount: issues.length,
  warnCount: 0,
  issues,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(issues.length ? 1 : 0);
