# How do responders detect, triage, mitigate, verify, and escalate?

> Draw it as a workflow diagram with the MosoFin-diagram "Incident runbook" recipe. An operational workflow that separates signals, responders, mitigation, communications, and recovery proof. Your coding agent returns one validated, self-contained HTML file.

- Recipe: `incident-runbook` (systems and engineering, workflow diagram)
- Page: https://diagram.mosofin.com/recipes/incident-runbook.html
- Verified example: [Northline Coffee — Month-End Close Runbook (2026-07)](https://diagram.mosofin.com/gallery/artifacts/northline-close.workflow.html)

## When to use this diagram

Incident playbooks, on-call handoffs, reliability reviews, and tabletop exercises.

Pick another recipe when the audience needs live metrics or a post-incident component topology instead of response actions.

## What the diagram must include

- detection signal
- triage owner
- mitigation and rollback
- verification and communication

## Copy-ready prompt

```text
Use Mosofin workflow mode to turn this incident runbook into responder lanes. Show detection, triage, mitigation, escalation, communication, rollback, and recovery verification. Separate decision gates from actions and make missing ownership visible.
```

## How to make it

1. **Install the skill.** Add MosoFin-diagram to your coding agent. For Claude Code: npx -y skills add MosoFin/mosofin-diagram --skill mosofin --agent claude-code --global --copy --yes
2. **Describe the business once.** Answer a short interview: what the business does, which entities are in scope, and which system of record owns each domain.
3. **Ask this question.** Paste the Incident runbook prompt from this page. The agent writes the diagram spec, validates it, and repairs anything the validator names.
4. **Open and share the diagram.** Open the self-contained HTML file in any browser, walk the guided views, and forward it or export an image.

## Questions about this recipe

### Which diagram type answers “How do responders detect, triage, mitigate, verify, and escalate?”

A workflow diagram. Steps and gates in one process: team handoffs, the month-end close, approval chains, payment runs. The Incident runbook recipe sets it up for this question.

### When should I use a different recipe?

Pick another recipe when the audience needs live metrics or a post-incident component topology instead of response actions.

### Does MosoFin-diagram connect to my systems or invent numbers?

No. It draws only what you state in the business brief or the conversation. It never calls QuickBooks, Stripe, Shopify, an ERP or a bank, and an amount you did not supply never appears.
