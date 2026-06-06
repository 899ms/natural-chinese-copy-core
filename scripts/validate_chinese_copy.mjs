import fs from 'node:fs';

const args = process.argv.slice(2);
const requireToolProjectOpening = args.includes('--require-tool-project-opening');

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

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsAny(severity, phrases, reason) {
  return phrases.map((phrase) => ({
    severity,
    pattern: new RegExp(escapeRegExp(phrase), 'g'),
    reason,
  }));
}

const hardRules = [
  {
    reason: 'canned analysis opening',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*\u8981(?:\u7406\u89e3|\u4ecb\u7ecd|\u8bf4\u660e|\u62c6\u89e3)\s*[A-Za-z][A-Za-z0-9_.:/-]{1,50}[，,]\s*\u6211\u4eec(?:\u5e94\u8be5)?\u5148\u4ee5[^\u3002\uff01\uff1f\n]{1,40}\u4e3a\u5165\u53e3/g,
  },
  {
    reason: 'compressed one-character predicate',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*\u62c6\s*[A-Za-z][A-Za-z0-9_.:/-]{1,50}[，,]\s*\u5148\u4ece[^\u3002\uff01\uff1f\n]{1,24}\u8fdb/g,
  },
  {
    reason: 'vague entry predicate',
    pattern: /\u5148\u4ece[^\u3002\uff01\uff1f\n]{1,24}\u8fdb(?:[\u3002\uff01\uff1f\n]|$)/g,
  },
  {
    reason: 'project name used as reader-action subject',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*[A-Za-z][A-Za-z0-9_.:/-]{1,50}\s*(?:\u5148\u770b|\u770b\u770b|\u91cd\u70b9\u770b|\u53ef\u4ee5(?:\u5148|\u91cd\u70b9)?\u770b|\u503c\u5f97(?:\u770b|\u62c6))/g,
  },
  {
    reason: 'canned recommendation opening',
    pattern: /\u5982\u679c\u4f60\u60f3[^\u3002\uff01\uff1f\n]{0,30}\u53ef\u4ee5(?:\u91cd\u70b9)?\u770b\u4e00\u4e0b/g,
  },
  {
    reason: 'canned recommendation opening',
    pattern: /\u60f3[^\u3002\uff01\uff1f\n]{1,30}\u53ef\u4ee5\u770b/g,
  },
  {
    reason: 'English-shaped audience frame',
    pattern: /\u5bf9(?:\u4e8e)?[^\u3002\uff01\uff1f\n]{1,16}\u6765\u8bf4/g,
  },
  {
    reason: 'not-A-but-B contrast frame',
    pattern: /\u4e0d\u662f[^\u3002\uff01\uff1f\n]{1,40}\u800c\u662f/g,
  },
  {
    reason: 'not-only-but-B contrast frame',
    pattern: /\u4e0d\u53ea[^\u3002\uff01\uff1f\n]{1,40}\u800c\u662f/g,
  },
  {
    reason: 'not-here-but-there contrast frame',
    pattern: /\u4e0d\u5728[^\u3002\uff01\uff1f\n]{1,40}\u800c\u5728/g,
  },
  {
    reason: 'turning-conjunction opening',
    pattern: /(?:^|[\n\u3002\uff01\uff1f\uff1b;])\s*(?:\u4f46\u662f|\u4f46|\u4e0d\u8fc7|\u7136\u800c|\u5374|\u53ea\u662f)(?![\u4e00-\u9fa5]{0,8}(?:\u672a|\u6ca1|\u65e0)\u53d8)(?:[^\u3002\uff01\uff1f\n]{1,80})/g,
  },
  {
    reason: 'counterexample contrast frame',
    pattern: /\u800c\u4e0d\u662f/g,
  },
  {
    reason: 'English additive contrast frame',
    pattern: /\u4e0d(?:\u53ea|\u662f)[^\u3002\uff01\uff1f\n]{1,50}\u8fd8(?:\u5305\u62ec|\u8981|\u5f97|\u9700\u8981|\u4f1a|\u6709|\u80fd|\u53ef\u4ee5)/g,
  },
  {
    reason: 'bare not-only contrast setup',
    pattern: /\u4e0d(?:\u53ea\u662f|\u4ec5\u662f|\u4ec5\u4ec5\u662f)[^\u3002\uff01\uff1f\n]{1,50}(?:[\u3002\uff01\uff1f\n]|$)/g,
  },
  {
    reason: 'AI-ish contrast frame',
    pattern: /\u5149[^\u3002\uff01\uff1f\n]{1,24}\u8fd8\u4e0d\u591f/g,
  },
  {
    reason: 'slogan real-point frame',
    pattern: /\u771f\u6b63[^\u3002\uff01\uff1f\n]{1,24}\u7684(?:\u662f|\uff0c|\uff1a|:)/g,
  },
  {
    reason: 'English-shaped decide-by-looking frame',
    pattern: /(?:(?:\u8981|\u60f3|\u5982\u679c\u8981)[^\u3002\uff01\uff1f\n]{0,18})?(?:\u5224\u65ad|\u51b3\u5b9a|\u8bc4\u4f30)[^\u3002\uff01\uff1f\n]{1,48}[\uff0c,]?\s*(?:\u8fd8\u5f97|\u8fd8\u8981|\u9700\u8981|\u5f97|\u8981)\u770b[^\u3002\uff01\uff1f\n]{1,80}/g,
  },
  {
    reason: 'risky not-surprising contrast setup',
    pattern: /\u4e0d\u7a00\u5947(?:[^\u3002\uff01\uff1f\n]{0,40}|[\u3002\uff01\uff1f]\s*[^\u3002\uff01\uff1f\n]{0,80})(?:\u771f\u6b63|\u5173\u952e|\u91cd\u70b9|\u96be\u70b9|\u624d|\u8fd8\u5f97\u770b|\u8fd8\u8981\u770b|\u9700\u8981\u770b|\u51b3\u5b9a|\u8bc4\u4f30|\u5224\u65ad)/g,
  },
  {
    reason: 'self-centered comparative judgment',
    pattern: /\u6211\u66f4(?:\u5728\u610f|\u5173\u5fc3|关注)/g,
  },
  {
    reason: 'English-shaped comparative benefit frame',
    pattern: /\u6bd4[^\u3002\uff01\uff1f\n]{1,32}\u66f4(?:\u5bb9\u6613|\u6e05\u695a|\u73b0\u5b9e|\u91cd\u8981|\u503c\u5f97|\u5173\u5fc3|\u5728\u610f|\u65b9\u4fbf|\u5feb)/g,
  },
  {
    reason: 'actorless demo-only contrast frame',
    pattern: /(?:\u9875\u9762|\bdemo\b|Demo)[^\u3002\uff01\uff1f\n]{0,12}\u80fd(?:\u8dd1|\u52a8)[^\u3002\uff01\uff1f\n]{0,24}\u53ea\u8bf4\u660e[^\u3002\uff01\uff1f\n]{1,60}(?:[\u3002\uff01\uff1f]\s*)?\u5148\u770b/g,
  },
  {
    reason: 'subjectless permission checklist opening',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*\u5148\u770b\u6743\u9650\u600e\u4e48\u6279/g,
  },
  {
    reason: 'unclear waitlist subtitle wording',
    pattern: /\u5019\u8865[^\u3002\uff01\uff1f\n]{0,12}\u5bf9\u9519\u4e86/g,
  },
  {
    reason: 'compressed changed-online phrase',
    pattern: /\u5df2\u6539\u7ebf\u4e0a/g,
  },
  {
    reason: 'alarm-like event notice opening',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*\u5404\u4f4d[^\u3002\uff01\uff1f\n\uff0c,]{0,16}\u6ce8\u610f[\uff0c,]/g,
  },
  {
    reason: 'stacked changed-state notice wording',
    pattern: /\u73b0\u6539\u4e3a[^\u3002\uff01\uff1f\n]{1,24}\u4e86/g,
  },
  {
    reason: 'unnatural daily-meeting abbreviation',
    pattern: /(?:^|[^\u6bcf])\u65e5\u4f1a(?!\u8bae)/g,
  },
  {
    reason: 'sms container wording',
    pattern: /\u53d1\u5230\u77ed\u4fe1(?:\u91cc|\u4e2d)/g,
  },
  {
    reason: 'job used as doer',
    pattern: /(?:\u8fd9(?:\u4efd|\u4e2a|\u9879))?\u5de5\u4f5c\u4f1a\u505a(?!\u5f97)[^\u3002\uff01\uff1f\n]{1,60}/g,
  },
  {
    reason: 'job content points to objects instead of duties',
    pattern: /\u5de5\u4f5c\u5185\u5bb9\u662f(?:[^。\uff01\uff1f\n]{0,24}(?:\u9875\u9762|\u540e\u53f0|\u7cfb\u7edf|App|APP|Web|web|UI)[^。\uff01\uff1f\n]{0,60})/g,
  },
  {
    reason: 'job responsibility mixed object list with suffix',
    pattern: /(?:\u4f60\u4f1a\u8d1f\u8d23|\u4e3b\u8981\u8d1f\u8d23|\u8d1f\u8d23|\u5de5\u4f5c\u5185\u5bb9\u5305\u62ec\u5f00\u53d1)[^。\uff01\uff1f\n]{0,80}(?:\u9875|\u9875\u9762)[^。\uff01\uff1f\n]{0,60}(?:\u540e\u53f0(?![\u91cc\u4e2d])|\u7cfb\u7edf(?![\u91cc\u4e2d])|\u6a21\u5757(?![\u91cc\u4e2d]))[^。\uff01\uff1f\n]{0,36}\u7684(?:\u9875\u9762|\u524d\u7aef)?\u5f00\u53d1/g,
  },
  {
    reason: 'rough interface handoff verb',
    pattern: /(?:\u7814\u53d1|\u5f00\u53d1)[^\u3002\uff01\uff1f\n]{0,12}\u7ed9(?!\u51fa)[^\u3002\uff01\uff1f\n]{1,24}\u63a5\u53e3(?:[\u3002\uff01\uff1f\n]|$)/g,
  },
  {
    reason: 'ambiguous saved-then-enter-settings sequence',
    pattern: /\u4fdd\u5b58\u540e\u8fdb\u5165[^\u3002\uff01\uff1f\n]{1,24}\u8bbe\u7f6e[\uff0c,]\s*\u6253\u5f00/g,
  },
  {
    reason: 'English heavy-light metaphor',
    pattern: /(?:\u504f\u91cd|\u504f\u8f7b|\u8fc7\u91cd|\u8fc7\u8f7b|\u592a\u91cd|\u592a\u8f7b|\u5f88\u91cd|\u5f88\u8f7b)|(?:\u6d41\u7a0b|\u5de5\u4f5c\u6d41|\u65b9\u6848|\u7cfb\u7edf|\u5de5\u5177|\u67b6\u6784|\u8bbe\u8ba1|\u673a\u5236|\u914d\u7f6e|\u89c4\u5219|\u6cbb\u7406|\u63a5\u5165|\u90e8\u7f72|\u7528\u6cd5|\u529f\u80fd|\u6a21\u5757)[^\u3002\uff01\uff1f\n]{0,12}(?:\u91cd|\u8f7b)|(?:\u91cd(?!\u65b0)|\u8f7b)[^\u3002\uff01\uff1f\n]{0,8}(?:\u6d41\u7a0b|\u5de5\u4f5c\u6d41|\u65b9\u6848|\u7cfb\u7edf|\u5de5\u5177|\u67b6\u6784|\u8bbe\u8ba1|\u673a\u5236|\u914d\u7f6e|\u89c4\u5219|\u6cbb\u7406|\u63a5\u5165|\u90e8\u7f72|\u7528\u6cd5|\u529f\u80fd|\u6a21\u5757)/g,
  },
  {
    reason: 'English conditional adverbial opening',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*[^\u3002\uff01\uff1f\n]{1,28}\u4e00\u65e6[^\u3002\uff01\uff1f\n]{1,50}[\uff0c,]?\s*(?:\u95ee\u9898|\u98ce\u9669|\u9ebb\u70e6)?\u5c31/g,
  },
  {
    reason: 'front-loaded adverbial comma split',
    pattern: /(?:^|[\n\u3002\uff01\uff1f\uff1b;])\s*[^\uff0c,\u3002\uff01\uff1f\n]{2,56}(?:\u65f6|\u540e|\u4ee5\u540e|\u4e4b\u540e|\u8d77\u6765\u4ee5\u540e|\u524d)[\uff0c,]\s*(?:\u5148|\u518d|\u5c31|\u4f1a|\u8981|\u80fd|\u53ef\u4ee5|\u4e0d\u7528|\u522b|\u5e94\u8be5|\u9700\u8981|\u628a|\u4ece|\u7528|\u770b|\u67e5|\u6d4b|\u8dd1|\u63a5|\u5199|\u56e2\u961f|\u7528\u6237|\u5f00\u53d1\u8005|agent|Agent|\u5b83|\u6211\u4eec)/g,
  },
  {
    reason: 'front-loaded reader condition comma split',
    pattern: /(?:^|[\n\u3002\uff01\uff1f\uff1b;])\s*[^\uff0c,\u3002\uff01\uff1f\n]{2,60}\u7684\u4eba[\uff0c,]\s*(?:\u5148|\u518d|\u5c31|\u4f1a|\u8981|\u80fd|\u53ef\u4ee5|\u4e0d\u7528|\u522b|\u9002\u5408|\u6309|\u7528|\u4ece|\u770b|\u67e5|\u8dd1|\u63a5|\u5199|\u5f00|\u6539|\u8ffd|\u5207|\u70b9|\u586b|\u542c|\u53d1|\u6536|\u505a)/g,
  },
  {
    reason: 'vague comparative convenience claim',
    pattern: /(?:\u66f4)?(?:\u987a\u624b|\u65b9\u4fbf|\u7701\u5fc3|\u7701\u4e8b|\u8f7b\u677e)\u4e0d\u5c11/g,
  },
  {
    reason: 'English-shaped quantity-fronted trouble frame',
    pattern: /(?:^|[\n\u3002\uff01\uff1f])\s*[^\u3002\uff01\uff1f\n]{1,36}\u4e00\u591a[\uff0c,][^\u3002\uff01\uff1f\n]{0,24}(?:\u9ebb\u70e6|\u95ee\u9898|\u98ce\u9669|\u96be\u70b9)(?:\u901a\u5e38)?\u51fa\u5728/g,
  },
  {
    reason: 'command container translationese',
    pattern: /\u628a[^\u3002\uff01\uff1f\n]{1,60}(?:\u653e\u5230|\u653e\u8fdb)[^\u3002\uff01\uff1f\n]{0,18}(?:\u547d\u4ee4|command)[^\u3002\uff01\uff1f\n]{0,24}(?:\u91cc)?\u67e5/g,
  },
  {
    reason: 'call container translationese',
    pattern: /\u628a[^\u3002\uff01\uff1f\n]{1,80}(?:\u653e\u5230|\u653e\u8fdb)[^\u3002\uff01\uff1f\n]{0,12}(?:\u4e00\u6761)?\u8c03\u7528(?:\u91cc)?[^\u3002\uff01\uff1f\n]{0,24}(?:\u63a5\u7740)?\u505a/g,
  },
  {
    reason: 'internal critique leaked into final copy',
    pattern: /(?:\u8fd9\u53e5\u8bdd(?:\u8981|\u9700\u8981|\u5e94\u8be5|\u4e0d\u80fd)|\u53e5\u5b50\u5728\u8bf4|\u56e0\u4e3a\u5b83\u5199\u7684\u662f|\u8fd9\u91cc\u7684[\u201c"][^\u3002\uff01\uff1f\n]{1,20}[\u201d"]?\u66f4\u660e\u663e|\u6587\u6848\u91cc\u8981\u5199\u51fa)/g,
  },
  {
    reason: 'missing aspect marker after signup success',
    pattern: /\u63d0\u4ea4\u6210\u529f\u540e\u80fd\u770b\u5230\u62a5\u540d\u72b6\u6001/g,
  },
  {
    reason: 'empty progress metaphor opening',
    pattern: /(?:\u63a5\u53e3|API|Responses API|Copilot Chat|OpenAI|GitHub)[^\u3002\uff01\uff1f\n]{0,24}\u5f80\u524d\u63a8\u4e86\u4e00\u6b65/g,
  },
  {
    reason: 'vague demonstrative affects-people frame',
    pattern: /\u8fd9\u4f1a\u5148\u6539\u5230(?:\d+|\u4e00|\u4e24|\u4e09|\u56db|\u4e94|\u516d|\u4e03|\u516b|\u4e5d|\u5341|\u4e24)\u7c7b\u4eba/g,
  },
  {
    reason: 'hard-stuffed support verb',
    pattern: /(?:\u4efb\u52a1|\u957f\u4efb\u52a1|\u94fe\u8def|\u6d41\u7a0b|\u8fd9\u6761\u7ebf)[^\u3002\uff01\uff1f\n]{0,20}\u6258\u8d77\u6765/g,
  },
  {
    reason: 'predicate real action mismatch',
    pattern: /(?:\u5f80\u524d\u63a8\u4e86\u4e00\u6b65|\u6258\u8d77\u6765|\u987a[\u4e86]?\u4e00\u4e9b|\u5f80(?:\u524d|\u56de)\u8ffd|\u8ffd\u4e0a\u4e0b\u6587|\u653e\u5230\u4e00\u6761\u8c03\u7528\u91cc\u63a5\u7740\u505a)/g,
  },
  {
    reason: 'subject-predicate trace verb mismatch',
    pattern: /(?:\u5f80(?:\u524d|\u56de)\u8ffd|\u8ffd\u4e0a\u4e0b\u6587|(?:\u62a5\u9519|\u65e5\u5fd7|\u9519\u8bef|\u8bf7\u6c42|\u4e0a\u4e0b\u6587)[^\u3002\uff01\uff1f\n]{0,16}\u8ffd)/g,
  },
  {
    reason: 'vague improvement tail',
    pattern: /(?:\u987a|\u6e05\u695a|\u8f7b|\u7a33)[\u4e86]?\u4e00\u4e9b/g,
  },
  {
    reason: 'empty concrete-places tail',
    pattern: /\u770b\u7684\u8fd8\u662f\u8fd9\u4e9b\u66f4\u5177\u4f53\u7684\u5730\u65b9/g,
  },
  {
    reason: 'inanimate course or document uses walking predicate',
    pattern: /(?:\d+\s*)?\u8282\u8bfe[^\u3002\uff01\uff1f\n]{0,18}(?:\u6309\u987a\u5e8f)?\u5f80\u4e0b\u8d70|(?:\u8bfe\u7a0b|\u8bfe|\u8d44\u6599|\u6587\u6863|Notebook)[^\u3002\uff01\uff1f\n]{0,28}\u5f80\u4e0b\u8d70/g,
  },
  {
    reason: 'abstract noun used as main judgment',
    pattern: /(?:\u80fd\u529b|\u94fe\u8def|\u751f\u6001|\u95ed\u73af|\u4f53\u7cfb|\u843d\u5730|\u65b9\u5411|\u601d\u8def|\u5b8c\u6574\u5ea6|\u5f00\u7bb1\u5373\u7528|\u751f\u4ea7\u7ea7)/g,
  },
  {
    reason: 'through-to English-shaped structure',
    pattern: /\u901a\u8fc7[^\u3002\uff01\uff1f\n]{1,40}\u6765[^\u3002\uff01\uff1f\n]{1,60}/g,
  },
  {
    reason: 'through-method opening',
    pattern: /\u901a\u8fc7[^\u3002\uff01\uff1f\n]{1,40}[\uff0c,]\s*(?:\u7528\u6237|\u73a9\u5bb6|\u6211\u4eec)?(?:\u80fd\u591f|\u53ef\u4ee5|\u5c06\u4f1a|\u80fd)/g,
  },
  {
    reason: 'nominalized verb phrase',
    pattern: /(?:\u8fdb\u884c|\u5b9e\u73b0|\u5b8c\u6210|\u63d0\u4f9b)(?:\u8d44\u6e90\u7ba1\u7406|\u4efb\u52a1\u7ba1\u7406|\u4f53\u9a8c\u4f18\u5316|\u6d41\u7a0b\u4f18\u5316|\u6548\u7387\u63d0\u5347|\u72b6\u6001\u540c\u6b65|\u6570\u636e\u5206\u6790|\u95ee\u9898\u89e3\u51b3|\u529f\u80fd\u6269\u5c55|\u914d\u7f6e)/g,
  },
  {
    reason: 'empty benefit claim',
    pattern: /(?:\u63d0\u5347|\u4f18\u5316)[^\u3002\uff01\uff1f\n]{0,16}(?:\u4f53\u9a8c|\u6548\u7387|\u6d41\u7a0b)/g,
  },
  {
    reason: 'marketing abstraction verb',
    pattern: /(?:\u8d4b\u80fd|\u6253\u9020|\u6c89\u6dc0\u65b9\u6cd5\u8bba|\u6784\u5efa\u80fd\u529b\u95ed\u73af)/g,
  },
];

