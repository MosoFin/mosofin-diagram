# Where does data come from, how does it change, and who consumes it?

> Draw it as a data-flow diagram with the MosoFin-diagram "Data lineage" recipe. A governed path from sources through consent, transforms, sensitive stores, warehouse, and consumers. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `data-lineage` (systems and engineering, data flow diagram)
- Page: https://diagram.mosofin.com/recipes/data-lineage.html
- Verified example: [Northline Coffee — July Revenue Walk: Shopify to QuickBooks (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-revenue-walk.dataflow.html)

## When to use this diagram

Analytics architecture, ETL/ELT review, PII assessment, warehouse design, or model feature lineage.

Pick another recipe when the audience needs request timing or operational task ownership rather than data assets.

## What the diagram must include

- sources and assets
- transform stages
- classification or consent
- stores and consumers

## Copy-ready prompt

```text
Use Mosofin dataflow mode to map this data lineage. Name every data asset and transform, show consent or classification boundaries, distinguish streaming from batch paths, and identify stores plus downstream consumers. Do not use unlabeled flows.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Data lineage prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Where does data come from, how does it change, and who consumes it?”

A data flow diagram. Revenue walks, payout reconciliations, cash runway and data lineage: where a number comes from. The Data lineage recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs request timing or operational task ownership rather than data assets.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
