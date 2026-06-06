import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);

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
  return path.join(process.cwd(), 'natural-chinese-copy-core/references/self_evolution_cases.jsonl');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const copyValidator = path.join(__dirname, 'validate_chinese_copy.mjs');
const inputPath = path.resolve(readInputPath());
const outPath = path.resolve(readArg('out', path.join(process.cwd(), '.tmp', 'self_evolution_copy_lab.md')));
const jsonOutPath = readArg('json-out')
  ? path.resolve(readArg('json-out'))
  : '';
const requiredStableZeroRounds = Number(readArg('require-stable-zero', '0')) || 0;

const rows = fs.readFileSync(inputPath, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line, index) => ({ line: index + 1, row: JSON.parse(line) }));

function validateText(text, id, round) {
  const tempPath = path.join(process.env.TEMP || process.cwd(), `self-evolution-${process.pid}-${id}-${round}.txt`);
  fs.writeFileSync(tempPath, text, 'utf8');
  const validation = spawnSync(process.execPath, [copyValidator, '--file', tempPath], { encoding: 'utf8' });
  fs.rmSync(tempPath, { force: true });
  try {
    const parsed = JSON.parse(validation.stdout);
    return {
      status: (parsed.hardCount || 0) > 0 ? 'fail' : 'pass',
      hardCount: parsed.hardCount || 0,
      warnCount: parsed.warnCount || 0,
      issues: parsed.issues || [],
    };
  } catch {
    return {
      status: 'fail',
      hardCount: 1,
      warnCount: 0,
      issues: [{ severity: 'hard', reason: 'validator parse failed', match: validation.stdout.trim() }],
    };
  }
}

