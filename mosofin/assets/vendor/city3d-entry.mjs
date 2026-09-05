/**
 * Mosofin City 3D scene (Three.js). Mounted by Mosofin.city3d in the viewer.
 * Layout mirrors City Sim: account district from stage/row, entity ring, roads between accounts.
 * Health colors come from authored tie-out scores only (null → grey).
 */
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

const SILHOUETTE_H = {
  vault: 1.15,
  warehouse: 1.35,
  office: 1.55,
  tower: 2.4,
  storefront: 1.25,
  shop: 1.2,
  bank: 1.7,
  townhall: 1.9,
  house: 1.1,
  terminal: 0.95,
  block: 1.05,
};

const CLASS_COLOR = {
  asset: 0x3b82f6,
  liability: 0xf59e0b,
  equity: 0xa78bfa,
  revenue: 0x22c55e,
  contra: 0xf97316,
  expense: 0xef4444,
  customer: 0x94a3b8,
  vendor: 0x94a3b8,
  bank: 0x64748b,
  lender: 0x64748b,
  government: 0x64748b,
  employee: 0x64748b,
  owner: 0x64748b,
  processor: 0x64748b,
  other: 0x64748b,
};

/** @param {number|null|undefined} score 0..1 or null/undefined for unknown */
export function cityHealthColor(score) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) {
    return { r: 148, g: 163, b: 184, hex: 0x94a3b8, css: 'rgb(148, 163, 184)', unknown: true };
  }
  const t = Math.max(0, Math.min(1, Number(score)));
  const r = t < 0.5 ? 220 : Math.round(220 + (22 - 220) * ((t - 0.5) * 2));
  const g = t < 0.5 ? Math.round(38 + (179 - 38) * (t * 2)) : Math.round(179 + (163 - 179) * ((t - 0.5) * 2));
  const b = t < 0.5 ? Math.round(38 + (8 - 38) * (t * 2)) : Math.round(8 + (74 - 8) * ((t - 0.5) * 2));
  const hex = (r << 16) | (g << 8) | b;
  return { r, g, b, hex, css: `rgb(${r}, ${g}, ${b})`, unknown: false, score: t };
}

function silhouetteForAccount(account) {
  if (account.cash) return 'vault';
  if (account.class === 'asset' && /inventor/i.test(`${account.label || ''} ${account.id || ''}`)) return 'warehouse';
  if (account.class === 'asset' && /\ba\/?r\b|receivable/i.test(`${account.label || ''} ${account.id || ''}`)) return 'office';
  const map = { asset: 'warehouse', liability: 'office', equity: 'tower', revenue: 'storefront', contra: 'storefront', expense: 'office' };
  return map[account.class] || 'office';
}

function entitySilhouette(cls, grouped) {
  if (grouped) return 'block';
  const map = { customer: 'shop', vendor: 'warehouse', bank: 'bank', lender: 'tower', government: 'townhall', employee: 'house', owner: 'tower', processor: 'terminal', other: 'block' };
  return map[cls] || 'block';
}

