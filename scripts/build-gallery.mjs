#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const skillRoot = path.join(repoRoot, 'mosofin');
const outputRoot = path.resolve(process.argv[2] || path.join(repoRoot, 'docs'));
const artifactsRoot = path.join(outputRoot, 'gallery', 'artifacts');
const sourcesRoot = path.join(outputRoot, 'gallery', 'sources');
const templatePath = path.join(__dirname, 'gallery-template.html');
const packageJson = JSON.parse(fs.readFileSync(path.join(skillRoot, 'package.json'), 'utf8'));

const CASES = [
  {
    id: 'business-map',
    type: 'architecture',
    input: 'business-operating-map.architecture.json',
    output: 'business-operating-map.architecture.html',
    focus: 'bank',
    view: 'order-to-cash',
    accent: '#38bdf8',
    featured: true,
    titleEn: 'Business Operating Map',
    titleZh: '业务全景图',
    descriptionEn: 'The whole business in one map: demand, supply chain, inventory, commerce, payments, spend, payroll, bank and three separate ledgers, each node naming its system of record.',
    descriptionZh: '一张图看懂整个业务：需求、供应链、库存、电商、支付、支出、薪酬、银行和三套独立账本，每个节点标明权威系统。',
  },
  {
    id: 'money-map',
    type: 'architecture',
    input: 'northline-money-map.architecture.json',
    output: 'northline-money-map.architecture.html',
    focus: 'chase',
    view: 'order-to-cash',
    accent: '#38bdf8',
    titleEn: 'Money Map — Northline Coffee',
    titleZh: '资金入账地图 — Northline Coffee',
    descriptionEn: 'Shopify → Stripe → Chase 1002 → QuickBooks with one source of truth per fact, the wholesale A/R loop, and no invented amounts.',
    descriptionZh: 'Shopify → Stripe → Chase 1002 → QuickBooks，每项事实只有一个准据来源，含批发应收回路，不虚构金额。',
  },
  {
    id: 'order-path',
    type: 'sequence',
    input: 'northline-order-path.sequence.json',
    output: 'northline-order-path.sequence.html',
    focus: 'stripe',
    view: 'books-catch-up',
    accent: '#c4b5fd',
    titleEn: 'One DTC Order to the Books',
    titleZh: '一笔 DTC 订单入账',
    descriptionEn: 'Checkout, card capture, the T+2 net payout, and the three facts QuickBooks matches: sales receipt, fee, and deposit.',
    descriptionZh: '结账、扣款、T+2 净打款，以及 QuickBooks 需匹配的三项事实：销售收据、手续费与存款。',
  },
  {
    id: 'revenue-walk',
    type: 'dataflow',
    input: 'northline-revenue-walk.dataflow.json',
    output: 'northline-revenue-walk.dataflow.html',
    focus: 'netsales',
    view: 'books-line',
    accent: '#f6c453',
    titleEn: 'July Revenue Walk',
    titleZh: '七月收入对账走步',
    descriptionEn: 'Gross Shopify sales to the QuickBooks revenue line: contra items, pass-through tax and gift cards, and fees kept below revenue.',
    descriptionZh: '从 Shopify 毛销售到 QuickBooks 收入行：冲减项、代收税与礼品卡、以及不计入收入的手续费。',
  },
  {
    id: 'close',
    type: 'workflow',
    input: 'northline-close.workflow.json',
    output: 'northline-close.workflow.html',
    focus: 'bank_rec',
    view: 'reconcile-and-review',
    accent: '#34d399',
    titleEn: 'Month-End Close Runbook',
    titleZh: '月结关账 Runbook',
    descriptionEn: 'Lanes by system, a zero-difference reconciliation gate owned by the controller, and a break lane that blocks the period lock.',
    descriptionZh: '按系统分泳道，由财务主管把守的零差异对账门，以及阻止锁定期间的异常泳道。',
  },
  {
    id: 'dispute',
    type: 'lifecycle',
    input: 'northline-dispute.lifecycle.json',
    output: 'northline-dispute.lifecycle.html',
    focus: 'landed',
    view: 'dispute-waits',
    accent: '#fb7185',
    titleEn: 'Refund and Chargeback Lifecycle',
    titleZh: '退款与拒付生命周期',
    descriptionEn: 'Refund, Stripe reversal, payout netting, and the QuickBooks entry — with chargeback waits, terminal losses, and a recoverable books miss.',
    descriptionZh: '退款、Stripe 冲正、打款抵扣与 QuickBooks 入账，含拒付等待、终态损失与可恢复的漏记。',
  },
  {
    id: 'payout-rec',
    type: 'dataflow',
    input: 'northline-payout-rec.dataflow.json',
    output: 'northline-payout-rec.dataflow.html',
    focus: 'residual',
    view: 'residual',
    accent: '#f6c453',
    titleEn: 'Stripe Payout Reconciliation',
    titleZh: 'Stripe 打款对账',
    descriptionEn: 'Gross charges less refunds less fees per payout, in-transit timing, wholesale ACH explained separately, and a residual that must be zero.',
    descriptionZh: '每笔打款 = 毛扣款 − 退款 − 手续费，在途时间差、单独解释的批发 ACH，以及必须为零的未解释差额。',
  },
  {
    id: 'customer-ar',
    type: 'architecture',
    input: 'northline-customer-ar.architecture.json',
    output: 'northline-customer-ar.architecture.html',
    focus: 'aging',
    view: 'wholesale-ar',
    accent: '#38bdf8',
    titleEn: 'Who Can Say a Customer Owes Us',
    titleZh: '谁有资格说客户欠款',
    descriptionEn: 'DTC checkout is a sales receipt with no receivable; only QuickBooks invoices create A/R, and the aging report is the only list of who owes.',
    descriptionZh: 'DTC 结账是销售收据、不产生应收；只有 QuickBooks 发票形成应收，账龄表是唯一的欠款名单。',
  },
  {
    id: 'cash-runway',
    type: 'dataflow',
    input: 'northline-cash-runway.dataflow.json',
    output: 'northline-cash-runway.dataflow.html',
    focus: 'position',
    view: 'commitments',
    accent: '#f6c453',
    titleEn: 'Cash to Payroll Date',
    titleZh: '现金撑到发薪日',
    descriptionEn: 'A tied Chase opening balance, only named inflows, dated outflows to 15 August, and an answer that is unknown rather than guessed.',
    descriptionZh: '已对账的 Chase 期初余额、仅计具名流入、截至 8 月 15 日的定期流出，答案宁可未知也不猜测。',
  },
];

