#!/usr/bin/env node
// Emits the Northline GL fixture: one journal definition produces BOTH the CSV
// export and the ledger events, so the two can never disagree. Re-run after
// editing the journal below; the diagram's source digest is recomputed.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, '..');
const csvPath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.csv');
const jsonPath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json');

const ACCOUNTS = {
  '1002': 'cash-1002', '1200': 'ar-1200', '1300': 'inventory-1300', '2000': 'ap-2000',
  '4000': 'dtc-sales-4000', '4100': 'wholesale-4100', '4900': 'refunds-4900',
  '5000': 'cogs-5000', '6050': 'fees-6050', '6100': 'shipping-6100', '6200': 'payroll-6200',
  '2200': 'taxpayable-2200', // present in the export, deliberately not on the map
};
const ACCOUNT_NAMES = {
  '1002': 'Cash - Chase 1002', '1200': 'Accounts Receivable', '1300': 'Inventory - Green Coffee', '2000': 'Accounts Payable',
  '2200': 'Payroll Taxes Payable', '4000': 'Sales - DTC', '4100': 'Sales - Wholesale', '4900': 'Refunds & Allowances',
  '5000': 'Cost of Goods Sold', '6050': 'Merchant Fees', '6100': 'Shipping & Supplies', '6200': 'Payroll',
};
const ENTITIES = {
  'Shopify DTC customers': 'ent-dtc-customers',
  'Blue Bottle Wholesale': 'ent-bluebottle',
  'Harbor Grocery Co-op': 'ent-harbor',
  'Stripe': 'ent-stripe',
  'Chase Bank': 'ent-chase',
  'Cafe Importadora SA': 'ent-importadora',
  'Uline': 'ent-other-vendors',
  'Pacific Roasting Supply': 'ent-other-vendors',
  'Bay Freight LLC': 'ent-other-vendors',
  'Payroll (7 employees)': 'ent-employees',
  'State Dept. of Revenue': 'ent-state-dor',
};
// Flow lookup by (credit account, debit account) — money direction.
const FLOWS = {
  'dtc-sales-4000>cash-1002': 'dtc-sale',
  'wholesale-4100>ar-1200': 'wholesale-invoice',
  'ar-1200>cash-1002': 'ach-received',
  'cash-1002>refunds-4900': 'refund-paid',
  'cash-1002>fees-6050': 'stripe-fee',
  'cash-1002>ap-2000': 'bill-payment',
  'ap-2000>inventory-1300': 'bill-recorded',
  'inventory-1300>cogs-5000': 'cost-of-goods',
  'cash-1002>payroll-6200': 'payroll-run',
  'cash-1002>shipping-6100': 'shipping-paid',
};

// [date, je, name, memo, lines[[account, debit, credit]]]
const J = [];
let je = 412;
const add = (date, name, memo, lines) => { J.push({ date, je: `JE-${je++}`, name, memo, lines }); };

