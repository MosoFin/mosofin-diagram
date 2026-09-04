import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, renderDefinitions, renderSemanticSigil, textUnits } from '../shared/utils.mjs';
import { animateAttr, focusEdgeAttrs, focusNodeAttrs, focusNodeTitle, loadDiagramWithBrandMarks, writeDiagram, svgAccessibleText, svgRootAttrs } from '../shared/cli.mjs';
import { throwDiagnosticProblems } from '../shared/diagnostics.mjs';
import { resolveLegend, renderLegend as renderResolvedLegend } from '../shared/legend.mjs';
import { availableNodeTextWidth, fittedNodeFontSize, minimumNodeTextWidth } from '../shared/text-fit.mjs';
import { brandLabelFitWidth, brandMetadataFor, brandTopRailProblem, renderBrandMark } from '../shared/brand-marks.mjs';
import { renderLogoNode, renderLogolessBox } from '../shared/node-style.mjs';
import { translateMessage as i18nText } from '../shared/i18n.mjs';
import { renderLedgerPanel, summarize, validateLedger, viewerPayload } from '../shared/ledger.mjs';
import { renderCityScene } from './city.mjs';
import {
  asArray,
  isFinitePoint,
  rectsOverlap,
  cleanEndpointSideProblems,
  cleanFlowProblems,
  cleanCrossingProblems,
  cleanAmbiguousCorridorProblems,
  cleanBorderRunProblems,
  cleanRouteRhythmProblems,
  cleanLabelRouteClearanceProblems,
  suggestLabelObstacleFix,
  suggestLabelPairFix,
  anchor,
  automaticPortSpread,
  defaultFromSide,
  defaultToSide,
  chosenSide,
  polylinePath,
  routePointsValue,
  labelPoint,
  componentFill,
  componentText,
  arrowClassMap,
  variantAccent
} from '../shared/geometry.mjs';

// An account map is a data-flow layout whose nodes are ledger accounts. The
// account class is the semantic fact; it borrows a component palette so the
// shared CSS, legend engine, sigils and passport vocabulary keep working.
const CLASS_TYPE = {
  asset: 'database',
  liability: 'security',
  equity: 'external',
  revenue: 'frontend',
  contra: 'security',
  expense: 'backend',
};

