import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchema } from '../renderers/shared/validator.mjs';
import { validateLedger } from '../renderers/shared/ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json'), 'utf8'));

function clone() { return JSON.parse(JSON.stringify(fixture)); }
function schemaRejects(mutate, expected) {
  const doc = clone();
  mutate(doc);
  assert.throws(() => validateSchema('ledger', doc), expected);
}
function ledgerRejects(mutate, expected) {
  const doc = clone();
  mutate(doc);
  assert.doesNotThrow(() => validateSchema('ledger', doc), 'mutation must pass the JSON schema so the cross-collection check is what fails');
  assert.throws(() => validateLedger(doc), expected);
}

test('the shipped ledger fixture satisfies the schema and the cross-collection contract', () => {
  assert.doesNotThrow(() => validateSchema('ledger', fixture));
  assert.doesNotThrow(() => validateLedger(fixture));
});

test('proof can only be authored or csv; connected is unrepresentable', () => {
  schemaRejects((doc) => { doc.ledger.proof = 'connected'; }, /proof/);
});

test('a csv proof must name its file, digest and row count', () => {
  ledgerRejects((doc) => { delete doc.ledger.source.sha256; }, /source\/sha256 is required/);
});

test('an event may only travel an authored flow', () => {
  ledgerRejects((doc) => { doc.ledger.events[0].edge = 'no-such-flow'; }, /unknown flow id "no-such-flow"/);
  ledgerRejects((doc) => { delete doc.ledger.events[0].edge; doc.ledger.events[0].from = 'cash-1002'; doc.ledger.events[0].to = 'cogs-5000'; }, /no authored flow runs/);
  ledgerRejects((doc) => {
    doc.flows.push({ id: 'dtc-sale-2', from: 'dtc-sales-4000', to: 'cash-1002', label: 'second rail' });
    delete doc.ledger.events[0].edge;
    doc.ledger.events[0].from = 'dtc-sales-4000';
    doc.ledger.events[0].to = 'cash-1002';
  }, /2 authored flows run/);
});

test('dates must fall inside the period and amounts must match the amounts flag', () => {
  ledgerRejects((doc) => { doc.ledger.events[0].date = '2026-08-01'; }, /outside the ledger period/);
  ledgerRejects((doc) => { doc.ledger.amounts = false; }, /amount is present but ledger.amounts is false/);
  ledgerRejects((doc) => { doc.ledger.events[0].amount = 12.345; }, /more than two decimal places/);
  schemaRejects((doc) => { doc.ledger.period.start = '2026-13-01'; }, /pattern/);
});

test('opening balances and tie-outs must reference real accounts and flows', () => {
  ledgerRejects((doc) => { doc.ledger.opening['nope'] = 1; }, /opening\/nope is not an account id/);
  ledgerRejects((doc) => { doc.ledger.tieouts[0].node = 'nope'; }, /node must be an account id/);
  ledgerRejects((doc) => { doc.ledger.tieouts[0].left = 'dtc-sale'; }, /not both or neither/);
});

test('entities are bounded and the account cap holds', () => {
  ledgerRejects((doc) => { doc.ledger.events[0].entity = 'ent-nope'; }, /unknown entity "ent-nope"/);
  schemaRejects((doc) => {
    for (let i = 0; i < 2; i += 1) doc.accounts.push({ id: `extra-${i}`, label: `Extra ${i}`, class: 'expense', stage: 3, row: 0 });
  }, /accounts/);
  schemaRejects((doc) => { doc.ledger.events[0].surprise = true; }, /additional/i);
  schemaRejects((doc) => { doc.entities[0].class = 'alien'; }, /class/);
});

test('meta.view accepts only map or city and sibling is a path string', () => {
  schemaRejects((doc) => { doc.meta.view = 'isometric'; }, /view/);
  const doc = clone();
  doc.meta.view = 'city';
  doc.meta.sibling = 'ledger-northline-gl.html';
  assert.doesNotThrow(() => validateSchema('ledger', doc));
});
