// Ledger replay: the data layer behind the `ledger` diagram type.
//
// A ledger block carries dated, sourced money events. Every event may only
// travel a flow the map already authored: the renderer never infers an edge,
// never allocates a split entry, and never drops a row. Anything that cannot
// be placed is listed under `unmapped` so the reader sees it. All arithmetic
// is in integer cents so the tie-out panel and the viewer agree to the cent.

import { esc } from './utils.mjs';
import { throwDiagnosticProblems } from './diagnostics.mjs';
import { translateMessage } from './i18n.mjs';

export const ACCOUNT_CLASSES = Object.freeze(['asset', 'liability', 'equity', 'revenue', 'contra', 'expense']);
export const ENTITY_CLASSES = Object.freeze(['customer', 'vendor', 'bank', 'lender', 'government', 'employee', 'owner', 'processor', 'other']);
export const EVENT_KINDS = Object.freeze(['journal', 'refund', 'transfer']);
export const DEFAULT_DAYS_PER_SECOND = 2;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MINUS = '−';
const ARROW = '→';

export function parseIsoDate(value) {
  const match = DATE_RE.exec(String(value || ''));
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date;
}

function isoFromUtc(date) {
  return date.toISOString().slice(0, 10);
}

export function periodDays(period) {
  const start = parseIsoDate(period?.start);
  const end = parseIsoDate(period?.end);
  if (!start || !end || end < start) return [];
  const days = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    days.push(isoFromUtc(cursor));
  }
  return days;
}

export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

function hasMoreThanTwoDecimals(amount) {
  return Math.abs(Number(amount) * 100 - Math.round(Number(amount) * 100)) > 1e-6;
}

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$', JPY: '¥' };

// Deterministic across Node ICU builds: no Intl.
export function formatCents(cents, currency) {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const symbol = CURRENCY_SYMBOLS[currency];
  const body = symbol ? `${symbol}${grouped}.${fraction}` : `${currency} ${grouped}.${fraction}`;
  return negative ? `${MINUS}${body}` : body;
}

function indexById(list) {
  return new Map((Array.isArray(list) ? list : []).map((item) => [item.id, item]));
}

// Resolve an event to one authored flow. Returns { flow } or { problem }.
export function resolveEventFlow(event, flowsById, flowsByPair) {
  if (event.edge !== undefined) {
    const flow = flowsById.get(event.edge);
    return flow ? { flow } : { problem: `references unknown flow id ${JSON.stringify(event.edge)}` };
  }
  if (event.from !== undefined || event.to !== undefined) {
    if (event.from === undefined || event.to === undefined) {
      return { problem: 'must name both from and to when edge is omitted' };
    }
    const candidates = flowsByPair.get(`${event.from} ${event.to}`) || [];
    if (candidates.length === 1) return { flow: candidates[0] };
    if (candidates.length === 0) return { problem: `no authored flow runs ${JSON.stringify(event.from)} -> ${JSON.stringify(event.to)}` };
    return { problem: `${candidates.length} authored flows run ${JSON.stringify(event.from)} -> ${JSON.stringify(event.to)}; name one with edge` };
  }
  return { problem: 'must reference an authored flow with edge, or with from and to' };
}

function pairIndex(flows) {
  const flowsByPair = new Map();
  for (const flow of Array.isArray(flows) ? flows : []) {
    const key = `${flow.from} ${flow.to}`;
    if (!flowsByPair.has(key)) flowsByPair.set(key, []);
    flowsByPair.get(key).push(flow);
  }
  return flowsByPair;
}

