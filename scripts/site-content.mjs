// The facts every agent-facing surface states: llms.txt, llms-full.txt, the
// recipe answer pages, and the landing-page FAQ. One module, so an assistant
// that reads any of them gets the same answer.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIO_RECIPES } from '../mosofin/recipes/scenarios.mjs';
import { SITE_URL, REPO_URL, absoluteUrl } from './site-seo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '..');
export const docsRoot = path.join(repoRoot, 'docs');
export const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'mosofin/package.json'), 'utf8'));

export const PRODUCT = Object.freeze({
  name: 'MosoFin-diagram',
  oneLine: 'A free, open-source (MIT) agent skill that turns a short interview about a business into a validated, self-contained HTML diagram of how it runs.',
  summary: 'MosoFin-diagram is a free, open-source agent skill for Claude Code, Cursor, Codex CLI and OpenCode. It interviews you about a business once, then answers one question at a time with a checked, interactive HTML diagram: which system owns each part of the business, where work and money change hands, and how cash reaches the books. It never invents a number and never connects to your ledger, processor or bank.',
  license: 'MIT',
  price: 'Free',
  site: SITE_URL,
  repo: REPO_URL,
  skillFile: `${REPO_URL}/blob/main/mosofin/SKILL.md`,
  zip: `${REPO_URL}/raw/main/mosofin.zip`,
});

export const AGENTS = Object.freeze([
  { label: 'Claude Code', id: 'claude-code' },
  { label: 'Cursor', id: 'cursor' },
  { label: 'Codex CLI', id: 'codex' },
  { label: 'OpenCode', id: 'opencode' },
].map((agent) => Object.freeze({
  ...agent,
  command: `npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent ${agent.id} --global --copy --yes`,
})));

export const DIAGRAM_TYPES = Object.freeze([
  { id: 'architecture', label: 'Architecture', use: 'The whole operating stack: which system owns each domain, money maps, and where entities separate.' },
  { id: 'workflow', label: 'Workflow', use: 'Steps and gates in one process: team handoffs, the month-end close, approval chains, payment runs.' },
  { id: 'sequence', label: 'Sequence', use: 'One order, invoice or payout traced in time across every system it touches.' },
  { id: 'dataflow', label: 'Data flow', use: 'Revenue walks, payout reconciliations, cash runway and data lineage: where a number comes from.' },
  { id: 'lifecycle', label: 'Lifecycle', use: 'The states one object moves through: refunds, disputes, invoices, subscriptions.' },
  { id: 'pillars', label: 'Pillars', use: 'The operating model on one page: the business in one sentence, one pillar per domain, the rules underneath.' },
]);

export const TYPE_LABEL = Object.fromEntries(DIAGRAM_TYPES.map((type) => [type.id, type.label]));

export const GUARDRAILS = Object.freeze([
  'Every fact comes from the business brief or the user. The skill never calls QuickBooks, Xero, Stripe, Shopify, an ERP or a bank.',
  'No invented amounts, volumes or headcounts. A number the user did not supply is omitted or tagged unknown.',
  'One system of record per fact. Two systems claiming the same fact is a brief error to resolve, not something to draw.',
  '"Connected" is not a tie-out. A reconciliation is green only when the user supplied a zero difference.',
  'At most 12 primary nodes per diagram. Group by domain and name the real tools in the sublabel.',
  'A real product shows its logo only from the shipped catalogue; anything without one shows a business icon, never an imitation logo.',
]);

export const CLI = Object.freeze([
  ['node bin/mosofin.mjs guide "<the user\'s question>" --json', 'Recommend the recipe and diagram type for a plain-language question.'],
  ['node bin/mosofin.mjs validate <type> <spec.json> --quality showcase --json', 'Validate a candidate JSON spec; repair from the diagnostics until it passes.'],
  ['node bin/mosofin.mjs deliver <type> <spec.json> <out.html> --quality showcase --json', 'Render the final self-contained HTML with a validation receipt.'],
  ['node bin/mosofin.mjs brands "<product>" --json', 'Find the built-in logo ID for a real product.'],
  ['node bin/mosofin.mjs icons --json', 'List business icons for nodes that have no logo.'],
]);

