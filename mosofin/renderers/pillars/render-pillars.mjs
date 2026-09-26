// Pillars renderer — a temple-shaped "operating model on one page".
//
// A pillar diagram has no relationships. It states one shared goal (the roof),
// the domains that hold it up (the pillars, each owned by one system of record)
// and the enablers everything stands on (the foundation). In Mosofin the shape
// is a direct rendering of the business brief: the roof is the one-sentence
// business, each pillar is a domain with its system of record on the capital
// and the facts that system owns in the shaft, and the foundation names the
// entity and the truth rules. Nothing here implies a flow, a tie-out, or an
// amount, so the finance guardrails stay intact without any routing gates.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, renderDefinitions, renderSemanticSigil, textUnits } from '../shared/utils.mjs';
import {
  animateAttr,
  focusNodeAttrs,
  focusNodeTitle,
  loadDiagramWithBrandMarks,
  writeDiagram,
  svgAccessibleText,
  svgRootAttrs,
} from '../shared/cli.mjs';
import { throwDiagnosticProblems } from '../shared/diagnostics.mjs';
import { resolveLegend, renderLegend as renderResolvedLegend } from '../shared/legend.mjs';
import { fittedNodeFontSize, minimumNodeTextWidth, nodeTextFit } from '../shared/text-fit.mjs';
import { brandMetadataFor, renderBrandMark } from '../shared/brand-marks.mjs';
import { renderLogoNode, renderLogolessBox } from '../shared/node-style.mjs';
import { renderDomainIcon } from '../shared/domain-icons.mjs';
import { translateMessage as i18nText } from '../shared/i18n.mjs';
import { asArray } from '../shared/geometry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { diagram: doc, template, outPath } = await loadDiagramWithBrandMarks({
  rendererDir: __dirname,
  diagramType: 'pillars',
  defaultExample: 'northline-operating-pillars.pillars.json',
});

// ---- Layout budget -----------------------------------------------------------
// Widths derive from the viewBox width; heights derive from the content. The
// authored viewBox may only widen or lengthen the canvas, never compress it.
const layout = {
  margin: 72,
  roofTop: 30,
  pedimentH: 28,
  lintelH: 46,
  roofGap: 16,
  pillarGap: 28,
  capitalH: 64,
  itemLine: 22,
  shaftPadTop: 12,
  shaftPadBottom: 8,
  minItemLines: 3,
  plinthH: 20,
  foundationGap: 18,
  foundationH: 52,
  foundationBlockGap: 16,
  legendReserve: 76,
  minPillarW: 96,
};

const textFit = {
  roofLabel: [14, 10],
  roofSublabel: [9.5, 8],
  label: [11, 8],
  sublabel: [8, 7],
  item: [8.5, 7.5],
  tag: [7.5, 7],
  foundationLabel: [11, 8],
  foundationSublabel: [8, 7],
};

const fillClass = {
  frontend: 'c-frontend',
  backend: 'c-backend',
  database: 'c-database',
  cloud: 'c-cloud',
  security: 'c-security',
  messagebus: 'c-messagebus',
  external: 'c-external',
};

const textClass = {
  frontend: 't-frontend',
  backend: 't-backend',
  database: 't-database',
  cloud: 't-cloud',
  security: 't-security',
  messagebus: 't-messagebus',
  external: 't-external',
};

const pillars = asArray(doc.pillars);
const foundation = asArray(doc.foundation);
const roof = doc.roof || {};

const requestedViewBox = doc.meta?.viewBox;
const width = requestedViewBox?.[0] ?? 960;
const contentX = layout.margin;
const contentW = width - layout.margin * 2;
const lintelY = layout.roofTop + layout.pedimentH;
const lintelBottom = lintelY + layout.lintelH;
const pillarTop = lintelBottom + layout.roofGap;
const pillarCount = pillars.length || 1;
const pillarW = Math.round(((contentW - layout.pillarGap * (pillarCount - 1)) / pillarCount) * 10) / 10;
const itemLines = Math.max(layout.minItemLines, ...pillars.map((pillar) => asArray(pillar.items).length));
const shaftH = layout.shaftPadTop + itemLines * layout.itemLine + layout.shaftPadBottom;
const pillarH = layout.capitalH + shaftH + layout.plinthH;
const pillarBottom = pillarTop + pillarH;
const foundationY = pillarBottom + layout.foundationGap;
const contentBottom = foundation.length ? foundationY + layout.foundationH : pillarBottom;
const requiredHeight = contentBottom + layout.legendReserve;
const viewBox = [width, requestedViewBox?.[1] ?? requiredHeight];

