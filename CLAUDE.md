# Mosofin — working notes for Claude Code

Mosofin is a finance-first agent skill that compiles a typed JSON spec into a self-contained
interactive HTML diagram. The skill package lives in `mosofin/`; everything else in the repo is
docs, generators, and CI gates.

## Commands (run inside `mosofin/`)
- `npm ci` once, then `npm test` — brand-mark + validator freshness, release identity, golden
  renders, and every `test/*.test.mjs` (node:test). Must be green before a commit.
- Regenerate derived files after touching their sources:
  `npm run generate:brand-marks`, `npm run generate:validators`, `npm run build:guide`,
  `npm run build:start`, `npm run build:gallery`, `node scripts/render-examples.mjs` (packaged
  examples) and `npm run render:examples` (repo-root `examples/`).
- `npm run build:zip` rebuilds `mosofin.zip` — **requires Node 22** (the script refuses other majors;
  CI byte-compares the result). Usually unnecessary: `.github/workflows/refresh-zip.yml` rebuilds and
  commits the zip on every push to `main` that touches `mosofin/`.
- Browser suites need `MOSOFIN_CHROME=/path/to/chrome`.

## Naming contract
- Package/bin/skill name: `mosofin`; env vars `MOSOFIN_*`; template sentinels `<!-- MOSOFIN:… -->`;
  viewer namespace `Mosofin.*`; version placeholder `[[MOSOFIN_VERSION]]`.
- `scripts/check-release-identity.mjs` ties `mosofin/package.json`, `package-lock.json`,
  `SKILL.md` `metadata.version`, `assets/template.html` generator meta, README badge/marker,
  `docs/index.html`, `docs/start.html`, `ROADMAP.md`, and `CHANGELOG.md` together. Bump them together.

## Rules
- Never hand-edit rendered HTML (`docs/guide.html`, `docs/start.html`, `docs/gallery*`,
  `examples/*.html`, `mosofin/examples/*-rendered.html`, `docs/samples/*.html`) — regenerate.
- Finance diagrams follow `mosofin/references/finance-onboarding.md`: one source of truth per fact,
  no invented amounts, `connected` is not a tie-out, ≤12 primary nodes.
- The sample use case is `docs/USE-CASE.md`; its spec is `mosofin/examples/northline-money-map.architecture.json`.
