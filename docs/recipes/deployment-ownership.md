# Where does each workload run, and what crosses a boundary?

> Draw it as an architecture diagram with the MosoFin-diagram "Deployment ownership" recipe. A deployment-focused map of regions, networks, clusters, workloads, stores, and cross-boundary mechanisms. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `deployment-ownership` (systems and engineering, architecture diagram)
- Page: https://diagram.mosofin.com/recipes/deployment-ownership.html
- Verified example: [Northline Coffee — Who Can Say a Customer Owes Us (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-customer-ar.architecture.html)

## When to use this diagram

Cloud reviews, production readiness, multi-region planning, or infrastructure ownership handoffs.

Pick another recipe when deployment facts are unknown or the real question is application behavior rather than placement.

## What the diagram must include

- regions and networks
- workload ownership
- stateful services
- named boundary crossings

## Copy-ready prompt

```text
Use Mosofin to draw the production deployment topology. Group resources by region, network, cluster, and owner; show workloads and stateful services; label every cross-boundary mechanism. Do not invent deployment facts—mark unknown areas explicitly. If the user wants a fail-closed deployment review, ask before setting meta.engineering_profile to deployment-ownership; otherwise leave the engineering profile unset.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Deployment ownership prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Where does each workload run, and what crosses a boundary?”

A architecture diagram. The whole operating stack: which system owns each domain, money maps, and where entities separate. The Deployment ownership recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when deployment facts are unknown or the real question is application behavior rather than placement.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