// Answer-first: every answer opens with a complete, standalone sentence.
export const FAQ = Object.freeze([
  {
    q: 'What is MosoFin-diagram?',
    a: 'MosoFin-diagram is a free, open-source agent skill that turns a short interview about a business into a validated, self-contained HTML diagram of how it runs. Each node names the system of record that owns it, and each connection names what actually changes hands.',
  },
  {
    q: 'Which diagrams can it draw?',
    a: `It draws six diagram types: ${DIAGRAM_TYPES.map((type) => type.label.toLowerCase()).join(', ')}. ${SCENARIO_RECIPES.length} ready-made recipes cover questions such as how the whole business runs, the month-end close, a revenue walk, a payout reconciliation and cash to a payroll date.`,
  },
  {
    q: 'Does it invent numbers?',
    a: 'No. If you did not supply an amount, it does not appear. The skill never calls QuickBooks, Stripe, Shopify, an ERP, or a bank.',
  },
  {
    q: 'Is MosoFin-diagram free?',
    a: 'Yes. MosoFin-diagram is free and MIT-licensed, needs no account, and makes no network call when it renders a diagram. Every logo it can draw ships inside the skill.',
  },
  {
    q: 'What do I get back?',
    a: 'One self-contained HTML file. Zero dependencies, no server, no runtime. Open it in any browser, forward it, or export PNG, JPEG, WebP, SVG, or WebM.',
  },
  {
    q: 'Which agents does it support?',
    a: 'Cursor, Claude Code, Codex CLI, and OpenCode via the switcher. Raven is a manual ZIP install: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin.',
  },
  {
    q: 'How should an AI agent use MosoFin-diagram?',
    a: 'Install the skill, read its SKILL.md, and let the built-in guide pick a recipe for the user\'s question. Then write the JSON spec, validate it, and deliver the HTML. The complete agent guide is at diagram.mosofin.com/llms-full.txt.',
  },
  {
    q: 'Is this the same product as mosofin.com?',
    a: 'No. MosoFin is a read-only financial data workspace in Claude. MosoFin-diagram is a free, open-source skill that draws a map of how the business runs. They share a name and a team — not data.',
  },
]);

// ---- recipes, with their verified example from the gallery
const manifest = JSON.parse(fs.readFileSync(path.join(docsRoot, 'gallery/manifest.json'), 'utf8'));
const proofById = new Map(manifest.entries.map((entry) => [entry.id, entry]));

export function recipeUrl(id, ext = 'html') {
  return absoluteUrl(`/recipes/${id}.${ext}`);
}

export const RECIPES = SCENARIO_RECIPES.map((recipe) => {
  const proof = proofById.get(recipe.proof);
  const stem = proof ? path.basename(proof.artifact).replace(/\.[a-z]+\.html$/, '') : null;
  const image = stem && fs.existsSync(path.join(docsRoot, 'samples/images', `${stem}.light.png`))
    ? `samples/images/${stem}.light.png`
    : null;
  const exact = proof && proof.type === recipe.type;
  return Object.freeze({
    id: recipe.id,
    type: recipe.type,
    typeLabel: TYPE_LABEL[recipe.type] || recipe.type,
    group: recipe.id.startsWith('business-') ? 'Business' : recipe.id.startsWith('finance-') ? 'Finance' : 'Systems and engineering',
    ...recipe.en,
    presentation: recipe.presentation,
    proof: proof ? {
      title: proof.title,
      url: absoluteUrl(`/${proof.artifact}`),
      image: image ? absoluteUrl(`/${image}`) : null,
      imagePath: image,
      exact,
    } : null,
  });
});

// The 40–60 word answer block an answer engine can lift whole.
export function recipeAnswer(recipe) {
  const noun = recipe.type === 'dataflow' ? 'data-flow' : recipe.type;
  const article = /^[aeiou]/.test(noun) ? 'an' : 'a';
  return `Draw it as ${article} ${noun} diagram with the MosoFin-diagram "${recipe.title}" recipe. ${recipe.summary} Your coding agent returns one validated, self-contained HTML file.`;
}
