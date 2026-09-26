#!/usr/bin/env node
// Writes one static answer page per recipe (docs/recipes/<id>.html), a
// Markdown twin for agents (docs/recipes/<id>.md), and the recipe index.
//
// Each page answers exactly one question the way answer engines read it: the
// question is the H1, a 30–60 word answer comes first, then when to use it,
// what the diagram must include, a copy-ready prompt, the steps, a verified
// example, and a short FAQ. Everything is plain server-rendered HTML — AI
// crawlers do not run JavaScript — with FAQPage, HowTo, TechArticle and
// BreadcrumbList structured data taken from the same visible text.

import fs from 'node:fs';
import path from 'node:path';
import { siteFooter, siteFooterStyles } from './site-footer.mjs';
import { absoluteUrl, seoHead } from './site-seo.mjs';
import {
  AGENTS, DIAGRAM_TYPES, PRODUCT, RECIPES, docsRoot, packageJson, recipeAnswer, recipeUrl,
} from './site-content.mjs';

const outDir = path.join(docsRoot, 'recipes');
const version = packageJson.version;
const groups = ['Business', 'Finance', 'Systems and engineering'];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function shortDescription(text, limit = 158) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:·—-]+$/, '')}…`;
}

const typeUse = Object.fromEntries(DIAGRAM_TYPES.map((type) => [type.id, type.use]));

function recipeFaq(recipe) {
  return [
    {
      q: `Which diagram type answers “${recipe.question}”`,
      a: `A ${recipe.typeLabel.toLowerCase()} diagram. ${typeUse[recipe.type]} The ${recipe.title} recipe sets it up for this question.`,
    },
    { q: `When should I use a different recipe?`, a: `Pick another recipe when ${recipe.avoidWhen.charAt(0).toLowerCase()}${recipe.avoidWhen.slice(1)}` },
    {
      q: 'Does MosoFin-diagram connect to my systems or invent numbers?',
      a: 'No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.',
    },
  ];
}

function steps(recipe) {
  return [
    { name: 'Install the skill', text: `Add MosoFin-diagram to your coding agent. For Claude Code: ${AGENTS[0].command}` },
    { name: 'Describe the business once', text: 'Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.' },
    { name: 'Ask this question', text: `Paste the ${recipe.title} prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.` },
    { name: 'Open and share the diagram', text: 'Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.' },
  ];
}

const pageCss = `
    :root { --paper:#ffffff; --paper-2:#f5f6f8; --ink:#0a0b0d; --ink-soft:#333333; --muted:#5c6370; --dim:#8b919c; --line:#e4e6ea; --accent:#11cc39; --accent-deep:#0b8f29; --accent-soft:#e9fbee;
      --font-body:'Onest',system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif; --font-mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace; }
    *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:var(--font-body); font-size:16px; line-height:1.65; background:var(--paper); color:var(--ink-soft); -webkit-font-smoothing:antialiased; }
    a { color:inherit; }
    :focus-visible { outline:2px solid var(--accent); outline-offset:3px; border-radius:4px; }
    nav.top { position:sticky; top:0; z-index:50; height:72px; display:flex; align-items:center; background:rgba(255,255,255,.94); backdrop-filter:blur(16px); border-bottom:1px solid var(--line); }
    .nav-inner { width:min(1080px,calc(100% - 48px)); margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; }
    .brand { display:inline-flex; align-items:center; gap:10px; min-height:44px; text-decoration:none; font-weight:600; font-size:1.125rem; color:var(--ink); }
    .nav-links { display:flex; gap:1.5rem; align-items:center; }
    .nav-links a { font-size:.9375rem; font-weight:500; color:var(--muted); text-decoration:none; }
    .nav-links a:hover { color:var(--ink); }
    main { width:min(760px,calc(100% - 48px)); margin:0 auto; padding-block:2.5rem 4rem; }
    .crumbs { font-size:.8125rem; color:var(--dim); margin-bottom:1.25rem; }
    .crumbs a { color:var(--muted); text-decoration:none; }
    .eyebrow { font:600 .6875rem/1 var(--font-mono); letter-spacing:.14em; text-transform:uppercase; color:var(--accent-deep); margin-bottom:.9rem; }
    h1 { font-size:clamp(1.75rem,3.4vw,2.5rem); line-height:1.15; letter-spacing:-.03em; color:var(--ink); text-wrap:balance; margin-bottom:1.25rem; }
    .answer { font-size:1.125rem; line-height:1.7; color:var(--ink); padding:1.1rem 1.25rem; border-left:3px solid var(--accent); background:var(--accent-soft); border-radius:0 10px 10px 0; }
    h2 { font-size:1.35rem; letter-spacing:-.02em; color:var(--ink); margin:2.5rem 0 .75rem; text-wrap:balance; }
    h3 { font-size:1.0625rem; color:var(--ink); margin:1.5rem 0 .4rem; }
    p + p { margin-top:.75rem; }
    ul, ol { padding-left:1.25rem; display:grid; gap:.4rem; }
    code { font-family:var(--font-mono); font-size:.85em; }
    pre { background:#0a0b0d; color:#e6e8ec; padding:1rem 1.1rem; border-radius:10px; overflow-x:auto; font:400 .8125rem/1.6 var(--font-mono); white-space:pre-wrap; }
    figure { margin-top:1rem; border:1px solid var(--line); border-radius:12px; overflow:hidden; }
    figure img { display:block; width:100%; height:auto; }
    figcaption { padding:.7rem 1rem; font-size:.875rem; color:var(--muted); border-top:1px solid var(--line); }
    .meta { margin-top:1rem; font-size:.8125rem; color:var(--dim); }
    .index-group { margin-top:2rem; }
    .index-group li a { font-weight:600; color:var(--ink); }
    .index-group li span { display:block; font-size:.9rem; color:var(--muted); }
    @media (max-width:640px) { .nav-links a.hide-sm { display:none; } }
${siteFooterStyles()}`;

function shell({ pathname, title, description, jsonLd, markdown, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="mosofin recipes ${esc(version)}">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#ffffff">
${seoHead({ path: pathname, title, description, jsonLd, markdown })}
  <link rel="icon" type="image/png" href="/assets/mosofin-mark.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${pageCss}
  </style>
</head>
<body>
  <nav class="top" aria-label="Site">
    <div class="nav-inner">
      <a class="brand" href="/"><img src="/assets/mosofin-mark.png" alt="" width="32" height="32">${PRODUCT.name}</a>
      <div class="nav-links">
        <a href="/recipes/">Recipes</a>
        <a class="hide-sm" href="/gallery.html">Examples</a>
        <a class="hide-sm" href="/guide.html">Guide</a>
        <a href="/start.html">Get started</a>
      </div>
    </div>
  </nav>
  <main>
${body}
  </main>
  ${siteFooter({ version, page: 'recipes', assetPrefix: '/' })}
</body>
</html>
`;
}

