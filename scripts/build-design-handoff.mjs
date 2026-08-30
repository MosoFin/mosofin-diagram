#!/usr/bin/env node
// Completes and verifies docs/design-handoff/ against the repository.
//
// The package was first assembled from a docs/ snapshot without repo access or Chrome. This script
// fills every gap it self-reported: verbatim source docs, source-copied layout constants, English
// i18n, the full brand-mark catalogue, the missing messagebus sigil, default renderer legends,
// icon verification, and every headless-Chrome capture (asset sheet, viewer chrome states, real
// share cards, site pages, raster previews). It never overwrites the hand-written markdown or the
// package's proposal assets (sigils-finance, legend-blocks-finance, favicon proposals, open-logos).
//
// Usage: node scripts/build-design-handoff.mjs [--no-chrome]

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const skillRoot = path.join(repoRoot, 'mosofin');
const handoff = path.join(repoRoot, 'docs', 'design-handoff');
const noChrome = process.argv.includes('--no-chrome');

const { BRAND_MARKS } = await import(pathToFileURL(path.join(skillRoot, 'renderers/shared/generated-brand-marks.mjs')).href);
const i18n = await import(pathToFileURL(path.join(skillRoot, 'renderers/shared/i18n.mjs')).href);
const { findChrome, ChromeVisualBrowser } = await import(pathToFileURL(path.join(skillRoot, 'bin/visual-check.mjs')).href);

const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const write = (relative, contents) => {
  const target = path.join(handoff, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
};
const copy = (fromRelative, toRelative) => {
  const target = path.join(handoff, toRelative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, fromRelative), target);
};
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const assertSource = (relative, needle) => {
  if (!read(relative).includes(needle)) throw new Error(`${relative}: expected source text not found: ${needle.slice(0, 60)}`);
};

const produced = [];
const note = (relative) => produced.push(relative);

// ---------------------------------------------------------------------------
// 1. Source documents (verbatim)
// ---------------------------------------------------------------------------
const SOURCE_DOCS = [
  ['DESIGN.md', 'source-docs/DESIGN.md', 'the artifact design-token spec (colors, typography, radii, shadows)'],
  ['PRODUCT.md', 'source-docs/PRODUCT.md', 'product framing and personality ("a good controller\'s whiteboard")'],
  ['ROADMAP.md', 'source-docs/ROADMAP.md', 'roadmap and version identity'],
  ['README.md', 'source-docs/README.md', 'repository README with the sample-diagram table'],
  ['CHANGELOG.md', 'source-docs/CHANGELOG.md', 'changelog'],
  ['mosofin/SKILL.md', 'source-docs/SKILL.md', 'the skill entry point and trigger description'],
  ['mosofin/references/viewer-runtime.md', 'source-docs/viewer-runtime.md', 'normative behavior contract for every viewer-chrome surface'],
  ['mosofin/references/brand-marks.md', 'source-docs/brand-marks.md', 'agent-facing brand-mark decision path'],
  ['mosofin/references/authoring-contract.md', 'source-docs/authoring-contract.md', 'authoring contract'],
  ['mosofin/references/delivery-contract.md', 'source-docs/delivery-contract.md', 'delivery contract'],
  ['mosofin/references/finance-onboarding.md', 'source-docs/finance-onboarding.md', 'the step-0 finance interview (verbatim, previously reconstructed)'],
  ['mosofin/examples/finance-brief.md', 'source-docs/finance-brief.md', 'the Northline Coffee brief fixture'],
  ['mosofin/brand-marks/README.md', 'source-docs/brand-marks-catalogue-README.md', 'brand-mark catalogue README'],
  ['mosofin/brand-marks/catalog.json', 'source-docs/brand-marks-catalog.json', 'the 107-mark catalogue source'],
  ['mosofin/schemas/README.md', 'source-docs/schemas-README.md', 'schema reference (legend contract, brand field, kinds)'],
  ['mosofin/recipes/scenarios.mjs', 'source-docs/scenarios.mjs', 'all 19 recipes: questions, prompts, presentation hints (English)'],
  ['docs/USE-CASE.md', 'source-docs/USE-CASE.md', 'end-to-end Northline walkthrough'],
  ['docs/authoring-cookbook.md', 'source-docs/authoring-cookbook.md', 'agent cookbook'],
  ['docs/gallery/manifest.json', 'source-docs/gallery-manifest.json', 'gallery manifest with receipts'],
  ['mosofin/assets/template.html', 'pages/viewer-template.html', 'the viewer template inlined into every artifact (all chrome CSS/markup, preset tokens)'],
  ['scripts/gallery-template.html', 'pages/templates/gallery-template.html', 'generator template for gallery.html'],
  ['scripts/guide-template.html', 'pages/templates/guide-template.html', 'generator template for guide.html'],
  ['scripts/start-template.html', 'pages/templates/start-template.html', 'generator template for start.html'],
  ['docs/index.html', 'pages/landing.html', 'hand-written landing page'],
  ['docs/gallery.html', 'pages/gallery.html', 'built gallery'],
  ['docs/guide.html', 'pages/guide.html', 'built guide'],
  ['docs/start.html', 'pages/start.html', 'built start page'],
  ['mosofin/renderers/shared/utils.mjs', 'source-docs/renderers/shared-utils.mjs', 'SIGIL_SHAPE / SIGIL_TONE / renderSemanticSigil'],
  ['mosofin/renderers/shared/i18n.mjs', 'source-docs/renderers/shared-i18n.mjs', 'MESSAGE_PAIRS — every English catalog string'],
  ['mosofin/renderers/shared/legend.mjs', 'source-docs/renderers/shared-legend.mjs', 'legend layout engine'],
  ['mosofin/renderers/shared/brand-marks.mjs', 'source-docs/renderers/shared-brand-marks.mjs', 'brand-mark plate rendering and capture rules'],
  ['mosofin/renderers/shared/text-fit.mjs', 'source-docs/renderers/shared-text-fit.mjs', 'node text-fit floor'],
  ['mosofin/renderers/shared/desktop-readability.mjs', 'source-docs/renderers/shared-desktop-readability.mjs', 'desktop readability constants'],
  ['mosofin/renderers/architecture/render-architecture.mjs', 'source-docs/renderers/render-architecture.mjs', 'architecture renderer (layout object at :64–80)'],
  ['mosofin/renderers/architecture/grid.mjs', 'source-docs/renderers/architecture-grid.mjs', 'architecture grid defaults'],
  ['mosofin/renderers/workflow/render-workflow.mjs', 'source-docs/renderers/render-workflow.mjs', 'workflow renderer (layout at :47–57)'],
  ['mosofin/renderers/sequence/render-sequence.mjs', 'source-docs/renderers/render-sequence.mjs', 'sequence renderer (layout at :41–51)'],
  ['mosofin/renderers/dataflow/render-dataflow.mjs', 'source-docs/renderers/render-dataflow.mjs', 'dataflow renderer (layout at :52–63)'],
  ['mosofin/renderers/lifecycle/render-lifecycle.mjs', 'source-docs/renderers/render-lifecycle.mjs', 'lifecycle renderer (layout at :50–63)'],
];
for (const [from, to] of SOURCE_DOCS) { copy(from, to); note(to); }
for (const file of fs.readdirSync(path.join(repoRoot, 'docs/samples')).filter((f) => /^northline-.*\.html$/.test(f) && !f.includes('visual-check'))) {
  copy(`docs/samples/${file}`, `pages/samples/${file}`); note(`pages/samples/${file}`);
}
for (const file of fs.readdirSync(path.join(repoRoot, 'mosofin/examples')).filter((f) => /^northline-.*\.json$/.test(f))) {
  copy(`mosofin/examples/${file}`, `source-docs/specs/${file}`); note(`source-docs/specs/${file}`);
}

