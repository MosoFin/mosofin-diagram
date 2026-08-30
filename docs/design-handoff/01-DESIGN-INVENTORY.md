# 01 — Design inventory

Every visual component of Mosofin, where it is defined, what it currently says, and what this
package ships for it. Every line number marked **[verified]** was checked against the repository
working tree at build time; the cited source files are copied verbatim into `source-docs/` and
`pages/` (see `source-docs/SOURCES.md`), so each reference can be re-checked here with `sed -n`.

Legend for the last column: **KEEP** = works for finance as-is · **RELABEL** = wording only ·
**REDRAW** = new glyph or mark · **RETHINK** = the concept itself is engineering-shaped.

---

## A. Brand and logo

| Component | Defined at | Size | Current form | In this folder | Verdict |
|---|---|---|---|---|---|
| Favicon | `docs/index.html:9` **[verified]**; same data-URI in `gallery.html`, `guide.html`, `start.html` | viewBox 28 | cyan hexagon, plate `#083344`, stroke + dot `#22d3ee` | `assets/favicon/mosofin-favicon.svg` | **REDRAW** — pure Archify. Nothing about it is finance |
| Nav wordmark | `docs/index.html` `.nav-logo-*`; `gallery.html:241` **[verified]** (`/ proof lab`) | text | `mosofin` + a path-style suffix per page | — | KEEP structure, RELABEL suffix (see §F) |
| Pulse dot | artifact CSS `.pulse-dot`, 12×12, `--frontend-stroke`; 10px under Blueprint, 9px under Editorial | 12px | the **only** brand mark inside an artifact | rendered in `sheets/asset-sheet.html` | **RETHINK** — it is a "live system" tell. A finance document may want a period stamp instead |
| Paper grain | `docs/index.html` `body::after`, feTurbulence 140×140, opacity .05, blend multiply | 140×140 | warm paper texture | `assets/grain-texture.svg` | KEEP — site-only, and it is the one thing already saying "document" |
| Specimen glyphs | `docs/index.html` hero specimen rail, three inline SVGs | 34×26 | lane sketch / grid sketch / node-chain sketch | `assets/specimen-glyphs/s01…s03.svg` | KEEP shape language, RETHINK subjects |
| `og:image` | `docs/index.html:14`, `start.html:13` **[verified]** | 1200×630 | points at `assets/mosofin-social-preview.png` — **the file does not exist in the repo** | — | **MISSING ASSET** — every share of the site is currently blank |
| Brand-mark system | `renderers/shared/brand-marks.mjs:544–563` (`renderBrandMark`), CSS `assets/template.html:3977–3993`; catalogue `mosofin/brand-marks/catalog.json` → `generated-brand-marks.mjs` **[verified]** — all 107 plated in `assets/brand-marks/catalog/` | 16×16 plate, rx4 | white plate, `#cbd5e1` 0.8 frame, vendor art inside | `assets/brand-marks/` (shopify, stripe, fallback) | KEEP the containment rule, **EXTEND** the catalogue (§Brand gap) |

### Brand gap — the catalogue is an engineering catalogue

107 marks, of which roughly 8 are business systems. Every finance sample proves the gap:
**QuickBooks has no mark**, so the ledger node — the single most important node in a money map —
renders bare while Shopify and Stripe get badges. `assets/brand-marks/business-subset.md` lists
what is needed.

---

## B. Semantic vocabulary — the core of the problem

### B1. Semantic sigils (node role stamps)

Defined in `renderers/shared/utils.mjs` — `SIGIL_TONE` :32–46, `SIGIL_SHAPE` :48–75,
`renderSemanticSigil` :80–87 **[verified]**; all 13 generated from source into `assets/sigils/`
(verbatim object in `assets/sigils/SOURCE.md`). **A full proposed finance replacement set (14 glyphs, same grammar,
including the two gaps) is drawn in `assets/sigils-finance/`.** Authoring box 16×16, painted at `scale(0.6875)` ≈ 11 px, placed at
`translate(nodeX+6, nodeY+6)`, `stroke-width 1.35`, round caps, `opacity .76`, colour = the kind's
stroke token.

