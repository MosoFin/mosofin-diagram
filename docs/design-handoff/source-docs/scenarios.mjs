const RAW_RECIPES = [
  {
    id: 'business-operating-map', type: 'architecture', proof: 'business-map',
    presentation: { preset: 'classic', motion: 'static', views: 'recommended' },
    signals: [['how the business runs', 18], ['whole business', 17], ['entire business', 17], ['business diagram', 16], ['operating map', 16], ['our stack', 14], ['software we use', 15], ['all our systems', 15], ['tech stack', 13], ['supply chain crm', 15], ['crm erp', 13], ['understand my business', 16], ['outline my business', 16], ['map my business', 17]],
    en: {
      title: 'Business operating map', question: 'How does the whole business run, and which system owns each part of it?',
      summary: 'One bounded map of every domain the business operates — demand, supply, fulfilment, money, people, books — with the system of record named on each node.',
      useWhen: 'Explaining the business to a new hire, an operator, a buyer, or yourself; before choosing what to fix or replace.',
      avoidWhen: 'The question is about one process in order (workflow), one order in time (sequence), or numbers that must foot (finance recipes).',
      include: ['8–12 domains, not 30 apps', 'system of record per domain', 'one primary rail from demand to books', 'shared vs per-entity boundaries'],
      prompt: 'Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin architecture mode to map how the whole business runs. Group by domain (demand/CRM, commerce, supply chain, inventory, fulfilment, payments, spend, payroll, bank, books, data) and name the real tool in each sublabel — at most 12 primary nodes. Draw one primary rail from demand through to the books, mark approval gates, and put shared vs per-entity systems in separate boundaries. Do not invent amounts, volumes, or headcounts.',
    },
  },
  {
    id: 'business-handoffs', type: 'workflow', proof: 'close',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['who does what', 15], ['handoff', 15], ['handoffs between teams', 17], ['team ownership', 14], ['who owns which step', 16], ['where things fall through', 16], ['process owner', 13]],
    en: {
      title: 'Business handoffs', question: 'Which team or system owns each step, and where does work change hands?',
      summary: 'Lanes by team or system across one end-to-end process, with every handoff and every exception path named.',
      useWhen: 'Work is dropping between teams, onboarding an operator, or documenting who is accountable for each gate.',
      avoidWhen: 'You need the system map rather than the process (business-operating-map), or numbers that must tie out.',
      include: ['one lane per team or system', 'named handoffs', 'an exception lane', 'the gate that can stop the work'],
      prompt: 'Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin workflow mode to show who owns each step of this process. One lane per team or system, one main path left to right, every handoff labelled with what actually changes hands, and a separate exception lane for the paths that stall or reverse. Do not invent owners or SLAs.',
    },
  },
  {
    id: 'business-order-journey', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['one order through every system', 17], ['order journey', 16], ['customer journey systems', 15], ['end to end order', 16], ['what happens when someone buys', 17]],
    en: {
      title: 'Order journey across systems', question: 'What happens to one order, in time, across every system it touches?',
      summary: 'One order traced in time from demand through commerce, inventory, fulfilment, payment and into the books.',
      useWhen: 'Explaining the real sequence to a new hire, debugging where an order stalls, or scoping an integration.',
      avoidWhen: 'You need the whole stack at a glance (business-operating-map) or a reconciliation that must foot.',
      include: ['one order, real IDs if known', 'every system it touches', 'the waits and the async steps', 'where it becomes revenue'],
      prompt: 'Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin sequence mode to trace one order in time across every system it touches — demand, commerce, inventory, fulfilment, payments, bank and books. Show the waits and the asynchronous steps as separate messages. Do not invent timestamps or amounts.',
    },
  },
  {
    id: 'finance-money-map', type: 'architecture', proof: 'money-map',
    presentation: { preset: 'classic', motion: 'static', views: 'recommended' },
    signals: [['how we make money', 16], ['make money', 14], ['money map', 15], ['source of truth', 14], ['how money reaches the books', 16], ['shopify stripe quickbooks', 14], ['commerce payments ledger', 13], ['quickbooks', 8], ['qbo', 8]],
    en: {
      title: 'Finance money map', question: 'How does this company make money, and what is source of truth for orders, cash, and books?',
      summary: 'A bounded map of commerce, payments, bank, and ledger with one order-to-cash path and named crossings.',
      useWhen: 'Onboarding a controller, explaining Shopify + Stripe + QuickBooks, or diligence on how cash reaches the books.',
      avoidWhen: 'The audience needs one order’s timestamps, a payout rec that must foot, or month-end task ownership.',
      include: ['8–12 systems', 'one order-to-cash path', 'named boundary crossings', 'one source of truth per fact'],
      prompt: 'Read references/finance-onboarding.md and the workspace FINANCE-BRIEF.md. Use Mosofin architecture mode to map how money reaches the books. Show 8–12 systems (commerce, payments, bank, ledger), one primary order-to-cash path, and label every crossing with the real mechanism. Do not invent amounts. Do not give two systems the same source-of-truth fact. Put tax and gift-card liability on side branches, not on the revenue rail.',
    },
  },
  {
    id: 'finance-order-path', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['walk one order', 16], ['one order', 14], ['cart to gl', 15], ['paymentintent', 14], ['order to cash sequence', 15], ['charged twice', 12]],
    en: {
      title: 'Finance order path', question: 'What happened to one order or payout, in time, across commerce, payments, and the books?',
      summary: 'A time-ordered path from checkout through capture, fee netting, payout batch, bank, and the ledger split.',
      useWhen: 'Debugging a break on one order, a double-charge complaint, or explaining why a deposit is a batch.',
      avoidWhen: 'The audience only needs the stable system map, or a period rec that must foot across all payouts.',
      include: ['real IDs when known', 'capture and returns', 'fee gap', 'payout then bank then books'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin sequence mode to walk one real order from cart to GL. Keep Shopify, Stripe, bank, and QuickBooks as participants. Show capture, fee netting, payout batching, and the ledger split. Use real IDs when the user supplied them. Do not invent amounts; omit or tag unknown. Keep the fee gap visible without turning it into the only path.',
    },
  },
  {
    id: 'finance-revenue-walk', type: 'dataflow', proof: 'revenue-walk',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['shopify revenue is not qbo', 18], ['dashboards disagree', 16], ['gross to net', 15], ['shopify vs quickbooks', 16], ['recognized revenue walk', 14], ['gift card liability', 12]],
    en: {
      title: 'Finance revenue walk', question: 'Why don’t Shopify, Stripe, and QuickBooks show the same revenue?',
      summary: 'A left-to-right walk from gross sales through discounts, returns, tax, gift cards, fees, and recognized income.',
      useWhen: 'Founder and CFO disagree on “the number,” or Shopify sales do not match the P&L.',
      avoidWhen: 'The question is one order’s timestamps, Stripe payout vs bank, or a close runbook.',
      include: ['gross to contra', 'tax and gift cards as not-income', 'fees as expense not contra', 'landing on the books'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode to walk gross commerce sales to recognized QuickBooks income. Put discounts and returns on the commerce rail; style tax and gift cards as security / not-income; treat processor fees as an expense branch, not a contra to sales. Do not invent totals. If a number is missing, omit it or tag unknown. Extra questions become at most five guided views.',
    },
  },
  {
    id: 'finance-close', type: 'workflow', proof: 'close',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['month-end close', 18], ['close the books', 16], ['period lock', 14], ['close calendar', 14], ['payout rec then sales rec', 13], ['soft close', 12]],
    en: {
      title: 'Finance month-end close', question: 'What is month-end, in order, and who owns each gate?',
      summary: 'A close runbook with commerce, cash, books, and review lanes, plus an exception lane for unmatched items.',
      useWhen: 'Explaining close to a founder, sharing ownership with a bookkeeper, or showing what blocks period lock.',
      avoidWhen: 'The audience needs a payout rec that foots, or a state machine for one dispute.',
      include: ['cutoff', 'payout and sales recs', 'exception lane', 'review then lock'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin workflow mode for this period’s close. Separate Shopify, Stripe/bank, QuickBooks, review, and exception lanes. Make cutoff → payout rec → sales rec → tax tie → review → lock the main path. Put unmatched payouts and open disputes on the exception lane. Tag owners. Do not mark a rec node done without evidence. Do not invent amounts.',
    },
  },
  {
    id: 'finance-dispute-lifecycle', type: 'lifecycle', proof: 'dispute',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['chargeback', 16], ['refund vs dispute', 16], ['dispute open', 14], ['needs_response', 13], ['credit memo', 12], ['write-off', 12]],
    en: {
      title: 'Finance dispute lifecycle', question: 'If commerce refunded it, is the money actually done?',
      summary: 'A state model that separates Shopify refund, Stripe dispute waits, recoverable books catch-up, and terminal win or write-off.',
      useWhen: 'Chargeback week, CX saying “refunded so we are fine,” or QBO still showing income.',
      avoidWhen: 'The audience needs the close checklist or a gross-to-net walk for the whole period.',
      include: ['captured start', 'non-terminal waits', 'books catch-up as recoverable failure', 'won and lost terminals'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin lifecycle mode for this refund or dispute. Keep Shopify refunded as a non-terminal step when Stripe still has an open dispute. Model QBO still showing income as a recoverable failure with a real transition back after a credit memo. Won and lost/write-off are terminals. Do not invent amounts or evidence due dates.',
    },
  },
  {
    id: 'finance-payout-rec', type: 'dataflow', proof: 'payout-rec',
    presentation: { preset: 'blueprint', motion: 'trace', views: 'recommended' },
    signals: [['payout rec', 18], ['stripe vs bank', 16], ['stripe payout', 15], ['payout does not foot', 16], ['undeposited funds', 13], ['in transit payout', 14]],
    en: {
      title: 'Finance payout rec', question: 'Where did Stripe cash go relative to the bank and QuickBooks?',
      summary: 'A rec-shaped data flow: captured charges, netted fees, payouts, in-transit, bank credits, books, and residual.',
      useWhen: 'Month-end payout rec, Stripe dashboard cash ≠ bank, or a clearing account that will not tie.',
      avoidWhen: 'The question is why Shopify sales ≠ P&L, or the close checklist order.',
      include: ['fees netted in payout', 'timing vs unexplained residual', 'bank then books', 'no invented residual'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode for Stripe payout vs bank vs QuickBooks. Separate timing (pending / in transit) from unexplained residual. Label fees as netted inside the payout. Do not invent a residual; if totals are unknown, omit amounts and keep the topology. Never mark the rec green unless the user supplied a zero difference.',
    },
  },
  {
    id: 'finance-customer-ar', type: 'architecture', proof: 'customer-ar',
    presentation: { preset: 'classic', motion: 'static', views: 'optional' },
    signals: [['who owes us', 16], ['sales receipt vs invoice', 16], ['wholesale ar', 15], ['no accounts receivable', 14], ['shopify crm vs qbo', 14], ['dunning vs books', 12]],
    en: {
      title: 'Finance customer and AR', question: 'Who is allowed to say this customer owes us?',
      summary: 'A map of Shopify CRM, Stripe customer, and QuickBooks customer with an explicit DTC vs wholesale AR rule.',
      useWhen: 'Wholesale just launched, three customer IDs disagree, or someone is aging a cash-and-carry brand.',
      avoidWhen: 'The audience needs a cash forecast or a payout rec.',
      include: ['three identity systems', 'DTC sales-receipt rule', 'wholesale invoice rule', 'CRM is not cash'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin architecture mode to show customer identity across Shopify, Stripe, and QuickBooks. State which system may claim AR. If DTC is sales receipts, say QuickBooks has no AR. If wholesale is Net 30, put aging on the QBO invoice. Do not treat Shopify CRM as cash. Do not invent balances.',
    },
  },
  {
    id: 'finance-cash-runway', type: 'dataflow', proof: 'cash-runway',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['make payroll', 16], ['cash to a date', 16], ['13-week cash', 14], ['opening cash tied', 15], ['pending stripe payout', 14], ['runway this friday', 13]],
    en: {
      title: 'Finance cash to a date', question: 'Can we make payroll, and what inflows are actually named?',
      summary: 'A cash walk from a tied bank opening through in-transit payouts and known outflows, with user-stated items labelled.',
      useWhen: 'Payroll Friday, runway to a date, or a founder asking whether next week’s Shopify sales count.',
      avoidWhen: 'The audience needs the P&L walk or the close checklist.',
      include: ['tied opening or explicit gap', 'named in-transit payouts', 'known outflows', 'no invented next-week sales'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode for cash to a named date. Opening cash is red until tied to a bank rec, or the user accepts the gap. Inflows need a payout id, invoice id, or user-stated tag. Do not add next-week Shopify sales without an order or payout basis. Do not invent amounts.',
    },
  },
  {
    id: 'system-overview', type: 'architecture', proof: 'money-map',
    presentation: { preset: 'classic', motion: 'static', views: 'optional' },
    signals: [['system overview', 12], ['architecture', 10], ['components', 6], ['services', 4], ['repository', 5], ['trust boundary', 8]],
    en: {
      title: 'System overview', question: 'What exists, who owns it, and how is it connected?',
      summary: 'A bounded map of core components, external dependencies, primary paths, and trust boundaries.',
      useWhen: 'Onboarding, design reviews, repository orientation, or explaining a service landscape.',
      avoidWhen: 'The audience needs exact call order, state transitions, or row-level data lineage.',
      include: ['8–12 core components', 'one primary path', 'external dependencies', 'trust boundaries'],
      prompt: 'Analyze this repository, then use Mosofin to create a high-level architecture diagram. Show 8–12 core runtime components, one primary request or data path, external dependencies, ownership or trust boundaries, and put supporting detail in cards instead of adding more edges.',
    },
  },
  {
    id: 'deployment-ownership', type: 'architecture', proof: 'customer-ar',
    presentation: { preset: 'blueprint', motion: 'trace', views: 'recommended' },
    signals: [['deployment topology', 14], ['region', 7], ['vpc', 9], ['cluster', 6], ['availability zone', 8], ['ownership', 7], ['cloud deployment', 12]],
    en: {
      title: 'Deployment ownership', question: 'Where does each workload run, and what crosses a boundary?',
      summary: 'A deployment-focused map of regions, networks, clusters, workloads, stores, and cross-boundary mechanisms.',
      useWhen: 'Cloud reviews, production readiness, multi-region planning, or infrastructure ownership handoffs.',
      avoidWhen: 'Deployment facts are unknown or the real question is application behavior rather than placement.',
      include: ['regions and networks', 'workload ownership', 'stateful services', 'named boundary crossings'],
      prompt: 'Use Mosofin to draw the production deployment topology. Group resources by region, network, cluster, and owner; show workloads and stateful services; label every cross-boundary mechanism. Do not invent deployment facts—mark unknown areas explicitly. If the user wants a fail-closed deployment review, ask before setting meta.engineering_profile to deployment-ownership; otherwise leave the engineering profile unset.',
    },
  },
  {
    id: 'agent-tool-call', type: 'workflow', proof: 'close',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['agent tool call', 16], ['tool call', 12], ['approval gate', 10], ['human in the loop', 9], ['mcp', 7], ['planner', 6], ['agent loop', 10]],
    en: {
      title: 'Agent tool-call loop', question: 'How does an agent plan, get permission, act, recover, and report?',
      summary: 'A lane-based agent loop with policy gates, tool execution, exception recovery, evidence, and final response.',
      useWhen: 'Explaining agent runtimes, MCP/tool orchestration, approvals, retries, or observability.',
      avoidWhen: 'The goal is only to show static agent components or exact API message timing.',
      include: ['request and planning', 'policy or approval gate', 'tool execution', 'exception and evidence paths'],
      prompt: 'Use Mosofin workflow mode to explain this agent tool-call loop. Separate user surface, agent runtime, policy boundary, exception handling, tool execution, and observability into lanes. Make the successful path primary and show approval, retry, blocked, and evidence paths explicitly.',
    },
  },
  {
    id: 'delivery-workflow', type: 'workflow', proof: 'close',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['ci/cd', 14], ['release workflow', 14], ['deployment pipeline', 11], ['pull request', 7], ['staging', 7], ['rollback', 8]],
    en: {
      title: 'Delivery workflow', question: 'How does a change move safely from commit to production?',
      summary: 'A delivery flow with build, checks, environments, approvals, smoke tests, rollback, and ownership lanes.',
      useWhen: 'CI/CD design, release reviews, deployment governance, or onboarding developers to delivery.',
      avoidWhen: 'The question is where infrastructure runs or what states a deployment object can occupy.',
      include: ['trigger and build', 'blocking checks', 'approval and environments', 'rollback and verification'],
      prompt: 'Use Mosofin workflow mode to draw this delivery process from commit to production. Separate developer, CI, approval, environment, and exception lanes; mark blocking checks, smoke tests, ownership, and the rollback path. Keep one unmistakable happy path.',
    },
  },
  {
    id: 'incident-runbook', type: 'workflow', proof: 'close',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['incident response', 15], ['runbook', 12], ['outage', 9], ['triage', 8], ['mitigation', 8], ['escalation', 7]],
    en: {
      title: 'Incident runbook', question: 'How do responders detect, triage, mitigate, verify, and escalate?',
      summary: 'An operational workflow that separates signals, responders, mitigation, communications, and recovery proof.',
      useWhen: 'Incident playbooks, on-call handoffs, reliability reviews, and tabletop exercises.',
      avoidWhen: 'The audience needs live metrics or a post-incident component topology instead of response actions.',
      include: ['detection signal', 'triage owner', 'mitigation and rollback', 'verification and communication'],
      prompt: 'Use Mosofin workflow mode to turn this incident runbook into responder lanes. Show detection, triage, mitigation, escalation, communication, rollback, and recovery verification. Separate decision gates from actions and make missing ownership visible.',
    },
  },
  {
    id: 'api-request', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['api request', 14], ['request response', 12], ['call chain', 11], ['cache miss', 13], ['jwt', 8], ['who calls whom', 12]],
    en: {
      title: 'API request chain', question: 'Who calls whom, in what order, and what returns?',
      summary: 'A time-ordered request path with authentication, cache fallback, persistence, return traffic, and async trace.',
      useWhen: 'API documentation, debugging request latency, auth reviews, or explaining cache fallback.',
      avoidWhen: 'Order is unimportant and the audience only needs the stable service topology.',
      include: ['callers and callees', 'request and return messages', 'fallback or error path', 'async side effects'],
      prompt: 'Use Mosofin sequence mode to show this request from caller to final response. Include authentication, cache hit or miss, persistence fallback, return messages, and asynchronous trace or event emission. Keep message labels short and order unambiguous.',
    },
  },
  {
    id: 'async-roundtrip', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['async roundtrip', 14], ['webhook', 10], ['callback', 10], ['acknowledgement', 8], ['timeout', 7], ['retry message', 8], ['webhook', 10]],
    en: {
      title: 'Async roundtrip', question: 'What happens after the initial request returns?',
      summary: 'A sequence view of enqueue, acknowledgement, background work, callbacks, retries, timeout, and final consistency.',
      useWhen: 'Webhooks, jobs, queues, payment callbacks, eventual consistency, or async API contracts.',
      avoidWhen: 'The primary question is topic topology and consumer ownership rather than time order.',
      include: ['initial acknowledgement', 'queue or scheduler', 'background work', 'callback, retry, and timeout'],
      prompt: 'Use Mosofin sequence mode to explain this asynchronous roundtrip. Show the initial acknowledgement, enqueue or scheduling step, background processing, callback or polling, retry and timeout behavior, and the point where the caller can observe final consistency.',
    },
  },
  {
    id: 'data-lineage', type: 'dataflow', proof: 'revenue-walk',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['data lineage', 15], ['etl', 12], ['warehouse', 9], ['pii', 11], ['governance', 9], ['analytics pipeline', 12]],
    en: {
      title: 'Data lineage', question: 'Where does data come from, how does it change, and who consumes it?',
      summary: 'A governed path from sources through consent, transforms, sensitive stores, warehouse, and consumers.',
      useWhen: 'Analytics architecture, ETL/ELT review, PII assessment, warehouse design, or model feature lineage.',
      avoidWhen: 'The audience needs request timing or operational task ownership rather than data assets.',
      include: ['sources and assets', 'transform stages', 'classification or consent', 'stores and consumers'],
      prompt: 'Use Mosofin dataflow mode to map this data lineage. Name every data asset and transform, show consent or classification boundaries, distinguish streaming from batch paths, and identify stores plus downstream consumers. Do not use unlabeled flows.',
    },
  },
  {
    id: 'event-stream', type: 'dataflow', proof: 'payout-rec',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['event stream', 15], ['kafka topology', 14], ['topic', 8], ['consumer group', 11], ['dead letter', 10], ['dlq', 10]],
    en: {
      title: 'Event-stream topology', question: 'Which events move through which topics, processors, groups, and failure paths?',
      summary: 'A stream map of producers, topics, ordered processors, consumer groups, state, replay, and DLQ.',
      useWhen: 'Kafka/event-platform design, stream processing reviews, ownership, replay, and failure handling.',
      avoidWhen: 'Topic names, consumer groups, and delivery semantics are not known—use a generic workflow instead.',
      include: ['producers and event names', 'topics and ordering', 'processors and consumer groups', 'state, replay, and DLQ'],
      prompt: 'Use Mosofin dataflow mode to draw this event-stream topology. Name producers, events, topics, ordered processors, consumer groups, state stores, replay paths, and the DLQ. Show ownership and delivery semantics only when supported by evidence.',
    },
  },
  {
    id: 'object-lifecycle', type: 'lifecycle', proof: 'dispute',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['state machine', 15], ['object lifecycle', 14], ['status transition', 11], ['terminal state', 9], ['retry state', 8]],
    en: {
      title: 'Object lifecycle', question: 'Which states exist, what events move between them, and how does it end?',
      summary: 'A state model with active work, waits, retries, cancellation, failure, and explicit terminal outcomes.',
      useWhen: 'Tasks, orders, tickets, subscriptions, jobs, agent runs, or any durable object with status.',
      avoidWhen: 'The object has no durable state and the real question is participant interaction over time.',
      include: ['start and active states', 'event-labelled transitions', 'wait and retry states', 'all terminal outcomes'],
      prompt: 'Use Mosofin lifecycle mode to model this object. Separate main progress, waiting or interruption states, and terminal outcomes. Label transitions with events, include retry, cancellation, timeout, success, and failure where real, and never hide an ending.',
    },
  },
  {
    id: 'deployment-lifecycle', type: 'lifecycle', proof: 'dispute',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['deployment lifecycle', 15], ['release state', 10], ['promotion state', 9], ['approval status', 8], ['rollback state', 10]],
    en: {
      title: 'Deployment lifecycle', question: 'What state is a release in, and what can happen next?',
      summary: 'A deployment state model covering queued, building, verifying, approval, promotion, rollback, and terminal outcomes.',
      useWhen: 'Release controllers, GitOps reconciliation, environment promotion, or deployment status APIs.',
      avoidWhen: 'The question is the human/CI sequence of delivery actions rather than the deployment object state.',
      include: ['queued and running states', 'verification and approval', 'promotion and rollback', 'success, failure, cancellation'],
      prompt: 'Use Mosofin lifecycle mode to model the deployment object. Show queued, building, verifying, waiting for approval, promoting, rolling back, and every terminal outcome. Label the events and guards that permit each transition.',
    },
  }];