export function validateLedger(diagram) {
  const ledger = diagram?.ledger;
  if (!ledger || typeof ledger !== 'object') return;
  const problems = [];
  const accounts = indexById(diagram.accounts);
  const entities = indexById(diagram.entities);
  const flowsById = indexById(diagram.flows);
  const flowsByPair = pairIndex(diagram.flows);

  const start = parseIsoDate(ledger.period?.start);
  const end = parseIsoDate(ledger.period?.end);
  if (!start) problems.push('/ledger/period/start is not a real calendar date');
  if (!end) problems.push('/ledger/period/end is not a real calendar date');
  if (start && end && end < start) problems.push('/ledger/period ends before it starts');

  const amounts = ledger.amounts !== false;
  if (ledger.proof === 'csv') {
    for (const field of ['file', 'sha256', 'rows']) {
      if (ledger.source?.[field] === undefined) {
        problems.push(`/ledger/source/${field} is required when proof is "csv" (a CSV badge must name its file, digest, and row count)`);
      }
    }
  }

  for (const [id] of Object.entries(ledger.opening || {})) {
    if (!accounts.has(id)) problems.push(`/ledger/opening/${id} is not an account id`);
  }

  const inPeriod = (value) => {
    const date = parseIsoDate(value);
    return date && start && end ? date >= start && date <= end : false;
  };

  const seen = new Set();
  (ledger.events || []).forEach((event, index) => {
    const at = `/ledger/events/${index}`;
    if (seen.has(event.id)) problems.push(`${at}/id duplicates event id ${JSON.stringify(event.id)}`);
    seen.add(event.id);
    if (!inPeriod(event.date)) problems.push(`${at}/date ${JSON.stringify(event.date)} is outside the ledger period`);
    const resolved = resolveEventFlow(event, flowsById, flowsByPair);
    if (resolved.problem) problems.push(`${at} ${resolved.problem}`);
    if (!EVENT_KINDS.includes(event.kind)) problems.push(`${at}/kind ${JSON.stringify(event.kind)} is not one of ${EVENT_KINDS.join(', ')}`);
    if (event.amount !== undefined) {
      if (!amounts) problems.push(`${at}/amount is present but ledger.amounts is false; remove the amount or set amounts to true`);
      if (hasMoreThanTwoDecimals(event.amount)) problems.push(`${at}/amount ${event.amount} has more than two decimal places`);
    } else if (amounts) {
      problems.push(`${at}/amount is missing; set ledger.amounts to false for a counts-only ledger`);
    }
    if (event.entity !== undefined && !entities.has(event.entity)) problems.push(`${at}/entity references unknown entity ${JSON.stringify(event.entity)}`);
  });

  (ledger.unmapped || []).forEach((row, index) => {
    const at = `/ledger/unmapped/${index}`;
    if (row.reason !== 'out-of-period' && !inPeriod(row.date)) {
      problems.push(`${at}/date ${JSON.stringify(row.date)} is outside the ledger period; use reason "out-of-period" for such rows`);
    }
    if (row.amount !== undefined && hasMoreThanTwoDecimals(row.amount)) problems.push(`${at}/amount has more than two decimal places`);
    if (row.entity !== undefined && !entities.has(row.entity)) problems.push(`${at}/entity references unknown entity ${JSON.stringify(row.entity)}`);
  });

  const tieoutIds = new Set();
  (ledger.tieouts || []).forEach((tieout, index) => {
    const at = `/ledger/tieouts/${index}`;
    if (tieoutIds.has(tieout.id)) problems.push(`${at}/id duplicates tie-out id ${JSON.stringify(tieout.id)}`);
    tieoutIds.add(tieout.id);
    const byFlows = tieout.left !== undefined || tieout.right !== undefined;
    const byNode = tieout.node !== undefined || tieout.expected !== undefined;
    if (byFlows === byNode) {
      problems.push(`${at} must compare two flows (left, right) or one account against a supplied figure (node, expected), not both or neither`);
    }
    if (byFlows) {
      for (const side of ['left', 'right']) {
        if (tieout[side] === undefined) problems.push(`${at}/${side} is required`);
        else if (!flowsById.has(tieout[side])) problems.push(`${at}/${side} references unknown flow ${JSON.stringify(tieout[side])}`);
      }
    }
    if (byNode) {
      if (tieout.node === undefined || !accounts.has(tieout.node)) problems.push(`${at}/node must be an account id`);
      if (typeof tieout.expected !== 'number') problems.push(`${at}/expected must be the figure supplied by the user`);
      else if (hasMoreThanTwoDecimals(tieout.expected)) problems.push(`${at}/expected has more than two decimal places`);
      if (!amounts) problems.push(`${at} compares amounts but ledger.amounts is false`);
    }
  });

  if (problems.length) {
    throwDiagnosticProblems('Ledger validation failed', problems, {
      code: 'ledger/invalid',
      subject: { diagramType: 'ledger', collection: 'ledger' },
    });
  }
}

