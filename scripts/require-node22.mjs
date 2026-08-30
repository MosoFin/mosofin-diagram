#!/usr/bin/env node
// Fail early and helpfully when `npm run build:zip` is run on the wrong Node major.
// Canonical mosofin.zip bytes depend on the Node/zlib toolchain; CI byte-compares them.
const major = Number(process.versions.node.split('.')[0]);
if (major !== 22) {
  console.error(`mosofin.zip must be built on Node 22 (this is Node ${process.versions.node}).`);
  console.error('');
  console.error('  nvm use 22 && npm run build:zip     # nvm');
  console.error('  fnm use 22 && npm run build:zip     # fnm');
  console.error('');
  console.error('Or let CI do it: push your change and .github/workflows/refresh-zip.yml');
  console.error('rebuilds and commits the zip automatically.');
  process.exit(1);
}