const hardPhrases = [
  '\u53ef\u4ee5\u770b\u4e00\u4e0b',
  '\u503c\u5f97\u770b',
  '\u503c\u5f97\u5173\u6ce8',
  '\u503c\u5f97\u62c6',
  '\u62c6\u5f00',
  '\u5f52\u597d',
  '\u8d70\u67e5',
  '\u8fd9\u6b21\u770b',
  '\u63a8\u8350\u4e00\u4e2a',
  '\u66f4\u503c\u5f97\u770b\u7684\u4e0d\u662f',
  '\u4e0d\u53ea\u662f',
  '\u4e0d\u4ec5\u662f',
  '\u771f\u6b63\u503c\u5f97\u770b\u7684',
  '\u91cd\u8981\u7684\u4e0d\u662f',
  '\u96be\u70b9\u4e0d\u662f',
  '\u4e0d\u53ea\u5728',
  '\u8fd9\u4ef6\u4e8b',
  '\u8fd9\u7c7b\u5de5\u5177',
  '\u8fd9\u5957\u4e1c\u897f',
  '\u8fd9\u5957\u5e95\u5b50',
  '\u8fd9\u5957\u94fe\u8def',
  '\u8fd9\u4e00\u5957',
  '\u4e00\u5c42',
  '\u8fd9\u5c42',
  '\u8fd9\u51e0\u5757',
  '\u8fd9\u4e9b\u4e1c\u897f',
  '\u540e\u9762\u90fd\u8981\u8865\u4e0a',
  '\u65c1\u8fb9\u8fd8\u8865\u4e86',
  '\u653e\u5230\u5b9e\u9645\u73af\u5883',
  '\u65e0\u8111\u4e0a\u751f\u4ea7',
  '\u771f\u8981',
  '\u8bf4\u767d\u4e86',
  '\u6709\u70b9\u4e1c\u897f',
  '\u6709\u70b9\u610f\u601d',
  '\u8fd9\u6ce2',
  '\u7a33\u4e86',
  '\u786c\u6838',
  '\u72e0\u72e0',
  '\u62ff\u634f',
  '\u54b1\u5c31\u662f\u8bf4',
  '\u5b9d\u5b50',
];

