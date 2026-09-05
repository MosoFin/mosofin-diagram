// Isometric City view for the ledger diagram type.
// Same accounts, flows, entities, and schedule() as Map — different drawing.
// Roads use class "city-road" + marker-city so orthogonal/arrow-family checks ignore them.

import { esc, renderDefinitions, textUnits } from '../shared/utils.mjs';
import {
  animateAttr,
  focusEdgeAttrs,
  focusNodeAttrs,
  focusNodeTitle,
  svgAccessibleText,
  svgRootAttrs,
} from '../shared/cli.mjs';
import { throwDiagnosticProblems } from '../shared/diagnostics.mjs';
import { resolveLegend, renderLegend as renderResolvedLegend } from '../shared/legend.mjs';
import { translateMessage as i18nText } from '../shared/i18n.mjs';
import { asArray } from '../shared/geometry.mjs';

const CLASS_TYPE = {
  asset: 'database',
  liability: 'security',
  equity: 'external',
  revenue: 'frontend',
  contra: 'security',
  expense: 'backend',
};

const ACCOUNT_SILHOUETTE = {
  asset: 'warehouse',
  liability: 'office',
  equity: 'tower',
  revenue: 'storefront',
  contra: 'storefront',
  expense: 'office',
};

const ENTITY_SILHOUETTE = {
  customer: 'shop',
  vendor: 'warehouse',
  bank: 'bank',
  lender: 'tower',
  government: 'townhall',
  employee: 'house',
  owner: 'tower',
  processor: 'terminal',
  other: 'block',
};

const FILL = {
  frontend: 'c-frontend',
  backend: 'c-backend',
  database: 'c-database',
  security: 'c-security',
  external: 'c-external',
  cloud: 'c-cloud',
  messagebus: 'c-messagebus',
};

function silhouetteForAccount(account) {
  if (account.cash) return 'vault';
  if (account.class === 'asset' && /inventor/i.test(`${account.label} ${account.id}`)) return 'warehouse';
  if (account.class === 'asset' && /\ba\/?r\b|receivable/i.test(`${account.label} ${account.id}`)) return 'office';
  return ACCOUNT_SILHOUETTE[account.class] || 'office';
}

function cityDefs() {
  return `${renderDefinitions()}
        <defs>
          <marker id="marker-city" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <polygon points="0 0, 10 4, 0 8" class="m-city" />
          </marker>
          <linearGradient id="city-health-swatch" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="50%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#16a34a"/>
          </linearGradient>
        </defs>`;
}

function isoProject(col, row, origin, tile) {
  return {
    x: origin.x + (col - row) * (tile.w / 2),
    y: origin.y + (col + row) * (tile.h / 2),
  };
}

function prismFaces(cx, cy, hw, hd, hh) {
  // Isometric prism standing on ground point (cx, cy).
  // Top diamond, then left and right walls.
  const top = [
    [cx, cy - hh - hd],
    [cx + hw, cy - hh],
    [cx, cy - hh + hd],
    [cx - hw, cy - hh],
  ];
  const left = [
    [cx - hw, cy - hh],
    [cx, cy - hh + hd],
    [cx, cy + hd],
    [cx - hw, cy],
  ];
  const right = [
    [cx + hw, cy - hh],
    [cx, cy - hh + hd],
    [cx, cy + hd],
    [cx + hw, cy],
  ];
  const poly = (pts) => pts.map((p) => p.join(',')).join(' ');
  return { top: poly(top), left: poly(left), right: poly(right), apexY: cy - hh - hd, groundY: cy + hd };
}

function peakRoof(cx, cy, hw, hd, hh, rise = 14) {
  const ridge = [cx, cy - hh - hd - rise];
  const eaveL = [cx - hw, cy - hh];
  const eaveR = [cx + hw, cy - hh];
  const eaveF = [cx, cy - hh + hd];
  return {
    left: [ridge, eaveL, eaveF].map((p) => p.join(',')).join(' '),
    right: [ridge, eaveR, eaveF].map((p) => p.join(',')).join(' '),
  };
}

