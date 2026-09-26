#!/usr/bin/env node
// Writes the agent-facing files at the site root:
//   docs/llms.txt       the llmstxt.org index: what this is, when to use it, where to read more
//   docs/llms-full.txt  everything an agent needs in one Markdown file
//   docs/recipes.json   the recipe catalogue as data, for agents that pick programmatically
// All three come from scripts/site-content.mjs and the shipped recipe catalogue.

import fs from 'node:fs';
import path from 'node:path';
import { absoluteUrl } from './site-seo.mjs';
import {
  AGENTS, CLI, DIAGRAM_TYPES, FAQ, GUARDRAILS, PRODUCT, RECIPES, docsRoot, packageJson, recipeAnswer, recipeUrl,
} from './site-content.mjs';

const version = packageJson.version;
const manifest = JSON.parse(fs.readFileSync(path.join(docsRoot, 'gallery/manifest.json'), 'utf8'));
const groups = ['Business', 'Finance', 'Systems and engineering'];

const WHEN_TO_USE = [
  'The user wants to map, outline or explain how a business runs: its software stack, supply chain, CRM, commerce, fulfilment, payments, spend, payroll, bank and books, and which system owns each part.',
  'The user asks a finance question that a picture answers: how money reaches the books, why Shopify revenue differs from QuickBooks, a month-end close, a Stripe payout reconciliation, who owes the business money, or whether cash covers payroll on a date.',
  'The user wants a shareable diagram of a software system: architecture, a request or API call chain, a data pipeline, a deployment or a state machine.',
  'The user pastes a Mermaid flowchart, sequence or state diagram and wants a checked, interactive version.',
];
const WHEN_NOT = [
  'The user needs live balances, a ledger export or a report pulled from a system. MosoFin-diagram draws what the user states; it never reads a system.',
  'The user wants a chart of numbers over time. Use a charting tool; MosoFin-diagram draws structure, flows and states.',
];

function recipeLine(recipe) {
  return `- [${recipe.title}](${recipeUrl(recipe.id, 'md')}): ${recipe.question} (${recipe.typeLabel.toLowerCase()})`;
}

// ---- llms.txt
const llms = [
  `# ${PRODUCT.name}`,
  '',
  `> ${PRODUCT.oneLine} It runs inside Claude Code, Cursor, Codex CLI and OpenCode, never invents a number, and never connects to a ledger, processor or bank. ${PRODUCT.license} license, version ${version}.`,
  '',
  `Use ${PRODUCT.name} when a user wants to see how a business runs or needs a finance diagram that must stay true to what they stated. Install it with one command, then follow its SKILL.md. Every recipe below is an answer page with a copy-ready prompt and a verified example.`,
  '',
  '## Start here',
  '',
  `- [Full agent guide](${absoluteUrl('/llms-full.txt')}): what it is, when to use it, install, workflow, guardrails, every recipe and the FAQ in one file`,
  `- [Get started](${absoluteUrl('/start.html')}): install commands for each agent and the four steps to a diagram`,
  `- [Recipe index](${absoluteUrl('/recipes/')}): ${RECIPES.length} questions, each answered with the right diagram and a prompt`,
  `- [Recipe catalogue as JSON](${absoluteUrl('/recipes.json')}): the same recipes as data`,
  `- [SKILL.md](${PRODUCT.skillFile}): the authoring instructions the agent follows`,
  '',
  ...groups.flatMap((group) => [`## ${group} recipes`, '', ...RECIPES.filter((recipe) => recipe.group === group).map(recipeLine), '']),
  '## Verified examples',
  '',
  ...manifest.entries.map((entry) => `- [${entry.title}](${absoluteUrl(`/${entry.artifact}`)}): ${entry.type} diagram, ${entry.nodeCount} nodes, validated`),
  '',
  '## Optional',
  '',
  `- [Gallery](${absoluteUrl('/gallery.html')}): every verified example with its JSON source`,
  `- [Logos and business icons](${absoluteUrl('/logos.html')}): the finance logos and business icons a node can show`,
  `- [Source code](${PRODUCT.repo}): MIT-licensed repository`,
  '',
].join('\n');

