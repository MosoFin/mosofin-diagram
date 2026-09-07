import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-conversation-'));

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

test('three-statements conversation ships statement pane + draft banner + deep links', () => {
  const html = render('northline-three-statements.architecture.json', 'three-conversation.html');
  assert.match(htmlOpenTag(html), /data-presentation="conversation"/);
  assert.match(html, /id="mosofin-statements-data"/);
  assert.match(html, /id="mosofin-draft-data"/);
  assert.match(html, /id="mosofin-verdict-data"/);
  assert.match(html, /id="statement-pane"/);
  assert.match(html, /id="conversation-layer"/);
  assert.match(html, /id="conversation-draft-banner"/);
  assert.match(html, /id="conversation-baseline"/);
  assert.match(html, /id="conversation-draft"/);
  assert.match(html, /Mosofin\.conversation = \(function \(\)/);
  assert.match(html, /searchParams\.set\('line'/);
  assert.match(html, /searchParams\.set\('draft', '1'\)/);
  assert.match(html, /get\('line'\)/);
  assert.match(html, /get\('draft'\) === '1'/);
  assert.match(html, /"income":\[/);
  assert.match(html, /"id":"revenue"/);
  assert.match(html, /~\$24k sample/);
  assert.match(html, /"id":"dtc-plus-10"/);
  assert.match(html, /WHAT-IF/);
  assert.match(html, /Profit vs cash/);
  assert.match(html, /html\[data-draft="1"\] \.conversation-draft-banner/);
  // Ask-first stays available but de-emphasized (optional Ask mode).
  assert.match(html, /id="mosofin-asks-data"/);
  assert.match(html, /id="conversation-ask-mode"/);
  assert.match(html, /enterAskMode/);
});

test('ordinary architecture diagrams stay ungated (no conversation chrome data)', () => {
  const html = render('web-app.architecture.json', 'web-conversation.html');
  assert.doesNotMatch(htmlOpenTag(html), /data-presentation=/);
  assert.doesNotMatch(html, /id="mosofin-statements-data"/);
  assert.doesNotMatch(html, /id="mosofin-draft-data"/);
  assert.match(html, /id="conversation-layer"[^>]*\bhidden\b/);
});

process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