const org = { '@type': 'Organization', name: 'MosoFin', url: 'https://mosofin.com/' };
const breadcrumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, pathname], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(pathname) })),
});

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const recipe of RECIPES) {
  const pathname = `/recipes/${recipe.id}.html`;
  const answer = recipeAnswer(recipe);
  const faq = recipeFaq(recipe);
  const howTo = steps(recipe);
  const related = RECIPES.filter((other) => other.group === recipe.group && other.id !== recipe.id).slice(0, 4);
  const title = `${recipe.title} Diagram Recipe — ${PRODUCT.name}`;
  const description = shortDescription(`${recipe.summary}`);
  const image = recipe.proof?.imagePath ? { ...pngSize(path.join(docsRoot, recipe.proof.imagePath)), url: recipe.proof.image } : null;

  const jsonLd = [
    breadcrumbs([[PRODUCT.name, '/'], ['Recipes', '/recipes/'], [recipe.title, pathname]]),
    {
      '@type': 'TechArticle',
      headline: recipe.question,
      description: answer,
      url: absoluteUrl(pathname),
      inLanguage: 'en',
      author: org,
      publisher: org,
      about: { '@type': 'SoftwareApplication', name: PRODUCT.name, url: absoluteUrl('/') },
      ...(image ? { image: image.url } : {}),
    },
    {
      '@type': 'HowTo',
      name: `Make a ${recipe.title.toLowerCase()} diagram with ${PRODUCT.name}`,
      totalTime: 'PT10M',
      step: howTo.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.name, text: step.text })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
  ];

  const body = `    <p class="crumbs"><a href="/">${PRODUCT.name}</a> › <a href="/recipes/">Recipes</a> › ${esc(recipe.title)}</p>
    <article>
      <p class="eyebrow">${esc(recipe.group)} recipe · ${esc(recipe.typeLabel)} diagram</p>
      <h1>${esc(recipe.question)}</h1>
      <p class="answer">${esc(answer)}</p>

      <h2>When to use this diagram</h2>
      <p>${esc(recipe.useWhen)}</p>
      <p><strong>Pick another recipe when</strong> ${esc(recipe.avoidWhen.charAt(0).toLowerCase() + recipe.avoidWhen.slice(1))}</p>

      <h2>What the diagram must include</h2>
      <ul>
${recipe.include.map((item) => `        <li>${esc(item.charAt(0).toUpperCase() + item.slice(1))}</li>`).join('\n')}
      </ul>

      <h2>Copy-ready prompt</h2>
      <p>Paste this into your coding agent with ${PRODUCT.name} installed. Recipe ID: <code>${esc(recipe.id)}</code>.</p>
      <pre><code>${esc(recipe.prompt)}</code></pre>

      <h2>How to make it</h2>
      <ol>
${howTo.map((step) => `        <li><strong>${esc(step.name)}.</strong> ${esc(step.text)}</li>`).join('\n')}
      </ol>
${recipe.proof ? `
      <h2>Verified example</h2>
      <p><a href="${esc(recipe.proof.url)}">${esc(recipe.proof.title)}</a> is a real ${esc(recipe.typeLabel.toLowerCase())} diagram delivered by the skill and checked by its validator.</p>