const warnPhrases = [
  '\u53ef\u4ee5\u5148',
  '\u4e3b\u8981\u662f',
  '\u9002\u5408',
  '\u76f4\u63a5',
  '\u6bd4\u8f83',
  '\u4e00\u5957',
  '\u591a\u7aef',
  '\u7aef\u5230\u7aef',
  '\u79c1\u6709\u5316\u90e8\u7f72',
  '\u9996\u5148',
  '\u5176\u6b21',
  '\u6b64\u5916',
  '\u6700\u540e',
  '\u7efc\u4e0a\u6240\u8ff0',
];

const warnRules = [
  {
    reason: 'prefer colloquial demonstrative',
    pattern: /\u6b64(?:\u5de5\u5177|\u529f\u80fd|\u9879\u76ee|\u7cfb\u7edf|\u5e73\u53f0|\u6a21\u5757|\u65b9\u6cd5|\u7c7b|\u5904|\u6b21|\u524d|\u540e)/g,
  },
  {
    reason: 'redundant formal playback notice wording',
    pattern: /\u5c4a\u65f6\u4e5f?\u53ef(?:\u89c2\u770b|\u67e5\u770b|\u56de\u770b)/g,
  },
];

const rules = [
  ...hardRules.map((rule) => ({ severity: 'hard', ...rule })),
  ...containsAny('hard', hardPhrases, 'hard blacklist phrase'),
  ...warnRules.map((rule) => ({ severity: 'warn', ...rule })),
  ...containsAny('warn', warnPhrases, 'needs concrete action or boundary'),
];

