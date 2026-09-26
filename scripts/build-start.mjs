#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIO_RECIPES } from '../mosofin/recipes/scenarios.mjs';
import { siteFooter, siteFooterStyles } from './site-footer.mjs';
import { absoluteUrl, breadcrumb, seoHead } from './site-seo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const templatePath = path.join(__dirname, 'start-template.html');
const outputPath = path.resolve(process.argv[2] || path.join(repoRoot, 'docs/start.html'));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'mosofin/package.json'), 'utf8'));

const START_RECIPE_IDS = Object.freeze({
  architecture: 'system-overview',
  workflow: 'agent-tool-call',
  sequence: 'api-request',
  dataflow: 'event-stream',
  lifecycle: 'object-lifecycle',
  pillars: 'business-pillars',
});

const startData = Object.fromEntries(Object.entries(START_RECIPE_IDS).map(([type, id]) => {
  const recipe = SCENARIO_RECIPES.find((candidate) => candidate.id === id);
  if (!recipe || recipe.type !== type) {
    throw new Error(`Missing canonical start recipe ${JSON.stringify(id)} for ${type}.`);
  }
  return [type, {
    id: recipe.id,
    type: recipe.type,
    proof: recipe.proof,
    presentation: recipe.presentation,
    en: recipe.en,
  }];
}));

const startJson = JSON.stringify(startData)
  .replaceAll('&', '\\u0026')
  .replaceAll('<', '\\u003c')
  .replaceAll('>', '\\u003e');

const startDescription = 'Add the skill, describe the business, ask one question, and share the map. Install MosoFin-diagram for Claude Code, Cursor, Codex CLI or OpenCode.';
const START_STEPS = [
  ['Add the skill', 'Install MosoFin-diagram into your coding agent with one command.'],
  ['Describe the business', 'Answer a short interview: what the business does, its entities, and which system owns each domain.'],
  ['Ask one question', 'Ask the one question the diagram must answer; the skill picks the diagram type.'],
  ['Share the map', 'Open the self-contained HTML, explore it, and forward it.'],
];
const replacements = {
  '[[SEO_DESCRIPTION]]': startDescription,
  '[[SEO_HEAD]]': seoHead({
    path: '/start.html',
    title: 'Get Started with MosoFin-diagram — Four Steps to a Shared Map',
    description: startDescription,
    jsonLd: [
      breadcrumb('Get started', '/start.html'),
      {
        '@type': 'HowTo',
        name: 'Make a business diagram with MosoFin-diagram',
        url: absoluteUrl('/start.html'),
        totalTime: 'PT10M',
        tool: [{ '@type': 'HowToTool', name: 'A coding agent such as Claude Code, Cursor, Codex CLI or OpenCode' }],
        step: START_STEPS.map(([name, text], index) => ({ '@type': 'HowToStep', position: index + 1, name, text })),
      },
    ],
  }),
  '[[MOSOFIN_VERSION]]': packageJson.version,
  '[[SITE_FOOTER]]': siteFooter({ version: packageJson.version, page: 'start' }),
  '[[SITE_FOOTER_STYLES]]': siteFooterStyles(),
  '[[START_JSON]]': startJson,
};

let output = fs.readFileSync(templatePath, 'utf8');
for (const [placeholder, value] of Object.entries(replacements)) {
  output = output.replaceAll(placeholder, value);
}

if (/\[\[[A-Z0-9_]+\]\]/.test(output)) {
  throw new Error('Start template still contains unresolved placeholders.');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(`Built ${outputPath} with ${Object.keys(startData).length} bounded starts.`);
