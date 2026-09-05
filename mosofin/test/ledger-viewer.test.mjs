import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(skillRoot, 'assets', 'template.html'), 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-viewer-'));

const EXISTING = {
  architecture: 'web-app.architecture.json',
  workflow: 'agent-tool-call.workflow.json',
  sequence: 'cache-miss-request.sequence.json',
  dataflow: 'product-analytics.dataflow.json',
  lifecycle: 'agent-run.lifecycle.json',
};

function render(mode, example) {
  const output = path.join(tmp, `${mode}.html`);
  execFileSync(process.execPath, [path.join(skillRoot, `renderers/${mode}/render-${mode}.mjs`), path.join(skillRoot, 'examples', example), output], { stdio: 'pipe' });
  return fs.readFileSync(output, 'utf8');
}
function canonicalSvg(html) {
  return html.match(/<svg\b[\s\S]*?<\/svg>/)?.[0] || '';
}

test('the viewer ships one gated ledger module with a money token, still-mode CSS and export hygiene', () => {
  assert.equal((template.match(/Mosofin\.ledger = \(function \(\) \{/g) || []).length, 1);
  assert.match(template, /kind === 'money'/);
  assert.match(template, /if \(options\.kind\) kind = options\.kind;/);
  assert.match(template, /relationshipTokenGeometry\(shape, relationshipTokenKind\(edge\), key, options\)/, 'the story token call is untouched');
  assert.match(template, /svg\.getAttribute\('data-diagram-kind'\) === 'ledger'/, 'the module activates only on a ledger artifact');
  assert.match(template, /html\[data-motion="still"\] \.ledger-token-overlay \{ display: none !important; \}/);
  assert.match(template, /if \(svg\.hasAttribute\('data-ledger-playing'\)\) return 'ledger';/, 'the motion governor derives the ledger owner');
  assert.match(template, /Mosofin\.ledger\.pause\(\{ reason: systemPaused/, 'Still and reduced motion pause ledger playback');
  assert.equal((template.match(/\[data-ledger-overlay\], \[data-ledger-volume\], \[data-ledger-arrive\]/g) || []).length, 1, 'the export canonical check lists ledger overlays');
  assert.match(template, /clone\.querySelectorAll\('\[data-ledger-overlay\], \[data-ledger-volume\]'\)/, 'export clones drop ledger overlays');
  assert.match(template, /clone\.querySelectorAll\('\[data-story-overlay\], \[data-story-carrier-overlay\]'\)/, 'the story removal statement is untouched');
  assert.match(template, /e\.key === 'g' \|\| e\.key === 'G'/);
  for (const block of template.match(/<script>\n([\s\S]*?)<\/script>/g) || []) {
    const source = block.replace(/^<script>\n/, '').replace(/<\/script>$/, '');
    assert.doesNotThrow(() => new vm.Script(source), 'inline viewer script must parse');
  }
});

test('the five existing diagram types render without any ledger surface', () => {
  for (const [mode, example] of Object.entries(EXISTING)) {
    const html = render(mode, example);
    assert.doesNotMatch(html, /data-diagram-kind=/, mode);
    assert.doesNotMatch(html, /id="mosofin-ledger-data"/, mode);
    assert.doesNotMatch(html, /id="ledger-strip"|id="ledger-day-bars"|id="ledger-meters"|id="ledger-panel"|class="ledger-entities/, mode);
    assert.doesNotMatch(html, /MOSOFIN:LEDGER_/, `${mode}: sentinels must be consumed, never shipped`);
    assert.match(html, /Mosofin\.ledger = \(function/, `${mode}: the shared viewer still carries the inert module`);
  }
});

test('the ledger artifact carries its data, strip and panel outside the canonical SVG', () => {
  const html = render('ledger', 'northline-gl-2026-07.ledger.json');
  assert.match(html, /<svg[^>]*data-diagram-kind="ledger"/);
  assert.match(html, /<script id="mosofin-ledger-data" type="application\/json">/);
  assert.match(html, /id="ledger-strip"/);
  assert.match(html, /id="ledger-day-bars"/);
  assert.match(html, /class="ledger-day-bar" data-day-index="0"/);
  assert.match(html, /id="ledger-meters"/);
  assert.match(html, /class="ledger-meter" data-account-id="cash-1002"/);
  assert.match(html, /id="ledger-panel"/);
  assert.match(html, /class="ledger-entity" data-entity-id="ent-state-dor"/, 'every entity class present in the journal is drawn, including government');
  assert.doesNotMatch(html, /MOSOFIN:LEDGER_DATA/);
  const svg = canonicalSvg(html);
  assert.doesNotMatch(svg, /data-ledger-overlay|data-ledger-volume|ledger-token|ledger-flow-token/, 'runtime overlays never render into the canonical SVG');
  const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.proof, 'csv');
  assert.equal(payload.period.days.length, 31);
  assert.ok(payload.schedule.length > 0);
  assert.ok(payload.schedule.every((item) => payload.flows.some((flow) => flow.id === item.edgeId)), 'every scheduled token rides an authored flow');
  assert.ok(!('memo' in payload.schedule[0]), 'the viewer payload does not carry memos');
});
