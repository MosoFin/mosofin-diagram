# 02 — Redesign brief

Starting points, not decisions. Every mapping below is a proposal Claude Design may override — the
only non-negotiables are the six hard constraints in `00-START-HERE.md`.

---

## The one-sentence problem

Mosofin's content asks *"does the Stripe payout reconcile to the Chase deposit?"* and its interface
answers in the vocabulary of a service-mesh diagram.

---

## 1. Node kinds — glyph and label

**IDs never change.** Only `label`, `glyph` and `colour` are in play.

**Every proposed glyph below is drawn**, in the shipped set's exact grammar, in
`assets/sigils-finance/` — drop-in candidates for `SIGIL_SHAPE`, rendered against the originals on
the asset sheet.

| id | Today | Proposed label | Proposed glyph direction |
|---|---|---|---|
| `frontend` | Frontend · browser window | **Commerce** | a storefront / order docket — where the sale happens |
| `backend` | Backend · `</>` | **Payments** | a card or a processing rail — money in motion |
| `database` | Database · cylinder | **Ledger** | a bound book / T-account — the books |
| `cloud` | Cloud · cloud outline | **Bank** | a vault or clearing house — settled cash |
| `security` | Security · shield | **Control** | keep the shield; it already reads as an approval gate |
| `messagebus` | Message bus · bus rails | **Sync** | a two-way feed arrow — a bank feed or an integration |
| `external` | External · out-arrow box | **Counterparty** | a person/company outline — customer, vendor, processor |
| `neutral` | Neutral · square + dot | **Note** | keep |

Lifecycle kinds:

| id | Today | Proposed label | Notes |
|---|---|---|---|
| `start` | start | **Opened** | keep the glyph |
| `active` | active state | **In flight** | keep |
| `waiting` | waiting | **Awaiting bank** | keep the hourglass |
| `decision` | decision | **Tie-out** | **needs a new glyph — it has none today.** Proposal: two short bars meeting a check, i.e. "does it foot?" |
| `success` | terminal success | **Booked** | keep |
| `failure` | failure / exit | **Break** | *break* is the finance word for a reconciliation that does not clear; *failure* implies a system fault |

## 2. Legend labels, per renderer

The highest-leverage change in the product. Current → proposed — **each proposed legend is
rendered as an SVG in `assets/legend-blocks-finance/`**, beside the as-shipped versions on the
asset sheet:

**workflow** (this is the one that reads worst today)

| Today | Proposed |
|---|---|
| User UI | Commerce |
| Agent logic | Payments |
| Policy | Control |
| Tool action | Bank |
| Context / trace | Books |

**dataflow**

| Today | Proposed |
|---|---|
| primary data | money |
| policy / PII | contra / deduction |
| async batch | timing difference |
| data store | account |
| data flow | sync |

**sequence**: request → **charge / order** · return → **settlement** · async trace → **bank feed**

**architecture**: the kind labels from §1 apply directly.

**lifecycle**: the labels from §1 apply directly.

Every one of these needs a **zh** sibling in the same change.

## 3. Colour — give money a colour

Today no token means *cash*. Proposal to test, not to adopt blindly:

- **Cash / settled money** — one strong, warm, unmistakable hue owned by the emphasis rail. The site
  already has one: `--accent:#e14a0e`.
- **Accrual / recognised revenue** — a cooler counterpart, so a reader can see accrual and cash
  diverge without reading a label.
- **Contra, fee, refund, deduction** — one consistent negative treatment.
- **Timing difference** — the dashed treatment already exists (`.a-dashed`); make it mean *timing*.

Constraint: whatever is chosen must survive the four presets × two themes and stay distinguishable
at the 7-unit text floor. Test against `assets/edge-variants.svg` and every legend block.

## 4. Chrome vocabulary

