# What is month-end, in order, and who owns each gate?

> Draw it as a workflow diagram with the MosoFin-diagram "Finance month-end close" recipe. A close runbook with commerce, cash, books, and review lanes, plus an exception lane for unmatched items. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-close` (finance, workflow diagram)
- Page: https://diagram.mosofin.com/recipes/finance-close.html
- Verified example: [Northline Coffee — Month-End Close Runbook (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-close.workflow.html)

## When to use this diagram

Explaining close to a founder, sharing ownership with a bookkeeper, or showing what blocks period lock.

Pick another recipe when the audience needs a payout rec that foots, or a state machine for one dispute.

## What the diagram must include

- cutoff
- payout and sales recs
- exception lane
- review then lock

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin workflow mode for this period’s close. Separate Shopify, Stripe/bank, QuickBooks, review, and exception lanes. Make cutoff → payout rec → sales rec → tax tie → review → lock the main path. Put unmatched payouts and open disputes on the exception lane. Tag owners. Do not mark a rec node done without evidence. Do not invent amounts.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance month-end close prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What is month-end, in order, and who owns each gate?”

A workflow diagram. Steps and gates in one process: team handoffs, the month-end close, approval chains, payment runs. The Finance month-end close recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs a payout rec that foots, or a state machine for one dispute.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
