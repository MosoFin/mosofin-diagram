# How to read the three statements

Sample artifact: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · spec [`../mosofin/examples/northline-three-statements.architecture.json`](../mosofin/examples/northline-three-statements.architecture.json).

An accountant reads the three financial statements as one closed story. This map makes the **three joints** explicit:

1. **Net Income → Equity / Retained earnings** — period profit on the income statement closes into balance-sheet equity. If ops are profitable, retained earnings rise.
2. **Net Income → WC bridge → Cash from operations (indirect)** — the cash flow statement does not start from revenue; the indirect method starts at net income, then the **working-capital bridge** (ΔA/R · ΔInventory · ΔA/P) adjusts accrual profit into cash from ops before investing and financing.
3. **Ending cash (CFS) → Cash on Balance Sheet** — the cash flow statement’s ending cash must equal cash on the balance sheet at the same as-of date. That is the cash tie-out.

**Beginning cash** opens the CFS lane (prior-period close). **Assets = Liabilities + Equity** is drawn inside the balance-sheet boundary as a structural identity, not a claimed green reconciliation.

Zones: Income Statement (period) → Balance Sheet (point in time, **A = L + E**) → Cash Flow Statement (period). Guided view **earnings-quality** focuses net income, the WC bridge, operating cash, ending cash, and BS cash — NI is not CFO when working capital moves.

**Proof: authored.** Round sample tags (~$24k sales, ~$12k cash net) come from the Northline July GL fixture. No invented Net Income dollar (payroll splits stay unmapped). Sibling maps: [`ledger-northline-gl-city.html`](../mosofin/examples/ledger-northline-gl-city.html) · [`northline-money-map.html`](samples/northline-money-map.html).

## Live session

**Preferred presentation: Conversation** (Asset-Map-shaped). Default landing splits **mini statements** (left) + **articulation joints** (right) with a **Baseline | Draft** toggle and a one-line profit-vs-cash verdict. Click a statement line to focus joint nodes/edges. Draft shows authored WHAT-IF amounts from ledger scenario `dtc-plus-10` (+10% DTC) — never invent. Deep-link `?line=revenue` / `?draft=1`. See [`conversation-layer.md`](conversation-layer.md) for why this vs Fathom/Asset-Map.

**Optional Ask mode** still ships the question cards (Did we earn? / position / cash / quality) with authored metrics — use the Ask mode control or `?ask=earn|position|cash|quality`. Never invent an NI dollar.

Fractional CFOs: run the 15-minute owner/board walk with the live HTML — [`cfo-live-articulation.md`](cfo-live-articulation.md) (Conversation preferred; Ask mode optional; Present / Health on `presentation: "articulation"`). Making the artifact forwardable: [`html-popularity.md`](html-popularity.md).

Try Conversation: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · [`?line=revenue`](samples/northline-three-statements.html?line=revenue) · [`?draft=1`](samples/northline-three-statements.html?draft=1) · Ask [`?ask=cash`](samples/northline-three-statements.html?ask=cash).
