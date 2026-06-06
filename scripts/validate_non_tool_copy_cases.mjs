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
  console.error('Missing --file <non_tool_copy_cases.jsonl>');
  process.exit(2);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const copyValidator = path.join(__dirname, 'validate_chinese_copy.mjs');
const allowedTypes = new Set([
  'product-update',
  'course-material',
  'social-post',
  'release-note',
  'event-notice',
  'announcement',
  'short-commentary',
  'customer-support-reply',
  'marketing-landing',
  'onboarding-guide',
  'changelog',
  'incident-notice',
  'recruitment-post',
  'community-update',
  'newsletter-brief',
  'video-script',
  'app-store-release-note',
  'faq-answer',
  'policy-update',
  'email-invite',
  'meeting-summary',
  'push-notification',
  'crisis-response',
]);
const allowedRegisters = new Set(['formal', 'plain', 'casual', 'close-chat']);
const required = ['id', 'type', 'register', 'facts', 'bad', 'pass', 'manualCriteria'];
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

  for (const key of required) {
    if (!(key in row)) issue('hard', lineNumber, row.id || '', `missing ${key}`);
  }

  if (!allowedTypes.has(row.type)) issue('hard', lineNumber, row.id, 'invalid type', row.type);
  if (!allowedRegisters.has(row.register)) issue('hard', lineNumber, row.id, 'invalid register', row.register);
  if (!Array.isArray(row.facts) || row.facts.length === 0) issue('hard', lineNumber, row.id, 'facts must be a non-empty array');
  if (!Array.isArray(row.manualCriteria) || row.manualCriteria.length < 3) {
    issue('hard', lineNumber, row.id, 'manualCriteria needs at least three checks');
  }

  const passText = String(row.pass || '').trim();
  if (!passText) issue('hard', lineNumber, row.id, 'missing pass text');
  if (passText.includes('validator') || passText.includes('skill') || passText.includes('规则') || passText.includes('审稿')) {
    issue('hard', lineNumber, row.id, 'pass sample leaks internal review language');
  }

  const tempPath = path.join(process.env.TEMP || process.cwd(), `non-tool-pass-${process.pid}-${index}.txt`);
  fs.writeFileSync(tempPath, passText, 'utf8');
  const validation = spawnSync(process.execPath, [copyValidator, '--file', tempPath], { encoding: 'utf8' });
  fs.rmSync(tempPath, { force: true });
  if (validation.status !== 0) {
    issue('hard', lineNumber, row.id, 'pass sample failed validate_chinese_copy', validation.stdout.trim());
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

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(hardCount > 0 ? 1 : 0);
