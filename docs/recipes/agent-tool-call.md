# How does an agent plan, get permission, act, recover, and report?

> Draw it as a workflow diagram with the MosoFin-diagram "Agent tool-call loop" recipe. A lane-based agent loop with policy gates, tool execution, exception recovery, evidence, and final response. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `agent-tool-call` (systems and engineering, workflow diagram)
- Page: https://diagram.mosofin.com/recipes/agent-tool-call.html
- Verified example: [Northline Coffee — Month-End Close Runbook (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-close.workflow.html)

## When to use this diagram

Explaining agent runtimes, MCP/tool orchestration, approvals, retries, or observability.

Pick another recipe when the goal is only to show static agent components or exact API message timing.

## What the diagram must include

- request and planning
- policy or approval gate
- tool execution
- exception and evidence paths

## Copy-ready prompt

```text
Use Mosofin workflow mode to explain this agent tool-call loop. Separate user surface, agent runtime, policy boundary, exception handling, tool execution, and observability into lanes. Make the successful path primary and show approval, retry, blocked, and evidence paths explicitly.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Agent tool-call loop prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “How does an agent plan, get permission, act, recover, and report?”

A workflow diagram. Steps and gates in one process: team handoffs, the month-end close, approval chains, payment runs. The Agent tool-call loop recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the goal is only to show static agent components or exact API message timing.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
