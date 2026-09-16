import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { motionDurationMs, summarize, viewerPayload, schedule } from '../renderers/shared/ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(skillRoot, 'assets', 'template.html'), 'utf8');
const cityFixture = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'northline-gl-2026-07.city.ledger.json'), 'utf8'));

function findChrome() {
  const candidates = [
    process.env.MOSOFIN_CHROME,
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.includes(path.sep)) {
      if (fs.existsSync(candidate)) return candidate;
      continue;
    }
    try {
      return execFileSync('sh', ['-c', 'command -v "$1"', 'mosofin-which', candidate], { encoding: 'utf8' }).trim();
    } catch (_) {}
  }
  return '';
}

const chromePath = process.env.MOSOFIN_CHROME ? findChrome() : null;

test('viewer registers motionGeometry and a ledger motion scene beside trace', () => {
  assert.match(template, /Mosofin\.motionGeometry = \(function \(\) \{/);
  assert.match(template, /function samplesFor\(root, element\)/);
  assert.match(template, /function pointAlong\(points, progress\)/);
  assert.match(template, /Mosofin\.motionScenes = \{/);
  assert.match(template, /kinds: \['trace', 'ledger'\]/);
  assert.match(template, /function createLedgerMotionScene\(root, data\)/);
  assert.match(template, /function drawLedgerMotionFrame\(/);
  assert.match(template, /function resolveMotionScene\(root\)/);
  assert.match(template, /canRecordLedgerMotion\(svg\)/);
  assert.match(template, /Unmapped rows never enter schedule/);
  assert.match(template, /vehicle\.reverse/);
  assert.match(template, /viewer\.export\.motionLedger/);
  assert.match(template, /data-last-motion-scene/);
});

test('motionDurationMs is days/daysPerSecond + 1s, capped at 20s', () => {
  assert.equal(motionDurationMs({ period: { days: ['a'] }, playback: { daysPerSecond: 1 } }), 2000);
  assert.equal(motionDurationMs({ period: { days: new Array(31).fill('x') }, playback: { daysPerSecond: 2 } }), 16500);
  assert.equal(motionDurationMs({ period: { days: new Array(60).fill('x') }, playback: { daysPerSecond: 2 } }), 20000);
  const summary = summarize(cityFixture);
  const payload = viewerPayload(cityFixture, summary);
  assert.equal(motionDurationMs(payload), Math.min(20000, Math.round((payload.period.days.length / payload.playback.daysPerSecond + 1) * 1000)));
  assert.ok(schedule(summary).every((item) => payload.flows.some((flow) => flow.id === item.edgeId)));
  assert.ok(schedule(summary).every((item) => item.direction === 'forward' || item.direction === 'reverse'));
});

test('city and map ledger artifacts expose schedule for the WebM scene', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-webm-'));
  for (const [example, view] of [
    ['northline-gl-2026-07.city.ledger.json', 'city'],
    ['northline-gl-2026-07.ledger.json', 'map'],
  ]) {
    const output = path.join(tmp, `${view}.html`);
    execFileSync(process.execPath, [
      path.join(skillRoot, 'renderers/ledger/render-ledger.mjs'),
      path.join(skillRoot, 'examples', example),
      output,
    ], { stdio: 'pipe' });
    const html = fs.readFileSync(output, 'utf8');
    assert.match(html, /Mosofin\.motionGeometry/);
    assert.match(html, /Mosofin\.motionScenes/);
    assert.match(html, new RegExp(`data-ledger-view="${view}"`));
    const payload = JSON.parse(html.match(/<script id="mosofin-ledger-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(payload.view, view);
    assert.ok(payload.schedule.length > 0);
    assert.equal(motionDurationMs(payload), Math.min(20000, Math.round((payload.period.days.length / payload.playback.daysPerSecond + 1) * 1000)));
  }
});

test('ledger City WebM smoke records schedule vehicles on roads', {
  skip: chromePath ? false : 'Set MOSOFIN_CHROME to run the real browser regression.',
}, async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mosofin-ledger-webm-smoke-'));
  const output = path.join(tmp, 'city.html');
  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers/ledger/render-ledger.mjs'),
    path.join(skillRoot, 'examples', 'northline-gl-2026-07.city.ledger.json'),
    output,
  ], { stdio: 'pipe' });

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function freePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const port = server.address().port;
    await new Promise((resolve) => server.close(resolve));
    return port;
  }
  async function waitForExit(child, timeoutMs) {
    if (child.exitCode !== null || child.signalCode !== null) return true;
    return Promise.race([
      once(child, 'exit').then(() => true),
      delay(timeoutMs).then(() => false),
    ]);
  }

  const port = await freePort();
  let chromeStderr = '';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--log-level=3',
    `--user-data-dir=${path.join(tmp, 'chrome-profile')}`,
    '--remote-debugging-address=127.0.0.1',
    `--remote-debugging-port=${port}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  chromeProcess.stderr.setEncoding('utf8');
  chromeProcess.stderr.on('data', (chunk) => {
    chromeStderr = `${chromeStderr}${chunk}`.slice(-32 * 1024);
  });

  let cdp;
  let targetId;
  try {
    let endpoint;
    for (let attempt = 0; attempt < 100 && !endpoint; attempt += 1) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (response.ok) endpoint = (await response.json()).webSocketDebuggerUrl;
      } catch (_) {}
      if (!endpoint) await delay(50);
    }
    assert.ok(endpoint, `Chrome DevTools missing${chromeStderr ? `: ${chromeStderr}` : ''}`);

    const socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    let nextId = 0;
    const pending = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id || !pending.has(message.id)) return;
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    });
    cdp = {
      socket,
      send(method, params = {}, sessionId) {
        const id = ++nextId;
        return new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
          socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
        });
      },
    };
    ({ targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' }));
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.navigate', { url: pathToFileURL(output).href }, sessionId);

    let ready = false;
    for (let attempt = 0; attempt < 100 && !ready; attempt += 1) {
      const response = await cdp.send('Runtime.evaluate', {
        expression: 'document.readyState === "complete" && !!(window.Mosofin && Mosofin.motion && Mosofin.motion.canRecord() && Mosofin.motionScenes)',
        returnByValue: true,
      }, sessionId);
      ready = response.result?.value === true;
      if (!ready) await delay(50);
    }
    assert.equal(ready, true, 'ledger City did not expose motion recording');

    const payload = await cdp.send('Runtime.evaluate', {
      expression: String.raw`(async function () {
        try {
          var scenes = Mosofin.motionScenes;
          var data = scenes.payload();
          if (!data || !data.schedule.length) throw new Error('missing ledger schedule');
          var duration = Math.min(1400, scenes.ledgerDurationMs(data));
          var blob = await Mosofin.motion.recordWebm({ duration: duration, fps: 10 });
          return {
            ok: true,
            type: blob.type,
            size: blob.size,
            scene: document.documentElement.getAttribute('data-last-motion-scene'),
            kinds: scenes.kinds,
            durationMs: scenes.ledgerDurationMs(data),
            roads: document.querySelectorAll('.city-road[data-edge-id]').length,
            schedule: data.schedule.length
          };
        } catch (error) {
          return { ok: false, error: String(error && error.message || error) };
        }
      })()`,
      awaitPromise: true,
      returnByValue: true,
    }, sessionId);
    if (payload.exceptionDetails) {
      throw new Error(payload.exceptionDetails.exception?.description || payload.exceptionDetails.text || 'evaluate failed');
    }
    const result = payload.result?.value;
    assert.equal(result?.ok, true, result?.error || 'ledger WebM failed');
    assert.match(result.type, /^video\/webm/);
    assert.ok(result.size > 1000, `WebM unexpectedly small (${result.size})`);
    assert.equal(result.scene, 'ledger');
    assert.deepEqual(result.kinds, ['trace', 'ledger']);
    assert.ok(result.roads > 0);
    assert.ok(result.schedule > 0);
    assert.equal(result.durationMs, motionDurationMs(viewerPayload(cityFixture, summarize(cityFixture))));
  } finally {
    if (cdp && targetId) {
      try { await cdp.send('Target.closeTarget', { targetId }); } catch (_) {}
    }
    if (cdp) cdp.socket.close();
    chromeProcess.kill('SIGTERM');
    if (!(await waitForExit(chromeProcess, 1000))) {
      chromeProcess.kill('SIGKILL');
      await waitForExit(chromeProcess, 1000);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
