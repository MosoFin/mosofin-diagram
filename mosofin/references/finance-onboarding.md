# Finance onboarding

Read this reference only when the user is mapping a financial business: ledger,
payments, commerce, close, cash, revenue, AR, or tax. Ordinary engineering
diagrams skip it.

Onboarding is a skill interview, not a hosted form and not a live OAuth
wizard. The renderer never calls QuickBooks, Stripe, Shopify, or a bank.

## Brief location

Search in this order and stop at the first complete brief:

1. `clients/<dash-case-name>/FINANCE-BRIEF.md` when `CLIENTS.md` exists and the
   conversation names that client
2. Workspace-root `FINANCE-BRIEF.md`

A complete brief has an entity, at least one system, and a source of truth for
**orders**, **cash**, and **books**. A domain the company does not have may be
marked `n/a` with one clause why (for example, "no commerce platform; invoices
originate in QuickBooks"). Missing a connector is allowed. Missing a
source-of-truth rule is not.

Use `examples/finance-brief.md` for field shape and voice, not as facts to copy
and not as renderer input.

If `PROFILE.md` already exists (from a finance client workspace), reuse company
name, entity, method, and the systems line. Do not re-run a full client
onboard. This brief is only what diagram authoring needs.

## When to interview vs skip

Run the **full interview** when any of these are true:

- No brief file exists at the search paths above
- The brief is missing a required field listed in the previous section
- The user says `re-onboard`, `we switched processors`, or names a system that
  is not already in the brief (for example `add Shopify`)

Otherwise **skip to session confirm**. Never re-ask the source catalog on every
invocation.

If the user already pasted a full scenario **and** named systems plus period,
infer the brief, show it, wait for edits, write it, then author. Do not
interrogate what they already answered.

## Session confirm

When a complete brief is on file, ask only:

1. Period for this artifact (required; default the last closed month)
2. One-sentence question for **this** diagram
3. Optional one-liner: sources still as listed? Yes continues. A change patches
   the brief before authoring.

Template:

> Brief on file: {entity}, {systems}, books in {books-system}. Period for this
> map? What do you want to see this time (one sentence)?

Then map the sentence through the intent table, choose one diagram type, and
continue at Fast authoring path step 1.

## Full interview

Ask one question at a time. For each section: a short explainer, a recommended
draft from what you already know, then questions only for what you could not
infer.

Onboarding must not inspect renderer internals and must not plan coordinates in
prose. It produces: `diagram_type`, `meta.title`, systems, truth rules, period,
intent, and a bounded node list of names only.

### A. Company

Skip this section when `PROFILE.md` already answers it.

1. What is the business called, and how does it make money in one sentence?
2. One legal entity for this map, or several? Recommend **one**. v1 refuses to
   mix entities in one artifact. Multi-entity maps are a later architecture
   with explicit boundaries.

### B. Data sources

Present this closed list. The user picks all that apply. Do not ask a blank
"what do you use?"

| Pick | Default source of truth |
|---|---|
| QuickBooks / Xero / other ledger | books: P&L, GL, deposits, tax payable |
| Stripe / Shopify Payments / PayPal | cash movement: charges, fees, payouts, disputes |
| Shopify / Amazon / WooCommerce | commerce: orders, refunds, tax collected, customers |
| Bank (named account, CSV, Plaid) | settled cash |
| Other CRM / invoicing | who the customer is; **not** AR unless they actually invoice |
| None — I will describe | authored-only map |

For each yes, ask one follow-up: *what is this the source of truth for?*
Recommend the default in parentheses and let them edit.

State these rules out loud:

- At most **one** source of truth per fact (orders vs cash vs books). Two
  "revenue sources" is a brief failure; stop and ask them to pick.
- Shopify CRM is customers and orders, not cash.
- If they pick Shopify + Stripe + QuickBooks, recommend:

  - Orders originate in Shopify
  - Cash lands at the bank via Stripe payout
  - Revenue is recognized in QuickBooks, not the Shopify dashboard

A `describe-only` stack is valid. Record `Evidence: describe` and continue.
`CSV` evidence enters through the `ledger` diagram type: the user supplies a
general-ledger export, its rows become `ledger.events` on authored flows, and the
artifact carries the file name, SHA-256 and row count as `Proof: CSV`. Split
entries and off-map accounts are listed as `unmapped`, never allocated.
`connected` remains a future pin. Do not start OAuth. Do not treat `connected`
as proof that numbers are tied.

### C. Visualization intent

Do not ask "architecture or dataflow?" Ask **which business question**. One
primary intent per artifact. Extra questions become `meta.views` (at most five
chapters), not extra nodes.

Offer **one** recommended intent from the sources and the user's words (Shopify
+ Stripe + QuickBooks with no close question → money map; "close July" →
close workflow).