function buildLayout(data) {
  const accounts = Array.isArray(data.accounts) ? data.accounts : [];
  const entities = Array.isArray(data.entities) ? data.entities : [];
  const flows = Array.isArray(data.flows) ? data.flows : [];
  const healthMap = (data.city && data.city.health) || {};
  const kindMap = (data.city && data.city.kinds) || {};
  const stageMap = (data.city && data.city.stages) || {};
  const rowMap = (data.city && data.city.rows) || {};

  const stages = accounts.map((a) => Number(stageMap[a.id] != null ? stageMap[a.id] : a.stage) || 0);
  const rows = accounts.map((a) => Number(rowMap[a.id] != null ? rowMap[a.id] : a.row) || 0);
  const maxStage = Math.max(0, ...stages, 0);
  const maxRow = Math.max(0, ...rows, 0);
  const spacing = 3.2;
  const accountMeshes = new Map();

  for (const account of accounts) {
    const stage = Number(stageMap[account.id] != null ? stageMap[account.id] : account.stage) || 0;
    const row = Number(rowMap[account.id] != null ? rowMap[account.id] : account.row) || 0;
    const col = stage - maxStage / 2;
    const rz = row - maxRow / 2;
    const kind = kindMap[account.id] || silhouetteForAccount(account);
    const health = Object.prototype.hasOwnProperty.call(healthMap, account.id) ? healthMap[account.id] : null;
    accountMeshes.set(account.id, {
      id: account.id,
      label: account.label || account.id,
      class: account.class,
      cash: !!account.cash,
      kind,
      health,
      role: 'account',
      x: col * spacing,
      z: rz * spacing,
    });
  }

  const byClass = new Map();
  for (const entity of entities) {
    if (!byClass.has(entity.class)) byClass.set(entity.class, []);
    byClass.get(entity.class).push(entity);
  }
  const classOrder = ['customer', 'vendor', 'bank', 'processor', 'government', 'employee', 'lender', 'owner', 'other'];
  const present = classOrder.filter((c) => byClass.has(c));
  const ringRadius = Math.max(maxStage, maxRow) * 1.15 + 7.5;
  const entityMeshes = new Map();
  present.forEach((cls, classIndex) => {
    const list = byClass.get(cls);
    const sector = (classIndex / Math.max(1, present.length)) * Math.PI * 2 - Math.PI / 2;
    list.forEach((entity, entityIndex) => {
      const spread = (entityIndex - (list.length - 1) / 2) * 0.55;
      const angle = sector + spread * 0.22;
      const kind = kindMap[entity.id] || entitySilhouette(cls, entity.grouped && entity.grouped > 1);
      const health = Object.prototype.hasOwnProperty.call(healthMap, entity.id) ? healthMap[entity.id] : null;
      entityMeshes.set(entity.id, {
        id: entity.id,
        label: entity.label || entity.id,
        class: cls,
        kind,
        health,
        role: 'entity',
        grouped: entity.grouped || null,
        x: Math.cos(angle) * ringRadius,
        z: Math.sin(angle) * ringRadius,
      });
    });
  });

  const roads = flows.map((flow) => {
    const from = accountMeshes.get(flow.from);
    const to = accountMeshes.get(flow.to);
    if (!from || !to) return null;
    return { id: flow.id, from: flow.from, to: flow.to, label: flow.label || flow.id, a: from, b: to };
  }).filter(Boolean);

  return { accounts: accountMeshes, entities: entityMeshes, roads };
}

function makeBuildingMesh(item) {
  const h = (SILHOUETTE_H[item.kind] || 1.3) * (item.cash ? 1.2 : 1);
  const w = item.role === 'entity' ? 1.05 : (item.cash ? 1.45 : 1.25);
  const d = w * 0.9;
  const geo = new THREE.BoxGeometry(w, h, d);
  const tint = cityHealthColor(item.health);
  const base = CLASS_COLOR[item.class] || 0x94a3b8;
  const color = tint.unknown ? new THREE.Color(base).lerp(new THREE.Color(0x94a3b8), 0.35) : new THREE.Color(tint.hex);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.08,
    emissive: tint.unknown ? 0x000000 : new THREE.Color(tint.hex).multiplyScalar(0.12),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(item.x, h / 2, item.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { id: item.id, role: item.role, baseColor: color.clone(), health: item.health, label: item.label };
  return mesh;
}

function roadCurve(a, b) {
  const mid = new THREE.Vector3((a.x + b.x) / 2, 0.2, (a.z + b.z) / 2);
  const dist = a.distanceTo(b);
  mid.y = 0.35 + Math.min(2.5, dist * 0.08);
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(a.x, 0.15, a.z),
    mid,
    new THREE.Vector3(b.x, 0.15, b.z),
  );
}

/**
 * @param {HTMLElement} host
 * @param {{ data: object, follow?: boolean }} options
 */