function renderBuildingArt(kind, cx, cy, scale = 1) {
  const hw = 28 * scale;
  const hd = 14 * scale;
  let hh = 34 * scale;
  if (kind === 'tower') hh = 56 * scale;
  if (kind === 'vault') hh = 26 * scale;
  if (kind === 'terminal') hh = 22 * scale;
  if (kind === 'house') hh = 28 * scale;
  if (kind === 'block') { hh = 24 * scale; }
  if (kind === 'townhall') hh = 42 * scale;
  if (kind === 'warehouse') { hh = 30 * scale; }

  const faces = prismFaces(cx, cy, hw, hd, hh);
  let extra = '';
  if (kind === 'house' || kind === 'townhall') {
    const roof = peakRoof(cx, cy, hw, hd, hh, kind === 'townhall' ? 20 * scale : 14 * scale);
    extra = `
          <polygon points="${roof.left}" class="city-roof-left" stroke-width="0.8"/>
          <polygon points="${roof.right}" class="city-roof-right" stroke-width="0.8"/>`;
  }
  if (kind === 'vault') {
    extra += `
          <ellipse cx="${cx}" cy="${cy - hh * 0.35}" rx="${9 * scale}" ry="${5.5 * scale}" class="city-vault-door" stroke-width="1"/>`;
  }
  if (kind === 'storefront' || kind === 'shop') {
    const awnY = cy - hh + 2;
    extra += `
          <path d="M ${cx - hw - 2} ${awnY} L ${cx} ${awnY + hd + 2} L ${cx + hw + 2} ${awnY}" class="city-awning" fill="none" stroke-width="1.8"/>`;
  }
  if (kind === 'terminal') {
    extra += `
          <line x1="${cx}" y1="${faces.apexY}" x2="${cx}" y2="${faces.apexY - 11 * scale}" class="city-antenna" stroke-width="1.3"/>
          <circle cx="${cx}" cy="${faces.apexY - 11 * scale}" r="${2.2 * scale}" class="city-antenna-tip"/>`;
  }
  if (kind === 'bank') {
    extra += `
          <line x1="${cx - 7 * scale}" y1="${cy - hh * 0.2}" x2="${cx - 7 * scale}" y2="${cy + hd * 0.35}" class="city-column" stroke-width="1.5"/>
          <line x1="${cx + 7 * scale}" y1="${cy - hh * 0.2}" x2="${cx + 7 * scale}" y2="${cy + hd * 0.35}" class="city-column" stroke-width="1.5"/>`;
  }
  const mask = {
    x: cx - hw - 6,
    y: faces.apexY - 4,
    width: hw * 2 + 12,
    height: (cy + hd) - faces.apexY + 10,
  };
  return {
    markup: `          <rect x="${mask.x}" y="${mask.y}" width="${mask.width}" height="${mask.height}" class="c-mask" opacity="0"/>
          <polygon points="${faces.left}" class="city-face-left" stroke-width="1"/>
          <polygon points="${faces.right}" class="city-face-right" stroke-width="1"/>
          <polygon points="${faces.top}" class="city-face-top" stroke-width="1"/>${extra}`,
    // Labels sit below the building so roofs stay readable at overview zoom.
    labelY: cy + hd + 14,
    apexY: faces.apexY,
    foot: { x: cx, y: cy },
    hw,
    hd,
    hh,
    mask,
  };
}

/**
 * Authored-only health for City buildings.
 * Prefer node tie-out residual; never invent a green when the signal is unknown.
 * Returns { score: 0..1 | null, source, residual? }.
 */
export function cityAccountHealth(accountId, summary) {
  if (!summary || !accountId) return { score: null, source: 'unknown' };
  const tieouts = Array.isArray(summary.tieouts) ? summary.tieouts : [];
  const nodeTie = tieouts.find((tie) => tie.mode === 'node' && tie.node === accountId);
  if (nodeTie) {
    if (nodeTie.status === 'tied' || Math.abs(nodeTie.residual) <= (nodeTie.tolerance || 0)) {
      return { score: 1, source: 'tieout', residual: nodeTie.residual, status: 'tied' };
    }
    const denom = Math.max(Math.abs(nodeTie.expected), Math.abs(nodeTie.computed), Math.abs(nodeTie.residual), 1);
    const score = Math.max(0, Math.min(1, 1 - (Math.abs(nodeTie.residual) / denom)));
    return { score, source: 'tieout', residual: nodeTie.residual, status: 'break' };
  }

  // Flow-mode tie-outs that touch this account: a break warms the building; tied is not enough alone to paint green.
  const account = summary.accounts?.[accountId];
  const flows = summary.flows || {};
  let worstBreak = null;
  for (const tie of tieouts) {
    if (tie.mode !== 'flows') continue;
    const left = flows[tie.left];
    const right = flows[tie.right];
    const touches = (left && (left.from === accountId || left.to === accountId))
      || (right && (right.from === accountId || right.to === accountId));
    if (!touches) continue;
    if (tie.status === 'break') {
      const denom = Math.max(Math.abs(tie.expected), Math.abs(tie.computed), Math.abs(tie.residual), 1);
      const score = Math.max(0, Math.min(1, 1 - (Math.abs(tie.residual) / denom)));
      if (!worstBreak || score < worstBreak.score) worstBreak = { score, source: 'flow-tieout', residual: tie.residual, status: 'break' };
    }
  }
  if (worstBreak) return worstBreak;

  // Opening→closing is identity by construction; only treat a missing opening with activity as unknown,
  // and never invent green for quiet accounts.
  if (!account) return { score: null, source: 'unknown' };
  return { score: null, source: 'unknown' };
}