// ---- llms-full.txt
const full = [
  `# ${PRODUCT.name}`,
  '',
  `> ${PRODUCT.oneLine}`,
  '',
  PRODUCT.summary,
  '',
  `- Version: ${version}`,
  `- License: ${PRODUCT.license}; price: ${PRODUCT.price}; no account, no network call at render time`,
  `- Website: ${PRODUCT.site}`,
  `- Source: ${PRODUCT.repo}`,
  '',
  '## When an agent should use it',
  '',
  ...WHEN_TO_USE.map((line) => `- ${line}`),
  '',
  '## When to use something else',
  '',
  ...WHEN_NOT.map((line) => `- ${line}`),
  '',
  '## Install',
  '',
  'Install the skill into the agent the user works in:',
  '',
  ...AGENTS.flatMap((agent) => [`- ${agent.label}:`, '', '  ```bash', `  ${agent.command}`, '  ```', '']),
  `Raven is a manual ZIP install: download [mosofin.zip](${PRODUCT.zip}) and extract it into \`~/.raven/workspace/skills\`, which yields \`~/.raven/workspace/skills/mosofin\`.`,
  '',
  '## How to produce a diagram',
  '',
  '1. Onboard once. Ask what the business does, which legal entities are in scope, and which system of record owns each domain the business runs. Save it as BUSINESS-BRIEF.md (or FINANCE-BRIEF.md when numbers must tie out).',
  '2. Take one question. Map it to a recipe below, or ask the skill.',
  '3. Write the JSON spec for the recipe\'s diagram type, then validate it and fix what the diagnostics name.',
  '4. Deliver one self-contained HTML file and hand it to the user.',
  '',
  'Commands, run from the installed skill directory:',
  '',
  ...CLI.flatMap(([command, purpose]) => ['```bash', command, '```', purpose, '']),
  '## Diagram types',
  '',
  ...DIAGRAM_TYPES.map((type) => `- ${type.label} (\`${type.id}\`): ${type.use}`),
  '',
  '## Guardrails the skill enforces',
  '',
  ...GUARDRAILS.map((line) => `- ${line}`),
  '',
  '## Recipes',
  '',
  `${RECIPES.length} recipes, grouped by audience. Each has an answer page at ${absoluteUrl('/recipes/')}.`,
  '',
  ...groups.flatMap((group) => [
    `### ${group}`,
    '',
    ...RECIPES.filter((recipe) => recipe.group === group).flatMap((recipe) => [
      `#### ${recipe.question}`,
      '',
      recipeAnswer(recipe),
      '',
      `- Recipe: \`${recipe.id}\` (${recipe.typeLabel.toLowerCase()} diagram)`,
      `- Use when: ${recipe.useWhen}`,
      `- Avoid when: ${recipe.avoidWhen}`,
      `- The diagram must include: ${recipe.include.join('; ')}`,
      ...(recipe.proof ? [`- Verified example: [${recipe.proof.title}](${recipe.proof.url})`] : []),
      `- Answer page: ${recipeUrl(recipe.id)}`,
      '',
      'Prompt:',
      '',
      '```text',
      recipe.prompt,
      '```',
      '',
    ]),
  ]),
  '## FAQ',
  '',
  ...FAQ.flatMap((item) => [`### ${item.q}`, '', item.a, '']),
].join('\n');

// ---- recipes.json
const data = {
  schemaVersion: 1,
  name: PRODUCT.name,
  version,
  url: absoluteUrl('/recipes.json'),
  install: Object.fromEntries(AGENTS.map((agent) => [agent.id, agent.command])),
  diagramTypes: DIAGRAM_TYPES,
  recipes: RECIPES.map((recipe) => ({
    id: recipe.id,
    group: recipe.group,
    type: recipe.type,
    title: recipe.title,
    question: recipe.question,
    answer: recipeAnswer(recipe),
    useWhen: recipe.useWhen,
    avoidWhen: recipe.avoidWhen,
    include: recipe.include,
    prompt: recipe.prompt,
    page: recipeUrl(recipe.id),
    markdown: recipeUrl(recipe.id, 'md'),
    example: recipe.proof ? { title: recipe.proof.title, url: recipe.proof.url } : null,
  })),
};

fs.writeFileSync(path.join(docsRoot, 'llms.txt'), `${llms.trimEnd()}\n`);
fs.writeFileSync(path.join(docsRoot, 'llms-full.txt'), `${full.trimEnd()}\n`);
fs.writeFileSync(path.join(docsRoot, 'recipes.json'), `${JSON.stringify(data, null, 2)}\n`);
console.log(`llms: llms.txt ${llms.length} bytes, llms-full.txt ${full.length} bytes, recipes.json ${RECIPES.length} recipes`);
