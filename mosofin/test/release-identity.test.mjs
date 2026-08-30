import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const checker = path.join(repoRoot, 'scripts', 'check-release-identity.mjs');

function writeFile(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function runCheck(root) {
  return spawnSync(process.execPath, [checker, '--root', root], {
    encoding: 'utf8',
  });
}

function writeValidDevelopmentFixture(root, overrides = {}) {
  const version = '2.13.0-dev.0';
  const english = [
    '![Development Version](https://img.shields.io/badge/version-2.13.0--dev.0-blue)',
    '',
    `Current development version: \`v${version}\``,
    '',
    'Raven uses manual ZIP installation: extract mosofin.zip into `~/.raven/workspace/skills`, which yields `~/.raven/workspace/skills/mosofin`; Raven is not an agent-switcher target.',
  ].join('\n');
  const files = {
    'mosofin/package.json': JSON.stringify({ version }),
    'mosofin/package-lock.json': JSON.stringify({ version, packages: { '': { version } } }),
    'mosofin/SKILL.md': '---\nmetadata:\n  version: "2.13"\n---\n',
    'mosofin/assets/template.html': '<meta name="generator" content="mosofin 2.13.0-dev.0">',
    'CHANGELOG.md': [
      '# Changelog',
      '',
      '## [Unreleased]',
      '',
      `> Development identity: \`v${version}\`. Not a stable release.`,
      '',
      '### Added',
      '- Real unreleased work.',
      '',
      '## [2.12.0] — 2026-07-23',
      '',
    ].join('\n'),
    'README.md': english,
    'README_EN.md': english,
    'scripts/start-template.html': 'development · [[MOSOFIN_VERSION]]',
    'scripts/guide-template.html': 'development · [[MOSOFIN_VERSION]]',
    'scripts/gallery-template.html': 'development · [[MOSOFIN_VERSION]]',
    'docs/index.html': `<span>development · v${version} · 9/9 checks</span><p>Raven manual ZIP: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin; not an agent-switcher target.</p>`,
    'docs/start.html': `<span>development · v${version}</span><p>Raven manual ZIP: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin; not an agent-switcher target.</p>`,
    'ROADMAP.md': `The current development line is \`v${version}\`; it contains the work under Changelog Unreleased and is not a stable release.`,
  };
  for (const [relativePath, content] of Object.entries({ ...files, ...overrides })) {
    writeFile(root, relativePath, content);
  }
}

function writeValidStableFixture(root, overrides = {}) {
  const version = '2.13.0';
  const english = [
    '![Stable Version](https://img.shields.io/badge/version-2.13.0-blue)',
    '',
    `Current stable version: \`v${version}\``,
    '',
    'Raven uses manual ZIP installation: extract mosofin.zip into `~/.raven/workspace/skills`, which yields `~/.raven/workspace/skills/mosofin`; Raven is not an agent-switcher target.',
  ].join('\n');
  const files = {
    'mosofin/package.json': JSON.stringify({ version }),
    'mosofin/package-lock.json': JSON.stringify({ version, packages: { '': { version } } }),
    'mosofin/SKILL.md': '---\nmetadata:\n  version: "2.13"\n---\n',
    'mosofin/assets/template.html': '<meta name="generator" content="mosofin 2.13.0">',
    'CHANGELOG.md': [
      '# Changelog',
      '',
      '## [Unreleased]',
      '',
      '## [2.13.0] — 2026-07-29',
      '- Published work.',
      '',
    ].join('\n'),
    'README.md': english,
    'README_EN.md': english,
    'scripts/start-template.html': 'stable · [[MOSOFIN_VERSION]]',
    'scripts/guide-template.html': 'stable · [[MOSOFIN_VERSION]]',
    'scripts/gallery-template.html': 'stable · [[MOSOFIN_VERSION]]',
    'docs/index.html': `<span>stable · v${version} · 9/9 checks</span><p>Raven manual ZIP: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin; not an agent-switcher target.</p>`,
    'docs/start.html': `<span>stable · v${version}</span><p>Raven manual ZIP: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin; not an agent-switcher target.</p>`,
    'ROADMAP.md': `The current stable version is \`v${version}\`.`,
  };
  for (const [relativePath, content] of Object.entries({ ...files, ...overrides })) {
    writeFile(root, relativePath, content);
  }
}

test('an empty Unreleased section accepts a coherent stable release identity', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidStableFixture(fixture);

    const result = runCheck(fixture);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /release identity ok: 2\.13\.0/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('real Unreleased changes cannot reuse a stable published package identity', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeFile(fixture, 'mosofin/package.json', JSON.stringify({ version: '2.12.0' }));
    writeFile(fixture, 'CHANGELOG.md', [
      '# Changelog',
      '',
      '## [Unreleased]',
      '',
      '### Added',
      '- Real unreleased work.',
      '',
      '## [2.12.0] — 2026-07-23',
      '',
    ].join('\n'));

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unreleased changes require a prerelease package version/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('package, lockfile, Skill metadata, escaped Shields badge, and public docs share one development identity', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeFile(fixture, 'mosofin/package.json', JSON.stringify({ version: '2.13.0-dev.0' }));
    writeFile(fixture, 'mosofin/package-lock.json', JSON.stringify({
      version: '2.12.0',
      packages: { '': { version: '2.12.0' } },
    }));
    writeFile(fixture, 'mosofin/SKILL.md', '---\nmetadata:\n  version: "2.12"\n---\n');
    writeFile(fixture, 'CHANGELOG.md', [
      '# Changelog',
      '',
      '## [Unreleased]',
      '',
      '### Added',
      '- Real unreleased work.',
      '',
      '## [2.12.0] — 2026-07-23',
      '',
    ].join('\n'));
    const staleEnglish = [
      '![Version](https://img.shields.io/badge/version-2.13.0-blue)',
      '',
      'Mosofin 2.12 includes unreleased capabilities.',
    ].join('\n');
    writeFile(fixture, 'README.md', staleEnglish);
    writeFile(fixture, 'README_EN.md', staleEnglish);
    writeFile(fixture, 'README.md', '![Version](https://img.shields.io/badge/version-2.13.0-blue)\n\nMosofin 2.12 includes unpublished capability.\n');
    writeFile(fixture, 'docs/index.html', '<span>Agent Skill · v2.12.0</span>');
    writeFile(fixture, 'docs/start.html', '<span>Mosofin v2.12.0</span>');

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /package-lock\.json must match 2\.13\.0-dev\.0/);
    assert.match(result.stderr, /SKILL\.md metadata version 2\.12 must map to package 2\.13\.0-dev\.0/);
    assert.match(result.stderr, /README\.md must advertise development identity v2\.13\.0-dev\.0/);
    assert.match(result.stderr, /docs\/index\.html must advertise development identity v2\.13\.0-dev\.0/);
    assert.match(result.stderr, /docs\/start\.html must advertise development identity v2\.13\.0-dev\.0/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('landing proof receipt matches the current nine-check artifact contract', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidDevelopmentFixture(fixture, {
      'docs/index.html': '<span>development · v2.13.0-dev.0 · 8/8 checks</span><p>Raven manual ZIP: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin; not an agent-switcher target.</p>',
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /docs\/index\.html proof receipt must say 9\/9/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('landing rejects every stale N/N contract count even when 9/9 is also present', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidDevelopmentFixture(fixture, {
      'docs/index.html': [
        '<span>development · v2.13.0-dev.0 · 9/9 checks</span>',
        '<span>legacy receipt · 7/7 checks</span>',
        '<p>Raven manual ZIP: extract mosofin.zip into ~/.raven/workspace/skills, which yields ~/.raven/workspace/skills/mosofin; not an agent-switcher target.</p>',
      ].join('\n'),
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /every N\/N proof receipt must be exactly 9\/9; found 7\/7/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('Raven stays a truthful manual ZIP install and never becomes a generated agent-switcher command', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidDevelopmentFixture(fixture, {
      'docs/start.html': [
        '<span>development · v2.13.0-dev.0</span>',
        '<button data-agent="raven">Raven</button>',
        '<pre>npx skills add MosoFin/mosofin-diagram --agent raven</pre>',
      ].join('\n'),
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Raven must remain a manual ZIP installation outside the agent switcher/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('Raven instructions reject extracting the archive into the final Skill directory', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    const nestedEnglish = [
      '![Development Version](https://img.shields.io/badge/version-2.13.0--dev.0-blue)',
      '',
      'Current development version: `v2.13.0-dev.0`',
      '',
      'Raven is manual ZIP only: extract mosofin.zip into `~/.raven/workspace/skills/mosofin`; Raven is not an agent-switcher target.',
    ].join('\n');
    writeValidDevelopmentFixture(fixture, {
      'README.md': nestedEnglish,
      'README_EN.md': nestedEnglish,
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /extract mosofin\.zip into ~\/\.raven\/workspace\/skills, yielding ~\/\.raven\/workspace\/skills\/mosofin/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('renderer template generator carries the complete package prerelease identity', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidDevelopmentFixture(fixture, {
      'mosofin/assets/template.html': '<meta name="generator" content="mosofin 2.12.0">',
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /mosofin\/assets\/template\.html generator must be mosofin 2\.13\.0-dev\.0/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('roadmap current identity follows the package release state', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidDevelopmentFixture(fixture, {
      'ROADMAP.md': 'The current development line is `v2.12.0`; it is not a stable release.',
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /ROADMAP\.md must declare the current development line as v2\.13\.0-dev\.0/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('generated public-page templates keep a development marker and version placeholder', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-release-identity-'));
  try {
    writeValidDevelopmentFixture(fixture, {
      'scripts/gallery-template.html': 'Proof Lab / 2.12.0',
    });

    const result = runCheck(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /scripts\/gallery-template\.html must use \[\[MOSOFIN_VERSION\]\] with development labels/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