export function cityEntityHealth(entityId, summary) {
  if (!summary || !entityId) return { score: null, source: 'unknown' };
  const entity = summary.entities?.[entityId];
  if (!entity) return { score: null, source: 'unknown' };
  // Clear authored signal only: unmapped journal rows attached to this entity.
  if (entity.unmappedCount > 0) {
    const score = Math.max(0, Math.min(1, 1 - Math.min(1, entity.unmappedCount / 8)));
    return { score, source: 'unmapped', unmappedCount: entity.unmappedCount };
  }
  return { score: null, source: 'unknown' };
}

function healthAttrs(health) {
  if (!health || health.score === null || health.score === undefined) {
    return ' data-city-health="unknown"';
  }
  const bucket = Math.round(Math.max(0, Math.min(1, health.score)) * 10) / 10;
  return ` data-city-health="${bucket}" data-city-health-source="${esc(health.source)}"`;
}

function healthCssVars(health) {
  if (!health || health.score === null || health.score === undefined) return '';
  const t = Math.max(0, Math.min(1, health.score));
  // red (#dc2626) → amber (#eab308) → green (#16a34a)
  const r = t < 0.5 ? 220 : Math.round(220 + (22 - 220) * ((t - 0.5) * 2));
  const g = t < 0.5 ? Math.round(38 + (179 - 38) * (t * 2)) : Math.round(179 + (163 - 179) * ((t - 0.5) * 2));
  const b = t < 0.5 ? Math.round(38 + (8 - 38) * (t * 2)) : Math.round(8 + (74 - 8) * ((t - 0.5) * 2));
  return `--city-health: ${t}; --city-health-color: rgb(${r}, ${g}, ${b})`;
}

function cityNodeStyle(health, animateMarkup) {
  const healthVars = healthCssVars(health);
  const stepMatch = /style="--step:(\d+)"/.exec(animateMarkup || '');
  const stepVars = stepMatch ? `--step:${stepMatch[1]}` : '';
  const animateRest = (animateMarkup || '').replace(/\s*style="--step:\d+"/, '');
  const vars = [healthVars, stepVars].filter(Boolean).join('; ');
  const style = vars ? ` style="${vars}"` : '';
  return { animateRest, style };
}

