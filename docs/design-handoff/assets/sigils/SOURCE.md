# Semantic sigils — source of truth

Extracted at build time from `mosofin/renderers/shared/utils.mjs` (`SIGIL_TONE` :32–46,
`SIGIL_SHAPE` :48–75, `renderSemanticSigil` :80–87). All **13** shipped shapes are now present,
including `messagebus`, which no finance sample authors and therefore could not be lifted from a
delivered artifact in the first assembly.

`decision` has no entry in either object: `renderSemanticSigil` checks `Object.hasOwn(SIGIL_SHAPE, kind)`
(:81) and falls back to the `neutral` shape with the `external` tone — but the lifecycle renderer never
calls it for `decision`, so the diamond carries colour only. The proposed glyph is
`../sigils-finance/decision.svg`.

Rendering contract (`assets/template.html:3954–3974`): `fill:none; stroke:currentColor; stroke-width:1.35;
stroke-linecap:round; stroke-linejoin:round; opacity:.76; vector-effect:non-scaling-stroke`; `.sigil-fill`
children are `fill:currentColor; stroke:none`. Tone classes `.s-<tone>` set `color: var(--<tone>-stroke)`.

Placement: architecture `render-architecture.mjs:1011`, workflow `render-workflow.mjs:657`, sequence
`render-sequence.mjs:326`, dataflow `render-dataflow.mjs:392` — all `[x+6, y+6]`; lifecycle
`render-lifecycle.mjs:468` uses `x+width-17` when the state has no brand mark.

```js
const SIGIL_TONE = {
  frontend: 'frontend',
  start: 'frontend',
  backend: 'backend',
  active: 'backend',
  database: 'database',
  success: 'database',
  cloud: 'cloud',
  waiting: 'cloud',
  security: 'security',
  failure: 'security',
  messagebus: 'messagebus',
  external: 'external',
  neutral: 'external',
};

const SIGIL_SHAPE = {
  frontend: `<rect x="2" y="3" width="12" height="10" rx="2"/>
            <path d="M2 6.5h12"/>
            <circle cx="4.1" cy="4.8" r=".7" class="sigil-fill"/>
            <circle cx="6.3" cy="4.8" r=".7" class="sigil-fill"/>`,
  backend: `<path d="M6 3 3 8l3 5M10 3l3 5-3 5"/>`,
  database: `<ellipse cx="8" cy="4" rx="5" ry="2"/>
            <path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2"/>`,
  cloud: `<path d="M4.3 12.5h7.3a2.4 2.4 0 0 0 .2-4.8 4 4 0 0 0-7.5-1.3A3.1 3.1 0 0 0 4.3 12.5Z"/>`,
  security: `<path d="M8 2.2 13 4v3.5c0 3.1-1.8 5.4-5 6.5-3.2-1.1-5-3.4-5-6.5V4Z"/>
            <path d="m5.8 8 1.5 1.5 3-3"/>`,
  messagebus: `<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>
            <circle cx="5" cy="4.5" r="1" class="sigil-fill"/>
            <circle cx="10.5" cy="8" r="1" class="sigil-fill"/>
            <circle cx="7" cy="11.5" r="1" class="sigil-fill"/>`,
  external: `<rect x="2.5" y="5" width="8.5" height="8" rx="1.5"/>
            <path d="M8 2.5h5.5V8M13.5 2.5 7.5 8.5"/>`,
  start: `<circle cx="8" cy="8" r="5"/>
            <path d="m7 5.4 3.6 2.6L7 10.6Z" class="sigil-fill"/>`,
  active: `<path d="M2 8h3l1.5-3.5L9 12l1.6-4H14"/>`,
  waiting: `<path d="M4 2.5h8M4 13.5h8M5 3c0 2.8 2 3.2 3 5-1 1.8-3 2.2-3 5M11 3c0 2.8-2 3.2-3 5 1 1.8 3 2.2 3 5"/>`,
  success: `<circle cx="8" cy="8" r="5.3"/>
            <path d="m5.2 8 1.8 1.8 3.8-4"/>`,
  failure: `<circle cx="8" cy="8" r="5.3"/>
            <path d="m5.7 5.7 4.6 4.6m0-4.6-4.6 4.6"/>`,
  neutral: `<rect x="3" y="3" width="10" height="10" rx="2"/>
            <circle cx="8" cy="8" r="1.2" class="sigil-fill"/>`,
};
```
