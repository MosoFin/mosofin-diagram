const RAW_RECIPES = [
  {
    id: 'business-operating-map', type: 'architecture', proof: 'business-map',
    presentation: { preset: 'classic', motion: 'static', views: 'recommended' },
    signals: [['how the business runs', 18], ['whole business', 17], ['entire business', 17], ['business diagram', 16], ['operating map', 16], ['our stack', 14], ['software we use', 15], ['all our systems', 15], ['tech stack', 13], ['supply chain crm', 15], ['crm erp', 13], ['understand my business', 16], ['outline my business', 16], ['map my business', 17], ['业务全景', 17], ['整个业务', 16], ['业务运转', 16], ['我们的系统', 14], ['软件清单', 13], ['供应链 crm', 14]],
    en: {
      title: 'Business operating map', question: 'How does the whole business run, and which system owns each part of it?',
      summary: 'One bounded map of every domain the business operates — demand, supply, fulfilment, money, people, books — with the system of record named on each node.',
      useWhen: 'Explaining the business to a new hire, an operator, a buyer, or yourself; before choosing what to fix or replace.',
      avoidWhen: 'The question is about one process in order (workflow), one order in time (sequence), or numbers that must foot (finance recipes).',
      include: ['8–12 domains, not 30 apps', 'system of record per domain', 'one primary rail from demand to books', 'shared vs per-entity boundaries'],
      prompt: 'Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin architecture mode to map how the whole business runs. Group by domain (demand/CRM, commerce, supply chain, inventory, fulfilment, payments, spend, payroll, bank, books, data) and name the real tool in each sublabel — at most 12 primary nodes. Draw one primary rail from demand through to the books, mark approval gates, and put shared vs per-entity systems in separate boundaries. Do not invent amounts, volumes, or headcounts.',
    },
    zh: {
      title: '业务全景图', question: '整个业务如何运转，每一块由哪个系统说了算？',
      summary: '用一张有边界的图展示业务的每个领域——需求、供应、履约、资金、人员、账本——并在每个节点标明权威系统。',
      useWhen: '适合向新员工、运营、买方或自己解释业务；也适合在决定改造或替换系统之前使用。',
      avoidWhen: '如果问题是某个流程的顺序（工作流）、某笔订单的时序（时序图），或必须轧平的数字（财务配方），请换其他配方。',
      include: ['8–12 个领域，而不是 30 个应用', '每个领域的权威系统', '一条从需求到账本的主路径', '共享与按主体分离的边界'],
      prompt: '先读 references/business-onboarding.md 和工作区 BUSINESS-BRIEF.md。用 Mosofin 架构模式绘制整个业务如何运转。按领域分组（需求/CRM、电商、供应链、库存、履约、支付、支出、薪酬、银行、账本、数据），在副标题中写出真实工具名称，主节点不超过 12 个。画一条从需求到账本的主路径，标出审批门，并把共享系统与按主体分离的系统放进不同边界。不要编造金额、数量或人数。',
    },
  },
  {
    id: 'business-handoffs', type: 'workflow', proof: 'close',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['who does what', 15], ['handoff', 15], ['handoffs between teams', 17], ['team ownership', 14], ['who owns which step', 16], ['where things fall through', 16], ['process owner', 13], ['职责交接', 16], ['谁负责哪一步', 16], ['团队分工', 14]],
    en: {
      title: 'Business handoffs', question: 'Which team or system owns each step, and where does work change hands?',
      summary: 'Lanes by team or system across one end-to-end process, with every handoff and every exception path named.',
      useWhen: 'Work is dropping between teams, onboarding an operator, or documenting who is accountable for each gate.',
      avoidWhen: 'You need the system map rather than the process (business-operating-map), or numbers that must tie out.',
      include: ['one lane per team or system', 'named handoffs', 'an exception lane', 'the gate that can stop the work'],
      prompt: 'Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin workflow mode to show who owns each step of this process. One lane per team or system, one main path left to right, every handoff labelled with what actually changes hands, and a separate exception lane for the paths that stall or reverse. Do not invent owners or SLAs.',
    },
    zh: {
      title: '业务交接图', question: '每一步由哪个团队或系统负责，工作在哪里易手？',
      summary: '以团队或系统为泳道展示一条端到端流程，标明每一次交接和每条异常路径。',
      useWhen: '适合工作在团队之间掉链子、运营上手，或需要明确每道门责任人时。',
      avoidWhen: '如果需要的是系统全景（业务全景图）或必须轧平的数字，请换其他配方。',
      include: ['每个团队或系统一条泳道', '具名的交接', '一条异常泳道', '能叫停工作的关卡'],
      prompt: '先读 references/business-onboarding.md 和工作区 BUSINESS-BRIEF.md。用 Mosofin 工作流模式展示这条流程中每一步归谁负责。每个团队或系统一条泳道，一条从左到右的主路径，每次交接都标注真实交付物，并用单独的异常泳道表示停滞或回退的路径。不要编造责任人或时限。',
    },
  },
  {
    id: 'business-order-journey', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['one order through every system', 17], ['order journey', 16], ['customer journey systems', 15], ['end to end order', 16], ['what happens when someone buys', 17], ['一笔订单走完全流程', 17], ['下单之后发生什么', 16], ['订单旅程', 15]],
    en: {
      title: 'Order journey across systems', question: 'What happens to one order, in time, across every system it touches?',
      summary: 'One order traced in time from demand through commerce, inventory, fulfilment, payment and into the books.',
      useWhen: 'Explaining the real sequence to a new hire, debugging where an order stalls, or scoping an integration.',
      avoidWhen: 'You need the whole stack at a glance (business-operating-map) or a reconciliation that must foot.',
      include: ['one order, real IDs if known', 'every system it touches', 'the waits and the async steps', 'where it becomes revenue'],
      prompt: 'Read references/business-onboarding.md and the workspace BUSINESS-BRIEF.md. Use Mosofin sequence mode to trace one order in time across every system it touches — demand, commerce, inventory, fulfilment, payments, bank and books. Show the waits and the asynchronous steps as separate messages. Do not invent timestamps or amounts.',
    },
    zh: {
      title: '订单跨系统旅程', question: '一笔订单按时间在它经过的每个系统里发生了什么？',
      summary: '按时间追踪一笔订单，从需求经过电商、库存、履约、支付，直到进入账本。',
      useWhen: '适合向新员工解释真实顺序、排查订单卡在哪里，或评估集成范围。',
      avoidWhen: '如果需要一眼看全整个技术栈（业务全景图）或必须轧平的对账，请换其他配方。',
      include: ['一笔订单，已知则用真实单号', '它经过的每个系统', '等待与异步步骤', '在哪一步成为收入'],
      prompt: '先读 references/business-onboarding.md 和工作区 BUSINESS-BRIEF.md。用 Mosofin 时序模式按时间追踪一笔订单经过的每个系统——需求、电商、库存、履约、支付、银行和账本。把等待和异步步骤画成独立消息。不要编造时间戳或金额。',
    },
  },
  {
    id: 'finance-money-map', type: 'architecture', proof: 'money-map',
    presentation: { preset: 'classic', motion: 'static', views: 'recommended' },
    signals: [['how we make money', 16], ['make money', 14], ['money map', 15], ['source of truth', 14], ['how money reaches the books', 16], ['shopify stripe quickbooks', 14], ['commerce payments ledger', 13], ['quickbooks', 8], ['qbo', 8], ['怎么赚钱', 16], ['钱怎么入账', 16], ['账本归属', 14], ['谁是账本', 13], ['资金地图', 15], ['系统谁说了算', 14]],
    en: {
      title: 'Finance money map', question: 'How does this company make money, and what is source of truth for orders, cash, and books?',
      summary: 'A bounded map of commerce, payments, bank, and ledger with one order-to-cash path and named crossings.',
      useWhen: 'Onboarding a controller, explaining Shopify + Stripe + QuickBooks, or diligence on how cash reaches the books.',
      avoidWhen: 'The audience needs one order’s timestamps, a payout rec that must foot, or month-end task ownership.',
      include: ['8–12 systems', 'one order-to-cash path', 'named boundary crossings', 'one source of truth per fact'],
      prompt: 'Read references/finance-onboarding.md and the workspace FINANCE-BRIEF.md. Use Mosofin architecture mode to map how money reaches the books. Show 8–12 systems (commerce, payments, bank, ledger), one primary order-to-cash path, and label every crossing with the real mechanism. Do not invent amounts. Do not give two systems the same source-of-truth fact. Put tax and gift-card liability on side branches, not on the revenue rail.',
    },
    zh: {
      title: '资金入账地图', question: '这家公司如何赚钱，订单、现金和账本分别以谁为准？',
      summary: '用一张有边界的图展示电商、支付、银行和账本，以及一条订单到入账主路径和具名跨越。',
      useWhen: '适合控制器上手、解释 Shopify + Stripe + QuickBooks，或尽调资金如何入账。',
      avoidWhen: '如果需要一笔订单的时序、必须轧平的打款对账，或月结任务归属，请换其他配方。',
      include: ['8–12 个系统', '一条订单到入账主路径', '具名的边界跨越', '每个事实只有一个真相来源'],
      prompt: '先读 references/finance-onboarding.md 和工作区 FINANCE-BRIEF.md。用 Mosofin 架构模式绘制资金如何入账。展示 8–12 个系统（电商、支付、银行、账本），一条订单到入账主路径，并用真实机制标注每一次跨越。不要编造金额。不要让两个系统争夺同一个事实的真相来源。税务和礼品卡负债放在支路，不要画进收入主轨。',
    },
  },
  {
    id: 'finance-order-path', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['walk one order', 16], ['one order', 14], ['cart to gl', 15], ['paymentintent', 14], ['order to cash sequence', 15], ['charged twice', 12], ['走一笔订单', 16], ['购物车到总账', 15], ['一笔订单时序', 15], ['支付意向', 12], ['重复扣款', 12], ['订单入账时序', 14]],
    en: {
      title: 'Finance order path', question: 'What happened to one order or payout, in time, across commerce, payments, and the books?',
      summary: 'A time-ordered path from checkout through capture, fee netting, payout batch, bank, and the ledger split.',
      useWhen: 'Debugging a break on one order, a double-charge complaint, or explaining why a deposit is a batch.',
      avoidWhen: 'The audience only needs the stable system map, or a period rec that must foot across all payouts.',
      include: ['real IDs when known', 'capture and returns', 'fee gap', 'payout then bank then books'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin sequence mode to walk one real order from cart to GL. Keep Shopify, Stripe, bank, and QuickBooks as participants. Show capture, fee netting, payout batching, and the ledger split. Use real IDs when the user supplied them. Do not invent amounts; omit or tag unknown. Keep the fee gap visible without turning it into the only path.',
    },
    zh: {
      title: '一笔订单入账', question: '一笔订单或打款在电商、支付和账本里按时间发生了什么？',
      summary: '按时间展示结账、捕获、手续费轧差、打款批次、银行入账和总账拆分。',
      useWhen: '适合排查单笔差异、重复扣款投诉，或解释为什么银行入账是一批而不是一单。',
      avoidWhen: '如果只需稳定系统地图，或要对期间全部打款轧平，请换资金地图或打款对账。',
      include: ['已知就写真实 ID', '捕获与退回', '手续费缺口', '打款到银行再到账本'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 时序模式走一笔真实订单：从购物车到总账。参与者保持 Shopify、Stripe、银行和 QuickBooks。展示捕获、手续费轧差、打款批次和总账拆分。用户给了 ID 就写真实 ID。不要编造金额，未知就省略或标记 unknown。让手续费缺口可见，但不要盖过主路径。',
    },
  },
  {
    id: 'finance-revenue-walk', type: 'dataflow', proof: 'revenue-walk',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['shopify revenue is not qbo', 18], ['dashboards disagree', 16], ['gross to net', 15], ['shopify vs quickbooks', 16], ['recognized revenue walk', 14], ['gift card liability', 12], ['收入对不上', 18], ['毛额到净额', 15], ['看板数字不一致', 16], ['shopify 不是 qbo', 16], ['确认收入', 12], ['礼品卡负债', 12]],
    en: {
      title: 'Finance revenue walk', question: 'Why don’t Shopify, Stripe, and QuickBooks show the same revenue?',
      summary: 'A left-to-right walk from gross sales through discounts, returns, tax, gift cards, fees, and recognized income.',
      useWhen: 'Founder and CFO disagree on “the number,” or Shopify sales do not match the P&L.',
      avoidWhen: 'The question is one order’s timestamps, Stripe payout vs bank, or a close runbook.',
      include: ['gross to contra', 'tax and gift cards as not-income', 'fees as expense not contra', 'landing on the books'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode to walk gross commerce sales to recognized QuickBooks income. Put discounts and returns on the commerce rail; style tax and gift cards as security / not-income; treat processor fees as an expense branch, not a contra to sales. Do not invent totals. If a number is missing, omit it or tag unknown. Extra questions become at most five guided views.',
    },
    zh: {
      title: '收入对账走步', question: '为什么 Shopify、Stripe 和 QuickBooks 的收入对不上？',
      summary: '从毛销售走折扣、退货、税、礼品卡、手续费，再到账本确认收入。',
      useWhen: '适合创始人和 CFO 对“那个数字”争执，或 Shopify 销售额对不上损益表。',
      avoidWhen: '如果问题是单笔时序、Stripe 打款对银行，或月结 Runbook，请换其他配方。',
      include: ['毛额到抵减', '税和礼品卡不是收入', '手续费是费用不是抵减', '落到账本'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 数据流模式把电商毛销售走到 QuickBooks 确认收入。折扣和退货留在电商轨；税和礼品卡标成受限/非收入；支付手续费走费用支路，不要当成销售收入抵减。不要编造合计。缺数字就省略或标记 unknown。额外问题最多做成五个引导视图。',
    },
  },
  {
    id: 'finance-close', type: 'workflow', proof: 'close',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['month-end close', 18], ['close the books', 16], ['period lock', 14], ['close calendar', 14], ['payout rec then sales rec', 13], ['soft close', 12], ['月结', 18], ['关账', 16], ['期间锁定', 14], ['结账日历', 14], ['先打款对账', 13], ['关账清单', 14]],
    en: {
      title: 'Finance month-end close', question: 'What is month-end, in order, and who owns each gate?',
      summary: 'A close runbook with commerce, cash, books, and review lanes, plus an exception lane for unmatched items.',
      useWhen: 'Explaining close to a founder, sharing ownership with a bookkeeper, or showing what blocks period lock.',
      avoidWhen: 'The audience needs a payout rec that foots, or a state machine for one dispute.',
      include: ['cutoff', 'payout and sales recs', 'exception lane', 'review then lock'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin workflow mode for this period’s close. Separate Shopify, Stripe/bank, QuickBooks, review, and exception lanes. Make cutoff → payout rec → sales rec → tax tie → review → lock the main path. Put unmatched payouts and open disputes on the exception lane. Tag owners. Do not mark a rec node done without evidence. Do not invent amounts.',
    },
    zh: {
      title: '月结关账', question: '月末关账按什么顺序，每道门归谁？',
      summary: '用电商、现金、账本、复核泳道加异常泳道，画出关账 Runbook。',
      useWhen: '适合向创始人解释关账、和记账员分担职责，或展示什么会挡住期间锁定。',
      avoidWhen: '如果需要轧平的打款对账，或单笔争议的状态机，请换其他配方。',
      include: ['截单', '打款与销售对账', '异常泳道', '复核后锁定'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 工作流模式画本期关账。拆分 Shopify、Stripe/银行、QuickBooks、复核和异常泳道。主路径保持截单 → 打款对账 → 销售对账 → 税对平 → 复核 → 锁定。未匹配打款和未决争议放异常泳道。标注负责人。没有证据不要把对账节点标成完成。不要编造金额。',
    },
  },
  {
    id: 'finance-dispute-lifecycle', type: 'lifecycle', proof: 'dispute',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['chargeback', 16], ['refund vs dispute', 16], ['dispute open', 14], ['needs_response', 13], ['credit memo', 12], ['write-off', 12], ['拒付', 16], ['退款还是争议', 16], ['争议未决', 14], ['贷项通知单', 12], ['核销', 12], ['退款未入账', 14]],
    en: {
      title: 'Finance dispute lifecycle', question: 'If commerce refunded it, is the money actually done?',
      summary: 'A state model that separates Shopify refund, Stripe dispute waits, recoverable books catch-up, and terminal win or write-off.',
      useWhen: 'Chargeback week, CX saying “refunded so we are fine,” or QBO still showing income.',
      avoidWhen: 'The audience needs the close checklist or a gross-to-net walk for the whole period.',
      include: ['captured start', 'non-terminal waits', 'books catch-up as recoverable failure', 'won and lost terminals'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin lifecycle mode for this refund or dispute. Keep Shopify refunded as a non-terminal step when Stripe still has an open dispute. Model QBO still showing income as a recoverable failure with a real transition back after a credit memo. Won and lost/write-off are terminals. Do not invent amounts or evidence due dates.',
    },
    zh: {
      title: '退款与拒付生命周期', question: '电商已退款，钱是否真的结束了？',
      summary: '区分 Shopify 退款、Stripe 争议等待、可恢复的账本补记，以及胜诉或核销终态。',
      useWhen: '适合拒付周、客服说“退过了所以没事”，或 QBO 仍挂着收入。',
      avoidWhen: '如果需要关账清单或整段期间的毛额到净额走步，请换其他配方。',
      include: ['已捕获起点', '非终态等待', '账本补记作为可恢复失败', '胜诉与败诉终态'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 生命周期模式画这笔退款或争议。当 Stripe 仍有未决争议时，Shopify 已退款不要画成终态。把 QBO 仍挂收入建成可恢复失败，贷项通知单后回到活动态。胜诉和败诉/核销才是终态。不要编造金额或举证截止日期。',
    },
  },
  {
    id: 'finance-payout-rec', type: 'dataflow', proof: 'payout-rec',
    presentation: { preset: 'blueprint', motion: 'trace', views: 'recommended' },
    signals: [['payout rec', 18], ['stripe vs bank', 16], ['stripe payout', 15], ['payout does not foot', 16], ['undeposited funds', 13], ['in transit payout', 14], ['打款对账', 18], ['stripe 对银行', 16], ['stripe 打款', 15], ['打款轧不平', 16], ['在途打款', 14], ['未存款', 12]],
    en: {
      title: 'Finance payout rec', question: 'Where did Stripe cash go relative to the bank and QuickBooks?',
      summary: 'A rec-shaped data flow: captured charges, netted fees, payouts, in-transit, bank credits, books, and residual.',
      useWhen: 'Month-end payout rec, Stripe dashboard cash ≠ bank, or a clearing account that will not tie.',
      avoidWhen: 'The question is why Shopify sales ≠ P&L, or the close checklist order.',
      include: ['fees netted in payout', 'timing vs unexplained residual', 'bank then books', 'no invented residual'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode for Stripe payout vs bank vs QuickBooks. Separate timing (pending / in transit) from unexplained residual. Label fees as netted inside the payout. Do not invent a residual; if totals are unknown, omit amounts and keep the topology. Never mark the rec green unless the user supplied a zero difference.',
    },
    zh: {
      title: '打款对账', question: '相对银行和 QuickBooks，Stripe 的现金去哪了？',
      summary: '对账型数据流：已捕获、轧差手续费、打款、在途、银行贷记、账本和残差。',
      useWhen: '适合月末打款对账、Stripe 看板现金对不上银行，或清分科目轧不平。',
      avoidWhen: '如果问题是 Shopify 销售对不上损益表，或关账清单顺序，请换收入走步或月结。',
      include: ['手续费在打款内轧差', '时间差 vs 无法解释残差', '先银行再账本', '不编造残差'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 数据流模式画 Stripe 打款对银行对 QuickBooks。把时间差（在途）和无法解释残差分开。手续费标成打款内轧差。不要编造残差；合计未知就省略金额、保留拓扑。用户没有给出零差异时，不要把对账标成绿色。',
    },
  },
  {
    id: 'finance-customer-ar', type: 'architecture', proof: 'customer-ar',
    presentation: { preset: 'classic', motion: 'static', views: 'optional' },
    signals: [['who owes us', 16], ['sales receipt vs invoice', 16], ['wholesale ar', 15], ['no accounts receivable', 14], ['shopify crm vs qbo', 14], ['dunning vs books', 12], ['谁欠我们', 16], ['销售收据还是发票', 16], ['批发应收', 15], ['没有应收账款', 14], ['客户身份', 13], ['催收不是账本', 12]],
    en: {
      title: 'Finance customer and AR', question: 'Who is allowed to say this customer owes us?',
      summary: 'A map of Shopify CRM, Stripe customer, and QuickBooks customer with an explicit DTC vs wholesale AR rule.',
      useWhen: 'Wholesale just launched, three customer IDs disagree, or someone is aging a cash-and-carry brand.',
      avoidWhen: 'The audience needs a cash forecast or a payout rec.',
      include: ['three identity systems', 'DTC sales-receipt rule', 'wholesale invoice rule', 'CRM is not cash'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin architecture mode to show customer identity across Shopify, Stripe, and QuickBooks. State which system may claim AR. If DTC is sales receipts, say QuickBooks has no AR. If wholesale is Net 30, put aging on the QBO invoice. Do not treat Shopify CRM as cash. Do not invent balances.',
    },
    zh: {
      title: '客户与应收', question: '谁有资格说这个客户欠我们钱？',
      summary: '画出 Shopify CRM、Stripe 客户和 QuickBooks 客户，并写明 DTC 与批发应收规则。',
      useWhen: '适合刚开通批发、三个客户 ID 对不上，或有人在给现结品牌做账龄。',
      avoidWhen: '如果需要现金流预测或打款对账，请换其他配方。',
      include: ['三套身份系统', 'DTC 销售收据规则', '批发发票规则', 'CRM 不是现金'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 架构模式展示 Shopify、Stripe 和 QuickBooks 上的客户身份。写明哪套系统可以主张应收。如果 DTC 走销售收据，就写明 QuickBooks 没有应收。如果批发是 Net 30，账龄放在 QBO 发票上。不要把 Shopify CRM 当成现金。不要编造余额。',
    },
  },
  {
    id: 'finance-cash-runway', type: 'dataflow', proof: 'cash-runway',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['make payroll', 16], ['cash to a date', 16], ['13-week cash', 14], ['opening cash tied', 15], ['pending stripe payout', 14], ['runway this friday', 13], ['能不能发工资', 16], ['现金撑到哪天', 16], ['十三周现金', 14], ['期初现金已对平', 15], ['在途 stripe', 14], ['发薪日现金', 14]],
    en: {
      title: 'Finance cash to a date', question: 'Can we make payroll, and what inflows are actually named?',
      summary: 'A cash walk from a tied bank opening through in-transit payouts and known outflows, with user-stated items labelled.',
      useWhen: 'Payroll Friday, runway to a date, or a founder asking whether next week’s Shopify sales count.',
      avoidWhen: 'The audience needs the P&L walk or the close checklist.',
      include: ['tied opening or explicit gap', 'named in-transit payouts', 'known outflows', 'no invented next-week sales'],
      prompt: 'Read references/finance-onboarding.md and FINANCE-BRIEF.md. Use Mosofin dataflow mode for cash to a named date. Opening cash is red until tied to a bank rec, or the user accepts the gap. Inflows need a payout id, invoice id, or user-stated tag. Do not add next-week Shopify sales without an order or payout basis. Do not invent amounts.',
    },
    zh: {
      title: '现金撑到哪天', question: '发得出工资吗，哪些流入是具名的？',
      summary: '从已对平的银行期初，走到在途打款和已知流出，用户口述项必须打标。',
      useWhen: '适合发薪周五、现金撑到某日，或创始人问下周 Shopify 销售能不能算进来。',
      avoidWhen: '如果需要损益走步或关账清单，请换其他配方。',
      include: ['已对平期初或明示缺口', '具名在途打款', '已知流出', '不编造下周销售'],
      prompt: '先读 references/finance-onboarding.md 和 FINANCE-BRIEF.md。用 Mosofin 数据流模式画现金撑到一个具名日期。期初现金在银行对账轧平前保持红色，除非用户接受缺口。流入必须有打款 ID、发票号或 user-stated 标记。没有订单或打款依据时，不要加入下周 Shopify 销售。不要编造金额。',
    },
  },
  {
    id: 'system-overview', type: 'architecture', proof: 'money-map',
    presentation: { preset: 'classic', motion: 'static', views: 'optional' },
    signals: [['system overview', 12], ['architecture', 10], ['components', 6], ['services', 4], ['repository', 5], ['trust boundary', 8], ['架构', 10], ['系统总览', 12], ['组件', 6], ['服务', 4], ['仓库', 5], ['信任边界', 8]],
    en: {
      title: 'System overview', question: 'What exists, who owns it, and how is it connected?',
      summary: 'A bounded map of core components, external dependencies, primary paths, and trust boundaries.',
      useWhen: 'Onboarding, design reviews, repository orientation, or explaining a service landscape.',
      avoidWhen: 'The audience needs exact call order, state transitions, or row-level data lineage.',
      include: ['8–12 core components', 'one primary path', 'external dependencies', 'trust boundaries'],
      prompt: 'Analyze this repository, then use Mosofin to create a high-level architecture diagram. Show 8–12 core runtime components, one primary request or data path, external dependencies, ownership or trust boundaries, and put supporting detail in cards instead of adding more edges.',
    },
    zh: {
      title: '系统总览', question: '系统里有什么、归谁负责、彼此如何连接？',
      summary: '用一张有边界的图展示核心组件、外部依赖、主路径和信任边界。',
      useWhen: '适合新人上手、方案评审、仓库梳理和服务全景说明。',
      avoidWhen: '如果重点是精确调用顺序、状态流转或字段级血缘，请换其他配方。',
      include: ['8–12 个核心组件', '一条主路径', '外部依赖', '归属或信任边界'],
      prompt: '分析这个仓库，然后用 Mosofin 生成高层系统架构图。展示 8–12 个核心运行时组件、一条主要请求或数据路径、外部依赖、归属或信任边界；支持性细节放进卡片，不要继续堆连线。',
    },
  },
  {
    id: 'deployment-ownership', type: 'architecture', proof: 'customer-ar',
    presentation: { preset: 'blueprint', motion: 'trace', views: 'recommended' },
    signals: [['deployment topology', 14], ['region', 7], ['vpc', 9], ['cluster', 6], ['availability zone', 8], ['ownership', 7], ['cloud deployment', 12], ['部署拓扑', 14], ['区域', 6], ['集群', 6], ['可用区', 8], ['资源归属', 9], ['跨区', 8]],
    en: {
      title: 'Deployment ownership', question: 'Where does each workload run, and what crosses a boundary?',
      summary: 'A deployment-focused map of regions, networks, clusters, workloads, stores, and cross-boundary mechanisms.',
      useWhen: 'Cloud reviews, production readiness, multi-region planning, or infrastructure ownership handoffs.',
      avoidWhen: 'Deployment facts are unknown or the real question is application behavior rather than placement.',
      include: ['regions and networks', 'workload ownership', 'stateful services', 'named boundary crossings'],
      prompt: 'Use Mosofin to draw the production deployment topology. Group resources by region, network, cluster, and owner; show workloads and stateful services; label every cross-boundary mechanism. Do not invent deployment facts—mark unknown areas explicitly. If the user wants a fail-closed deployment review, ask before setting meta.engineering_profile to deployment-ownership; otherwise leave the engineering profile unset.',
    },
    zh: {
      title: '部署与归属', question: '每个工作负载运行在哪里，哪些连接跨越了边界？',
      summary: '围绕 Region、网络、集群、工作负载、存储和跨边界机制组织部署图。',
      useWhen: '适合云上评审、生产就绪、多区域规划和基础设施交接。',
      avoidWhen: '部署事实不清楚，或真正问题是应用行为而不是资源位置时不要使用。',
      include: ['区域与网络', '工作负载归属', '有状态服务', '明确的跨边界机制'],
      prompt: '用 Mosofin 绘制生产部署拓扑。按区域、网络、集群和负责人分组，展示工作负载与有状态服务，并标注每一种跨边界机制。不要编造部署事实，不确定的区域要明确标出。如果用户需要失败即阻断的部署评审，先征得确认，再把 meta.engineering_profile 设为 deployment-ownership；否则不要启用工程画像。',
    },
  },
  {
    id: 'agent-tool-call', type: 'workflow', proof: 'close',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['agent tool call', 16], ['tool call', 12], ['approval gate', 10], ['human in the loop', 9], ['mcp', 7], ['planner', 6], ['agent loop', 10], ['智能体工具调用', 16], ['工具调用', 12], ['审批门', 10], ['人在回路', 9], ['规划器', 6], ['智能体循环', 10]],
    en: {
      title: 'Agent tool-call loop', question: 'How does an agent plan, get permission, act, recover, and report?',
      summary: 'A lane-based agent loop with policy gates, tool execution, exception recovery, evidence, and final response.',
      useWhen: 'Explaining agent runtimes, MCP/tool orchestration, approvals, retries, or observability.',
      avoidWhen: 'The goal is only to show static agent components or exact API message timing.',
      include: ['request and planning', 'policy or approval gate', 'tool execution', 'exception and evidence paths'],
      prompt: 'Use Mosofin workflow mode to explain this agent tool-call loop. Separate user surface, agent runtime, policy boundary, exception handling, tool execution, and observability into lanes. Make the successful path primary and show approval, retry, blocked, and evidence paths explicitly.',
    },
    zh: {
      title: '智能体工具调用', question: '智能体如何规划、获批、执行、恢复并汇报？',
      summary: '用泳道表达策略门、工具执行、异常恢复、证据和最终回复。',
      useWhen: '适合解释 Agent Runtime、MCP/工具编排、审批、重试和可观测性。',
      avoidWhen: '如果只想看静态组件，或重点是精确 API 消息时序，请换其他配方。',
      include: ['请求与规划', '策略或审批门', '工具执行', '异常与证据路径'],
      prompt: '用 Mosofin 工作流模式解释这段智能体工具调用。把用户界面、Agent Runtime、策略边界、异常处理、工具执行和可观测性分成泳道；突出成功主路径，并明确展示审批、重试、阻塞和证据路径。',
    },
  },
  {
    id: 'delivery-workflow', type: 'workflow', proof: 'close',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['ci/cd', 14], ['release workflow', 14], ['deployment pipeline', 11], ['pull request', 7], ['staging', 7], ['rollback', 8], ['发布流程', 14], ['流水线', 9], ['上线', 7], ['预发', 7], ['回滚', 8], ['审批发布', 10]],
    en: {
      title: 'Delivery workflow', question: 'How does a change move safely from commit to production?',
      summary: 'A delivery flow with build, checks, environments, approvals, smoke tests, rollback, and ownership lanes.',
      useWhen: 'CI/CD design, release reviews, deployment governance, or onboarding developers to delivery.',
      avoidWhen: 'The question is where infrastructure runs or what states a deployment object can occupy.',
      include: ['trigger and build', 'blocking checks', 'approval and environments', 'rollback and verification'],
      prompt: 'Use Mosofin workflow mode to draw this delivery process from commit to production. Separate developer, CI, approval, environment, and exception lanes; mark blocking checks, smoke tests, ownership, and the rollback path. Keep one unmistakable happy path.',
    },
    zh: {
      title: '研发交付流程', question: '一次变更如何安全地从提交走到生产？',
      summary: '展示构建、检查、环境、审批、冒烟、回滚和负责人泳道。',
      useWhen: '适合 CI/CD 设计、发布评审、部署治理和研发新人上手。',
      avoidWhen: '如果重点是基础设施位置或部署对象的状态集合，请换架构图或生命周期图。',
      include: ['触发与构建', '阻断检查', '审批与环境', '回滚与验证'],
      prompt: '用 Mosofin 工作流模式绘制从代码提交到生产发布的流程。拆分开发者、CI、审批、环境和异常泳道；标出阻断检查、冒烟测试、负责人和回滚路径，并保留一条一眼可见的成功主路径。',
    },
  },
  {
    id: 'incident-runbook', type: 'workflow', proof: 'close',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['incident response', 15], ['runbook', 12], ['outage', 9], ['triage', 8], ['mitigation', 8], ['escalation', 7], ['事故处置', 15], ['故障', 9], ['应急预案', 12], ['排障', 9], ['缓解', 7], ['升级响应', 8]],
    en: {
      title: 'Incident runbook', question: 'How do responders detect, triage, mitigate, verify, and escalate?',
      summary: 'An operational workflow that separates signals, responders, mitigation, communications, and recovery proof.',
      useWhen: 'Incident playbooks, on-call handoffs, reliability reviews, and tabletop exercises.',
      avoidWhen: 'The audience needs live metrics or a post-incident component topology instead of response actions.',
      include: ['detection signal', 'triage owner', 'mitigation and rollback', 'verification and communication'],
      prompt: 'Use Mosofin workflow mode to turn this incident runbook into responder lanes. Show detection, triage, mitigation, escalation, communication, rollback, and recovery verification. Separate decision gates from actions and make missing ownership visible.',
    },
    zh: {
      title: '事故处置 Runbook', question: '响应者如何发现、分诊、缓解、验证并升级？',
      summary: '把信号、响应者、缓解动作、沟通和恢复证据拆成可执行流程。',
      useWhen: '适合故障预案、On-call 交接、稳定性评审和桌面演练。',
      avoidWhen: '如果受众需要实时指标仪表盘或事故后的组件拓扑，而不是响应动作，请换其他视图。',
      include: ['发现信号', '分诊负责人', '缓解与回滚', '恢复验证与沟通'],
      prompt: '用 Mosofin 工作流模式把事故处置预案画成响应者泳道。展示发现、分诊、缓解、升级、沟通、回滚和恢复验证；把决策门与操作分开，并让缺失的负责人清晰可见。',
    },
  },
  {
    id: 'api-request', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['api request', 14], ['request response', 12], ['call chain', 11], ['cache miss', 13], ['jwt', 8], ['who calls whom', 12], ['api 请求', 14], ['请求响应', 12], ['调用链', 11], ['缓存未命中', 13], ['谁调用谁', 12], ['鉴权链路', 9]],
    en: {
      title: 'API request chain', question: 'Who calls whom, in what order, and what returns?',
      summary: 'A time-ordered request path with authentication, cache fallback, persistence, return traffic, and async trace.',
      useWhen: 'API documentation, debugging request latency, auth reviews, or explaining cache fallback.',
      avoidWhen: 'Order is unimportant and the audience only needs the stable service topology.',
      include: ['callers and callees', 'request and return messages', 'fallback or error path', 'async side effects'],
      prompt: 'Use Mosofin sequence mode to show this request from caller to final response. Include authentication, cache hit or miss, persistence fallback, return messages, and asynchronous trace or event emission. Keep message labels short and order unambiguous.',
    },
    zh: {
      title: 'API 请求链', question: '谁调用谁、顺序如何、最终返回什么？',
      summary: '按时间展示鉴权、缓存回退、持久化、返回流量和异步追踪。',
      useWhen: '适合 API 文档、请求耗时排查、鉴权评审和缓存回退说明。',
      avoidWhen: '如果顺序不重要，受众只需要稳定的服务拓扑，请用架构图。',
      include: ['调用方与被调用方', '请求与返回消息', '回退或错误路径', '异步副作用'],
      prompt: '用 Mosofin 时序模式展示从调用方到最终响应的完整请求。包含鉴权、缓存命中或未命中、持久化回退、返回消息，以及异步 Trace 或事件上报；消息标签保持简短，顺序必须明确。',
    },
  },
  {
    id: 'async-roundtrip', type: 'sequence', proof: 'order-path',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['async roundtrip', 14], ['webhook', 10], ['callback', 10], ['acknowledgement', 8], ['timeout', 7], ['retry message', 8], ['异步回调', 14], ['回调', 10], ['确认消息', 8], ['超时', 7], ['消息重试', 9], ['webhook', 10]],
    en: {
      title: 'Async roundtrip', question: 'What happens after the initial request returns?',
      summary: 'A sequence view of enqueue, acknowledgement, background work, callbacks, retries, timeout, and final consistency.',
      useWhen: 'Webhooks, jobs, queues, payment callbacks, eventual consistency, or async API contracts.',
      avoidWhen: 'The primary question is topic topology and consumer ownership rather than time order.',
      include: ['initial acknowledgement', 'queue or scheduler', 'background work', 'callback, retry, and timeout'],
      prompt: 'Use Mosofin sequence mode to explain this asynchronous roundtrip. Show the initial acknowledgement, enqueue or scheduling step, background processing, callback or polling, retry and timeout behavior, and the point where the caller can observe final consistency.',
    },
    zh: {
      title: '异步往返链路', question: '初始请求返回之后，后台还会发生什么？',
      summary: '按时间展示入队、确认、后台处理、回调、重试、超时和最终一致。',
      useWhen: '适合 Webhook、后台任务、队列、支付回调、最终一致和异步 API 契约。',
      avoidWhen: '如果重点是 Topic 拓扑和消费者归属，而不是时间顺序，请用事件数据流配方。',
      include: ['初始确认', '队列或调度器', '后台处理', '回调、重试与超时'],
      prompt: '用 Mosofin 时序模式解释这段异步往返链路。展示初始确认、入队或调度、后台处理、回调或轮询、重试与超时，以及调用方何时能观察到最终一致结果。',
    },
  },
  {
    id: 'data-lineage', type: 'dataflow', proof: 'revenue-walk',
    presentation: { preset: 'classic', motion: 'trace', views: 'recommended' },
    signals: [['data lineage', 15], ['etl', 12], ['warehouse', 9], ['pii', 11], ['governance', 9], ['analytics pipeline', 12], ['数据血缘', 15], ['数据管道', 11], ['数仓', 9], ['治理', 9], ['隐私数据', 10], ['用户同意', 9]],
    en: {
      title: 'Data lineage', question: 'Where does data come from, how does it change, and who consumes it?',
      summary: 'A governed path from sources through consent, transforms, sensitive stores, warehouse, and consumers.',
      useWhen: 'Analytics architecture, ETL/ELT review, PII assessment, warehouse design, or model feature lineage.',
      avoidWhen: 'The audience needs request timing or operational task ownership rather than data assets.',
      include: ['sources and assets', 'transform stages', 'classification or consent', 'stores and consumers'],
      prompt: 'Use Mosofin dataflow mode to map this data lineage. Name every data asset and transform, show consent or classification boundaries, distinguish streaming from batch paths, and identify stores plus downstream consumers. Do not use unlabeled flows.',
    },
    zh: {
      title: '数据血缘', question: '数据从哪里来、如何变化、最终被谁消费？',
      summary: '从来源经过同意、转换、敏感存储、数仓直到消费者的治理路径。',
      useWhen: '适合分析架构、ETL/ELT 评审、PII 评估、数仓设计和特征血缘。',
      avoidWhen: '如果受众需要请求时序或操作负责人，而不是数据资产，请换其他配方。',
      include: ['数据来源与资产', '转换阶段', '分类或同意边界', '存储与消费者'],
      prompt: '用 Mosofin 数据流模式梳理这段数据血缘。为每个数据资产和转换命名，展示用户同意或数据分类边界，区分流式与批处理路径，并标明存储和下游消费者；所有数据流都必须有标签。',
    },
  },
  {
    id: 'event-stream', type: 'dataflow', proof: 'payout-rec',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['event stream', 15], ['kafka topology', 14], ['topic', 8], ['consumer group', 11], ['dead letter', 10], ['dlq', 10], ['事件流', 15], ['kafka 拓扑', 14], ['主题', 7], ['消费者组', 11], ['死信', 10], ['事件地铁图', 12]],
    en: {
      title: 'Event-stream topology', question: 'Which events move through which topics, processors, groups, and failure paths?',
      summary: 'A stream map of producers, topics, ordered processors, consumer groups, state, replay, and DLQ.',
      useWhen: 'Kafka/event-platform design, stream processing reviews, ownership, replay, and failure handling.',
      avoidWhen: 'Topic names, consumer groups, and delivery semantics are not known—use a generic workflow instead.',
      include: ['producers and event names', 'topics and ordering', 'processors and consumer groups', 'state, replay, and DLQ'],
      prompt: 'Use Mosofin dataflow mode to draw this event-stream topology. Name producers, events, topics, ordered processors, consumer groups, state stores, replay paths, and the DLQ. Show ownership and delivery semantics only when supported by evidence.',
    },
    zh: {
      title: '事件流拓扑', question: '哪些事件经过哪些 Topic、处理器、消费者组和失败路径？',
      summary: '展示生产者、Topic、有序处理器、消费者组、状态、重放和 DLQ。',
      useWhen: '适合 Kafka/事件平台设计、流处理评审、归属、重放和失败处理。',
      avoidWhen: '如果 Topic、消费者组和投递语义都不清楚，请先用通用工作流，不要编造事件拓扑。',
      include: ['生产者与事件名', 'Topic 与顺序', '处理器与消费者组', '状态、重放与 DLQ'],
      prompt: '用 Mosofin 数据流模式绘制这段事件流拓扑。命名生产者、事件、Topic、有序处理器、消费者组、状态存储、重放路径和 DLQ；只有在证据充分时才标注归属和投递语义。',
    },
  },
  {
    id: 'object-lifecycle', type: 'lifecycle', proof: 'dispute',
    presentation: { preset: 'classic', motion: 'trace', views: 'optional' },
    signals: [['state machine', 15], ['object lifecycle', 14], ['status transition', 11], ['terminal state', 9], ['retry state', 8], ['状态机', 15], ['生命周期', 13], ['状态流转', 11], ['终态', 9], ['等待态', 8], ['重试状态', 8]],
    en: {
      title: 'Object lifecycle', question: 'Which states exist, what events move between them, and how does it end?',
      summary: 'A state model with active work, waits, retries, cancellation, failure, and explicit terminal outcomes.',
      useWhen: 'Tasks, orders, tickets, subscriptions, jobs, agent runs, or any durable object with status.',
      avoidWhen: 'The object has no durable state and the real question is participant interaction over time.',
      include: ['start and active states', 'event-labelled transitions', 'wait and retry states', 'all terminal outcomes'],
      prompt: 'Use Mosofin lifecycle mode to model this object. Separate main progress, waiting or interruption states, and terminal outcomes. Label transitions with events, include retry, cancellation, timeout, success, and failure where real, and never hide an ending.',
    },
    zh: {
      title: '对象生命周期', question: '有哪些状态、什么事件触发流转、最终如何结束？',
      summary: '展示执行、等待、重试、取消、失败以及明确终态的状态模型。',
      useWhen: '适合任务、订单、工单、订阅、作业、Agent Run 等带持久状态的对象。',
      avoidWhen: '对象没有持久状态，真正问题是参与者随时间的交互时，请使用时序图。',
      include: ['开始与执行态', '带事件的转换', '等待与重试态', '所有终态'],
      prompt: '用 Mosofin 生命周期模式建模这个对象。分开主进度、等待或中断状态和终态；用事件标注转换，并在真实存在时展示重试、取消、超时、成功和失败，不能隐藏任何结束方式。',
    },
  },
  {
    id: 'deployment-lifecycle', type: 'lifecycle', proof: 'dispute',
    presentation: { preset: 'signal-flow', motion: 'trace', views: 'recommended' },
    signals: [['deployment lifecycle', 15], ['release state', 10], ['promotion state', 9], ['approval status', 8], ['rollback state', 10], ['部署生命周期', 15], ['发布状态', 10], ['晋级', 7], ['审批状态', 8], ['回滚状态', 10]],
    en: {
      title: 'Deployment lifecycle', question: 'What state is a release in, and what can happen next?',
      summary: 'A deployment state model covering queued, building, verifying, approval, promotion, rollback, and terminal outcomes.',
      useWhen: 'Release controllers, GitOps reconciliation, environment promotion, or deployment status APIs.',
      avoidWhen: 'The question is the human/CI sequence of delivery actions rather than the deployment object state.',
      include: ['queued and running states', 'verification and approval', 'promotion and rollback', 'success, failure, cancellation'],
      prompt: 'Use Mosofin lifecycle mode to model the deployment object. Show queued, building, verifying, waiting for approval, promoting, rolling back, and every terminal outcome. Label the events and guards that permit each transition.',
    },
    zh: {
      title: '部署生命周期', question: '一次发布当前处于什么状态，下一步可能发生什么？',
      summary: '覆盖排队、构建、验证、审批、晋级、回滚和终态的部署状态模型。',
      useWhen: '适合发布控制器、GitOps 对账、环境晋级和部署状态 API。',
      avoidWhen: '如果重点是人员与 CI 的交付动作顺序，而不是部署对象状态，请用交付工作流。',
      include: ['排队与执行态', '验证与审批', '晋级与回滚', '成功、失败与取消'],
      prompt: '用 Mosofin 生命周期模式建模部署对象。展示排队、构建、验证、等待审批、晋级、回滚以及所有终态，并标注允许每次状态转换的事件和守卫条件。',
    },
  },
];

