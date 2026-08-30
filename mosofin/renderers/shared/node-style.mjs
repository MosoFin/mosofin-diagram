// Logo mode — an additive presentation layer over the existing node box.
//
// `meta.node_style` selects how a semantic node is drawn:
//
//   "box"  (default) the shipped rectangle. Nothing about it changes.
//   "logo"           the node's brand mark is drawn large, with the label beneath
//                    it, for every node that actually has a mark. A node with no
//                    mark falls back to its semantic sigil at the same size — the
//                    role glyph the product already uses (ledger, bank, commerce,
//                    counterparty…). That keeps every node reading as an icon
//                    without inventing a vendor logo, which the brand contract
//                    forbids: many such nodes are not software at all (a supplier
//                    is a counterparty, a close is a person's job).
//
// Both variants are emitted into the same SVG and switched by one CSS rule on the
// root, so a delivered artifact can be flipped by the reader without re-rendering
// and every export keeps whichever view is active. Geometry, ids, focus targets
// and authored coordinates are identical in both — logo mode never moves a node.

import { esc, renderSemanticSigil } from './utils.mjs';
import { brandMarkFor } from './brand-marks.mjs';

export const NODE_STYLES = Object.freeze(['box', 'logo']);
export const DEFAULT_NODE_STYLE = 'box';

/** The authored style, defaulting to the shipped box. Unknown values fail schema validation. */
export function resolveNodeStyle(meta) {
  const value = meta?.node_style;
  return NODE_STYLES.includes(value) ? value : DEFAULT_NODE_STYLE;
}

/** True when this node can be drawn as a logo — i.e. a mark actually resolved for it. */
export function hasLogo(node) {
  const mark = brandMarkFor(node);
  return Boolean(mark) && mark.kind !== 'fallback';
}

/**
 * The plate geometry for one logo-mode node.
 *
 * The plate fills the node's layout rectangle rather than floating inside it.
 * That matters for more than looks: connectors are anchored to the node rect by
 * `anchor()` in geometry.mjs, and the same rect feeds every routing gate, the
 * boundary frames and the auto viewBox. A plate that stopped short of the rect
 * left each arrowhead ending in blank space. Filling the rect makes the drawn
 * artwork meet the endpoints the validated geometry already produced, so both
 * node styles keep byte-identical coordinates and the viewer can still switch
 * between them with one CSS rule.
 */
function plateGeometry({ x, y, width, height }) {
  // Room beneath the plate for the label, and a hairline so adjacent nodes and
  // boundary frames never touch.
  const labelRoom = 18;
  const bleed = 1;
  const plateW = Math.max(16, width - bleed * 2);
  const plateH = Math.max(16, height - labelRoom - bleed);
  const plateX = x + (width - plateW) / 2;
  const plateY = y + bleed;
  const radius = Math.round(Math.min(plateW, plateH) * 0.18 * 10) / 10;
  // Square drawing area for the mark, centred in a plate that is usually wider
  // than it is tall.
  const square = Math.min(plateW, plateH);
  return { plateX, plateY, plateW, plateH, radius, square };
}

/**
 * The logo-mode artwork for one node: a large mark centred in the node box with
 * the label beneath it. Returns '' when the node has no mark, so the caller can
 * fall back to the outlined box.
 */
export function renderLogoNode(node, { x, y, width, height, label }) {
  const mark = brandMarkFor(node);
  if (!mark || mark.kind === 'fallback') return '';

  const { plateX, plateY, plateW, plateH, radius, square } = plateGeometry({ x, y, width, height });

  // The mark keeps its own square proportions, centred in the plate.
  const art = Math.round(square * 0.56 * 10) / 10;
  const artX = Math.round(((plateW - art) / 2) * 10) / 10;
  const artY = Math.round(((plateH - art) / 2) * 10) / 10;

  let content;
  if (mark.kind === 'preset') {
    const scale = Math.round((art / mark.viewBox) * 10000) / 10000;
    content = `<path d="${esc(mark.path)}" transform="translate(${artX} ${artY}) scale(${scale})" fill="#${esc(mark.hex)}"/>`;
  } else {
    content = `<image href="${esc(mark.dataUrl)}" x="${artX}" y="${artY}" width="${art}" height="${art}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  return `<g class="node-logo" aria-hidden="true">
            <g transform="translate(${plateX} ${plateY})">
              <rect width="${plateW}" height="${plateH}" rx="${radius}" class="node-logo-plate"/>
              ${content}
              <rect width="${plateW}" height="${plateH}" rx="${radius}" class="node-logo-frame"/>
            </g>
          </g>`;
}

/**
 * The fallback for a logo-mode node with no brand mark: its semantic sigil, drawn
 * at the same scale as a real logo so the row reads evenly. The glyph carries the
 * node's role — counterparty, ledger, bank, control — which is honest for the many
 * nodes that are not software at all.
 */
export function renderLogolessBox(node, { x, y, width, height, kind }) {
  const { plateX, plateY, plateW, plateH, radius, square } = plateGeometry({ x, y, width, height });
  const glyph = Math.round(square * 0.56 * 10) / 10;
  const glyphX = Math.round(((plateW - glyph) / 2) * 10) / 10;
  const glyphY = Math.round(((plateH - glyph) / 2) * 10) / 10;
  return `<g class="node-logoless" aria-hidden="true">
            <g transform="translate(${plateX} ${plateY})">
              <rect width="${plateW}" height="${plateH}" rx="${radius}" class="node-logoless-plate"/>
              ${renderSemanticSigil(kind, { x: glyphX, y: glyphY, size: glyph })}
            </g>
          </g>`;
}