| User intent | Type | Include |
|---|---|---|
| How does this company make money / what is source of truth? | `architecture` | 8–12 systems, one order-to-cash path, named crossings |
| Walk one order, payout, or customer through time | `sequence` | real IDs if known; returns and the fee gap |
| Why don’t Shopify / Stripe / QuickBooks match? | `dataflow` | gross → contra → tax/gift cards → books |
| What is month-end and who owns each gate? | `workflow` | lanes by system, exception lane for breaks |
| Refund / dispute / invoice / period status | `lifecycle` | waits vs terminal; books catch-up as recoverable failure |
| Where did Stripe cash vs the bank go? | `dataflow` | timing vs unexplained residual |
| Who is allowed to say they owe us? | `architecture` | DTC sales receipt vs wholesale AR |
| Can we make payroll / cash to a date? | `dataflow` | opening must be tied; no invented next-week sales |
| Why did revenue or cash move vs last period? | `dataflow` | authored drivers plus unexplained residual |
| Show me the month moving through the books, entry by entry | `ledger` | at most 12 accounts, authored credit-to-debit flows, the GL rows as events, split entries unmapped, tie-outs only for supplied figures; `meta.view: "city"` for the isometric district (same data) |

If the sentence is still ambiguous after this table, run:

```bash
node bin/mosofin.mjs guide "<their sentence>" --json
```

Use the recommendation's `type` and `prompt`. Finance recipes are routing
hints, not facts to copy and not gallery proofs of the user's books.

### D. Period, audience, amounts

1. Period for this artifact (month or as-of date). Required even for a system
   map ("as of July 2026").
2. Who reads the HTML: bookkeeper, controller, CFO, founder, or auditor. This
   drives card copy, not topology.
3. Default: **do not invent amounts**. If the user did not supply a number, omit
   it or tag `unknown`. Never decorate a node with a plausible fake total.

Do not enable a fail-closed finance profile, or `deployment-ownership`, unless
the user explicitly asks and the required facts are known.

### E. Confirm, write, then author

Show the full brief. Wait for edits. Write `FINANCE-BRIEF.md` to the location
chosen in Brief location. Only then follow Fast authoring path step 1: read
one schema, one JSON example, write the candidate, validate, deliver.

Cap primary nodes at 12 even when the user listed many apps. Supporting detail
goes in cards.

## Brief shape

```md
# Finance brief — {Company}

- Entity: {one legal entity}
- Method: {cash | accrual}
- Audience: {who reads the HTML}
- Proof: authored
- Period default: {YYYY-MM}

## Systems

| System | Role | Source of truth for | Evidence |
| {name} | {commerce \| payments \| books \| bank \| crm} | {facts} | describe \| CSV \| connected |

## Truth rules

- Orders originate in {system or n/a}
- Cash lands in {bank or processor path}
- Revenue is recognized in {books system}

## Default intent

{one row from the intent table}
```

`Proof: authored` means typed claims. Do not upgrade the badge because a
connector exists.

## Never

- Start OAuth or pull live APIs before a brief exists
- Author twenty nodes because they listed eight Shopify apps
- Enable a fail-closed profile silently
- Treat `connected` as a tie-out
- Guess Shopify, Stripe, or QuickBooks totals
- Allocate a split journal entry across flows; list it as unmapped instead
- Skip the brief when systems and period were never named
