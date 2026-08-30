# Viewer chrome icons — 14 CSS mask images

These are not `<img>` or inline SVG in the viewer: each is a `mask-image: url("data:image/svg+xml,…")`
painted with `background-color`, so the icon always takes the current text colour. The black
fill/stroke in each file is the mask, not a colour choice.

| file | CSS selector it is bound to |
|---|---|
| find.svg | `.diagram-nav-icon.find` |
| guide.svg | `.diagram-nav-icon.guide` |
| zoom-out.svg | `.diagram-nav-icon.minus` |
| zoom-in.svg | `.diagram-nav-icon.plus` |
| theme-sun.svg | `[data-theme="light"] #theme-icon` |
| theme-moon.svg | `[data-theme="dark"] #theme-icon` |
| present-expand.svg | `#btn-present[aria-pressed="false"] #present-icon` |
| present-contract.svg | `#btn-present[aria-pressed="true"] #present-icon` |
| chevron.svg | `.toolbar-chevron` |
| check.svg | `.preset-option-check` |
| export-share-card.svg | `.toolbar .export-menu button[data-format="share-card"]::before, .toolbar .export-menu button[data-action="route-share-card"]::before, .toolbar .export-menu button[data-action="reach-share-card"]::before` |
| export-copy.svg | `.toolbar .export-menu button[data-action^="copy"]::before` |
| export-raster.svg | `.toolbar .export-menu button[data-format="png"]::before, .toolbar .export-menu button[data-format="jpeg"]::before, .toolbar .export-menu button[data-format="webp"]::before` |
| export-vector-motion.svg | `.toolbar .export-menu button[data-format="svg"]::before, .toolbar .export-menu button[data-format="webm"]::before` |