// Every recipe links to one verified finance proof in the gallery (docs/gallery). Finance recipes
// point at their own Northline Coffee artifact; the generic engineering recipes point at the
// finance proof of the same diagram type, since the gallery is finance-only.
export const SCENARIO_RECIPES = Object.freeze(RAW_RECIPES.map((recipe) => Object.freeze({
  ...recipe,
  presentation: Object.freeze({ ...recipe.presentation }),
  signals: Object.freeze(recipe.signals.map((signal) => Object.freeze(signal.slice()))),
  en: Object.freeze({ ...recipe.en, include: Object.freeze(recipe.en.include.slice()) }),
})));

export function detectGuideLanguage() {
  return 'en';
}

function normalized(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s_]+/g, ' ').trim();
}

function localized(recipe) {
  const copy = recipe.en;
  return {
    id: recipe.id,
    type: recipe.type,
    proof: recipe.proof,
    presentation: { ...recipe.presentation },
    ...copy,
    include: copy.include.slice(),
  };
}

export function listScenarioRecipes() {
  return SCENARIO_RECIPES.map((recipe) => localized(recipe));
}

function scoreRecipe(recipe, query) {
  const text = normalized(query);
  if (!text) return { recipe, score: 0, matched: [] };
  if (text === recipe.id || text === recipe.id.replace(/-/g, ' ')) {
    return { recipe, score: 100, matched: [recipe.id] };
  }
  let score = 0;
  const matched = [];
  for (const [signal, weight] of recipe.signals) {
    if (text.includes(normalized(signal))) {
      score += weight;
      matched.push(signal);
    }
  }
  return { recipe, score, matched };
}

