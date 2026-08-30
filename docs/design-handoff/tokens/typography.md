# Typography — every surface

Two independent type systems live in this product. They do not share a single token file, and a
redesign has to decide whether they should.

## 1. The artifact (viewer + SVG) — `mosofin/assets/template.html`

Font stacks found in the delivered artifact:

- `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', monospace`
- `Georgia, 'Times New Roman', 'Songti SC', STSong, serif`
- `Georgia, 'Times New Roman', serif`
- `inherit`

Notes that matter for a redesign:

- The **body/chrome stack is a system stack with CJK fallbacks** (`PingFang SC`, `Hiragino Sans GB`,
  `Microsoft YaHei`). Nothing is web-loaded — an artifact is one self-contained file with **zero
  network requests**, so no webfont can be added without breaking that promise.
- The **Editorial preset is the only preset that changes the typeface**: `h1` and `.card h3` swap to
  `Georgia, 'Times New Roman', 'Songti SC', STSong, serif` at `font-size: 1.72rem / weight 600 /
  letter-spacing -0.02em`. Blueprint and Signal Flow re-skin colour and chrome only.
- Preset badges are set in the mono stack via CSS `content: attr(data-preset-badge-*)`.

### SVG text scale (authored user units, not px — the viewBox scales them)

| Role | Size | Weight | Fill class |
|---|---|---|---|
| Legend title | 12 | 650 | `.t-primary` |
| Node label | 11 | 600 | `.t-primary` |
| Legend entry | 10 | 500 | `.t-muted` |
| Node context / sublabel | 9 | 400 | `.t-muted` |
| Edge label | 8 | 400 | `.t-muted` |
| Node tag / annotation | 7 | 400–700 | `.t-dim` |

Fractional sizes (10.8, 10.7, 9.6, 9.1, 8.4, 8.3) appear in the delivered files: that is the
text-fit shrinker stepping a long label down to fit its box. **7 is the observed floor.** Any
redesign that increases nominal sizes must re-run `visual-check` — the boxes are fixed.

## 2. The site — `docs/index.html`, `gallery.html`, `guide.html`, `start.html`

Four Google fonts, loaded from `fonts.googleapis.com` (one `<link>`, weights 300–600):

| Token | Stack | Used for |
|---|---|---|
| `--font-display` | `'Fraunces','Songti SC','STSong',Georgia,serif` | hero headline, section h2 |
| `--font-grot` | `'Space Grotesk','Inter',…CJK…,sans-serif` | labels, buttons, stat numerals |
| `--font-body` | `'Inter',-apple-system,…CJK…,sans-serif` | body copy |
| `--font-mono` | `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace` | eyebrows, receipts, code |

Every CJK fallback is deliberate: both the site and the viewer ship **en + zh** copy and the type
has to hold both. Any font substitution must keep a CJK fallback in the same stack.

**Drift to note:** the site was already moved to a warm "drafted sheet" identity (Fraunces + paper
`#eff2f1` + international orange `#e14a0e`). The artifact viewer was **not** — it is still the
cool cyan/slate engineering palette. The two surfaces currently do not look like one product.
