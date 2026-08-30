# Business onboarding

Read this reference when the user is mapping **how a business runs**: the
software it uses and how work and money move between those systems. Supply
chain, CRM, commerce, fulfilment, payments, spend, payroll, HR, support, data,
and the ledger all belong here.

For a purely financial question — a revenue walk, a payout reconciliation, a
month-end close, AR, cash to a date — read `finance-onboarding.md` instead. That
contract is narrower and stricter, and it stays authoritative for anything that
must tie out. A whole-business map that *contains* a ledger still uses this
file; a diagram whose job is to make numbers foot uses that one.

Onboarding is a skill interview, not a hosted form and not a live integration
wizard. The renderer never calls Shopify, NetSuite, Salesforce, a bank, or any
other system. Every fact in the diagram comes from the brief or from what the
user stated in the conversation.

## Brief location

Search in this order and stop at the first complete brief:

1. `clients/<dash-case-name>/BUSINESS-BRIEF.md` when `CLIENTS.md` exists and the
   conversation names that client
2. Workspace-root `BUSINESS-BRIEF.md`
3. Workspace-root `FINANCE-BRIEF.md` — a finance brief is a valid *partial*
   business brief. Reuse the entity, systems and truth rules it already carries,
   and interview only for the domains it does not cover.

A complete brief has: the business in one sentence, at least one legal entity,
and for every domain the business actually operates, the **system of record**
that owns it. A domain the business does not have is marked `n/a` with one
clause why ("no warehouse; the 3PL holds all stock"). Missing a connector is
allowed. Missing a system of record for a domain the business runs is not.

Use `examples/business-brief.md` for field shape and voice, not as facts to copy
and not as renderer input.

If `PROFILE.md` or `FINANCE-BRIEF.md` already exists, reuse company name, entity
and the systems line. Do not re-run a full onboard for facts already on file.

## When to interview vs skip

Run the **full interview** when any of these are true:

- No brief file exists at the search paths above
- The brief has no system of record for a domain the user is asking about
- The user says `re-onboard`, `we switched systems`, or names a system that is
  not already in the brief

Otherwise **skip to session confirm**. Never re-ask the domain catalog on every
invocation.

If the user already described their stack **and** named the systems, infer the
brief, show it, wait for edits, write it, then author. Do not interrogate what
they already answered.

## Session confirm

When a complete brief is on file, ask only:

