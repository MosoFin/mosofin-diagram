#!/usr/bin/env node
// Generates docs/logos.html — the finance marks the skill ships.
//
// Input: mosofin/renderers/shared/generated-brand-marks.mjs
// Run `npm run build:logos` after changing the catalogue, and commit the result.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { siteFooter, siteFooterStyles } from './site-footer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const skillRoot = path.join(repoRoot, 'mosofin');
const outputPath = path.join(repoRoot, 'docs', 'logos.html');

const { BRAND_MARKS } = await import(pathToFileURL(path.join(skillRoot, 'renderers/shared/generated-brand-marks.mjs')).href);
const packageJson = JSON.parse(fs.readFileSync(path.join(skillRoot, 'package.json'), 'utf8'));

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

// Business first: this skill maps how a business runs, so a controller's stack leads
// and the engineering catalogue follows as a secondary section.
const CATEGORY_LABEL = {
  books: 'Books & ERP',
  payments: 'Payments',
  banking: 'Banking & treasury',
  people: 'Payroll & people',
  commerce: 'Commerce & sales',
  logistics: 'Logistics & fulfilment',
  operations: 'Operations & CRM',
  business: 'Other business',
  data: 'Data',
  engineering: 'Engineering',
  cloud: 'Cloud',
  ai: 'AI',
  framework: 'Frameworks',
  collaboration: 'Collaboration',
  channel: 'Channels',
  language: 'Languages',
};
// Everything above this line is the business stack. Marks outside it (engineering, cloud,
// frameworks, languages…) still ship inside the skill and still render in logo mode — several
// shipped examples use them — but this page is the finance catalogue and does not list them.
const BUSINESS_CATEGORIES = ['books', 'payments', 'banking', 'people', 'commerce', 'logistics', 'operations', 'business'];

// The plate the viewer draws around every mark, reproduced here at a readable size.
function plate(mark, size = 44) {
  const inset = Math.round(size * 0.18 * 10) / 10;
  const art = size - inset * 2;
  const scale = Math.round((art / mark.viewBox) * 10000) / 10000;
  const radius = Math.round(size * 0.24 * 10) / 10;
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(mark.title)}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/>
      <path d="${esc(mark.path)}" transform="translate(${inset} ${inset}) scale(${scale})" fill="#${esc(mark.hex)}"/>
      <rect width="${size}" height="${size}" rx="${radius}" fill="none" stroke="#e4e6ea" stroke-width="1"/>
    </svg>`;
}

const marks = [...BRAND_MARKS].sort((a, b) => a.title.localeCompare(b.title));
const byCategory = new Map();
for (const mark of marks) {
  if (!byCategory.has(mark.category)) byCategory.set(mark.category, []);
  byCategory.get(mark.category).push(mark);
}
const ORDER = Object.keys(CATEGORY_LABEL);
const categories = [...byCategory.keys()].sort((a, b) => {
  const ia = ORDER.indexOf(a); const ib = ORDER.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
});
const businessCategories = categories.filter((c) => BUSINESS_CATEGORIES.includes(c));
const businessMarks = businessCategories.flatMap((c) => byCategory.get(c));
const businessCount = businessMarks.length;

const ISSUE_URL = 'https://github.com/MosoFin/mosofin-diagram/issues/new?template=logo-request.yml&title=%5BLogo%5D%3A+';

const renderCategory = (category) => `
        <section class="cat" data-category="${esc(category)}">
          <h3>${esc(CATEGORY_LABEL[category] || category)} <span>${byCategory.get(category).length}</span></h3>
          <div class="grid">
