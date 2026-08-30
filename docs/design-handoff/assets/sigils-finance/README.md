# Proposed finance sigils — full set of 14

Redrawn for the finance reader in the exact grammar of the shipped set (16×16 box, stroke 1.35,
round caps, opacity .76, colour = kind stroke token) so they can drop into
`renderers/shared/utils.mjs` `SIGIL_SHAPE` without touching layout. **Kind ids are unchanged.**

| id | Was | Now | Glyph |
|---|---|---|---|
| frontend | Frontend · browser window | **Commerce** | storefront with awning |
| backend | Backend · `</>` | **Payments** | payment card |
| database | Database · cylinder | **Ledger** | bound book of account |
| cloud | Cloud · cloud | **Bank** | bank facade |
| security | Security · shield | **Control** | shield kept — already reads as a gate |
| messagebus | Message bus · bus rails | **Sync** | two-way feed arrows |
| external | External · out-arrow box | **Counterparty** | person |
| neutral | Neutral | **Note** | kept |
| start | start | **Opened** | kept |
| active | active | **In flight** | kept |
| waiting | waiting | **Awaiting bank** | kept |
| decision | *(no sigil existed)* | **Tie-out** | **new** — two totals meeting a check |
| success | success | **Booked** | kept |
| failure | failure | **Break** | circled exclamation (annotation mark) — a rec that needs attention, not a system fault |

This set also closes both gaps in the shipped product: `messagebus` (not extractable from any
finance sample) and `decision` (never had a glyph).
