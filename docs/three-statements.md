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

**Preferred presentation: Ask-first.** The sample lands on three large question cards (Did we earn? / What's our position? / Did cash show up?) with an optional earnings-quality fourth. Clicking a question focuses the matching guided view and shows an **authored** verdict — never an invented NI dollar. Use **See full map** to reveal the diagram without a selected question. Deep-link with `?ask=earn|position|cash|quality`.

Fractional CFOs: run the 15-minute owner/board walk with the live HTML — [`cfo-live-articulation.md`](cfo-live-articulation.md) (Ask-first preferred; Present / Health remain available on `presentation: "articulation"`). Making the artifact forwardable: [`html-popularity.md`](html-popularity.md).

Try Ask-first on the sample: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · [`?ask=cash`](samples/northline-three-statements.html?ask=cash).
