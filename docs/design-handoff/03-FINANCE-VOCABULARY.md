# 03 — Finance vocabulary

The words the redesign has to speak. Everything here is language the product already uses correctly
in its **content**; the job is to get it into the **interface**.

---

## 1. The reader

A **controller**, bookkeeper, founder, or diligence analyst. They usually receive the artifact as a
forwarded file. They have one question, a period, and a low tolerance for a diagram that implies
precision it does not have.

Two rules the product already enforces and the interface must not undermine:

- **Never invent amounts.** If no figures were supplied, no figures appear — and the Guardrails card
  says so out loud.
- **One source of truth per fact.** Two systems may not both own "revenue".

## 2. The Northline Coffee brief — the fixture behind every sample

Fictional DTC + wholesale coffee roaster. One entity, accrual method, four systems, three truth
rules.

| System | Role | Source of truth for |
|---|---|---|
| Shopify | commerce + CRM | orders, customers, tax collected, gift cards |
| Stripe | payments | charges, fees, payouts, disputes |
| Chase 1002 | bank | settled operating cash |
| QuickBooks | books | revenue, deposits, tax payable, P&L |

**Truth rules:** orders originate in Shopify · cash lands in Chase via Stripe payout · revenue is
recognised in QuickBooks · DTC checkout is a sales receipt, so there is **no A/R unless wholesale**.

Note the shape of that table. It is the product's actual mental model — *system → role → what it is
authoritative for* — and no part of the current visual language expresses "source of truth".
**That is arguably the most important missing visual.**

## 3. The eight finance questions that ship

Exactly as a user types them, from the recipe library:

| Recipe | Type | The question |
|---|---|---|
| `finance-money-map` | architecture | How does this company make money, and what is source of truth for orders, cash, and books? |
| `finance-order-path` | sequence | What happened to one order or payout, in time, across commerce, payments, and the books? |
| `finance-revenue-walk` | dataflow | Why don't Shopify, Stripe, and QuickBooks show the same revenue? |
| `finance-close` | workflow | What is month-end, in order, and who owns each gate? |
| `finance-dispute-lifecycle` | lifecycle | If commerce refunded it, is the money actually done? |
| `finance-payout-rec` | dataflow | Where did Stripe cash go relative to the bank and QuickBooks? |
| `finance-customer-ar` | architecture | Who is allowed to say this customer owes us? |
| `finance-cash-runway` | dataflow | Can we make payroll, and what inflows are actually named? |

Eleven further recipes in the library are inherited engineering ones (`system-overview`,
`agent-tool-call`, `incident-runbook`, `api-request`, `event-stream`, `data-lineage`,
`object-lifecycle`, `deployment-lifecycle`, `deployment-ownership`, `delivery-workflow`,
`async-roundtrip`) — 19 total, which is why `guide.html:245` should read *Nineteen*, not *Eleven*.

## 4. The working vocabulary

Words that should be reachable in the interface; words that should not.

**Nouns the reader uses**
order · charge · fee · refund · chargeback / dispute · payout · deposit · settlement ·
sales receipt · invoice · A/R · A/P · tax collected · tax payable · gift-card liability ·
sub-ledger · general ledger · journal entry · accrual · cash basis · contra revenue ·
timing difference · reconciliation · break · tie-out · footing · period · close · cut-off ·
source of truth · runway · payroll · counterparty

**Verbs**
recognise · reconcile · tie out · foot · book · post · clear · settle · accrue · true up · net

**Words that should disappear from the interface**
agent · tool call · policy · PII · trace · context · node *(as a user-facing noun)* · semantic *(as
a modifier on everything)* · payload · topic · consumer group · DLQ · service · endpoint ·
microservice · infra

**Words to keep because they are load-bearing**
source of truth · period · guardrails · evidence · unverified.

## 5. Real strings from the delivered samples

Use these as copy tests: whatever vocabulary the redesign lands on must sit naturally beside them.

- "Northline Coffee — Money Map (as of 2026-07)"
- "Cash lands here — Stripe payout to Chase"
- "orders · customers · tax" · "charges · fees · payouts" · "accrual · P&L · tax payable"
- "orders SoT" · "cash SoT" · "books SoT"
- "net payout" · "deposit" · "invoice (A/R)" · "ACH payment" · "sales receipts + tax collected"
- guided views: "DTC order to cash" · "Wholesale invoices" · "What reaches the books"

## 6. The onboarding interview (step 0)

Before drawing anything, the skill establishes: the **entity**, the **accounting method**, the
**systems in play**, the **source of truth per fact**, the **period**, the **audience**, and
**whether amounts may be used**. A complete brief skips the interview.

Every one of those seven is a fact the interface could surface and currently does not. The
**period** in particular ("as of 2026-07") appears only inside the authored title — a finance
document would stamp it.

*(Verbatim sources are in this folder: `source-docs/finance-onboarding.md` (the interview, the
closed source list, the intent → diagram-type table and the "Never" rules), `source-docs/finance-brief.md`
(the Northline fixture), and `source-docs/scenarios.mjs` (all 19 recipe questions and prompts, en + zh).
Read the interview file in full before choosing words — its intent table is the product's own
mapping from a finance question to a diagram type.)*