// Every recipe links to one verified finance proof in the gallery (docs/gallery). Finance recipes
// point at their own Northline Coffee artifact; the generic engineering recipes point at the
// finance proof of the same diagram type, since the gallery is finance-only.
export const SCENARIO_RECIPES = Object.freeze(RAW_RECIPES.map((recipe) => Object.freeze({
  ...recipe,
  presentation: Object.freeze({ ...recipe.presentation }),
  signals: Object.freeze(recipe.signals.map((signal) => Object.freeze(signal.slice()))),
  en: Object.freeze({ ...recipe.en, include: Object.freeze(recipe.en.include.slice()) }),
  zh: Object.freeze({ ...recipe.zh, include: Object.freeze(recipe.zh.include.slice()) }),
})));

export function detectGuideLanguage(value = '') {
  return /[\u3400-\u9fff]/u.test(value) ? 'zh' : 'en';
}

function normalized(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s_]+/g, ' ').trim();
}

function localized(recipe, lang) {
  const copy = recipe[lang === 'zh' ? 'zh' : 'en'];
  return {
    id: recipe.id,
    type: recipe.type,
    proof: recipe.proof,
    presentation: { ...recipe.presentation },
    ...copy,
    include: copy.include.slice(),
  };
}

export function listScenarioRecipes(lang = 'en') {
  return SCENARIO_RECIPES.map((recipe) => localized(recipe, lang));
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
  const lang = options.lang === 'zh' || options.lang === 'en' ? options.lang : detectGuideLanguage(query);
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
    recommendation: localized(winner.recipe, lang),
    alternatives: ranked.filter((entry) => entry.recipe.id !== winner.recipe.id && entry.score > 0)
      .slice(0, 2)
      .map((entry) => ({ ...localized(entry.recipe, lang), score: entry.score })),
  };
}

