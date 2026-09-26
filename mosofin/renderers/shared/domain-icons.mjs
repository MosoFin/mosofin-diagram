// Domain icons — business pictograms for nodes that have no brand mark.
//
// A supplier, a warehouse, a controller or a legal entity has no vendor logo,
// and a product whose owner does not publish an openly licensed mark (NetSuite,
// Ramp) must never get an invented one. `node.icon` names a pictogram from the
// curated catalogue instead. It draws in the node's semantic colour through the
// same styling as the role sigil, so it reads as a role, never as a brand.

import { DOMAIN_ICONS, DOMAIN_ICON_SOURCE } from './generated-domain-icons.mjs';
import { throwDiagnosticError } from './diagnostics.mjs';
import { esc, sigilTone } from './utils.mjs';

export { DOMAIN_ICON_SOURCE };

const ICON_BY_KEY = new Map();
for (const icon of DOMAIN_ICONS) {
  for (const key of [icon.id, ...icon.aliases]) ICON_BY_KEY.set(key, icon);
}

function normalizedKey(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en-US').replace(/[\s_]+/g, '-');
}

export function findDomainIcon(value) {
  return ICON_BY_KEY.get(normalizedKey(value)) || null;
}

export function listDomainIcons(query = '') {
  const needle = String(query).trim().toLocaleLowerCase('en-US');
  return DOMAIN_ICONS.filter((icon) => !needle || [icon.id, icon.title, icon.use, ...icon.aliases]
    .some((value) => String(value).toLocaleLowerCase('en-US').includes(needle)))
    .map(({ body, ...icon }) => icon);
}

export function domainIconFor(node) {
  return node?.icon ? findDomainIcon(node.icon) : null;
}

// One glyph, drawn on Lucide's 24-unit grid and scaled to `size`.
export function renderDomainIcon(node, { x, y, size, kind }) {
  const icon = domainIconFor(node);
  if (!icon) return '';
  const scale = Math.round((size / 24) * 10000) / 10000;
  return `<g aria-hidden="true" data-domain-icon="${esc(icon.id)}" class="semantic-sigil s-${esc(sigilTone(kind))}" transform="translate(${x} ${y}) scale(${scale})">${icon.body}</g>`;
}

function suggestions(value) {
  const needle = normalizedKey(value);
  const scored = DOMAIN_ICONS.map((icon) => {
    const keys = [icon.id, ...icon.aliases];
    const hit = keys.some((key) => key.includes(needle) || needle.includes(key));
    return { id: icon.id, score: hit ? 0 : 1 };
  }).sort((a, b) => a.score - b.score);
  return scored.slice(0, 5).map((entry) => entry.id);
}

// Every authored `icon` must resolve; an unknown value is an authoring error,
// never a silent fallback, exactly like an unknown `brand`.
export function validateDomainIcons(diagramType, nodes) {
  const problems = [];
  for (const { node, path } of nodes) {
    if (node?.icon === undefined) continue;
    if (!findDomainIcon(node.icon)) {
      problems.push(`${path}/icon ${JSON.stringify(node.icon)} is not a domain icon; closest IDs: ${suggestions(node.icon).join(', ')} (list them with \`mosofin icons\`)`);
    }
  }
  if (problems.length) {
    throwDiagnosticError(`Domain icon validation failed:\n- ${problems.join('\n- ')}`, problems.map((message) => ({
      code: 'icon/unknown',
      severity: 'error',
      message,
      subject: { diagramType },
      evidence: {},
      supportedFixes: ['choose an ID from `mosofin icons`', 'omit icon to keep the role sigil'],
    })));
  }
}
