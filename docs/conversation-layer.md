# Conversation layer (statements + joints + Draft)

Sample: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · spec [`../mosofin/examples/northline-three-statements.architecture.json`](../mosofin/examples/northline-three-statements.architecture.json) · how to read the joints: [`three-statements.md`](three-statements.md).

## Why this (vs Fathom / Asset-Map)

Travis’s Fathom / Reach / Asset-Map research landed here: **not more Ask cards**. The meeting object should feel like Asset-Map when an owner or board is watching — a conversation layer *after* a pack, not a Fathom replacement.

| Surface | Role |
| --- | --- |
| **Left · Statements** | Real mini P&L / Balance / Cash-flow lines (performance navigation like PPT or Fathom) — authored from the July GL fixture |
| **Right · Joints** | The existing three-statements articulation SVG (why profit ≠ cash) |
| **Draft** | Baseline vs what-if side-by-side toggle (Asset-Map Drafts) — ledger scenario deltas only, labeled **WHAT-IF** |

Ask-first remains available as an optional **Ask mode** deep-link (`?ask=…`) for Q&A walkthroughs. Conversation is the default landing for this sample.

## Try it

- Baseline: open the sample and click a P&L line (e.g. Revenue) — the joints pane focuses matching nodes/edges.
- Draft: toggle **Draft** or open [`?draft=1`](samples/northline-three-statements.html?draft=1) — banner + amber amounts from ledger scenario `dtc-plus-10` (+10% DTC).
- Deep-link a line: [`?line=revenue`](samples/northline-three-statements.html?line=revenue) · combine [`?line=cash&draft=1`](samples/northline-three-statements.html?line=cash&draft=1).
- Optional Ask mode: [`?ask=cash`](samples/northline-three-statements.html?ask=cash) or the **Ask mode** control.

## Authoring

`meta.presentation: "conversation"` plus:

- `meta.statements.income|balance|cashflow[]` — `{ id, label, amount?, note?, focus[], joint? }`
- `meta.draft` — `{ id, label, banner?, scenarioId?, verdict?, amounts: { lineId: "…" } }`
- `meta.verdict` — one-line “Profit vs cash: …” strip

Amounts are authored only. Never invent an NI dollar when payroll splits stay unmapped.