function bucket() {
  return { count: 0, sum: 0, refundCount: 0, refundSum: 0 };
}

export function summarize(diagram) {
  const ledger = diagram.ledger;
  const accountsList = Array.isArray(diagram.accounts) ? diagram.accounts : [];
  const entitiesList = Array.isArray(diagram.entities) ? diagram.entities : [];
  const flowsList = Array.isArray(diagram.flows) ? diagram.flows : [];
  const flowsById = indexById(flowsList);
  const flowsByPair = pairIndex(flowsList);
  const amounts = ledger.amounts !== false;
  const days = periodDays(ledger.period);
  const dayIndex = new Map(days.map((day, index) => [day, index]));

  const flows = Object.fromEntries(flowsList.map((flow) => [flow.id, { ...bucket(), from: flow.from, to: flow.to, label: flow.label }]));
  const accounts = Object.fromEntries(accountsList.map((account) => [account.id, {
    label: account.label,
    class: account.class,
    cash: account.cash === true,
    in: 0,
    out: 0,
    count: 0,
    opening: ledger.opening && ledger.opening[account.id] !== undefined ? toCents(ledger.opening[account.id]) : null,
  }]));
  const entities = Object.fromEntries(entitiesList.map((entity) => [entity.id, {
    label: entity.label,
    class: entity.class,
    grouped: entity.grouped || null,
    in: 0,
    out: 0,
    count: 0,
    unmappedCount: 0,
    unmappedSum: 0,
  }]));
  const classes = {};
  for (const entity of entitiesList) {
    if (!classes[entity.class]) classes[entity.class] = { in: 0, out: 0, count: 0, entities: 0 };
    classes[entity.class].entities += 1;
  }
  const perDay = days.map((date) => ({ date, flows: {} }));
  const cashIds = new Set(accountsList.filter((account) => account.cash === true).map((account) => account.id));
  const amountsSeen = [];
  let totalIn = 0;
  let totalOut = 0;
  let eventCount = 0;

  for (const event of ledger.events || []) {
    const resolved = resolveEventFlow(event, flowsById, flowsByPair);
    if (!resolved.flow) continue; // validateLedger already refused these
    const flow = resolved.flow;
    const cents = amounts && event.amount !== undefined ? toCents(event.amount) : 0;
    const reverse = event.kind === 'refund';
    const source = reverse ? flow.to : flow.from;
    const target = reverse ? flow.from : flow.to;
    const flowSummary = flows[flow.id];
    if (reverse) {
      flowSummary.refundCount += 1;
      flowSummary.refundSum += cents;
    } else {
      flowSummary.count += 1;
      flowSummary.sum += cents;
    }
    if (accounts[target]) { accounts[target].in += cents; accounts[target].count += 1; }
    if (accounts[source]) { accounts[source].out += cents; accounts[source].count += 1; }
    if (cashIds.has(target)) totalIn += cents;
    if (cashIds.has(source)) totalOut += cents;
    if (event.entity && entities[event.entity]) {
      const entity = entities[event.entity];
      const towardBusiness = cashIds.has(target) || (!cashIds.has(source) && accounts[target]?.class === 'asset');
      if (towardBusiness) entity.in += cents; else entity.out += cents;
      entity.count += 1;
      const cls = classes[entity.class];
      if (cls) {
        if (towardBusiness) cls.in += cents; else cls.out += cents;
        cls.count += 1;
      }
    }
    const day = perDay[dayIndex.get(event.date)];
    if (day) {
      const key = `${flow.id}|${reverse ? 'reverse' : 'forward'}`;
      if (!day.flows[key]) {
        day.flows[key] = { edgeId: flow.id, from: source, to: target, direction: reverse ? 'reverse' : 'forward', kind: event.kind, count: 0, sum: 0, entities: [] };
      }
      const slot = day.flows[key];
      slot.count += 1;
      slot.sum += cents;
      if (event.entity && !slot.entities.includes(event.entity)) slot.entities.push(event.entity);
    }
    if (amounts) amountsSeen.push(cents);
    eventCount += 1;
  }

  const unmappedRows = (ledger.unmapped || []).map((row) => ({
    date: row.date,
    ref: row.ref || '',
    memo: row.memo || '',
    row: row.row ?? null,
    reason: row.reason,
    entity: row.entity || null,
    cents: row.amount !== undefined ? toCents(row.amount) : null,
  }));
  for (const row of unmappedRows) {
    if (row.entity && entities[row.entity]) {
      entities[row.entity].unmappedCount += 1;
      entities[row.entity].unmappedSum += row.cents || 0;
    }
  }
  const unmapped = {
    count: unmappedRows.length,
    sum: unmappedRows.reduce((total, row) => total + (row.cents || 0), 0),
    rows: unmappedRows,
  };

  for (const account of Object.values(accounts)) {
    account.net = account.in - account.out;
    account.closing = account.opening === null ? null : account.opening + account.net;
  }
  for (const flow of Object.values(flows)) flow.net = flow.sum - flow.refundSum;
  for (const entity of Object.values(entities)) entity.net = entity.in - entity.out;
  for (const cls of Object.values(classes)) cls.net = cls.in - cls.out;

  const tieouts = (ledger.tieouts || []).map((tieout) => {
    const tolerance = tieout.tolerance !== undefined ? toCents(tieout.tolerance) : 0;
    let computed;
    let expected;
    let mode;
    if (tieout.node !== undefined) {
      mode = 'node';
      computed = accounts[tieout.node] ? accounts[tieout.node].net : 0;
      expected = toCents(tieout.expected);
    } else {
      mode = 'flows';
      computed = flows[tieout.left] ? flows[tieout.left].net : 0;
      expected = flows[tieout.right] ? flows[tieout.right].net : 0;
    }
    const residual = computed - expected;
    return {
      id: tieout.id,
      label: tieout.label,
      mode,
      left: tieout.left ?? null,
      right: tieout.right ?? null,
      node: tieout.node ?? null,
      computed,
      expected,
      residual,
      tolerance,
      status: Math.abs(residual) <= tolerance ? 'tied' : 'break',
    };
  });

  const sorted = amountsSeen.slice().sort((a, b) => a - b);
  const p90 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))] : 0;

  return {
    currency: ledger.currency,
    amounts,
    proof: ledger.proof,
    source: ledger.source || null,
    period: { start: ledger.period.start, end: ledger.period.end, days },
    playback: { daysPerSecond: ledger.playback?.daysPerSecond || DEFAULT_DAYS_PER_SECOND },
    totals: { in: totalIn, out: totalOut, events: eventCount },
    p90,
    cashAccounts: [...cashIds],
    days: perDay,
    flows,
    accounts,
    entities,
    classes,
    tieouts,
    unmapped,
    breaks: tieouts.filter((tieout) => tieout.status === 'break').length,
  };
}

