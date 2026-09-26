// The site is written for AI agents as much as for people: an agent should be
// able to read llms.txt, pick the right recipe, and run it. These checks keep
// every agent-facing surface complete and in step with the shipped recipes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIO_RECIPES } from '../recipes/scenarios.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(__dirname, '../../docs');
const SITE = 'https://diagram.mosofin.com';
const read = (rel) => fs.readFileSync(path.join(docs, rel), 'utf8');
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap((m) => JSON.parse(m[1])['@graph']);
const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

test('llms.txt follows the llmstxt.org shape and every link resolves to a published file', () => {
  const llms = read('llms.txt');
  const lines = llms.split('\n');
  assert.equal(lines[0], '# MosoFin-diagram', 'the first line is the H1 name');
  assert.match(lines[2], /^> A free, open-source \(MIT\) agent skill/, 'a blockquote summary follows the H1');
  for (const recipe of SCENARIO_RECIPES) {
    assert.ok(llms.includes(`${SITE}/recipes/${recipe.id}.md`), `${recipe.id}: listed in llms.txt`);
  }
  for (const [, url] of llms.matchAll(/\]\((https:\/\/diagram\.mosofin\.com\/[^)]*)\)/g)) {
    const rel = url.slice(SITE.length + 1);
    const file = path.join(docs, rel.endsWith('/') ? `${rel}index.html` : rel);
    assert.ok(fs.existsSync(file), `${url}: linked from llms.txt but not published`);
  }
});

test('llms-full.txt carries install, workflow, guardrails, every recipe prompt and the FAQ', () => {
  const full = read('llms-full.txt');
  for (const agent of ['claude-code', 'cursor', 'codex', 'opencode']) {
    assert.ok(full.includes(`npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent ${agent} --global --copy --yes`), agent);
  }
  for (const heading of ['## When an agent should use it', '## Install', '## How to produce a diagram', '## Diagram types', '## Guardrails the skill enforces', '## Recipes', '## FAQ']) {
    assert.ok(full.includes(heading), heading);
  }
  for (const recipe of SCENARIO_RECIPES) {
    assert.ok(full.includes(`#### ${recipe.en.question}`), `${recipe.id}: question heading`);
    assert.ok(full.includes(recipe.en.prompt), `${recipe.id}: current prompt`);
  }
});

test('recipes.json matches the shipped recipe catalogue', () => {
  const data = JSON.parse(read('recipes.json'));
  assert.equal(data.schemaVersion, 1);
  assert.deepEqual(data.recipes.map((r) => r.id), SCENARIO_RECIPES.map((r) => r.id));
  for (const recipe of SCENARIO_RECIPES) {
    const entry = data.recipes.find((r) => r.id === recipe.id);
    assert.equal(entry.type, recipe.type);
    assert.equal(entry.question, recipe.en.question);
    assert.equal(entry.prompt, recipe.en.prompt);
    assert.equal(entry.page, `${SITE}/recipes/${recipe.id}.html`);
  }
});

for (const recipe of SCENARIO_RECIPES) {
  test(`recipe page ${recipe.id}: answer-first, server-rendered, with matching structured data`, () => {
    const html = read(`recipes/${recipe.id}.html`);
    const h1 = html.match(/<h1>([^<]+)<\/h1>/)?.[1];
    assert.equal(decode(h1), recipe.en.question, 'the H1 is the question');
    const answer = decode(html.match(/<p class="answer">([^<]+)<\/p>/)?.[1] || '');
    const words = answer.split(/\s+/).length;
    assert.ok(words >= 30 && words <= 60, `answer block is ${words} words`);
    assert.ok(html.indexOf('class="answer"') < html.indexOf('<h2>'), 'the answer comes before any section');
    assert.ok(decode(html).includes(recipe.en.prompt), 'the current prompt is on the page');
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE}/recipes/${recipe.id}\\.html">`));
    assert.match(html, new RegExp(`<link rel="alternate" type="text/markdown" href="${SITE}/recipes/${recipe.id}\\.md"`));
    const graph = jsonLd(html);
    for (const type of ['BreadcrumbList', 'TechArticle', 'HowTo', 'FAQPage']) {
      assert.ok(graph.some((node) => node['@type'] === type), `${type} structured data`);
    }
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    for (const item of faq.mainEntity) {
      assert.ok(decode(html).includes(`<h3>${item.name}</h3>`), `FAQ question "${item.name}" is visible`);
      assert.ok(decode(html).includes(item.acceptedAnswer.text), 'FAQ answer is visible');
    }
    assert.doesNotMatch(html, /<script(?![^>]*application\/ld\+json)/, 'no script is needed to read the page');
    const md = read(`recipes/${recipe.id}.md`);
    assert.equal(md.split('\n')[0], `# ${recipe.en.question}`);
    assert.ok(md.includes(recipe.en.prompt));
  });
}

test('recipe index lists every recipe and the guide links them without JavaScript', () => {
  const index = read('recipes/index.html');
  const guide = read('guide.html');
  for (const recipe of SCENARIO_RECIPES) {
    assert.ok(index.includes(`href="/recipes/${recipe.id}.html"`), `${recipe.id}: in the index`);
    assert.ok(guide.includes(`href="recipes/${recipe.id}.html"`), `${recipe.id}: statically linked from the guide`);
  }
  assert.ok(fs.existsSync(path.join(docs, 'recipes/index.md')));
});

test('landing FAQ is answer-first and its FAQPage data matches the visible text', () => {
  const landing = read('index.html');
  const faq = jsonLd(landing).find((node) => node['@type'] === 'FAQPage');
  assert.ok(faq && faq.mainEntity.length >= 6, 'FAQPage with at least six questions');
  const visible = decode(landing);
  for (const item of faq.mainEntity) {
    assert.ok(visible.includes(`>${item.name}</h3>`), `"${item.name}" is a visible question heading`);
    assert.ok(visible.includes(item.acceptedAnswer.text), `"${item.name}" answer is visible`);
    const first = item.acceptedAnswer.text.split(/(?<=\.)\s/)[0];
    assert.ok(first.split(/\s+/).length <= 40, `"${item.name}" opens with a short, direct answer`);
  }
  assert.ok(faq.mainEntity.some((item) => item.name === 'What is MosoFin-diagram?'));
});

test('robots.txt welcomes AI crawlers by name and every page points agents at llms.txt', () => {
  const robots = read('robots.txt');
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended']) {
    assert.match(robots, new RegExp(`^User-agent: ${bot}$`, 'm'), bot);
  }
  const groups = robots.split(/\n\s*\n/).filter((group) => /User-agent: GPTBot/.test(group));
  assert.equal(groups.length, 1);
  assert.match(groups[0], /^Allow: \/$/m);
  for (const page of ['index.html', 'start.html', 'guide.html', 'gallery.html', 'logos.html', 'recipes/index.html']) {
    assert.match(read(page), /<link rel="alternate" type="text\/plain" href="https:\/\/diagram\.mosofin\.com\/llms\.txt"/, page);
  }
});