const nodeTextFit = {
  sublabelPreferred: 7,
  sublabelMinimum: 6,
  tagPreferred: 7,
  tagMinimum: 6,
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { diagram: ledgerDoc, template, outPath } = await loadDiagramWithBrandMarks({
  rendererDir: __dirname,
  diagramType: 'ledger',
  defaultExample: 'northline-gl-2026-07.ledger.json'
});

const viewBox = ledgerDoc.meta?.viewBox || [1080, 760];
const layout = {
  stageY: 46,
  stageH: 36,
  stageBottomPad: 74,
  leftX: 120,
  colGap: 250,
  stageW: 190,
  nodeW: 128,
  nodeH: 58,
  rowYs: [128, 242, 356, 470, 584],
  labelH: 16
};

function flowLabelSize(flow) {
  const longestLine = Math.max(textUnits(flow.label), textUnits(flow.classification || ''));
  return {
    width: Math.round(Math.max(34, longestLine * 4.9 + 12) * 10) / 10,
    height: flow.classification ? 27 : layout.labelH,
  };
}

function stageX(index) {
  return layout.leftX + index * layout.colGap;
}

function stageFrame(stage, index) {
  return {
    id: index,
    label: stage.label,
    kind: 'stage',
    x: stageX(index) - layout.stageW / 2,
    y: layout.stageY,
    width: layout.stageW,
    height: viewBox[1] - layout.stageY - layout.stageBottomPad,
    radius: 10,
  };
}

const compositionFrames = asArray(ledgerDoc.stages).map(stageFrame);

function measureNode(account) {
  const width = account.width || layout.nodeW;
  const height = account.height || layout.nodeH;
  const cx = stageX(account.stage);
  const y = layout.rowYs[account.row] + (account.yOffset || 0);
  return {
    ...account,
    type: CLASS_TYPE[account.class] || 'external',
    width,
    height,
    cx,
    cy: y + height / 2,
    x: cx - width / 2,
    y
  };
}

const nodes = new Map(asArray(ledgerDoc.accounts).map((account) => [account.id, measureNode(account)]));
const nodeSteps = new Map();
for (const [index, flow] of asArray(ledgerDoc.flows).entries()) {
  if (!nodeSteps.has(flow.from)) nodeSteps.set(flow.from, index);
  if (!nodeSteps.has(flow.to)) nodeSteps.set(flow.to, index + 1);
}
for (const [index, account] of asArray(ledgerDoc.accounts).entries()) {
  if (!nodeSteps.has(account.id)) nodeSteps.set(account.id, index);
}

function validateLayout() {
  const problems = [];
  if (ledgerDoc.schema_version !== 1) problems.push('Ledger files must set "schema_version": 1.');
  if (ledgerDoc.diagram_type !== 'ledger') problems.push('Ledger files must set "diagram_type": "ledger".');
  if (!ledgerDoc.meta?.title) problems.push('Ledger files must include meta.title.');
  if (nodes.size !== asArray(ledgerDoc.accounts).length) problems.push('Account ids must be unique.');

  const stageCount = asArray(ledgerDoc.stages).length;
  for (const node of nodes.values()) {
    if (typeof node.stage !== 'number' || node.stage < 0 || node.stage >= stageCount) {
      problems.push(`Account "${node.id}" uses invalid stage ${node.stage} — valid stages are 0..${stageCount - 1}.`);
    }
    if (typeof node.row !== 'number' || node.row < 0 || node.row >= layout.rowYs.length) {
      problems.push(`Account "${node.id}" uses invalid row ${node.row} — valid rows are 0..${layout.rowYs.length - 1}.`);
    }
    if (!isFinitePoint(node.x, node.y, node.cx, node.cy)) {
      problems.push(`Account "${node.id}" produced non-finite coordinates — check stage, row, width, height, and yOffset are numbers.`);
      continue;
    }
    if (node.x < 24 || node.x + node.width > viewBox[0] - 24) {
      problems.push(`Account "${node.id}" exceeds the horizontal bounds of the viewBox — reduce width or increase meta.viewBox[0].`);
    }
    if (node.y < layout.stageY + layout.stageH + 22 || node.y + node.height > viewBox[1] - layout.stageBottomPad) {
      problems.push(`Account "${node.id}" exceeds the readable diagram area — keep y between ${layout.stageY + layout.stageH + 22} and ${viewBox[1] - layout.stageBottomPad} (adjust row/yOffset or increase meta.viewBox[1]).`);
    }
    const estLabelW = textUnits(node.label) * 6.2;
    if (estLabelW > node.width + 6) {
      problems.push(`Label "${node.label}" (~${Math.round(estLabelW)}px) is wider than account "${node.id}" (${node.width}px) — shorten the label or increase width.`);
    }
    const brandRailProblem = brandTopRailProblem(node, node.width, 8);
    if (brandRailProblem) problems.push(brandRailProblem);
    const availableTextW = availableNodeTextWidth(node.width);
    for (const [field, value, minimum] of [
      ['Sublabel', node.sublabel, nodeTextFit.sublabelMinimum],
      ['Tag', node.tag, nodeTextFit.tagMinimum],
    ]) {
      if (!value) continue;
      const minimumW = minimumNodeTextWidth(value, minimum);
      if (minimumW > availableTextW) {
        problems.push(`${field} "${value}" needs ~${Math.ceil(minimumW)}px at the ${minimum}px legible minimum, but account "${node.id}" provides ${availableTextW}px — shorten the ${field.toLowerCase()} or increase width.`);
      }
    }
  }

  const nodeList = asArray(ledgerDoc.accounts);
  for (let i = 0; i < nodeList.length; i += 1) {
    for (let j = i + 1; j < nodeList.length; j += 1) {
      const a = nodes.get(nodeList[i].id);
      const b = nodes.get(nodeList[j].id);
      if (rectsOverlap(a, b, 10)) {
        problems.push(`Accounts "${a.id}" and "${b.id}" are less than 10px apart — move one to another stage/row or adjust yOffset.`);
      }
    }
  }

  for (const flow of asArray(ledgerDoc.flows)) {
    if (!nodes.has(flow.from)) problems.push(`Flow "${flow.id}" references unknown source account "${flow.from}".`);
    if (!nodes.has(flow.to)) problems.push(`Flow "${flow.id}" references unknown target account "${flow.to}".`);
    if (nodes.has(flow.from) && nodes.has(flow.to)) {
      const routed = pathFor(flow);
      const [start, end] = [routed.points[0], routed.points[routed.points.length - 1]];
      const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);
      if (distance < 34) problems.push(`Flow "${flow.id}" is too short (${Math.round(distance)}px; minimum 34px) — route it through a channel or spread its accounts.`);
      if (Array.isArray(flow.via)) {
        for (let segmentIndex = 0; segmentIndex < routed.points.length - 1; segmentIndex += 1) {
          const segmentStart = routed.points[segmentIndex];
          const segmentEnd = routed.points[segmentIndex + 1];
          const isDiagonal = Math.abs(segmentStart[0] - segmentEnd[0]) > 0.01
            && Math.abs(segmentStart[1] - segmentEnd[1]) > 0.01;
          if (!isDiagonal) continue;
          const viaIndex = Math.min(segmentIndex, flow.via.length - 1);
          problems.push(`Flow "${flow.id}" has a diagonal segment from (${segmentStart.join(', ')}) to (${segmentEnd.join(', ')}) — align via[${viaIndex}] with its adjacent point by sharing the same x or y coordinate.`);
        }
      }
    }
  }

  const common = {
    relations: ledgerDoc.flows,
    endpointIds: new Set(nodes.keys()),
    pathFor,
    diagramType: 'ledger',
    relationCollection: 'flows',
    profile: ledgerDoc.meta?.quality_profile,
  };
  problems.push(...cleanEndpointSideProblems({
    ...common,
    fromSideFor: (flow) => flowSides(flow).fromSide,
    toSideFor: (flow) => flowSides(flow).toSide,
    routeHint: 'keep automatic routing, or choose fromSide/toSide and via points whose first and final segments cross account borders perpendicularly',
  }));
  problems.push(...cleanFlowProblems({
    ...common,
    obstacles: nodes.values(),
    obstacleKind: 'account',
    routeHint: 'adjust fromSide/toSide, set route/via or channelX/channelY, or move the account to another stage/row',
  }));
  problems.push(...cleanCrossingProblems({ ...common, routeHint: 'adjust route/via or channelX/channelY so the flows use separate stage corridors' }));
  problems.push(...cleanAmbiguousCorridorProblems({ ...common, routeHint: 'adjust route/via or channelX/channelY so unrelated flows do not visually merge' }));
  problems.push(...cleanBorderRunProblems({ ...common, frames: compositionFrames, routeHint: 'adjust route/via or channelX/channelY so the flow crosses the stage perpendicularly instead of following its border' }));
  problems.push(...cleanRouteRhythmProblems({ ...common, routeHint: 'adjust route/via or channelX/channelY so each turn uses a clear inter-stage corridor' }));

  const labelRects = [];
  for (const [flowIndex, flow] of asArray(ledgerDoc.flows).entries()) {
    if (!flow.label || !nodes.has(flow.from) || !nodes.has(flow.to)) continue;
    const [lx, ly] = labelPoint(flow, pathFor(flow).points);
    const { width, height } = flowLabelSize(flow);
    labelRects.push({ relation: flow, relationIndex: flowIndex, label: flow.label, x: lx - width / 2, y: ly - 11, width, height, lx, ly });
  }
  for (const rect of labelRects) {
    for (const node of nodes.values()) {
      if (rectsOverlap(rect, node, -2)) {
        problems.push(`Label "${rect.label}" overlaps account "${node.id}" — adjust labelDx/labelDy/labelSegment or set labelAt.\n${suggestLabelObstacleFix(rect, rect.lx, rect.ly, node, 'account')}`);
      }
    }
  }
  for (let i = 0; i < labelRects.length; i += 1) {
    for (let j = i + 1; j < labelRects.length; j += 1) {
      if (rectsOverlap(labelRects[i], labelRects[j], -2)) {
        problems.push(`Labels "${labelRects[i].label}" and "${labelRects[j].label}" overlap — adjust labelDx/labelDy.\n${suggestLabelPairFix(labelRects[i], labelRects[j])}`);
      }
    }
  }
  problems.push(...cleanLabelRouteClearanceProblems({
    ...common,
    labels: labelRects,
    routeHint: 'adjust labelAt, labelDx, labelDy, or labelSegment; otherwise adjust the other flow route/via/channelX/channelY',
  }));

  const lastStageX = stageX(asArray(ledgerDoc.stages).length - 1);
  if (lastStageX + layout.stageW / 2 > viewBox[0] - 24) {
    problems.push(`Stages exceed viewBox width — set meta.viewBox[0] to at least ${Math.ceil(lastStageX + layout.stageW / 2 + 24)}.`);
  }

  if (problems.length) {
    throwDiagnosticProblems('Ledger layout validation failed', problems, {
      subject: { diagramType: 'ledger' },
    });
  }
}