const SHAPES = {
  architecture: ['components', 'connections'],
  workflow: ['nodes', 'edges'],
  sequence: ['participants', 'messages'],
  dataflow: ['nodes', 'flows'],
  lifecycle: ['states', 'transitions'],
};

const TYPE_LABELS = {
  architecture: 'Architecture',
  workflow: 'Workflow',
  sequence: 'Sequence',
  dataflow: 'Data flow',
  lifecycle: 'Lifecycle',
};

// Print-depth type hues shared with the site palette (guide page uses the same map).
const TYPE_ACCENTS = {
  architecture: '#0891b2',
  workflow: '#047857',
  sequence: '#6d28d9',
  dataflow: '#b45309',
  lifecycle: '#be123c',
};

function digest(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
}

function formatBytes(bytes) {
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

function renderCard(entry, index) {
  const classes = `showcase-card${entry.featured ? ' is-featured' : ''}`;
  const mode = entry.animation === 'trace' ? `${entry.visualPreset} + trace` : entry.visualPreset;
  const artifact = `gallery/artifacts/${entry.output}`;
  const source = `gallery/sources/${entry.input}`;
  const focusedArtifact = entry.view
    ? `${artifact}?present=1&play=1#view=${encodeURIComponent(entry.view)}`
    : `${artifact}#focus=${encodeURIComponent(entry.focus)}`;
  const exploreEn = entry.view ? 'Play named chapter ↗' : 'Explore focus ↗';
  const exploreZh = entry.view ? '播放命名章节 ↗' : '探索聚焦路径 ↗';
  const engineeringProof = entry.engineeringProfile
    ? `\n              <div class="engineering-proof" aria-label="Engineering profile validation"><span>Engineering profile</span><strong>${esc(entry.engineeringProfile.replaceAll('-', ' ').toUpperCase())} · PASS</strong></div>`
    : '';
  return `          <article class="${classes}" id="proof-${esc(entry.id)}" data-proof-id="${esc(entry.id)}" data-type="${esc(entry.type)}" style="--accent:${esc(TYPE_ACCENTS[entry.type] || entry.accent)}">
            <header class="card-header">
              <div class="card-index">${String(index + 1).padStart(2, '0')}</div>
              <div class="card-title-wrap">
                <div class="card-kicker">${esc(TYPE_LABELS[entry.type])} / ${entry.nodeCount} nodes${entry.viewCount ? ` / ${entry.viewCount} views · play` : ''}</div>
                <h3 class="card-title" data-en="${esc(entry.titleEn)}" data-zh="${esc(entry.titleZh)}">${esc(entry.titleEn)}</h3>
              </div>
              <div class="card-mode">${esc(mode)}</div>
            </header>
            <div class="preview-shell">
              <div class="live-flag">Live artifact</div>
              <iframe src="${esc(artifact)}?embed=1&amp;theme=dark" data-src-base="${esc(artifact)}" title="${esc(entry.titleEn)} live Mosofin preview" loading="${entry.featured ? 'eager' : 'lazy'}"></iframe>
            </div>
            <div class="card-body">
              <p class="card-description" data-en="${esc(entry.descriptionEn)}" data-zh="${esc(entry.descriptionZh)}">${esc(entry.descriptionEn)}</p>${engineeringProof}
              <div class="receipt" aria-label="Validation receipt">
                <div class="receipt-cell"><span class="receipt-label">Artifact</span><span class="receipt-value ok">${entry.checksPassed}/${entry.checkCount} pass</span></div>
                <div class="receipt-cell"><span class="receipt-label">Composition</span><span class="receipt-value ${entry.composition.status === 'pass' ? 'ok' : ''}" title="${entry.composition.metrics.properCrossings} crossings · ${entry.composition.metrics.containerBorderRuns} border runs · ${entry.composition.metrics.microSegmentCount} micro segments · ${entry.composition.metrics.shortInteriorSegmentCount} cramped turns">${esc(entry.composition.profile.toUpperCase())} · ${esc(entry.composition.status.toUpperCase())}</span></div>
                <div class="receipt-cell"><span class="receipt-label">Graph</span><span class="receipt-value">${entry.nodeCount}N · ${entry.edgeCount}E</span></div>
                <div class="receipt-cell"><span class="receipt-label">SHA-256</span><span class="receipt-value" title="${esc(entry.artifactSha256)}">${esc(entry.artifactSha256.slice(0, 12))}</span></div>
              </div>
              <div class="card-actions">
                <a class="card-link primary" href="${esc(focusedArtifact)}" target="_blank" rel="noopener" data-en="${esc(exploreEn)}" data-zh="${esc(exploreZh)}">${esc(exploreEn)}</a>
                <a class="card-link" href="${esc(artifact)}" target="_blank" rel="noopener" data-en="Full artifact" data-zh="完整成品">Full artifact</a>
                <a class="card-link" href="${esc(source)}" target="_blank" rel="noopener">JSON IR</a>
                <a class="card-link create-link" href="start.html?type=${esc(entry.type)}&amp;source=gallery" data-en="Create this type" data-zh="按此类型开始">Create this type</a>
              </div>
            </div>
          </article>`;
}

fs.rmSync(artifactsRoot, { recursive: true, force: true });
fs.rmSync(sourcesRoot, { recursive: true, force: true });
fs.mkdirSync(artifactsRoot, { recursive: true });
fs.mkdirSync(sourcesRoot, { recursive: true });

const entries = [];
for (const item of CASES) {
  const inputPath = path.join(skillRoot, 'examples', item.input);
  const sourceBuffer = fs.readFileSync(inputPath);
  const source = JSON.parse(sourceBuffer.toString('utf8'));
  const artifactPath = path.join(artifactsRoot, item.output);
  const sourcePath = path.join(sourcesRoot, item.input);

  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers', item.type, `render-${item.type}.mjs`),
    inputPath,
    artifactPath,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  fs.copyFileSync(inputPath, sourcePath);

  const checkOutput = execFileSync(process.execPath, [
    path.join(skillRoot, 'scripts', 'check-render-output.mjs'),
    artifactPath,
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const validation = JSON.parse(checkOutput);
  const artifactBuffer = fs.readFileSync(artifactPath);
  const [nodeKey, edgeKey] = SHAPES[item.type];
  const checksPassed = validation.checks.filter((check) => check.ok).length;

  entries.push({
    ...item,
    title: source.meta.title,
    subtitle: source.meta.subtitle || '',
    schemaVersion: source.schema_version,
    visualPreset: source.meta.visual_preset || 'classic',
    animation: source.meta.animation || 'static',
    engineeringProfile: source.meta.engineering_profile || null,
    viewCount: Array.isArray(source.meta.views) ? source.meta.views.length : 0,
    viewIds: Array.isArray(source.meta.views) ? source.meta.views.map((view) => view.id) : [],
    nodeCount: Array.isArray(source[nodeKey]) ? source[nodeKey].length : 0,
    edgeCount: Array.isArray(source[edgeKey]) ? source[edgeKey].length : 0,
    artifactBytes: artifactBuffer.byteLength,
    sourceBytes: sourceBuffer.byteLength,
    artifactSha256: digest(artifactBuffer),
    sourceSha256: digest(sourceBuffer),
    checkCount: validation.checks.length,
    checksPassed,
    checks: validation.checks.map((check) => ({ name: check.name, ok: check.ok })),
    composition: validation.composition,
  });
}

const manifest = {
  schemaVersion: 1,
  generator: 'scripts/build-gallery.mjs',
  mosofinVersion: packageJson.version,
  entryCount: entries.length,
  checkCount: entries.reduce((sum, entry) => sum + entry.checkCount, 0),
  entries: entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    subtitle: entry.subtitle,
    input: `gallery/sources/${entry.input}`,
    artifact: `gallery/artifacts/${entry.output}`,
    focus: entry.focus,
    view: entry.view || null,
    viewCount: entry.viewCount,
    viewIds: entry.viewIds,
    guidedPlayback: entry.viewCount > 0,
    schemaVersion: entry.schemaVersion,
    visualPreset: entry.visualPreset,
    animation: entry.animation,
    engineeringProfile: entry.engineeringProfile,
    nodeCount: entry.nodeCount,
    edgeCount: entry.edgeCount,
    artifactBytes: entry.artifactBytes,
    artifactSha256: entry.artifactSha256,
    sourceBytes: entry.sourceBytes,
    sourceSha256: entry.sourceSha256,
    checks: entry.checks,
    composition: entry.composition,
  })),
};

const manifestJson = JSON.stringify(manifest, null, 2);
fs.writeFileSync(path.join(outputRoot, 'gallery', 'manifest.json'), `${manifestJson}\n`);

const replacements = {
  '[[MOSOFIN_VERSION]]': packageJson.version,
  '[[ENTRY_COUNT]]': String(manifest.entryCount),
  '[[CHECK_COUNT]]': String(manifest.checkCount),
  '[[GALLERY_CARDS]]': entries.map(renderCard).join('\n'),
  '[[MANIFEST_JSON]]': manifestJson.replace(/<\/script/gi, '<\\/script'),
};

let html = fs.readFileSync(templatePath, 'utf8');
for (const [placeholder, value] of Object.entries(replacements)) {
  html = html.split(placeholder).join(value);
}
if (/\[\[[A-Z0-9_]+\]\]/.test(html)) {
  throw new Error('Gallery template contains unresolved placeholders');
}
fs.writeFileSync(path.join(outputRoot, 'gallery.html'), html);

console.log(`gallery ${manifest.entryCount} artifacts / ${manifest.checkCount} checks`);
console.log(path.join(outputRoot, 'gallery.html'));
