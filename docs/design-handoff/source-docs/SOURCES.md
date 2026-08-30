# Sources — now present in full

The first assembly of this package was built from a `docs/` snapshot only and recorded what it could
not copy in `MISSING-SOURCES.md`. Every one of those gaps is now filled from the repository
(`MosoFin/mosofin-diagram`, working tree at build time). Nothing in this folder is reconstructed any more.

| File in this folder | Repository path | What it holds |
|---|---|---|
| `source-docs/DESIGN.md` | `DESIGN.md` | the artifact design-token spec (colors, typography, radii, shadows) |
| `source-docs/PRODUCT.md` | `PRODUCT.md` | product framing and personality ("a good controller's whiteboard") |
| `source-docs/ROADMAP.md` | `ROADMAP.md` | roadmap and version identity |
| `source-docs/README.md` | `README.md` | repository README with the sample-diagram table |
| `source-docs/CHANGELOG.md` | `CHANGELOG.md` | changelog |
| `source-docs/SKILL.md` | `mosofin/SKILL.md` | the skill entry point and trigger description |
| `source-docs/viewer-runtime.md` | `mosofin/references/viewer-runtime.md` | normative behavior contract for every viewer-chrome surface |
| `source-docs/brand-marks.md` | `mosofin/references/brand-marks.md` | agent-facing brand-mark decision path |
| `source-docs/authoring-contract.md` | `mosofin/references/authoring-contract.md` | authoring contract |
| `source-docs/delivery-contract.md` | `mosofin/references/delivery-contract.md` | delivery contract |
| `source-docs/finance-onboarding.md` | `mosofin/references/finance-onboarding.md` | the step-0 finance interview (verbatim, previously reconstructed) |
| `source-docs/finance-brief.md` | `mosofin/examples/finance-brief.md` | the Northline Coffee brief fixture |
| `source-docs/brand-marks-catalogue-README.md` | `mosofin/brand-marks/README.md` | brand-mark catalogue README |
| `source-docs/brand-marks-catalog.json` | `mosofin/brand-marks/catalog.json` | the 107-mark catalogue source |
| `source-docs/schemas-README.md` | `mosofin/schemas/README.md` | schema reference (legend contract, brand field, kinds) |
| `source-docs/scenarios.mjs` | `mosofin/recipes/scenarios.mjs` | all 19 recipes: questions, prompts, presentation hints (English) |
| `source-docs/USE-CASE.md` | `docs/USE-CASE.md` | end-to-end Northline walkthrough |
| `source-docs/authoring-cookbook.md` | `docs/authoring-cookbook.md` | agent cookbook |
| `source-docs/gallery-manifest.json` | `docs/gallery/manifest.json` | gallery manifest with receipts |
| `pages/viewer-template.html` | `mosofin/assets/template.html` | the viewer template inlined into every artifact (all chrome CSS/markup, preset tokens) |
| `pages/templates/gallery-template.html` | `scripts/gallery-template.html` | generator template for gallery.html |
| `pages/templates/guide-template.html` | `scripts/guide-template.html` | generator template for guide.html |
| `pages/templates/start-template.html` | `scripts/start-template.html` | generator template for start.html |
| `pages/landing.html` | `docs/index.html` | hand-written landing page |
| `pages/gallery.html` | `docs/gallery.html` | built gallery |
| `pages/guide.html` | `docs/guide.html` | built guide |
| `pages/start.html` | `docs/start.html` | built start page |
| `source-docs/renderers/shared-utils.mjs` | `mosofin/renderers/shared/utils.mjs` | SIGIL_SHAPE / SIGIL_TONE / renderSemanticSigil |
| `source-docs/renderers/shared-i18n.mjs` | `mosofin/renderers/shared/i18n.mjs` | MESSAGE_PAIRS — every English catalog string |
| `source-docs/renderers/shared-legend.mjs` | `mosofin/renderers/shared/legend.mjs` | legend layout engine |
| `source-docs/renderers/shared-brand-marks.mjs` | `mosofin/renderers/shared/brand-marks.mjs` | brand-mark plate rendering and capture rules |
| `source-docs/renderers/shared-text-fit.mjs` | `mosofin/renderers/shared/text-fit.mjs` | node text-fit floor |
| `source-docs/renderers/shared-desktop-readability.mjs` | `mosofin/renderers/shared/desktop-readability.mjs` | desktop readability constants |
| `source-docs/renderers/render-architecture.mjs` | `mosofin/renderers/architecture/render-architecture.mjs` | architecture renderer (layout object at :64–80) |
| `source-docs/renderers/architecture-grid.mjs` | `mosofin/renderers/architecture/grid.mjs` | architecture grid defaults |
| `source-docs/renderers/render-workflow.mjs` | `mosofin/renderers/workflow/render-workflow.mjs` | workflow renderer (layout at :47–57) |
| `source-docs/renderers/render-sequence.mjs` | `mosofin/renderers/sequence/render-sequence.mjs` | sequence renderer (layout at :41–51) |
| `source-docs/renderers/render-dataflow.mjs` | `mosofin/renderers/dataflow/render-dataflow.mjs` | dataflow renderer (layout at :52–63) |
| `source-docs/renderers/render-lifecycle.mjs` | `mosofin/renderers/lifecycle/render-lifecycle.mjs` | lifecycle renderer (layout at :50–63) |
| `source-docs/specs/northline-*.json` | `mosofin/examples/` | the eight finance specs behind every sample |

Line numbers cited in `01-DESIGN-INVENTORY.md` refer to these repository paths and were verified at
build time by `scripts/build-design-handoff.mjs` (it asserts the quoted source text still exists).
