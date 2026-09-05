# Ledger renderer

`render-ledger.mjs` draws an **account map** and replays a general-ledger journal across it.

- Nodes are `accounts` (asset, liability, equity, revenue, contra, expense), laid out in
  `stages` like a data-flow diagram. Set `cash: true` on the operating account(s) so the viewer
  can colour money moving into and out of cash.
- `flows` are authored credit → debit relationships. They are the only paths money may travel.
- `ledger.events` are dated journal lines that reference a flow (`edge`, or `from` + `to`).
  A `refund` runs the same flow in reverse; nothing is inferred. Rows that cannot be placed —
  split entries, accounts off the map — live in `ledger.unmapped` and are always listed.
- `entities` are the customers, vendors, banks, government bodies, employees and processors named
  in the journal. They are secondary (not counted against the twelve-account cap) and appear as a
  filter strip and in the tie-out panel; the City view (planned) draws them as buildings.
- The renderer computes a deterministic summary in integer cents (`renderers/shared/ledger.mjs`),
  renders a static tie-out panel into the HTML, and embeds a playback schedule for the viewer's
  `Mosofin.ledger` module. The same schedule feeds any recorded scene.

Proof is `authored` or `csv`; `connected` is not representable. A `csv` badge must name the file,
its SHA-256 and row count. `scripts/build-ledger-fixture.mjs` regenerates the shipped fixture
from one journal definition so the CSV and the events cannot disagree.

## Views

Set `meta.view` to `"map"` (default) or `"city"`. Each render emits **one** SVG. City draws an
isometric district: account buildings, an entity-class ring, roads for authored `flows`, and the
same `schedule()` tokens as Map. City roads use class `city-road` / marker `marker-city` so
orthogonal arrow checks ignore them. Author `meta.sibling` to the other view's HTML path so the
viewer Map|City toggle can link without breaking the single-SVG export gate.

## Daily bars and account meters

HTML only (outside the canonical SVG):

- `#ledger-day-bars` — one bar per period day for mapped schedule volume (count and $sum). Scrubbing or playing highlights the active day; bars stay readable when motion is still.
- `#ledger-meters` — compact per-account in/out/net meters from `summarize()` (never invented). Cleared from print/embed via `no-print`.

## CSV import

```bash
node bin/mosofin.mjs ledger import path/to/export.csv --map mapping.json --out out.ledger.json
```

`mapping.json` names a base ledger diagram (`base`), maps CSV account cells / names onto account and entity ids, and sets `splits` to `unmapped` (allocation is refused). Unmapped journal entries are listed; `--strict` exits non-zero when any remain. See `examples/northline-gl-2026-07.mapping.json`.