function pillarGeometry(index) {
  const x = Math.round((contentX + index * (pillarW + layout.pillarGap)) * 10) / 10;
  return {
    x,
    y: pillarTop,
    width: pillarW,
    height: pillarH,
    cx: Math.round((x + pillarW / 2) * 10) / 10,
    capital: { x, y: pillarTop, width: pillarW, height: layout.capitalH },
    shaft: { x, y: pillarTop + layout.capitalH, width: pillarW, height: shaftH },
    plinth: { x, y: pillarBottom - layout.plinthH, width: pillarW, height: layout.plinthH },
  };
}

function foundationGeometry(index) {
  const count = foundation.length || 1;
  const blockW = Math.round(((contentW - layout.foundationBlockGap * (count - 1)) / count) * 10) / 10;
  const x = Math.round((contentX + index * (blockW + layout.foundationBlockGap)) * 10) / 10;
  return { x, y: foundationY, width: blockW, height: layout.foundationH, cx: Math.round((x + blockW / 2) * 10) / 10 };
}

const measuredPillars = pillars.map((pillar, index) => ({ ...pillar, ...pillarGeometry(index) }));
const measuredFoundation = foundation.map((block, index) => ({ ...block, ...foundationGeometry(index) }));

// ---- Validation ---------------------------------------------------------------
function fitProblem(field, value, availableWidth, minimum, owner) {
  const required = minimumNodeTextWidth(value, minimum);
  const available = Math.max(0, availableWidth - nodeTextFit.horizontalPadding);
  if (required <= available) return null;
  return `${field} "${value}" needs ~${Math.ceil(required)}px at the ${minimum}px legible minimum, but ${owner} provides ${Math.floor(available)}px — shorten the ${field.toLowerCase()}, use fewer pillars, or widen meta.viewBox[0].`;
}

function validatePillars() {
  const problems = [];
  if (doc.schema_version !== 1) problems.push('Pillars files must set "schema_version": 1.');
  if (doc.diagram_type !== 'pillars') problems.push('Pillars files must set "diagram_type": "pillars".');
  if (!doc.meta?.title) problems.push('Pillars files must include meta.title.');
  if (!roof.id || !roof.label) problems.push('Pillars diagrams need a roof with an id and a label — the shared goal every pillar holds up.');
  if (pillars.length < 3 || pillars.length > 6) problems.push(`Pillars diagrams need 3–6 pillars (found ${pillars.length}) — group by domain and name the tools in the sublabel.`);
  if (doc.cards !== undefined && !Array.isArray(doc.cards)) problems.push('Pillars "cards" must be an array.');

  const ids = new Map();
  for (const [collection, node] of [
    ['roof', roof],
    ...pillars.map((pillar) => ['pillars', pillar]),
    ...foundation.map((block) => ['foundation', block]),
  ]) {
    if (!node?.id) continue;
    if (ids.has(node.id)) {
      problems.push(`Semantic id "${node.id}" is used by both ${ids.get(node.id)} and ${collection} — ids must be unique across roof, pillars, and foundation.`);
    }
    ids.set(node.id, collection);
  }

  if (requestedViewBox && requestedViewBox[1] < requiredHeight) {
    problems.push(`viewBox height ${requestedViewBox[1]} is too short for ${pillars.length} pillars with ${itemLines} item lines${foundation.length ? ' and a foundation' : ''} — set meta.viewBox[1] to at least ${requiredHeight} or omit meta.viewBox.`);
  }
  if (pillarW < layout.minPillarW) {
    const requiredWidth = Math.ceil(layout.minPillarW * pillarCount + layout.pillarGap * (pillarCount - 1) + layout.margin * 2);
    problems.push(`${pillars.length} pillars leave only ${pillarW}px per pillar (minimum ${layout.minPillarW}px) — use fewer pillars or widen meta.viewBox[0] to at least ${requiredWidth}.`);
  }

  const roofProblem = roof.label ? fitProblem('Roof label', roof.label, contentW - 16, textFit.roofLabel[1], 'the roof') : null;
  if (roofProblem) problems.push(roofProblem);
  const roofSubProblem = roof.sublabel ? fitProblem('Roof sublabel', roof.sublabel, contentW - 16, textFit.roofSublabel[1], 'the roof') : null;
  if (roofSubProblem) problems.push(roofSubProblem);

  for (const pillar of measuredPillars) {
    const owner = `pillar "${pillar.id}"`;
    for (const [field, value, [, minimum]] of [
      ['Label', pillar.label, textFit.label],
      ['Sublabel', pillar.sublabel, textFit.sublabel],
      ['Tag', pillar.tag, textFit.tag],
    ]) {
      if (!value) continue;
      const problem = fitProblem(field, value, pillar.width, minimum, owner);
      if (problem) problems.push(problem);
    }
    asArray(pillar.items).forEach((item) => {
      const problem = fitProblem('Item', item, pillar.width - 18, textFit.item[1], owner);
      if (problem) problems.push(problem);
    });
  }

  for (const block of measuredFoundation) {
    const owner = `foundation block "${block.id}"`;
    for (const [field, value, [, minimum]] of [
      ['Label', block.label, textFit.foundationLabel],
      ['Sublabel', block.sublabel, textFit.foundationSublabel],
    ]) {
      if (!value) continue;
      const problem = fitProblem(field, value, block.width, minimum, owner);
      if (problem) problems.push(problem);
    }
  }

  if (problems.length) {
    throwDiagnosticProblems('Pillars layout validation failed', problems, {
      subject: { diagramType: 'pillars' },
    });
  }
}

