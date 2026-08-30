# Semantic sigils — 13 of 13, from source

Each file is the authored glyph exactly as `SIGIL_SHAPE` defines it (see `SOURCE.md` for the verbatim
object and the rendering contract): 16×16 authoring box, painted at `scale(0.6875)` ≈ 11 px, stroke
1.35, round caps, opacity .76, `stroke: currentColor` where currentColor is the kind's stroke token.
`png/` holds 96 px previews on light and dark.

| file | kind | tone | used by |
|---|---|---|---|
| frontend.svg | frontend | frontend | architecture · workflow · sequence · dataflow |
| backend.svg | backend | backend | architecture · workflow · sequence · dataflow |
| database.svg | database | database | architecture · workflow · sequence · dataflow |
| cloud.svg | cloud | cloud | architecture · workflow · sequence · dataflow |
| security.svg | security | security | architecture · workflow · sequence · dataflow |
| messagebus.svg | messagebus | messagebus | architecture · workflow · sequence · dataflow |
| external.svg | external | external | architecture · workflow · sequence · dataflow |
| start.svg | start | frontend | lifecycle |
| active.svg | active | backend | lifecycle |
| waiting.svg | waiting | cloud | lifecycle |
| success.svg | success | database | lifecycle |
| failure.svg | failure | security | lifecycle |
| neutral.svg | neutral | external | fallback for any unmapped kind |

**One real gap remains for the redesign:** `decision` (lifecycle) has no sigil at all. Proposed:
`../sigils-finance/decision.svg` (Tie-out).