const knownTypes = new Set([
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

function matches(text, pattern) {
  return pattern.test(text);
}

function publishabilityIssues(type, text) {
  const issues = [];
  const compact = text.replace(/\s+/g, ' ').trim();

  if (!knownTypes.has(type)) {
    issues.push('unknown-copy-type');
  }
  if (/(?:validator|skill|样本|审稿|校验|copyCritique|publishabilityReview|后台判断|这句话要|句子在说|文案规则|写作规则)/i.test(compact)) {
    issues.push('internal-review-language');
  }
  if (/是(?:一个|一款|一套|一种|一份|一组|一类|一项|一条)[^。！？]{0,80}(?:工具|项目|库|框架|插件|服务|平台|应用|界面|组件|命令|扩展|CLI|WebUI|SDK|API)/u.test(compact)
      && !['course-material'].includes(type)) {
    issues.push('tool-intro-shape-in-non-tool-copy');
  }
  if (/(?:这个变化说明|重心变了|更现实|更重要|值得看|要单独看|流程更清楚|提升了用户体验|优化了[^。！？]{0,12}流程|赋能|闭环|落地|请大家知悉)/u.test(compact)) {
    issues.push('empty-or-report-like-judgment');
  }
  if (/异常接手/u.test(compact)) {
    issues.push('awkward-exception-handoff');
  }
  if (/被划满/u.test(compact)) {
    issues.push('imprecise-visual-wording');
  }

  if (type === 'product-update') {
    if (!/(?:接进了|已经正式可用了|现在还要|开始评估|上线前|接入前)/u.test(compact)) {
      issues.push('product-update-missing-change-or-impact');
    }
    if (/(?:这句话|因为它写的是|句子在说)/u.test(compact)) issues.push('product-update-meta-leak');
    if (/^[A-Za-z][A-Za-z0-9 _.-]{2,60}已经进了[^。！？]{1,40}(?:API|平台|产品|系统)/u.test(compact)) {
      issues.push('product-update-title-like-actorless-integration');
    }
  }

  if (type === 'course-material') {
    if (!/(?:\d+\s*节|Notebook|课程|基础|卡住|代码|输出)/u.test(compact)) {
      issues.push('course-material-missing-learning-path');
    }
    if (/(?:课按顺序往下走|的人，)/u.test(compact)) issues.push('course-material-known-bad-shape');
  }

  if (type === 'social-post') {
    if (!/(?:最近|以前|现在|大家|能碰哪些数据|每步有没有记录|谁接手)/u.test(compact)) {
      issues.push('social-post-missing-observation-detail');
    }
    if (compact.length < 40) issues.push('social-post-too-thin');
  }

  if (type === 'release-note') {
    if (!/(?:提交成功|报名状态|候补|短信|开场前)/u.test(compact)) {
      issues.push('release-note-missing-user-visible-change');
    }
  }

  if (type === 'event-notice') {
    if (!/(?:周四|线上|报名|会议链接|群里|名额)/u.test(compact)) {
      issues.push('event-notice-missing-action-info');
    }
    if (/(?:未报名用户|补(?:一次)?报名)/u.test(compact)) {
      issues.push('event-notice-admin-label-or-bureaucratic-verb');
    }
  }

  if (type === 'announcement') {
    if (!matches(compact, /(?:今天|本周|日起|开始|将于|已经|不需要|请|查看|提交)/u)) {
      issues.push('announcement-missing-time-or-action');
    }
    if (/发票抬头[^。！？]{0,16}维护/u.test(compact)) {
      issues.push('announcement-backoffice-verb-for-user-setting');
    }
  }

  if (type === 'short-commentary') {
    if (!matches(compact, /(?:最近|以前|现在|我更关注|越来越|大家|很多团队)/u)
        || !matches(compact, /(?:权限|记录|接手|成本|页面|数据|发布|排查)/u)) {
      issues.push('short-commentary-missing-observation-and-detail');
    }
  }

  if (type === 'customer-support-reply') {
    if (!matches(compact, /(?:收到|看到了|我这边|已经)/u)
        || !matches(compact, /(?:订单|截图|编号|记录|补发|退款|处理|稍后|今天|小时)/u)) {
      issues.push('customer-support-missing-ack-or-next-step');
    }
    if (matches(compact, /(?:亲爱的用户您好|感谢您的反馈|给您带来不便深表歉意)/u)) {
      issues.push('customer-support-template-tone');
    }
  }

  if (type === 'marketing-landing') {
    if (!matches(compact, /(?:团队|店主|老师|运营|开发者|财务|新用户)/u)
        || !matches(compact, /(?:少填|少等|少跑|省|减少|看清|同步|交付|报名|预约|不用|来回)/u)
        || !matches(compact, /(?:马上|现在|申请|预约|开始|试用|提交)/u)) {
      issues.push('marketing-landing-missing-reader-benefit-action');
    }
    if (/^活动报名少跑三个地方/u.test(compact)) {
      issues.push('marketing-landing-floating-slogan-subject');
    }
  }

  if (type === 'onboarding-guide') {
    if (!matches(compact, /(?:打开|进入|选择|填写|保存|完成|下一步|检查)/u)) {
      issues.push('onboarding-guide-missing-action-path');
    }
  }

  if (type === 'changelog') {
    if (!matches(compact, /(?:新增|修复|调整|删除|导出|同步|失败|列表|输入框)/u)) {
      issues.push('changelog-missing-user-visible-change');
    }
  }

  if (type === 'incident-notice') {
    if (!matches(compact, /(?:影响|恢复|已|仍在|排查|下一次|补偿|异常|失败)/u)
        || !matches(compact, /(?:不用|需要|请|稍后|我们会|下次)/u)) {
      issues.push('incident-notice-missing-status-or-user-action');
    }
  }

  if (type === 'recruitment-post') {
    if (!matches(compact, /(?:在招|加入|岗位|负责|简历|面试|远程|北京|上海|邮箱)/u)
        || !matches(compact, /(?:会写|做过|熟悉|需要|要求|交付|协作)/u)) {
      issues.push('recruitment-post-missing-role-requirement-action');
    }
  }

  if (type === 'community-update') {
    if (!matches(compact, /(?:本周|社区|PR|issue|维护者|下周|版本|讨论)/u)) {
      issues.push('community-update-missing-community-progress');
    }
  }

  if (type === 'newsletter-brief') {
    if (!matches(compact, /(?:本周|三件|第一件|第二件|第三件|这周|摘要)/u)
        || !matches(compact, /(?:上线|发布|修复|开放|报名|报告|更新)/u)) {
      issues.push('newsletter-brief-missing-brief-items');
    }
    if (/今天内完成报名/u.test(compact)) {
      issues.push('newsletter-brief-command-like-cta');
    }
  }

  if (type === 'video-script') {
    if (!matches(compact, /(?:开场|镜头|画面|字幕|结尾|切到|旁白)/u)
        || !matches(compact, /(?:展示|出现|停留|拉近|扫过|说)/u)) {
      issues.push('video-script-missing-scene-direction');
    }
  }

  if (type === 'app-store-release-note') {
    if (!matches(compact, /(?:本次更新|新增|修复|调整|打开|同步|崩溃|列表|提醒)/u)) {
      issues.push('app-store-note-missing-user-visible-change');
    }
    if (compact.length > 180) issues.push('app-store-note-too-long');
  }

  if (type === 'faq-answer') {
    if (!matches(compact, /(?:可以|不能|不需要|需要|支持|不支持|能|不能)/u)
        || !matches(compact, /(?:情况|如果|超过|账号|订单|发票|退款|数据)/u)) {
      issues.push('faq-answer-missing-direct-answer-or-boundary');
    }
  }

  if (type === 'policy-update') {
    if (!matches(compact, /(?:日起|开始|调整|改为|仍然|不受影响|需要|请|生效)/u)) {
      issues.push('policy-update-missing-effective-change-action');
    }
  }

  if (type === 'email-invite') {
    if (!matches(compact, /(?:周|月|点|分钟|邀请|参加|报名|回复|链接|议程)/u)
        || !matches(compact, /(?:想请|我们准备|你可以|请在|回复)/u)) {
      issues.push('email-invite-missing-reason-time-action');
    }
  }

  if (type === 'meeting-summary') {
    if (!matches(compact, /(?:今天|会上|决定|下周|负责|跟进|提交|确认|待定)/u)
        || !matches(compact, /(?:张|李|王|产品|设计|研发|运营|我来)/u)) {
      issues.push('meeting-summary-missing-decision-owner-next-step');
    }
  }

  if (type === 'push-notification') {
    if (!matches(compact, /(?:已|今天|今晚|现在|报名|订单|提醒|查看|打开|处理)/u)) {
      issues.push('push-notification-missing-action');
    }
    if (compact.length > 80) issues.push('push-notification-too-long');
  }

  if (type === 'crisis-response') {
    if (!matches(compact, /(?:影响|已经|暂停|恢复|排查|下次|补偿|更新|道歉)/u)
        || !matches(compact, /(?:用户|订单|数据|页面|服务|支付|登录)/u)) {
      issues.push('crisis-response-missing-fact-status-next-update');
    }
  }

  return [...new Set(issues)];
}

const results = [];
for (const { row } of rows) {
  if (!Array.isArray(row.rounds)) continue;
  for (const item of row.rounds) {
    const text = String(item.candidate || '');
    const hardValidation = validateText(text, row.id, item.round);
    const publishability = publishabilityIssues(row.type, text);
    results.push({
      id: row.id,
      type: row.type,
      round: item.round,
      text,
      hardValidation,
      publishability,
      status: hardValidation.status === 'pass' && hardValidation.warnCount === 0 && publishability.length === 0 ? 'pass' : 'fail',
    });
  }
}

const roundNumbers = [...new Set(results.map((item) => item.round))].sort((a, b) => a - b);
const summary = roundNumbers.map((round) => {
  const items = results.filter((item) => item.round === round);
  const validatorFail = items.filter((item) => item.hardValidation.status !== 'pass').length;
  const validatorWarn = items.filter((item) => item.hardValidation.warnCount > 0).length;
  const publishabilityFail = items.filter((item) => item.hardValidation.status === 'pass' && item.publishability.length > 0).length;
  const issueCount = items.reduce((sum, item) => sum + item.hardValidation.hardCount + item.hardValidation.warnCount + item.publishability.length, 0);
  const pass = items.filter((item) => item.status === 'pass').length;
  return {
    round,
    total: items.length,
    pass,
    fail: items.length - pass,
    validatorFail,
    validatorWarn,
    publishabilityFail,
    issueCount,
  };
});

const stableZeroRounds = requiredStableZeroRounds > 0
  ? summary.slice(-requiredStableZeroRounds)
  : [];
const stableZeroPass = requiredStableZeroRounds === 0
  || (stableZeroRounds.length === requiredStableZeroRounds
    && stableZeroRounds.every((item) => item.issueCount === 0 && item.fail === 0));
const runStatus = results.every((item) => item.status === 'pass') || stableZeroPass ? 'pass' : 'fail';

const markdown = [
  '# Self Evolution Copy Lab Report',
  '',
  `Input: ${inputPath}`,
  '',
  `Required stable zero rounds: ${requiredStableZeroRounds}`,
  '',
  `Stable zero status: ${stableZeroPass ? 'pass' : 'fail'}`,
  '',
  '## Round Summary',
  '',
  '| Round | Total | Pass | Fail | Validator Fail | Validator Warn | Publishability Fail | Issue Count |',
  '| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...summary.map((item) => `| ${item.round} | ${item.total} | ${item.pass} | ${item.fail} | ${item.validatorFail} | ${item.validatorWarn} | ${item.publishabilityFail} | ${item.issueCount} |`),
  '',
  '## Findings',
  '',
  ...results.flatMap((item) => [
    `### ${item.id} / round ${item.round}`,
    '',
    `Status: ${item.status}`,
    '',
    `Validator: ${item.hardValidation.status}`,
    '',
    `Validator warnings: ${item.hardValidation.warnCount}`,
    '',
    `Publishability: ${item.publishability.length ? item.publishability.join(', ') : 'pass'}`,
    '',
  ]),
].join('\n');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, markdown, 'utf8');

if (jsonOutPath) {
  fs.mkdirSync(path.dirname(jsonOutPath), { recursive: true });
  fs.writeFileSync(jsonOutPath, `${JSON.stringify({ inputPath, requiredStableZeroRounds, stableZeroPass, summary, results }, null, 2)}\n`, 'utf8');
}

process.stdout.write(`${JSON.stringify({ status: runStatus, out: outPath, jsonOut: jsonOutPath || null, requiredStableZeroRounds, stableZeroPass, summary }, null, 2)}\n`);
process.exit(runStatus === 'pass' ? 0 : 1);