function routeVia(flow, from, to, start, end) {
  if (flow.via) return flow.via;
  switch (flow.route || 'auto') {
    case 'straight':
      return [];
    case 'vertical-channel': {
      const x = flow.channelX ?? start[0] + (end[0] > start[0] ? 44 : -44);
      return [[x, start[1]], [x, end[1]]];
    }
    case 'bottom-channel': {
      const y = flow.channelY ?? Math.max(from.y + from.height, to.y + to.height) + 26;
      return [[start[0], y], [end[0], y]];
    }
    case 'top-channel': {
      const y = flow.channelY ?? Math.min(from.y, to.y) - 24;
      return [[start[0], y], [end[0], y]];
    }
    case 'auto':
    default: {
      if (Math.abs(start[1] - end[1]) < 4) return [];
      if (Math.abs(start[0] - end[0]) < 4) return [];
      const midX = start[0] + (end[0] - start[0]) / 2;
      return [[midX, start[1]], [midX, end[1]]];
    }
  }
}

const pathCache = new Map();

function flowSides(flow) {
  const from = nodes.get(flow.from);
  const to = nodes.get(flow.to);
  return {
    fromSide: chosenSide(flow.fromSide, defaultFromSide(from, to)),
    toSide: chosenSide(flow.toSide, defaultToSide(from, to)),
  };
}

