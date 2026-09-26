# If commerce refunded it, is the money actually done?

> Draw it as a lifecycle diagram with the MosoFin-diagram "Finance dispute lifecycle" recipe. A state model that separates Shopify refund, Stripe dispute waits, recoverable books catch-up, and terminal win or write-off. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-dispute-lifecycle` (finance, lifecycle diagram)
- Page: https://diagram.mosofin.com/recipes/finance-dispute-lifecycle.html
- Verified example: [Northline Coffee — Refund and Chargeback Lifecycle (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-dispute.lifecycle.html)

## When to use this diagram

Chargeback week, CX saying “refunded so we are fine,” or QBO still showing income.

Pick another recipe when the audience needs the close checklist or a gross-to-net walk for the whole period.

## What the diagram must include

- captured start
- non-terminal waits
- books catch-up as recoverable failure
- won and lost terminals

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin lifecycle mode for this refund or dispute. Keep Shopify refunded as a non-terminal step when Stripe still has an open dispute. Model QBO still showing income as a recoverable failure with a real transition back after a credit memo. Won and lost/write-off are terminals. Do not invent amounts or evidence due dates.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance dispute lifecycle prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “If commerce refunded it, is the money actually done?”

A lifecycle diagram. The states one object moves through: refunds, disputes, invoices, subscriptions. The Finance dispute lifecycle recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs the close checklist or a gross-to-net walk for the whole period.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
