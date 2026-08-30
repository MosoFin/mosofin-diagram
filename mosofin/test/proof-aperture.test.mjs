import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = fs.readFileSync(path.resolve(__dirname, '..', '..', 'docs', 'index.html'), 'utf8');

function cssRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = landing.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  assert.ok(match, `${selector}: CSS rule missing`);
  return match[1];
}

test('landing hero is editorial copy, then a product figure — not an Archify first-fold bento', () => {
  assert.match(landing, /<section class="hero">/);
  assert.match(landing, /data-proof-aperture="product-figure"/);
  const heroStart = landing.indexOf('<section class="hero">');
  const headline = landing.indexOf('data-i18n="hero-h1"', heroStart);
  const actions = landing.indexOf('class="hero-actions"', headline);
  const heroEnd = landing.indexOf('</section>', actions);
  const proof = landing.indexOf('id="hero-proof-stage"', heroEnd);
  assert.ok(heroStart < headline && headline < actions && actions < heroEnd && heroEnd < proof);
  assert.doesNotMatch(landing, /hero-bento|proof-rail|types-bento|features-bento|section-label::before/);
  assert.doesNotMatch(landing, />(?:T|D|S)·0\d</);
});

test('desktop hero is a single reading column; the live diagram sits in its own figure', () => {
  assert.match(cssRule('.hero'), /padding:6\.5rem 0 4\.5rem/);
  assert.match(cssRule('.hero-inner'), /max-width:40rem/);
  assert.match(cssRule('.demo-frame'), /min-height:520px/);
  assert.match(cssRule('.hero-actions'), /display:flex/);
  assert.doesNotMatch(landing, /\.hero-bento|\.proof-main|\.proof-viewport|\.proof-rail/);
});

test('narrow viewport stacks the editorial page without a separate mobile product surface', () => {
  const mobile = landing.match(/@media \(max-width:640px\)\s*\{([\s\S]+?)\n\s*\}(?:\n\s*<\/style>|\n\s*@media)/)?.[1]
    || landing.match(/@media \(max-width:640px\)\s*\{([\s\S]+)\}\s*<\/style>/)?.[1];
  assert.ok(mobile, 'narrow mobile media query missing');
  assert.match(mobile, /\.hero\s*\{\s*padding:5\.5rem 0 3\.5rem/);
  assert.match(mobile, /\.hero-actions \.btn\s*\{\s*width:100%/);
  assert.doesNotMatch(landing, /class="hero-screenshot/);
});

test('proof figure remains one real eager sandboxed artifact with explicit user-selected identities', () => {
  assert.equal((landing.match(/<iframe id="hero-proof-frame"/g) || []).length, 1);
  assert.match(landing, /loading="eager"/);
  assert.match(landing, /sandbox="allow-scripts"/);
  assert.doesNotMatch(landing, /sandbox="[^"]*allow-same-origin/);
  assert.equal((landing.match(/class="demo-tab spec-card"/g) || []).length, 3);
  assert.match(landing, /data-proof-playback="first-fold-once"/);
  assert.match(landing, /\?embed=1&amp;play=1&amp;theme=dark#view=order-to-cash/);
  assert.doesNotMatch(landing, /setInterval\(|scrollIntoView\(|scroll-triggered|proof-carousel/);
});

test('initial proof playback uses one sandboxed load without parent-frame reach-through', () => {
  assert.match(landing, /src="gallery\/artifacts\/business-operating-map\.architecture\.html\?embed=1&amp;play=1&amp;theme=dark#view=order-to-cash"/);
  assert.doesNotMatch(landing, /initialProof|proofFrameDocumentIsReady|proofFrame\.contentWindow|proofFrame\.contentDocument/);
  assert.match(landing, /proofFrame\.addEventListener\('load', \(\) => \{/);
  assert.match(landing, /proofStage\.classList\.remove\('is-loading'\)/);
});

test('proof playback delegates reduced motion to the artifact and keeps deliberate-choice boundaries', () => {
  assert.match(landing, /renderProof\(tab\.dataset\.proof, \{ deliberate: true \}\)/);
  assert.match(landing, /renderProof\(tabs\[next\]\.dataset\.proof, \{ focus: true, deliberate: true \}\)/);
  assert.match(landing, /proofEmbedUrl\(proof, \{ play: deliberate \}\)/);
  assert.match(landing, /document\.querySelectorAll\('\.fade-up'\)\.forEach\(el => el\.classList\.add\('visible'\)\)/);
  assert.doesNotMatch(landing, /addEventListener\('scroll'/);
});

test('page uses normal flow and preserves reduced-motion boundaries', () => {
  const hero = cssRule('.hero');
  const demo = cssRule('.demo-stage');
  assert.doesNotMatch(hero + demo, /position:absolute|transform:|top:-|margin-top:-|height:100vh/);
  assert.match(landing, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(landing, /\.fade-up\s*\{\s*opacity:1!important;\s*transform:none!important;/);
});
