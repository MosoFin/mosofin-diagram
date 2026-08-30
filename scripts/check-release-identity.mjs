#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootFlag = process.argv.indexOf('--root');
const repoRoot = rootFlag === -1 ? scriptRoot : path.resolve(process.argv[rootFlag + 1] || '');
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
  } catch {
    fail(`${relativePath} is missing or unreadable.`);
    return '';
  }
}

function readJson(relativePath) {
  const source = read(relativePath);
  if (!source) return {};
  try {
    return JSON.parse(source);
  } catch {
    fail(`${relativePath} is not valid JSON.`);
    return {};
  }
}

function compareCore(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function shieldEscape(value) {
  return value.replaceAll('_', '__').replaceAll('-', '--');
}

function versionLabels(source) {
  return [...source.matchAll(/\bv(\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)\b/g)]
    .map((match) => match[1]);
}

function checkReadme(relativePath, source, version, language, isDevelopment) {
  const badge = `/badge/version-${shieldEscape(version)}-`;
  const markerLabel = isDevelopment ? 'Current development version:' : 'Current stable version:';
  const identity = isDevelopment ? 'development' : 'stable';
  const hasMarker = source.split('\n').some((line) => line.includes(markerLabel) && line.includes(`\`v${version}\``));
  if (!source.includes(badge) || !hasMarker) {
    fail(`${relativePath} must advertise ${identity} identity v${version} with an exact escaped badge and explicit ${identity} marker.`);
  }
}

function checkDocument(relativePath, source, version, isDevelopment) {
  const labels = versionLabels(source);
  const identity = isDevelopment ? 'development' : 'stable';
  const englishLabel = isDevelopment ? /development/i : /stable/i;
  if (labels.length === 0 || labels.some((label) => label !== version)
    || !englishLabel.test(source)) {
    fail(`${relativePath} must advertise ${identity} identity v${version} without a conflicting version alias.`);
  }
}

function checkRavenBoundary(relativePath, source, language) {
  const installParent = String.raw`~\/\.raven\/workspace\/skills`;
  const installedRoot = `${installParent}\/mosofin`;
  const pathBoundary = String.raw`(?=$|[\s\x60'"<>,.;:])`;
  const hasEnglishManual = /manual ZIP/i.test(source);
  const hasRequiredCopy = hasEnglishManual;
  const englishExtractsIntoParent = new RegExp(
    String.raw`(?:extract|unpack)[^\n]{0,180}mosofin\.zip[^\n]{0,180}(?:into|to)\s*[\x60'"<]*${installParent}${pathBoundary}`,
    'i',
  ).test(source);
  const englishExplainsInstalledRoot = new RegExp(
    String.raw`(?:yields?|creates?|produces?|results? in)[^\n]{0,120}${installedRoot}`,
    'i',
  ).test(source);
  const hasCorrectDestination = englishExtractsIntoParent && englishExplainsInstalledRoot;
  const nestedDestination = new RegExp(
    String.raw`(?:\b(?:extract|unpack)[^\n]{0,220}(?:into|to))\s*[\x60'"<]*${installedRoot}`,
    'i',
  ).test(source);
  const inventsSwitcher = /data-agent=["']raven["']/i.test(source)
    || /--agent\s+raven\b/i.test(source)
    || /[?&]agent=raven\b/i.test(source);
  if (!/Raven/i.test(source) || !hasRequiredCopy || !hasCorrectDestination
    || nestedDestination || inventsSwitcher) {
    fail(`${relativePath}: Raven must remain a manual ZIP installation outside the agent switcher: extract mosofin.zip into ~/.raven/workspace/skills, yielding ~/.raven/workspace/skills/mosofin.`);
  }
}

function checkIdentityTemplate(relativePath, source, isDevelopment) {
  const hasHardcodedVersion = /\b\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?\b/.test(source);
  const identity = isDevelopment ? 'development' : 'stable';
  const hasIdentity = isDevelopment
    ? /development/i.test(source)
    : /stable/i.test(source);
  if (!source.includes('[[MOSOFIN_VERSION]]') || !hasIdentity || hasHardcodedVersion) {
    fail(`${relativePath} must use [[MOSOFIN_VERSION]] with ${identity} labels, never a hardcoded package version.`);
  }
}

function checkRoadmap(relativePath, source, version, isDevelopment) {
  const identity = isDevelopment ? 'development line' : 'stable version';
  const marker = `The current ${identity} is \`v${version}\``;
  if (!source.includes(marker)) {
    fail(`${relativePath} must declare the current ${identity} as v${version}.`);
  }
}

const packageJson = readJson('mosofin/package.json');
const changelog = read('CHANGELOG.md');
const unreleasedStart = changelog.search(/^## \[Unreleased\][^\n]*(?:\n|$)/m);
const afterUnreleased = unreleasedStart === -1
  ? ''
  : changelog.slice(unreleasedStart).replace(/^## \[Unreleased\][^\n]*(?:\n|$)/, '');
const nextRelease = afterUnreleased.search(/^## \[/m);
const unreleased = nextRelease === -1 ? afterUnreleased : afterUnreleased.slice(0, nextRelease);
const hasRealUnreleasedChanges = /^\s*-\s+\S/m.test(unreleased);
const version = packageJson.version;
const semver = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(version);
const isDevelopment = Boolean(semver?.[4]);

if (!semver) {
  fail(`package version is not a supported SemVer identity: ${JSON.stringify(version)}`);
} else if (hasRealUnreleasedChanges && !semver[4]) {
  fail(`Unreleased changes require a prerelease package version; found stable ${version}.`);
}

if (semver && hasRealUnreleasedChanges) {
  if (semver[4] && !/^dev\.\d+$/.test(semver[4])) {
    fail(`Unreleased development identity must use a dev.N prerelease; found ${version}.`);
  }
  const published = [...changelog.matchAll(/^## \[(\d+)\.(\d+)\.(\d+)\]/gm)]
    .map((match) => match.slice(1, 4).map(Number));
  const newestPublished = published.sort((left, right) => compareCore(right, left))[0];
  const currentCore = semver.slice(1, 4).map(Number);
  if (newestPublished && compareCore(currentCore, newestPublished) <= 0) {
    fail(`Unreleased package core ${currentCore.join('.')} must be newer than published ${newestPublished.join('.')}.`);
  }
}

if (semver) {
  const lock = readJson('mosofin/package-lock.json');
  if (lock.version !== version || lock.packages?.['']?.version !== version) {
    fail(`mosofin/package-lock.json must match ${version} at the root and packages[""].`);
  }

  const skill = read('mosofin/SKILL.md');
  const skillVersion = skill.match(/^\s*version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];
  const expectedSkillVersion = `${semver[1]}.${semver[2]}`;
  if (skillVersion !== expectedSkillVersion) {
    fail(`mosofin/SKILL.md metadata version ${skillVersion || '(missing)'} must map to package ${version} as ${expectedSkillVersion}.`);
  }

  const rendererTemplate = read('mosofin/assets/template.html');
  const generatorVersions = [...rendererTemplate.matchAll(/<meta\s+name="generator"\s+content="mosofin\s+([^"]+)"\s*\/?>/g)]
    .map((match) => match[1]);
  if (generatorVersions.length !== 1 || generatorVersions[0] !== version) {
    fail(`mosofin/assets/template.html generator must be mosofin ${version}; found ${generatorVersions.join(', ') || '(missing)'}.`);
  }

  const english = read('README.md');
  checkReadme('README.md', english, version, 'en', isDevelopment);
  checkRavenBoundary('README.md', english, 'en');

  const newestStableLabel = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)][0]?.[1];
  if (newestStableLabel && isDevelopment) {
    const stableMinor = newestStableLabel.split('.').slice(0, 2).join('\\.');
    if (new RegExp(`Mosofin ${stableMinor} includes\\b`).test(english)) {
      fail(`README capability summary must describe v${version} as development, not published ${newestStableLabel}.`);
    }
  }

  const landing = read('docs/index.html');
  checkDocument('docs/index.html', landing, version, isDevelopment);
  checkRavenBoundary('docs/index.html', landing, 'en');
  const proofCounts = [...landing.matchAll(/\b\d+\/\d+\b/g)].map((match) => match[0]);
  const staleProofCounts = [...new Set(proofCounts.filter((count) => count !== '9/9'))];
  if (proofCounts.length === 0 || staleProofCounts.length > 0) {
    const found = staleProofCounts.length > 0 ? `; found ${staleProofCounts.join(', ')}` : '';
    fail(`docs/index.html proof receipt must say 9/9 everywhere; every N/N proof receipt must be exactly 9/9${found}.`);
  }
  const start = read('docs/start.html');
  checkDocument('docs/start.html', start, version, isDevelopment);
  checkRavenBoundary('docs/start.html', start, 'en');
  checkRoadmap('ROADMAP.md', read('ROADMAP.md'), version, isDevelopment);

  for (const templatePath of [
    'scripts/start-template.html',
    'scripts/guide-template.html',
    'scripts/gallery-template.html',
  ]) {
    checkIdentityTemplate(templatePath, read(templatePath), isDevelopment);
  }

  const changelogMarker = `Development identity: \`v${version}\``;
  if (hasRealUnreleasedChanges && !unreleased.includes(changelogMarker)) {
    fail(`CHANGELOG.md Unreleased must declare ${changelogMarker}.`);
  }
}

if (failures.length > 0) {
  for (const message of failures) console.error(`release identity: ${message}`);
  process.exit(1);
}

console.log(`release identity ok: ${version}`);