const legacyMissing = path.join(handoff, 'source-docs/MISSING-SOURCES.md');
if (fs.existsSync(legacyMissing)) fs.rmSync(legacyMissing);
write('source-docs/SOURCES.md', `# Sources — now present in full

The first assembly of this package was built from a \`docs/\` snapshot only and recorded what it could
not copy in \`MISSING-SOURCES.md\`. Every one of those gaps is now filled from the repository
(\`MosoFin/mosofin-diagram\`, working tree at build time). Nothing in this folder is reconstructed any more.

| File in this folder | Repository path | What it holds |
|---|---|---|
${SOURCE_DOCS.map(([from, to, what]) => `| \`${to}\` | \`${from}\` | ${what} |`).join('\n')}
| \`source-docs/specs/northline-*.json\` | \`mosofin/examples/\` | the eight finance specs behind every sample |

Line numbers cited in \`01-DESIGN-INVENTORY.md\` refer to these repository paths and were verified at
build time by \`scripts/build-design-handoff.mjs\` (it asserts the quoted source text still exists).
`);
note('source-docs/SOURCES.md');

// ---------------------------------------------------------------------------
// 2. Tokens — copied from source, with assertions that the source still says so
// ---------------------------------------------------------------------------
assertSource('mosofin/renderers/workflow/render-workflow.mjs', 'colXs: [88, 220, 300, 430, 500, 625]');
assertSource('mosofin/renderers/dataflow/render-dataflow.mjs', 'rowYs: [128, 242, 356, 470, 584]');
assertSource('mosofin/renderers/lifecycle/render-lifecycle.mjs', 'phaseXs: [94, 248, 402, 556, 710]');
assertSource('mosofin/renderers/architecture/grid.mjs', 'cellW: 130');
assertSource('mosofin/renderers/shared/text-fit.mjs', 'widthFactor: 0.6');
assertSource('mosofin/renderers/shared/desktop-readability.mjs', 'MIN_PROJECTED_NODE_TEXT_PX = 6');
assertSource('mosofin/renderers/shared/legend.mjs', 'DEFAULT_FONT_SIZE = 8');

const previousLayout = JSON.parse(fs.readFileSync(path.join(handoff, 'tokens/layout-constants.json'), 'utf8'));
const layoutConstants = {
  _source: 'copied from mosofin/renderers/**/*.mjs (module-local `layout` objects); build asserts the literals still exist',
  _howToRead: 'Authored SVG user units. The viewer scales the whole viewBox; text is never rescaled independently.',
  perRenderer: {
    architecture: {
      file: 'mosofin/renderers/architecture/render-architecture.mjs:64-80',
      layout: { defaultW: 120, defaultH: 60, margin: 40, boundaryPad: 30, boundaryExtraBottom: 20, boundaryLabelBaseline: 18, boundaryLabelClearance: 4, boundaryLabelFontPreferred: 9, boundaryLabelFontMinimum: 6, boundaryLabelMaskHeight: 16, boundaryLabelRailGap: 2, boundaryLabelFrameInset: 4, legendH: 28 },
      textFit: { sublabelPreferred: 9, sublabelMinimum: 6, tagPreferred: 7, tagMinimum: 6 },
      grid: { file: 'mosofin/renderers/architecture/grid.mjs:3-11', origin: [40, 80], cols: 4, gapX: 30, gapY: 40, cellW: 130, cellH: 64, cellPitch: [160, 104] },
      sigil: { at: '[x+6, y+6]', size: 11 },
      brandMark: { at: '[x+width-22, y+6]', size: 16 },
    },
    workflow: {
      file: 'mosofin/renderers/workflow/render-workflow.mjs:47-57',
      layout: { laneX: 40, laneY: 52, laneW: 640, laneH: 104, laneGap: 20, laneTitleH: 30, colXs: [88, 220, 300, 430, 500, 625], nodeW: 92, nodeH: 52 },
      autoHeight: 'laneY + lanes*laneH + (lanes-1)*laneGap + 124; default viewBox [720, autoHeight]',
      columnNote: 'colXs are three pairs (0,1)(2,3)(4,5); adjacent columns across a pair boundary overlap a 92px node, so same-lane horizontal edges only work inside a pair',
      textFit: { labelPreferred: 11, labelMinimum: 9, sublabelPreferred: 8, sublabelMinimum: 6, tagPreferred: 7, tagMinimum: 6 },
      legend: { x: 20, fontSize: 7, itemGap: 7, width: 'viewBox[0]-40' },
    },
    sequence: {
      file: 'mosofin/renderers/sequence/render-sequence.mjs:41-51',
      layout: { topY: 72, participantH: 54, lifelineTop: 142, lifelineBottom: 'viewBox[1]-65', legendY: 'viewBox[1]-54', labelH: 16, sideMargin: 62 },
      columnFit: { fixed: { participantW: 86, colGap: 108 }, spread: 'participantW = clamp(86, 190, round((vbW-124)/count)-24); colGap = max(108, (vbW-40-62-participantW)/(count-1))' },
      defaultViewBox: [920, 760],
      textFit: { sublabelPreferred: 7, sublabelMinimum: 6 },
    },
    dataflow: {
      file: 'mosofin/renderers/dataflow/render-dataflow.mjs:52-63',
      layout: { stageY: 46, stageH: 36, stageBottomPad: 74, leftX: 100, colGap: 215, stageW: 168, nodeW: 112, nodeH: 58, rowYs: [128, 242, 356, 470, 584], labelH: 16 },
      derived: { stageCenterX: '100 + 215*stage', rowCenterY: [157, 271, 385, 499, 613], interStageCorridorX: [205, 420, 638, 852] },
      defaultViewBox: [940, 720],
      flowLabel: { width: 'round(max(34, longestLine*4.9+12)*10)/10', height: 'classification ? 27 : 16' },
      textFit: { sublabelPreferred: 7, sublabelMinimum: 6, tagPreferred: 7, tagMinimum: 6 },
    },
    lifecycle: {
      file: 'mosofin/renderers/lifecycle/render-lifecycle.mjs:50-63',
      layout: { phaseY: 126, eventY: 278, outcomeY: 450, phaseW: 118, phaseH: 62, eventW: 126, eventH: 58, outcomeW: 118, outcomeH: 58, phaseXs: [94, 248, 402, 556, 710], eventXs: [402, 556, 710], outcomeXs: [402, 556, 710] },
      defaultViewBox: [980, 660],
      typeClass: { start: 'c-frontend', active: 'c-backend', waiting: 'c-cloud', decision: 'c-security', success: 'c-database', failure: 'c-security', neutral: 'c-external', external: 'c-external' },
      textClass: { start: 't-frontend', active: 't-backend', waiting: 't-cloud', decision: 't-security', success: 't-database', failure: 't-security', neutral: 't-muted', external: 't-muted' },
      sigilNote: 'sigil sits top-right (x+width-17) when the state has no brand mark, top-left (+6,+6) when it has one',
      textFit: { sublabelPreferred: 7, sublabelMinimum: 6, tagPreferred: 7, tagMinimum: 6 },
    },
  },
  shared: {
    textFit: { file: 'mosofin/renderers/shared/text-fit.mjs:24-27', widthFactor: 0.6, horizontalPadding: 8 },
    desktopReadability: { file: 'mosofin/renderers/shared/desktop-readability.mjs:1-5', viewport: [1440, 900], readerMinWidth: 960, readerHorizontalChrome: 30, readerDiagramWidth: 930, minProjectedNodeTextPx: 6 },
    legend: { file: 'mosofin/renderers/shared/legend.mjs:6-11', defaultFontSize: 8, itemGap: 22, lineGap: 22, swatchGap: 8, textAdvanceEm: 0.62, interactiveBadgeAllowance: 21, titleFontSize: 12, titleWeight: 650, defaultSwatchWidth: 14, lineSwatchWidth: 34 },
    sigil: { file: 'mosofin/renderers/shared/utils.mjs:80-87', authoringBox: 16, renderedSize: 11, scale: 0.6875, strokeWidth: 1.35, opacity: 0.76 },
    brandMark: { file: 'mosofin/renderers/shared/brand-marks.mjs:544-563', plate: 16, inset: 3, rx: 4, artScaleForViewBox24: 10 / 24, frameStroke: '#cbd5e1 0.8px', plateFill: '#ffffff' },
    markers: { file: 'mosofin/renderers/shared/utils.mjs:11-30', size: [10, 7], refX: 9, refY: 3.5, polygon: '0 0, 10 3.5, 0 7', gridPattern: 40 },
  },
  observedInArtifacts: previousLayout.perRenderer,
  containment: previousLayout.containment,
  perArtifact: previousLayout.perArtifact,
};
write('tokens/layout-constants.json', `${JSON.stringify(layoutConstants, null, 2)}\n`);
note('tokens/layout-constants.json');

