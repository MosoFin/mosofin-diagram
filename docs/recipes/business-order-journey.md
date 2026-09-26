# What happens to one order, in time, across every system it touches?

> Draw it as a sequence diagram with the MosoFin-diagram "Order journey across systems" recipe. One order traced in time from demand through commerce, inventory, fulfilment, payment and into the books. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `business-order-journey` (business, sequence diagram)
- Page: https://diagram.mosofin.com/recipes/business-order-journey.html
- Verified example: [Northline Coffee — One DTC Order to the Books (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-order-path.sequence.html)

## When to use this diagram

Explaining the real sequence to a new hire, debugging where an order stalls, or scoping an integration.

Pick another recipe when you need the whole stack at a glance (business-operating-map) or a reconciliation that must foot.

## What the diagram must include

- one order, real IDs if known
- every system it touches
- the waits and the async steps
- where it becomes revenue

## Copy-ready prompt

```text
Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin sequence mode to trace one order in time across every system it touches — demand, commerce, inventory, fulfilment, payments, bank and books. Show the waits and the asynchronous steps as separate messages. Do not invent timestamps or amounts.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Order journey across systems prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What happens to one order, in time, across every system it touches?”

A sequence diagram. One order, invoice or payout traced in time across every system it touches. The Order journey across systems recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when you need the whole stack at a glance (business-operating-map) or a reconciliation that must foot.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
