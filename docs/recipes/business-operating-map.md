# How does the whole business run, and which system owns each part of it?

> Draw it as an architecture diagram with the MosoFin-diagram "Business operating map" recipe. The whole business as three finance cycles meeting at the bank: procure to pay on the left, order to cash on the right, record to report underneath, with the system of record named on each node. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `business-operating-map` (business, architecture diagram)
- Page: https://diagram.mosofin.com/recipes/business-operating-map.html
- Verified example: [How the business runs (2026-07)](https://diagram.mosofin.com/gallery/artifacts/business-operating-map.architecture.html)

## When to use this diagram

Explaining the business to a new hire, an operator, a buyer, or yourself; before choosing what to fix or replace.

Pick another recipe when the question is about one process in order (workflow), one order in time (sequence), or numbers that must foot (finance recipes).

## What the diagram must include

- 8–12 domains, not 30 apps
- system of record per domain
- P2P, O2C and R2R as named regions
- shared vs per-entity books

## Copy-ready prompt

```text
Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin architecture mode to map how the whole business runs. Group by domain (demand/CRM, commerce, supply chain, inventory, fulfilment, payments, spend, payroll, bank, books, data) and name the real tool in each sublabel — at most 12 primary nodes. Lay it out as the three finance cycles: procure to pay (suppliers, ERP, spend) on the left, order to cash (CRM, commerce, payments) on the right, inventory and the bank in the middle, and record to report (one ledger per entity) along the bottom. Goods run left to right, cash converges on the bank, and every ledger is fed from the bank. Mark approval gates, say which cycles are shared and which books are per entity, and use the real entity names. Do not invent amounts, volumes, or headcounts.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Business operating map prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “How does the whole business run, and which system owns each part of it?”

A architecture diagram. The whole operating stack: which system owns each domain, money maps, and where entities separate. The Business operating map recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the question is about one process in order (workflow), one order in time (sequence), or numbers that must foot (finance recipes).

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
