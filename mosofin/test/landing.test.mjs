import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(skillRoot, '..');
const docsRoot = path.join(repoRoot, 'docs');
const landing = fs.readFileSync(path.join(docsRoot, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(docsRoot, 'gallery', 'manifest.json'), 'utf8'));

const proofs = [
  {
    key: 'signal', id: 'business-map', artifact: 'gallery/artifacts/business-operating-map.architecture.html',
    preset: 'classic', nodes: 13, edges: 14, view: 'order-to-cash',
  },
  {
    key: 'blueprint', id: 'close', artifact: 'gallery/artifacts/northline-close.workflow.html',
    preset: 'classic', nodes: 9, edges: 9, view: 'reconcile-and-review',
  },
  {
    key: 'classic', id: 'order-path', artifact: 'gallery/artifacts/northline-order-path.sequence.html',
    preset: 'classic', nodes: 5, edges: 10, view: 'books-catch-up',
  },
];

test('landing how-it-works is four named left-to-right slides', () => {
  assert.match(landing, /id="how-slides"/);
  assert.match(landing, /Four steps from add to a diagram you can forward\./);
  assert.match(landing, /step1-h':'Add the skill'/);
  assert.match(landing, /step2-h':'Describe the business'/);
  assert.match(landing, /step3-h':'Ask one question'/);
  assert.match(landing, /step4-h':'Share the map'/);
  assert.match(landing, /slides-status':'Step \{n\} of 4'/);
  assert.match(landing, /Step 1 of 4/);
  assert.doesNotMatch(landing, /Install in one command|Describe your business|Three steps from install/);
  assert.doesNotMatch(landing, /class="steps"/);
  assert.equal((landing.match(/class="slide"/g) || []).length, 4);
});

test('landing metadata describes the full technical-diagram product and trusted hero promise', () => {
  assert.match(landing, /<title>MosoFin-diagram — Free, Open-Source Business Diagram Skill<\/title>/);
  assert.match(landing, /<meta property="og:title" content="MosoFin-diagram — Free, Open-Source Business Diagram Skill">/);
  assert.match(landing, /A free, MIT-licensed agent skill for Cursor, Claude Code, Codex CLI, and OpenCode/);
  assert.equal((landing.match(/npx -y skills add MosoFin\/mosofin-diagram --skill mosofin --agent cursor --global --copy --yes/g) || []).length, 2);
  assert.match(landing, /See how your business<br>actually runs — <em>in one diagram\.<\/em>/);
});

test('landing product figure leads with three real generated proof artifacts', () => {
  assert.match(landing, /id="hero-proof-stage"/);
  assert.match(landing, /id="hero-proof-panel" role="tabpanel"/);
  assert.equal((landing.match(/class="demo-tab spec-card"/g) || []).length, 3);
  assert.equal((landing.match(/role="tab"/g) || []).length, 3);
  assert.doesNotMatch(landing, /class="hero-screenshot|hero-bento|proof-rail/);

  for (const proof of proofs) {
    const entry = manifest.entries.find(item => item.id === proof.id);
    assert.ok(entry, `${proof.id}: proof manifest entry missing`);
    assert.equal(entry.artifact, proof.artifact);
    assert.equal(entry.visualPreset, proof.preset);
    assert.equal(entry.animation, 'trace');
    assert.equal(entry.nodeCount, proof.nodes);
    assert.equal(entry.edgeCount, proof.edges);
    assert.ok(entry.viewIds.includes(proof.view));
    assert.ok(entry.checks.every(check => check.ok), `${proof.id}: validation receipt is not green`);
    assert.ok(fs.existsSync(path.join(docsRoot, proof.artifact)), `${proof.id}: live artifact missing`);
    assert.match(landing, new RegExp(`data-proof="${proof.key}"`));
    assert.ok(landing.includes(`artifact: '${proof.artifact}'`));
    assert.ok(landing.includes(`view: '${proof.view}'`));
  }
});

test('landing proof switcher is bilingual and keyboard navigable', () => {
  assert.match(landing, /proof-live':'Live proof'/);
  assert.match(landing, /proof-live':'实时成品'/);
  assert.match(landing, /event\.key === 'ArrowRight'/);
  assert.match(landing, /event\.key === 'ArrowLeft'/);
  assert.match(landing, /event\.key === 'Home'/);
  assert.match(landing, /event\.key === 'End'/);
  assert.match(landing, /proofFrame\.dataset\.proof !== key/);
  assert.match(landing, /\?embed=1&amp;play=1&amp;theme=dark#view=order-to-cash/);
  assert.match(landing, /sandbox="allow-scripts"/);
  assert.match(landing, /const playback = play \? '&play=1' : ''/);
  assert.match(landing, /proofEmbedUrl\(proof, \{ play: deliberate \}\)/);
  assert.doesNotMatch(landing, /proofFrame\.contentWindow|proofFrame\.contentDocument/);
  assert.match(landing, /\?present=1&play=1#view=/);
  assert.match(landing, /#view=\$\{encodeURIComponent\(proof\.view\)\}/);
  assert.match(landing, /Pin one exact Story Moment, copy its stable link, and let someone else open the same authored node/);
});

test('landing makes Route Journey and core exploration shortcuts discoverable in both languages', () => {
  assert.match(landing, /Route Journey keeps the complete authored path visible/);
  assert.match(landing, /Route Journey 始终保留完整作者路径/);
  assert.match(landing, /one finite, reader-controlled pass over each exact incoming relationship/);
  assert.match(landing, /沿每条精确入向关系播放一次由读者控制的有限旅程/);
  assert.match(landing, /data-i18n="f7-tag">INSPECT · PLAY · PAUSE/);
  assert.match(landing, /'f7-tag':'INSPECT · PLAY · PAUSE'/);
  assert.match(landing, /'f7-tag':'检查 · 播放 · 暂停'/);
  assert.match(landing, /data-i18n="kbd-zoom">Reading depth \/ reset/);
  assert.match(landing, /'kbd-zoom':'阅读层级 \/ 复位'/);
  assert.match(landing, /data-i18n="kbd-guide">Diagram guide<\/span><kbd>\?<\/kbd>/);
  assert.match(landing, /'kbd-guide':'图表指南'/);
  assert.match(landing, /data-i18n="kbd-find">Find node \/ route endpoint<\/span><kbd>\/<\/kbd>/);
  assert.match(landing, /'kbd-find':'查找节点 \/ 路径端点'/);
  assert.match(landing, /data-i18n="kbd-route">Trace, inspect, and play a route<\/span><kbd>R<\/kbd>/);
  assert.match(landing, /'kbd-route':'探查、检查并播放路径'/);
  assert.match(landing, /data-i18n="kbd-lens">Compare semantic kinds<\/span><kbd>L<\/kbd>/);
  assert.match(landing, /'kbd-lens':'对比语义类型'/);
});
