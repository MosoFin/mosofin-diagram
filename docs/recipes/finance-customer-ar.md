# Who is allowed to say this customer owes us?

> Draw it as an architecture diagram with the MosoFin-diagram "Finance customer and AR" recipe. A map of Shopify CRM, Stripe customer, and QuickBooks customer with an explicit DTC vs wholesale AR rule. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `finance-customer-ar` (finance, architecture diagram)
- Page: https://diagram.mosofin.com/recipes/finance-customer-ar.html
- Verified example: [Northline Coffee — Who Can Say a Customer Owes Us (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-customer-ar.architecture.html)

## When to use this diagram

Wholesale just launched, three customer IDs disagree, or someone is aging a cash-and-carry brand.

Pick another recipe when the audience needs a cash forecast or a payout rec.

## What the diagram must include

- three identity systems
- DTC sales-receipt rule
- wholesale invoice rule
- CRM is not cash

## Copy-ready prompt

```text
Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin architecture mode to show customer identity across Shopify, Stripe, and QuickBooks. State which system may claim AR. If DTC is sales receipts, say QuickBooks has no AR. If wholesale is Net 30, put aging on the QBO invoice. Do not treat Shopify CRM as cash. Do not invent balances.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Finance customer and AR prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Who is allowed to say this customer owes us?”

A architecture diagram. The whole operating stack: which system owns each domain, money maps, and where entities separate. The Finance customer and AR recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs a cash forecast or a payout rec.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
