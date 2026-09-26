# Can we make payroll, and what inflows are actually named?

> Draw it as a data-flow diagram with the MosoFin-diagram "Finance cash to a date" recipe. A cash walk from a tied bank opening through in-transit payouts and known outflows, with user-stated items labelled. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-cash-runway` (finance, data flow diagram)
- Page: https://diagram.mosofin.com/recipes/finance-cash-runway.html
- Verified example: [Northline Coffee — Cash to Payroll Date (as of 2026-07-31)](https://diagram.mosofin.com/gallery/artifacts/northline-cash-runway.dataflow.html)

## When to use this diagram

Payroll Friday, runway to a date, or a founder asking whether next week’s Shopify sales count.

Pick another recipe when the audience needs the P&L walk or the close checklist.

## What the diagram must include

- tied opening or explicit gap
- named in-transit payouts
- known outflows
- no invented next-week sales

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode for cash to a named date. Opening cash is red until tied to a bank rec, or the user accepts the gap. Inflows need a payout id, invoice id, or user-stated tag. Do not add next-week Shopify sales without an order or payout basis. Do not invent amounts.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance cash to a date prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Can we make payroll, and what inflows are actually named?”

A data flow diagram. Revenue walks, payout reconciliations, cash runway and data lineage: where a number comes from. The Finance cash to a date recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs the P&L walk or the close checklist.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
