# Mosofin — design handoff

**One folder, everything a redesign needs. Nothing here needs the repository to be checked out.**

Mosofin is a finance-diagram skill. You give a coding agent a client finance brief and one
plain-language question ("why doesn't Shopify revenue match QuickBooks for July?") and it returns a
single self-contained HTML file: a checked, explorable, exportable diagram.

The **content** is already finance-first. The **visual layer is not** — it is still the engineering
identity of Archify, the product Mosofin was forked from. That gap is the entire brief.

---

## How to read this folder, in order

| # | File | What it gives you |
|---|---|---|
| 1 | `00-START-HERE.md` | this page — goals and hard constraints |
| 2 | `01-DESIGN-INVENTORY.md` | every visual component, where it is defined, what it currently says |
| 3 | `02-REDESIGN-BRIEF.md` | the proposed finance mapping, component by component |
| 4 | `03-FINANCE-VOCABULARY.md` | the real finance language the redesign must speak |
| 5 | `sheets/asset-sheet.html` (+ `.png`) | open in a browser: every glyph, icon, colour, stroke, legend and brand mark on one page |
| 6 | `screenshots/` | samples on light/dark, story GIFs, every viewer-chrome surface, real share cards, site pages |
| 7 | `pages/` | the live surfaces — the four site pages, the eight artifacts, the viewer template and the site templates |
| 8 | `assets/` | shipped sigils, viewer icons, favicon, legends, edge strokes, the full brand catalogue — and the proposed finance sets |
| 9 | `tokens/` | machine-readable extracts from source (presets, site tokens, i18n en+zh, layout constants, typography) |
| 10 | `source-docs/` | verbatim repository documents and renderer sources; `SOURCES.md` maps each to its path |
| 11 | `MANIFEST.md` | every file in this folder with byte size, dimensions and SHA-256 |

Fastest possible orientation: open `pages/samples/northline-money-map.html`, press **?** for the
diagram guide, then **S** to cycle the four visual presets, then **T** to flip theme. That is the
whole product in ninety seconds.

---

## What the redesign is for

Mosofin's reader is a **controller, a bookkeeper, a founder, or a diligence analyst** — not an
engineer. They open one HTML file, usually forwarded to them, and they need to answer one question
and trust the answer. Right now the file greets them with a cyan hexagon, a browser-window glyph on
the node that means "the storefront", a legend that says *Agent logic*, and a preset called
*Blueprint · Engineering review*.

Three goals, in priority order:

1. **Speak finance.** Every visible word and glyph should be one a controller uses at work.
   The legend is the highest-leverage surface: it is the first thing read and it is currently the
   most wrong (see `assets/legend-blocks/northline-close.svg` — *User UI / Agent logic / Policy /
   Context / trace* on a **month-end close runbook**).
2. **Make the two surfaces one product.** The marketing site has already moved to a warm
   drafted-sheet identity (Fraunces, paper `#eff2f1`, international orange `#e14a0e`). The artifact
   viewer is still cool cyan/slate. They do not currently look related. Pick one identity.
3. **Earn trust on paper.** These files get forwarded, printed, and pasted into board decks. The
   defaults should read as a finance document, not a dashboard.

---

## Hard constraints — these are not style opinions

1. **An artifact is one file with zero network requests.** No webfonts, no CDN, no external images.
   Every glyph must stay inline SVG or a data-URI. This is a stated product promise and the reason
   the type stacks are system stacks.
2. **The kind IDs and the JSON schema do not change.** `frontend`, `backend`, `database`, `cloud`,
   `security`, `messagebus`, `external`, `neutral`, `start`, `active`, `waiting`, `decision`,
   `success`, `failure` are authored in every spec file and every test fixture. **Rename the label,
   the glyph and the colour — never the id.**
3. **Every user-visible string exists in en + zh.** Both the site (`LANGS` in `docs/index.html`) and
   the viewer (`i18n.mjs`, ~470 keys) ship both. A new label without a Chinese sibling is a bug.
4. **Vendor colour stays inside the neutral brand plate.** A brand mark is a 16×16 white plate with
   a `#cbd5e1` frame. Stripe purple and Shopify green live *inside* that plate so vendor colour
   never competes with the semantic node vocabulary. See `assets/brand-marks/`.
5. **The layout boxes are fixed and already validated.** Node boxes, lane widths and the text-fit
   floor (7 units) are in `tokens/layout-constants.json`. Bigger type means re-running containment
   checks at 1440×900 → 2048×1320.
6. **Light and dark are equal citizens.** Every preset ships both. Nothing may be tuned for one.

---

## Where everything comes from

This folder is now built **from the repository, not from a snapshot**, by
`scripts/build-design-handoff.mjs` (`npm run build:design-handoff` inside `mosofin/`). Every source
the inventory cites is present verbatim under `source-docs/` and `pages/` — the design-token spec
(`DESIGN.md`), product framing (`PRODUCT.md`), the skill entry point (`SKILL.md`), the viewer
behaviour contract (`viewer-runtime.md`), the finance interview (`finance-onboarding.md`), the
brand-mark catalogue and its README, the schema reference, all 19 recipes, the viewer template that
every artifact inlines (`pages/viewer-template.html`), the three site generator templates, and the
renderer source files whose `layout` objects the inventory quotes. `source-docs/SOURCES.md` maps each
file back to its repository path.

Nothing is measured or reconstructed any more: layout constants, i18n labels (en **and** zh), preset
tokens, all 13 shipped sigils and all 107 brand marks are extracted from source at build time, and
the script asserts the quoted source text still exists before it writes.

**Read `source-docs/DESIGN.md` and `source-docs/PRODUCT.md` before making decisions** — they state
what was intended; the inventory documents what *is*.

---

## Captures

`screenshots/viewer-chrome/` shows every chrome surface open (export menu, style menu, diagram
guide, node finder, semantic passport, route probe, semantic lens, radar, guided story playing,
present mode, share-chapter cue, cards + legend) and the four presets on light and dark.
`screenshots/share-card/` holds real 1200×630 Share Cards exported by the page's own rasterizer.
`screenshots/site/` is each site page full-length. `sheets/asset-sheet.png` is the asset sheet
rendered. Sigils and favicon candidates also have PNG previews beside their SVGs.