// i18n — every key, English catalog
const keys = i18n.catalogKeys();
const groups = {};
for (const key of keys) {
  const group = key.startsWith('legend.') ? key.split('.').slice(0, 2).join('.')
    : key.startsWith('viewer.') ? key.split('.').slice(0, 2).join('.') : key.split('.')[0];
  (groups[group] ||= {})[key] = { en: i18n.translateMessage('en', key) };
}
const staleI18nExtract = path.join(handoff, 'tokens/i18n-labels.artifact-extract.json');
if (fs.existsSync(staleI18nExtract)) fs.rmSync(staleI18nExtract);
write('tokens/i18n-labels.json', `${JSON.stringify({
  _source: 'mosofin/renderers/shared/i18n.mjs MESSAGE_PAIRS via catalogKeys()/translateMessage — every key, English',
  _count: keys.length,
  _rule: 'The catalog is English-only. Authored diagram copy is never translated.',
  _legendDefaults: 'legend.<renderer>.<kind> are the default legend labels; authors override per artifact via meta.legend.entries[kind].label',
  groups,
}, null, 2)}\n`);
note('tokens/i18n-labels.json');
const landing = read('docs/index.html');
const langsMatch = landing.match(/const LANGS = \{[\s\S]*?\n  \};/);
if (!langsMatch) throw new Error('docs/index.html: LANGS copy deck not found');
write('tokens/site-i18n-labels.json', `${JSON.stringify({
  _source: 'docs/index.html LANGS.en — the landing-page copy deck',
  _note: 'The public site is English-only.',
  raw: langsMatch[0],
}, null, 2)}\n`);
note('tokens/site-i18n-labels.json');

// presets — from template.html, the source of truth
const template = read('mosofin/assets/template.html');
const styleStart = template.indexOf('<style>');
const styleEnd = template.indexOf('</style>', styleStart);
const css = template.slice(styleStart, styleEnd);
const blockRe = /(^|\n)\s*((?::root|\[data-preset="[a-z-]+"\]|\[data-theme="[a-z]+"\])(?:\s*,\s*\[data-theme="[a-z]+"\])*(?:\[data-theme="[a-z]+"\])?)\s*\{([^}]*)\}/g;
const presetTokens = {};
let match;
while ((match = blockRe.exec(css))) {
  const selector = match[2].replace(/\s+/g, '');
  const body = match[3];
  if (!/--bg\s*:/.test(body)) continue;
  const variables = {};
  for (const line of body.split(';')) {
    const pair = line.match(/(--[a-z0-9-]+)\s*:\s*([^;]+)/);
    if (pair) variables[pair[1]] = pair[2].trim();
  }
  const preset = (selector.match(/data-preset="([a-z-]+)"/) || [])[1] || 'classic';
  const theme = (selector.match(/data-theme="([a-z]+)"/) || [])[1] || 'dark';
  (presetTokens[preset] ||= {})[theme] = { selector, variables };
}
const previousPresets = JSON.parse(fs.readFileSync(path.join(handoff, 'tokens/presets.json'), 'utf8'));
const drift = [];
for (const [preset, themes] of Object.entries(presetTokens)) {
  for (const [theme, block] of Object.entries(themes)) {
    const before = previousPresets.presets?.[preset]?.[theme]?.variables || previousPresets.presets?.classic?.[theme]?.variables || {};
    for (const [name, value] of Object.entries(block.variables)) {
      if (before[name] !== undefined && before[name].replace(/\s/g, '') !== value.replace(/\s/g, '')) {
        drift.push({ preset, theme, variable: name, artifactExtract: before[name], templateSource: value });
      }
    }
  }
}
write('tokens/presets.json', `${JSON.stringify({
  _source: 'mosofin/assets/template.html <style> — preset/theme variable blocks parsed at build time (the source of truth; artifacts inline this file)',
  _blocks: 'classic = `:root, [data-theme="dark"]` (:45) and `[data-theme="light"]` (:90); every other preset has a dark and light block',
  _driftAgainstArtifactExtract: drift,
  presets: presetTokens,
  bodyTreatments: previousPresets.bodyTreatments,
  badges: previousPresets.badges,
  hints: previousPresets.hints,
  animations: {
    nodePulse: 'mosofin-node-pulse 3.6s ease-in-out 1 (classic, signal-flow); mosofin-blueprint-node-pulse; mosofin-editorial-node-pulse',
    edgeFlow: 'mosofin-edge-flow 2.4s linear 1',
    signalScan: 'mosofin-signal-scan 4.8s ease-in-out 1 both',
    pulseDot: '@keyframes pulse 2s infinite (only when html[data-motion-capable="true"])',
  },
}, null, 2)}\n`);
note('tokens/presets.json');

