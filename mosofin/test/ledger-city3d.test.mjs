import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cityHealthColor, cityAccountHealth } from '../renderers/ledger/city.mjs';
import { viewerPayload, summarize } from '../renderers/shared/ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const cityFixture = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'northline-gl-2026-07.city.ledger.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-city3d-'));

function render(example, name) {
  const output = path.join(tmp, name);
  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers/ledger/render-ledger.mjs'),
    path.join(skillRoot, 'examples', example),
    output,
  ], { stdio: 'pipe' });
  return fs.readFileSync(output, 'utf8');
}

test('cityHealthColor maps authored scores red→green and unknown grey', () => {
  assert.equal(cityHealthColor(null).unknown, true);
  assert.equal(cityHealthColor(undefined).css, 'rgb(148, 163, 184)');
  assert.equal(cityHealthColor(1).css, 'rgb(22, 163, 74)');
  assert.equal(cityHealthColor(0).css, 'rgb(220, 38, 38)');
  const mid = cityHealthColor(0.5);
  assert.equal(mid.unknown, false);
  assert.equal(mid.css, 'rgb(220, 179, 8)');
});

test('vendor three bundle and OrbitControls are present for City 3D', () => {
  const vendor = path.join(skillRoot, 'assets/vendor');
  assert.ok(fs.existsSync(path.join(vendor, 'three.module.min.js')));
  assert.ok(fs.existsSync(path.join(vendor, 'OrbitControls.js')));
  assert.ok(fs.existsSync(path.join(vendor, 'city3d.bundle.min.js')));
  assert.ok(fs.existsSync(path.join(vendor, 'city3d-entry.mjs')));
  const bundle = fs.readFileSync(path.join(vendor, 'city3d.bundle.min.js'), 'utf8');
  assert.match(bundle, /MosofinCity3D/);
  assert.match(bundle, /createCity3D/);
});

test('city render injects Mosofin.city3d module, Iso|3D toggle, and vendor bundle', () => {
  const html = render('northline-gl-2026-07.city.ledger.json', 'city3d.html');
  assert.match(html, /data-ledger-view="city"/);
  assert.match(html, /Mosofin\.city3d/);
  assert.match(html, /data-ledger-city-mode-toggle/);
  assert.match(html, /data-ledger-city-mode="iso"/);
  assert.match(html, /data-ledger-city-mode="3d"/);
  assert.match(html, /id="mosofin-city3d-vendor"/);
  assert.match(html, /var MosofinCity3D=/);
  // Iso default: pressed on iso in markup
  assert.match(html, /data-ledger-city-mode="iso"[^>]*aria-pressed="true"/);
  const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.view, 'city');
  assert.ok(payload.city);
  assert.ok(payload.city.health);
  assert.equal(payload.city.health['cash-1002'], 1);
  assert.ok(Object.keys(payload.city.health).some((id) => /sales/i.test(id)));
});

test('map render stays free of City 3D vendor and mode toggle', () => {
  const html = render('northline-gl-2026-07.ledger.json', 'map-no3d.html');
  assert.match(html, /data-ledger-view="map"/);
  assert.doesNotMatch(html, /id="mosofin-city3d-vendor"/);
  assert.doesNotMatch(html, /class="ledger-city-mode-toggle"/);
  // Module may still exist in shared template; vendor must not.
  const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.view, 'map');
  assert.equal(payload.city, null);
});

test('viewer payload city health never invents green for quiet accounts', () => {
  const summary = summarize(cityFixture);
  const payload = viewerPayload(cityFixture, summary);
  assert.equal(payload.view, 'city');
  for (const [id, score] of Object.entries(payload.city.health)) {
    if (score === null) continue;
    assert.ok(score >= 0 && score <= 1, id);
  }
  // Quiet / unknown accounts stay null — same rule as cityAccountHealth.
  const quiet = Object.entries(payload.city.health).filter(([, score]) => score === null);
  assert.ok(quiet.length > 0);
  assert.equal(cityAccountHealth('cash-1002', summary).score, 1);
});

// WebGL scene mount is browser-only — skip in CI (no WebGL / no DOM).
test('City 3D WebGL mount skipped without browser WebGL', { skip: 'City 3D WebGL mount requires a browser; CI skips like Chrome-gated tests.' }, () => {
  assert.fail('unreachable');
});