// The single timing source. The viewer plays this list; a recorded scene can too.
export function schedule(summary) {
  const items = [];
  summary.days.forEach((day, index) => {
    Object.keys(day.flows).forEach((key) => {
      items.push({ day: index, date: day.date, ...day.flows[key] });
    });
  });
  return items;
}

// What the standalone viewer needs: no memos, no per-row detail beyond the panel.
export function viewerPayload(diagram, summary) {
  const source = summary.source
    ? { file: summary.source.file || null, rows: summary.source.rows || null, sha256: summary.source.sha256 || null, system: summary.source.system || null }
    : null;
  return {
    currency: summary.currency,
    amounts: summary.amounts,
    proof: summary.proof,
    source,
    period: summary.period,
    playback: summary.playback,
    p90: summary.p90,
    cashAccounts: summary.cashAccounts,
    view: diagram.meta?.view === 'city' ? 'city' : 'map',
    sibling: diagram.meta?.sibling || null,
    accounts: (diagram.accounts || []).map((account) => ({ id: account.id, label: account.label, class: account.class, cash: account.cash === true })),
    flows: (diagram.flows || []).map((flow) => ({ id: flow.id, from: flow.from, to: flow.to, label: flow.label })),
    entities: (diagram.entities || []).map((entity) => ({ id: entity.id, label: entity.label, class: entity.class, grouped: entity.grouped || null })),
    flowTotals: Object.fromEntries(Object.entries(summary.flows).map(([id, flow]) => [id, { count: flow.count + flow.refundCount, net: flow.net, sum: flow.sum, refundSum: flow.refundSum }])),
    schedule: schedule(summary),
    breaks: summary.breaks,
    unmappedCount: summary.unmapped.count,
  };
}