| Today | Proposed | Why |
|---|---|---|
| PATH | **TRACE** | *trace* is what a controller does to a transaction |
| MAP | **OVERVIEW** | |
| LENS | **COMPARE** | |
| Semantic passport | **Node fact sheet** (or *System card*) | "passport" is a metaphor nobody asked for |
| Semantic radar | **Map** | |
| Semantic lens | **Compare** | |
| Route probe | **Trace** | |
| Story / Beat / Story Trail | **Walkthrough / Stop / Path** | |
| "Inspecting compiled semantics" | **"What this diagram shows"** | this is the onboarding line |
| Preset *Blueprint · "Engineering review"* | **"Audit review"** | |
| Preset *Classic · "Stable technical default"* | **"Controller default"** | |
| Preset *Editorial · "Publication and launch notes"* | **"Board pack"** | |
| Badge `BLUEPRINT / REV 01` | **`AUDIT / REV 01`** | |
| Badge `MOSOFIN · {preset} · {theme}` | keep the shape, review the wording | |

Keep: Export, Present, Find, theme and motion toggles, and every keyboard shortcut.

## 5. Brand marks — the catalogue gap

Present today: all 107 built-in marks are plated in `assets/brand-marks/catalog/` and listed by
category in `assets/brand-marks/catalog-index.md` — 18 engineering, 17 data, 13 AI, 13 cloud, 13
framework, 10 collaboration, 10 channel, 5 language, and **8 business** (stripe, shopify, paypal,
woocommerce, hubspot, intercom, zendesk, wordpress). No ledger, bank, payroll, AP or tax tool ships.

**Update: 16 candidate marks are now plated in \`assets/brand-marks/samples/\`** (QuickBooks, Xero,
NetSuite, Sage, FreshBooks, Wave, Zoho Books/Invoice, YNAB, Square, Braintree, Ramp, Gusto, Deel,
Bill.com, Amazon), pulled from the MIT-licensed ComposioHQ/open-logos library and re-plated to the
containment rule. QuickBooks and Bill.com are raster-only and need a vector redraw before shipping.

**Still missing from every available source:**

- **Banks & cash** — Chase and the major US banks, Mercury, Plaid *(the money map's bank node still
  renders bare)*
- **Payments** — Adyen, Authorize.net
- **Spend & payroll** — Brex, Rippling, Expensify

Containment rule stays exactly as it is: 16×16 white plate, `#cbd5e1` 0.8 frame, vendor art inside,
`assets/brand-marks/fallback-globe.svg` when unknown. Vendor colour never leaves the plate.

## 6. Identity — pick one

The site is already warm (paper `#eff2f1`, Fraunces, `#e14a0e`). The artifact is cool slate/cyan.
Three honest routes:

1. **Bring the artifact to the site.** Warm paper, serif headings, orange rail. Most product-
   coherent; biggest change surface; must hold up in dark mode.
2. **Bring the site to the artifact.** Cheapest; but it walks back a redesign the site already did,
   and cool cyan is exactly the engineering read we are trying to leave.
3. **Let them differ on purpose** — site = marketing, artifact = document — but unify the marks,
   glyphs and vocabulary. Least risky, and it still fixes the legend, which is the real problem.

A recommendation is wanted here; this package deliberately does not make it.

## 7. Sequencing — if only some of this gets done

1. **Legend labels + kind labels** (en + zh). Cheapest, most visible, fixes the worst read.
2. **Sigils** for frontend / backend / database / cloud / messagebus, plus a new `decision` glyph.
3. **Favicon and wordmark.** Three drawn candidates in `assets/favicon/`: `mosofin-favicon-proposed.svg`
   (the **footed total** — check over the accountant's double underline; recommended),
   `mosofin-favicon-alt-tieout.svg` (the Tie-out sigil as brand mark), and
   `mosofin-favicon-alt-orange.svg` (orange plate, loudest in a tab tray). All three are compared
   at 56/28/16 px on the asset sheet. Then the missing `og:image`.
4. **Chrome vocabulary and preset hints.**
5. **Brand-mark catalogue** — at minimum QuickBooks, a generic bank, Plaid, Square.
6. **Colour system for money.** Largest blast radius; needs containment re-checks.
7. **Site copy** (§F of the inventory) including the two copy bugs.
