#!/usr/bin/env node
// Fail early and helpfully when `npm run build:zip` is run on the wrong Node major.
// Canonical mosofin.zip bytes depend on the Node/zlib toolchain. The archive is built in CI, not committed.
const major = Number(process.versions.node.split('.')[0]);
if (major !== 22) {
  console.error(`mosofin.zip must be built on Node 22 (this is Node ${process.versions.node}).`);
  console.error('');
  console.error('  nvm use 22 && npm run build:zip     # nvm');
  console.error('  fnm use 22 && npm run build:zip     # fnm');
  console.error('');
  console.error('CI builds the archive during package smoke. It is not stored in the repo.');
  process.exit(1);
}
