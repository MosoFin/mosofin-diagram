import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ask-first-'));

function render(example, outputName) {
  const output = path.join(tmp, outputName);
  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers/architecture/render-architecture.mjs'),
    path.join(skillRoot, 'examples', example),
    output,
  ]);
  return fs.readFileSync(output, 'utf8');
}

function htmlOpenTag(html) {
  return html.match(/<html\b[^>]*>/)?.[0] || '';
}

test('three-statements ask-first ships asks markup + URL contract', () => {
  const html = render('northline-three-statements.architecture.json', 'three-ask.html');
  assert.match(htmlOpenTag(html), /data-presentation="ask-first"/);
  assert.match(html, /id="mosofin-asks-data"/);
  assert.match(html, /id="ask-first-panel"/);
  assert.match(html, /id="ask-first-see-map"/);
  assert.match(html, /Mosofin\.asks = \(function \(\)/);
  assert.match(html, /searchParams\.set\('ask'/);
  assert.match(html, /get\('ask'\)/);
  assert.match(html, /"id":"earn"/);
  assert.match(html, /"id":"position"/);
  assert.match(html, /"id":"cash"/);
  assert.match(html, /"id":"quality"/);
  assert.match(html, /Did we earn\?/);
  assert.match(html, /Did cash show up\?/);
  assert.match(html, /"metric":"Sales ~\$24k"/);
  assert.match(html, /"metricLabel":"sample · GL"/);
  assert.match(html, /"status":"watch"/);
  assert.match(html, /"metric":"NI ≠ CFO when WC moves"/);
  assert.match(html, /id="ask-perf-strip"/);
  assert.match(html, /ask-card-metric/);
  assert.match(html, /fillPerfStrip/);
  // Present/Health remain in DOM/code paths but are hidden for ask-first.
  assert.match(html, /id="btn-present"/);
  assert.match(html, /id="btn-health"/);
  assert.match(html, /data-presentation="ask-first"[^>]*>[\s\S]*#btn-present/);
  assert.match(html, /id="mosofin-health-data"/);
});

test('ordinary architecture diagrams stay ungated (no ask-first chrome)', () => {
  const html = render('web-app.architecture.json', 'web-ask.html');
  assert.doesNotMatch(htmlOpenTag(html), /data-presentation=/);
  assert.doesNotMatch(html, /id="mosofin-asks-data"/);
  assert.match(html, /id="ask-first-panel"[^>]*\bhidden\b/);
});

process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
