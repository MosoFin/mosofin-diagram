import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(skillRoot, '..');
const pagePath = path.join(repoRoot, 'docs', 'logos.html');
const requestsPath = path.join(skillRoot, 'brand-marks', 'requests.json');

const { BRAND_MARKS } = await import(pathToFileURL(path.join(skillRoot, 'renderers/shared/generated-brand-marks.mjs')).href);
const requestsFile = JSON.parse(fs.readFileSync(requestsPath, 'utf8'));

test('the checked-in logo page matches a fresh build', () => {
  const before = fs.readFileSync(pagePath, 'utf8');
  execFileSync(process.execPath, [path.join(repoRoot, 'scripts', 'build-logos.mjs')], { stdio: ['ignore', 'ignore', 'pipe'] });
  const after = fs.readFileSync(pagePath, 'utf8');
  assert.equal(after, before, 'docs/logos.html is stale — run npm run build:logos and commit the result');
});

const BUSINESS_CATEGORIES = ['books', 'payments', 'banking', 'people', 'commerce', 'logistics', 'operations', 'business'];
const businessMarks = BRAND_MARKS.filter((mark) => BUSINESS_CATEGORIES.includes(mark.category));
const otherMarks = BRAND_MARKS.filter((mark) => !BUSINESS_CATEGORIES.includes(mark.category));

test('every business mark appears on the page exactly once', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  // Count within the catalogue only: a shipped request also names its id in the
  // requests table, which is correct and must not be mistaken for a duplicate card.
  const catalogue = html.slice(html.indexOf('<div id="marks">'), html.indexOf('id="empty"'));
  for (const mark of businessMarks) {
    const cards = (catalogue.match(new RegExp(`<code>${mark.id}</code>`, 'g')) || []).length;
    assert.equal(cards, 1, `${mark.id}: expected exactly one catalogue card`);
  }
  assert.ok(businessMarks.length > 0, 'the page must list business marks');
  assert.match(html, new RegExp(`<b>${businessMarks.length}</b> business &amp; finance marks`));
});

test('this is a finance catalogue: developer tooling is not listed', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const catalogue = html.slice(html.indexOf('<div id="marks">'), html.indexOf('id="empty"'));
  assert.ok(!html.includes('Developer tooling'), 'the developer band must not appear');
  assert.ok(!html.includes('Requested logos'), 'the request table must not appear');
  assert.doesNotMatch(html, /bill-com|netsuite|brex|plaid|rippling/);
  assert.match(html, /The financial logos the skill can draw/);
  assert.match(html, /Finance systems/);
  for (const mark of otherMarks) {
    assert.ok(!catalogue.includes(`<code>${mark.id}</code>`), `${mark.id}: developer marks must not be listed`);
  }
  // The page counts only what it shows, or the search hint contradicts the grid.
  assert.ok(!/marks in total/.test(html), 'the page must not claim a total it does not list');
});

test('delisting is presentation only — every mark still ships in the skill', () => {
  // The page is the finance catalogue, but the skill keeps drawing every mark:
  // shipped example specs reference engineering marks and must keep rendering.
  const catalogPath = path.join(skillRoot, 'brand-marks', 'catalog.json');
  const ids = new Set(JSON.parse(fs.readFileSync(catalogPath, 'utf8')).marks.map((mark) => mark.id));
  for (const id of ['github', 'postgresql', 'docker', 'cloudflare', 'claude']) {
    assert.ok(ids.has(id), `${id}: must remain in the shipped catalogue`);
  }
  assert.ok(otherMarks.length > 0, 'developer marks must still ship even though the page omits them');
});

test('request state is well formed and honest about what shipped', () => {
  assert.equal(requestsFile.schemaVersion, 1);
  const known = new Set(Object.keys(requestsFile.statuses));
  const shipped = new Set(BRAND_MARKS.map((mark) => mark.id));
  const seen = new Set();

  for (const request of requestsFile.requests) {
    assert.match(request.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${request.id}: id must be kebab-case`);
    assert.ok(!seen.has(request.id), `${request.id}: duplicated request`);
    seen.add(request.id);
    assert.ok(known.has(request.status), `${request.id}: unknown status ${request.status}`);
    assert.ok(request.title && request.note, `${request.id}: title and note are required`);
    assert.match(request.updated, /^\d{4}-\d{2}-\d{2}$/, `${request.id}: updated must be an ISO date`);

    // A row may only claim "shipped" when the mark is genuinely in the catalogue,
    // otherwise the page would tell a requester their logo is available when it is not.
    if (request.status === 'shipped') {
      assert.ok(shipped.has(request.id), `${request.id}: marked shipped but absent from the catalogue`);
    }
  }
});

test('the page offers a working request route and parses', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /template=logo-request\.yml/, 'the page must link the issue template');
  assert.ok(fs.existsSync(path.join(repoRoot, '.github/ISSUE_TEMPLATE/logo-request.yml')), 'issue template missing');
  assert.doesNotMatch(html, /Requested logos|requests\.json/);

  const script = html.match(/<script>\n([\s\S]*?)\n {2}<\/script>/);
  assert.ok(script, 'page script block missing');
  assert.doesNotThrow(() => new vm.Script(script[1]), 'page script must parse');
});
