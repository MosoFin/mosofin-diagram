# Which diagram answers your business question?

> MosoFin-diagram has 23 recipes. Each one answers a single question, such as how the whole business runs, why Shopify revenue differs from QuickBooks, or whether cash covers payroll, with the right diagram type and a prompt your coding agent can run.

## Business

- [How does the whole business run, and which system owns each part of it?](https://diagram.mosofin.com/recipes/business-operating-map.md) — Business operating map, architecture diagram
- [Which team or system owns each step, and where does work change hands?](https://diagram.mosofin.com/recipes/business-handoffs.md) — Business handoffs, workflow diagram
- [What holds the business up, which system owns each pillar, and what does it all stand on?](https://diagram.mosofin.com/recipes/business-pillars.md) — Business pillars, pillars diagram
- [What happens to one order, in time, across every system it touches?](https://diagram.mosofin.com/recipes/business-order-journey.md) — Order journey across systems, sequence diagram

## Finance

- [How does this company make money, and what is source of truth for orders, cash, and books?](https://diagram.mosofin.com/recipes/finance-money-map.md) — Finance money map, architecture diagram
- [What happened to one order or payout, in time, across commerce, payments, and the books?](https://diagram.mosofin.com/recipes/finance-order-path.md) — Finance order path, sequence diagram
- [Why don’t Shopify, Stripe, and QuickBooks show the same revenue?](https://diagram.mosofin.com/recipes/finance-revenue-walk.md) — Finance revenue walk, data flow diagram
- [What is month-end, in order, and who owns each gate?](https://diagram.mosofin.com/recipes/finance-close.md) — Finance month-end close, workflow diagram
- [If commerce refunded it, is the money actually done?](https://diagram.mosofin.com/recipes/finance-dispute-lifecycle.md) — Finance dispute lifecycle, lifecycle diagram
- [Where did Stripe cash go relative to the bank and QuickBooks?](https://diagram.mosofin.com/recipes/finance-payout-rec.md) — Finance payout rec, data flow diagram
- [Who is allowed to say this customer owes us?](https://diagram.mosofin.com/recipes/finance-customer-ar.md) — Finance customer and AR, architecture diagram
- [Can we make payroll, and what inflows are actually named?](https://diagram.mosofin.com/recipes/finance-cash-runway.md) — Finance cash to a date, data flow diagram

## Systems and engineering

- [What exists, who owns it, and how is it connected?](https://diagram.mosofin.com/recipes/system-overview.md) — System overview, architecture diagram
- [Where does each workload run, and what crosses a boundary?](https://diagram.mosofin.com/recipes/deployment-ownership.md) — Deployment ownership, architecture diagram
- [How does an agent plan, get permission, act, recover, and report?](https://diagram.mosofin.com/recipes/agent-tool-call.md) — Agent tool-call loop, workflow diagram
- [How does a change move safely from commit to production?](https://diagram.mosofin.com/recipes/delivery-workflow.md) — Delivery workflow, workflow diagram
- [How do responders detect, triage, mitigate, verify, and escalate?](https://diagram.mosofin.com/recipes/incident-runbook.md) — Incident runbook, workflow diagram
- [Who calls whom, in what order, and what returns?](https://diagram.mosofin.com/recipes/api-request.md) — API request chain, sequence diagram
- [What happens after the initial request returns?](https://diagram.mosofin.com/recipes/async-roundtrip.md) — Async roundtrip, sequence diagram
- [Where does data come from, how does it change, and who consumes it?](https://diagram.mosofin.com/recipes/data-lineage.md) — Data lineage, data flow diagram
- [Which events move through which topics, processors, groups, and failure paths?](https://diagram.mosofin.com/recipes/event-stream.md) — Event-stream topology, data flow diagram
- [Which states exist, what events move between them, and how does it end?](https://diagram.mosofin.com/recipes/object-lifecycle.md) — Object lifecycle, lifecycle diagram
- [What state is a release in, and what can happen next?](https://diagram.mosofin.com/recipes/deployment-lifecycle.md) — Deployment lifecycle, lifecycle diagram