function t(locale, key, values) {
  return translateMessage(locale, key, values);
}

function money(summary, cents) {
  return summary.amounts ? formatCents(cents, summary.currency) : '—';
}

function signed(summary, cents) {
  if (!summary.amounts) return '—';
  const body = formatCents(Math.abs(cents), summary.currency);
  if (cents > 0) return `+${body}`;
  if (cents < 0) return `${MINUS}${body}`;
  return body;
}

export function renderLedgerPanel(diagram, summary) {
  const locale = diagram.meta?.locale;
  const accountsList = Array.isArray(diagram.accounts) ? diagram.accounts : [];
  const flowsList = Array.isArray(diagram.flows) ? diagram.flows : [];
  const entitiesList = Array.isArray(diagram.entities) ? diagram.entities : [];
  const dash = '—';
  const proofLine = summary.proof === 'csv' && summary.source
    ? t(locale, 'ledger.panel.proof.csv', {
      file: summary.source.file || '',
      rows: String(summary.source.rows || ''),
      digest: String(summary.source.sha256 || '').slice(0, 8),
    })
    : t(locale, 'ledger.panel.proof.authored');
  const summaryBits = [
    t(locale, 'ledger.panel.events', { count: String(summary.totals.events) }),
    summary.breaks === 0 ? t(locale, 'ledger.panel.breaks.none') : t(locale, 'ledger.panel.breaks.some', { count: String(summary.breaks) }),
    summary.unmapped.count === 1 ? t(locale, 'ledger.panel.unmapped.one') : t(locale, 'ledger.panel.unmapped.other', { count: String(summary.unmapped.count) }),
  ];
  const hasOpening = accountsList.some((account) => summary.accounts[account.id]?.opening !== null);

  const accountRows = accountsList.map((account) => {
    const row = summary.accounts[account.id];
    const openingCells = hasOpening
      ? `<td>${row.opening === null ? dash : money(summary, row.opening)}</td><td>${row.closing === null ? dash : money(summary, row.closing)}</td>`
      : '';
    return `<tr><th scope="row">${esc(account.label)}<small>${esc(t(locale, `ledger.class.${account.class}`))}</small></th><td>${money(summary, row.in)}</td><td>${money(summary, row.out)}</td><td class="ledger-net">${signed(summary, row.net)}</td><td>${row.count}</td>${openingCells}</tr>`;
  }).join('\n');

  const flowRows = flowsList.map((flow) => {
    const row = summary.flows[flow.id];
    const refunds = row.refundCount ? `${row.refundCount} · ${money(summary, row.refundSum)}` : dash;
    return `<tr><th scope="row">${esc(flow.label)}<small>${esc(flow.from)} ${ARROW} ${esc(flow.to)}</small></th><td>${row.count}</td><td>${money(summary, row.sum)}</td><td>${refunds}</td><td class="ledger-net">${money(summary, row.net)}</td></tr>`;
  }).join('\n');

  const byClass = new Map();
  for (const entity of entitiesList) {
    if (!byClass.has(entity.class)) byClass.set(entity.class, []);
    byClass.get(entity.class).push(entity);
  }
  const entityRows = [...byClass.entries()].map(([cls, list]) => {
    const rows = list.map((entity) => {
      const row = summary.entities[entity.id];
      const grouped = entity.grouped ? ` <small>${esc(t(locale, 'ledger.panel.grouped', { count: String(entity.grouped) }))}</small>` : '';
      const unmappedNote = row.unmappedCount ? ` <small>${esc(t(locale, 'ledger.panel.entity.unmapped', { count: String(row.unmappedCount) }))}</small>` : '';
      return `<tr><th scope="row">${esc(entity.label)}${grouped}${unmappedNote}</th><td>${money(summary, row.in)}</td><td>${money(summary, row.out)}</td><td class="ledger-net">${signed(summary, row.net)}</td><td>${row.count}</td></tr>`;
    }).join('\n');
    return `<tr class="ledger-class-row"><th scope="rowgroup" colspan="5">${esc(t(locale, `ledger.entity.${cls}`))}</th></tr>\n${rows}`;
  }).join('\n');

  const tieoutRows = summary.tieouts.map((tieout) => {
    const status = tieout.status === 'tied' ? t(locale, 'ledger.panel.tied') : t(locale, 'ledger.panel.break');
    const compare = `${money(summary, tieout.computed)} ${t(locale, 'ledger.panel.vs')} ${money(summary, tieout.expected)}`;
    return `<tr data-ledger-tieout="${esc(tieout.status)}"><th scope="row">${esc(tieout.label)}</th><td>${compare}</td><td class="ledger-net">${signed(summary, tieout.residual)}</td><td><span class="ledger-status ledger-status-${esc(tieout.status)}">${esc(status)}</span></td></tr>`;
  }).join('\n');

  const unmappedRows = summary.unmapped.rows.length
    ? summary.unmapped.rows.map((row) => `<tr><td>${esc(row.date)}</td><td>${esc(row.ref)}</td><td>${row.cents === null ? dash : money(summary, row.cents)}</td><td>${esc(t(locale, `ledger.reason.${row.reason}`))}</td><td>${esc(row.memo)}</td></tr>`).join('\n')
    : `<tr><td colspan="5">${esc(t(locale, 'ledger.panel.unmapped.zero'))}</td></tr>`;

  const tempoOptions = [0.5, 1, 2, 4, 8].map((rate) => `          <option value="${rate}"${rate === summary.playback.daysPerSecond ? ' selected' : ''}>${esc(t(locale, 'ledger.strip.tempo.option', { n: String(rate) }))}</option>`).join('\n');
  const entityStrip = [...byClass.entries()].map(([cls, list]) => `      <div class="ledger-entity-class"><span class="ledger-entity-class-name">${esc(t(locale, `ledger.entity.${cls}`))}</span>
${list.map((entity) => `        <button type="button" class="ledger-entity" data-entity-id="${esc(entity.id)}" aria-pressed="false"><span>${esc(entity.label)}</span><small>${signed(summary, summary.entities[entity.id].net)}</small></button>`).join('\n')}
      </div>`).join('\n');

  const view = diagram.meta?.view === 'city' ? 'city' : 'map';
  const sibling = diagram.meta?.sibling || '';
  const viewToggle = sibling
    ? `      <nav class="ledger-view-toggle" aria-label="${esc(t(locale, 'ledger.view.toggle'))}">
        <a class="ledger-view-link" href="${view === 'map' ? '#' : esc(sibling)}" data-ledger-view-target="map"${view === 'map' ? ' aria-current="page"' : ''}>${esc(t(locale, 'ledger.view.map'))}</a>
        <a class="ledger-view-link" href="${view === 'city' ? '#' : esc(sibling)}" data-ledger-view-target="city"${view === 'city' ? ' aria-current="page"' : ''}>${esc(t(locale, 'ledger.view.city'))}</a>
      </nav>`
    : '';

  return `    <!-- MOSOFIN:LEDGER_SLOT_START -->
    <div class="ledger-strip no-print" id="ledger-strip" role="group" aria-label="${esc(t(locale, 'ledger.strip.label'))}">
${viewToggle ? `${viewToggle}
` : ''}      <button id="ledger-play" type="button" aria-pressed="false" title="${esc(t(locale, 'ledger.strip.play.title'))}">${esc(t(locale, 'viewer.ledger.play'))}</button>
      <span class="ledger-day" id="ledger-day" aria-live="polite">${esc(summary.period.start)}</span>
      <input id="ledger-range" type="range" min="0" max="${Math.max(0, summary.period.days.length - 1)}" value="0" step="1" aria-label="${esc(t(locale, 'ledger.strip.day'))}">
      <label class="ledger-tempo"><span>${esc(t(locale, 'ledger.strip.tempo'))}</span>
        <select id="ledger-tempo" aria-label="${esc(t(locale, 'ledger.strip.tempo'))}">
${tempoOptions}
        </select>
      </label>
      <span class="ledger-proof" id="ledger-proof">${esc(proofLine)}</span>
      <button id="ledger-copy-day" type="button" title="${esc(t(locale, 'ledger.strip.copyDay.title'))}">${esc(t(locale, 'ledger.strip.copyDay'))}</button>
      <span class="ledger-status-line" id="ledger-status" role="status" aria-live="polite"></span>
    </div>
    <div class="ledger-entities no-print" id="ledger-entities" role="group" aria-label="${esc(t(locale, 'ledger.entities.label'))}">
${entityStrip}
    </div>
    <details class="ledger-panel" id="ledger-panel" open>
      <summary><strong>${esc(t(locale, 'ledger.panel.title'))}</strong> <span class="ledger-panel-summary">${esc(summaryBits.join(' · '))}</span></summary>
      <section>
        <h4>${esc(t(locale, 'ledger.panel.accounts'))}</h4>
        <table><thead><tr><th>${esc(t(locale, 'ledger.panel.account'))}</th><th>${esc(t(locale, 'ledger.panel.in'))}</th><th>${esc(t(locale, 'ledger.panel.out'))}</th><th>${esc(t(locale, 'ledger.panel.net'))}</th><th>${esc(t(locale, 'ledger.panel.count'))}</th>${hasOpening ? `<th>${esc(t(locale, 'ledger.panel.opening'))}</th><th>${esc(t(locale, 'ledger.panel.closing'))}</th>` : ''}</tr></thead><tbody>
${accountRows}
        </tbody></table>
      </section>
      <section>
        <h4>${esc(t(locale, 'ledger.panel.flows'))}</h4>
        <table><thead><tr><th>${esc(t(locale, 'ledger.panel.flow'))}</th><th>${esc(t(locale, 'ledger.panel.count'))}</th><th>${esc(t(locale, 'ledger.panel.sum'))}</th><th>${esc(t(locale, 'ledger.panel.refunds'))}</th><th>${esc(t(locale, 'ledger.panel.net'))}</th></tr></thead><tbody>
${flowRows}
        </tbody></table>
      </section>
      <section>
        <h4>${esc(t(locale, 'ledger.panel.entities'))}</h4>
        <table><thead><tr><th>${esc(t(locale, 'ledger.panel.entity'))}</th><th>${esc(t(locale, 'ledger.panel.in'))}</th><th>${esc(t(locale, 'ledger.panel.out'))}</th><th>${esc(t(locale, 'ledger.panel.net'))}</th><th>${esc(t(locale, 'ledger.panel.count'))}</th></tr></thead><tbody>
${entityRows || `<tr><td colspan="5">${esc(t(locale, 'ledger.panel.entities.none'))}</td></tr>`}
        </tbody></table>
      </section>
      <section>
        <h4>${esc(t(locale, 'ledger.panel.tieouts'))}</h4>
        <table><thead><tr><th>${esc(t(locale, 'ledger.panel.tieout'))}</th><th>${esc(t(locale, 'ledger.panel.compare'))}</th><th>${esc(t(locale, 'ledger.panel.residual'))}</th><th>${esc(t(locale, 'ledger.panel.status'))}</th></tr></thead><tbody>
${tieoutRows || `<tr><td colspan="4">${esc(t(locale, 'ledger.panel.tieouts.none'))}</td></tr>`}
        </tbody></table>
      </section>
      <section>
        <h4>${esc(t(locale, 'ledger.panel.unmapped.title'))}</h4>
        <table><thead><tr><th>${esc(t(locale, 'ledger.panel.date'))}</th><th>${esc(t(locale, 'ledger.panel.ref'))}</th><th>${esc(t(locale, 'ledger.panel.amount'))}</th><th>${esc(t(locale, 'ledger.panel.reason'))}</th><th>${esc(t(locale, 'ledger.panel.memo'))}</th></tr></thead><tbody>
${unmappedRows}
        </tbody></table>
      </section>
      <p class="ledger-panel-scope">${esc(t(locale, 'ledger.panel.scope', { file: summary.source?.file || t(locale, 'ledger.panel.scope.authored'), period: `${summary.period.start} ${ARROW} ${summary.period.end}` }))}</p>
    </details>
    <!-- MOSOFIN:LEDGER_SLOT_END -->`;
}
