# What state is a release in, and what can happen next?

> Draw it as a lifecycle diagram with the MosoFin-diagram "Deployment lifecycle" recipe. A deployment state model covering queued, building, verifying, approval, promotion, rollback, and terminal outcomes. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `deployment-lifecycle` (systems and engineering, lifecycle diagram)
- Page: https://diagram.mosofin.com/recipes/deployment-lifecycle.html
- Verified example: [Northline Coffee — Refund and Chargeback Lifecycle (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-dispute.lifecycle.html)

## When to use this diagram

Release controllers, GitOps reconciliation, environment promotion, or deployment status APIs.

Pick another recipe when the question is the human/CI sequence of delivery actions rather than the deployment object state.

## What the diagram must include

- queued and running states
- verification and approval
- promotion and rollback
- success, failure, cancellation

## Copy-ready prompt

```text
Use Mosofin lifecycle mode to model the deployment object. Show queued, building, verifying, waiting for approval, promoting, rolling back, and every terminal outcome. Label the events and guards that permit each transition.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Deployment lifecycle prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What state is a release in, and what can happen next?”

A lifecycle diagram. The states one object moves through: refunds, disputes, invoices, subscriptions. The Deployment lifecycle recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the question is the human/CI sequence of delivery actions rather than the deployment object state.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
