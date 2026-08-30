# Brand marks — the finance subset and the gap

## The containment rule (keep this)

A brand mark is a **16×16 white plate, `rx 4`, with a `#cbd5e1` 0.8px frame**, vendor artwork drawn
inside at `translate(3,3) scale(0.41666…)` (i.e. a 24-unit vendor glyph fitted into 10 units).
Under the Blueprint preset the plate and frame square off to `rx 1px`.

Why it matters: Mosofin's node colour *is* the semantic vocabulary. If Stripe purple or Shopify
green could paint the node, a reader would start reading vendor colour as meaning. The plate is the
firewall. **Do not remove it.**

Fallback when a brand has no catalogue mark: `fallback-globe.svg` — the same plate, a `#475569`
globe, 1.15 stroke.

## What is in this folder

| File | Status |
|---|---|
| `samples/shopify.svg` | shipped — `data-brand-status="preset"`, source `shopify.com/brand-assets`, fill `#7AB55C` |
| `samples/stripe.svg` | shipped — `data-brand-status="preset"`, source `stripe.com/newsroom/information` |
| `samples/quickbooks.svg` | **added** — raster (webp data-URI) from `ComposioHQ/open-logos`; needs a vector redraw before shipping |
| `samples/xero.svg` · `netsuite` · `sage` · `freshbooks` · `wave` · `zoho-books` · `zoho-invoice` · `ynab` | **added** — books / accounting, vector |
| `samples/square.svg` · `braintree` | **added** — payments / POS, vector |
| `samples/ramp.svg` · `gusto` · `deel` · `bill` (raster) | **added** — spend / payroll / AP |
| `samples/amazon.svg` | **added** — commerce channel |
| `raw/*` | the untouched source files as downloaded |
| `fallback-globe.svg` | reconstructed from the artifact's `.brand-mark-fallback` CSS |

Added marks were pulled from the MIT-licensed **`ComposioHQ/open-logos`** library (the logo set
behind `composio.dev/toolkits`) and re-plated to the catalogue rule. For shipping, each needs a
`data-brand-source` pointing at the vendor's own brand page — the library licence covers the
collection, not the trademarks.

## The gap, proven by the samples that already ship

`northline-money-map` names four systems. Two get a badge. **QuickBooks — the books, the single most
important node in the diagram — renders bare**, because there is no QuickBooks mark. Chase likewise.
The contract is honest about it (no mark rather than a wrong mark), but the visual result is that
the two *least* authoritative systems are the two that look official.

### Status after the open-logos pull

| Category | Now covered | Still missing |
|---|---|---|
| Books / ERP | QuickBooks (raster), Xero, NetSuite, Sage, FreshBooks, Wave, Zoho Books/Invoice, YNAB | — |
| Banks & cash | — | **Chase / a generic bank, Mercury, Plaid, Wise** |
| Payments & POS | Square, Braintree *(PayPal already exists)* | Adyen, Authorize.net |
| Spend, AP, payroll | Ramp, Gusto, Deel, Bill.com (raster) | Brex, Rippling, Expensify |
| Commerce | Amazon *(Shopify already exists)* | Etsy, WooCommerce |

The bank column is the important hole left: a money map's Chase node still renders bare.

Licensing note: every existing mark carries `data-brand-source` pointing at the vendor's own brand
page. Any addition must do the same.