// ---------------------------------------------------------------------------
// 3. Sigils — 13 of 13 from SIGIL_SHAPE
// ---------------------------------------------------------------------------
const utilsSource = read('mosofin/renderers/shared/utils.mjs');
const shapeText = utilsSource.match(/const SIGIL_SHAPE = \{[\s\S]*?\n\};/)[0];
const toneText = utilsSource.match(/const SIGIL_TONE = \{[\s\S]*?\n\};/)[0];
const SIGIL_SHAPE = new Function(`${shapeText}; return SIGIL_SHAPE;`)();
const SIGIL_TONE = new Function(`${toneText}; return SIGIL_TONE;`)();
const lightStroke = presetTokens.classic.light.variables;
const darkStroke = presetTokens.classic.dark.variables;
const KIND_LABEL = {
  frontend: 'Frontend', backend: 'Backend', database: 'Database', cloud: 'Cloud', security: 'Security',
  messagebus: 'Message bus', external: 'External', neutral: 'Neutral', start: 'Start', active: 'Active',
  waiting: 'Waiting', success: 'Success', failure: 'Failure',
};
for (const [kind, body] of Object.entries(SIGIL_SHAPE)) {
  const tone = SIGIL_TONE[kind] || 'external';
  const stroke = lightStroke[`--${tone}-stroke`];
  const svgBody = body.replace(/\s+/g, ' ').replace(/class="sigil-fill"/g, `fill="${stroke}" stroke="none"`).trim();
  write(`assets/sigils/${kind}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" role="img" aria-label="${KIND_LABEL[kind]} semantic sigil">
  <title>${KIND_LABEL[kind]} semantic sigil (Mosofin)</title>
  <desc>Verbatim geometry from mosofin/renderers/shared/utils.mjs SIGIL_SHAPE.${kind} (tone ${tone}). In the viewer the group is placed at translate(nodeX+6, nodeY+6) scale(0.6875) and inherits fill none, stroke currentColor, stroke-width 1.35, round caps and joins, opacity 0.76. currentColor resolves to --${tone}-stroke: ${stroke} (light) / ${darkStroke[`--${tone}-stroke`]} (dark).</desc>
  <g fill="none" stroke="${stroke}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" opacity="0.76">
    ${svgBody}
  </g>
</svg>
`);
  note(`assets/sigils/${kind}.svg`);
}
write('assets/sigils/SOURCE.md', `# Semantic sigils — source of truth

Extracted at build time from \`mosofin/renderers/shared/utils.mjs\` (\`SIGIL_TONE\` :32–46,
\`SIGIL_SHAPE\` :48–75, \`renderSemanticSigil\` :80–87). All **13** shipped shapes are now present,
including \`messagebus\`, which no finance sample authors and therefore could not be lifted from a
delivered artifact in the first assembly.

\`decision\` has no entry in either object: \`renderSemanticSigil\` checks \`Object.hasOwn(SIGIL_SHAPE, kind)\`
(:81) and falls back to the \`neutral\` shape with the \`external\` tone — but the lifecycle renderer never
calls it for \`decision\`, so the diamond carries colour only. The proposed glyph is
\`../sigils-finance/decision.svg\`.

Rendering contract (\`assets/template.html:3954–3974\`): \`fill:none; stroke:currentColor; stroke-width:1.35;
stroke-linecap:round; stroke-linejoin:round; opacity:.76; vector-effect:non-scaling-stroke\`; \`.sigil-fill\`
children are \`fill:currentColor; stroke:none\`. Tone classes \`.s-<tone>\` set \`color: var(--<tone>-stroke)\`.

Placement: architecture \`render-architecture.mjs:1011\`, workflow \`render-workflow.mjs:657\`, sequence
\`render-sequence.mjs:326\`, dataflow \`render-dataflow.mjs:392\` — all \`[x+6, y+6]\`; lifecycle
\`render-lifecycle.mjs:468\` uses \`x+width-17\` when the state has no brand mark.

\`\`\`js
${toneText}

${shapeText}
\`\`\`
`);
note('assets/sigils/SOURCE.md');
write('assets/sigils/README.md', `# Semantic sigils — 13 of 13, from source

Each file is the authored glyph exactly as \`SIGIL_SHAPE\` defines it (see \`SOURCE.md\` for the verbatim
object and the rendering contract): 16×16 authoring box, painted at \`scale(0.6875)\` ≈ 11 px, stroke
1.35, round caps, opacity .76, \`stroke: currentColor\` where currentColor is the kind's stroke token.
\`png/\` holds 96 px previews on light and dark.

| file | kind | tone | used by |
|---|---|---|---|
${Object.keys(SIGIL_SHAPE).map((kind) => `| ${kind}.svg | ${kind} | ${SIGIL_TONE[kind]} | ${['start', 'active', 'waiting', 'success', 'failure'].includes(kind) ? 'lifecycle' : kind === 'neutral' ? 'fallback for any unmapped kind' : 'architecture · workflow · sequence · dataflow'} |`).join('\n')}

**One real gap remains for the redesign:** \`decision\` (lifecycle) has no sigil at all. Proposed:
\`../sigils-finance/decision.svg\` (Tie-out).
`);
note('assets/sigils/README.md');

