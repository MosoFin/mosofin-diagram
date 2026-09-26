# What holds the business up, which system owns each pillar, and what does it all stand on?

> Draw it as a pillars diagram with the MosoFin-diagram "Business pillars" recipe. The operating model on one page: a roof for the business in one sentence, one pillar per domain with its system of record and the facts it owns, and a foundation for the entity and the truth rules. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `business-pillars` (business, pillars diagram)
- Page: https://diagram.mosofin.com/recipes/business-pillars.html
- Verified example: [Northline Coffee — How the business stands (as of 2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-operating-pillars.pillars.html)

## When to use this diagram

A board, buyer, or new hire needs the whole operating model in one glance, or the brief is fresh and you want to confirm it before mapping any flow.

Pick another recipe when the question is how work or money moves (operating map, handoffs, order journey) or a number that must tie out (finance recipes).

## What the diagram must include

- 3–6 pillars, one per domain
- system of record on each capital
- facts owned, not tasks or amounts
- entity and truth rules as the foundation

## Copy-ready prompt

```text
Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin pillars mode to state the operating model on one page. The roof is the business in one sentence. Make one pillar per domain the business runs (3–6), name the system of record in the sublabel and set brand only for a real product, list the facts that system owns as items, and put the one-phrase truth claim in the tag. The foundation names the entity, the accounting basis, and the truth rules. Do not draw flows, ties, amounts, or headcounts.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Business pillars prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What holds the business up, which system owns each pillar, and what does it all stand on?”

A pillars diagram. The operating model on one page: the business in one sentence, one pillar per domain, the rules underneath. The Business pillars recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the question is how work or money moves (operating map, handoffs, order journey) or a number that must tie out (finance recipes).

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