function layoutCity(ledgerDoc, viewBox) {
  const tile = { w: 88, h: 44 };
  const accounts = asArray(ledgerDoc.accounts);
  const entities = asArray(ledgerDoc.entities);
  const flows = asArray(ledgerDoc.flows);

  const maxStage = Math.max(0, ...accounts.map((a) => a.stage || 0));
  const maxRow = Math.max(0, ...accounts.map((a) => a.row || 0));

  // More spacing between account district and entity ring for readable corridors.
  const districtScale = 1.65;
  const ringRadius = Math.max(maxStage, maxRow) * districtScale + 3.8;

  const byClass = new Map();
  for (const entity of entities) {
    if (!byClass.has(entity.class)) byClass.set(entity.class, []);
    byClass.get(entity.class).push(entity);
  }
  const classOrder = ['customer', 'vendor', 'bank', 'processor', 'government', 'employee', 'lender', 'owner', 'other'];
  const presentClasses = classOrder.filter((c) => byClass.has(c));

  // First pass: place relative to a provisional origin, then translate to fit viewBox.
  const buildAt = (origin) => {
    const accountBuildings = new Map();
    for (const account of accounts) {
      const col = (account.stage || 0) - maxStage / 2;
      const row = (account.row || 0) - maxRow / 2;
      const ground = isoProject(col * districtScale, row * districtScale, origin, tile);
      const kind = silhouetteForAccount(account);
      const art = renderBuildingArt(kind, ground.x, ground.y, account.cash ? 1.28 : 1.12);
      accountBuildings.set(account.id, {
        ...account,
        type: CLASS_TYPE[account.class] || 'external',
        kind,
        cx: ground.x,
        cy: ground.y,
        art,
        fill: FILL[CLASS_TYPE[account.class]] || 'c-external',
      });
    }

    const entityBuildings = new Map();
    presentClasses.forEach((cls, classIndex) => {
      const list = byClass.get(cls);
      const sector = (classIndex / presentClasses.length) * Math.PI * 2 - Math.PI / 2;
      list.forEach((entity, entityIndex) => {
        const spread = (entityIndex - (list.length - 1) / 2) * 0.62;
        const angle = sector + spread * 0.24;
        const col = Math.cos(angle) * ringRadius;
        const row = Math.sin(angle) * ringRadius;
        const ground = isoProject(col, row, origin, tile);
        const grouped = entity.grouped && entity.grouped > 1;
        const kind = grouped ? 'block' : (ENTITY_SILHOUETTE[cls] || 'block');
        const art = renderBuildingArt(kind, ground.x, ground.y, grouped ? 1.18 : 0.98);
        entityBuildings.set(entity.id, {
          ...entity,
          kind,
          cx: ground.x,
          cy: ground.y,
          art,
          fill: FILL.external,
        });
      });
    });

    return { accountBuildings, entityBuildings };
  };

  let origin = { x: 0, y: 0 };
  let { accountBuildings, entityBuildings } = buildAt(origin);
  const placed = [...accountBuildings.values(), ...entityBuildings.values()];
  let minLabelY = Infinity;
  let maxBottom = -Infinity;
  let minLeft = Infinity;
  let maxRight = -Infinity;
  for (const building of placed) {
    minLabelY = Math.min(minLabelY, building.art.apexY);
    maxBottom = Math.max(maxBottom, building.art.labelY + 12);
    minLeft = Math.min(minLeft, building.art.mask.x);
    maxRight = Math.max(maxRight, building.art.mask.x + building.art.mask.width);
  }

  const padTop = 42;
  const padBottom = 88;
  const padX = 48;
  const contentW = Math.max(1, maxRight - minLeft);
  const contentH = Math.max(1, maxBottom - minLabelY);
  const availW = Math.max(1, viewBox[0] - padX * 2);
  const availH = Math.max(1, viewBox[1] - padTop - padBottom);
  // Scale then translate so the whole district (roofs + below labels) fits the canvas.
  const fitScale = Math.min(1, availW / contentW, availH / contentH);
  if (fitScale < 0.999) {
    tile.w *= fitScale;
    tile.h *= fitScale;
    ({ accountBuildings, entityBuildings } = buildAt(origin));
    minLabelY = Infinity;
    maxBottom = -Infinity;
    minLeft = Infinity;
    maxRight = -Infinity;
    for (const building of [...accountBuildings.values(), ...entityBuildings.values()]) {
      minLabelY = Math.min(minLabelY, building.art.apexY);
      maxBottom = Math.max(maxBottom, building.art.labelY + 12);
      minLeft = Math.min(minLeft, building.art.mask.x);
      maxRight = Math.max(maxRight, building.art.mask.x + building.art.mask.width);
    }
  }
  const fittedW = Math.max(1, maxRight - minLeft);
  const fittedH = Math.max(1, maxBottom - minLabelY);
  const dx = padX + (availW - fittedW) / 2 - minLeft;
  const dy = padTop + (availH - fittedH) / 2 - minLabelY;
  origin = { x: dx, y: dy };
  ({ accountBuildings, entityBuildings } = buildAt(origin));

  // Collision-aware label slots: primary accounts keep labels; secondary (entities +
  // colliding accounts) get data-city-label="secondary" and hide until zoom/focus.
  const labelSlots = [];
  function placeLabel(building, primary) {
    const width = Math.max(36, textUnits(building.label) * 5.2 + 8);
    const height = building.grouped ? 22 : 12;
    let y = building.art.labelY;
    let tier = primary ? 'primary' : 'secondary';
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const box = { x: building.cx - width / 2, y: y - 10, w: width, h: height };
      const hit = labelSlots.some((other) => (
        box.x < other.x + other.w + 4
        && box.x + box.w > other.x - 4
        && box.y < other.y + other.h + 2
        && box.y + box.h > other.y - 2
      ));
      if (!hit) {
        labelSlots.push(box);
        return { labelY: y, tier, width };
      }
      y += 11;
      if (primary && attempt >= 2) tier = 'secondary';
    }
    labelSlots.push({ x: building.cx - width / 2, y: y - 10, w: width, h: height });
    return { labelY: y, tier: 'secondary', width };
  }

  for (const building of [...accountBuildings.values()].sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx))) {
    building.labelLayout = placeLabel(building, true);
  }
  for (const building of [...entityBuildings.values()].sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx))) {
    building.labelLayout = placeLabel(building, false);
  }

  const roads = flows.map((flow, index) => {
    const from = accountBuildings.get(flow.from);
    const to = accountBuildings.get(flow.to);
    if (!from || !to) return null;
    const midX = (from.art.foot.x + to.art.foot.x) / 2;
    const midY = (from.art.foot.y + to.art.foot.y) / 2 - 22;
    const points = [
      [from.art.foot.x, from.art.foot.y],
      [midX, midY],
      [to.art.foot.x, to.art.foot.y],
    ];
    const d = `M ${points[0][0]} ${points[0][1]} Q ${points[1][0]} ${points[1][1]} ${points[2][0]} ${points[2][1]}`;
    const labelX = midX;
    const labelY = midY - 8;
    return { flow, index, d, labelX, labelY, points };
  }).filter(Boolean);

  const stageCenter = {
    x: origin.x,
    y: origin.y,
  };
  // Recompute center from placed buildings for rotate pivot.
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const building of [...accountBuildings.values(), ...entityBuildings.values()]) {
    sx += building.cx;
    sy += building.cy;
    n += 1;
  }
  if (n) {
    stageCenter.x = sx / n;
    stageCenter.y = sy / n;
  }

  return { accountBuildings, entityBuildings, roads, tile, origin, stageCenter };
}