${image ? `      <figure>
        <a href="${esc(recipe.proof.url)}"><img src="/${esc(recipe.proof.imagePath)}" alt="${esc(`${recipe.proof.title}: a ${recipe.typeLabel.toLowerCase()} diagram made with ${PRODUCT.name}`)}" width="${image.width}" height="${image.height}" loading="lazy"></a>
        <figcaption>${esc(recipe.proof.title)} · open the interactive diagram</figcaption>
      </figure>` : ''}` : ''}

      <h2>Questions about this recipe</h2>
${faq.map((item) => `      <h3>${esc(item.q)}</h3>
      <p>${esc(item.a)}</p>`).join('\n')}

      <h2>Related recipes</h2>
      <ul>
${related.map((other) => `        <li><a href="/recipes/${esc(other.id)}.html">${esc(other.question)}</a></li>`).join('\n')}
      </ul>
      <p class="meta">Markdown version for AI agents: <a href="/recipes/${esc(recipe.id)}.md">/recipes/${esc(recipe.id)}.md</a> · Full agent guide: <a href="/llms-full.txt">/llms-full.txt</a></p>
    </article>`;

  fs.writeFileSync(path.join(outDir, `${recipe.id}.html`), shell({ pathname, title, description, jsonLd, markdown: `/recipes/${recipe.id}.md`, body }));

  const md = [
    `# ${recipe.question}`,
    '',
    `> ${answer}`,
    '',
    `- Recipe: \`${recipe.id}\` (${recipe.group.toLowerCase()}, ${recipe.typeLabel.toLowerCase()} diagram)`,
    `- Page: ${recipeUrl(recipe.id)}`,
    ...(recipe.proof ? [`- Verified example: [${recipe.proof.title}](${recipe.proof.url})`] : []),
    '',
    '## When to use this diagram',
    '',
    recipe.useWhen,
    '',
    `Pick another recipe when ${recipe.avoidWhen.charAt(0).toLowerCase()}${recipe.avoidWhen.slice(1)}`,
    '',
    '## What the diagram must include',
    '',
    ...recipe.include.map((item) => `- ${item}`),
    '',
    '## Copy-ready prompt',
    '',
    '```text',
    recipe.prompt,
    '```',
    '',
    '## How to make it',
    '',
    ...howTo.map((step, index) => `${index + 1}. **${step.name}.** ${step.text}`),
    '',
    '## Questions about this recipe',
    '',
    ...faq.flatMap((item) => [`### ${item.q}`, '', item.a, '']),
  ].join('\n');
  fs.writeFileSync(path.join(outDir, `${recipe.id}.md`), `${md.trimEnd()}\n`);
}

