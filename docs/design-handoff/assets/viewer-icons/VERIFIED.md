# Viewer icons — verified against `mosofin/assets/template.html`

Each packaged mask SVG was normalised and compared byte-for-byte with the `mask-image` data-URI in the
viewer template's stylesheet (28 mask rules found in the template).

| file | status | first matching selector in template.html |
|---|---|---|
| check.svg | ✓ identical | `.preset-option-check` |
| chevron.svg | ✓ identical | `.toolbar-chevron` |
| export-copy.svg | ✓ identical | `.toolbar .export-menu button[data-action^="copy"]::before` |
| export-raster.svg | ✓ identical | `.toolbar .export-menu button[data-format="png"]::before, .toolbar .export-menu button[data-format="jpeg"]::before, .toolbar .export-menu button[data-format="webp"]::before` |
| export-share-card.svg | ✓ identical | `.toolbar .export-menu button[data-format="share-card"]::before, .toolbar .export-menu button[data-action="route-share-card"]::before, .toolbar .export-menu button[data-action="reach-share-card"]::before` |
| export-vector-motion.svg | ✓ identical | `.toolbar .export-menu button[data-format="svg"]::before, .toolbar .export-menu button[data-format="webm"]::before` |
| find.svg | ✓ identical | `.diagram-nav-icon.find` |
| guide.svg | ✓ identical | `.diagram-nav-icon.guide` |
| present-contract.svg | ✓ identical | `#btn-present[aria-pressed="true"] #present-icon` |
| present-expand.svg | ✓ identical | `#btn-present[aria-pressed="false"] #present-icon` |
| theme-moon.svg | ✓ identical | `[data-theme="dark"] #theme-icon` |
| theme-sun.svg | ✓ identical | `[data-theme="light"] #theme-icon` |
| zoom-in.svg | ✓ identical | `.diagram-nav-icon.plus` |
| zoom-out.svg | ✓ identical | `.diagram-nav-icon.minus` |