const automaticPorts = automaticPortSpread(ledgerDoc.flows, nodes, {
  sideFor: (flow, endpoint) => flowSides(flow)[endpoint === 'source' ? 'fromSide' : 'toSide'],
});

function pathFor(flow) {
  if (pathCache.has(flow)) return pathCache.get(flow);
  const from = nodes.get(flow.from);
  const to = nodes.get(flow.to);
  const ports = automaticPorts.get(flow);
  const { fromSide, toSide } = flowSides(flow);
  const start = ports?.from || anchor(from, fromSide);
  const end = ports?.to || anchor(to, toSide);
  const points = [start, ...routeVia(flow, from, to, start, end), end];
  const routed = { d: polylinePath(points), points };
  pathCache.set(flow, routed);
  return routed;
}

function renderStage(stage, index) {
  const frame = compositionFrames[index];
  const cx = stageX(index);
  return `        <rect data-graph-role="structural-frame" data-composition-frame-kind="stage" data-composition-frame-id="${index}" x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" rx="${frame.radius}" class="c-lane" stroke-width="1"/>
        <text x="${cx}" y="${layout.stageY + 22}" class="t-dim" font-size="9" font-weight="600" text-anchor="middle">${String(index + 1).padStart(2, '0')} / ${esc(stage.label)}</text>`;
}