function validateCity(ledgerDoc, layout, viewBox) {
  const problems = [];
  if (ledgerDoc.schema_version !== 1) problems.push('Ledger files must set "schema_version": 1.');
  if (ledgerDoc.diagram_type !== 'ledger') problems.push('Ledger files must set "diagram_type": "ledger".');
  if (!ledgerDoc.meta?.title) problems.push('Ledger files must include meta.title.');
  if (layout.accountBuildings.size !== asArray(ledgerDoc.accounts).length) {
    problems.push('Account ids must be unique.');
  }
  for (const flow of asArray(ledgerDoc.flows)) {
    if (!layout.accountBuildings.has(flow.from)) problems.push(`Flow "${flow.id}" references unknown source account "${flow.from}".`);
    if (!layout.accountBuildings.has(flow.to)) problems.push(`Flow "${flow.id}" references unknown target account "${flow.to}".`);
  }
  const pad = 28;
  for (const building of [...layout.accountBuildings.values(), ...layout.entityBuildings.values()]) {
    if (building.cx < pad || building.cx > viewBox[0] - pad) {
      problems.push(`City building "${building.id}" exceeds horizontal bounds — increase meta.viewBox[0] or tighten placement.`);
    }
    if (building.art.apexY < 20 || building.art.labelY > viewBox[1] - 40) {
      problems.push(`City building "${building.id}" exceeds vertical bounds — increase meta.viewBox[1] or tighten placement.`);
    }
  }
  const showcase = ledgerDoc.meta?.quality_profile === 'showcase';
  if (showcase && viewBox[0] > 1400) {
    problems.push('City showcase viewBox width must stay at or under 1400 for source-font readability — shrink meta.viewBox[0] or use quality_profile "standard".');
  }
  if (problems.length) {
    throwDiagnosticProblems('Ledger city layout validation failed', problems, {
      subject: { diagramType: 'ledger' },
    });
  }
}

