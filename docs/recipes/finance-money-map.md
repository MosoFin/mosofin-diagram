# How does this company make money, and what is source of truth for orders, cash, and books?

> Draw it as an architecture diagram with the MosoFin-diagram "Finance money map" recipe. A bounded map of commerce, payments, bank, and ledger with one order-to-cash path and named crossings. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-money-map` (finance, architecture diagram)
- Page: https://diagram.mosofin.com/recipes/finance-money-map.html
- Verified example: [Northline Coffee — Money Map (as of 2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-money-map.architecture.html)

## When to use this diagram

Onboarding a controller, explaining Shopify + Stripe + QuickBooks, or diligence on how cash reaches the books.

Pick another recipe when the audience needs one order’s timestamps, a payout rec that must foot, or month-end task ownership.

## What the diagram must include

- 8–12 systems
- one order-to-cash path
- named boundary crossings
- one source of truth per fact

## Copy-ready prompt

```text
Read references/finance-onboarding.md and the workspace FINANCE-BRIEF.md. Use Mosofin architecture mode to map how money reaches the books. Show 8–12 systems (commerce, payments, bank, ledger), one primary order-to-cash path, and label every crossing with the real mechanism. Do not invent amounts. Do not give two systems the same source-of-truth fact. Put tax and gift-card liability on side branches, not on the revenue rail.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance money map prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “How does this company make money, and what is source of truth for orders, cash, and books?”

A architecture diagram. The whole operating stack: which system owns each domain, money maps, and where entities separate. The Finance money map recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs one order’s timestamps, a payout rec that must foot, or month-end task ownership.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