export function formatScenarioList(lang = 'en') {
  const isZh = lang === 'zh';
  const count = SCENARIO_RECIPES.length;
  const heading = isZh ? `Mosofin 场景配方（${count}）` : `Mosofin scenario recipes (${count})`;
  const intro = isZh
    ? '先选择你要回答的问题，再选择图表类型。可运行：mosofin guide "你的场景"'
    : 'Choose the question before the diagram type. Run: mosofin guide "your scenario"';
  return [heading, '', intro, '', ...listScenarioRecipes(lang).flatMap((recipe) => [
    `${recipe.id}  [${recipe.type}]  ${recipe.title}`,
    `  ${recipe.question}`,
  ])].join('\n');
}

export function formatScenarioRecommendation(result) {
  const isZh = result.lang === 'zh';
  const recipe = result.recommendation;
  const labels = isZh ? {
    heading: '推荐', question: '要回答的问题', use: '适合', avoid: '不要这样用', include: '必须包含', presentation: '表现建议', prompt: '可直接复制的提示词', alternatives: '其他可能', confidence: '置信度',
  } : {
    heading: 'Recommendation', question: 'Question answered', use: 'Use when', avoid: 'Avoid when', include: 'Must include', presentation: 'Presentation', prompt: 'Copy-ready prompt', alternatives: 'Other possible fits', confidence: 'Confidence',
  };
  const lines = [
    `${labels.heading}: ${recipe.title}  [${recipe.type}]`,
    `${labels.confidence}: ${result.confidence}`,
    `${labels.question}: ${recipe.question}`,
    '',
    `${labels.use}: ${recipe.useWhen}`,
    `${labels.avoid}: ${recipe.avoidWhen}`,
    `${labels.include}: ${recipe.include.join(isZh ? '、' : '; ')}`,
    `${labels.presentation}: ${recipe.presentation.preset} · ${recipe.presentation.motion} · views ${recipe.presentation.views}`,
    '',
    `${labels.prompt}:`,
    recipe.prompt,
  ];
  if (result.alternatives.length) {
    lines.push('', `${labels.alternatives}: ${result.alternatives.map((item) => `${item.title} [${item.type}]`).join(' · ')}`);
  }
  return lines.join('\n');
}

export function publicGuideData() {
  return SCENARIO_RECIPES.map((recipe) => ({
    ...localized(recipe, 'en'),
    en: recipe.en,
    zh: recipe.zh,
    signals: recipe.signals.map(([signal, weight]) => [signal, weight]),
  }));
}
