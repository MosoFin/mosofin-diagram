import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-articulation-'));

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

function svg(html) {
  return html.match(/<svg\b[\s\S]*?<\/svg>/)?.[0] || '';
}

test('three-statements ask-first keeps Present/Health code paths + health attrs', () => {
  const html = render('northline-three-statements.architecture.json', 'three.html');
  assert.match(htmlOpenTag(html), /data-presentation="ask-first"/);
  assert.match(html, /id="mosofin-health-data"/);
  assert.match(html, /get\('health'\) === '1'/);
  assert.match(html, /get\('present'\) === '1'/);
  assert.match(html, /id="btn-health"/);
  assert.match(html, /id="btn-articulation-walk"/);
  assert.match(html, /Mosofin\.health = \(function \(\)/);
  assert.match(svg(html), /data-arch-health="0\.85"/);
  assert.match(svg(html), /data-node-id="net_income"[^>]*data-arch-health="unknown"/);
  assert.match(html, /url\.searchParams\.set\('health', '1'\)/);
  assert.match(html, /guidedViews\.play\(\)/);
});

test('ordinary architecture diagrams stay ungated (no articulation chrome)', () => {
  const html = render('web-app.architecture.json', 'web.html');
  assert.doesNotMatch(htmlOpenTag(html), /data-presentation=/);
  assert.doesNotMatch(html, /id="mosofin-health-data"/);
  assert.doesNotMatch(svg(html), /data-arch-health=/);
  assert.match(html, /id="btn-present"/);
  assert.match(html, /get\('present'\) === '1'/);
  assert.match(html, /get\('health'\) === '1'/);
  assert.match(html, /id="btn-health"[^>]*\bhidden\b/);
});

process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
