# Which events move through which topics, processors, groups, and failure paths?

> Draw it as a data-flow diagram with the MosoFin-diagram "Event-stream topology" recipe. A stream map of producers, topics, ordered processors, consumer groups, state, replay, and DLQ. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `event-stream` (systems and engineering, data flow diagram)
- Page: https://diagram.mosofin.com/recipes/event-stream.html
- Verified example: [Northline Coffee — Stripe Payout Reconciliation to Chase 1002 (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-payout-rec.dataflow.html)

## When to use this diagram

Kafka/event-platform design, stream processing reviews, ownership, replay, and failure handling.

Pick another recipe when topic names, consumer groups, and delivery semantics are not known—use a generic workflow instead.

## What the diagram must include

- producers and event names
- topics and ordering
- processors and consumer groups
- state, replay, and DLQ

## Copy-ready prompt

```text
Use Mosofin dataflow mode to draw this event-stream topology. Name producers, events, topics, ordered processors, consumer groups, state stores, replay paths, and the DLQ. Show ownership and delivery semantics only when supported by evidence.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Event-stream topology prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Which events move through which topics, processors, groups, and failure paths?”

A data flow diagram. Revenue walks, payout reconciliations, cash runway and data lineage: where a number comes from. The Event-stream topology recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when topic names, consumer groups, and delivery semantics are not known—use a generic workflow instead.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
