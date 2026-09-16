# Vendored Three.js (City 3D)

Pinned three@0.170.0 for Mosofin.city3d.

Files: three.module.min.js, OrbitControls.js, city3d-entry.mjs, city3d.bundle.min.js

Rebuild:
npx esbuild assets/vendor/city3d-entry.mjs --bundle --minify --format=iife --global-name=MosofinCity3D --alias:three=./assets/vendor/three.module.min.js --outfile=assets/vendor/city3d.bundle.min.js

City HTML injects the IIFE via MOSOFIN:CITY3D_VENDOR. Optional CDN: jsDelivr three@0.170.0.
