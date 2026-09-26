# Pillars Renderer

Render `diagram_type: "pillars"` JSON files into the standard Mosofin HTML
template.

```bash
node mosofin/renderers/pillars/render-pillars.mjs input.pillars.json output.html
```

A pillar diagram is the operating model on one page: a roof stating the shared
goal, three to six pillars for the domains that hold it up, and a foundation
strip for the enablers everything stands on. It has no relationships, so it
never implies a flow, a tie-out, or an amount. In a business brief the roof is
the one-sentence business, every pillar is one domain with its **system of
record** on the capital and the facts that system owns in the shaft, and the
foundation names the entity and the truth rules.

The renderer validates input against `mosofin/schemas/pillars.schema.json`
with the bundled standalone validator. No dependency installation is required.

## Input

```json
{
  "schema_version": 1,
  "diagram_type": "pillars",
  "meta": { "title": "How the business stands" },
  "roof": { "id": "goal", "label": "What the business does, in one sentence" },
  "pillars": [
    { "id": "commerce", "type": "frontend", "label": "Commerce", "sublabel": "Shopify", "brand": "shopify",
      "tag": "orders SoT", "items": ["Orders and customers", "Tax collected"] }
  ],
  "foundation": [
    { "id": "entity", "type": "external", "label": "One legal entity", "sublabel": "accrual basis" }
  ],
  "cards": []
}
```

Omit `meta.viewBox` for the common case: the width is fixed at 960 and the
height is derived from the pillar count, the longest item list, and whether a
foundation exists. A complete worked example lives at
`mosofin/examples/northline-operating-pillars.pillars.json`.

## Layout budget

| Constant | Value |
|----------|-------|
| viewBox | default `[960, auto]`; schema minimum `[640, 420]` |
| Content width | viewBox width − 144 (72px margin each side) |
| Roof | pediment 28px tall from y 30, lintel 46px tall beneath it |
| Pillars | 3–6, equal width `(content − 28×(n−1)) / n`, minimum 96px each |
| Capital | 64px: sigil top-left, brand badge top-right, label, system-of-record sublabel |
| Shaft | 12 + 22×lines + 8 px, `lines = max(3, longest items list)`; up to 5 items per pillar |
| Plinth | 20px in the pillar's semantic colour; optional `tag` centred inside |
| Foundation | optional, up to 4 equal blocks, 52px tall, 18px beneath the pillars |
| Legend | baseline at viewBox height − 36; auto height reserves 76px beneath the content |

## Design rules

- The roof is the shared goal in one sentence. Never restate the title.
- One pillar per domain, one system of record per pillar. Put the tool name in
  the sublabel and set `brand` only when the node names that real product.
- Items are the facts that system owns, not tasks and not amounts. Keep each
  under about 24 characters so five pillars still read at full size.
- The `tag` on the plinth is the one-phrase truth claim: `orders SoT`,
  `settled cash SoT`, `zero-difference gate`.
- Use the foundation for the entity, the accounting basis, and the truth rules;
  leave it out when the brief does not state them.
- `meta.node_style: "logo"` swaps every capital for its brand mark, exactly as
  in the other renderers; geometry is identical in both styles.
- A pillar or foundation block with no brand mark can set `icon` to a domain
  pictogram (`mosofin icons`), such as `close`, `entity`, or `rules`.

## Failure modes

Schema violations exit non-zero with path-prefixed messages. The renderer
additionally fails when a label, sublabel, tag, or item cannot fit its pillar
at the legible minimum font size, when duplicate ids appear across roof,
pillars, and foundation, when an authored viewBox is shorter than the content
needs, or when the pillar count leaves less than 96px per pillar for the
authored width. Every message names the exact minimum and the supported fix.