const text = readInput();
const issues = [];

function pushIssue(issue) {
  if (issues.some((item) => item.severity === issue.severity && item.reason === issue.reason && item.index === issue.index && item.match === issue.match)) {
    return;
  }
  issues.push(issue);
}

for (const { severity, pattern, reason } of rules) {
  for (const match of text.matchAll(pattern)) {
    pushIssue({
      severity,
      reason,
      match: match[0],
      index: match.index,
    });
  }
}

const guaranteedHardChecks = [
  {
    reason: 'not-A-but-B contrast frame',
    pattern: /\u4e0d\u662f[^\u3002\uff01\uff1f\n]{1,40}\u800c\u662f/g,
  },
  {
    reason: 'not-here-but-there contrast frame',
    pattern: /\u4e0d\u5728[^\u3002\uff01\uff1f\n]{1,40}\u800c\u5728/g,
  },
  {
    reason: 'front-loaded reader condition comma split',
    pattern: /(?:^|[\n\u3002\uff01\uff1f\uff1b;])\s*[^\uff0c,\u3002\uff01\uff1f\n]{2,60}\u7684\u4eba[\uff0c,]\s*(?:\u5148|\u518d|\u5c31|\u4f1a|\u8981|\u80fd|\u53ef\u4ee5|\u4e0d\u7528|\u522b|\u9002\u5408|\u6309|\u7528|\u4ece|\u770b|\u67e5|\u8dd1|\u63a5|\u5199|\u5f00|\u6539|\u8ffd|\u5207|\u70b9|\u586b|\u542c|\u53d1|\u6536|\u505a)/g,
  },
  {
    reason: 'vague comparative convenience claim',
    pattern: /(?:\u66f4)?(?:\u987a\u624b|\u65b9\u4fbf|\u7701\u5fc3|\u7701\u4e8b|\u8f7b\u677e)\u4e0d\u5c11/g,
  },
  {
    reason: 'empty progress metaphor opening',
    pattern: /(?:\u63a5\u53e3|API|Responses API|Copilot Chat|OpenAI|GitHub)[^\u3002\uff01\uff1f\n]{0,24}\u5f80\u524d\u63a8\u4e86\u4e00\u6b65/g,
  },
  {
    reason: 'vague demonstrative affects-people frame',
    pattern: /\u8fd9\u4f1a\u5148\u6539\u5230(?:\d+|\u4e00|\u4e24|\u4e09|\u56db|\u4e94|\u516d|\u4e03|\u516b|\u4e5d|\u5341|\u4e24)\u7c7b\u4eba/g,
  },
  {
    reason: 'empty concrete-places tail',
    pattern: /\u770b\u7684\u8fd8\u662f\u8fd9\u4e9b\u66f4\u5177\u4f53\u7684\u5730\u65b9/g,
  },
  {
    reason: 'not-none-just contrast frame',
    pattern: /\u4e0d\u662f\u6ca1\u6709[\uff0c,]\s*\u53ea\u662f/g,
  },
  {
    reason: 'counterexample contrast frame',
    pattern: /\u800c\u4e0d\u662f/g,
  },
  {
    reason: 'predicate real action mismatch',
    pattern: /(?:\u5f80\u524d\u63a8\u4e86\u4e00\u6b65|\u6258\u8d77\u6765|\u987a[\u4e86]?\u4e00\u4e9b|\u5f80(?:\u524d|\u56de)\u8ffd|\u8ffd\u4e0a\u4e0b\u6587|\u653e\u5230\u4e00\u6761\u8c03\u7528\u91cc\u63a5\u7740\u505a)/g,
  },
  {
    reason: 'subject-predicate trace verb mismatch',
    pattern: /(?:\u5f80(?:\u524d|\u56de)\u8ffd|\u8ffd\u4e0a\u4e0b\u6587|(?:\u62a5\u9519|\u65e5\u5fd7|\u9519\u8bef|\u8bf7\u6c42|\u4e0a\u4e0b\u6587)[^\u3002\uff01\uff1f\n]{0,16}\u8ffd)/g,
  },
];

