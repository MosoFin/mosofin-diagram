# Why don’t Shopify, Stripe, and QuickBooks show the same revenue?

> Draw it as a data-flow diagram with the MosoFin-diagram "Finance revenue walk" recipe. A left-to-right walk from gross sales through discounts, returns, tax, gift cards, fees, and recognized income. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-revenue-walk` (finance, data flow diagram)
- Page: https://diagram.mosofin.com/recipes/finance-revenue-walk.html
- Verified example: [Northline Coffee — July Revenue Walk: Shopify to QuickBooks (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-revenue-walk.dataflow.html)

## When to use this diagram

Founder and CFO disagree on “the number,” or Shopify sales do not match the P&L.

Pick another recipe when the question is one order’s timestamps, Stripe payout vs bank, or a close runbook.

## What the diagram must include

- gross to contra
- tax and gift cards as not-income
- fees as expense not contra
- landing on the books

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode to walk gross commerce sales to recognized QuickBooks income. Put discounts and returns on the commerce rail; style tax and gift cards as security / not-income; treat processor fees as an expense branch, not a contra to sales. Do not invent totals. If a number is missing, omit it or tag unknown. Extra questions become at most five guided views.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance revenue walk prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Why don’t Shopify, Stripe, and QuickBooks show the same revenue?”

A data flow diagram. Revenue walks, payout reconciliations, cash runway and data lineage: where a number comes from. The Finance revenue walk recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the question is one order’s timestamps, Stripe payout vs bank, or a close runbook.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