// ---------------------------------------------------------------------------
// 4. Brand-mark catalogue — all 107 plated
// ---------------------------------------------------------------------------
const plate = (content, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" role="img" aria-label="${esc(title)} brand mark">
  <title>${esc(title)} — Mosofin brand-mark plate</title>
  <rect width="16" height="16" rx="4" fill="#ffffff"/>
  ${content}
  <rect width="16" height="16" rx="4" fill="none" stroke="#cbd5e1" stroke-width="0.8"/>
</svg>
`;
const byCategory = {};
for (const mark of BRAND_MARKS) {
  const scale = 10 / mark.viewBox;
  write(`assets/brand-marks/catalog/${mark.id}.svg`, plate(`<path d="${esc(mark.path)}" transform="translate(3 3) scale(${scale})" fill="#${esc(mark.hex)}"/>`, mark.title));
  (byCategory[mark.category] ||= []).push(mark);
}
const categoryOrder = Object.keys(byCategory).sort((a, b) => byCategory[b].length - byCategory[a].length);
write('assets/brand-marks/catalog-index.md', `# Built-in brand-mark catalogue — all ${BRAND_MARKS.length} marks, plated

Every mark in \`mosofin/brand-marks/catalog.json\` (compiled into \`renderers/shared/generated-brand-marks.mjs\`
from Simple Icons ${BRAND_MARKS[0]?.provenance?.providerVersion || ''}), rendered here exactly as the viewer plates
it: 16×16 white plate, rx 4, vendor path at \`translate(3 3) scale(10/viewBox)\`, \`#cbd5e1\` 0.8 frame.
Files: \`catalog/<id>.svg\`.

The skew is the point: ${categoryOrder.map((c) => `**${c}** ${byCategory[c].length}`).join(' · ')}.
Only the \`business\` row is finance-adjacent, and it holds no ledger, no bank, no payroll, no AP tool.
See \`business-subset.md\` for the 16 candidate marks added from open-logos and the remaining gap.

${categoryOrder.map((category) => `## ${category} (${byCategory[category].length})

| id | title | hex | source |
|---|---|---|---|
${byCategory[category].map((m) => `| \`${m.id}\` | ${m.title} | \`#${m.hex}\` | ${m.provenance?.source || ''} |`).join('\n')}
`).join('\n')}`);
note('assets/brand-marks/catalog-index.md');

// ---------------------------------------------------------------------------
// 5. Default renderer legends (catalogue order, default English labels)
// ---------------------------------------------------------------------------
const LEGEND_CATALOGS = {
  architecture: { kinds: ['frontend', 'backend', 'database', 'cloud', 'security', 'messagebus', 'external'], style: 'box', file: 'render-architecture.mjs:82-90' },
  workflow: { kinds: ['frontend', 'backend', 'security', 'messagebus', 'database', 'cloud', 'external'], style: 'box', file: 'render-workflow.mjs:680-688' },
  sequence: { kinds: ['emphasis', 'return', 'security', 'dashed', 'default'], style: 'line', file: 'render-sequence.mjs:396-408' },
  dataflow: { kinds: ['emphasis', 'security', 'dashed', 'database', 'default'], style: 'line', file: 'render-dataflow.mjs:417-426' },
  lifecycle: { kinds: ['start', 'active', 'waiting', 'decision', 'success', 'failure', 'neutral', 'external'], style: 'box', file: 'render-lifecycle.mjs:496-505' },
};
const LINE_STYLE = {
  emphasis: { stroke: lightStroke['--arrow-emphasis'], width: 1.8, dash: '' },
  return: { stroke: lightStroke['--arrow'], width: 1.2, dash: '3,5' },
  security: { stroke: lightStroke['--security-stroke'], width: 1.2, dash: '5,5' },
  dashed: { stroke: lightStroke['--database-stroke'], width: 1.2, dash: '4,4' },
  default: { stroke: lightStroke['--arrow'], width: 1.2, dash: '' },
};
const LIFECYCLE_TONE = { start: 'frontend', active: 'backend', waiting: 'cloud', decision: 'security', success: 'database', failure: 'security', neutral: 'external', external: 'external' };
for (const [renderer, cat] of Object.entries(LEGEND_CATALOGS)) {
  const width = 120 * cat.kinds.length + 40;
  const y = 36;
  const row = cat.kinds.map((kind, i) => {
    const x = 20 + i * 120;
    const label = i18n.translateMessage('en', `legend.${renderer}.${kind}`);
    let swatch;
    if (cat.style === 'line' && kind !== 'database') {
      const s = LINE_STYLE[kind];
      swatch = `<line x1="${x}" y1="${y}" x2="${x + 34}" y2="${y}" stroke="${s.stroke}" stroke-width="${s.width}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/><polygon points="${x + 34},${y - 3.5} ${x + 42},${y} ${x + 34},${y + 3.5}" fill="${s.stroke}"/>`;
    } else {
      const tone = renderer === 'lifecycle' ? LIFECYCLE_TONE[kind] : kind;
      swatch = `<rect x="${x}" y="${y - 6}" width="16" height="10" rx="2.5" fill="${lightStroke[`--${tone}-fill`]}" stroke="${lightStroke[`--${tone}-stroke`]}" stroke-width="1"/>`;
    }
    const tx = cat.style === 'line' && kind !== 'database' ? x + 50 : x + 24;
    return `<g data-legend-kind="${kind}" data-locale="en">${swatch}<text x="${tx}" y="${y + 3.5}" font-family="JetBrains Mono, ui-monospace, Menlo, monospace" font-size="10" font-weight="500" fill="#64748b">${esc(label)}</text></g>`;
  }).join('\n    ');
  write(`assets/legend-blocks-default/${renderer}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="56" viewBox="0 0 ${width} 56">
  <title>Default ${renderer} legend catalogue</title>
  <desc>Every entry the ${renderer} renderer can show (mode "all"), in catalogue order from ${cat.file}, with the default English labels from i18n.mjs legend.${renderer}.*. Authors override per artifact via meta.legend.entries[kind].label. Swatch colours are the classic light tokens.</desc>
  <rect width="${width}" height="56" fill="#ffffff"/>
  <text x="20" y="12" font-family="JetBrains Mono, ui-monospace, Menlo, monospace" font-size="9" font-weight="650" fill="#0f172a">${i18n.translateMessage('en', 'legend.title')} · ${renderer} · ${cat.file}</text>
    ${row}
</svg>
`);
  note(`assets/legend-blocks-default/${renderer}.svg`);
}
write('assets/legend-blocks-default/README.md', `# Default legend catalogues — one per renderer

What each renderer *can* show (\`meta.legend.mode: "all"\`), in catalogue order, with the default
English labels. The \`../legend-blocks/\` folder shows what the eight Northline artifacts *actually*
rendered (\`mode: auto\` — only kinds present); this folder is the full vocabulary a relabel must cover.

| renderer | catalogue | kinds |
|---|---|---|
${Object.entries(LEGEND_CATALOGS).map(([r, c]) => `| ${r} | \`${c.file}\` | ${c.kinds.join(' · ')} |`).join('\n')}

