# What happens after the initial request returns?

> Draw it as a sequence diagram with the MosoFin-diagram "Async roundtrip" recipe. A sequence view of enqueue, acknowledgement, background work, callbacks, retries, timeout, and final consistency. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `async-roundtrip` (systems and engineering, sequence diagram)
- Page: https://diagram.mosofin.com/recipes/async-roundtrip.html
- Verified example: [Northline Coffee — One DTC Order to the Books (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-order-path.sequence.html)

## When to use this diagram

Webhooks, jobs, queues, payment callbacks, eventual consistency, or async API contracts.

Pick another recipe when the primary question is topic topology and consumer ownership rather than time order.

## What the diagram must include

- initial acknowledgement
- queue or scheduler
- background work
- callback, retry, and timeout

## Copy-ready prompt

```text
Use Mosofin sequence mode to explain this asynchronous roundtrip. Show the initial acknowledgement, enqueue or scheduling step, background processing, callback or polling, retry and timeout behavior, and the point where the caller can observe final consistency.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Async roundtrip prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What happens after the initial request returns?”

A sequence diagram. One order, invoice or payout traced in time across every system it touches. The Async roundtrip recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the primary question is topic topology and consumer ownership rather than time order.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
