import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importLedgerFromCsv, parseCsv, readMappingFile } from '../renderers/shared/ledger-import.mjs';
import { summarize, validateLedger } from '../renderers/shared/ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const csvPath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.csv');
const mapPath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.mapping.json');
const fixturePath = path.join(skillRoot, 'examples', 'northline-gl-2026-07.ledger.json');
const cli = path.join(skillRoot, 'bin/mosofin.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-import-'));

test('parseCsv keeps quoted commas and escaped quotes (RFC 4180)', () => {
  const { header, rows } = parseCsv('Date,Memo\n2026-07-01,"a, b ""c"""\n');
  assert.deepEqual(header, ['Date', 'Memo']);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Memo, 'a, b "c"');
});

test('Northline CSV + mapping regenerates the shipped fixture events and unmapped rows', () => {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const mapping = readMappingFile(mapPath);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const { diagram, report } = importLedgerFromCsv({
    csvText,
    csvFileName: path.basename(csvPath),
    mapping,
    mappingPath: mapPath,
  });
  assert.equal(report.mapped, fixture.ledger.events.length);
  assert.equal(report.unmapped, fixture.ledger.unmapped.length);
  assert.equal(diagram.ledger.source.sha256, createHash('sha256').update(csvText).digest('hex'));
  assert.equal(diagram.ledger.source.rows, fixture.ledger.source.rows);
  assert.deepEqual(
    diagram.ledger.events.map((event) => ({ ...event })),
    fixture.ledger.events.map((event) => ({ ...event })),
  );
  assert.deepEqual(
    diagram.ledger.unmapped.map((row) => ({ ...row })),
    fixture.ledger.unmapped.map((row) => ({ ...row })),
  );
  validateLedger(diagram);
  const summary = summarize(diagram);
  assert.equal(summary.totals.events, fixture.ledger.events.length);
  assert.ok(summary.dayTotals.length === 31);
  assert.ok(summary.dayTotals.some((day) => day.count > 0 && day.sum > 0));
});

test('--strict fails when anything is unmapped and default lists the unmapped rows', () => {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const mapping = readMappingFile(mapPath);
  assert.throws(
    () => importLedgerFromCsv({ csvText, csvFileName: 'northline.csv', mapping, mappingPath: mapPath, strict: true }),
    (error) => error && error.code === 'ledger/import-strict' && error.report.unmapped === 3,
  );

  const out = path.join(tmp, 'from-cli.ledger.json');
  const result = spawnSync(process.execPath, [cli, 'ledger', 'import', csvPath, '--map', mapPath, '--out', out], {
    cwd: skillRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /unmapped 3/);
  assert.match(result.stderr, /JE-444 split-entry/);
  assert.ok(fs.existsSync(out));

  const strict = spawnSync(process.execPath, [cli, 'ledger', 'import', csvPath, '--map', mapPath, '--strict', '--out', path.join(tmp, 'strict.ledger.json')], {
    cwd: skillRoot,
    encoding: 'utf8',
  });
  assert.equal(strict.status, 1);
  assert.match(strict.stderr, /--strict/);
});

test('help lists ledger import', () => {
  const result = spawnSync(process.execPath, [cli, '--help'], { cwd: skillRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /mosofin ledger import <csv> --map mapping\.json/);
});