| Kind | Current glyph | What it says to a controller | Verdict |
|---|---|---|---|
| `frontend` | browser window with a title bar and two dots | "a website" — but it is used for **Shopify, the storefront** | **REDRAW** |
| `backend` | `</>` angle brackets | "source code" — used for **Stripe, the payments processor** | **REDRAW** |
| `database` | cylinder | "a database" — used for **QuickBooks, the books** | **REDRAW** |
| `cloud` | cloud outline | "cloud hosting" — used for **the bank** | **REDRAW** |
| `security` | shield with a check | reads acceptably as a control gate | RELABEL only |
| `messagebus` | two bus rails with stubs | "Kafka" — the finance meaning is a **bank feed / sync** | **REDRAW** |
| `external` | box with an out-arrow | reads acceptably as a counterparty | RELABEL only |
| `neutral` | square with a centre dot | fine | KEEP |
| `start` | circle with a play triangle | fine for a lifecycle | KEEP |
| `active` | activity/pulse line | fine | KEEP |
| `waiting` | hourglass | fine | KEEP |
| `decision` | **none — this kind has no sigil at all** | a diamond with colour only | **ADD ONE** |
| `success` | circle-check | fine | KEEP |
| `failure` | circle-x | fine, though "failure" is the wrong word (§B3) | RELABEL |

Placement per renderer **[verified]**: `render-architecture.mjs:1011`, `render-workflow.mjs:657`,
`render-sequence.mjs:326`, `render-dataflow.mjs:392` stamp at `[x+6, y+6]`; `render-lifecycle.mjs:468`
moves the sigil top-right (`x+width−17`) when the state has no brand mark. `decision` is never stamped:
it is absent from `SIGIL_SHAPE`, and `renderSemanticSigil` (:81) would fall back to the `neutral`
shape with the `external` tone if it were called.

> `messagebus.svg` is now generated from `SIGIL_SHAPE.messagebus` like every other sigil (13 of 13).
> The only remaining gap in the shipped set is `decision`. See `assets/sigils/README.md`.

### B2. Kind colour tokens

Defined in the artifact's `:root` / preset blocks; full extract in `tokens/presets.json`, swatches in
`assets/card-dot-colors.svg` and the asset sheet.

| Kind | Light stroke | Dark stroke |
|---|---|---|
| frontend | `#0891b2` cyan | `#22d3ee` |
| backend | `#059669` emerald | `#34d399` |
| database | violet | violet |
| cloud | amber | amber |
| security | red | red |
| messagebus | orange | orange |
| external | slate | slate |

Finance reading of this palette: **money is not a colour here.** The cash rail is emphasis-amber
(`--arrow-emphasis`), the ledger is violet, the bank is amber-cloud. A controller's mental model
(cash / accrual / contra / variance) has no colour at all. This is the second-biggest gap after the
legend.

### B3. Legend labels — the most visible drift

Defaults are the `legend.<renderer>.<kind>` strings in `renderers/shared/i18n.mjs:30–61` (English
catalog; `tokens/i18n-labels.json` → `groups["legend.*"]`), in the catalogue order fixed by
`render-architecture.mjs:82–90`, `render-workflow.mjs:680–688`, `render-sequence.mjs:396–408`,
`render-dataflow.mjs:417–426`, `render-lifecycle.mjs:496–505` **[verified]**; the layout engine is
`legend.mjs` (font 8, item gap 22, swatch 14 / 34 for lines). Authors override per artifact via
`meta.legend.entries[kind].label`. The full default catalogues are rendered in
`assets/legend-blocks-default/*.svg`. What the **delivered finance artifacts actually render**
(extracted into `assets/legend-blocks/*.svg`):

| Artifact | Type | Legend as shipped |
|---|---|---|
| `northline-close` | workflow | **User UI · Agent logic · Policy · Context / trace** |
| `northline-money-map` | architecture | Frontend · Backend · Database · External |
| `northline-customer-ar` | architecture | Frontend · Backend · Database · Security · External |
| `northline-dispute` | lifecycle | start · active state · waiting · decision · terminal success · failure / exit |
| `northline-revenue-walk` / `payout-rec` / `cash-runway` | dataflow | data store |
| `northline-order-path` | sequence | *(no legend rendered)* |

