#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteFooter, siteFooterStyles } from './site-footer.mjs';

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
    descriptionEn: 'The whole business in one map: demand, supply chain, inventory, commerce, payments, spend, payroll, bank and three separate ledgers, each node naming its system of record.',
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
    descriptionEn: 'Shopify → Stripe → Chase 1002 → QuickBooks with one source of truth per fact, the wholesale A/R loop, and no invented amounts.',
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
    descriptionEn: 'Checkout, card capture, the T+2 net payout, and the three facts QuickBooks matches: sales receipt, fee, and deposit.',
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
    descriptionEn: 'Gross Shopify sales to the QuickBooks revenue line: contra items, pass-through tax and gift cards, and fees kept below revenue.',
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
    descriptionEn: 'Lanes by system, a zero-difference reconciliation gate owned by the controller, and a break lane that blocks the period lock.',
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
    descriptionEn: 'Refund, Stripe reversal, payout netting, and the QuickBooks entry — with chargeback waits, terminal losses, and a recoverable books miss.',
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
    descriptionEn: 'Gross charges less refunds less fees per payout, in-transit timing, wholesale ACH explained separately, and a residual that must be zero.',
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
    descriptionEn: 'DTC checkout is a sales receipt with no receivable; only QuickBooks invoices create A/R, and the aging report is the only list of who owes.',
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
    descriptionEn: 'A tied Chase opening balance, only named inflows, dated outflows to 15 August, and an answer that is unknown rather than guessed.',
  },
  {
    id: 'gl-replay',
    type: 'ledger',
    input: 'northline-gl-2026-07.ledger.json',
    output: 'northline-gl-2026-07.ledger.html',
    focus: 'cash-1002',
    view: 'order-to-cash',
    accent: '#5eead4',
    titleEn: 'July in the Books, GL Replay',
    descriptionEn: 'The general-ledger export replayed day by day across an account map: sales receipts landing in cash, bills paid, COGS relieved, with tie-outs and the payroll splits listed as unmapped rather than allocated.',
  },
];

const SHAPES = {
  architecture: ['components', 'connections'],
  workflow: ['nodes', 'edges'],
  sequence: ['participants', 'messages'],
  dataflow: ['nodes', 'flows'],
  lifecycle: ['states', 'transitions'],
  ledger: ['accounts', 'flows'],
};

const TYPE_LABELS = {
  architecture: 'Architecture',
  workflow: 'Workflow',
  sequence: 'Sequence',
  dataflow: 'Data flow',
  lifecycle: 'Lifecycle',
  ledger: 'Ledger',
};

// Print-depth type hues shared with the site palette (guide page uses the same map).
const TYPE_ACCENTS = {
  architecture: '#0891b2',
  workflow: '#047857',
  sequence: '#6d28d9',
  dataflow: '#b45309',
  lifecycle: '#be123c',
  ledger: '#0f766e',
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
  const engineeringProof = entry.engineeringProfile
    ? `\n              <div class="engineering-proof" aria-label="Engineering profile validation"><span>Engineering profile</span><strong>${esc(entry.engineeringProfile.replaceAll('-', ' ').toUpperCase())} · PASS</strong></div>`
    : '';
  return `          <article class="${classes}" id="proof-${esc(entry.id)}" data-proof-id="${esc(entry.id)}" data-type="${esc(entry.type)}" style="--accent:${esc(TYPE_ACCENTS[entry.type] || entry.accent)}">
            <header class="card-header">
              <div class="card-index">${String(index + 1).padStart(2, '0')}</div>
              <div class="card-title-wrap">
                <div class="card-kicker">${esc(TYPE_LABELS[entry.type])} / ${entry.nodeCount} nodes${entry.viewCount ? ` / ${entry.viewCount} views · play` : ''}</div>
                <h3 class="card-title">${esc(entry.titleEn)}</h3>
              </div>
              <div class="card-mode">${esc(mode)}</div>
            </header>
            <div class="preview-shell">
              <div class="live-flag">Live artifact</div>
              <iframe src="${esc(artifact)}?embed=1&amp;theme=dark" data-src-base="${esc(artifact)}" title="${esc(entry.titleEn)} live Mosofin preview" loading="${entry.featured ? 'eager' : 'lazy'}"></iframe>
            </div>
            <div class="card-body">
              <p class="card-description">${esc(entry.descriptionEn)}</p>${engineeringProof}
              <div class="receipt" aria-label="Validation receipt">
                <div class="receipt-cell"><span class="receipt-label">Artifact</span><span class="receipt-value ok">${entry.checksPassed}/${entry.checkCount} pass</span></div>
                <div class="receipt-cell"><span class="receipt-label">Composition</span><span class="receipt-value ${entry.composition.status === 'pass' ? 'ok' : ''}" title="${entry.composition.metrics.properCrossings} crossings · ${entry.composition.metrics.containerBorderRuns} border runs · ${entry.composition.metrics.microSegmentCount} micro segments · ${entry.composition.metrics.shortInteriorSegmentCount} cramped turns">${esc(entry.composition.profile.toUpperCase())} · ${esc(entry.composition.status.toUpperCase())}</span></div>
                <div class="receipt-cell"><span class="receipt-label">Graph</span><span class="receipt-value">${entry.nodeCount}N · ${entry.edgeCount}E</span></div>
                <div class="receipt-cell"><span class="receipt-label">SHA-256</span><span class="receipt-value" title="${esc(entry.artifactSha256)}">${esc(entry.artifactSha256.slice(0, 12))}</span></div>
              </div>
              <div class="card-actions">
                <a class="card-link primary" href="${esc(focusedArtifact)}" target="_blank" rel="noopener" >${esc(exploreEn)}</a>
                <a class="card-link" href="${esc(artifact)}" target="_blank" rel="noopener" >Full artifact</a>
                <a class="card-link" href="${esc(source)}" target="_blank" rel="noopener">JSON IR</a>
                <a class="card-link create-link" href="start.html?type=${esc(entry.type)}&amp;source=gallery" >Create this type</a>
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
  '[[SITE_FOOTER]]': siteFooter({ version: packageJson.version, page: 'gallery' }),
  '[[SITE_FOOTER_STYLES]]': siteFooterStyles(),
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