1. As-of date for this artifact (required; default today's month)
2. One-sentence question for **this** diagram
3. Optional one-liner: systems still as listed? Yes continues. A change patches
   the brief before authoring.

Template:

> Brief on file: {company}, {entity count} entity/entities, {n} systems across
> {domains}. As of when, and what do you want this map to show (one sentence)?

Then map the sentence through the intent table, choose one diagram type, and
continue at Fast authoring path step 1.

## Full interview

Ask one question at a time. For each section: a short explainer, a recommended
draft from what you already know, then questions only for what you could not
infer.

Onboarding must not inspect renderer internals and must not plan coordinates in
prose. It produces: `diagram_type`, `meta.title`, domains, systems of record,
as-of date, intent, and a bounded node list of names only.

### A. Company and entities

1. What does the business do, and how does it make money, in one sentence?
2. How many legal entities are in scope? One is the default. Several is allowed
   here — unlike a finance artifact, an operating map **may** span entities as
   long as the diagram says which parts are shared and which are per-entity.
   Ledgers are never merged: three entities means three books, drawn separately.

### B. Domain catalog

Present this closed list. The user picks the domains they actually run. Do not
ask a blank "what software do you use?"

| Domain | Typical systems | Owns |
|---|---|---|
| Demand / CRM | Salesforce, HubSpot, Pipedrive | leads, accounts, pipeline |
| Marketing | Klaviyo, Mailchimp, ad platforms | campaigns, attribution |
| Commerce / sales | Shopify, Amazon, WooCommerce, POS, quotes | orders, customers, tax collected |
| Supply chain / procurement | NetSuite, SAP, Odoo, spreadsheets | purchase orders, suppliers, cost |
| Inventory / warehouse | WMS, 3PL, ERP module | units on hand, receipts, shipments |
| Manufacturing | MRP, production tracker | BOM, work orders, yield |
| Fulfilment / logistics | 3PL, carriers, ShipStation | shipments, delivery |
| Support / service | Zendesk, Intercom, help desk | tickets, returns, RMA |
| Payments | Stripe, PayPal, Square, processor | charges, fees, payouts, disputes |
| Bank / treasury | named accounts, Plaid, Mercury | settled cash |
| Spend / AP | Bill.com, Ramp, Brex, cards | vendor bills, approvals |
| Payroll / HR | Gusto, Rippling, Deel, ADP | wages, taxes, headcount |
| Books / ERP finance | QuickBooks, Xero, NetSuite | revenue, AP, P&L, tax payable |
| Data / BI | warehouse, Looker, Metabase | reporting, metrics |
| Compliance / tax | Avalara, filings, audit | obligations, evidence |
| Product / engineering | the product itself, internal tools | whatever the product owns |

For each domain the user picks, ask one follow-up: *which system is the system
of record for it?*

State these rules out loud:

- **One system of record per fact.** Two systems that both claim "the customer"
  or "the order" is a brief failure; stop and ask them to pick.
- A system may own several domains (NetSuite as ERP *and* books). Say so
  explicitly rather than drawing it twice.
- Spreadsheets and email are real systems. If a domain runs on a spreadsheet,
  record the spreadsheet — do not upgrade it to a tool they do not have.
- A `describe-only` stack is valid. Record `Evidence: describe` and continue.
- Do not start OAuth. Do not treat "connected" as proof that anything is
  reconciled.

### C. Visualization intent

Do not ask "architecture or dataflow?" Ask **which business question**. One
primary intent per artifact. Extra questions become `meta.views` (at most five
chapters), not extra nodes.

| User intent | Type | Include |
|---|---|---|
| How does the whole business run, end to end? | `architecture` | 8–12 domains, one primary rail, named crossings |
| What does each team/system own, and where are the handoffs? | `architecture` | ownership tags, boundary per team or entity |
| Walk one order / job / customer through every system | `sequence` | real IDs if known; the handoffs and the waits |
| Where does data come from and who consumes it? | `dataflow` | source → transform → store → consume |
| What are the steps and gates in this process? | `workflow` | lanes by team or system, exception lane |
| What states can this object be in? | `lifecycle` | waits vs terminal; recoverable failure |
| How does money reach the books? | `architecture` | use `finance-onboarding.md` instead |
| Why don't two systems agree on a number? | `dataflow` | use `finance-onboarding.md` instead |

If the sentence is still ambiguous after this table, run:

```bash
node bin/mosofin.mjs guide "<their sentence>" --json
```

### D. As-of date, audience, amounts

1. As-of date for this artifact. Required — a stack map goes stale.
2. Who reads the HTML: founder, operator, department head, new hire, buyer,
   auditor. This drives card copy, not topology.
3. Default: **do not invent amounts, volumes, or headcounts.** If the user did
   not supply a number, omit it or tag `unknown`. Never decorate a node with a
   plausible fake throughput.

### E. Confirm, write, then author

Show the full brief. Wait for edits. Write `BUSINESS-BRIEF.md` to the location
chosen in Brief location. Only then follow Fast authoring path step 1: read one
schema, one JSON example, write the candidate, validate, deliver.

Cap primary nodes at 12 even when the user listed thirty apps. **Group by domain
and name the tools in the sublabel** — one `Supply chain · ERP` node whose
sublabel reads `NetSuite · purchase orders · BOM` beats four separate nodes.
Supporting detail goes in cards.

## Brief shape

```md
# Business brief — {Company}

- Business: {what it does and how it makes money, one sentence}
- Entities: {one, or the named list}
- Audience: {who reads the HTML}
- Evidence: describe
- As of: {YYYY-MM}

## Systems

| Domain | System of record | Owns | Shared or per-entity |
| {domain} | {system} | {facts} | shared \| per-entity |

## Truth rules

- {domain} originates in {system}
- {domain} is owned by {system}
- Books are per entity: {list}

## Default intent

{one row from the intent table}
```

## Never

- Pull live APIs or start OAuth
- Draw thirty nodes because they listed thirty apps
- Merge two entities' ledgers into one node
- Give two systems the same system-of-record fact
- Invent volumes, headcounts, or amounts
- Upgrade a spreadsheet into a product they do not own