A month-end close runbook that labels the controller's approval gate **"Policy"** and the
sub-ledger **"Context / trace"** is the single clearest illustration of the fork being incomplete.

### B4. Viewer kind labels

`viewer.kind.*` — Frontend, Backend, Database, Cloud, Security, Message bus, External, Neutral,
Node, Start, Active, Waiting, Decision, Success, Failure. These appear in the Semantic Lens, the
Node Finder and the Passport. Full set: `tokens/i18n-labels.json → kindLabels`.

### B5. Relationship strokes and arrowheads

`assets/edge-variants.svg` renders all four, with the four real `<marker>` definitions.

| Class | Colour | Dash | Marker | Finance meaning today |
|---|---|---|---|---|
| `.a-default` | `--arrow` | — | `arrowhead` | any hop |
| `.a-emphasis` | `--arrow-emphasis` | — | `arrowhead-emphasis` | **the order-to-cash rail** |
| `.a-security` | `--security-stroke` | 5,5 | `arrowhead-security` | control / approval |
| `.a-dashed` | `--database-stroke` | 4,4 | `arrowhead-dashed` | async book-sync |

Container strokes: `.c-security-group` (dash 4,4), `.c-region` (dash 8,4, amber 5% fill),
`.c-lane` (dash 6,6).

---

## C. Viewer chrome — 12 surfaces

All defined in `mosofin/assets/template.html` (copied to `pages/viewer-template.html`) and inlined
into every artifact **[verified]**: toolbar CSS :3046–3172 / markup :4845–4938 (icon masks
:3128–3145), preset menu :3234–3264 / :4869–4890, export menu :3493–3509 / :4915–4936, guided rail
:2377+ / :4953–4996, share-chapter cue :420–500, nav dock :914–1053 / :5320–5329, Semantic Passport
:1644+ / :5232–5271, Node Finder :2192+, Diagram Guide :2001+ / :5167–5217, Route Probe :1475+,
Semantic Lens :1300+, Semantic Radar :1055+, cards :2849–2951, Share Card constants :5629–5632 and
rasterizer :6289–6395 (badge copy `i18n.mjs:182–186`). Icons in `assets/viewer-icons/` are verified
byte-for-byte against the template's `mask-image` data-URIs (`VERIFIED.md`). Copy in
`tokens/i18n-labels.json` (English). Every surface is captured open in `screenshots/viewer-chrome/`.

| Surface | Shortcut | Current naming | Verdict |
|---|---|---|---|
| Toolbar | — | theme · motion · style · export · present | KEEP |
| Preset menu | `S` | Classic *"Stable technical default"* · Signal Flow *"Motion-forward presentation"* · Blueprint *"Engineering review"* · Editorial *"Publication and launch notes"* | **RELABEL** — three of four hints are engineering-facing |
| Export menu | `E` | Share Card · Copy diagram · PNG/JPEG/WebP · SVG · 6s WebM | KEEP |
| Nav dock | — | **PATH · MAP · LENS · READ/FULL/AUTO** | **RELABEL** — jargon |
| Semantic Passport | — | *"Semantic passport"*, *"Verified source evidence"*, *"Authored reach"* | **RELABEL** |
| Semantic Lens | `L` | *"Compare system roles"* | **RELABEL** |
| Semantic Radar | `M` | *"Semantic radar"*, *"needs more MAP space"* | **RELABEL** |
| Route Probe | `R` | *"Trace a directed route"*, *"Direction matters."* | RELABEL lightly |
| Node Finder | `/` | *"Find a node"* | RELABEL (*node* → *system / account*) |
| Diagram Guide | `?` | *"Inspecting compiled semantics"* | **RELABEL** — this is the onboarding line |
| Guided rail / Story | `P` `[` `]` | *Story · Beat · Story Trail · Story Horizon · Chapter* | **RELABEL** |
| Present mode | `F` | Present / Exit | KEEP |
| Share card | — | badge `MOSOFIN · {preset} · {theme}`, 1200×630 | RELABEL badge |

Preset badges printed onto the artifact itself: `SIGNAL FLOW`, **`BLUEPRINT / REV 01`**,
`EDITORIAL / FIELD NOTE`, `MOSOFIN / PLATE 04`.