function renderNode(node) {
  const fill = componentFill[node.type] || 'c-external';
  const accent = componentText[node.type] || 't-muted';
  const hasSub = node.sublabel != null && node.sublabel !== '';
  const sub = hasSub
    ? `\n          <text data-detail="context" x="${node.cx}" y="${node.y + 37}" class="t-muted" font-size="${fittedNodeFontSize(node.sublabel, node.width, nodeTextFit.sublabelPreferred, nodeTextFit.sublabelMinimum)}" text-anchor="middle">${esc(node.sublabel)}</text>`
    : '';
  const tag = node.tag
    ? `\n        <text data-detail="fine" x="${node.cx}" y="${node.y + node.height - 11}" class="${accent}" font-size="${fittedNodeFontSize(node.tag, node.width, nodeTextFit.tagPreferred, nodeTextFit.tagMinimum)}" text-anchor="middle">${esc(node.tag)}</text>`
    : '';
  const context = `${i18nText(ledgerDoc.meta.locale, `ledger.class.${node.class}`)} · ${i18nText(ledgerDoc.meta.locale, 'node.context.ledger')}`;
  const brand = renderBrandMark(node, { x: node.x + node.width - 22, y: node.y + 6 });
  const labelFontSize = fittedNodeFontSize(node.label, brandLabelFitWidth(node, node.width), 10, 8);
  const passport = { kind: node.class, sublabel: node.sublabel, tag: node.tag, context, ...brandMetadataFor(node) };
  const logoArt = renderLogoNode(node, { x: node.x, y: node.y, width: node.width, height: node.height, label: node.label });
  const logoLayer = logoArt || renderLogolessBox(node, { x: node.x, y: node.y, width: node.width, height: node.height, kind: node.type });
  return `        <g ${focusNodeAttrs(node.id, node.label, passport, ledgerDoc.meta.locale)} data-ledger-account="${esc(node.class)}"${node.cash ? ' data-ledger-cash="true"' : ''}>
          ${focusNodeTitle(node.label, passport)}
          <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="6" class="c-mask"/>
          <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="6" class="${fill}"${animateAttr(ledgerDoc.meta, 'node', nodeSteps.get(node.id))} stroke-width="1.5"/>
          ${renderSemanticSigil(node.type, { x: node.x + 6, y: node.y + 6 })}${brand ? `\n          ${brand}` : ''}
          <text data-node-label=""${hasSub ? ' data-detail-anchor=""' : ''} x="${node.cx}" y="${node.y + 21}" class="t-primary" font-size="${labelFontSize}" font-weight="600" text-anchor="middle">${esc(node.label)}</text>${sub}${tag}
          ${logoLayer}
          <text class="node-logo-label" x="${node.cx}" y="${node.y + node.height - 9}" font-size="${Math.min(labelFontSize, 9.5)}" font-weight="600" text-anchor="middle">${esc(node.label)}</text>
        </g>`;
}

function renderFlowPath(flow, index) {
  const [cls, marker] = arrowClassMap[flow.variant || 'default'] || arrowClassMap.default;
  const routed = pathFor(flow);
  const strokeWidth = flow.width || (flow.variant === 'emphasis' ? 1.8 : 1.4);
  return `        <path ${focusEdgeAttrs(flow.from, flow.to, flow.label, index, flow.id)} data-composition-points="${routePointsValue(routed.points)}" d="${routed.d}" class="${cls}"${animateAttr(ledgerDoc.meta, 'edge', index)} stroke-width="${strokeWidth}" marker-end="url(#${marker})"/>`;
}

function renderFlowLabel(flow, index) {
  const routed = pathFor(flow);
  const [lx, ly] = labelPoint(flow, routed.points);
  const { width: labelW, height: labelH } = flowLabelSize(flow);
  const classification = flow.classification
    ? `\n        <text data-detail="fine" x="${lx}" y="${ly + 11}" class="t-dim" font-size="7" text-anchor="middle">${esc(flow.classification)}</text>`
    : '';
  return `        <g data-detail="context" ${focusEdgeAttrs(flow.from, flow.to, flow.label, index, flow.id)}>
          <rect x="${lx - labelW / 2}" y="${ly - 11}" width="${labelW}" height="${labelH}" rx="4" class="c-mask"/>
          <text x="${lx}" y="${ly}" class="${variantAccent(flow.variant)}" font-size="8" text-anchor="middle">${esc(flow.label)}</text>${classification}
        </g>`;
}

