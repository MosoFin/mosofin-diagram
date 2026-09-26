# Which team or system owns each step, and where does work change hands?

> Draw it as a workflow diagram with the MosoFin-diagram "Business handoffs" recipe. Lanes by team or system across one end-to-end process, with every handoff and every exception path named. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `business-handoffs` (business, workflow diagram)
- Page: https://diagram.mosofin.com/recipes/business-handoffs.html
- Verified example: [Northline Coffee — Month-End Close Runbook (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-close.workflow.html)

## When to use this diagram

Work is dropping between teams, onboarding an operator, or documenting who is accountable for each gate.

Pick another recipe when you need the system map rather than the process (business-operating-map), or numbers that must tie out.

## What the diagram must include

- one lane per team or system
- named handoffs
- an exception lane
- the gate that can stop the work

## Copy-ready prompt

```text
Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin workflow mode to show who owns each step of this process. One lane per team or system, one main path left to right, every handoff labelled with what actually changes hands, and a separate exception lane for the paths that stall or reverse. Do not invent owners or SLAs.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Business handoffs prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “Which team or system owns each step, and where does work change hands?”

A workflow diagram. Steps and gates in one process: team handoffs, the month-end close, approval chains, payment runs. The Business handoffs recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when you need the system map rather than the process (business-operating-map), or numbers that must tie out.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
