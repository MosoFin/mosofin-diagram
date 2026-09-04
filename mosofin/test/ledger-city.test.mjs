import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchema } from '../renderers/shared/validator.mjs';
import { validateLedger, viewerPayload, summarize } from '../renderers/shared/ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const cityFixture = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'northline-gl-2026-07.city.ledger.json'), 'utf8'));
const mapFixture = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-city-'));

function render(example, name) {
  const output = path.join(tmp, name);
  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers/ledger/render-ledger.mjs'),
    path.join(skillRoot, 'examples', example),
    output,
  ], { stdio: 'pipe' });
  return fs.readFileSync(output, 'utf8');
}

test('city fixture passes schema and ledger validation with view city', () => {
  assert.equal(cityFixture.meta.view, 'city');
  assert.ok(cityFixture.meta.sibling);
  assert.doesNotThrow(() => validateSchema('ledger', cityFixture));
  assert.doesNotThrow(() => validateLedger(cityFixture));
});

test('map fixture keeps default map semantics and points at the city sibling', () => {
  assert.ok(!mapFixture.meta.view || mapFixture.meta.view === 'map');
  assert.match(mapFixture.meta.sibling || '', /city/);
  assert.doesNotThrow(() => validateSchema('ledger', mapFixture));
});

test('city render emits isometric roads and buildings, not stage frames', () => {
  const html = render('northline-gl-2026-07.city.ledger.json', 'city.html');
  assert.match(html, /data-diagram-kind="ledger"/);
  assert.match(html, /data-ledger-view="city"/);
  assert.match(html, /class="city-road"/);
  assert.match(html, /marker-end="url\(#marker-city\)"/);
  assert.match(html, /data-ledger-building="account"/);
  assert.match(html, /data-ledger-building="entity"/);
  assert.doesNotMatch(html, /data-composition-frame-kind="stage"/);
  assert.doesNotMatch(html, /\bclass="[^"]*\ba-(?:default|emphasis|security|dashed)\b/);
  assert.match(html, /ledger-view-toggle/);
  assert.match(html, /data-ledger-view-target="map"/);
  const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.view, 'city');
  assert.ok(payload.sibling);
  assert.ok(payload.schedule.length > 0);
});

test('map render still emits orthogonal account map and links to city sibling', () => {
  const html = render('northline-gl-2026-07.ledger.json', 'map.html');
  assert.match(html, /data-composition-frame-kind="stage"/);
  assert.match(html, /<svg[^>]*data-ledger-view="map"/);
  assert.doesNotMatch(html, /<svg[^>]*data-ledger-view="city"/);
  assert.match(html, /ledger-view-toggle/);
  assert.match(html, /data-ledger-view-target="city"/);
  const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.view, 'map');
});

test('viewer payload advertises view without inventing amounts', () => {
  const summary = summarize(cityFixture);
  const payload = viewerPayload(cityFixture, summary);
  assert.equal(payload.view, 'city');
  assert.equal(payload.proof, cityFixture.ledger.proof);
  assert.ok(payload.schedule.every((item) => payload.flows.some((flow) => flow.id === item.edgeId)));
});