// DTC sales batches (Shopify → QuickBooks sales receipts)
for (const [day, amt] of [['01', 1842.10], ['03', 1210.55], ['06', 2044.00], ['09', 1568.30], ['13', 1930.75], ['16', 1402.20], ['20', 2215.40], ['23', 1687.90], ['27', 1774.60], ['30', 1998.15]]) {
  add(`2026-07-${day}`, 'Shopify DTC customers', `Shopify sales receipt batch 07/${day}`, [['1002', amt, 0], ['4000', 0, amt]]);
}
// A voided sales receipt: the same flow reversed (Dr Sales, Cr Cash)
add('2026-07-08', 'Shopify DTC customers', 'Void sales receipt #10488 (duplicate)', [['4000', 96.40, 0], ['1002', 0, 96.40]]);
// Stripe fees (Dr Fees, Cr Cash)
for (const [day, amt] of [['02', 58.42], ['09', 71.10], ['16', 66.85], ['23', 74.02], ['30', 63.90]]) {
  add(`2026-07-${day}`, 'Stripe', `Stripe processing fees w/e 07/${day}`, [['6050', amt, 0], ['1002', 0, amt]]);
}
// Customer refunds paid (Dr Refunds & allowances, Cr Cash)
add('2026-07-10', 'Shopify DTC customers', 'Refund order #10502', [['4900', 48.00, 0], ['1002', 0, 48.00]]);
add('2026-07-24', 'Shopify DTC customers', 'Refund order #10611 (damaged)', [['4900', 72.50, 0], ['1002', 0, 72.50]]);
// Wholesale invoices (Dr A/R, Cr Wholesale sales)
add('2026-07-02', 'Blue Bottle Wholesale', 'Invoice 1041 — 60 lb roasted', [['1200', 2400.00, 0], ['4100', 0, 2400.00]]);
add('2026-07-15', 'Harbor Grocery Co-op', 'Invoice 1042 — 24 lb roasted', [['1200', 960.00, 0], ['4100', 0, 960.00]]);
add('2026-07-22', 'Blue Bottle Wholesale', 'Invoice 1043 — 80 lb roasted', [['1200', 3200.00, 0], ['4100', 0, 3200.00]]);
// ACH received (Dr Cash, Cr A/R)
add('2026-07-14', 'Blue Bottle Wholesale', 'ACH 88213 — pays invoice 1041', [['1002', 2400.00, 0], ['1200', 0, 2400.00]]);
add('2026-07-29', 'Harbor Grocery Co-op', 'ACH 88377 — pays invoice 1042', [['1002', 960.00, 0], ['1200', 0, 960.00]]);
// Green coffee bills recorded (Dr Inventory, Cr A/P)
add('2026-07-05', 'Cafe Importadora SA', 'Bill IMP-2207 — 3 bags Huila', [['1300', 4380.00, 0], ['2000', 0, 4380.00]]);
add('2026-07-19', 'Cafe Importadora SA', 'Bill IMP-2231 — 2 bags Sidamo', [['1300', 3120.00, 0], ['2000', 0, 3120.00]]);
// Bill payments (Dr A/P, Cr Cash)
add('2026-07-12', 'Cafe Importadora SA', 'Pay bill IMP-2207', [['2000', 4380.00, 0], ['1002', 0, 4380.00]]);
add('2026-07-28', 'Cafe Importadora SA', 'Pay bill IMP-2231', [['2000', 3120.00, 0], ['1002', 0, 3120.00]]);
// COGS relief (Dr COGS, Cr Inventory)
add('2026-07-15', 'Shopify DTC customers', 'COGS relief — first half July', [['5000', 2910.00, 0], ['1300', 0, 2910.00]]);
add('2026-07-31', 'Shopify DTC customers', 'COGS relief — second half July', [['5000', 3245.00, 0], ['1300', 0, 3245.00]]);
// Shipping & supplies (Dr Shipping, Cr Cash)
add('2026-07-07', 'Uline', 'Boxes and mailers', [['6100', 240.00, 0], ['1002', 0, 240.00]]);
add('2026-07-18', 'Bay Freight LLC', 'LTL to Harbor Grocery', [['6100', 185.00, 0], ['1002', 0, 185.00]]);
add('2026-07-25', 'Pacific Roasting Supply', 'Valve bags', [['6100', 312.40, 0], ['1002', 0, 312.40]]);
// Payroll — deliberately 3-line splits (net pay + withholdings). Not allocated.
add('2026-07-15', 'Payroll (7 employees)', 'Payroll 07/15 — net pay + withholdings', [['6200', 6120.00, 0], ['1002', 0, 4896.00], ['2200', 0, 1224.00]]);
add('2026-07-31', 'Payroll (7 employees)', 'Payroll 07/31 — net pay + withholdings', [['6200', 6120.00, 0], ['1002', 0, 4896.00], ['2200', 0, 1224.00]]);
// Payroll tax remittance — a 2-line entry to an account that is not on the map.
add('2026-07-20', 'State Dept. of Revenue', 'Remit June withholdings', [['2200', 1180.00, 0], ['1002', 0, 1180.00]]);

