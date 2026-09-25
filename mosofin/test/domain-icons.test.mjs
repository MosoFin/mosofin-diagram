import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMAIN_ICONS, DOMAIN_ICON_SOURCE } from '../renderers/shared/generated-domain-icons.mjs';
import { findDomainIcon, listDomainIcons } from '../renderers/shared/domain-icons.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const cli = path.join(skillRoot, 'bin/mosofin.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-icons-'));
let sequence = 0;

function example(name) {
  return JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', name), 'utf8'));
}

function render(type, doc) {
  const id = sequence++;
  const input = path.join(tmp, `${id}.json`);
  const output = path.join(tmp, `${id}.html`);
  fs.writeFileSync(input, JSON.stringify(doc));
  const result = spawnSync(process.execPath, [cli, 'render', type, input, output], { encoding: 'utf8' });
  return { ...result, html: result.status === 0 ? fs.readFileSync(output, 'utf8') : '' };
}

function nodeGroup(html, id) {
  const start = html.indexOf(`data-node-id="${id}"`);
  assert.ok(start > 0, `node ${id} missing`);
  const next = html.indexOf('data-node-id="', start + 20);
  return html.slice(start, next > 0 ? next : undefined);
}

test('domain icon catalogue is Lucide geometry only, with unique ids and aliases', () => {
  assert.equal(DOMAIN_ICON_SOURCE.provider, 'Lucide');
  assert.equal(DOMAIN_ICON_SOURCE.license, 'ISC');
  assert.ok(DOMAIN_ICONS.length >= 25);
  const keys = new Set();
  for (const icon of DOMAIN_ICONS) {
    for (const key of [icon.id, ...icon.aliases]) {
      assert.ok(!keys.has(key), `${key} is claimed twice`);
      keys.add(key);
      assert.equal(findDomainIcon(key), icon, `${key} must resolve to ${icon.id}`);
    }
    assert.match(icon.body, /^(<(path|circle|rect|line|polyline|polygon|ellipse) [^<>]*\/>)+$/, `${icon.id} body`);
    assert.doesNotMatch(icon.body, /\b(fill|stroke|style|on[a-z]+)=/, `${icon.id} must carry geometry only`);
  }
  assert.ok(fs.existsSync(path.join(skillRoot, 'domain-icons/LICENSE-lucide.txt')), 'Lucide licence ships with the skill');
  assert.equal(findDomainIcon('3PL').id, 'warehouse');
  assert.equal(findDomainIcon('accounts payable').id, 'spend');
  assert.equal(findDomainIcon('netsuite'), null, 'a product name is never a domain icon');
});

test('icons command lists and filters the catalogue', () => {
  const all = JSON.parse(execFileSync(process.execPath, [cli, 'icons', '--json'], { encoding: 'utf8' }));
  assert.equal(all.ok, true);
  assert.equal(all.count, DOMAIN_ICONS.length);
  assert.equal(all.source.license, 'ISC');
  const filtered = listDomainIcons('warehouse');
  assert.deepEqual(filtered.map((icon) => icon.id), ['warehouse']);
  assert.match(execFileSync(process.execPath, [cli, 'icons', 'supplier'], { encoding: 'utf8' }), /^supplier\s+Suppliers and vendors/m);
  assert.match(execFileSync(process.execPath, [cli, '--help'], { encoding: 'utf8' }), /mosofin icons \[domain, role, or alias\]/);
});

test('logo mode draws the domain icon where a node has no brand mark', () => {
  const doc = example('business-operating-map.architecture.json');
  const { status, stderr, html } = render('architecture', doc);
  assert.equal(status, 0, stderr);
  for (const [id, icon] of [['suppliers', 'supplier'], ['erp', 'supply-chain'], ['wms', 'warehouse'], ['spend', 'spend']]) {
    const group = nodeGroup(html, id);
    const logoless = group.slice(group.indexOf('class="node-logoless"'));
    assert.match(logoless, new RegExp(`^class="node-logoless"[\\s\\S]*?data-domain-icon="${icon}"`), `${id}: logo-mode icon`);
    assert.doesNotMatch(logoless.split('</g>\n          </g>')[0], /data-semantic-sigil/, `${id}: the icon replaces the role sigil`);
    // Box mode shows the same icon in the corner slot a brand badge would use.
    assert.equal((group.match(new RegExp(`data-domain-icon="${icon}"`, 'g')) || []).length, 2, `${id}: box badge and logo glyph`);
  }
  // Branded nodes keep their logo and never gain a domain icon.
  assert.doesNotMatch(nodeGroup(html, 'commerce'), /data-domain-icon/);
});

test('a brand mark always wins over an authored icon', () => {
  const doc = example('business-operating-map.architecture.json');
  doc.components.find((c) => c.id === 'bank').icon = 'bank';
  const { status, stderr, html } = render('architecture', doc);
  assert.equal(status, 0, stderr);
  const bank = nodeGroup(html, 'bank');
  assert.match(bank, /class="node-logo"/);
  assert.doesNotMatch(bank, /data-domain-icon/);
});

test('an unknown icon fails validation with suggestions instead of falling back', () => {
  const doc = example('business-operating-map.architecture.json');
  doc.components.find((c) => c.id === 'wms').icon = 'warehouses';
  const input = path.join(tmp, 'unknown.json');
  fs.writeFileSync(input, JSON.stringify(doc));
  const result = spawnSync(process.execPath, [cli, 'validate', 'architecture', input, '--json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  const receipt = JSON.parse(result.stdout);
  const diagnostic = receipt.diagnostics.find((d) => d.code === 'icon/unknown');
  assert.ok(diagnostic, result.stdout);
  assert.match(diagnostic.message, /\/components\/\d+\/icon "warehouses" is not a domain icon; closest IDs: warehouse/);
});

test('pillars and foundation blocks accept domain icons', () => {
  const doc = example('northline-operating-pillars.pillars.json');
  doc.meta.node_style = 'logo';
  const { status, stderr, html } = render('pillars', doc);
  assert.equal(status, 0, stderr);
  for (const [id, icon] of [['controller', 'close'], ['entity', 'entity'], ['truth', 'rules']]) {
    assert.match(nodeGroup(html, id), new RegExp(`data-domain-icon="${icon}"`), id);
  }
});

test('icon is rejected on node types that have no logo layer', () => {
  const doc = example('northline-close.workflow.json');
  doc.nodes[0].icon = 'close';
  const input = path.join(tmp, 'workflow-icon.json');
  fs.writeFileSync(input, JSON.stringify(doc));
  const result = spawnSync(process.execPath, [cli, 'validate', 'workflow', input, '--json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /additionalProperty/);
});

process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
