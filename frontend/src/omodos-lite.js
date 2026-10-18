import * as THREE from 'three';
import { MACHINE_REGISTRY } from './data/machine-registry.js';

const params = new URLSearchParams(location.search);
if (params.get('mode') === 'omodos-lite') {
  document.body.classList.add('omodos-lite');
  document.title = 'OMODOS · Factory Digital Twin Lite';

  const allowedParentOrigins = new Set(['https://omodos.juldigi.workers.dev']);
  const style = document.createElement('style');
  style.id = 'omodos-lite-style';
  style.textContent = [
    'html,body{width:100%;height:100%;min-height:100%;margin:0!important;overflow:hidden!important;background:#e8eef2!important}',
    '.app-splash,body>header,#main-navigation,.scene-heading,.scene-bottom,.scene-caption,.viewport-mode-switch,.viewport-zoom,#detail-panel,.mobile-nav,.statusbar,#ui-backdrop,#modal,#toast,#plant-plan-2d,#part-label-layer,#choose-machine{display:none!important}',
    '.twin-shell{display:block!important;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;margin:0!important;padding:0!important;overflow:hidden!important}',
    '.center-stack{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important}',
    '.workspace{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;overflow:hidden!important}',
    '#viewport{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;overflow:hidden!important;background:#e8eef2!important}',
    '#viewport>canvas{display:block!important;width:100%!important;height:100%!important;outline:none!important}',
    '#omodos-lite-status-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:20;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '#omodos-lite-leaders{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.omodos-lite-card{position:absolute;box-sizing:border-box;width:clamp(96px,9vw,128px);min-height:38px;padding:5px 7px 6px;border:1px solid rgba(255,255,255,.8);border-radius:9px;background:rgba(12,29,43,.94);box-shadow:0 3px 10px rgba(7,24,38,.22);color:#f5fbff;white-space:normal;overflow:hidden;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
    '.omodos-lite-card[data-status="kritikal"]{border-color:#fb7185;box-shadow:0 0 0 1px rgba(244,63,94,.36),0 3px 12px rgba(127,29,29,.22)}',
    '.omodos-lite-card[data-status="perhatian"]{border-color:#fbbf24;box-shadow:0 0 0 1px rgba(245,158,11,.3),0 3px 12px rgba(120,53,15,.18)}',
    '.omodos-lite-card[data-status="normal"]{border-color:#34d399}',
    '.omodos-lite-name{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:750;line-height:1.25;letter-spacing:.005em}',
    '.omodos-lite-meta{display:flex;align-items:center;gap:4px;margin-top:3px;min-width:0;font-size:9px;line-height:1.2;font-weight:650;color:#d6e3ed}',
    '.omodos-lite-dot{width:6px;height:6px;flex:0 0 6px;border-radius:50%;background:#a6b4c2}',
    '.omodos-lite-card[data-status="normal"] .omodos-lite-dot{background:#34d399}',
    '.omodos-lite-card[data-status="perhatian"] .omodos-lite-dot{background:#fbbf24}',
    '.omodos-lite-card[data-status="kritikal"] .omodos-lite-dot{background:#fb7185}',
    '@media(max-width:767px){.omodos-lite-card{width:96px;min-height:35px;padding:4px 5px 5px;border-radius:7px}.omodos-lite-name{font-size:9px}.omodos-lite-meta{font-size:8px;margin-top:2px}}',
    '@media(prefers-reduced-transparency:reduce){.omodos-lite-card{backdrop-filter:none;-webkit-backdrop-filter:none}}'
  ].join('\n');
  document.head.appendChild(style);

  const viewport = document.getElementById('viewport');
  let overlay = null;
  let leaders = null;
  let modelCards = new Map();
  let statusByMachine = new Map();
  let activeFactory = null;
  let engine = null;
  let lastWidth = 0;
  let lastHeight = 0;

  const normalize = value => String(value == null ? '' : value)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]+/g, '');
  const statusOrder = key => ({ kritikal: 0, perhatian: 1, normal: 2, none: 3 }[key] ?? 3);
  const statusText = key => ({
    kritikal: 'Kritikal',
    perhatian: 'Perlu Perhatian',
    normal: 'Normal',
    none: 'Belum ada data'
  }[key] || 'Belum ada data');

  function machineMatch(payload) {
    const records = Array.isArray(payload) ? payload : [];
    const registryByCode = new Map();
    const registryByName = new Map();
    for (const machine of MACHINE_REGISTRY) {
      const code = normalize(machine.sapCode);
      const name = normalize(machine.name);
      if (code) registryByCode.set(code, [...(registryByCode.get(code) || []), machine]);
      if (name) registryByName.set(name, [...(registryByName.get(name) || []), machine]);
    }
    const result = new Map();
    for (const record of records) {
      if (!record || typeof record !== 'object') continue;
      const code = normalize(record.code);
      const name = normalize(record.name);
      let candidates = code ? (registryByCode.get(code) || []) : [];
      if (candidates.length !== 1 && name) candidates = registryByName.get(name) || [];
      if (candidates.length !== 1) continue;
      const machine = candidates[0];
      const status = ['kritikal', 'perhatian', 'normal'].includes(record.status) ? record.status : 'none';
      result.set(machine.machineId, {
        code: String(record.code || machine.sapCode || ''),
        name: String(record.name || machine.name || ''),
        status,
        label: statusText(status),
        source: String(record.source || ''),
        timestamp: Number.isFinite(Number(record.timestamp)) ? Number(record.timestamp) : null
      });
    }
    return result;
  }

  function receiveMessage(event) {
    if (event.source !== window.parent || !allowedParentOrigins.has(event.origin)) return;
    const data = event.data;
    if (!data || data.type !== 'OMODOS_MACHINE_STATUS_V1' || !Array.isArray(data.machines)) return;
    statusByMachine = machineMatch(data.machines);
    renderStatusIntoCards();
  }
  window.addEventListener('message', receiveMessage);

  function createOverlay() {
    if (!viewport || overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'omodos-lite-status-overlay';
    overlay.setAttribute('aria-label', 'Status mesin dari OMODOS');
    leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leaders.id = 'omodos-lite-leaders';
    leaders.setAttribute('aria-hidden', 'true');
    overlay.appendChild(leaders);
    viewport.appendChild(overlay);
  }

  function renderStatusIntoCards() {
    for (const [machineId, record] of statusByMachine) {
      const el = modelCards.get(machineId);
      if (!el) continue;
      const shortName = record.name || MACHINE_REGISTRY.find(m => m.machineId === machineId)?.name || machineId;
      el.dataset.status = record.status;
      el.querySelector('.omodos-lite-name').textContent = shortName;
      el.querySelector('.omodos-lite-name').title = (record.code ? record.code + ' · ' : '') + shortName;
      el.querySelector('.omodos-lite-meta-label').textContent = statusText(record.status);
      el.title = (record.code ? record.code + ' · ' : '') + shortName + ' — ' + statusText(record.status) +
        (record.source ? ' · Sumber: ' + record.source : '');
    }
  }

  function configureLayers(nextEngine) {
    const factory = nextEngine?.actualFactory;
    if (!factory?.layers || !factory?.assets) return false;
    if (activeFactory === factory) return true;
    activeFactory = factory;
    for (const name of [
      'building', 'ipal', 'floor', 'walls', 'doors', 'windows', 'air_curtain',
      'furniture', 'roof', 'labels', 'landscape', 'reference',
      'utility_compressed_air', 'utility_ahu_piping', 'utility_ahu_ducting', 'utility_anchors'
    ]) {
      nextEngine.setFactoryLayer(name, false);
    }
    nextEngine.setFactoryLayer('machines', true);
    nextEngine.setFactoryLayer('unidentified', true);

    // The unidentified layer also contains a large context marker; retain only
    // the actual machine roots registered by the layout, not that marker.
    const assetRoots = new Set([...factory.assets.values()]);
    const unknownLayer = factory.layers.unidentified;
    if (unknownLayer?.children) {
      for (const child of unknownLayer.children) {
        if (!assetRoots.has(child)) child.visible = false;
      }
    }
    nextEngine.labels = false;
    nextEngine.onFactorySelect = null;
    nextEngine.onSelect = () => {};
    nextEngine.onTaxonomySelect = null;
    nextEngine.isolated = false;
    return true;
  }

  function makeCard(machineId, asset) {
    const record = MACHINE_REGISTRY.find(item => item.machineId === machineId);
    const card = document.createElement('div');
    card.className = 'omodos-lite-card';
    card.dataset.status = 'none';
    card.dataset.machineId = machineId;
    card.innerHTML = '<span class="omodos-lite-name"></span><span class="omodos-lite-meta"><i class="omodos-lite-dot"></i><span class="omodos-lite-meta-label">Belum ada data</span></span>';
    card.querySelector('.omodos-lite-name').textContent = record?.name || asset?.name || machineId;
    card.title = (record?.sapCode ? record.sapCode + ' · ' : '') + (record?.name || machineId);
    overlay.appendChild(card);
    modelCards.set(machineId, card);
  }

  function syncCards(nextEngine) {
    const assets = nextEngine?.actualFactory?.assets;
    if (!(assets instanceof Map)) return;
    for (const [machineId, asset] of assets) {
      if (!modelCards.has(machineId)) makeCard(machineId, asset);
    }
    renderStatusIntoCards();
  }

  const offsets = [
    [0, -8], [0, -48], [0, -88], [52, -34], [-52, -34],
    [88, -10], [-88, -10], [0, 32], [52, -78], [-52, -78],
    [112, -34], [-112, -34], [0, -128], [52, 4], [-52, 4],
    [150, -76], [-150, -76], [88, 30], [-88, 30], [0, 72],
    [0, -168], [170, -34], [-170, -34]
  ];

  function intersects(a, b, pad = 3) {
    return a.left < b.right + pad && a.right + pad > b.left &&
      a.top < b.bottom + pad && a.bottom + pad > b.top;
  }

  function projectCards() {
    if (!engine || !overlay || !leaders || document.hidden) return;
    const factory = engine.actualFactory;
    if (!factory?.assets || engine.view !== 'factory' || !engine.factory.visible) {
      overlay.style.visibility = 'hidden';
      return;
    }
    overlay.style.visibility = 'visible';
    const width = viewport.clientWidth, height = viewport.clientHeight;
    if (width < 2 || height < 2) return;
    if (width !== lastWidth || height !== lastHeight) {
      lastWidth = width; lastHeight = height;
      engine.resize();
    }

    const projected = [];
    for (const [machineId, object] of factory.assets) {
      const card = modelCards.get(machineId);
      if (!card || !engine.isObjectVisible(object)) {
        if (card) card.style.display = 'none';
        continue;
      }
      object.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(object);
      if (box.isEmpty()) { card.style.display = 'none'; continue; }
      const point = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y + 0.24, (box.min.z + box.max.z) / 2);
      point.project(engine.camera);
      if (point.z < -1 || point.z > 1 || point.x < -1.08 || point.x > 1.08 || point.y < -1.08 || point.y > 1.08) {
        card.style.display = 'none';
        continue;
      }
      const record = statusByMachine.get(machineId) || {status: 'none'};
      projected.push({
        machineId, card, status: record.status || 'none',
        x: (point.x * .5 + .5) * width,
        y: (-point.y * .5 + .5) * height,
        priority: statusOrder(record.status || 'none')
      });
    }

    projected.sort((a, b) => a.priority - b.priority ||
      (Math.abs(a.x - width / 2) + Math.abs(a.y - height / 2)) -
      (Math.abs(b.x - width / 2) + Math.abs(b.y - height / 2)));

    const placed = [], lineMarkup = [];
    const mobile = width < 768;
    const cardWidth = mobile ? 96 : Math.max(110, Math.min(128, width * .095));
    const cardHeight = mobile ? 35 : 38;
    for (const item of projected) {
      const card = item.card;
      card.style.display = 'block';
      card.style.width = cardWidth + 'px';
      card.style.minHeight = cardHeight + 'px';
      let chosen = null;
      for (const [dx, dy] of offsets) {
        const left = item.x + dx - cardWidth / 2;
        const top = item.y + dy - cardHeight;
        const rect = {left, top, right: left + cardWidth, bottom: top + cardHeight};
        if (left < 2 || top < 2 || rect.right > width - 2 || rect.bottom > height - 2) continue;
        if (placed.some(other => intersects(rect, other))) continue;
        chosen = {left, top, right: rect.right, bottom: rect.bottom};
        const x2 = Math.max(left + 6, Math.min(left + cardWidth - 6, item.x));
        const y2 = Math.max(top + 2, Math.min(top + cardHeight - 2, item.y));
        lineMarkup.push('<line x1="' + item.x.toFixed(1) + '" y1="' + item.y.toFixed(1) +
          '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
          '" stroke="' + (item.priority === 0 ? '#fb7185' : item.priority === 1 ? '#fbbf24' : '#7894a6') +
          '" stroke-width="1" stroke-opacity=".78"/>');
        break;
      }
      if (!chosen) {
        // Do not stack callouts on top of one another; the card becomes visible
        // automatically when the supervisor zooms into that machine cluster.
        card.style.display = 'none';
        continue;
      }
      placed.push(chosen);
      card.style.left = chosen.left + 'px';
      card.style.top = chosen.top + 'px';
      card.dataset.status = item.status;
    }
    leaders.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    leaders.innerHTML = lineMarkup.join('');
  }

  function frame() {
    if (params.get('mode') !== 'omodos-lite') return;
    const candidate = window.__BMJ_OMODOS_LITE_ENGINE__;
    if (candidate) {
      engine = candidate;
      if (configureLayers(engine)) {
        createOverlay();
        syncCards(engine);
        projectCards();
      }
    }
    requestAnimationFrame(frame);
  }

  createOverlay();
  window.addEventListener('resize', () => { lastWidth = 0; lastHeight = 0; });
  frame();
}
