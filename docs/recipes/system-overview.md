# What exists, who owns it, and how is it connected?

> Draw it as an architecture diagram with the MosoFin-diagram "System overview" recipe. A bounded map of core components, external dependencies, primary paths, and trust boundaries. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `system-overview` (systems and engineering, architecture diagram)
- Page: https://diagram.mosofin.com/recipes/system-overview.html
- Verified example: [Northline Coffee — Money Map (as of 2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-money-map.architecture.html)

## When to use this diagram

Onboarding, design reviews, repository orientation, or explaining a service landscape.

Pick another recipe when the audience needs exact call order, state transitions, or row-level data lineage.

## What the diagram must include

- 8–12 core components
- one primary path
- external dependencies
- trust boundaries

## Copy-ready prompt

```text
Analyze this repository, then use Mosofin to create a high-level architecture diagram. Show 8–12 core runtime components, one primary request or data path, external dependencies, ownership or trust boundaries, and put supporting detail in cards instead of adding more edges.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the System overview prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “What exists, who owns it, and how is it connected?”

A architecture diagram. The whole operating stack: which system owns each domain, money maps, and where entities separate. The System overview recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs exact call order, state transitions, or row-level data lineage.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