for (const { reason, pattern } of guaranteedHardChecks) {
  for (const match of text.matchAll(pattern)) {
    pushIssue({
      severity: 'hard',
      reason,
      match: match[0],
      index: match.index,
    });
  }
}

function firstBodySentence(block) {
  const lines = block
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^#{1,6}\s/.test(line))
    .filter((line) => !/^[A-Za-z0-9_.:/ -\u4e00-\u9fff]{1,60}版$/.test(line))
    .filter((line) => !/(?:skill|Skill|未调用|调用).{0,12}版$/.test(line))
    .filter((line) => !/^(?:稿|版本|skill|Skill|未调用|调用|对照|可发|候选|[A-Za-z0-9_.:/-]+)\s*[一二三四五六七八九十0-9]*\s*(?:版|组|：|:)?$/.test(line));

  if (lines.length === 0) return null;
  const paragraph = lines.join('');
  const sentence = paragraph.match(/^[^。！？\n]{4,120}[。！？]?/u);
  return sentence ? sentence[0] : null;
}

function firstBodySentenceWithMeta(block) {
  const originalLines = block
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bodyLines = originalLines
    .filter((line) => !/^#{1,6}\s/.test(line))
    .filter((line) => !/^[A-Za-z0-9_.:/ -\u4e00-\u9fff]{1,60}版$/.test(line))
    .filter((line) => !/(?:skill|Skill|未调用|调用).{0,12}版$/.test(line))
    .filter((line) => !/^(?:稿|版本|skill|Skill|未调用|调用|对照|可发|候选|[A-Za-z0-9_.:/-]+)\s*[一二三四五六七八九十0-9]*\s*(?:版|组|：|:)?$/.test(line));

  if (bodyLines.length === 0) {
    return { sentence: null, hasLabel: false };
  }

  const firstOriginal = originalLines[0] || '';
  const hasLabel = firstOriginal !== bodyLines[0];
  const paragraph = bodyLines.join('');
  const sentence = paragraph.match(/^[^。！？\n]{4,120}[。！？]?/u);
  return { sentence: sentence ? sentence[0] : null, hasLabel };
}

function isFrontLoadedAdverbialOpening(sentence) {
  if (!sentence) return false;
  const normalized = sentence.replace(/^[>\s-]+/, '');
  return (
    /^[^，。！？\n]{4,56}(?:时|后|以后|之后|起来以后|前)，/u.test(normalized)
    || /^[^，。！？\n]{4,40}(?:一次|一改|一跑|一接入|一上线)，[^。！？\n]{0,50}(?:就|可能|容易|常|会)/u.test(normalized)
  );
}

function isToolProjectDefinitionOpening(sentence) {
  if (!sentence) return false;
  const normalized = sentence.replace(/^[>\s-]+/, '').replace(/[。！？]$/u, '');
  if (/^(?:这个|这款|该|此)(?:项目|工具|库|框架|插件|服务|平台|应用|界面)/u.test(normalized)) {
    return false;
  }
  return /^[A-Za-z0-9_.:/ -\u4e00-\u9fff]{2,80}是(?=[^。！？\n]{0,32}(?:一个|一款|一套|一种|一份|一组|一类|一项|一条))[^。！？\n]{1,110}(?:工具|项目|库|框架|插件|服务|平台|应用|界面|组件|命令|扩展|CLI|WebUI|SDK|API)[^。！？\n]*$/u.test(normalized);
}

const paragraphBlocks = text.split(/\n\s*\n/);
const frontLoadedOpenings = [];
const definitionOpeningTargets = [];

for (const block of paragraphBlocks) {
  const sentence = firstBodySentence(block);
  if (isFrontLoadedAdverbialOpening(sentence)) {
    frontLoadedOpenings.push(sentence);
  }

  const meta = firstBodySentenceWithMeta(block);
  if (meta.sentence && meta.hasLabel) {
    definitionOpeningTargets.push(meta.sentence);
  }
}

if (requireToolProjectOpening) {
  const targets = definitionOpeningTargets.length > 0
    ? definitionOpeningTargets
    : [firstBodySentence(text)].filter(Boolean);

  for (const sentence of targets) {
    if (!isToolProjectDefinitionOpening(sentence)) {
      issues.push({
        severity: 'hard',
        reason: 'tool/project intro must start with measure-word project definition sentence',
        match: sentence,
        index: text.indexOf(sentence),
      });
    }
  }
}

if (frontLoadedOpenings.length >= 2) {
  issues.push({
    severity: 'hard',
    reason: 'batch front-loaded adverbial opening overload',
    match: frontLoadedOpenings.slice(0, 3).join(' | '),
    index: text.indexOf(frontLoadedOpenings[0]),
  });
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
