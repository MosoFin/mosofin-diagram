import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const cli = path.join(skillRoot, 'bin', 'mosofin.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-node-style-'));

function render(spec, extraMeta) {
  const source = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', spec), 'utf8'));
  if (!Object.hasOwn(extraMeta, 'node_style')) delete source.meta.node_style;
  Object.assign(source.meta, extraMeta);
  const input = path.join(tmp, `${Math.random().toString(36).slice(2)}.json`);
  const output = input.replace(/\.json$/, '.html');
  fs.writeFileSync(input, JSON.stringify(source));
  execFileSync(process.execPath, [cli, 'render', source.diagram_type, input, output], { stdio: ['ignore', 'ignore', 'pipe'] });
  return fs.readFileSync(output, 'utf8');
}

test('node_style defaults to box and never alters the shipped output', () => {
  const plain = render('business-operating-map.architecture.json', {});
  assert.match(plain, /data-node-style="box"/);
  // The default must be byte-identical to explicitly asking for a box.
  const explicit = render('business-operating-map.architecture.json', { node_style: 'box' });
  assert.equal(plain, explicit, 'an explicit box style must match the default output');
});

test('logo mode marks the root and ships both layers in one artifact', () => {
  const html = render('business-operating-map.architecture.json', { node_style: 'logo' });
  assert.match(html, /data-node-style="logo"/);

  // The branded nodes get logo art; the unbranded ones get the quiet outlined box.
  const logos = (html.match(/class="node-logo"/g) || []).length;
  const logoless = (html.match(/class="node-logoless"/g) || []).length;
  assert.ok(logos > 0, 'expected logo art for branded nodes');
  assert.ok(logoless > 0, 'expected a sigil fallback for nodes with no brand mark');

  // The fallback is the node role sigil, never an invented vendor logo.
  assert.match(html, /class="node-logoless"[\s\S]{0,400}?semantic-sigil/, 'logo-less nodes must fall back to their semantic sigil');

  // No logo is ever invented: the count must match the nodes that carry a brand.
  const spec = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples/business-operating-map.architecture.json'), 'utf8'));
  assert.equal(logos + logoless, spec.components.length, 'every node needs exactly one logo-mode layer');

  // Both views live in the same file so a reader can switch without re-rendering.
  assert.match(html, /\[data-node-style="logo"\] svg \.node-logo/);
  assert.match(html, /id="btn-nodestyle"/);
});

test('logo mode leaves geometry, ids and routes untouched', () => {
  const box = render('business-operating-map.architecture.json', {});
  const logo = render('business-operating-map.architecture.json', { node_style: 'logo' });
  const paths = (s) => (s.match(/ d="[^"]+"/g) || []).filter((d) => d.includes('M') && d.length > 24);
  assert.deepEqual(paths(logo), paths(box), 'logo mode must not move a single route');
  const ids = (s) => (s.match(/data-node-id="[^"]+"/g) || []);
  assert.deepEqual(ids(logo), ids(box), 'node identities must be identical in both styles');
});

test('every renderer accepts node_style and an unknown value is rejected', () => {
  for (const [spec, type] of [
    ['business-operating-map.architecture.json', 'architecture'],
    ['northline-close.workflow.json', 'workflow'],
    ['northline-order-path.sequence.json', 'sequence'],
    ['northline-revenue-walk.dataflow.json', 'dataflow'],
    ['northline-dispute.lifecycle.json', 'lifecycle'],
  ]) {
    const html = render(spec, { node_style: 'logo' });
    assert.match(html, /data-node-style="logo"/, type);
  }

  const source = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples/business-operating-map.architecture.json'), 'utf8'));
  source.meta.node_style = 'icons';
  const input = path.join(tmp, 'invalid.json');
  fs.writeFileSync(input, JSON.stringify(source));
  // validate exits non-zero on a rejection, so the throw is the pass condition.
  let receipt = null;
  try {
    execFileSync(process.execPath, [cli, 'validate', 'architecture', input, '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.fail('an unknown node_style must fail schema validation');
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') throw error;
    receipt = JSON.parse(String(error.stdout || '{}'));
  }
  assert.equal(receipt.ok, false);
  assert.match(JSON.stringify(receipt), /node_style/, 'the diagnostic must name the offending field');
});

process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