// ---- Rendering ----------------------------------------------------------------
// Structural chrome (pediment, lintel, shafts) reuses the workflow lane tokens
// with the dash removed, so every preset and theme already styles it.
const FRAME = 'class="c-lane" style="stroke-dasharray:none"';

let step = 0;
const stepFor = new Map();
stepFor.set(roof.id, step);
for (const pillar of pillars) stepFor.set(pillar.id, ++step);
for (const block of foundation) stepFor.set(block.id, ++step);

function renderRoof() {
  const apexX = contentX + contentW / 2;
  const hasSub = Boolean(roof.sublabel);
  const labelY = hasSub ? lintelY + 20 : lintelY + layout.lintelH / 2 + 5;
  const labelFont = fittedNodeFontSize(roof.label, contentW - 16, ...textFit.roofLabel);
  const sub = hasSub
    ? `\n            <text data-detail="context" x="${apexX}" y="${lintelY + 36}" class="t-muted" font-size="${fittedNodeFontSize(roof.sublabel, contentW - 16, ...textFit.roofSublabel)}" text-anchor="middle">${esc(roof.sublabel)}</text>`
    : '';
  const passport = {
    kind: 'roof',
    sublabel: roof.sublabel,
    context: i18nText(doc.meta.locale, 'node.context.pillars.roof'),
  };
  return `        <g ${focusNodeAttrs(roof.id, roof.label, passport, doc.meta.locale)}>
          ${focusNodeTitle(roof.label, passport)}
          <g class="pillars-roof">
            <polygon points="${contentX},${lintelY} ${apexX},${layout.roofTop} ${contentX + contentW},${lintelY}" ${FRAME} stroke-width="1"/>
            <rect x="${contentX}" y="${lintelY}" width="${contentW}" height="${layout.lintelH}" class="c-mask"/>
            <rect x="${contentX}" y="${lintelY}" width="${contentW}" height="${layout.lintelH}" ${FRAME}${animateAttr(doc.meta, 'node', stepFor.get(roof.id))} stroke-width="1.2"/>
            <text data-node-label=""${hasSub ? ' data-detail-anchor=""' : ''} x="${apexX}" y="${labelY}" class="t-primary" font-size="${labelFont}" font-weight="700" text-anchor="middle">${esc(roof.label)}</text>${sub}
          </g>
        </g>`;
}

