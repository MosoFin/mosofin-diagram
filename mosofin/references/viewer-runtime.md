# Viewer Runtime reference

Read this only when the user asks for a reader-facing capability. Ordinary generation does not require implementing or re-documenting these features; they are already in the generated HTML.

## Exploration

- Diagram Guide lists current actions and shortcuts.
- Reading Depth starts at READ at the default 100% scale, reveals FULL detail at 175%, and falls back to MAP only below 100%. Focus, story, route, and semantic interactions reveal their exact facts at any scale.
- Semantic Lens summarizes selected node/relationship kinds without changing authored geometry.
- Intent Trace previews a fine-pointer or keyboard target before committed focus.
- Node Finder searches labels and stable IDs.
- Semantic Passport opens on focus, shows authored upstream/downstream facts, supports a copyable deep link, has an explicit close action, closes on true outside activation and Escape, and never enters canonical export.
- Semantic Radar mirrors the visible viewport and authored graph without becoming a second source of truth.
- Direct Relationship Pin makes a unique compiled relationship operable while preserving the authored line and stable relationship identity. It must fail closed on conflicting source/target/label/ID metadata.
- Route Probe resolves exactly two endpoints over authored directed relationships. It never infers a route from geometry.

## Guided views and story

`meta.views` may define at most five curated chapters using stable node IDs. The Named Chapter Rail, Chapter Delta Preview, Story Beat Navigator, Story Follow Camera, Story Director Strip, Story Horizon, and Shareable Story Moment links all derive from that one authored array; none owns parallel topology or layout.

Story transitions classify only the exact relationship between adjacent authored stops: forward, reverse, multiple, or grouped/no direct link. Never infer a transitive edge, verb, causality, or runtime behavior from proximity, kinds, or story order. Playback is reader-started, bounded, stale-safe, and motion-governed.

## Motion and presentation

`meta.animation: "trace"` enables a finite reader-controlled Live/Still trace. Static is the default. Still, reduced motion, page hiding, print, and canonical export preserve complete static meaning. Presentation Stage changes viewer chrome and framing, never authored geometry. This is not a mobile product feature; narrow layouts get containment only.

## Ledger playback

Only a `ledger` artifact carries this surface (`data-diagram-kind="ledger"` on the SVG and an
embedded `mosofin-ledger-data` block). The strip under the diagram replays the period day by day:
one aggregated money token per flow per day rides the authored path (`count · sum`; a reversal runs
the same path backwards), the tempo is 0.5 to 10 days per second, and `G` toggles play. Playback
claims the motion governor as owner `ledger`; Still, reduced motion, a hidden tab, print, or a
running story pause it. Whenever tokens are not moving, volume badges at each flow midpoint carry
the same totals, and the static tie-out panel below always shows accounts, flows, entities,
tie-outs and the unmapped rows. `#ledger=day:YYYY-MM-DD` restores a still day. Overlays never enter
canonical exports.

## Canonical exports

The export menu can copy/download full-diagram PNG, download JPEG/WebP, download a dual-theme SVG, and record a trace-enabled WebM. Viewer state—Guide, Lens, finder, focus, route, story, camera, radar, presentation, motion ownership, and temporary overlays—must be removed from canonical export.

### Share Card

The optional 1200×630 Share Card PNG is for README, release, social, or launch previews. It uses the current theme and visual preset, contains the complete canonical diagram without cropping, and never claims validation. Copy Share Card reuses the same canonical PNG when clipboard image writes are supported.

### Route Share Card

After a real directed Route Probe resolves, the reader may use **Export → Route Share Card**. It reuses the exact ordered route snapshot and the shared Share Card seam: `format=share-card`, `variant=route`. The isolated clone may use only static `data-share-route-*` decoration. It is download-only, fails closed for stale/unreachable/conflicting routes, and never becomes the canonical artifact.

### Reach Share Card

After a non-empty authored reachability query, the reader may use **Export → Reach Share Card**. It consumes the already resolved upstream/downstream node and edge set without rerunning traversal: `format=share-card`, `variant=reach`. The isolated clone may use only static `data-share-reach-*` decoration. It is download-only. Call it authored reachability—not impact, blast radius, breakage, or runtime causality.

## Truth boundary

Viewer exports are communication assets. They do not replace the checked HTML, the deterministic delivery receipt, or a real visual review. Do not add a hosted service, storage surface, dependency, schema branch, or mobile product surface for these viewer-only capabilities.