---

## D. Presets and tokens

Four presets × two themes. Machine-readable: `tokens/presets.json` (every `--*` variable, plus the
per-preset `body` background treatments and badge strings).

| Preset | Identity today | Body treatment |
|---|---|---|
| `classic` | cool slate/cyan default | flat |
| `signal-flow` | `#030711`, motion-forward, radial cyan + violet glows | two radial gradients, fixed attachment |
| `blueprint` | `#06131f`, drafting grid, squared radii, `REV 01` plate | crossed 1px grid lines |
| `editorial` | `#181611` / `#f2eee5` warm, Georgia headings, vermilion rule | vertical margin rule |

Site tokens (already redesigned, warm): `tokens/site-tokens.json`. Type: `tokens/typography.md`.

**The drift is here in one line:** the site is `--paper:#eff2f1` + Fraunces + `--accent:#e14a0e`;
the artifact is `#0f172a`-family slate + system sans + cyan. Same product, two identities.

---

## E. Layout constants

`tokens/layout-constants.json` — **copied from the renderer `layout` objects** (`render-architecture.mjs:64–80`
+ `grid.mjs:3–11`, `render-workflow.mjs:47–57`, `render-sequence.mjs:41–51`, `render-dataflow.mjs:52–63`,
`render-lifecycle.mjs:50–63`, `text-fit.mjs:24–27`, `desktop-readability.mjs:1–5`, `legend.mjs:6–11`)
**[verified]**; the build asserts the literals still exist. The earlier artifact measurements are kept
under `observedInArtifacts` for cross-check. Two constraints worth knowing before resizing anything:
workflow `colXs [88, 220, 300, 430, 500, 625]` are three column *pairs* (a 92 px node in col 1 overlaps
col 2), and dataflow stage centres are `100 + 215·stage` with row centres 157/271/385/499/613 — every
authored `via`/`labelAt` in the eight specs depends on those numbers.

| Renderer | viewBox observed | Node box | Container |
|---|---|---|---|
| architecture | 1140×578, 930×552 | 150×64 rx6 (external 120–160×60) | region 440–670×114 rx12 |
| workflow | 720×900 | 92×52 / 92×68 rx6 | lane 640×104 rx10, security group 628×92 rx8 |
| sequence | 820×760 | actor 86×54 rx6, lifeline 10×N rx3 | lane 724×140–180 rx10 |
| dataflow | 1080×760 (all three) | 112×58 rx6 | stage lane 168×640 rx10 |
| lifecycle | 980×660 | 118×62 / 118×58 / 126×58 rx7 | — |

Text-fit floor is **7 units**; fractional sizes in the shipped files (10.8, 9.6, 9.1, 8.4, 8.3) are
the shrinker fitting long labels. **Longer finance words will shrink type, not grow boxes** — that
is the practical cost of relabelling and it must be re-checked with `visual-check`.

Containment: only `money-map` passes at 1440×900 in the full-width reading layout; the other seven
pass only in Present mode. Receipts: `docs/samples/*.visual-check.json`.

---

## F. Site copy still speaking engineering

All **[verified]** against `pages/`.

| Where | Line | Current | Fix |
|---|---|---|---|
| `index.html` `#types` | 542, 874 | *"AWS / GCP / Azure infra"*, *"Microservices topology"*, *"Network layout"* (en **and** zh at 934) | finance equivalents |
| `index.html` `#palette` | 701–702 | `Postgres · primary :5432` as the Database chip | `QuickBooks · general ledger` |
| `index.html` `#palette` | 725–729, 903 | `Kafka · events topic`, *"Kafka, RabbitMQ, SNS"* | bank feed / sync |
| `index.html` hero badge | 408 | *"Agent Skill · development · v1.0.0-dev.0"* | audience-facing framing |
| `index.html` features | 653 | *"Story Horizon … Semantic Story Carrier"* | plain language |
| `index.html` nav | 393, 859 | *"Proof Lab"* | finance-facing name |
| `gallery.html` | **286** | inner text said **"Five lenses. Eleven real stories."** while `data-en` said **"Eight finance stories."** | **FIXED** in `scripts/gallery-template.html`; rebuilt copy in `pages/gallery.html` |
| `gallery.html` | 148–149, 217 | CSS class `.engineering-proof`, plus `engineeringProfile: null` on all 8 manifest entries | rename the class; the field is dead for finance |
| `gallery.html` | 7, 241, 245 | *"Proof Lab"* in title, wordmark path and nav | as above |
| `guide.html` | **245** | *"Eleven small, opinionated starting points."* — the library holds **19** recipes (8 finance + 11 inherited engineering) | **FIXED** in `scripts/guide-template.html:268,273`; rebuilt copy in `pages/guide.html` |
| `guide.html` | 234, 269, 274 | placeholder *"API request with JWT auth, a Redis cache miss…"*; sample chips *API + cache miss*, *Kafka + DLQ*, *Incident* | finance examples |
| `start.html` | 204, 408 | *"Choose the technical question…"*, *"let your coding agent inspect the real repository"* | the reader has a client, not a repo |
| `start.html` | 241 | *"This repository only"* | workspace framing |