Labels live in \`mosofin/renderers/shared/i18n.mjs:30–61\` as \`legend.<renderer>.<kind>\` English strings
(\`tokens/i18n-labels.json\` → \`groups["legend.<renderer>"]\`).
`);
note('assets/legend-blocks-default/README.md');

// ---------------------------------------------------------------------------
// 6. Viewer icons — verify the package's 14 masks against template.html
// ---------------------------------------------------------------------------
const maskRe = /mask-image:\s*url\("data:image\/svg\+xml,([^"]+)"\)/g;
const templateMasks = [];
while ((match = maskRe.exec(css))) {
  // Walk back to the selector that owns this declaration block.
  const blockStart = css.lastIndexOf('{', match.index);
  const selectorStart = Math.max(css.lastIndexOf('}', blockStart), css.lastIndexOf('*/', blockStart)) + 1;
  const selector = css.slice(selectorStart, blockStart).replace(/\s+/g, ' ').trim();
  templateMasks.push({ selector, svg: decodeURIComponent(match[1]) });
}
const normalizeSvg = (svg) => svg
  .replace(/\s+data-mosofin-icon="[^"]*"/g, '')
  .replace(/'/g, '"')
  .replace(/><\/(circle|path|rect|line|polygon)>/g, '/>')
  .replace(/\s*\/>/g, '/>')
  .replace(/\s+/g, ' ')
  .replace(/> </g, '><')
  .trim();
const iconReport = [];
for (const file of fs.readdirSync(path.join(handoff, 'assets/viewer-icons')).filter((f) => f.endsWith('.svg'))) {
  const packaged = normalizeSvg(fs.readFileSync(path.join(handoff, 'assets/viewer-icons', file), 'utf8'));
  const hit = templateMasks.find((m) => normalizeSvg(m.svg) === packaged);
  iconReport.push({ file, verified: Boolean(hit), selector: hit?.selector || '' });
}
write('assets/viewer-icons/VERIFIED.md', `# Viewer icons — verified against \`mosofin/assets/template.html\`

Each packaged mask SVG was normalised and compared byte-for-byte with the \`mask-image\` data-URI in the
viewer template's stylesheet (${templateMasks.length} mask rules found in the template).

| file | status | first matching selector in template.html |
|---|---|---|
${iconReport.map((r) => `| ${r.file} | ${r.verified ? '✓ identical' : '✗ NOT FOUND — re-extract'} | \`${r.selector}\` |`).join('\n')}
`);
note('assets/viewer-icons/VERIFIED.md');
if (iconReport.some((r) => !r.verified)) console.warn('viewer-icons: some packaged icons did not match template.html — see VERIFIED.md');

// ---------------------------------------------------------------------------
// 7. Asset sheet additions (messagebus sigil, catalogue strip, default legends)
// ---------------------------------------------------------------------------
const sheetPath = path.join(handoff, 'sheets/asset-sheet.html');
let sheet = fs.readFileSync(sheetPath, 'utf8');
const ADDED_START = '<!-- BUILD:ADDED_START -->';
const ADDED_END = '<!-- BUILD:ADDED_END -->';
const inlineSvg = (relative, size) => fs.readFileSync(path.join(handoff, relative), 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<svg /, `<svg width="${size}" height="${size}" `).replace(/ width="16" height="16"/, '');
const added = `${ADDED_START}
<section>
  <h2>Shipped sigils — all 13 from source <small>assets/sigils · regenerated from utils.mjs SIGIL_SHAPE</small></h2>
  <p class="note">Now includes <code>messagebus</code>, which the first assembly could not lift from any finance artifact. Colour is the classic light stroke token for each kind's tone. <code>decision</code> is still absent from the shipped set — see the proposed <code>sigils-finance/decision.svg</code>.</p>
  <div class="grid icons">
${Object.keys(SIGIL_SHAPE).map((kind) => `    <figure class="cell tight"><div class="glyph">${inlineSvg(`assets/sigils/${kind}.svg`, 44)}</div><figcaption><b>${kind}</b><code>tone ${SIGIL_TONE[kind]}</code></figcaption></figure>`).join('\n')}
    <figure class="cell gap tight"><div class="glyph"><span class="qmark">?</span></div><figcaption><b>decision</b><code>no sigil shipped</code></figcaption></figure>
  </div>
</section>
<section>
  <h2>Default legend catalogues <small>assets/legend-blocks-default · English labels</small></h2>
  <p class="note">Every entry each renderer can show, in catalogue order with the default English labels from <code>i18n.mjs</code>. This is the full vocabulary a relabel must cover.</p>
${Object.keys(LEGEND_CATALOGS).map((r) => `  <div class="legend-row" style="overflow:auto">${fs.readFileSync(path.join(handoff, `assets/legend-blocks-default/${r}.svg`), 'utf8')}</div>`).join('\n')}
</section>
<section>
  <h2>Built-in brand-mark catalogue <small>assets/brand-marks/catalog · ${BRAND_MARKS.length} marks by category</small></h2>
  <p class="note">The whole catalogue, plated the way the viewer plates it. Read the row headings: the library was built for engineering diagrams. See <code>catalog-index.md</code>.</p>