const LEGEND_CATALOG = [
  { kind: 'asset', swatchClass: 'c-database' },
  { kind: 'liability', swatchClass: 'c-security' },
  { kind: 'revenue', swatchClass: 'c-frontend' },
  { kind: 'contra', swatchClass: 'c-security' },
  { kind: 'expense', swatchClass: 'c-backend' },
  { kind: 'equity', swatchClass: 'c-external' },
  { kind: 'emphasis', className: 'a-emphasis', marker: 'arrowhead-emphasis', strokeWidth: 1.8, swatchWidth: 34, swatchGap: 9, interactive: false },
  { kind: 'security', className: 'a-security', marker: 'arrowhead-security', swatchWidth: 34, swatchGap: 9, interactive: false },
  { kind: 'dashed', className: 'a-dashed', marker: 'arrowhead-dashed', swatchWidth: 34, swatchGap: 9, interactive: false },
  { kind: 'default', className: 'a-default', marker: 'arrowhead', swatchWidth: 34, swatchGap: 9, interactive: false },
].map((entry) => ({
  ...entry,
  label: i18nText(ledgerDoc.meta.locale, `legend.ledger.${entry.kind}`),
}));

function renderLegend() {
  const presentKinds = new Set(asArray(ledgerDoc.flows).map((flow) => flow.variant || 'default'));
  for (const node of nodes.values()) presentKinds.add(node.class);
  const entries = resolveLegend(ledgerDoc.meta?.legend, LEGEND_CATALOG, presentKinds);
  return renderResolvedLegend({
    entries,
    locale: ledgerDoc.meta.locale,
    layout: {
      x: 40,
      baselineY: viewBox[1] - 36,
      width: viewBox[0] - 80,
      minTitleY: viewBox[1] - 66,
      unfit: ledgerDoc.meta?.legend === undefined ? 'hide' : 'error',
      diagramType: 'ledger',
    },
    renderSwatch: (entry) => entry.swatchClass
      ? `<rect x="${entry.x}" y="${entry.baseline - 8}" width="14" height="9" rx="2" class="${entry.swatchClass}" stroke-width="1"/>`
      : `<path d="M ${entry.x} ${entry.baseline - 3} L ${entry.x + 34} ${entry.baseline - 3}" class="${entry.className}" stroke-width="${entry.strokeWidth || 1.4}" marker-end="url(#${entry.marker})"/>`,
  });
}

function renderSvg() {
  return `      <svg viewBox="0 0 ${viewBox[0]} ${viewBox[1]}" ${svgRootAttrs(ledgerDoc.meta, 'ledger')} data-ledger-view="map">
${svgAccessibleText(ledgerDoc.meta, 'ledger')}
${renderDefinitions()}

        <!-- Background Grid -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Account Stages -->
${ledgerDoc.stages.map(renderStage).join('\n\n')}

        <!-- Flow paths -->
${asArray(ledgerDoc.flows).map(renderFlowPath).join('\n')}

        <!-- Accounts -->
${[...nodes.values()].map(renderNode).join('\n\n')}

        <!-- Flow labels -->
${asArray(ledgerDoc.flows).map(renderFlowLabel).join('\n')}

        <!-- Legend -->
${renderLegend()}
      </svg>`;
}

validateLedger(ledgerDoc);
const ledgerView = ledgerDoc.meta?.view === 'city' ? 'city' : 'map';
let svg;
if (ledgerView === 'city') {
  svg = renderCityScene(ledgerDoc);
} else {
  validateLayout();
  svg = renderSvg();
}
const summary = summarize(ledgerDoc);
writeDiagram({
  outPath,
  template,
  diagramType: 'ledger',
  meta: ledgerDoc.meta,
  svg,
  cards: ledgerDoc.cards,
  ledger: viewerPayload(ledgerDoc, summary),
  ledgerSlot: renderLedgerPanel(ledgerDoc, summary),
});
