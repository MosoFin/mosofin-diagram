import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCents, periodDays, schedule, summarize, validateLedger } from '../renderers/shared/ledger.mjs';

function tiny(overrides = {}) {
  return {
    schema_version: 1,
    diagram_type: 'ledger',
    meta: { title: 't' },
    stages: [{ label: 'a' }, { label: 'b' }],
    accounts: [
      { id: 'sales', label: 'Sales', class: 'revenue', stage: 0, row: 0 },
      { id: 'cash', label: 'Cash', class: 'asset', cash: true, stage: 1, row: 0 },
      { id: 'fees', label: 'Fees', class: 'expense', stage: 1, row: 1 },
    ],
    entities: [
      { id: 'cust', label: 'Customers', class: 'customer', grouped: 40 },
      { id: 'proc', label: 'Processor', class: 'processor' },
    ],
    flows: [
      { id: 'sale', from: 'sales', to: 'cash', label: 'sale' },
      { id: 'fee', from: 'cash', to: 'fees', label: 'fee' },
    ],
    ledger: {
      period: { start: '2026-07-01', end: '2026-07-03' },
      currency: 'USD',
      proof: 'authored',
      opening: { cash: 100 },
      tieouts: [
        { id: 'cash-vs-bank', label: 'cash vs bank', node: 'cash', expected: 96.5 },
        { id: 'sale-vs-fee', label: 'sale vs fee', left: 'sale', right: 'fee' },
      ],
      events: [
        { id: 'e1', date: '2026-07-01', edge: 'sale', kind: 'journal', amount: 10, entity: 'cust' },
        { id: 'e2', date: '2026-07-01', edge: 'sale', kind: 'journal', amount: 0.1, entity: 'cust' },
        { id: 'e3', date: '2026-07-02', edge: 'sale', kind: 'refund', amount: 4, entity: 'cust' },
        { id: 'e4', date: '2026-07-03', edge: 'fee', kind: 'journal', amount: 9.6, entity: 'proc' },
      ],
      unmapped: [{ date: '2026-07-02', amount: 5, reason: 'split-entry', entity: 'proc' }],
      ...overrides,
    },
  };
}

test('sums, reversals and per-account nets are computed in integer cents', () => {
  const doc = tiny();
  validateLedger(doc);
  const summary = summarize(doc);
  assert.equal(summary.flows.sale.sum, 1010);
  assert.equal(summary.flows.sale.refundSum, 400);
  assert.equal(summary.flows.sale.net, 610);
  assert.equal(summary.accounts.cash.in, 1010);
  assert.equal(summary.accounts.cash.out, 400 + 960);
  assert.equal(summary.accounts.cash.net, -350);
  assert.equal(summary.accounts.cash.opening, 10000);
  assert.equal(summary.accounts.cash.closing, 9650);
  assert.equal(summary.accounts.sales.closing, null, 'no opening means no closing balance is ever shown');
  assert.equal(summary.totals.events, 4);
});

test('tie-outs compare an account against a supplied figure or two flows, and report breaks', () => {
  const summary = summarize(tiny());
  const byId = Object.fromEntries(summary.tieouts.map((t) => [t.id, t]));
  assert.equal(byId['cash-vs-bank'].residual, -350 - 9650);
  assert.equal(byId['cash-vs-bank'].status, 'break');
  assert.equal(byId['sale-vs-fee'].computed, 610);
  assert.equal(byId['sale-vs-fee'].expected, 960);
  assert.equal(byId['sale-vs-fee'].status, 'break');
  const tied = summarize(tiny({ tieouts: [{ id: 'exact', label: 'x', node: 'cash', expected: -3.5 }] }));
  assert.equal(tied.tieouts[0].status, 'tied');
  const tolerant = summarize(tiny({ tieouts: [{ id: 'near', label: 'x', node: 'cash', expected: -3.4, tolerance: 0.1 }] }));
  assert.equal(tolerant.tieouts[0].status, 'tied');
  assert.equal(summary.breaks, 2);
});

test('entities and entity classes accumulate money toward and away from the business', () => {
  const summary = summarize(tiny());
  assert.equal(summary.entities.cust.in, 1010);
  assert.equal(summary.entities.cust.out, 400);
  assert.equal(summary.entities.cust.grouped, 40);
  assert.equal(summary.entities.proc.out, 960);
  assert.equal(summary.entities.proc.unmappedCount, 1);
  assert.equal(summary.classes.customer.net, 610);
  assert.equal(summary.classes.processor.entities, 1);
});

test('unmapped rows are carried through, counted and summed, never allocated', () => {
  const summary = summarize(tiny());
  assert.equal(summary.unmapped.count, 1);
  assert.equal(summary.unmapped.sum, 500);
  assert.equal(summary.unmapped.rows[0].reason, 'split-entry');
  assert.equal(summary.flows.fee.sum, 960, 'the split entry did not leak into any flow');
});

test('the schedule aggregates one token per flow, direction and day', () => {
  const items = schedule(summarize(tiny()));
  assert.deepEqual(items.map((item) => [item.date, item.edgeId, item.direction, item.count, item.sum]), [
    ['2026-07-01', 'sale', 'forward', 2, 1010],
    ['2026-07-02', 'sale', 'reverse', 1, 400],
    ['2026-07-03', 'fee', 'forward', 1, 960],
  ]);
  assert.deepEqual(items[0].entities, ['cust']);
  assert.equal(items[1].from, 'cash', 'a reversal runs the same flow backwards');
  assert.equal(items[1].to, 'sales');
});

test('counts-only ledgers carry no amounts anywhere', () => {
  const doc = tiny({ amounts: false, tieouts: [] });
  doc.ledger.events.forEach((event) => { delete event.amount; });
  delete doc.ledger.unmapped[0].amount;
  validateLedger(doc);
  const summary = summarize(doc);
  assert.equal(summary.amounts, false);
  assert.equal(summary.flows.sale.sum, 0);
  assert.equal(summary.flows.sale.count, 2);
  assert.equal(summary.unmapped.rows[0].cents, null);
});

test('formatting and the day index are deterministic and locale-independent', () => {
  assert.equal(formatCents(184210, 'USD'), '$1,842.10');
  assert.equal(formatCents(-5, 'USD'), '−$0.05');
  assert.equal(formatCents(123456789, 'CHF'), 'CHF 1,234,567.89');
  assert.deepEqual(periodDays({ start: '2026-02-27', end: '2026-03-02' }), ['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']);
  assert.deepEqual(periodDays({ start: '2026-07-02', end: '2026-07-01' }), []);
  const a = JSON.stringify(summarize(tiny()));
  const b = JSON.stringify(summarize(tiny()));
  assert.equal(a, b);
});