${byCategory.get(category).map((mark) => `            <figure class="mark" data-name="${esc(`${mark.title} ${mark.id} ${(mark.aliases || []).join(' ')} ${(mark.domains || []).join(' ')}`.toLowerCase())}">
              ${plate(mark)}
              <figcaption>
                <b>${esc(mark.title)}</b>
                <code>${esc(mark.id)}</code>
              </figcaption>
            </figure>`).join('\n')}
          </div>
        </section>`;
const businessCards = businessCategories.map(renderCategory).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="mosofin logos ${esc(packageJson.version)}">
  <title>MosoFin-diagram — Logo Catalogue</title>
  <meta name="description" content="Financial software logos the MosoFin-diagram skill can draw on a node — ledgers, processors, banks, and payroll.">
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" type="image/png" href="assets/mosofin-mark.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper:#ffffff; --paper-2:#f5f6f8; --ink:#0a0b0d; --ink-soft:#333333;
      --muted:#717884; --dim:#9aa0ab; --line:#e4e6ea; --line-hi:#d4d7dd;
      --accent:#11cc39; --accent-deep:#0bb330; --accent-soft:#e9fbee; --accent-ink:#063e16;
      --font-body:'Onest',system-ui,-apple-system,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',Helvetica,Arial,sans-serif;
      --font-mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
      --ease-out:cubic-bezier(.22,1,.36,1);
    }
    *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:var(--font-body); font-size:16px; line-height:1.6; background:var(--paper); color:var(--ink-soft); -webkit-font-smoothing:antialiased; }
    a { color:inherit; }
    :focus-visible { outline:2px solid var(--accent); outline-offset:3px; border-radius:4px; }

    nav { position:sticky; top:0; z-index:50; height:72px; display:flex; align-items:center; background:rgba(255,255,255,.92); backdrop-filter:blur(16px); border-bottom:1px solid var(--line); }
    .nav-inner { width:min(1180px,calc(100% - 48px)); margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; }
    .nav-brand-wrapper { display:inline-flex; align-items:center; min-height:44px; gap:10px; text-decoration:none; }
    .nav-logo-container { display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
    .nav-logo { width:36px; height:36px; display:block; }
    .nav-brand-title { white-space:nowrap; font:600 1.125rem/1.2 var(--font-body); color:var(--ink); }
    .nav-brand-suffix { display:none; }
    .nav-right { display:flex; align-items:center; gap:1.5rem; }
    .nav-link { font-size:.9375rem; font-weight:500; color:var(--muted); text-decoration:none; }
    .nav-link:hover { color:var(--ink); }
    .btn { display:inline-flex; align-items:center; gap:.4rem; min-height:44px; padding:.7rem 1.2rem; border-radius:8px; font-size:.9375rem; font-weight:600; text-decoration:none; white-space:nowrap; border:1px solid var(--ink); background:var(--ink); color:#fff; }
    .btn:hover { background:#1c1f24; }

    .wrap { width:min(1180px,calc(100% - 48px)); margin:0 auto; }
    header.page { padding:3.5rem 0 2rem; }
    .eyebrow { font-family:var(--font-mono); font-size:.625rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); margin-bottom:1rem; }
    h1 { font-size:clamp(2rem,3.6vw,2.75rem); font-weight:700; letter-spacing:-.03em; line-height:1.1; color:var(--ink); margin-bottom:.75rem; }
    header.page p { font-size:1rem; color:var(--muted); max-width:62ch; }
    .counts { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:1.5rem; }
    .count { padding:.5rem .9rem; border:1px solid var(--line); border-radius:999px; font-size:.8125rem; }
    .count b { color:var(--ink); font-weight:700; }

    .tools { position:sticky; top:72px; z-index:40; display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; padding:1rem 0; background:var(--paper); border-bottom:1px solid var(--line); }
    #search { flex:1; min-width:220px; padding:.7rem .9rem; border:1px solid var(--line-hi); border-radius:8px; font:inherit; font-size:.9375rem; }
    #search:focus { border-color:var(--accent); outline:none; }
    .hint { font-family:var(--font-mono); font-size:.6875rem; color:var(--dim); }

    .band { padding:2.5rem 0 .25rem; }
    .band-title { font-size:1.375rem; font-weight:700; letter-spacing:-.02em; color:var(--ink); }
    .band-note { font-size:.9375rem; color:var(--muted); max-width:64ch; margin-top:.35rem; }
    #marks { padding-bottom:3.5rem; }
    section.cat { padding:2rem 0 .5rem; }
    section.cat h3 { font-size:1rem; font-weight:700; color:var(--ink); margin-bottom:1rem; display:flex; align-items:center; gap:.6rem; }
    section.cat h3 span { font-family:var(--font-mono); font-size:.6875rem; font-weight:500; color:var(--muted); padding:.15rem .5rem; border:1px solid var(--line); border-radius:999px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:.75rem; }
    .mark { display:flex; align-items:center; gap:.75rem; padding:.7rem .8rem; border:1px solid var(--line); border-radius:10px; background:var(--paper); }
    .mark svg { flex-shrink:0; }
    .mark figcaption { min-width:0; }
    .mark b { display:block; font-size:.8125rem; font-weight:600; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .mark code { display:block; font-family:var(--font-mono); font-size:.625rem; color:var(--dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .empty { display:none; padding:2.5rem 0 4rem; color:var(--muted); }

    footer { border-top:1px solid var(--line); background:var(--paper-2); padding:2rem 0; }
    .foot-inner { width:min(1180px,calc(100% - 48px)); margin:0 auto; display:flex; flex-wrap:wrap; gap:1rem; justify-content:space-between; align-items:center; font-size:.8125rem; color:var(--muted); }
    .foot-inner a { color:var(--muted); text-decoration:none; }
    .foot-inner a:hover { color:var(--ink); }

    @media(max-width:640px) {
      nav { height:72px; } .tools { top:72px; }
      .nav-logo-container { width:44px; height:44px; }
      .nav-logo { width:32px; height:32px; }
      .nav-brand-suffix, .nav-right .nav-link { display:none; }
    }
  
${siteFooterStyles()}
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a class="nav-brand-wrapper" href="./" aria-label="MosoFin-diagram home">
        <span class="nav-logo-container"><img class="nav-logo" src="assets/mosofin-mark.png" alt="" width="36" height="36"></span>
        <span class="nav-brand-title">MosoFin-diagram</span>
      </a>
      <div class="nav-right">
        <a class="nav-link" href="guide.html">How it works</a>
        <a class="nav-link" href="gallery.html">Examples</a>
        <a class="nav-link" href="start.html">Get started</a>
        <a class="btn" href="${esc(ISSUE_URL)}" target="_blank" rel="noopener">Request a logo</a>
      </div>
    </div>
  </nav>

  <header class="page">
    <div class="wrap">
      <div class="eyebrow">Finance logo catalogue</div>
      <h1>The financial logos the skill can draw.</h1>
      <p>In logo mode a node is drawn as its software mark instead of a labelled box. These ${businessCount} marks are the systems a money map actually names — the ledger, the processor, the bank, payroll, the storefront, the 3PL. All of them ship inside the skill: no network call, no account. A node whose software is not here keeps its role glyph rather than borrowing someone else's logo.</p>
      <div class="counts">
        <span class="count"><b>${businessCount}</b> business &amp; finance marks</span>
        <span class="count">v${esc(packageJson.version)}</span>
      </div>
    </div>
  </header>

  <div class="wrap">
    <div class="tools">
      <input id="search" type="search" placeholder="Search a logo — name, id, alias or domain" aria-label="Search logos" autocomplete="off">
      <span class="hint" id="result-count">${businessCount} of ${businessCount}</span>
    </div>

    <div id="marks">
      <div class="band">
        <h2 class="band-title">Finance systems</h2>
        <p class="band-note">Books, payments, banking, payroll, commerce and fulfilment — the stack a controller can sign off on.</p>
      </div>
${businessCards}
    </div>
    <p class="empty" id="empty">No logo matches that search. If your software is missing, <a href="${esc(ISSUE_URL)}" target="_blank" rel="noopener">request it</a>.</p>
  </div>

  ${siteFooter({ version: packageJson.version, page: 'logos' })}

  <script>
  (function () {
    var search = document.getElementById('search');
    var counter = document.getElementById('result-count');
    var empty = document.getElementById('empty');
    var marks = [].slice.call(document.querySelectorAll('.mark'));
    var cats = [].slice.call(document.querySelectorAll('section.cat'));
    var total = marks.length;

    function apply() {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      marks.forEach(function (mark) {
        var hit = !q || mark.dataset.name.indexOf(q) !== -1;
        mark.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      // Hide a category heading once every mark under it is filtered out.
      cats.forEach(function (cat) {
        var any = [].slice.call(cat.querySelectorAll('.mark')).some(function (m) { return m.style.display !== 'none'; });
        cat.style.display = any ? '' : 'none';
      });
      counter.textContent = shown + ' of ' + total;
      empty.style.display = shown ? 'none' : 'block';
    }

    search.addEventListener('input', apply);
    // Deep link: /logos.html?q=quickbooks
    try {
      var initial = new URLSearchParams(window.location.search).get('q');
      if (initial) { search.value = initial; apply(); }
    } catch (_) {}
  })();
  </script>
</body>
</html>
`;

fs.writeFileSync(outputPath, html);
console.log(`logos ${businessCount} finance marks`);
console.log(outputPath);
