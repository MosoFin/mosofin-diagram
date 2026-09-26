# Who calls whom, in what order, and what returns?

> Draw it as a sequence diagram with the MosoFin-diagram "API request chain" recipe. A time-ordered request path with authentication, cache fallback, persistence, return traffic, and async trace. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `api-request` (systems and engineering, sequence diagram)
- Page: https://diagram.mosofin.com/recipes/api-request.html
- Verified example: [Northline Coffee — One DTC Order to the Books (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-order-path.sequence.html)

## When to use this diagram

API documentation, debugging request latency, auth reviews, or explaining cache fallback.

Pick another recipe when order is unimportant and the audience only needs the stable service topology.

## What the diagram must include

- callers and callees
- request and return messages
- fallback or error path
- async side effects

## Copy-ready prompt

```text
Use Mosofin sequence mode to show this request from caller to final response. Include authentication, cache hit or miss, persistence fallback, return messages, and asynchronous trace or event emission. Keep message labels short and order unambiguous.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the API request chain prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Who calls whom, in what order, and what returns?”

A sequence diagram. One order, invoice or payout traced in time across every system it touches. The API request chain recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when order is unimportant and the audience only needs the stable service topology.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
