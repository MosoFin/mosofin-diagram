import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(skillRoot, '..');
const docsRoot = path.join(repoRoot, 'docs');
const landing = fs.readFileSync(path.join(docsRoot, 'index.html'), 'utf8');

// Every screenshot the landing page shows must be a real delivered artifact
// checked into the repo — the page claims "every image is a real delivered
// artifact", so a missing file would make the page lie.
const sampleImages = [
  'business-operating-map.dark.png',
  'northline-close.dark.png',
  'northline-order-path.dark.png',
  'northline-revenue-walk.dark.png',
  'northline-dispute.dark.png',
  'northline-gl-2026-07.dark.png',
];

test('landing metadata describes the full technical-diagram product and trusted hero promise', () => {
  assert.match(landing, /<title>MosoFin-diagram — Free, Open-Source Business Diagram Skill<\/title>/);
  assert.match(landing, /<meta property="og:title" content="MosoFin-diagram — Free, Open-Source Business Diagram Skill">/);
  assert.match(landing, /A free, MIT-licensed agent skill for Cursor, Claude Code, Codex CLI, and OpenCode/);
  assert.match(landing, /See how your business actually runs/);
});

test('landing ships no design-tool scaffolding', () => {
  // The page is authored in Claude Design and compiled here. None of the
  // preview runtime may reach production: support.js is a 69KB harness and
  // the template syntax does nothing without it.
  for (const artifact of ['<x-dc', '<sc-for', 'support.js', 'style-hover=', 'data-screen-label', 'DCLogic']) {
    assert.ok(!landing.includes(artifact), `${artifact}: design-tool scaffolding must not ship`);
  }
  assert.doesNotMatch(landing, /\{\{[^}]*\}\}/, 'unresolved template expression');
});

test('landing how-it-works is four numbered steps', () => {
  assert.match(landing, /Four steps from install to a diagram you can forward\./);
  for (const heading of ['Add the skill', 'Describe the business', 'Ask one question', 'Share the map']) {
    assert.ok(landing.includes(heading), `${heading}: step heading missing`);
  }
});

test('landing switchers are static and reference only real artifacts', () => {
  assert.equal((landing.match(/class="demo-tab"/g) || []).length, 3);
  assert.equal((landing.match(/class="type-row"/g) || []).length, 6);
  assert.equal((landing.match(/class="agent-tab"/g) || []).length, 4);
  // Tabs are real buttons with selection state, so the switcher is reachable
  // by keyboard and announced to assistive tech.
  assert.equal((landing.match(/role="tab"/g) || []).length, 13);
  // One selected tab per switcher in the markup. CSS selectors also contain the
  // attribute, so count only where it appears on a button.
  assert.equal((landing.match(/role="tab" aria-selected="true"/g) || []).length, 3);

  for (const image of sampleImages) {
    assert.ok(landing.includes(`samples/images/${image}`), `${image}: not referenced`);
    assert.ok(
      fs.existsSync(path.join(docsRoot, 'samples', 'images', image)),
      `${image}: referenced by the landing page but missing from docs/samples/images`,
    );
  }
});

test('landing install commands match the supported agent switcher exactly', () => {
  for (const agent of ['claude-code', 'cursor', 'codex', 'opencode']) {
    const command = `npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent ${agent} --global --copy --yes`;
    const count = (landing.match(new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    // The default agent appears twice by necessity: once as the rendered
    // terminal line and once in the switcher data that replaces it.
    assert.equal(count, agent === 'claude-code' ? 2 : 1, `${agent}: unexpected install-command count`);
  }
});

test('landing keeps the Raven manual-ZIP boundary and referral attribution', () => {
  assert.match(landing, /manual ZIP/);
  assert.match(landing, /~\/\.raven\/workspace\/skills\/mosofin/);
  assert.match(landing, /yields/);
  assert.match(landing, /utm_source=diagram\.mosofin\.com/);
});