function renderAccountBuilding(node, ledgerDoc, nodeSteps, health) {
  const context = `${i18nText(ledgerDoc.meta.locale, `ledger.class.${node.class}`)} · ${i18nText(ledgerDoc.meta.locale, 'node.context.ledger')}`;
  const passport = { kind: node.class, sublabel: node.sublabel, tag: node.tag, context };
  const labelSize = Math.max(7.5, Math.min(11, 72 / Math.max(4, textUnits(node.label))));
  const tier = node.labelLayout?.tier || 'primary';
  const labelY = node.labelLayout?.labelY ?? node.art.labelY;
  const animateMarkup = animateAttr(ledgerDoc.meta, 'node', nodeSteps.get(node.id));
  const styled = cityNodeStyle(health, animateMarkup);
  return `        <g ${focusNodeAttrs(node.id, node.label, passport, ledgerDoc.meta.locale)} data-ledger-account="${esc(node.class)}" data-ledger-building="account" data-city-kind="${esc(node.kind)}" data-city-label="${esc(tier)}"${node.cash ? ' data-ledger-cash="true"' : ''}${healthAttrs(health)}${styled.style} class="city-building ${node.fill}"${styled.animateRest}>
          ${focusNodeTitle(node.label, passport)}
${node.art.markup}
          <text data-node-label="" data-city-building-label="" x="${node.cx}" y="${labelY}" class="t-primary city-building-label" font-size="${labelSize}" font-weight="600" text-anchor="middle">${esc(node.label)}</text>
        </g>`;
}

function renderEntityBuilding(node, ledgerDoc, health) {
  const context = `${i18nText(ledgerDoc.meta.locale, `ledger.entity.${node.class}`)} · ${i18nText(ledgerDoc.meta.locale, 'node.context.ledger')}`;
  const passport = { kind: node.class, sublabel: node.sublabel, context };
  const grouped = node.grouped ? ` · ×${node.grouped}` : '';
  const labelSize = Math.max(7, Math.min(10, 64 / Math.max(4, textUnits(node.label))));
  const tier = node.labelLayout?.tier || 'secondary';
  const labelY = node.labelLayout?.labelY ?? node.art.labelY;
  // Entities are secondary: focusable for filter/inspection but not account nodes.
  const styled = cityNodeStyle(health, '');
  return `        <g id="entity-${esc(node.id)}" data-entity-id="${esc(node.id)}" data-ledger-building="entity" data-city-kind="${esc(node.kind)}" data-city-label="${esc(tier)}" data-node-label="${esc(node.label)}"${healthAttrs(health)}${styled.style} tabindex="0" role="button" aria-label="${esc(node.label)}${esc(grouped)}" class="city-building city-entity ${node.fill}">
          <title>${esc(node.label)}${esc(grouped)} · ${esc(context)}</title>
${node.art.markup}
          <text data-city-building-label="" x="${node.cx}" y="${labelY}" class="t-muted city-building-label" font-size="${labelSize}" font-weight="600" text-anchor="middle">${esc(node.label)}</text>${node.grouped ? `
          <text data-city-building-label="" x="${node.cx}" y="${labelY + 11}" class="t-dim city-building-label" font-size="6.5" text-anchor="middle">×${node.grouped}</text>` : ''}
        </g>`;
}

function renderRoad(road, ledgerDoc) {
  const { flow, index, d, labelX, labelY } = road;
  const labelW = Math.max(34, textUnits(flow.label) * 4.6 + 10);
  const width = Math.max(3.2, Number(flow.width) || 3.2);
  // Lane feel: wider road-bed under the travel stroke. Both keep class city-road out of a-* family.
  return `        <g class="city-road-group" data-city-road="" ${focusEdgeAttrs(flow.from, flow.to, flow.label, index, flow.id)}>
          <path d="${d}" class="city-road city-road-bed" stroke-width="${width + 2.4}" fill="none" aria-hidden="true"/>
          <path ${focusEdgeAttrs(flow.from, flow.to, flow.label, index, flow.id)} d="${d}" class="city-road"${animateAttr(ledgerDoc.meta, 'edge', index)} stroke-width="${width}" marker-end="url(#marker-city)" fill="none"/>
        </g>
        <g data-detail="context" data-city-flow-label="" ${focusEdgeAttrs(flow.from, flow.to, flow.label, index, flow.id)}>
          <rect x="${labelX - labelW / 2}" y="${labelY - 9}" width="${labelW}" height="14" rx="3" class="c-mask"/>
          <text x="${labelX}" y="${labelY + 1}" class="t-muted" font-size="7.5" text-anchor="middle">${esc(flow.label)}</text>
        </g>`;
}