export function createCity3D(host, options = {}) {
  const data = options.data || {};
  const layout = buildLayout(data);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);
  scene.fog = new THREE.Fog(0x0b1220, 28, 70);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
  camera.position.set(14, 12, 16);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  renderer.domElement.setAttribute('data-ledger-city3d-canvas', '');

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 6;
  controls.maxDistance = 48;
  controls.target.set(0, 0.5, 0);

  const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x1a1f2b, 0.85);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(12, 22, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x152033, roughness: 0.95, metalness: 0.02 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(64, 32, 0x2a3a55, 0x1c2a40);
  grid.position.y = 0.01;
  scene.add(grid);

  const buildingGroup = new THREE.Group();
  const buildings = new Map();
  for (const item of layout.accounts.values()) {
    const mesh = makeBuildingMesh(item);
    buildingGroup.add(mesh);
    buildings.set(item.id, mesh);
  }
  for (const item of layout.entities.values()) {
    const mesh = makeBuildingMesh(item);
    buildingGroup.add(mesh);
    buildings.set(item.id, mesh);
  }
  scene.add(buildingGroup);

  const roadGroup = new THREE.Group();
  const roadCurves = new Map();
  for (const road of layout.roads) {
    const curve = roadCurve(
      new THREE.Vector3(road.a.x, 0, road.a.z),
      new THREE.Vector3(road.b.x, 0, road.b.z),
    );
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.08, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, metalness: 0.05 }),
    );
    tube.userData = { edgeId: road.id, from: road.from, to: road.to, active: false };
    roadGroup.add(tube);
    roadCurves.set(road.id, curve);
  }
  scene.add(roadGroup);

  const labelGroup = new THREE.Group();
  function makeLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = 'rgba(8,12,20,0.72)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(8, 12, 240, 40, 8);
      ctx.fill();
    } else {
      ctx.fillRect(8, 12, 240, 40);
    }
    ctx.fillStyle = '#e8eef8';
    ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(text).slice(0, 22), 128, 34);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.8, 0.7, 1);
    return sprite;
  }
  for (const item of layout.accounts.values()) {
    const sprite = makeLabel(item.label);
    const mesh = buildings.get(item.id);
    const h = mesh ? mesh.geometry.parameters.height : 1.4;
    sprite.position.set(item.x, h + 0.55, item.z);
    labelGroup.add(sprite);
  }
  scene.add(labelGroup);

  const vehicleGroup = new THREE.Group();
  scene.add(vehicleGroup);
  const activeVehicles = [];

  let follow = options.follow === true;
  let playing = false;
  let raf = 0;
  let disposed = false;
  let pulseId = null;
  let pulseUntil = 0;

  function resize() {
    const w = Math.max(1, host.clientWidth || host.offsetWidth || 1);
    const h = Math.max(1, host.clientHeight || host.offsetHeight || 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function setDimmed(on) {
    const opacity = on ? 0.28 : 1;
    buildings.forEach((mesh) => {
      mesh.material.transparent = on;
      mesh.material.opacity = mesh.userData.active ? 1 : opacity;
    });
    roadGroup.children.forEach((tube) => {
      tube.material.transparent = on;
      tube.material.opacity = tube.userData.active ? 1 : (on ? 0.18 : 1);
    });
  }

  function clearVehicles() {
    while (vehicleGroup.children.length) {
      const child = vehicleGroup.children[0];
      vehicleGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    activeVehicles.length = 0;
  }

  function launchVehicle(item, durationMs) {
    const edgeId = item.edgeId;
    const curve = roadCurves.get(edgeId);
    if (!curve) return;
    const color = item.series === 'scenario' ? 0xfbbf24 : (item.direction === 'reverse' ? 0xf87171 : 0x4ade80);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.22, 0.28),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        transparent: item.series === 'scenario',
        opacity: item.series === 'scenario' ? 0.55 : 1,
      }),
    );
    vehicleGroup.add(mesh);
    const reverse = item.direction === 'reverse';
    const fromId = reverse ? item.to : item.from;
    const toId = reverse ? item.from : item.to;
    if (buildings.has(fromId)) buildings.get(fromId).userData.active = true;
    if (buildings.has(toId)) buildings.get(toId).userData.active = true;
    roadGroup.children.forEach((tube) => {
      if (tube.userData.edgeId === edgeId) tube.userData.active = true;
    });
    activeVehicles.push({
      mesh,
      curve,
      start: performance.now(),
      duration: Math.max(250, durationMs || 700),
      reverse,
      toId,
      series: item.series,
    });
  }

  function syncDay(dayIndex, opts = {}) {
    clearVehicles();
    buildings.forEach((m) => { m.userData.active = false; });
    roadGroup.children.forEach((t) => { t.userData.active = false; });
    pulseId = null;
    const frozen = opts.frozen === true;
    const schedule = Array.isArray(data.schedule) ? data.schedule : [];
    const tickMs = 1000 / Math.max(0.5, Number((data.playback && data.playback.daysPerSecond) || 2));
    const durationMs = Math.max(250, Math.min(tickMs, 900));
    for (let i = 0; i < schedule.length; i += 1) {
      const item = schedule[i];
      if (item.day !== dayIndex) continue;
      if (!frozen) launchVehicle(item, durationMs);
      else {
        const edgeId = item.edgeId;
        roadGroup.children.forEach((tube) => {
          if (tube.userData.edgeId === edgeId) tube.userData.active = true;
        });
        const reverse = item.direction === 'reverse';
        const a = reverse ? item.to : item.from;
        const b = reverse ? item.from : item.to;
        if (buildings.has(a)) buildings.get(a).userData.active = true;
        if (buildings.has(b)) buildings.get(b).userData.active = true;
      }
    }
    const scenarios = Array.isArray(data.scenarios) ? data.scenarios : [];
    const scenarioId = opts.scenarioId || null;
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario && Array.isArray(scenario.schedule) && !frozen) {
      for (let si = 0; si < scenario.schedule.length; si += 1) {
        const projected = scenario.schedule[si];
        if (projected.day !== dayIndex) continue;
        launchVehicle(projected, durationMs);
      }
    }
    setDimmed(playing && !frozen);
  }

  function setPlaying(next) {
    playing = next === true;
    setDimmed(playing);
    if (!playing) {
      buildings.forEach((m) => { m.material.transparent = false; m.material.opacity = 1; });
      roadGroup.children.forEach((t) => { t.material.transparent = false; t.material.opacity = 1; });
    }
  }

  function setFollow(next) {
    follow = next === true;
  }

  function tickVehicles(now) {
    let followPos = null;
    for (let i = activeVehicles.length - 1; i >= 0; i -= 1) {
      const v = activeVehicles[i];
      const t = (now - v.start) / v.duration;
      if (t >= 1) {
        pulseId = v.toId;
        pulseUntil = now + 360;
        vehicleGroup.remove(v.mesh);
        if (v.mesh.geometry) v.mesh.geometry.dispose();
        if (v.mesh.material) v.mesh.material.dispose();
        activeVehicles.splice(i, 1);
        continue;
      }
      const u = v.reverse ? 1 - t : t;
      const clamped = Math.max(0, Math.min(1, u));
      const p = v.curve.getPointAt(clamped);
      const tangent = v.curve.getTangentAt(clamped);
      v.mesh.position.copy(p);
      v.mesh.position.y += 0.2;
      v.mesh.lookAt(p.clone().add(tangent));
      followPos = p;
    }
    if (pulseId && buildings.has(pulseId) && now < pulseUntil) {
      const mesh = buildings.get(pulseId);
      const pulse = 0.5 + 0.5 * Math.sin(((pulseUntil - now) / 360) * Math.PI * 4);
      mesh.material.emissiveIntensity = 0.15 + pulse * 0.7;
    } else if (pulseId && now >= pulseUntil) {
      if (buildings.has(pulseId)) buildings.get(pulseId).material.emissiveIntensity = 0.12;
      pulseId = null;
    }
    if (follow && followPos) {
      const desired = followPos.clone().add(new THREE.Vector3(4.5, 5.5, 4.5));
      camera.position.lerp(desired, 0.06);
      controls.target.lerp(followPos, 0.08);
    }
  }

  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    tickVehicles(now || performance.now());
    controls.update();
    renderer.render(scene, camera);
  }

  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : null;
  if (ro) ro.observe(host);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  raf = requestAnimationFrame(frame);

  const box = new THREE.Box3().setFromObject(buildingGroup);
  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    camera.position.set(center.x + 14, center.y + 11, center.z + 15);
    controls.update();
  }

  return {
    webgl: true,
    syncDay,
    setPlaying,
    setFollow,
    resize,
    renderer,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (ro) ro.disconnect();
      clearVehicles();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    },
  };
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (_) {
    return false;
  }
}

export default { createCity3D, cityHealthColor, webglAvailable };
