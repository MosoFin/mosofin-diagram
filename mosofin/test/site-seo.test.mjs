import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const docs = path.join(repoRoot, 'docs');
const SITE = 'https://diagram.mosofin.com';

const PAGES = {
  'index.html': '/',
  'start.html': '/start.html',
  'guide.html': '/guide.html',
  'gallery.html': '/gallery.html',
  'logos.html': '/logos.html',
};

function meta(html, attr, name) {
  return html.match(new RegExp(`<meta ${attr}="${name.replace(/[.:]/g, '\\$&')}" content="([^"]*)"`))?.[1];
}

for (const [file, pathname] of Object.entries(PAGES)) {
  test(`${file}: complete, unique search and social metadata`, () => {
    const html = fs.readFileSync(path.join(docs, file), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = meta(html, 'name', 'description');
    assert.ok(title && title.length >= 20 && title.length <= 70, `${file}: title length ${title?.length}`);
    assert.ok(description && description.length >= 70 && description.length <= 170, `${file}: description length ${description?.length}`);
    assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, `${file}: exactly one canonical`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE}${pathname.replace(/\./g, '\\.')}">`));
    assert.equal(meta(html, 'property', 'og:url'), `${SITE}${pathname}`);
    assert.equal(meta(html, 'property', 'og:title'), title.replace(/&amp;/g, '&').replace(/&/g, '&amp;'));
    assert.equal(meta(html, 'property', 'og:description'), description);
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.match(meta(html, 'property', 'og:image'), /^https:\/\/diagram\.mosofin\.com\/assets\/.+\.png$/);
    assert.ok(meta(html, 'property', 'og:image:alt'), `${file}: og:image:alt`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: one h1`);
    assert.doesNotMatch(html, /<img\b(?![^>]*\balt=)[^>]*>/, `${file}: every image has alt text`);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(ld.length, 1, `${file}: one JSON-LD block`);
    const graph = JSON.parse(ld[0][1])['@graph'];
    assert.ok(graph.some((node) => node['@type'] === 'WebSite'), `${file}: WebSite node`);
    if (file === 'index.html') assert.ok(graph.some((node) => node['@type'] === 'SoftwareApplication'));
    else assert.ok(graph.some((node) => node['@type'] === 'BreadcrumbList'), `${file}: breadcrumb`);
  });
}

test('titles and descriptions are unique across the site', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const file of Object.keys(PAGES)) {
    const html = fs.readFileSync(path.join(docs, file), 'utf8');
    titles.add(html.match(/<title>([^<]+)<\/title>/)[1]);
    descriptions.add(meta(html, 'name', 'description'));
  }
  assert.equal(titles.size, Object.keys(PAGES).length);
  assert.equal(descriptions.size, Object.keys(PAGES).length);
});

test('sitemap lists every page and gallery artifact once, with lastmod, and no duplicates', () => {
  const sitemap = fs.readFileSync(path.join(docs, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => m[1]);
  assert.equal(locs.length, (sitemap.match(/<url>/g) || []).length, 'every URL has a lastmod');
  assert.equal(new Set(locs).size, locs.length, 'no duplicate URLs');
  for (const pathname of Object.values(PAGES)) assert.ok(locs.includes(`${SITE}${pathname}`), pathname);
  const manifest = JSON.parse(fs.readFileSync(path.join(docs, 'gallery/manifest.json'), 'utf8'));
  for (const entry of manifest.entries) {
    assert.ok(locs.includes(`${SITE}/${entry.artifact}`), entry.artifact);
    const stem = path.basename(entry.artifact).replace(/\.[a-z]+\.html$/, '');
    assert.ok(!locs.includes(`${SITE}/samples/${stem}.html`), `${stem}: sample duplicates the gallery artifact`);
  }
  for (const loc of locs) {
    const file = path.join(docs, loc.slice(SITE.length + 1) || 'index.html');
    assert.ok(fs.existsSync(file), `${loc}: listed page does not exist`);
  }
});

test('robots points at the sitemap and keeps the internal handoff copy out of the index', () => {
  const robots = fs.readFileSync(path.join(docs, 'robots.txt'), 'utf8');
  assert.match(robots, /^Sitemap: https:\/\/diagram\.mosofin\.com\/sitemap\.xml$/m);
  assert.match(robots, /^Disallow: \/design-handoff\/$/m);
});

test('every published diagram page carries a meta description', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(docs, 'gallery/manifest.json'), 'utf8'));
  for (const entry of manifest.entries) {
    const html = fs.readFileSync(path.join(docs, entry.artifact), 'utf8');
    const description = meta(html, 'name', 'description');
    assert.ok(description && description.includes('MosoFin-diagram'), `${entry.artifact}: description`);
  }
});
