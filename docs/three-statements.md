# How to read the three statements

Sample artifact: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · spec [`../mosofin/examples/northline-three-statements.architecture.json`](../mosofin/examples/northline-three-statements.architecture.json).

An accountant reads the three financial statements as one closed story. This map makes the **three joints** explicit:

1. **Net Income → Equity / Retained earnings** — period profit on the income statement closes into balance-sheet equity. If ops are profitable, retained earnings rise.
2. **Net Income → Cash from operations (indirect)** — the cash flow statement does not start from revenue; the indirect method starts at net income, then adjusts for non-cash items and working capital before investing and financing.
3. **Ending cash (CFS) → Cash on Balance Sheet** — the cash flow statement’s ending cash must equal cash on the balance sheet at the same as-of date. That is the cash tie-out.

Zones: Income Statement (period) → Balance Sheet (point in time, **Assets = Liabilities + Equity**) → Cash Flow Statement (period).

**Proof: authored.** Round sample tags (~$24k sales, ~$12k cash net) come from the Northline July GL fixture. No invented Net Income dollar (payroll splits stay unmapped). BS identity is structural, not a claimed green reconciliation.