function renderPillar(pillar) {
  const fill = fillClass[pillar.type] || 'c-external';
  const accent = textClass[pillar.type] || 't-muted';
  const { capital, shaft, plinth, cx } = pillar;
  const hasSub = Boolean(pillar.sublabel);
  const labelY = hasSub ? capital.y + 38 : capital.y + 42;
  const labelFont = fittedNodeFontSize(pillar.label, capital.width, ...textFit.label);
  const sub = hasSub
    ? `\n          <text data-detail="context" x="${cx}" y="${capital.y + 52}" class="t-muted" font-size="${fittedNodeFontSize(pillar.sublabel, capital.width, ...textFit.sublabel)}" text-anchor="middle">${esc(pillar.sublabel)}</text>`
    : '';
  const brand = renderBrandMark(pillar, { x: capital.x + capital.width - 22, y: capital.y + 6 })
    || renderDomainIcon(pillar, { x: capital.x + capital.width - 20, y: capital.y + 7, size: 13, kind: pillar.type });
  const logoArt = renderLogoNode(pillar, { ...capital, label: pillar.label });
  const logoLayer = logoArt || renderLogolessBox(pillar, { ...capital, kind: pillar.type });
  const items = asArray(pillar.items).map((item, index) => {
    const baseline = shaft.y + layout.shaftPadTop + layout.itemLine * index + 13;
    const font = fittedNodeFontSize(item, shaft.width - 18, ...textFit.item);
    return `\n            <circle cx="${shaft.x + 13}" cy="${baseline - 3}" r="1.7" class="${accent}"/>
            <text data-detail="context" x="${shaft.x + 21}" y="${baseline}" class="t-primary" font-size="${font}">${esc(item)}</text>`;
  }).join('');
  const tag = pillar.tag
    ? `\n            <text data-detail="fine" x="${cx}" y="${plinth.y + plinth.height - 6.5}" class="${accent}" font-size="${fittedNodeFontSize(pillar.tag, plinth.width, ...textFit.tag)}" font-weight="600" text-anchor="middle">${esc(pillar.tag)}</text>`
    : '';
  const passport = {
    kind: pillar.type,
    sublabel: pillar.sublabel,
    tag: pillar.tag,
    context: i18nText(doc.meta.locale, 'node.context.pillars'),
    ...brandMetadataFor(pillar),
  };
  return `        <g ${focusNodeAttrs(pillar.id, pillar.label, passport, doc.meta.locale)}>
          ${focusNodeTitle(pillar.label, passport)}
          <rect x="${capital.x}" y="${capital.y}" width="${capital.width}" height="${capital.height}" rx="6" class="c-mask"/>
          <rect x="${capital.x}" y="${capital.y}" width="${capital.width}" height="${capital.height}" rx="6" class="${fill}"${animateAttr(doc.meta, 'node', stepFor.get(pillar.id))} stroke-width="1.5"/>
          ${renderSemanticSigil(pillar.type, { x: capital.x + 6, y: capital.y + 6 })}${brand ? `\n          ${brand}` : ''}
          <text data-node-label=""${hasSub ? ' data-detail-anchor=""' : ''} x="${cx}" y="${labelY}" class="t-primary" font-size="${labelFont}" font-weight="600" text-anchor="middle">${esc(pillar.label)}</text>${sub}
          ${logoLayer}
          <text class="node-logo-label" x="${cx}" y="${capital.y + capital.height - 9}" font-size="${Math.min(labelFont, 9.5)}" font-weight="600" text-anchor="middle">${esc(pillar.label)}</text>
          <g class="pillars-shaft">
            <rect x="${shaft.x}" y="${shaft.y}" width="${shaft.width}" height="${shaft.height}" class="c-mask"/>
            <rect x="${shaft.x}" y="${shaft.y}" width="${shaft.width}" height="${shaft.height}" ${FRAME} stroke-width="1"/>${items}
            <rect x="${plinth.x}" y="${plinth.y}" width="${plinth.width}" height="${plinth.height}" rx="3" class="${fill}" stroke-width="1.2"/>${tag}
          </g>
        </g>`;
}