// ---- CSV ---------------------------------------------------------------
const csvRows = [['Date', 'JE', 'Account', 'Name', 'Debit', 'Credit', 'Memo']];
let rowNumber = 1;
const jeRow = new Map();
for (const entry of J) {
  jeRow.set(entry.je, rowNumber + 1);
  for (const [account, debit, credit] of entry.lines) {
    rowNumber += 1;
    csvRows.push([entry.date, entry.je, `${account} ${ACCOUNT_NAMES[account]}`, entry.name, debit ? debit.toFixed(2) : '', credit ? credit.toFixed(2) : '', entry.memo]);
  }
}
const csvText = csvRows.map((row) => row.map((cell) => /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell).join(',')).join('\n') + '\n';
fs.writeFileSync(csvPath, csvText);
const sha256 = createHash('sha256').update(csvText).digest('hex');
const dataRows = csvRows.length - 1;

// ---- events / unmapped ---------------------------------------------------
const events = [];
const unmapped = [];
for (const entry of J) {
  const entity = ENTITIES[entry.name];
  const total = entry.lines.reduce((sum, [, debit]) => sum + debit, 0);
  if (entry.lines.length !== 2) {
    unmapped.push({ date: entry.date, ref: entry.je, amount: Number(total.toFixed(2)), memo: entry.memo, entity, row: jeRow.get(entry.je), reason: 'split-entry' });
    continue;
  }
  const debitLine = entry.lines.find(([, debit]) => debit > 0);
  const creditLine = entry.lines.find(([, , credit]) => credit > 0);
  const from = ACCOUNTS[creditLine[0]];
  const to = ACCOUNTS[debitLine[0]];
  const forward = FLOWS[`${from}>${to}`];
  const reverse = FLOWS[`${to}>${from}`];
  if (forward) {
    events.push({ id: `${entry.je.toLowerCase()}`, date: entry.date, edge: forward, kind: 'journal', amount: debitLine[1], entity, ref: entry.je, memo: entry.memo, row: jeRow.get(entry.je) });
  } else if (reverse) {
    events.push({ id: `${entry.je.toLowerCase()}`, date: entry.date, edge: reverse, kind: 'refund', amount: debitLine[1], entity, ref: entry.je, memo: entry.memo, row: jeRow.get(entry.je) });
  } else {
    unmapped.push({ date: entry.date, ref: entry.je, amount: Number(total.toFixed(2)), memo: entry.memo, entity, row: jeRow.get(entry.je), reason: 'unknown-edge' });
  }
}

// Cash net movement for the tie-out, computed from the mapped events only —
// the bank statement figure a controller would supply is authored as `expected`.
const cents = (n) => Math.round(n * 100);
let cashNet = 0;
for (const event of events) {
  const flow = Object.entries(FLOWS).find(([, id]) => id === event.edge)[0];
  let [from, to] = flow.split('>');
  if (event.kind === 'refund') [from, to] = [to, from];
  if (to === 'cash-1002') cashNet += cents(event.amount);
  if (from === 'cash-1002') cashNet -= cents(event.amount);
}
let arNet = 0;
for (const event of events) {
  const flow = Object.entries(FLOWS).find(([, id]) => id === event.edge)[0];
  const [from, to] = flow.split('>');
  if (to === 'ar-1200') arNet += cents(event.amount);
  if (from === 'ar-1200') arNet -= cents(event.amount);
}

