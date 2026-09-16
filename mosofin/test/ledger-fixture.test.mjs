import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const csvPath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.csv');
const jsonPath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json');
const csvText = fs.readFileSync(csvPath, 'utf8');
const diagram = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Test-only CSV splitter: enough for the fixture's dialect (quotes only when needed).
function splitCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { cells.push(cell); cell = ''; }
    else cell += ch;
  }
  cells.push(cell);
  return cells;
}
const lines = csvText.trimEnd().split('\n');
const header = splitCsvLine(lines[0]);
const rows = lines.slice(1).map((line) => Object.fromEntries(splitCsvLine(line).map((cell, i) => [header[i], cell])));
const cents = (value) => Math.round(Number(value || 0) * 100);
const accountId = (cell) => {
  const code = cell.split(' ')[0];
  return { 1002: 'cash-1002', 1200: 'ar-1200', 1300: 'inventory-1300', 2000: 'ap-2000', 2200: 'taxpayable-2200', 4000: 'dtc-sales-4000', 4100: 'wholesale-4100', 4900: 'refunds-4900', 5000: 'cogs-5000', 6050: 'fees-6050', 6100: 'shipping-6100', 6200: 'payroll-6200' }[code];
};

test('the Proof: CSV badge is truthful — digest and row count match the shipped file', () => {
  assert.equal(diagram.ledger.proof, 'csv');
  assert.equal(diagram.ledger.source.sha256, createHash('sha256').update(csvText).digest('hex'));
  assert.equal(diagram.ledger.source.rows, rows.length);
});

test('the journal export is balanced and fully accounted for by events plus unmapped rows', () => {
  const debits = rows.reduce((sum, row) => sum + cents(row.Debit), 0);
  const credits = rows.reduce((sum, row) => sum + cents(row.Credit), 0);
  assert.equal(debits, credits, 'double entry: total debits equal total credits');
  const mapped = diagram.ledger.events.reduce((sum, event) => sum + cents(event.amount), 0);
  const unmapped = diagram.ledger.unmapped.reduce((sum, row) => sum + cents(row.amount), 0);
  assert.equal(mapped + unmapped, debits, 'every dollar in the file is either on a flow or listed as unmapped');
});

test('per-account debits in the file equal what the events place on each account', () => {
  const flows = new Map(diagram.flows.map((flow) => [flow.id, flow]));
  const unmappedRefs = new Set(diagram.ledger.unmapped.map((row) => row.ref));
  const fileDebits = {};
  for (const row of rows) {
    if (unmappedRefs.has(row.JE)) continue;
    const id = accountId(row.Account);
    fileDebits[id] = (fileDebits[id] || 0) + cents(row.Debit);
  }
  const eventDebits = {};
  for (const event of diagram.ledger.events) {
    const flow = flows.get(event.edge);
    const debited = event.kind === 'refund' ? flow.from : flow.to;
    eventDebits[debited] = (eventDebits[debited] || 0) + cents(event.amount);
  }
  for (const [id, total] of Object.entries(fileDebits)) {
    if (!total) continue;
    assert.equal(eventDebits[id] || 0, total, `${id}: file debits vs event placement`);
  }
});

test('the fixture renders under showcase and passes every delivery check', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-'));
  const out = path.join(tmp, 'gl.html');
  const validate = execFileSync(process.execPath, [path.join(skillRoot, 'bin/mosofin.mjs'), 'validate', 'ledger', jsonPath, '--quality', 'showcase', '--json'], { encoding: 'utf8' });
  const receipt = JSON.parse(validate);
  assert.equal(receipt.ok, true, validate.slice(0, 800));
  assert.equal(receipt.checks.length, 9, 'a showcase receipt reports all nine artifact checks');
  assert.ok(receipt.checks.every((check) => check.ok));
  execFileSync(process.execPath, [path.join(skillRoot, 'renderers/ledger/render-ledger.mjs'), jsonPath, out], { stdio: 'pipe' });
  const html = fs.readFileSync(out, 'utf8');
  assert.match(html, /data-ledger-tieout="tied"/);
  assert.match(html, /data-ledger-tieout="break"/);
  assert.equal((html.match(/split entry/g) || []).length >= 2, true, 'both payroll splits are listed as unmapped');
  assert.doesNotMatch(html, /Proof: authored/);
});