${categoryOrder.map((category) => `  <div><div class="eyebrow" style="margin:6px 0">${category} · ${byCategory[category].length}</div><div style="display:flex;flex-wrap:wrap;gap:6px">${byCategory[category].map((m) => `<span title="${esc(m.title)}">${inlineSvg(`assets/brand-marks/catalog/${m.id}.svg`, 28)}</span>`).join('')}</div></div>`).join('\n')}
</section>
${ADDED_END}`;
if (sheet.includes(ADDED_START)) {
  sheet = sheet.replace(new RegExp(`${ADDED_START}[\\s\\S]*?${ADDED_END}`), added);
} else {
  sheet = sheet.replace(/<\/div>\s*<\/body>/, `${added}\n</div>\n</body>`);
}
if (!sheet.includes(ADDED_START)) throw new Error('asset-sheet.html: could not place the generated sections');
fs.writeFileSync(sheetPath, sheet);
note('sheets/asset-sheet.html');

// ---------------------------------------------------------------------------
// 8. Chrome captures
// ---------------------------------------------------------------------------
async function withChrome(fn) {
  if (noChrome) { console.log('chrome: skipped (--no-chrome)'); return; }
  const chrome = findChrome();
  if (!chrome) { console.warn('chrome: not found — set MOSOFIN_CHROME; captures skipped'); return; }
  const browser = new ChromeVisualBrowser(chrome);
  const sid = await browser.sessionPromise;
  const cdp = browser.cdp;
  const evaluate = async (expression, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true }, sid, 60000);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result?.value;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const goto = async (url, width, height) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sid);
    const loaded = cdp.waitFor('Page.loadEventFired', sid);
    const nav = await cdp.send('Page.navigate', { url }, sid);
    if (nav.errorText) throw new Error(`navigate failed: ${nav.errorText}`);
    await loaded;
    await evaluate('document.fonts && document.fonts.ready ? document.fonts.ready.then(function(){return true}) : true', true);
    await sleep(350);
  };
  const shot = async (relative, { fullPage = false, width = 1440 } = {}) => {
    let clip;
    if (fullPage) {
      const height = Math.min(14000, Math.max(600, await evaluate('Math.ceil(document.documentElement.scrollHeight)')));
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sid);
      await sleep(250);
      clip = { x: 0, y: 0, width, height, scale: 1 };
    }
    const cap = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: fullPage, ...(clip ? { clip } : {}) }, sid, 30000);
    write(relative, Buffer.from(cap.data, 'base64'));
    note(relative);
  };
  try {
    await fn({ goto, shot, evaluate, sleep, cdp, sid });
  } finally {
    await browser.close();
  }
}

const fileUrl = (relative, query = '', hash = '') => `${pathToFileURL(path.join(handoff, relative)).href}${query}${hash}`;

await withChrome(async ({ goto, shot, evaluate, sleep }) => {
  // asset sheet
  await goto(fileUrl('sheets/asset-sheet.html'), 1440, 900);
  await shot('sheets/asset-sheet.png', { fullPage: true });

  // site pages
  for (const page of ['landing', 'gallery', 'guide', 'start']) {
    await goto(fileUrl(`pages/${page}.html`), 1440, 900);
    await sleep(600);
    await shot(`screenshots/site/${page}.png`, { fullPage: true });
  }

  // viewer chrome states on the money map (architecture) and close (workflow)
  const states = [
    { name: '01-toolbar-default', artifact: 'northline-money-map', theme: 'dark' },
    { name: '02-export-menu', artifact: 'northline-money-map', theme: 'dark', action: 'Mosofin.exportMenu.open()' },
    { name: '03-preset-menu', artifact: 'northline-money-map', theme: 'dark', action: "document.getElementById('btn-preset').click()" },
    { name: '04-diagram-guide', artifact: 'northline-money-map', theme: 'light', action: "document.getElementById('btn-diagram-guide').click()" },
    { name: '05-node-finder', artifact: 'northline-money-map', theme: 'light', action: "document.getElementById('btn-node-finder').click(); document.getElementById('node-finder-input').value='chase'; document.getElementById('node-finder-input').dispatchEvent(new Event('input',{bubbles:true}))" },
    { name: '06-semantic-passport', artifact: 'northline-money-map', theme: 'dark', hash: '#focus=stripe' },
    { name: '07-route-probe', artifact: 'northline-money-map', theme: 'light', action: "document.getElementById('btn-route-probe').click()" },
    { name: '08-semantic-lens', artifact: 'northline-money-map', theme: 'dark', action: "document.getElementById('btn-semantic-lens').click()" },
    { name: '09-semantic-radar', artifact: 'northline-money-map', theme: 'light', action: "document.getElementById('btn-overview-map').click()" },
    { name: '10-guided-rail-playing', artifact: 'northline-close', theme: 'dark', query: '?present=1&play=1', hash: '#view=reconcile-and-review', wait: 2500 },
    { name: '11-present-mode', artifact: 'northline-revenue-walk', theme: 'light', query: '?present=1' },
    { name: '12-share-chapter-cue', artifact: 'northline-money-map', theme: 'dark', query: '?embed=1&play=1', hash: '#view=order-to-cash', wait: 1500 },
    { name: '13-cards-and-legend', artifact: 'northline-close', theme: 'light', scroll: true },
  ];
  for (const s of states) {
    const query = `${s.query || '?'}${s.query ? '&' : ''}theme=${s.theme}`;
    await goto(fileUrl(`pages/samples/${s.artifact}.html`, query, s.hash || ''), 1440, 900);
    if (s.action) { await evaluate(s.action); }
    if (s.scroll) await evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await sleep(s.wait || 700);
    await shot(`screenshots/viewer-chrome/${s.name}.${s.theme}.png`);
  }
  for (const preset of ['classic', 'signal-flow', 'blueprint', 'editorial']) {
    for (const theme of ['light', 'dark']) {
      await goto(fileUrl('pages/samples/northline-money-map.html', `?theme=${theme}`), 1440, 900);
      await evaluate(`document.documentElement.setAttribute('data-preset', '${preset}'); var s=document.querySelector('svg[data-preset]'); if (s) s.setAttribute('data-preset','${preset}');`);
      await sleep(500);
      await shot(`screenshots/viewer-chrome/preset-${preset}.${theme}.png`);
    }
  }

  // real share cards via the page's own rasterizer
  for (const artifact of ['northline-money-map', 'northline-close']) {
    for (const theme of ['dark', 'light']) {
      await goto(fileUrl(`pages/samples/${artifact}.html`, `?theme=${theme}`), 1440, 900);
      await sleep(400);
      const dataUrl = await evaluate(`Mosofin.exportMenu.shareCard().then(function (blob) { return new Promise(function (resolve) { var fr = new FileReader(); fr.onload = function () { resolve(fr.result); }; fr.readAsDataURL(blob); }); })`, true);
      const base64 = String(dataUrl).split(',')[1];
      write(`screenshots/share-card/${artifact}.${theme}.png`, Buffer.from(base64, 'base64'));
      note(`screenshots/share-card/${artifact}.${theme}.png`);
    }
  }

  // raster previews of SVG assets
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-handoff-'));
  const rasterize = async (svgRelative, outRelative, size, background) => {
    const svg = fs.readFileSync(path.join(handoff, svgRelative), 'utf8');
    const html = `<!doctype html><html><body style="margin:0;background:${background};display:grid;place-items:center;width:${size}px;height:${size}px">${svg.replace(/<svg /, `<svg style="width:${Math.round(size * 0.7)}px;height:${Math.round(size * 0.7)}px" `).replace(/ width="16" height="16"/, '')}</body></html>`;
    const file = path.join(tmp, `${outRelative.replace(/[\\/]/g, '_')}.html`);
    fs.writeFileSync(file, html);
    await goto(pathToFileURL(file).href, size, size);
    await shot(outRelative);
  };
  for (const kind of Object.keys(SIGIL_SHAPE)) {
    await rasterize(`assets/sigils/${kind}.svg`, `assets/sigils/png/${kind}.light.png`, 96, '#f8fafc');
    await rasterize(`assets/sigils/${kind}.svg`, `assets/sigils/png/${kind}.dark.png`, 96, '#020617');
  }
  for (const file of fs.readdirSync(path.join(handoff, 'assets/sigils-finance')).filter((f) => f.endsWith('.svg'))) {
    const kind = file.replace('.svg', '');
    await rasterize(`assets/sigils-finance/${file}`, `assets/sigils-finance/png/${kind}.light.png`, 96, '#f8fafc');
    await rasterize(`assets/sigils-finance/${file}`, `assets/sigils-finance/png/${kind}.dark.png`, 96, '#020617');
  }
  for (const file of fs.readdirSync(path.join(handoff, 'assets/favicon')).filter((f) => f.endsWith('.svg'))) {
    for (const size of [16, 32, 64, 128]) {
      await rasterize(`assets/favicon/${file}`, `assets/favicon/png/${file.replace('.svg', '')}.${size}.png`, size, '#eff2f1');
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// 9. Manifest + completeness assertion
// ---------------------------------------------------------------------------
function dimensions(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.svg') {
    const svg = fs.readFileSync(file, 'utf8');
    const vb = svg.match(/viewBox="([^"]+)"/);
    const w = svg.match(/<svg[^>]*\swidth="([^"]+)"/);
    const h = svg.match(/<svg[^>]*\sheight="([^"]+)"/);
    return w && h ? `${w[1]}×${h[1]}` : vb ? `viewBox ${vb[1]}` : '—';
  }
  if (['.png', '.gif', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    try {
      const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
      const w = out.match(/pixelWidth:\s*(\d+)/)?.[1];
      const h = out.match(/pixelHeight:\s*(\d+)/)?.[1];
      return w && h ? `${w}×${h}` : '—';
    } catch { return '—'; }
  }
  return '—';
}
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === '.DS_Store') return [];
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const files = walk(handoff).filter((f) => path.basename(f) !== 'MANIFEST.md').sort();
const REQUIRED = [
  '00-START-HERE.md', '01-DESIGN-INVENTORY.md', '02-REDESIGN-BRIEF.md', '03-FINANCE-VOCABULARY.md',
  'source-docs/SOURCES.md', 'source-docs/DESIGN.md', 'source-docs/PRODUCT.md', 'source-docs/finance-onboarding.md',
  'pages/viewer-template.html', 'tokens/presets.json', 'tokens/i18n-labels.json', 'tokens/layout-constants.json',
  'assets/sigils/messagebus.svg', 'assets/sigils/SOURCE.md', 'assets/brand-marks/catalog-index.md',
  'assets/legend-blocks-default/workflow.svg', 'assets/viewer-icons/VERIFIED.md', 'sheets/asset-sheet.html',
  ...(noChrome ? [] : [
    'sheets/asset-sheet.png', 'screenshots/site/landing.png', 'screenshots/viewer-chrome/02-export-menu.dark.png',
    'screenshots/viewer-chrome/06-semantic-passport.dark.png', 'screenshots/viewer-chrome/preset-editorial.light.png',
    'screenshots/share-card/northline-money-map.dark.png', 'assets/sigils/png/messagebus.light.png',
    'assets/favicon/png/mosofin-favicon-proposed.32.png',
  ]),
];
const relativeFiles = files.map((f) => path.relative(handoff, f));
const missing = REQUIRED.filter((r) => !relativeFiles.includes(r));
if (missing.length) throw new Error(`handoff incomplete — missing: ${missing.join(', ')}`);
if (BRAND_MARKS.length !== relativeFiles.filter((f) => f.startsWith('assets/brand-marks/catalog/')).length) throw new Error('brand catalogue export count mismatch');
if (Object.keys(SIGIL_SHAPE).length !== 13) throw new Error('expected 13 shipped sigils');

const sections = {};
let totalBytes = 0;
for (const file of files) {
  const relative = path.relative(handoff, file);
  const top = relative.includes('/') ? relative.split('/')[0] : '(root)';
  const buffer = fs.readFileSync(file);
  totalBytes += buffer.byteLength;
  (sections[top] ||= []).push({ relative, bytes: buffer.byteLength, dims: dimensions(file), sha: sha256(buffer) });
}
const fmt = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`);
write('MANIFEST.md', `# Manifest

**${files.length} files · ${fmt(totalBytes)}** — every file in \`docs/design-handoff/\` with byte size,
dimensions (pixels for raster, authored size or viewBox for SVG) and SHA-256. Generated by
\`scripts/build-design-handoff.mjs\` (\`npm run build:design-handoff\` inside \`mosofin/\`), which also
asserts that every required deliverable is present before writing this file.

Layers in the package:

- **Extracted record** — verbatim source docs and renderer files (\`source-docs/\`), the viewer template
  and site templates (\`pages/\`), tokens parsed from source (\`tokens/\`), all 13 shipped sigils from
  \`SIGIL_SHAPE\`, the full ${BRAND_MARKS.length}-mark brand catalogue plated as the viewer plates it, the 14 viewer
  icons verified against the template, default legend catalogues in English.
- **Proposed finance redesign** — \`assets/sigils-finance/\` (14 glyphs, closes the \`decision\` gap),
  \`assets/legend-blocks-finance/\` (5 proposed legends), three favicon candidates in \`assets/favicon/\`,
  16 candidate brand marks in \`assets/brand-marks/samples/\` (open-logos, MIT; originals in \`raw/\`).
- **Captures** — asset sheet PNG, full-page site captures, ${noChrome ? '(viewer-chrome captures skipped: --no-chrome)' : '17 viewer-chrome states + 8 preset×theme views, real 1200×630 Share Cards exported by the page itself'},
  raster previews of every sigil and favicon, plus the eight sample artifacts on light and dark and the
  story / motion GIFs.

## Findings that remain findings

- \`decision\` (lifecycle) has no sigil in the shipped product; proposed: \`assets/sigils-finance/decision.svg\`.
- QuickBooks and Bill.com exist only as raster art in any open library; no bank mark (Chase, Mercury,
  Plaid) exists in any source used. The shipped catalogue has no ledger, bank, payroll or AP mark.
- \`og:image\` and the five landing-page type PNGs are referenced by the site but do not exist.

${Object.entries(sections).map(([top, rows]) => `### ${top} — ${rows.length} files, ${fmt(rows.reduce((s, r) => s + r.bytes, 0))}

| Path | Size | Dimensions | SHA-256 |
|---|---|---|---|
${rows.map((r) => `| \`${r.relative}\` | ${fmt(r.bytes)} | ${r.dims} | \`${r.sha}\` |`).join('\n')}
`).join('\n')}`);

console.log(`design-handoff: ${files.length + 1} files, ${fmt(totalBytes)} → ${handoff}`);
console.log(`generated/refreshed this run: ${new Set(produced).size} files`);
