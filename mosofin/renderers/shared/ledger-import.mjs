// CSV → ledger JSON. Maps journal lines onto an authored account map.
// Unmapped rows are listed, never allocated. Amounts come only from the CSV.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseIsoDate, validateLedger } from './ledger.mjs';

const DEFAULT_COLUMNS = Object.freeze({
  date: 'Date',
  je: 'JE',
  account: 'Account',
  name: 'Name',
  debit: 'Debit',
  credit: 'Credit',
  memo: 'Memo',
});

const SPLIT_POLICIES = new Set(['unmapped']);

/** RFC 4180 CSV parse. Returns { header, rows } where rows are objects keyed by header. */
export function parseCsv(text) {
  const source = String(text ?? '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  let i = 0;
  const pushCell = () => { row.push(cell); cell = ''; };
  const pushRow = () => {
    // A trailing bare newline does not add an empty row.
    if (row.length === 1 && row[0] === '' && rows.length && i >= source.length) {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };
  while (i < source.length) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') { cell += '"'; i += 2; continue; }
        quoted = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') { quoted = true; i += 1; continue; }
    if (ch === ',') { pushCell(); i += 1; continue; }
    if (ch === '\r') {
      pushCell();
      pushRow();
      i += source[i + 1] === '\n' ? 2 : 1;
      continue;
    }
    if (ch === '\n') { pushCell(); pushRow(); i += 1; continue; }
    cell += ch;
    i += 1;
  }
  if (quoted) {
    const err = new Error('CSV parse failed: unterminated quoted field');
    err.code = 'ledger/csv-unparsed';
    throw err;
  }
  if (cell.length || row.length) { pushCell(); pushRow(); }
  if (!rows.length) {
    const err = new Error('CSV parse failed: file is empty');
    err.code = 'ledger/csv-empty';
    throw err;
  }
  const header = rows[0].map((value) => String(value ?? '').trim());
  const body = rows.slice(1).filter((cells) => cells.some((value) => String(value ?? '').trim() !== ''));
  return {
    header,
    rows: body.map((cells) => {
      const record = {};
      header.forEach((name, index) => { record[name] = cells[index] === undefined ? '' : cells[index]; });
      return record;
    }),
  };
}

function columnMap(mapping) {
  return { ...DEFAULT_COLUMNS, ...(mapping.columns || {}) };
}

function resolveAccountId(cell, accountsMap) {
  const raw = String(cell ?? '').trim();
  if (!raw) return null;
  if (accountsMap[raw]) return accountsMap[raw];
  const code = raw.split(/\s+/)[0];
  if (code && accountsMap[code]) return accountsMap[code];
  return null;
}

function flowIndexes(flows) {
  const byPair = new Map();
  for (const flow of flows || []) {
    const key = `${flow.from}>${flow.to}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key).push(flow);
  }
  return byPair;
}

function parseAmount(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const normalized = raw.replace(/,/g, '');
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  return number;
}

function groupJournalEntries(records, columns) {
  const groups = [];
  const byRef = new Map();
  records.forEach((record, index) => {
    const ref = String(record[columns.je] ?? '').trim() || `row-${index + 2}`;
    if (!byRef.has(ref)) {
      const group = { ref, lines: [], firstRow: index + 2 };
      byRef.set(ref, group);
      groups.push(group);
    }
    byRef.get(ref).lines.push({ record, row: index + 2 });
  });
  return groups;
}

function loadBaseDiagram(mapping, mappingPath) {
  if (mapping.diagram && typeof mapping.diagram === 'object') {
    return structuredClone(mapping.diagram);
  }
  const baseRel = mapping.base || mapping.diagram;
  if (typeof baseRel !== 'string' || !baseRel) {
    const err = new Error('mapping.json must name a base ledger diagram via "base" (path) or inline "diagram"');
    err.code = 'ledger/import-mapping';
    throw err;
  }
  const basePath = path.isAbsolute(baseRel)
    ? baseRel
    : path.resolve(mappingPath ? path.dirname(mappingPath) : process.cwd(), baseRel);
  return JSON.parse(fs.readFileSync(basePath, 'utf8'));
}

/**
 * Build a ledger diagram from a GL CSV and a mapping.
 * @returns {{ diagram, report: { mapped, unmapped, rows } }}
 */
export function importLedgerFromCsv({
  csvText,
  csvFileName = 'ledger.csv',
  mapping,
  mappingPath = null,
  strict = false,
} = {}) {
  if (!mapping || typeof mapping !== 'object') {
    const err = new Error('mapping.json is required');
    err.code = 'ledger/import-mapping';
    throw err;
  }
  const splits = mapping.splits || 'unmapped';
  if (!SPLIT_POLICIES.has(splits)) {
    const err = new Error(`mapping.splits must be one of ${[...SPLIT_POLICIES].join(', ')} (allocation is never allowed)`);
    err.code = 'ledger/import-mapping';
    throw err;
  }
  const accountsMap = mapping.accounts || {};
  const entitiesMap = mapping.entities || {};
  const columns = columnMap(mapping);
  const diagram = loadBaseDiagram(mapping, mappingPath);
  if (diagram.diagram_type !== 'ledger') {
    const err = new Error('mapping base diagram must have diagram_type "ledger"');
    err.code = 'ledger/import-mapping';
    throw err;
  }

  const parsed = parseCsv(csvText);
  for (const key of Object.values(columns)) {
    if (!parsed.header.includes(key)) {
      const err = new Error(`CSV is missing required column ${JSON.stringify(key)}`);
      err.code = 'ledger/csv-columns';
      throw err;
    }
  }

  const ledger = diagram.ledger || {};
  const periodStart = parseIsoDate(ledger.period?.start);
  const periodEnd = parseIsoDate(ledger.period?.end);
  const flowsByPair = flowIndexes(diagram.flows);
  const events = [];
  const unmapped = [];
  const seenIds = new Set();

  for (const group of groupJournalEntries(parsed.rows, columns)) {
    const sample = group.lines[0].record;
    const date = String(sample[columns.date] ?? '').trim();
    const name = String(sample[columns.name] ?? '').trim();
    const memo = String(sample[columns.memo] ?? '').trim();
    const entity = name && entitiesMap[name] ? entitiesMap[name] : undefined;
    const dateObj = parseIsoDate(date);
    const inPeriod = dateObj && periodStart && periodEnd ? dateObj >= periodStart && dateObj <= periodEnd : false;

    const lines = [];
    let parseFailed = false;
    for (const { record, row } of group.lines) {
      const debit = parseAmount(record[columns.debit]);
      const credit = parseAmount(record[columns.credit]);
      if (debit === null || credit === null) { parseFailed = true; break; }
      const accountId = resolveAccountId(record[columns.account], accountsMap);
      lines.push({
        row,
        accountCell: String(record[columns.account] ?? '').trim(),
        accountId,
        debit,
        credit,
      });
    }

    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const amount = Number(totalDebit.toFixed(2));

    if (parseFailed) {
      unmapped.push({ date, ref: group.ref, amount, memo, entity, row: group.firstRow, reason: 'unparsed' });
      continue;
    }
    if (!inPeriod) {
      unmapped.push({ date, ref: group.ref, amount, memo, entity, row: group.firstRow, reason: 'out-of-period' });
      continue;
    }
    if (lines.some((line) => !line.accountId)) {
      unmapped.push({ date, ref: group.ref, amount, memo, entity, row: group.firstRow, reason: 'no-rule' });
      continue;
    }
    if (lines.length !== 2) {
      unmapped.push({ date, ref: group.ref, amount, memo, entity, row: group.firstRow, reason: 'split-entry' });
      continue;
    }

    const debitLine = lines.find((line) => line.debit > 0 && line.credit === 0);
    const creditLine = lines.find((line) => line.credit > 0 && line.debit === 0);
    if (!debitLine || !creditLine || lines.some((line) => line.debit > 0 && line.credit > 0)) {
      unmapped.push({ date, ref: group.ref, amount, memo, entity, row: group.firstRow, reason: 'unparsed' });
      continue;
    }

    const forwardKey = `${creditLine.accountId}>${debitLine.accountId}`;
    const reverseKey = `${debitLine.accountId}>${creditLine.accountId}`;
    const forward = flowsByPair.get(forwardKey) || [];
    const reverse = flowsByPair.get(reverseKey) || [];

    let edge = null;
    let kind = 'journal';
    if (forward.length === 1) {
      edge = forward[0].id;
      kind = 'journal';
    } else if (forward.length > 1) {
      unmapped.push({ date, ref: group.ref, amount: debitLine.debit, memo, entity, row: group.firstRow, reason: 'ambiguous-edge' });
      continue;
    } else if (reverse.length === 1) {
      edge = reverse[0].id;
      kind = 'refund';
    } else if (reverse.length > 1) {
      unmapped.push({ date, ref: group.ref, amount: debitLine.debit, memo, entity, row: group.firstRow, reason: 'ambiguous-edge' });
      continue;
    } else {
      unmapped.push({ date, ref: group.ref, amount: debitLine.debit, memo, entity, row: group.firstRow, reason: 'unknown-edge' });
      continue;
    }

    let id = group.ref.toLowerCase();
    if (seenIds.has(id)) id = `${id}-${group.firstRow}`;
    seenIds.add(id);
    const event = {
      id,
      date,
      edge,
      kind,
      amount: Number(debitLine.debit.toFixed(2)),
      ref: group.ref,
      memo,
      row: group.firstRow,
    };
    if (entity) event.entity = entity;
    events.push(event);
  }

  const sha256 = createHash('sha256').update(csvText).digest('hex');
  const source = {
    ...(ledger.source || {}),
    kind: (ledger.source && ledger.source.kind) || 'gl',
    file: path.basename(csvFileName),
    sha256,
    rows: parsed.rows.length,
  };
  if (mapping.source?.system) source.system = mapping.source.system;
  else if (ledger.source?.system) source.system = ledger.source.system;

  diagram.ledger = {
    ...ledger,
    proof: 'csv',
    amounts: ledger.amounts !== false,
    source,
    events,
    unmapped: unmapped.map((row) => {
      const cleaned = { ...row };
      if (cleaned.entity === undefined) delete cleaned.entity;
      return cleaned;
    }),
  };

  validateLedger(diagram);

  const report = {
    rows: parsed.rows.length,
    mapped: events.length,
    unmapped: unmapped.length,
    unmappedRows: unmapped,
  };

  if (strict && unmapped.length) {
    const err = new Error(`ledger import --strict: ${unmapped.length} unmapped journal entr${unmapped.length === 1 ? 'y' : 'ies'}`);
    err.code = 'ledger/import-strict';
    err.report = report;
    err.diagram = diagram;
    throw err;
  }

  return { diagram, report };
}

export function readMappingFile(mappingPath) {
  return JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
}