The eleven inherited engineering recipes still in `guide-data` (`system-overview`,
`deployment-ownership`, `agent-tool-call`, `delivery-workflow`, `incident-runbook`, `api-request`,
`async-roundtrip`, `data-lineage`, `event-stream`, `object-lifecycle`, `deployment-lifecycle`) are a
**product** decision, not a design one — but they are why the guide page still reads as engineering.

---

## G. Image index

| Path in this folder | Count | Notes |
|---|---|---|
| `screenshots/samples/*.light.png`, `*.dark.png` | 16 | full-page, both themes, one pair per artifact |
| `screenshots/samples/*.story.gif` | 3 | close, money-map, revenue-walk — guided story playback |
| `screenshots/samples/*.motion.gif` | 3 | same three artifacts re-rendered hi-res with the proposed finance sigils, new brand marks **and finance legend labels**, dash-blink + node-breathe animations, 24 frames @ 10 fps |
| `screenshots/samples/*.motion.png` | 3 | full-resolution stills of the motion renders |
| `screenshots/viewer-chrome/*.png` | 21 | 1440×900: toolbar, export menu, style menu, diagram guide, node finder, semantic passport, route probe, semantic lens, radar, guided story playing, present mode, share-chapter cue, cards + legend; each preset × light/dark |
| `screenshots/share-card/*.png` | 4 | real 1200×630 Share Cards exported by the page's own rasterizer (money map, close; dark + light) |
| `screenshots/site/*.png` | 4 | full-page landing, gallery, guide, start |
| `sheets/asset-sheet.png` | 1 | the asset sheet rendered at 1440 px |
| `assets/sigils/*.svg` + `png/` | 13 + 26 | all shipped sigils from `SIGIL_SHAPE`, 96 px previews light + dark; `decision` remains the one gap |
| `assets/sigils-finance/*.svg` + `png/` | 14 + 28 | proposed set, same previews |
| `assets/viewer-icons/*.svg` | 14 | verified against `template.html` (`VERIFIED.md`) |
| `assets/legend-blocks/*.svg` | 7 | one per artifact that renders a legend, as shipped |
| `assets/legend-blocks-default/*.svg` | 5 | full default catalogue per renderer, English labels |
| `assets/legend-blocks-finance/*.svg` | 5 | proposed |
| `assets/brand-marks/catalog/*.svg` | 107 | the whole built-in catalogue, plated; index in `catalog-index.md` |
| `assets/brand-marks/samples/*.svg` | 18 | shipped shopify + stripe, and 16 open-logos candidates |
| `assets/specimen-glyphs/*.svg` | 3 | |
| `assets/favicon/*.svg` + `png/` | 4 + 16 | shipped + 3 proposals, at 16/32/64/128 px |
| `grain-texture`, `card-dot-colors`, `edge-variants` | 3 | |

Missing images that the code already references and that this package does **not** create — they are
redesign deliverables: `assets/mosofin-social-preview.png` (og:image, 1200×630, referenced from
`docs/index.html:14` and `start-template.html:13`) and the five diagram-type PNGs
`assets/mosofin-{architecture,workflow,sequence,dataflow,lifecycle}.png` (`docs/index.html:536–586`).
