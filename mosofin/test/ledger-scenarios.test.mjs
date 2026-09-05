import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchema } from '../renderers/shared/validator.mjs';
import {
  renderLedgerPanel,
  schedule,
  summarize,
  validateLedger,
  viewerPayload,
} from '../renderers/shared/ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json'), 'utf8'));
const template = fs.readFileSync(path.join(skillRoot, 'assets', 'template.html'), 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-scenarios-'));

function clone() { return JSON.parse(JSON.stringify(fixture)); }

function tinyWithScenario(scenarioOverrides = {}) {
  return {
    schema_version: 1,
    diagram_type: 'ledger',
    meta: { title: 't' },
    stages: [{ label: 'a' }, { label: 'b' }],
    accounts: [
      { id: 'sales', label: 'Sales', class: 'revenue', stage: 0, row: 0 },
      { id: 'cash', label: 'Cash', class: 'asset', cash: true, stage: 1, row: 0 },
    ],
    entities: [{ id: 'cust', label: 'Customers', class: 'customer' }],
    flows: [{ id: 'sale', from: 'sales', to: 'cash', label: 'sale' }],
    ledger: {
      period: { start: '2026-07-01', end: '2026-07-03' },
      currency: 'USD',
      proof: 'authored',
      tieouts: [{ id: 'cash-check', label: 'cash', node: 'cash', expected: 10 }],
      events: [
        { id: 'e1', date: '2026-07-01', edge: 'sale', kind: 'journal', amount: 10, entity: 'cust' },
      ],
      scenarios: [{
        id: 'uplift',
        label: '+10% sales (what-if)',
        assumptions: ['WHAT-IF only', 'Sales run 10% higher'],
        events: [
          { id: 'sc1', date: '2026-07-01', edge: 'sale', kind: 'journal', amount: 1, entity: 'cust', memo: 'projected' },
        ],
        ...scenarioOverrides,
      }],
    },
  };
}

test('schema and validateLedger accept the Northline what-if scenario', () => {
  assert.doesNotThrow(() => validateSchema('ledger', fixture));
  assert.doesNotThrow(() => validateLedger(fixture));
  assert.equal(fixture.ledger.scenarios[0].id, 'dtc-plus-10');
  assert.ok(fixture.ledger.scenarios[0].assumptions.some((line) => /WHAT-IF/i.test(line)));
});

test('scenario events must ride authored flows and stay inside the period', () => {
  const badEdge = clone();
  badEdge.ledger.scenarios[0].events[0].edge = 'nope';
  assert.throws(() => validateLedger(badEdge), /unknown flow id "nope"/);
  const badDate = clone();
  badDate.ledger.scenarios[0].events[0].date = '2026-08-01';
  assert.throws(() => validateLedger(badDate), /outside the ledger period/);
});

test('schedule series separates baseline from projected scenario tokens', () => {
  const doc = tinyWithScenario();
  validateLedger(doc);
  const summary = summarize(doc);
  const baseline = schedule(summary);
  const projected = schedule(summary.scenarios[0], { series: 'scenario' });
  assert.deepEqual(baseline.map((item) => [item.series, item.edgeId, item.sum]), [['baseline', 'sale', 1000]]);
  assert.deepEqual(projected.map((item) => [item.series, item.edgeId, item.sum]), [['scenario', 'sale', 100]]);
  assert.equal(summary.totals.events, 1, 'baseline event count ignores scenario rows');
  assert.equal(summary.scenarios[0].totals.events, 1);
  assert.equal(summary.flows.sale.sum, 1000, 'baseline flow sum ignores projected money');
  assert.equal(summary.scenarios[0].flows.sale.sum, 100);
});

test('tie-outs and proof stay baseline-only when scenarios are present', () => {
  const withScenario = summarize(tinyWithScenario());
  const without = summarize(tinyWithScenario());
  without.scenarios = []; // summarize always rebuilds; compare via diagram without scenarios
  const bare = tinyWithScenario();
  delete bare.ledger.scenarios;
  const baselineOnly = summarize(bare);
  assert.equal(withScenario.proof, baselineOnly.proof);
  assert.deepEqual(withScenario.tieouts, baselineOnly.tieouts);
  assert.equal(withScenario.breaks, baselineOnly.breaks);
  assert.equal(withScenario.totals.events, baselineOnly.totals.events);
  assert.equal(withScenario.flows.sale.sum, baselineOnly.flows.sale.sum);
  assert.equal(withScenario.accounts.cash.net, baselineOnly.accounts.cash.net);
});

test('cross-currency scenarios are not comparable and never convert', () => {
  const doc = tinyWithScenario({ currency: 'EUR' });
  validateLedger(doc);
  const summary = summarize(doc);
  assert.equal(summary.scenarios[0].currency, 'EUR');
  assert.equal(summary.scenarios[0].comparable, false);
  assert.equal(summary.currency, 'USD');
  const panel = renderLedgerPanel(doc, summary);
  assert.match(panel, /not comparable/);
  assert.match(panel, /never converted/);
});

test('viewer payload and template carry hollow-token / SCENARIO markers', () => {
  const doc = tinyWithScenario();
  const payload = viewerPayload(doc, summarize(doc));
  assert.equal(payload.schedule.every((item) => item.series === 'baseline'), true);
  assert.equal(payload.scenarios[0].schedule.every((item) => item.series === 'scenario'), true);
  assert.match(template, /data-ledger-series="scenario"/);
  assert.match(template, /ledger-scenario-banner/);
  assert.match(template, /ledger-scenario-banner-mark/);
  assert.match(template, /Baseline schedule only — scenario hollow tokens stay out of WebM/);
  const panel = renderLedgerPanel(doc, summarize(doc));
  assert.match(panel, /id="ledger-scenario"/);
  assert.match(panel, /id="ledger-scenario-banner"/);
  assert.match(panel, /SCENARIO/);
  assert.match(panel, /ledger-scenario-projected/);
  assert.match(panel, /id="ledger-proof"/);
});

test('rendered Northline artifact embeds scenario series without mixing into proof', () => {
  const output = path.join(tmp, 'northline.html');
  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers/ledger/render-ledger.mjs'),
    path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json'),
    output,
  ], { stdio: 'pipe' });
  const html = fs.readFileSync(output, 'utf8');
  const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.proof, 'csv');
  assert.ok(payload.scenarios?.length === 1);
  assert.equal(payload.scenarios[0].id, 'dtc-plus-10');
  assert.ok(payload.scenarios[0].schedule.every((item) => item.series === 'scenario'));
  assert.ok(payload.schedule.every((item) => item.series === 'baseline'));
  assert.match(html, /id="ledger-scenario"/);
  assert.match(html, /ledger-scenario-banner/);
  assert.match(html, /SCENARIO/);
  assert.match(html, /\+10% DTC sales \(what-if\)/);
  assert.match(html, /Proof: CSV/);
});
