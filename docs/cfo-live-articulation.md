# CFO live articulation playbook

Use the self-contained three-statements HTML as the live board surface — not a slide deck. Sample: [`samples/northline-three-statements.html`](samples/northline-three-statements.html) · how to read: [`three-statements.md`](three-statements.md) · popularity path: [`html-popularity.md`](html-popularity.md).

## Goal (15 minutes)

Help an owner or board see **one closed story**: profit → equity, profit → cash (indirect), ending cash → balance-sheet cash. Leave with a clear ask and a file they can reopen without login.

## Script

1. **1-min verdict** — Enter Present (`?present=1` or toolbar **Present** / key `F`). State the period headline in plain language (ops profitable or not; cash better or worse than accrual). The guided caption is the beat note — treat beat 1 as the verdict plate.
2. **Three questions** — Ask before walking the map:
   - Did period profit land in equity?
   - Why is net income not cash from ops?
   - Does ending CFS cash equal cash on the balance sheet?
3. **Joints** — Use **Walk the joints** (or Play on guided views) in order:
   - `income-to-equity` — NI closes into retained earnings
   - `indirect-bridge` — NI → WC bridge → CFO, then investing / financing
   - `cash-tie-out` — ending cash ties to BS cash; A = L + E is structural
   - `earnings-quality` — NI ≠ CFO when A/R, inventory, or A/P move
4. **Red-only** — Toggle **Health** (`?health=1` / key `H`). Tint is **authored only**. Unknown nodes stay neutral — never invent a green NI or fake reconciliation. Use red/amber attention to open the earnings-quality conversation, not to shame the books.
5. **Ask** — One next step: send GL export / books brief, install the skill, or schedule the money-map sibling. Hand off the HTML before you leave the call.

## Present vs Health vs Teach

| Mode | When | What it does |
|------|------|----------------|
| **Present** | Owner / board live | Chrome-minimal stage, large verdict/story captions from authored view notes, auto or one-click walk of the four joints. Cards hide; the diagram is the slide. |
| **Health** | Same session, after the walk | Optional authored `meta.health` tint (0..1 or `unknown`). No score is computed at render time. Unknown ≠ green. |
| **Teach** | Trainee / new hire | Stay out of Present. Use guided views + cards: three joints, proof line, sibling City / money-map links. Pause on WC bridge until they can say “NI is not CFO.” |

## Proof rules

- Proof is **authored** or **CSV** — never “connected” cosplay.
- Round sample tags (e.g. ~$24k sales, ~$12k cash net) come from the Northline July GL fixture.
- Do **not** invent a Net Income dollar when payroll splits stay unmapped.
- A = L + E is a structural identity on the map, not a claimed reconciliation green.
- Health scores, if present, are authored presentation hints for the session — never implied audit opinion.

## Hand off after the meeting

1. Export or copy the **single HTML file** (already self-contained: dark/light, Present/Health URL params, no login).
2. Share via email / Drive / Notion with a one-line open hint: `…html?present=1` for replay, `…html?health=1` for the tint pass.
3. Optional: Reach / Share card from Export for social or board packet cover.
4. Point siblings: City GL replay and money map for the same entity — deep-link, don’t paste screenshots as source of truth.
5. Invite the next artifact: their books → skill install or business/finance brief ([README](../README.md)).

