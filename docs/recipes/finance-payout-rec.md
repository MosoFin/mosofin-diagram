# Where did Stripe cash go relative to the bank and QuickBooks?

> Draw it as a data-flow diagram with the MosoFin-diagram "Finance payout rec" recipe. A rec-shaped data flow: captured charges, netted fees, payouts, in-transit, bank credits, books, and residual. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-payout-rec` (finance, data flow diagram)
- Page: https://diagram.mosofin.com/recipes/finance-payout-rec.html
- Verified example: [Northline Coffee — Stripe Payout Reconciliation to Chase 1002 (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-payout-rec.dataflow.html)

## When to use this diagram

Month-end payout rec, Stripe dashboard cash ≠ bank, or a clearing account that will not tie.

Pick another recipe when the question is why Shopify sales ≠ P&L, or the close checklist order.

## What the diagram must include

- fees netted in payout
- timing vs unexplained residual
- bank then books
- no invented residual

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode for Stripe payout vs bank vs QuickBooks. Separate timing (pending / in transit) from unexplained residual. Label fees as netted inside the payout. Do not invent a residual; if totals are unknown, omit amounts and keep the topology. Never mark the rec green unless the user supplied a zero difference.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance payout rec prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Where did Stripe cash go relative to the bank and QuickBooks?”

A data flow diagram. Revenue walks, payout reconciliations, cash runway and data lineage: where a number comes from. The Finance payout rec recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the question is why Shopify sales ≠ P&L, or the close checklist order.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
