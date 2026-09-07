# CFO live articulation playbook

Use the self-contained three-statements HTML as the live board surface — not a slide deck. Sample: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · how to read: [`three-statements.md`](three-statements.md) · popularity path: [`html-popularity.md`](html-popularity.md).

## Goal (15 minutes)

Help an owner or board see **one closed story**: profit → equity, profit → cash (indirect), ending cash → balance-sheet cash. Leave with a clear ask and a file they can reopen without login.

## Preferred: Conversation (statements + joints + Draft)

Default landing is the Asset-Map-shaped **conversation layer** — not more Ask cards. See [`conversation-layer.md`](conversation-layer.md).

- **Left:** mini Income / Balance / Cash-flow lines from the July GL fixture (click a line to focus joints)
- **Right:** the three-statements articulation SVG (why profit ≠ cash)
- **Baseline | Draft:** Draft toggles authored WHAT-IF amounts from ledger scenario `dtc-plus-10` (+10% DTC) — never invent
- **Verdict strip:** authored “Profit vs cash: …”

Deep-link: `?line=revenue` · `?draft=1`. Optional **Ask mode** still ships `meta.asks[]` (`?ask=earn|position|cash|quality`). Present/Health remain for `presentation: "articulation"`.

Try: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · [`?line=revenue`](samples/northline-three-statements.html?line=revenue) · [`?draft=1`](samples/northline-three-statements.html?draft=1) · Ask [`?ask=cash`](samples/northline-three-statements.html?ask=cash).

## Script

1. **Conversation landing** — Open the HTML (default statements + joints). Do not start in Present. Toggle Baseline vs Draft once so the board sees WHAT-IF is labeled.
2. **Walk the statements** — Click Revenue → Net Income → Cash from ops → Ending Cash before free-roaming the map.
3. **Joints** — Each line focuses authored nodes; guided views still available:
   - `income-to-equity` — NI closes into retained earnings
   - `indirect-bridge` — NI → WC bridge → CFO, then investing / financing
   - `cash-tie-out` — ending cash ties to BS cash; A = L + E is structural
4. **Optional Ask mode** — Use Ask mode if the room wants Q cards (Did we earn? / position / cash / quality).

## Conversation vs Ask mode vs Present vs Health vs Teach

| Mode | When | What it does |
|------|------|----------------|
| **Ask-first** (preferred) | Owner / board live | Conversation UI first: authored question cards, click → guided view + authored verdict. `?ask=` deep links. Present/Health chrome hidden. |
| **Present** | Legacy articulation chrome | Chrome-minimal stage, large verdict/story captions from authored view notes, auto or one-click walk of the four joints. Prefer Ask-first for new sessions. |
| **Health** | Same session, after the walk | Optional authored `meta.health` tint (0..1 or `unknown`). No score is computed at render time. Unknown ≠ green. De-emphasized on ask-first. |
| **Teach** | Trainee / new hire | Stay on Ask-first or out of Present. Use guided views + cards: three joints, proof line, sibling City / money-map links. Pause on WC bridge until they can say “NI is not CFO.” |

## Proof rules

- Proof is **authored** or **CSV** — never “connected” cosplay.
- Round sample tags (e.g. ~$24k sales, ~$12k cash net) come from the Northline July GL fixture.
- Do **not** invent a Net Income dollar when payroll splits stay unmapped.
- A = L + E is a structural identity on the map, not a claimed reconciliation green.
- Health scores, if present, are authored presentation hints for the session — never implied audit opinion.

## Hand off after the meeting

1. Export or copy the **single HTML file** (already self-contained: dark/light, Ask-first / Present/Health URL params, no login).
2. Share via email / Drive / Notion with a one-line open hint: `…html` or `…html?ask=cash` for Ask-first replay; `…html?present=1` / `…html?health=1` only on articulation chrome.
3. Optional: Reach / Share card from Export for social or board packet cover.
4. Point siblings: City GL replay and money map for the same entity — deep-link, don’t paste screenshots as source of truth.
5. Invite the next artifact: their books → skill install or business/finance brief ([README](../README.md)).