function renderCityLegend(ledgerDoc, viewBox, accountBuildings) {
  const catalog = [
    { kind: 'asset', swatchClass: 'c-database' },
    { kind: 'liability', swatchClass: 'c-security' },
    { kind: 'revenue', swatchClass: 'c-frontend' },
    { kind: 'expense', swatchClass: 'c-backend' },
    { kind: 'equity', swatchClass: 'c-external' },
    { kind: 'default', className: 'city-road', marker: 'marker-city', swatchWidth: 34, swatchGap: 9, interactive: false },
    { kind: 'health', className: 'city-health', swatchWidth: 34, swatchGap: 9, interactive: false },
  ].map((entry) => ({
    ...entry,
    label: i18nText(
      ledgerDoc.meta.locale,
      entry.kind === 'default'
        ? 'legend.ledger.cityRoad'
        : entry.kind === 'health'
          ? 'legend.ledger.cityHealth'
          : `legend.ledger.${entry.kind}`,
    ),
  }));
  const presentKinds = new Set(['default', 'health']);
  for (const node of accountBuildings.values()) presentKinds.add(node.class);
  const entries = resolveLegend(ledgerDoc.meta?.legend, catalog, presentKinds);
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
    renderSwatch: (entry) => {
      if (entry.swatchClass) {
        return `<rect x="${entry.x}" y="${entry.baseline - 8}" width="14" height="9" rx="2" class="${entry.swatchClass}" stroke-width="1"/>`;
      }
      if (entry.kind === 'health') {
        return `<rect x="${entry.x}" y="${entry.baseline - 7}" width="34" height="8" rx="2" fill="url(#city-health-swatch)" stroke="var(--panel-border)" stroke-width="0.6"/>`;
      }
      return `<path d="M ${entry.x} ${entry.baseline - 3} L ${entry.x + 34} ${entry.baseline - 3}" class="city-road" stroke-width="2.4" marker-end="url(#marker-city)"/>`;
    },
  });
}

export function renderCityScene(ledgerDoc, summary = null) {
  const viewBox = ledgerDoc.meta?.viewBox || [1200, 860];
  const layout = layoutCity(ledgerDoc, viewBox);
  validateCity(ledgerDoc, layout, viewBox);

  const nodeSteps = new Map();
  for (const [index, flow] of asArray(ledgerDoc.flows).entries()) {
    if (!nodeSteps.has(flow.from)) nodeSteps.set(flow.from, index);
    if (!nodeSteps.has(flow.to)) nodeSteps.set(flow.to, index + 1);
  }
  for (const [index, account] of asArray(ledgerDoc.accounts).entries()) {
    if (!nodeSteps.has(account.id)) nodeSteps.set(account.id, index);
  }

  // Paint order: roads under buildings; entity ring then account district on top.
  const accountList = [...layout.accountBuildings.values()].sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));
  const entityList = [...layout.entityBuildings.values()].sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));

  const groundRx = Math.min(480, viewBox[0] * 0.42);
  const groundRy = Math.min(250, viewBox[1] * 0.3);
  const ground = `        <ellipse cx="${layout.stageCenter.x}" cy="${layout.stageCenter.y + 36}" rx="${groundRx}" ry="${groundRy}" class="city-ground" />`;
  const cx = layout.stageCenter.x;
  const cy = layout.stageCenter.y;

  return `      <svg viewBox="0 0 ${viewBox[0]} ${viewBox[1]}" ${svgRootAttrs(ledgerDoc.meta, 'ledger')} data-ledger-view="city" data-city-stage-cx="${cx}" data-city-stage-cy="${cy}">
${svgAccessibleText(ledgerDoc.meta, 'ledger')}
${cityDefs()}

        <rect width="100%" height="100%" fill="url(#grid)" />
        <g data-city-stage="" data-city-rotate="0" transform="rotate(0 ${cx} ${cy})">
${ground}

        <!-- City roads (flows) -->
${layout.roads.map((road) => renderRoad(road, ledgerDoc)).join('\n')}

        <!-- Entity buildings -->
${entityList.map((node) => renderEntityBuilding(node, ledgerDoc, cityEntityHealth(node.id, summary))).join('\n\n')}

        <!-- Account buildings -->
${accountList.map((node) => renderAccountBuilding(node, ledgerDoc, nodeSteps, cityAccountHealth(node.id, summary))).join('\n\n')}
        </g>

        <!-- Legend -->
${renderCityLegend(ledgerDoc, viewBox, layout.accountBuildings)}
      </svg>`;
}