export function recommendScenario(query, options = {}) {
  const lang = 'en';
  const ranked = SCENARIO_RECIPES.map((recipe) => scoreRecipe(recipe, query))
    .sort((left, right) => right.score - left.score || SCENARIO_RECIPES.indexOf(left.recipe) - SCENARIO_RECIPES.indexOf(right.recipe));
  const winner = ranked[0].score > 0 ? ranked[0] : { recipe: SCENARIO_RECIPES[0], score: 0, matched: [] };
  const confidence = winner.score >= 14 ? 'high' : winner.score >= 7 ? 'medium' : 'low';
  return {
    ok: true,
    mode: 'recommendation',
    lang,
    query: String(query || ''),
    confidence,
    matchedSignals: winner.matched.slice(),
    recommendation: localized(winner.recipe),
    alternatives: ranked.filter((entry) => entry.recipe.id !== winner.recipe.id && entry.score > 0)
      .slice(0, 2)
      .map((entry) => ({ ...localized(entry.recipe), score: entry.score })),
  };
}

export function formatScenarioList() {
  const count = SCENARIO_RECIPES.length;
  const heading = `Mosofin scenario recipes (${count})`;
  const intro = 'Choose the question before the diagram type. Run: mosofin guide "your scenario"';
  return [heading, '', intro, '', ...listScenarioRecipes().flatMap((recipe) => [
    `${recipe.id}  [${recipe.type}]  ${recipe.title}`,
    `  ${recipe.question}`])].join('\n');
}