function renderFoundationBlock(block) {
  const fill = fillClass[block.type] || 'c-external';
  const hasSub = Boolean(block.sublabel);
  const labelY = hasSub ? block.y + 24 : block.y + block.height / 2 + 4;
  const labelFont = fittedNodeFontSize(block.label, block.width, ...textFit.foundationLabel);
  const sub = hasSub
    ? `\n          <text data-detail="context" x="${block.cx}" y="${block.y + 38}" class="t-muted" font-size="${fittedNodeFontSize(block.sublabel, block.width, ...textFit.foundationSublabel)}" text-anchor="middle">${esc(block.sublabel)}</text>`
    : '';
  const brand = renderBrandMark(block, { x: block.x + block.width - 22, y: block.y + 6 })
    || renderDomainIcon(block, { x: block.x + block.width - 20, y: block.y + 7, size: 13, kind: block.type });
  const logoArt = renderLogoNode(block, { x: block.x, y: block.y, width: block.width, height: block.height, label: block.label });
  const logoLayer = logoArt || renderLogolessBox(block, { x: block.x, y: block.y, width: block.width, height: block.height, kind: block.type });
  const passport = {
    kind: block.type,
    sublabel: block.sublabel,
    context: i18nText(doc.meta.locale, 'node.context.pillars.foundation'),
    ...brandMetadataFor(block),
  };
  return `        <g ${focusNodeAttrs(block.id, block.label, passport, doc.meta.locale)}>
          ${focusNodeTitle(block.label, passport)}
          <rect x="${block.x}" y="${block.y}" width="${block.width}" height="${block.height}" rx="6" class="c-mask"/>
          <rect x="${block.x}" y="${block.y}" width="${block.width}" height="${block.height}" rx="6" class="${fill}"${animateAttr(doc.meta, 'node', stepFor.get(block.id))} stroke-width="1.5"/>
          ${renderSemanticSigil(block.type, { x: block.x + 6, y: block.y + 6 })}${brand ? `\n          ${brand}` : ''}
          <text data-node-label=""${hasSub ? ' data-detail-anchor=""' : ''} x="${block.cx}" y="${labelY}" class="t-primary" font-size="${labelFont}" font-weight="600" text-anchor="middle">${esc(block.label)}</text>${sub}
          ${logoLayer}
          <text class="node-logo-label" x="${block.cx}" y="${block.y + block.height - 9}" font-size="${Math.min(labelFont, 9.5)}" font-weight="600" text-anchor="middle">${esc(block.label)}</text>
        </g>`;
}

const LEGEND_CATALOG = Object.keys(fillClass)
  .map((kind) => ({ kind, label: i18nText(doc.meta.locale, `legend.pillars.${kind}`) }));

function renderLegend() {
  const presentKinds = new Set([...pillars, ...foundation].map((node) => node.type));
  const entries = resolveLegend(doc.meta?.legend, LEGEND_CATALOG, presentKinds);
  return renderResolvedLegend({
    entries,
    locale: doc.meta.locale,
    layout: {
      x: layout.margin,
      baselineY: viewBox[1] - 36,
      width: viewBox[0] - layout.margin * 2,
      minTitleY: contentBottom + 8,
      // The auto height reserves room for the legend, so an unfit legend there is
      // a renderer bug and must be loud. Only an authored viewBox keeps the
      // shared compatibility behaviour of hiding an implicit legend.
      unfit: doc.meta?.legend === undefined && requestedViewBox ? 'hide' : 'error',
      diagramType: 'pillars',
    },
    renderSwatch: (entry) => `<rect x="${entry.x}" y="${entry.baseline - 9}" width="16" height="10" rx="2.5" class="${fillClass[entry.kind] || 'c-external'}" stroke-width="1"/>`,
  });
}

function renderSvg() {
  return `      <svg viewBox="0 0 ${viewBox[0]} ${viewBox[1]}" ${svgRootAttrs(doc.meta, 'pillars diagram')}>
${svgAccessibleText(doc.meta, 'pillars')}
${renderDefinitions()}

        <!-- Background Grid -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Roof: the shared goal -->
${renderRoof()}

        <!-- Pillars: one domain, one system of record each -->
${measuredPillars.map(renderPillar).join('\n\n')}

        <!-- Foundation: what everything stands on -->
${measuredFoundation.map(renderFoundationBlock).join('\n\n')}

        <!-- Legend -->
${renderLegend()}
      </svg>`;
}

validatePillars();
writeDiagram({
  outPath,
  template,
  diagramType: 'pillars',
  meta: doc.meta,
  svg: renderSvg(),
  cards: doc.cards,
});
