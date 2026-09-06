# CFO live articulation playbook

Use the self-contained three-statements HTML as the live board surface — not a slide deck. Sample: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · how to read: [`three-statements.md`](three-statements.md) · popularity path: [`html-popularity.md`](html-popularity.md).

## Goal (15 minutes)

Help an owner or board see **one closed story**: profit → equity, profit → cash (indirect), ending cash → balance-sheet cash. Leave with a clear ask and a file they can reopen without login.

## Preferred: Ask-first

Ask-first replaces mode chrome on the chart with a **conversation UI**. The Northline sample uses `meta.presentation: "ask-first"` plus authored `meta.asks[]` (`id`, `question`, `verdict`, `viewId`, optional `focus`, plus performance fields `metric` / `metricLabel` / `delta` / `status`). Land on the questions (each card shows the big authored number), click one for the matching guided view + persistent performance strip + authored verdict, or **See full map**. Vs PPT: same slide-like number navigation, plus articulation joints on the diagram. Deep-link: `?ask=earn|position|cash|quality`. Present/Health toggles are de-emphasized on ask-first (code paths remain for `presentation: "articulation"`).

Try: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · [`?ask=cash`](samples/northline-three-statements.html?ask=cash).

## Script

1. **Ask-first landing** — Open the HTML (default ask UI). Do not start in Present. Let the three cards set the agenda; optional fourth covers earnings quality.
2. **Three questions** — Click before walking the map:
   - Did we earn? (P&L / NI → Equity)
   - What's our position? (BS / A=L+E / cash on BS)
   - Did cash show up? (CFS / WC bridge / ending cash = BS cash)
3. **Joints** — Each question focuses an authored guided view. Optionally use Play on guided views in order:
   - `income-to-equity` — NI closes into retained earnings
   - `indirect-bridge` — NI → WC bridge → CFO, then investing / financing
   - `cash-tie-out` — ending cash ties to BS cash; A = L + E is structural
   - `earnings-quality` — NI ≠ CFO when A/R, inventory, or A/P move
4. **Red-only** — Toggle **Health** (`?health=1` / key `H`). Tint is **authored only**. Unknown nodes stay neutral — never invent a green NI or fake reconciliation. Use red/amber attention to open the earnings-quality conversation, not to shame the books.
5. **Ask** — One next step: send GL export / books brief, install the skill, or schedule the money-map sibling. Hand off the HTML before you leave the call.

## Ask-first vs Present vs Health vs Teach

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