export function formatScenarioRecommendation(result) {
  const recipe = result.recommendation;
  const labels = {
    heading: 'Recommendation', question: 'Question answered', use: 'Use when', avoid: 'Avoid when', include: 'Must include', presentation: 'Presentation', prompt: 'Copy-ready prompt', alternatives: 'Other possible fits', confidence: 'Confidence',
  };
  const lines = [
    `${labels.heading}: ${recipe.title}  [${recipe.type}]`,
    `${labels.confidence}: ${result.confidence}`,
    `${labels.question}: ${recipe.question}`,
    '',
    `${labels.use}: ${recipe.useWhen}`,
    `${labels.avoid}: ${recipe.avoidWhen}`,
    `${labels.include}: ${recipe.include.join('; ')}`,
    `${labels.presentation}: ${recipe.presentation.preset} · ${recipe.presentation.motion} · views ${recipe.presentation.views}`,
    '',
    `${labels.prompt}:`,
    recipe.prompt];
  if (result.alternatives.length) {
    lines.push('', `${labels.alternatives}: ${result.alternatives.map((item) => `${item.title} [${item.type}]`).join(' · ')}`);
  }
  return lines.join('\n');
}

export function publicGuideData() {
  return SCENARIO_RECIPES.map((recipe) => ({
    ...localized(recipe),
    en: recipe.en,
    signals: recipe.signals.map(([signal, weight]) => [signal, weight]),
  }));
}
