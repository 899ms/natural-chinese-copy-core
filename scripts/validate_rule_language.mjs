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

function stripFences(text) {
  return text.replace(/```[\s\S]*?```/g, '');
}

function stripInlineCode(text) {
  return text.replace(/`[^`\n]+`/g, '');
}

const text = stripInlineCode(stripFences(readInput()));

const rules = [
  {
    severity: 'hard',
    reason: 'slogan rule: yao A buyao B',
    pattern: /\u8981[^\n。；;]{1,30}\u4e0d\u8981|\u4e0d\u8981[^\n。；;]{1,30}\u8981/g,
  },
  {
    severity: 'hard',
    reason: 'empty engineering slogan',
    pattern: /\u8dd1\u901a|\u6253\u901a|\u8865\u9f50|\u95ed\u73af|\u843d\u5730|\u8d4b\u80fd/g,
  },
  {
    severity: 'warn',
    reason: 'abstract rule noun',
    pattern: /\u94fe\u8def|\u80fd\u529b|\u4f53\u7cfb|\u751f\u6001/g,
  },
];

const issues = [];
for (const { severity, reason, pattern } of rules) {
  for (const match of text.matchAll(pattern)) {
    issues.push({ severity, reason, match: match[0], index: match.index });
  }
}

const hardCount = issues.filter((issue) => issue.severity === 'hard').length;
const result = {
  status: hardCount > 0 ? 'fail' : 'pass',
  hardCount,
  warnCount: issues.length - hardCount,
  issues,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(hardCount > 0 ? 1 : 0);