// ---- index
const indexTitle = `Business and Finance Diagram Recipes — ${PRODUCT.name}`;
const indexDescription = `${RECIPES.length} questions about how a business runs, each answered with the right diagram, a copy-ready agent prompt and a verified example.`;
const indexAnswer = `${PRODUCT.name} has ${RECIPES.length} recipes. Each one answers a single question, such as how the whole business runs, why Shopify revenue differs from QuickBooks, or whether cash covers payroll, with the right diagram type and a prompt your coding agent can run.`;
const indexBody = `    <p class="crumbs"><a href="/">${PRODUCT.name}</a> › Recipes</p>
    <p class="eyebrow">${RECIPES.length} recipes · 6 diagram types</p>
    <h1>Which diagram answers your business question?</h1>
    <p class="answer">${esc(indexAnswer)}</p>
${groups.map((group) => `
    <section class="index-group">
      <h2>${esc(group)}</h2>
      <ul>
${RECIPES.filter((recipe) => recipe.group === group).map((recipe) => `        <li><a href="/recipes/${esc(recipe.id)}.html">${esc(recipe.question)}</a><span>${esc(recipe.title)} · ${esc(recipe.typeLabel.toLowerCase())} diagram</span></li>`).join('\n')}
      </ul>
    </section>`).join('\n')}
    <p class="meta">Markdown version for AI agents: <a href="/recipes/index.md">/recipes/index.md</a> · Recipes as data: <a href="/recipes.json">/recipes.json</a> · Full agent guide: <a href="/llms-full.txt">/llms-full.txt</a></p>`;
fs.writeFileSync(path.join(outDir, 'index.html'), shell({
  pathname: '/recipes/',
  title: indexTitle,
  description: indexDescription,
  markdown: '/recipes/index.md',
  jsonLd: [
    breadcrumbs([[PRODUCT.name, '/'], ['Recipes', '/recipes/']]),
    {
      '@type': 'CollectionPage',
      name: 'Business and finance diagram recipes',
      url: absoluteUrl('/recipes/'),
      description: indexDescription,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: RECIPES.length,
        itemListElement: RECIPES.map((recipe, index) => ({ '@type': 'ListItem', position: index + 1, name: recipe.question, url: recipeUrl(recipe.id) })),
      },
    },
  ],
  body: indexBody,
}));
fs.writeFileSync(path.join(outDir, 'index.md'), `${[
  '# Which diagram answers your business question?',
  '',
  `> ${indexAnswer}`,
  '',
  ...groups.flatMap((group) => [`## ${group}`, '', ...RECIPES.filter((recipe) => recipe.group === group).map((recipe) => `- [${recipe.question}](${recipeUrl(recipe.id, 'md')}) — ${recipe.title}, ${recipe.typeLabel.toLowerCase()} diagram`), '']),
].join('\n').trimEnd()}\n`);
console.log(`recipes: ${RECIPES.length} answer pages + index, with Markdown twins`);
