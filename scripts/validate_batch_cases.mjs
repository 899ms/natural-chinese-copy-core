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
  console.error('Missing --file <batch_sample_cases.jsonl>');
  process.exit(2);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const copyValidator = path.join(__dirname, 'validate_chinese_copy.mjs');
const required = ['id', 'register', 'badItems', 'passItems', 'failure', 'focus'];
const allowedRegisters = new Set(['formal', 'plain', 'casual', 'close-chat']);
const allowedEntryTypes = new Set([
  'reader',
  'scene',
  'pain',
  'action',
  'boundary',
  'object',
  'definition-action',
  'definition-boundary',
  'definition-path',
]);
const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean);
const issues = [];

function openingShape(text) {
  const trimmed = text.trim();
  if (/^[A-Za-z0-9_.:/ -\u4e00-\u9fff]{2,80}是(?=[^。！？\n]{0,32}(?:一个|一款|一套|一种|一份|一组|一类|一项|一条))[^。！？\n]{1,110}(?:工具|项目|库|框架|插件|服务|平台|应用|界面|组件|命令|扩展|CLI|WebUI|SDK|API)/u.test(trimmed)) {
    return 'definition';
  }
  if (/^如果/.test(trimmed)) return 'if';
  if (/^看/.test(trimmed)) return 'look';
  if (/^只/.test(trimmed)) return 'boundary-only';
  if (/^[A-Za-z0-9_-]+ /.test(trimmed)) return 'object';
  if (/^[^，。！？]{1,12}时/.test(trimmed)) return 'scene-when';
  return trimmed.slice(0, 8);
}

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

  if (!allowedRegisters.has(row.register)) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'invalid register' });
  }

  if (!Array.isArray(row.badItems) || row.badItems.length < 2) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'badItems must contain at least 2 items' });
  }

  if (!Array.isArray(row.passItems) || row.passItems.length < 2) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'passItems must contain at least 2 items' });
    continue;
  }

  const entryTypes = new Set();
  const shapes = new Map();

  for (const [itemIndex, item] of row.passItems.entries()) {
    if (!item || typeof item.text !== 'string' || typeof item.entryType !== 'string') {
      issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: `invalid pass item at index ${itemIndex}` });
      continue;
    }

    if (!allowedEntryTypes.has(item.entryType)) {
      issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: `invalid entryType: ${item.entryType}` });
    }

    entryTypes.add(item.entryType);
    const shape = openingShape(item.text);
    shapes.set(shape, (shapes.get(shape) ?? 0) + 1);

    const tempPath = path.join(process.env.TEMP || process.cwd(), `batch-pass-${process.pid}-${index}-${itemIndex}.txt`);
    fs.writeFileSync(tempPath, item.text, 'utf8');
    const validation = spawnSync(process.execPath, [copyValidator, '--file', tempPath, '--require-tool-project-opening'], { encoding: 'utf8' });
    fs.rmSync(tempPath, { force: true });

    if (validation.status !== 0) {
      issues.push({
        severity: 'hard',
        line: index + 1,
        id: row.id,
        reason: `pass item ${itemIndex} failed validate_chinese_copy`,
        detail: validation.stdout.trim(),
      });
    }
  }

  if (entryTypes.size < Math.min(2, row.passItems.length)) {
    issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: 'passItems do not vary entryType' });
  }

  for (const [shape, count] of shapes.entries()) {
    if (shape !== 'definition' && count > 2) {
      issues.push({ severity: 'hard', line: index + 1, id: row.id, reason: `opening shape repeated too often: ${shape}` });
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
