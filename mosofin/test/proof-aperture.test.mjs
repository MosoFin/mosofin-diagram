import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = fs.readFileSync(path.resolve(__dirname, '..', '..', 'docs', 'index.html'), 'utf8');

// The landing page presents its proof as static captures of real delivered
// artifacts rather than live embeds. These tests hold the boundaries that
// still apply to that presentation: nothing untrusted is framed, the page
// does not fight the reader's scroll, and the layout is ordinary flow.

test('landing hero leads with editorial copy, then the product figure', () => {
  const headline = landing.indexOf('See how your business actually runs');
  const actions = landing.indexOf('Get started', headline);
  const figure = landing.indexOf('id="demo-img"');
  assert.ok(headline > -1 && actions > headline, 'hero copy must precede its actions');
  assert.ok(figure > actions, 'the product figure must follow the hero copy');
});

test('landing frames no untrusted content', () => {
  // If a live artifact is ever embedded again it must stay sandboxed without
  // same-origin access; today the page embeds nothing at all.
  const iframes = landing.match(/<iframe/g) || [];
  for (const _ of iframes) {
    assert.match(landing, /sandbox="allow-scripts"/);
    assert.doesNotMatch(landing, /sandbox="[^"]*allow-same-origin/);
  }
  assert.doesNotMatch(landing, /contentWindow|contentDocument/, 'no parent-frame reach-through');
});

test('landing links to live artifacts rather than reproducing their claims', () => {
  assert.match(landing, /diagram\.mosofin\.com\/gallery\.html/);
  assert.match(landing, /business-operating-map\.architecture\.html\?present=1/);
});

test('page uses normal flow and does not hijack scrolling or motion', () => {
  assert.doesNotMatch(landing, /addEventListener\('scroll'/, 'no scroll handlers');
  assert.doesNotMatch(landing, /height:100vh/, 'no viewport-locked sections');
  assert.doesNotMatch(landing, /position:fixed/, 'no fixed overlays');
  // Only the nav is sticky, and it stays a normal-flow element otherwise.
  assert.equal((landing.match(/position:sticky/g) || []).length, 1);
});

test('landing keeps its interactive controls reachable', () => {
  // Switchers are real buttons, not click-handlers on inert elements.
  assert.doesNotMatch(landing, /<div[^>]*onclick=/i);
  assert.match(landing, /:focus-visible/, 'focus styling must survive the redesign');
  assert.equal((landing.match(/type="button"/g) || []).length, 12);
});
