# What happened to one order or payout, in time, across commerce, payments, and the books?

> Draw it as a sequence diagram with the MosoFin-diagram "Finance order path" recipe. A time-ordered path from checkout through capture, fee netting, payout batch, bank, and the ledger split. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-order-path` (finance, sequence diagram)
- Page: https://diagram.mosofin.com/recipes/finance-order-path.html
- Verified example: [Northline Coffee — One DTC Order to the Books (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-order-path.sequence.html)

## When to use this diagram

Debugging a break on one order, a double-charge complaint, or explaining why a deposit is a batch.

Pick another recipe when the audience only needs the stable system map, or a period rec that must foot across all payouts.

## What the diagram must include

- real IDs when known
- capture and returns
- fee gap
- payout then bank then books

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin sequence mode to walk one real order from cart to GL. Keep Shopify, Stripe, bank, and QuickBooks as participants. Show capture, fee netting, payout batching, and the ledger split. Use real IDs when the user supplied them. Do not invent amounts; omit or tag unknown. Keep the fee gap visible without turning it into the only path.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance order path prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What happened to one order or payout, in time, across commerce, payments, and the books?”

A sequence diagram. One order, invoice or payout traced in time across every system it touches. The Finance order path recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience only needs the stable system map, or a period rec that must foot across all payouts.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