const diagram = {
  schema_version: 1,
  diagram_type: 'ledger',
  meta: {
    title: 'Northline Coffee — July in the books (GL replay, 2026-07)',
    output: 'northline-gl-2026-07.html',
    viewBox: [1080, 760],
    animation: 'trace',
    quality_profile: 'showcase',
    node_style: 'logo',
    views: [
      { id: 'order-to-cash', label: 'Sales to cash', focus: ['dtc-sales-4000', 'cash-1002', 'fees-6050'], note: 'DTC sales receipts land in cash; Stripe fees leave it as an expense. Wholesale goes through A/R first.' },
      { id: 'cost-side', label: 'Cost side', focus: ['ap-2000', 'inventory-1300', 'cogs-5000'], note: 'Green coffee is billed to A/P, held as inventory, and relieved to COGS as it sells.' },
      { id: 'what-did-not-map', label: 'What did not map', focus: ['cash-1002', 'payroll-6200'], note: 'Payroll is a three-line split (net pay plus withholdings) and is listed as unmapped rather than allocated.' },
    ],
  },
  stages: [
    { label: 'Sales & receivables' },
    { label: 'Cash & contra' },
    { label: 'Owed & held' },
    { label: 'Expenses' },
  ],
  accounts: [
    { id: 'dtc-sales-4000', label: 'Sales — DTC', sublabel: '4000 · Shopify receipts', class: 'revenue', stage: 0, row: 1, tag: 'revenue', brand: 'shopify' },
    { id: 'wholesale-4100', label: 'Sales — Wholesale', sublabel: '4100 · invoiced', class: 'revenue', stage: 0, row: 2 },
    { id: 'ar-1200', label: 'A/R', sublabel: '1200 · wholesale only', class: 'asset', stage: 0, row: 4 },
    { id: 'cash-1002', label: 'Cash 1002', sublabel: 'Chase operating account', class: 'asset', cash: true, stage: 1, row: 1, height: 96, yOffset: -19, tag: 'cash SoT', brand: 'chase' },
    { id: 'refunds-4900', label: 'Refunds & allowances', sublabel: '4900 · contra revenue', class: 'contra', stage: 1, row: 3 },
    { id: 'inventory-1300', label: 'Inventory', sublabel: '1300 · green coffee', class: 'asset', stage: 2, row: 0 },
    { id: 'ap-2000', label: 'A/P', sublabel: '2000 · bills', class: 'liability', stage: 2, row: 1 },
    { id: 'cogs-5000', label: 'COGS', sublabel: '5000', class: 'expense', stage: 3, row: 0 },
    { id: 'fees-6050', label: 'Merchant fees', sublabel: '6050 · Stripe', class: 'expense', stage: 3, row: 2, brand: 'stripe' },
    { id: 'payroll-6200', label: 'Payroll', sublabel: '6200', class: 'expense', stage: 3, row: 3 },
    { id: 'shipping-6100', label: 'Shipping & supplies', sublabel: '6100', class: 'expense', stage: 3, row: 4 },
  ],
  entities: [
    { id: 'ent-dtc-customers', label: 'Shopify DTC customers', class: 'customer', sublabel: 'sales receipts, refunds' },
    { id: 'ent-bluebottle', label: 'Blue Bottle Wholesale', class: 'customer', sublabel: 'invoiced, pays by ACH' },
    { id: 'ent-harbor', label: 'Harbor Grocery Co-op', class: 'customer', sublabel: 'invoiced, pays by ACH' },
    { id: 'ent-importadora', label: 'Cafe Importadora SA', class: 'vendor', sublabel: 'green coffee' },
    { id: 'ent-other-vendors', label: 'Other vendors', class: 'vendor', grouped: 3, sublabel: 'Uline, Pacific Roasting Supply, Bay Freight' },
    { id: 'ent-stripe', label: 'Stripe', class: 'processor', sublabel: 'card processing fees' },
    { id: 'ent-chase', label: 'Chase Bank', class: 'bank', sublabel: 'operating account 1002' },
    { id: 'ent-employees', label: 'Employees', class: 'employee', grouped: 7, sublabel: 'semi-monthly payroll' },
    { id: 'ent-state-dor', label: 'State Dept. of Revenue', class: 'government', sublabel: 'payroll tax withholdings' },
  ],
  flows: [
    { id: 'dtc-sale', from: 'dtc-sales-4000', to: 'cash-1002', label: 'sales receipt', variant: 'emphasis' },
    { id: 'wholesale-invoice', from: 'wholesale-4100', to: 'ar-1200', label: 'invoice', variant: 'dashed', classification: 'accrual', fromSide: 'bottom', toSide: 'top', labelAt: [120, 499] },
    { id: 'ach-received', from: 'ar-1200', to: 'cash-1002', label: 'ACH received', variant: 'emphasis', route: 'vertical-channel', channelX: 262 },
    { id: 'refund-paid', from: 'cash-1002', to: 'refunds-4900', label: 'refund paid', variant: 'security', classification: 'contra', fromSide: 'bottom', toSide: 'top', labelAt: [370, 394] },
    { id: 'bill-payment', from: 'cash-1002', to: 'ap-2000', label: 'bill paid', variant: 'emphasis', route: 'vertical-channel', channelX: 478 },
    { id: 'stripe-fee', from: 'cash-1002', to: 'fees-6050', label: 'processing fee', route: 'vertical-channel', channelX: 490, labelSegment: 2 },
    { id: 'payroll-run', from: 'cash-1002', to: 'payroll-6200', label: 'payroll run', route: 'vertical-channel', channelX: 502, labelSegment: 2 },
    { id: 'shipping-paid', from: 'cash-1002', to: 'shipping-6100', label: 'supplies paid', route: 'vertical-channel', channelX: 514, labelSegment: 2 },
    { id: 'bill-recorded', from: 'ap-2000', to: 'inventory-1300', label: 'bill recorded', variant: 'dashed', classification: 'accrual', fromSide: 'top', toSide: 'bottom', labelAt: [620, 214] },
    { id: 'cost-of-goods', from: 'inventory-1300', to: 'cogs-5000', label: 'relieved to COGS', variant: 'dashed', classification: 'accrual' },
  ],
  ledger: {
    period: { start: '2026-07-01', end: '2026-07-31' },
    currency: 'USD',
    proof: 'csv',
    amounts: true,
    source: { kind: 'gl', system: 'QuickBooks', file: 'northline-gl-2026-07.csv', sha256, rows: dataRows },
    opening: { 'cash-1002': 18240.55 },
    playback: { daysPerSecond: 2 },
    tieouts: [
      // The controller's bank statement shows the same net movement as the mapped GL rows.
      { id: 'cash-vs-statement', label: 'Cash 1002 net movement vs bank statement', node: 'cash-1002', expected: cashNet / 100 },
      // The A/R aging supplied for month-end is $960 lower than the GL: invoice 1043 is
      // not on the aging. Shown as a break, never smoothed over.
      { id: 'ar-vs-aging', label: 'A/R net movement vs aging report', node: 'ar-1200', expected: (arNet - 96000) / 100 },
    ],
    events,
    unmapped,
  },
  cards: [
    { dot: 'emerald', title: 'Source of truth', items: ['Every row: the QuickBooks GL export for 2026-07 (Proof: CSV, digest in the panel)', 'Cash: Chase 1002 · Revenue: QuickBooks P&L', 'Flows run credit → debit; a token is one or more journal lines'] },
    { dot: 'amber', title: 'Guardrails', items: ['Split entries (payroll) are listed as unmapped, never allocated', 'Sales tax accounts are off this map; their rows are shown as unmapped', '“Tied for rows in file” is not a bank reconciliation'] },
    { dot: 'cyan', title: 'Brief', items: ['Entity: Northline Coffee LLC · accrual', 'Audience: controller first', 'Period: 2026-07 · replay at 2 days/s'] },
  ],
};
fs.writeFileSync(jsonPath, `${JSON.stringify(diagram, null, 2)}\n`);
console.log(`csv rows ${dataRows} sha256 ${sha256.slice(0, 12)}… | events ${events.length} unmapped ${unmapped.length} | cash net ${(cashNet / 100).toFixed(2)} | ar net ${(arNet / 100).toFixed(2)}`);
