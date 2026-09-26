# How does a change move safely from commit to production?

> Draw it as a workflow diagram with the MosoFin-diagram "Delivery workflow" recipe. A delivery flow with build, checks, environments, approvals, smoke tests, rollback, and ownership lanes. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `delivery-workflow` (systems and engineering, workflow diagram)
- Page: https://diagram.mosofin.com/recipes/delivery-workflow.html
- Verified example: [Northline Coffee — Month-End Close Runbook (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-close.workflow.html)

## When to use this diagram

CI/CD design, release reviews, deployment governance, or onboarding developers to delivery.

Pick another recipe when the question is where infrastructure runs or what states a deployment object can occupy.

## What the diagram must include

- trigger and build
- blocking checks
- approval and environments
- rollback and verification

## Copy-ready prompt

```text
Use Mosofin workflow mode to draw this delivery process from commit to production. Separate developer, CI, approval, environment, and exception lanes; mark blocking checks, smoke tests, ownership, and the rollback path. Keep one unmistakable happy path.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Delivery workflow prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “How does a change move safely from commit to production?”

A workflow diagram. Steps and gates in one process: team handoffs, the month-end close, approval chains, payment runs. The Delivery workflow recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the question is where infrastructure runs or what states a deployment object can occupy.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
