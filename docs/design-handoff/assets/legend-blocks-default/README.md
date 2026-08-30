# Default legend catalogues — one per renderer

What each renderer *can* show (`meta.legend.mode: "all"`), in catalogue order, with the default
label in **en** (top row) and **zh-CN** (bottom row). The `../legend-blocks/` folder shows what the
eight Northline artifacts *actually* rendered (`mode: auto` — only kinds present); this folder is the
full vocabulary a relabel must cover.

| renderer | catalogue | kinds |
|---|---|---|
| architecture | `render-architecture.mjs:82-90` | frontend · backend · database · cloud · security · messagebus · external |
| workflow | `render-workflow.mjs:680-688` | frontend · backend · security · messagebus · database · cloud · external |
| sequence | `render-sequence.mjs:396-408` | emphasis · return · security · dashed · default |
| dataflow | `render-dataflow.mjs:417-426` | emphasis · security · dashed · database · default |
| lifecycle | `render-lifecycle.mjs:496-505` | start · active · waiting · decision · success · failure · neutral · external |

Labels live in `mosofin/renderers/shared/i18n.mjs:30–61` as `legend.<renderer>.<kind>` [en, zh] pairs
(`tokens/i18n-labels.json` → `groups["legend.<renderer>"]`).
