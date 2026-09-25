import * as T from 'three';

/**
 * BMJ Packaging Offset Digital Twin — Furniture Realism Kit v1
 * --------------------------------------------------------------------------
 * Standalone / merge-ready geometry builders ONLY.
 * This file does not modify placement, application state, UI, or the repository.
 * All geometry is an INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT until field photos
 * or measured dimensions are supplied.
 *
 * Coordinate convention: X=width, Y=height, Z=depth, floor at Y=0.
 * Three.js target: 0.180.x (core package only, no examples/addons dependency).
 */

export const FURNITURE_REALISM_VERSION = 'FRK-V1-2026-09-25';
export const ACCURACY = 'INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT';

const MAT = new Map();
function matKey(name, opts) { return `${name}:${JSON.stringify(opts)}`; }
export function furnitureMaterial(name, overrides = {}) {
  const presets = {
    powderLight: { color: 0xb8c0c1, roughness: 0.54, metalness: 0.42 },
    powderDark: { color: 0x47565d, roughness: 0.50, metalness: 0.48 },
    powderBlue: { color: 0x3b667d, roughness: 0.52, metalness: 0.42 },
    powderYellow: { color: 0xd0a51d, roughness: 0.48, metalness: 0.40 },
    powderRed: { color: 0xa83e39, roughness: 0.50, metalness: 0.38 },
    galvanized: { color: 0xa7b0b0, roughness: 0.38, metalness: 0.72 },
    stainless: { color: 0xc6cccb, roughness: 0.30, metalness: 0.78 },
    chrome: { color: 0xd5d9d8, roughness: 0.20, metalness: 0.90 },
    blackPolymer: { color: 0x22282c, roughness: 0.72, metalness: 0.03 },
    darkRubber: { color: 0x25282a, roughness: 0.92, metalness: 0.00 },
    greyRubber: { color: 0x4c5355, roughness: 0.90, metalness: 0.00 },
    meshFabric: { color: 0x4d626b, roughness: 0.92, metalness: 0.00 },
    seatFabric: { color: 0x5d7078, roughness: 0.95, metalness: 0.00 },
    laminateOak: { color: 0xa98763, roughness: 0.70, metalness: 0.01 },
    beechMultiplex: { color: 0xb78f63, roughness: 0.66, metalness: 0.01 },
    lightLaminate: { color: 0xd8d6ce, roughness: 0.68, metalness: 0.01 },
    darkLaminate: { color: 0x5b6466, roughness: 0.72, metalness: 0.02 },
    whiteCeramic: { color: 0xe9ebe7, roughness: 0.24, metalness: 0.00 },
    clearPlastic: { color: 0xdce9e7, roughness: 0.22, metalness: 0.00, transparent: true, opacity: 0.28, depthWrite: false },
    acrylicClear: { color: 0xd7e9ee, roughness: 0.12, metalness: 0.00, transparent: true, opacity: 0.36, depthWrite: false },
    paper: { color: 0xe9e5da, roughness: 0.94, metalness: 0.00 },
    kraft: { color: 0xb88b5a, roughness: 0.92, metalness: 0.00 },
    carton: { color: 0xc4a173, roughness: 0.92, metalness: 0.00 },
    woodPallet: { color: 0x8e6f4c, roughness: 0.96, metalness: 0.00 },
    labelWhite: { color: 0xf2f0e8, roughness: 0.82, metalness: 0.00 },
    screenDark: { color: 0x16242b, roughness: 0.26, metalness: 0.10, emissive: 0x0b171d, emissiveIntensity: 0.25 },
    lightPanel: { color: 0xf0eee3, roughness: 0.40, metalness: 0.00, emissive: 0xe7e1c9, emissiveIntensity: 0.65 },
    safetyGreen: { color: 0x3e765d, roughness: 0.60, metalness: 0.15 },
    safetyOrange: { color: 0xc9742f, roughness: 0.58, metalness: 0.18 },
  };
  const opts = { ...(presets[name] || presets.powderLight), ...overrides };
  const k = matKey(name, opts);
  if (!MAT.has(k)) MAT.set(k, new T.MeshStandardMaterial(opts));
  return MAT.get(k);
}

function tag(o, semantic, extra = {}) {
  o.name = semantic;
  o.userData = { semantic, accuracy: ACCURACY, researchVersion: FURNITURE_REALISM_VERSION, ...extra };
  return o;
}

function roundedRectShape(w, h, r) {
  const rr = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001));
  const x = -w / 2, y = -h / 2;
  const s = new T.Shape();
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y); s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr); s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
  return s;
}

export function roundedBox(w, h, d, r, material, bevel = 0.006) {
  const shape = roundedRectShape(w, h, r);
  const geo = new T.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: bevel > 0,
    bevelSegments: 2,
    steps: 1,
    bevelSize: Math.min(bevel, r * 0.45),
    bevelThickness: Math.min(bevel, d * 0.18),
  });
  geo.translate(0, 0, -d / 2);
  geo.computeVertexNormals();
  const mesh = new T.Mesh(geo, material);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function cube(w, h, d, material, semantic, pos = [0, 0, 0]) {
  const o = new T.Mesh(new T.BoxGeometry(w, h, d), material);
  o.position.set(...pos); o.castShadow = true; o.receiveShadow = true;
  return tag(o, semantic);
}
function cyl(rTop, rBot, h, material, semantic, pos = [0, 0, 0], radial = 20) {
  const o = new T.Mesh(new T.CylinderGeometry(rTop, rBot, h, radial), material);
  o.position.set(...pos); o.castShadow = true; o.receiveShadow = true;
  return tag(o, semantic);
}
function tube(a, c, radius, material, semantic, radial = 10) {
  const delta = new T.Vector3().subVectors(c, a); const len = delta.length();
  const o = new T.Mesh(new T.CylinderGeometry(radius, radius, len, radial), material);
  o.position.copy(a).add(c).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
  o.castShadow = true; return tag(o, semantic);
}
function hexBolt(r, h, material, semantic, pos, rotation = null) {
  const o = cyl(r, r, h, material, semantic, pos, 6);
  if (rotation) o.rotation.set(...rotation);
  return o;
}
function wheel(radius, width, material, semantic) {
  const g = new T.Group(); tag(g, semantic);
  const tire = cyl(radius, radius, width, material, `${semantic}_TIRE`); tire.rotation.z = Math.PI / 2; g.add(tire);
  const hub = cyl(radius * 0.31, radius * 0.31, width * 1.08, furnitureMaterial('galvanized'), `${semantic}_HUB`); hub.rotation.z = Math.PI / 2; g.add(hub);
  return g;
}
function caster({ radius = 0.037, width = 0.024, swivel = true } = {}) {
  const g = new T.Group(); tag(g, 'CASTER_ASSEMBLY');
  if (swivel) {
    g.add(cyl(0.026, 0.026, 0.025, furnitureMaterial('galvanized'), 'CASTER_SWIVEL_BEARING', [0, 0.055, 0]));
    const forkL = tube(new T.Vector3(-0.026, 0.05, 0), new T.Vector3(-0.026, 0.013, 0), 0.008, furnitureMaterial('galvanized'), 'CASTER_FORK_L');
    const forkR = tube(new T.Vector3(0.026, 0.05, 0), new T.Vector3(0.026, 0.013, 0), 0.008, furnitureMaterial('galvanized'), 'CASTER_FORK_R');
    g.add(forkL, forkR);
  }
  const w = wheel(radius, width, furnitureMaterial('darkRubber'), 'CASTER_WHEEL'); w.position.y = radius; g.add(w);
  return g;
}
function uHandle(width, height, radius, material, semantic) {
  const g = new T.Group(); tag(g, semantic);
  g.add(tube(new T.Vector3(-width / 2, 0, 0), new T.Vector3(-width / 2, height, 0), radius, material, `${semantic}_L`));
  g.add(tube(new T.Vector3(width / 2, 0, 0), new T.Vector3(width / 2, height, 0), radius, material, `${semantic}_R`));
  g.add(tube(new T.Vector3(-width / 2, height, 0), new T.Vector3(width / 2, height, 0), radius, material, `${semantic}_TOP`));
  return g;
}
function labelPlate(w = 0.18, h = 0.07, semantic = 'LABEL_PLATE') {
  const plate = roundedBox(w, h, 0.008, 0.006, furnitureMaterial('labelWhite'), 0.002); tag(plate, semantic);
  return plate;
}
function slottedVent(w, h, count, material, semantic) {
  const g = new T.Group(); tag(g, semantic);
  for (let i = 0; i < count; i++) {
    const slot = roundedBox(w, h / count * 0.30, 0.007, 0.004, material, 0.001);
    slot.position.y = -h / 2 + (i + 0.5) * (h / count);
    tag(slot, `${semantic}_SLOT_${i + 1}`); g.add(slot);
  }
  return g;
}
function place(g, x = 0, y = 0, z = 0, rotationY = 0) { g.position.set(x, y, z); g.rotation.y = rotationY; return g; }
function auditBounds(g, intendedFloorY = 0) {
  g.updateMatrixWorld(true); const b = new T.Box3().setFromObject(g);
  g.userData.bounds = { min: b.min.toArray(), max: b.max.toArray(), floorError: +(b.min.y - intendedFloorY).toFixed(5) };
  return g;
}

// ---------------------------------------------------------------------------
// OFFICE / ADMIN / PPIC / SUPERVISOR
// ---------------------------------------------------------------------------
export function buildTaskChair(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'ERGONOMIC_TASK_CHAIR', { referenceFamily: 'Steelcase Series-1-class ergonomic task chair' });
  const mFrame = furnitureMaterial('powderDark'), mSeat = furnitureMaterial('seatFabric'), mMesh = furnitureMaterial('meshFabric');
  const seatW = opts.seatW ?? 0.50, seatD = opts.seatD ?? 0.47, seatH = opts.seatH ?? 0.48;
  const seat = roundedBox(seatW, 0.075, seatD, 0.055, mSeat, 0.008); seat.position.y = seatH; seat.rotation.x = -0.025; tag(seat, 'TASK_CHAIR_CONTOURED_SEAT'); g.add(seat);
  const backShell = roundedBox(0.46, 0.55, 0.045, 0.055, mFrame, 0.006); backShell.position.set(0, seatH + 0.31, 0.21); backShell.rotation.x = -0.12; tag(backShell, 'TASK_CHAIR_BACK_SHELL'); g.add(backShell);
  const backPad = roundedBox(0.41, 0.48, 0.022, 0.05, mMesh, 0.004); backPad.position.set(0, seatH + 0.31, 0.182); backPad.rotation.x = -0.12; tag(backPad, 'TASK_CHAIR_BACK_MESH_OR_UPHOLSTERY'); g.add(backPad);
  const lumbar = roundedBox(0.30, 0.085, 0.026, 0.024, furnitureMaterial('powderLight'), 0.003); lumbar.position.set(0, seatH + 0.22, 0.16); lumbar.rotation.x = -0.12; tag(lumbar, 'TASK_CHAIR_ADJUSTABLE_LUMBAR'); g.add(lumbar);
  const stem = cyl(0.035, 0.043, seatH - 0.16, furnitureMaterial('chrome'), 'TASK_CHAIR_GAS_LIFT', [0, (seatH - 0.16) / 2 + 0.12, 0]); g.add(stem);
  g.add(cyl(0.083, 0.083, 0.065, mFrame, 'TASK_CHAIR_BASE_HUB', [0, 0.115, 0]));
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5, end = new T.Vector3(Math.cos(a) * 0.32, 0.072, Math.sin(a) * 0.32);
    g.add(tube(new T.Vector3(0, 0.105, 0), end, 0.018, mFrame, `TASK_CHAIR_BASE_LEG_${i + 1}`));
    const c = caster({ radius: 0.034, width: 0.024, swivel: true }); c.position.set(end.x, 0, end.z); c.rotation.y = -a; g.add(c);
  }
  for (const sx of [-1, 1]) {
    const post = tube(new T.Vector3(sx * (seatW / 2 + 0.025), seatH + 0.02, -0.02), new T.Vector3(sx * (seatW / 2 + 0.025), seatH + 0.25, -0.015), 0.018, mFrame, `TASK_CHAIR_ARM_POST_${sx}`); g.add(post);
    const arm = roundedBox(0.075, 0.03, 0.26, 0.018, furnitureMaterial('blackPolymer'), 0.003); arm.position.set(sx * (seatW / 2 + 0.025), seatH + 0.27, -0.015); tag(arm, `TASK_CHAIR_ARM_PAD_${sx}`); g.add(arm);
  }
  const lever = tube(new T.Vector3(0.13, seatH - 0.10, 0.00), new T.Vector3(0.23, seatH - 0.12, -0.02), 0.008, furnitureMaterial('blackPolymer'), 'TASK_CHAIR_HEIGHT_LEVER'); g.add(lever);
  return auditBounds(g);
}

export function buildVisitorChair(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'VISITOR_CHAIR');
  const m = furnitureMaterial('powderDark');
  const seat = roundedBox(0.47, 0.07, 0.45, 0.04, furnitureMaterial('seatFabric'), 0.006); seat.position.y = 0.45; tag(seat, 'VISITOR_CHAIR_SEAT'); g.add(seat);
  const back = roundedBox(0.46, 0.45, 0.05, 0.05, furnitureMaterial('meshFabric'), 0.005); back.position.set(0, 0.72, 0.20); back.rotation.x = -0.07; tag(back, 'VISITOR_CHAIR_BACK'); g.add(back);
  for (const sx of [-0.19, 0.19]) for (const sz of [-0.16, 0.16]) g.add(tube(new T.Vector3(sx, 0.04, sz), new T.Vector3(sx, 0.42, sz), 0.014, m, 'VISITOR_CHAIR_LEG'));
  for (const sx of [-0.25, 0.25]) {
    g.add(tube(new T.Vector3(sx, 0.44, 0.02), new T.Vector3(sx, 0.70, 0.02), 0.014, m, 'VISITOR_CHAIR_ARM_SUPPORT'));
    const cap = roundedBox(0.055, 0.028, 0.23, 0.015, furnitureMaterial('blackPolymer'), 0.002); cap.position.set(sx, 0.71, -0.02); tag(cap, 'VISITOR_CHAIR_ARM_CAP'); g.add(cap);
  }
  return auditBounds(g);
}

export function buildMonitor({ width = 0.54, height = 0.32, semantic = 'OFFICE_MONITOR' } = {}) {
  const g = new T.Group(); tag(g, semantic);
  const bezel = roundedBox(width, height, 0.035, 0.018, furnitureMaterial('blackPolymer'), 0.003); bezel.position.y = 0.31; tag(bezel, `${semantic}_BEZEL`); g.add(bezel);
  const screen = roundedBox(width - 0.035, height - 0.035, 0.009, 0.010, furnitureMaterial('screenDark'), 0.001); screen.position.set(0, 0.31, -0.022); tag(screen, `${semantic}_SCREEN`); g.add(screen);
  g.add(tube(new T.Vector3(0, 0.02, 0), new T.Vector3(0, 0.18, 0), 0.015, furnitureMaterial('powderDark'), `${semantic}_VESA_POST`));
  const base = roundedBox(0.25, 0.018, 0.18, 0.024, furnitureMaterial('powderDark'), 0.003); base.position.y = 0.015; tag(base, `${semantic}_BASE`); g.add(base);
  return g;
}

export function buildOfficeDesk(opts = {}) {
  const w = opts.width ?? 1.50, d = opts.depth ?? 0.75, h = opts.height ?? 0.74;
  const g = new T.Group(); tag(g, opts.semantic || 'OFFICE_DESK', { referenceFamily: 'Steelcase Ology-class desk proportions' });
  const top = roundedBox(w, 0.032, d, 0.018, furnitureMaterial(opts.topMaterial || 'lightLaminate'), 0.004); top.position.y = h; tag(top, 'OFFICE_DESK_WORKSURFACE'); g.add(top);
  const frameMat = furnitureMaterial('powderDark');
  for (const sx of [-w / 2 + 0.11, w / 2 - 0.11]) {
    const leg = roundedBox(0.065, h - 0.06, 0.065, 0.012, frameMat, 0.003); leg.position.set(sx, (h - 0.06) / 2, 0); tag(leg, 'OFFICE_DESK_LEG'); g.add(leg);
    const foot = roundedBox(0.50, 0.035, 0.07, 0.012, frameMat, 0.003); foot.position.set(sx, 0.035, 0.02); tag(foot, 'OFFICE_DESK_T_FOOT'); g.add(foot);
  }
  const tray = roundedBox(Math.min(w - 0.30, 1.10), 0.055, 0.17, 0.015, furnitureMaterial('powderDark'), 0.003); tray.position.set(0, h - 0.12, d / 2 - 0.14); tag(tray, 'OFFICE_DESK_CABLE_TRAY'); g.add(tray);
  const grommet = new T.Mesh(new T.TorusGeometry(0.043, 0.007, 8, 24), furnitureMaterial('blackPolymer')); grommet.rotation.x = Math.PI / 2; grommet.position.set(w * 0.31, h + 0.019, d * 0.30); tag(grommet, 'OFFICE_DESK_CABLE_GROMMET'); g.add(grommet);
  if (opts.modesty !== false) { const mp = roundedBox(w - 0.30, 0.33, 0.018, 0.012, furnitureMaterial('powderLight'), 0.003); mp.position.set(0, h - 0.24, d / 2 - 0.025); tag(mp, 'OFFICE_DESK_MODESTY_PANEL'); g.add(mp); }
  const monitor = buildMonitor(); monitor.position.set(-0.20, h + 0.02, d / 2 - 0.15); g.add(monitor);
  const keyboard = roundedBox(0.46, 0.022, 0.16, 0.014, furnitureMaterial('blackPolymer'), 0.002); keyboard.position.set(-0.08, h + 0.035, -0.04); tag(keyboard, 'OFFICE_KEYBOARD'); g.add(keyboard);
  const mouse = roundedBox(0.065, 0.035, 0.11, 0.026, furnitureMaterial('blackPolymer'), 0.003); mouse.position.set(0.31, h + 0.04, -0.04); tag(mouse, 'OFFICE_MOUSE'); g.add(mouse);
  return auditBounds(g);
}

export function buildMobilePedestal(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'OFFICE_MOBILE_PEDESTAL');
  const w = opts.width ?? 0.40, d = opts.depth ?? 0.54, h = opts.height ?? 0.61;
  const body = roundedBox(w, h, d, 0.018, furnitureMaterial('powderLight'), 0.004); body.position.y = h / 2 + 0.04; tag(body, 'PEDESTAL_CARCASS'); g.add(body);
  const drawers = [0.20, 0.18, 0.16], total = drawers.reduce((a, b) => a + b, 0); let y = 0.08;
  for (let i = 0; i < drawers.length; i++) {
    const dh = drawers[i] / total * (h - 0.05); const front = roundedBox(w - 0.03, dh - 0.012, 0.018, 0.008, furnitureMaterial('powderLight', { color: 0xaeb8b9 }), 0.002);
    front.position.set(0, 0.04 + y + dh / 2, -d / 2 - 0.008); tag(front, `PEDESTAL_DRAWER_${i + 1}`); g.add(front);
    const pull = roundedBox(0.18, 0.018, 0.025, 0.006, furnitureMaterial('powderDark'), 0.002); pull.position.set(0, front.position.y + dh * 0.22, -d / 2 - 0.026); tag(pull, `PEDESTAL_PULL_${i + 1}`); g.add(pull); y += dh;
  }
  for (const sx of [-w / 2 + 0.055, w / 2 - 0.055]) for (const sz of [-d / 2 + 0.055, d / 2 - 0.055]) { const c = caster({ radius: 0.023, width: 0.018 }); c.position.set(sx, 0, sz); c.scale.setScalar(0.8); g.add(c); }
  return auditBounds(g);
}

export function buildMFP(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'OFFICE_MULTIFUNCTION_PRINTER', { referenceFamily: 'Ricoh IM C-class floor standing MFP' });
  const w = opts.width ?? 0.587, d = opts.depth ?? 0.685, h = opts.height ?? 0.93;
  const lower = roundedBox(w, h * 0.63, d, 0.025, furnitureMaterial('powderLight'), 0.005); lower.position.y = h * 0.315 + 0.045; tag(lower, 'MFP_MAIN_CABINET'); g.add(lower);
  for (let i = 0; i < 3; i++) {
    const f = roundedBox(w - 0.055, 0.12, 0.018, 0.008, furnitureMaterial('powderLight', { color: 0xc5cbca }), 0.002); f.position.set(0, 0.18 + i * 0.145, -d / 2 - 0.008); tag(f, `MFP_PAPER_DRAWER_${i + 1}`); g.add(f);
    const pull = roundedBox(0.22, 0.018, 0.018, 0.006, furnitureMaterial('powderDark'), 0.002); pull.position.set(0, f.position.y + 0.02, -d / 2 - 0.025); tag(pull, 'MFP_DRAWER_HANDLE'); g.add(pull);
  }
  const printBody = roundedBox(w, 0.31, d * 0.92, 0.022, furnitureMaterial('powderLight'), 0.004); printBody.position.y = h * 0.68; tag(printBody, 'MFP_PRINT_ENGINE'); g.add(printBody);
  const output = roundedBox(w * 0.64, 0.10, d * 0.28, 0.012, furnitureMaterial('screenDark'), 0.003); output.position.set(-0.04, h * 0.67, -d * 0.33); tag(output, 'MFP_OUTPUT_CAVITY'); g.add(output);
  const scanner = roundedBox(w * 0.98, 0.08, d * 0.78, 0.022, furnitureMaterial('powderDark'), 0.004); scanner.position.set(0, h * 0.91, 0.01); tag(scanner, 'MFP_SCANNER_LID_ADF'); g.add(scanner);
  const panelStem = tube(new T.Vector3(w * 0.36, h * 0.77, -d * 0.26), new T.Vector3(w * 0.42, h * 0.91, -d * 0.32), 0.014, furnitureMaterial('powderDark'), 'MFP_CONTROL_ARM'); g.add(panelStem);
  const panel = roundedBox(0.23, 0.13, 0.025, 0.018, furnitureMaterial('blackPolymer'), 0.003); panel.position.set(w * 0.43, h * 0.94, -d * 0.33); panel.rotation.x = -0.18; tag(panel, 'MFP_TOUCH_PANEL'); g.add(panel);
  const display = roundedBox(0.19, 0.095, 0.008, 0.010, furnitureMaterial('screenDark', { emissiveIntensity: 0.40 }), 0.001); display.position.set(w * 0.43, h * 0.94, -d * 0.347); display.rotation.x = -0.18; tag(display, 'MFP_TOUCHSCREEN'); g.add(display);
  for (let i = 0; i < 8; i++) { const v = cube(0.009, 0.022, 0.07, furnitureMaterial('powderDark'), 'MFP_SIDE_VENT', [-w / 2 - 0.005, 0.30 + i * 0.035, 0.06]); g.add(v); }
  return auditBounds(g);
}

export function buildCredenza(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'OFFICE_CREDENZA');
  const w = opts.width ?? 1.6, d = opts.depth ?? 0.42, h = opts.height ?? 0.76;
  const body = roundedBox(w, h - 0.06, d, 0.018, furnitureMaterial('powderLight'), 0.004); body.position.y = (h - 0.06) / 2 + 0.05; tag(body, 'CREDENZA_CARCASS'); g.add(body);
  const top = roundedBox(w + 0.04, 0.035, d + 0.025, 0.014, furnitureMaterial('lightLaminate'), 0.004); top.position.y = h; tag(top, 'CREDENZA_TOP'); g.add(top);
  const n = 3; for (let i = 0; i < n; i++) { const fw = (w - 0.05) / n - 0.01; const door = roundedBox(fw, h - 0.16, 0.018, 0.010, furnitureMaterial('powderLight', { color: 0xa9b4b5 }), 0.002); door.position.set(-w / 2 + 0.025 + fw / 2 + i * (fw + 0.01), h / 2 + 0.015, -d / 2 - 0.009); tag(door, 'CREDENZA_DOOR'); g.add(door); const handle = roundedBox(0.018, 0.12, 0.024, 0.006, furnitureMaterial('powderDark'), 0.002); handle.position.set(door.position.x + fw * 0.32, h / 2 + 0.04, -d / 2 - 0.027); tag(handle, 'CREDENZA_HANDLE'); g.add(handle); }
  return auditBounds(g);
}

export function buildPlanningBoard(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PLANNING_BOARD'); const w = opts.width ?? 1.80, h = opts.height ?? 0.95;
  const panel = roundedBox(w, h, 0.035, 0.012, furnitureMaterial('labelWhite'), 0.003); panel.position.y = h / 2; tag(panel, 'PLANNING_BOARD_WRITING_SURFACE'); g.add(panel);
  for (const [x, y, ww, hh] of [[0, h / 2 + 0.025, w + 0.05, 0.035], [0, -h / 2 - 0.025, w + 0.05, 0.035], [-w / 2 - 0.025, 0, 0.035, h], [w / 2 + 0.025, 0, 0.035, h]]) { const f = roundedBox(ww, hh, 0.045, 0.006, furnitureMaterial('galvanized'), 0.002); f.position.set(x, y + h / 2, 0); tag(f, 'PLANNING_BOARD_FRAME'); g.add(f); }
  const tray = roundedBox(w * 0.42, 0.035, 0.075, 0.008, furnitureMaterial('galvanized'), 0.002); tray.position.set(0, 0.02, -0.045); tag(tray, 'PLANNING_BOARD_MARKER_TRAY'); g.add(tray);
  return g;
}

// ---------------------------------------------------------------------------
// QC / SAMPLE / PREPRESS
// ---------------------------------------------------------------------------
export function buildColorLightBooth(opts = {}) {
  // X-Rite Judge QC external reference: W .685 x D .535 x H .545 m.
  const g = new T.Group(); tag(g, opts.semantic || 'QC_COLOR_LIGHT_BOOTH', { referenceFamily: 'X-Rite Judge QC / Judge LED class', dimensionsM: [0.685, 0.545, 0.535] });
  const w = opts.width ?? 0.685, h = opts.height ?? 0.545, d = opts.depth ?? 0.535;
  const shell = furnitureMaterial('powderLight', { color: 0xb4b4b0, roughness: 0.68, metalness: 0.20 });
  const back = roundedBox(w, h, 0.035, 0.012, shell, 0.003); back.position.set(0, h / 2, d / 2); tag(back, 'LIGHT_BOOTH_MUNSELL_N7_BACK'); g.add(back);
  for (const sx of [-1, 1]) { const side = roundedBox(d, h, 0.032, 0.012, shell, 0.003); side.rotation.y = Math.PI / 2; side.position.set(sx * w / 2, h / 2, 0); tag(side, 'LIGHT_BOOTH_SIDE_PANEL'); g.add(side); }
  const floor = roundedBox(w, 0.03, d, 0.010, shell, 0.002); floor.position.y = 0.015; tag(floor, 'LIGHT_BOOTH_VIEWING_FLOOR'); g.add(floor);
  const canopy = roundedBox(w, 0.12, d, 0.018, furnitureMaterial('powderDark'), 0.004); canopy.position.y = h - 0.06; tag(canopy, 'LIGHT_BOOTH_LAMP_CANOPY'); g.add(canopy);
  const luminous = roundedBox(w * 0.82, 0.014, d * 0.62, 0.008, furnitureMaterial('lightPanel'), 0.002); luminous.position.set(0, h - 0.126, 0.05); tag(luminous, 'LIGHT_BOOTH_DIFFUSER'); g.add(luminous);
  const ctrl = roundedBox(0.22, 0.065, 0.025, 0.010, furnitureMaterial('blackPolymer'), 0.002); ctrl.position.set(w * 0.22, h - 0.055, -d / 2 - 0.012); tag(ctrl, 'LIGHT_BOOTH_CONTROL_PANEL'); g.add(ctrl);
  for (let i = 0; i < 5; i++) { const led = cyl(0.008, 0.008, 0.006, furnitureMaterial(i === 0 ? 'safetyGreen' : 'powderLight'), 'LIGHT_BOOTH_INDICATOR', [w * 0.13 + i * 0.025, h - 0.055, -d / 2 - 0.028], 12); led.rotation.x = Math.PI / 2; g.add(led); }
  return auditBounds(g);
}

export function buildQCBench(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'QC_INSPECTION_BENCH');
  const w = opts.width ?? 1.80, d = opts.depth ?? 0.75, h = opts.height ?? 0.85;
  const top = roundedBox(w, 0.045, d, 0.018, furnitureMaterial('lightLaminate'), 0.005); top.position.y = h; tag(top, 'QC_BENCH_WORKTOP'); g.add(top);
  const frame = furnitureMaterial('powderDark');
  for (const sx of [-w / 2 + 0.07, w / 2 - 0.07]) for (const sz of [-d / 2 + 0.07, d / 2 - 0.07]) g.add(tube(new T.Vector3(sx, 0.05, sz), new T.Vector3(sx, h - 0.02, sz), 0.023, frame, 'QC_BENCH_FRAME_LEG'));
  const shelf = roundedBox(w - 0.18, 0.035, d * 0.72, 0.010, furnitureMaterial('galvanized'), 0.003); shelf.position.set(0, 0.26, 0.08); tag(shelf, 'QC_BENCH_LOWER_SHELF'); g.add(shelf);
  const booth = buildColorLightBooth(); booth.position.set(0, h + 0.025, d * 0.04); g.add(booth);
  for (const sx of [-0.58, 0.58]) { const tray = roundedBox(0.38, 0.035, 0.28, 0.010, furnitureMaterial('acrylicClear'), 0.002); tray.position.set(sx, h + 0.04, -d * 0.31); tag(tray, 'QC_SAMPLE_TRAY'); g.add(tray); }
  return auditBounds(g);
}

export function buildLabStool(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'QC_LAB_STOOL');
  const seat = cyl(0.22, 0.22, 0.07, furnitureMaterial('seatFabric'), 'LAB_STOOL_SEAT', [0, 0.60, 0], 28); g.add(seat);
  g.add(cyl(0.035, 0.045, 0.48, furnitureMaterial('chrome'), 'LAB_STOOL_GAS_POST', [0, 0.34, 0]));
  const ring = new T.Mesh(new T.TorusGeometry(0.18, 0.016, 10, 28), furnitureMaterial('chrome')); ring.rotation.x = Math.PI / 2; ring.position.y = 0.24; tag(ring, 'LAB_STOOL_FOOT_RING'); g.add(ring);
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; g.add(tube(new T.Vector3(0, 0.10, 0), new T.Vector3(Math.cos(a) * 0.27, 0.055, Math.sin(a) * 0.27), 0.016, furnitureMaterial('powderDark'), 'LAB_STOOL_BASE_LEG')); }
  return auditBounds(g);
}

export function buildFlatFileCabinet(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PREPRESS_FLAT_FILE_CABINET'); const w = opts.width ?? 1.05, d = opts.depth ?? 0.67, h = opts.height ?? 0.87;
  const body = roundedBox(w, h, d, 0.018, furnitureMaterial('powderLight'), 0.004); body.position.y = h / 2; tag(body, 'FLAT_FILE_CARCASS'); g.add(body);
  const n = opts.drawers ?? 6; for (let i = 0; i < n; i++) { const dh = (h - 0.10) / n; const f = roundedBox(w - 0.04, dh - 0.012, 0.018, 0.007, furnitureMaterial('powderLight', { color: 0xaab4b5 }), 0.002); f.position.set(0, 0.06 + dh / 2 + i * dh, -d / 2 - 0.010); tag(f, 'FLAT_FILE_DRAWER_FRONT'); g.add(f); const pull = roundedBox(0.24, 0.018, 0.025, 0.006, furnitureMaterial('powderDark'), 0.002); pull.position.set(0.14, f.position.y, -d / 2 - 0.029); tag(pull, 'FLAT_FILE_DRAWER_PULL'); g.add(pull); const l = labelPlate(0.15, 0.055, 'FLAT_FILE_LABEL_HOLDER'); l.position.set(-0.25, f.position.y, -d / 2 - 0.029); g.add(l); }
  return auditBounds(g);
}

export function buildPlateTrolley(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PREPRESS_PLATE_TROLLEY'); const w = opts.width ?? 0.72, d = opts.depth ?? 0.62, h = opts.height ?? 1.12;
  const frame = furnitureMaterial('galvanized');
  for (const sx of [-w / 2, w / 2]) for (const sz of [-d / 2, d / 2]) g.add(tube(new T.Vector3(sx, 0.11, sz), new T.Vector3(sx, h, sz), 0.018, frame, 'PLATE_TROLLEY_UPRIGHT'));
  for (let i = 0; i < 7; i++) { const z = -d / 2 + 0.08 + i * (d - 0.16) / 6; g.add(tube(new T.Vector3(-w / 2, 0.22, z), new T.Vector3(w / 2, 0.22, z), 0.012, frame, 'PLATE_TROLLEY_DIVIDER_BASE')); g.add(tube(new T.Vector3(-w / 2, h - 0.10, z), new T.Vector3(w / 2, h - 0.10, z), 0.012, frame, 'PLATE_TROLLEY_DIVIDER_TOP')); }
  const handle = uHandle(0.45, 0.30, 0.015, frame, 'PLATE_TROLLEY_PUSH_HANDLE'); handle.position.set(0, h - 0.28, d / 2 + 0.02); handle.rotation.x = Math.PI / 2; g.add(handle);
  for (const sx of [-w / 2 + 0.07, w / 2 - 0.07]) for (const sz of [-d / 2 + 0.07, d / 2 - 0.07]) { const c = caster({ radius: 0.055, width: 0.032 }); c.position.set(sx, 0, sz); g.add(c); }
  return auditBounds(g);
}

// ---------------------------------------------------------------------------
// SPARE PARTS / MAINTENANCE / WORKSHOP
// ---------------------------------------------------------------------------
export function buildHopperBin(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'OPEN_FRONT_PARTS_BIN');
  const w = opts.width ?? 0.30, h = opts.height ?? 0.24, d = opts.depth ?? 0.43, t = 0.016;
  const m = furnitureMaterial(opts.material || 'powderBlue', { metalness: 0.03, roughness: 0.76 });
  const bottom = roundedBox(w, t, d, 0.008, m, 0.002); bottom.position.y = t / 2; tag(bottom, 'BIN_BOTTOM'); g.add(bottom);
  for (const sx of [-1, 1]) { const side = roundedBox(d, h, t, 0.008, m, 0.002); side.rotation.y = Math.PI / 2; side.position.set(sx * (w / 2 - t / 2), h / 2, 0); tag(side, 'BIN_SIDE'); g.add(side); }
  const back = roundedBox(w, h, t, 0.008, m, 0.002); back.position.set(0, h / 2, d / 2 - t / 2); tag(back, 'BIN_BACK'); g.add(back);
  const lipH = h * 0.46; const lip = roundedBox(w, lipH, t, 0.008, m, 0.002); lip.position.set(0, lipH / 2, -d / 2 + t / 2); lip.rotation.x = -0.12; tag(lip, 'BIN_HOPPER_FRONT_LIP'); g.add(lip);
  const label = labelPlate(w * 0.58, 0.055, 'BIN_LABEL_WINDOW'); label.position.set(0, lipH * 0.62, -d / 2 - 0.010); label.rotation.x = -0.12; g.add(label);
  return g;
}

export function buildSparePartsRack(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'SPAREPARTS_SHELVING_BAY', { referenceFamily: 'industrial bin shelving / Akro-Mils-class bins' });
  const w = opts.width ?? 1.05, d = opts.depth ?? 0.48, h = opts.height ?? 2.10, levels = opts.levels ?? 5;
  const frame = furnitureMaterial('powderDark'), shelfMat = furnitureMaterial('galvanized');
  for (const sx of [-w / 2, w / 2]) for (const sz of [-d / 2, d / 2]) { const post = roundedBox(0.045, h, 0.045, 0.006, frame, 0.002); post.position.set(sx, h / 2, sz); tag(post, 'RACK_SLOTTED_UPRIGHT'); g.add(post); if (opts.detailLevel !== 'low') for (let y = 0.16; y < h - 0.10; y += 0.10) { const slot = cube(0.012, 0.035, 0.006, furnitureMaterial('screenDark'), 'RACK_UPRIGHT_SLOT', [sx, y, sz - 0.024]); g.add(slot); } }
  for (let i = 0; i < levels; i++) {
    const y = 0.16 + i * ((h - 0.26) / (levels - 1)); const shelf = roundedBox(w - 0.05, 0.035, d - 0.03, 0.008, shelfMat, 0.002); shelf.position.y = y; tag(shelf, 'RACK_SHELF'); g.add(shelf);
    if (i < levels - 1) { for (const sx of [-w * 0.23, w * 0.23]) { const bin = buildHopperBin({ width: w * 0.42, height: 0.22, depth: d * 0.82, material: i < 2 ? 'powderBlue' : 'powderLight' }); bin.position.set(sx, y + 0.02, -0.01); g.add(bin); } }
  }
  for (const sx of [-w / 2, w / 2]) { const guard = roundedBox(0.15, 0.40, 0.18, 0.014, furnitureMaterial('powderYellow'), 0.003); guard.position.set(sx, 0.20, -d / 2 - 0.06); tag(guard, 'RACK_UPRIGHT_GUARD'); g.add(guard); }
  return auditBounds(g);
}

export function buildWorkshopWorkbench(opts = {}) {
  // LISTA reference family: 1500 x 700 x 840 mm, 40 mm multiplex top, 5 drawers.
  const g = new T.Group(); tag(g, opts.semantic || 'MAINTENANCE_WORKBENCH', { referenceFamily: 'LISTA-class workbench', dimensionsM: [1.5, 0.84, 0.70] });
  const w = opts.width ?? 1.50, d = opts.depth ?? 0.70, h = opts.height ?? 0.84;
  const top = roundedBox(w, 0.04, d, 0.012, furnitureMaterial('beechMultiplex'), 0.004); top.position.y = h; tag(top, 'WORKBENCH_MULTIPLEX_TOP'); g.add(top);
  const frame = furnitureMaterial('powderDark');
  for (const sx of [-w / 2 + 0.06, w / 2 - 0.06]) for (const sz of [-d / 2 + 0.06, d / 2 - 0.06]) g.add(tube(new T.Vector3(sx, 0.04, sz), new T.Vector3(sx, h - 0.03, sz), 0.024, frame, 'WORKBENCH_LEG'));
  const cw = 0.56, cd = 0.57, ch = 0.79; const cab = roundedBox(cw, ch, cd, 0.016, furnitureMaterial('powderLight'), 0.004); cab.position.set(-w / 2 + cw / 2 + 0.10, ch / 2 + 0.03, 0.02); tag(cab, 'WORKBENCH_DRAWER_CABINET'); g.add(cab);
  const drawerHeights = [0.08, 0.10, 0.12, 0.16, 0.23]; let y = 0.06;
  for (let i = 0; i < drawerHeights.length; i++) { const dh = drawerHeights[i]; const f = roundedBox(cw - 0.035, dh - 0.010, 0.018, 0.007, furnitureMaterial('powderLight', { color: 0xaeb6b5 }), 0.002); f.position.set(cab.position.x, y + dh / 2, -cd / 2 - 0.012); tag(f, 'WORKBENCH_DRAWER_FRONT'); g.add(f); const pull = roundedBox(0.26, 0.020, 0.025, 0.006, furnitureMaterial('powderDark'), 0.002); pull.position.set(cab.position.x, f.position.y + dh * 0.22, -cd / 2 - 0.031); tag(pull, 'WORKBENCH_DRAWER_PULL'); g.add(pull); y += dh + 0.014; }
  const pegW = w, pegH = 0.78; const peg = roundedBox(pegW, pegH, 0.035, 0.012, furnitureMaterial('powderBlue'), 0.003); peg.position.set(0, h + pegH / 2 + 0.10, d / 2 - 0.015); tag(peg, 'WORKBENCH_PEGBOARD'); g.add(peg);
  if (opts.detailLevel !== 'low') for (let ix = -6; ix <= 6; ix++) for (let iy = 0; iy < 5; iy++) { const hole = cyl(0.006, 0.006, 0.01, furnitureMaterial('screenDark'), 'PEGBOARD_HOLE', [ix * 0.10, h + 0.25 + iy * 0.12, d / 2 - 0.039], 8); hole.rotation.x = Math.PI / 2; g.add(hole); }
  // Bench vise: fixed/moving jaws, slide, screw and tommy bar.
  const viseX = w / 2 - 0.20, viseZ = -d / 2 + 0.14;
  const viseBody = roundedBox(0.26, 0.15, 0.20, 0.025, furnitureMaterial('powderBlue'), 0.004); viseBody.position.set(viseX, h + 0.095, viseZ); tag(viseBody, 'BENCH_VISE_BODY'); g.add(viseBody);
  for (const zz of [-0.07, 0.07]) { const jaw = roundedBox(0.24, 0.07, 0.035, 0.008, furnitureMaterial('galvanized'), 0.002); jaw.position.set(viseX, h + 0.18, viseZ + zz); tag(jaw, 'BENCH_VISE_JAW'); g.add(jaw); }
  g.add(tube(new T.Vector3(viseX - 0.16, h + 0.08, viseZ - 0.12), new T.Vector3(viseX + 0.16, h + 0.08, viseZ - 0.12), 0.008, furnitureMaterial('chrome'), 'BENCH_VISE_TOMMY_BAR'));
  return auditBounds(g);
}

export function buildToolCabinet(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'INDUSTRIAL_TOOL_CABINET'); const w = opts.width ?? 0.75, d = opts.depth ?? 0.55, h = opts.height ?? 1.90;
  const body = roundedBox(w, h, d, 0.020, furnitureMaterial('powderLight'), 0.004); body.position.y = h / 2; tag(body, 'TOOL_CABINET_CARCASS'); g.add(body);
  for (const sx of [-1, 1]) { const door = roundedBox(w / 2 - 0.025, h - 0.08, 0.018, 0.010, furnitureMaterial('powderLight', { color: 0xaab4b4 }), 0.002); door.position.set(sx * (w / 4), h / 2, -d / 2 - 0.010); tag(door, 'TOOL_CABINET_DOOR'); g.add(door); const hdl = roundedBox(0.018, 0.18, 0.026, 0.006, furnitureMaterial('powderDark'), 0.002); hdl.position.set(sx * (w * 0.08), h / 2, -d / 2 - 0.030); tag(hdl, 'TOOL_CABINET_HANDLE'); g.add(hdl); const vent = slottedVent(w * 0.28, 0.18, 5, furnitureMaterial('screenDark'), 'TOOL_CABINET_VENT'); vent.position.set(sx * w * 0.24, h - 0.18, -d / 2 - 0.022); g.add(vent); }
  const plate = labelPlate(0.24, 0.07, 'TOOL_CABINET_ID_PLATE'); plate.position.set(0, h - 0.35, -d / 2 - 0.024); g.add(plate);
  return auditBounds(g);
}

export function buildMobileToolCart(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'MOBILE_TOOL_CART'); const w = opts.width ?? 0.78, d = opts.depth ?? 0.50, h = opts.height ?? 0.92;
  const body = roundedBox(w, h - 0.16, d, 0.025, furnitureMaterial('powderBlue'), 0.005); body.position.y = (h - 0.16) / 2 + 0.13; tag(body, 'TOOL_CART_BODY'); g.add(body);
  for (let i = 0; i < 5; i++) { const dh = (h - 0.28) / 5; const f = roundedBox(w - 0.045, dh - 0.010, 0.018, 0.007, furnitureMaterial('powderBlue', { color: 0x47768d }), 0.002); f.position.set(0, 0.20 + dh / 2 + i * dh, -d / 2 - 0.010); tag(f, 'TOOL_CART_DRAWER'); g.add(f); const pull = roundedBox(w * 0.63, 0.018, 0.025, 0.006, furnitureMaterial('powderDark'), 0.002); pull.position.set(0, f.position.y + dh * 0.20, -d / 2 - 0.029); tag(pull, 'TOOL_CART_PULL'); g.add(pull); }
  const top = roundedBox(w + 0.025, 0.035, d + 0.025, 0.015, furnitureMaterial('blackPolymer'), 0.004); top.position.y = h; tag(top, 'TOOL_CART_RUBBER_TOP'); g.add(top);
  const handle = uHandle(0.30, 0.19, 0.014, furnitureMaterial('powderDark'), 'TOOL_CART_PUSH_HANDLE'); handle.rotation.z = Math.PI / 2; handle.position.set(w / 2 + 0.02, h - 0.16, 0); g.add(handle);
  for (const sx of [-w / 2 + 0.07, w / 2 - 0.07]) for (const sz of [-d / 2 + 0.07, d / 2 - 0.07]) { const c = caster({ radius: 0.055, width: 0.032 }); c.position.set(sx, 0, sz); g.add(c); }
  return auditBounds(g);
}

// ---------------------------------------------------------------------------
// LOCKER / CHANGE / PRAYER / TOILET / PANTRY / JANITOR
// ---------------------------------------------------------------------------
export function buildLockerBank(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'LOCKER_BANK', { referenceFamily: 'Lyon/Bradley-class steel locker proportions' });
  const count = opts.count ?? 3, moduleW = opts.moduleWidth ?? 0.305, d = opts.depth ?? 0.457, h = opts.height ?? 1.98, legH = opts.legHeight ?? 0.152;
  const totalW = count * moduleW, bodyH = h - legH;
  for (let i = 0; i < count; i++) {
    const x = -totalW / 2 + moduleW / 2 + i * moduleW;
    const body = roundedBox(moduleW - 0.006, bodyH, d, 0.010, furnitureMaterial('powderLight'), 0.003); body.position.set(x, legH + bodyH / 2, 0); tag(body, 'LOCKER_BODY'); g.add(body);
    const door = roundedBox(moduleW - 0.025, bodyH - 0.05, 0.018, 0.008, furnitureMaterial('powderLight', { color: 0xa7b2b4 }), 0.002); door.position.set(x, legH + bodyH / 2, -d / 2 - 0.010); tag(door, 'LOCKER_DOOR'); g.add(door);
    const vents = slottedVent(moduleW * 0.48, 0.16, 5, furnitureMaterial('screenDark'), 'LOCKER_VENT_SLOTS'); vents.position.set(x, h - 0.22, -d / 2 - 0.024); g.add(vents);
    const handle = roundedBox(0.055, 0.13, 0.022, 0.008, furnitureMaterial('powderDark'), 0.002); handle.position.set(x + moduleW * 0.28, legH + bodyH * 0.51, -d / 2 - 0.029); tag(handle, 'LOCKER_RECESSED_HANDLE'); g.add(handle);
    const plate = labelPlate(0.075, 0.045, 'LOCKER_NUMBER_PLATE'); plate.position.set(x, h - 0.40, -d / 2 - 0.030); g.add(plate);
    for (const sx of [-moduleW * 0.34, moduleW * 0.34]) { const leg = roundedBox(0.035, legH, 0.035, 0.006, furnitureMaterial('powderDark'), 0.002); leg.position.set(x + sx, legH / 2, -d * 0.28); tag(leg, 'LOCKER_LEG'); g.add(leg); }
  }
  return auditBounds(g);
}

export function buildLockerBench(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'LOCKER_ROOM_PEDESTAL_BENCH', { referenceFamily: 'Bradley pedestal bench' });
  const w = opts.length ?? 1.219, d = opts.width ?? 0.305, h = opts.height ?? 0.432;
  const top = roundedBox(w, 0.035, d, 0.020, furnitureMaterial(opts.topMaterial || 'darkLaminate'), 0.005); top.position.y = h; tag(top, 'LOCKER_BENCH_TOP'); g.add(top);
  for (const sx of w > 1.8 ? [-w * 0.30, 0, w * 0.30] : [-w * 0.28, w * 0.28]) { const post = cyl(0.030, 0.030, h - 0.035, furnitureMaterial('powderDark'), 'LOCKER_BENCH_PEDESTAL', [sx, (h - 0.035) / 2, 0], 18); g.add(post); const foot = cyl(0.075, 0.075, 0.012, furnitureMaterial('powderDark'), 'LOCKER_BENCH_BASE_FLANGE', [sx, 0.006, 0], 24); g.add(foot); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.add(hexBolt(0.008, 0.006, furnitureMaterial('galvanized'), 'LOCKER_BENCH_ANCHOR', [sx + Math.cos(a) * 0.052, 0.014, Math.sin(a) * 0.052])); } }
  return auditBounds(g);
}

export function buildShoeRack(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'SHOE_RACK'); const w = opts.width ?? 1.10, d = opts.depth ?? 0.34, h = opts.height ?? 1.15, levels = opts.levels ?? 4;
  const m = furnitureMaterial('laminateOak');
  for (const sx of [-w / 2 + 0.025, w / 2 - 0.025]) { const side = roundedBox(0.045, h, d, 0.010, m, 0.003); side.position.set(sx, h / 2, 0); tag(side, 'SHOE_RACK_SIDE'); g.add(side); }
  for (let i = 0; i < levels; i++) { const y = 0.08 + i * (h - 0.16) / (levels - 1); const shelf = roundedBox(w - 0.06, 0.028, d - 0.03, 0.008, m, 0.002); shelf.position.y = y; tag(shelf, 'SHOE_RACK_SHELF'); g.add(shelf); }
  return auditBounds(g);
}

export function buildPrayerBench(opts = {}) { return buildLockerBench({ semantic: opts.semantic || 'PRAYER_ROOM_LOW_BENCH', length: opts.length ?? 1.20, width: opts.width ?? 0.36, height: opts.height ?? 0.42, topMaterial: 'laminateOak' }); }

export function buildPrayerMat(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PRAYER_MAT'); const w = opts.width ?? 0.60, d = opts.depth ?? 1.08;
  const mat = roundedBox(w, 0.012, d, 0.018, furnitureMaterial('safetyGreen', { roughness: 0.96, metalness: 0 }), 0.002); mat.position.y = 0.006; tag(mat, 'PRAYER_MAT_TEXTILE'); g.add(mat);
  for (let i = 0; i < 10; i++) { const f = tube(new T.Vector3(-w / 2 + 0.04 + i * 0.055, 0.015, -d / 2), new T.Vector3(-w / 2 + 0.04 + i * 0.055, 0.015, -d / 2 - 0.045), 0.003, furnitureMaterial('paper'), 'PRAYER_MAT_FRINGE', 6); g.add(f); }
  return auditBounds(g);
}

export function buildPantryRun(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PANTRY_CABINET_RUN');
  const w = opts.width ?? 2.10, d = opts.depth ?? 0.60, counterH = opts.counterHeight ?? 0.90;
  const baseH = counterH - 0.05, n = 3;
  const carcass = roundedBox(w, baseH, d, 0.016, furnitureMaterial('lightLaminate'), 0.004); carcass.position.y = baseH / 2; tag(carcass, 'PANTRY_BASE_CARCASS'); g.add(carcass);
  for (let i = 0; i < n; i++) { const fw = w / n - 0.025; const door = roundedBox(fw, baseH - 0.08, 0.018, 0.010, furnitureMaterial('lightLaminate', { color: 0xd0cec6 }), 0.002); door.position.set(-w / 2 + w / n * (i + 0.5), baseH / 2, -d / 2 - 0.010); tag(door, 'PANTRY_BASE_DOOR'); g.add(door); const hdl = roundedBox(0.015, 0.15, 0.022, 0.006, furnitureMaterial('stainless'), 0.002); hdl.position.set(door.position.x + fw * 0.35, baseH / 2 + 0.08, -d / 2 - 0.030); tag(hdl, 'PANTRY_DOOR_HANDLE'); g.add(hdl); }
  const counter = roundedBox(w + 0.04, 0.04, d + 0.035, 0.015, furnitureMaterial('darkLaminate'), 0.004); counter.position.y = counterH; tag(counter, 'PANTRY_COUNTERTOP'); g.add(counter);
  // Stainless sink basin as nested shell illusion.
  const rim = roundedBox(0.56, 0.035, 0.42, 0.045, furnitureMaterial('stainless'), 0.003); rim.position.set(-0.42, counterH + 0.02, 0.02); tag(rim, 'PANTRY_SINK_RIM'); g.add(rim);
  const bowl = roundedBox(0.48, 0.16, 0.34, 0.055, furnitureMaterial('stainless', { color: 0xaab2b2 }), 0.004); bowl.position.set(-0.42, counterH - 0.075, 0.02); tag(bowl, 'PANTRY_SINK_BOWL'); g.add(bowl);
  const spoutCurve = new T.CatmullRomCurve3([new T.Vector3(-0.42, counterH + 0.06, d / 2 - 0.10), new T.Vector3(-0.42, counterH + 0.28, d / 2 - 0.10), new T.Vector3(-0.42, counterH + 0.30, 0.05), new T.Vector3(-0.42, counterH + 0.22, 0.01)]);
  const faucet = new T.Mesh(new T.TubeGeometry(spoutCurve, 20, 0.012, 10, false), furnitureMaterial('chrome')); tag(faucet, 'PANTRY_FAUCET_SPOUT'); g.add(faucet);
  return auditBounds(g);
}

export function buildServiceSink(opts = {}) {
  // Elkay ESS25202 family: 25 x 19.5 x 12 in bowl + backsplash/support brackets.
  const g = new T.Group(); tag(g, opts.semantic || 'JANITOR_STAINLESS_SERVICE_SINK', { referenceFamily: 'Elkay wall-hung service sink class' });
  const w = opts.width ?? 0.635, d = opts.depth ?? 0.495, bowlH = opts.bowlHeight ?? 0.305, mountH = opts.rimHeight ?? 0.84;
  const ss = furnitureMaterial('stainless');
  const rim = roundedBox(w, 0.035, d, 0.025, ss, 0.004); rim.position.y = mountH; tag(rim, 'SERVICE_SINK_ROLLED_RIM'); g.add(rim);
  const bowl = roundedBox(w - 0.075, bowlH, d - 0.085, 0.045, furnitureMaterial('stainless', { color: 0xaeb5b5 }), 0.004); bowl.position.set(0, mountH - bowlH / 2 - 0.015, 0); tag(bowl, 'SERVICE_SINK_BOWL'); g.add(bowl);
  const splash = roundedBox(w, 0.305, 0.025, 0.012, ss, 0.003); splash.position.set(0, mountH + 0.16, d / 2 - 0.015); tag(splash, 'SERVICE_SINK_BACKSPLASH'); g.add(splash);
  for (const sx of [-0.22, 0.22]) { g.add(tube(new T.Vector3(sx, mountH - bowlH, d / 2 - 0.06), new T.Vector3(sx, 0.18, d / 2 - 0.02), 0.014, ss, 'SERVICE_SINK_SUPPORT_BRACKET')); }
  const drain = cyl(0.045, 0.045, 0.025, furnitureMaterial('chrome'), 'SERVICE_SINK_DRAIN', [0, mountH - bowlH + 0.02, 0], 24); g.add(drain);
  return auditBounds(g);
}

export function buildHousekeepingCart(opts = {}) {
  // Compact Rubbermaid-class reference, scaled for industrial janitor context.
  const g = new T.Group(); tag(g, opts.semantic || 'HOUSEKEEPING_CART', { referenceFamily: 'Rubbermaid compact housekeeping cart class' });
  const l = opts.length ?? 1.37, w = opts.width ?? 0.62, h = opts.height ?? 1.25;
  const bodyMat = furnitureMaterial('blackPolymer', { color: 0x3b4144 });
  const base = roundedBox(l * 0.70, 0.20, w, 0.08, bodyMat, 0.010); base.position.set(-l * 0.08, 0.18, 0); tag(base, 'HOUSEKEEPING_CART_MOLDED_BASE'); g.add(base);
  const end = roundedBox(l * 0.20, h * 0.72, w, 0.07, bodyMat, 0.010); end.position.set(-l * 0.33, h * 0.45, 0); tag(end, 'HOUSEKEEPING_CART_STORAGE_TOWER'); g.add(end);
  for (const y of [0.48, 0.76]) { const sh = roundedBox(l * 0.43, 0.04, w * 0.78, 0.025, bodyMat, 0.006); sh.position.set(-l * 0.04, y, 0); tag(sh, 'HOUSEKEEPING_CART_ADJUSTABLE_SHELF'); g.add(sh); }
  const bagFrame = uHandle(w * 0.78, h * 0.62, 0.020, furnitureMaterial('powderDark'), 'HOUSEKEEPING_CART_BAG_FRAME'); bagFrame.rotation.z = Math.PI / 2; bagFrame.position.set(l * 0.37, h * 0.44, 0); g.add(bagFrame);
  const bag = roundedBox(l * 0.25, h * 0.56, w * 0.74, 0.045, furnitureMaterial('clearPlastic', { color: 0x6c7372, opacity: 0.40 }), 0.003); bag.position.set(l * 0.38, h * 0.38, 0); tag(bag, 'HOUSEKEEPING_CART_WASTE_LINER'); g.add(bag);
  const handle = uHandle(w * 0.74, 0.28, 0.022, bodyMat, 'HOUSEKEEPING_CART_PUSH_HANDLE'); handle.rotation.z = Math.PI / 2; handle.position.set(-l * 0.48, h * 0.75, 0); g.add(handle);
  for (const x of [-l * 0.30, l * 0.32]) for (const z of [-w * 0.36, w * 0.36]) { const c = caster({ radius: x < 0 ? 0.07 : 0.085, width: 0.04 }); c.position.set(x, 0, z); g.add(c); }
  return auditBounds(g);
}

export function buildRestroomAccessorySet(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'RESTROOM_ACCESSORY_SET', { referenceFamily: 'Bobrick commercial restroom accessory class' });
  const mirror = roundedBox(0.62, 0.78, 0.018, 0.010, furnitureMaterial('chrome', { roughness: 0.08, metalness: 0.95 }), 0.002); mirror.position.set(0, 1.55, 0); tag(mirror, 'RESTROOM_MIRROR'); g.add(mirror);
  const towel = roundedBox(0.39, 1.42, 0.14, 0.016, furnitureMaterial('stainless'), 0.004); towel.position.set(0.75, 1.12, 0.02); tag(towel, 'RESTROOM_RECESSED_TOWEL_WASTE_UNIT'); g.add(towel);
  const slot = roundedBox(0.22, 0.055, 0.025, 0.008, furnitureMaterial('screenDark'), 0.002); slot.position.set(0.75, 1.48, -0.065); tag(slot, 'TOWEL_DISPENSING_SLOT'); g.add(slot);
  const soap = roundedBox(0.12, 0.22, 0.09, 0.018, furnitureMaterial('blackPolymer'), 0.004); soap.position.set(-0.52, 1.20, 0.01); tag(soap, 'RESTROOM_SOAP_DISPENSER'); g.add(soap);
  return g;
}

// ---------------------------------------------------------------------------
// MATERIAL HANDLING / WAREHOUSE / PRODUCTION
// ---------------------------------------------------------------------------
export function buildWoodPallet(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'WOOD_PALLET'); const w = opts.width ?? 1.20, d = opts.depth ?? 1.00, h = opts.height ?? 0.145;
  const wood = furnitureMaterial('woodPallet');
  for (let i = 0; i < 7; i++) { const slat = roundedBox(w, 0.022, 0.10, 0.006, wood, 0.002); slat.position.set(0, h - 0.011, -d / 2 + 0.08 + i * ((d - 0.16) / 6)); tag(slat, 'PALLET_TOP_DECK_BOARD'); g.add(slat); }
  for (const z of [-d / 2 + 0.10, 0, d / 2 - 0.10]) { const bearer = roundedBox(w * 0.94, 0.075, 0.09, 0.006, wood, 0.002); bearer.position.set(0, 0.07, z); tag(bearer, 'PALLET_STRINGER'); g.add(bearer); }
  for (const z of [-d / 2 + 0.10, d / 2 - 0.10]) { const bottom = roundedBox(w, 0.022, 0.10, 0.006, wood, 0.002); bottom.position.set(0, 0.011, z); tag(bottom, 'PALLET_BOTTOM_BOARD'); g.add(bottom); }
  return auditBounds(g);
}

export function buildPaperboardPalletLoad(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PAPERBOARD_PALLET_LOAD'); const pallet = buildWoodPallet({ width: opts.width ?? 1.20, depth: opts.depth ?? 1.00 }); g.add(pallet);
  const w = opts.loadWidth ?? 1.12, d = opts.loadDepth ?? 0.92, loadH = opts.loadHeight ?? 0.78;
  const load = roundedBox(w, loadH, d, 0.012, furnitureMaterial('paper'), 0.003); load.position.y = 0.145 + loadH / 2; tag(load, 'PAPERBOARD_WRAPPED_LOAD'); g.add(load);
  const wrap = roundedBox(w + 0.025, loadH + 0.025, d + 0.025, 0.014, furnitureMaterial('clearPlastic'), 0.003); wrap.position.y = 0.145 + loadH / 2; tag(wrap, 'PALLET_STRETCH_WRAP'); g.add(wrap);
  for (const sx of [-w * 0.29, w * 0.29]) { const strap = roundedBox(0.025, loadH + 0.06, d + 0.035, 0.006, furnitureMaterial('powderBlue'), 0.002); strap.position.set(sx, 0.145 + loadH / 2, 0); tag(strap, 'PALLET_VERTICAL_STRAP'); g.add(strap); }
  for (const sx of [-w / 2, w / 2]) for (const sz of [-d / 2, d / 2]) { const cp = roundedBox(0.045, loadH, 0.045, 0.006, furnitureMaterial('kraft'), 0.002); cp.position.set(sx, 0.145 + loadH / 2, sz); tag(cp, 'PALLET_CORNER_PROTECTOR'); g.add(cp); }
  const lp = labelPlate(0.26, 0.15, 'PALLET_IDENTIFICATION_LABEL'); lp.position.set(w * 0.28, 0.48, -d / 2 - 0.022); g.add(lp);
  return auditBounds(g);
}

export function buildReelCradle(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PAPER_REEL_CRADLE'); const rollR = opts.rollRadius ?? 0.48, rollW = opts.rollWidth ?? 1.45;
  const base = roundedBox(rollW + 0.30, 0.12, 1.15, 0.012, furnitureMaterial('woodPallet'), 0.003); base.position.y = 0.06; tag(base, 'REEL_CRADLE_BASE'); g.add(base);
  for (const sx of [-rollW * 0.42, rollW * 0.42]) for (const sz of [-0.40, 0.40]) { const chock = roundedBox(0.20, 0.26, 0.26, 0.018, furnitureMaterial('darkRubber'), 0.004); chock.position.set(sx, 0.22, sz); chock.rotation.z = sx < 0 ? -0.20 : 0.20; tag(chock, 'REEL_CHOCK'); g.add(chock); }
  const roll = cyl(rollR, rollR, rollW, furnitureMaterial('paper'), 'WRAPPED_PAPER_REEL', [0, rollR + 0.16, 0], 40); roll.rotation.z = Math.PI / 2; g.add(roll);
  const core = cyl(0.11, 0.11, rollW + 0.015, furnitureMaterial('kraft'), 'REEL_CORE', [0, rollR + 0.16, 0], 28); core.rotation.z = Math.PI / 2; g.add(core);
  return auditBounds(g);
}

export function buildPalletJack(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'HAND_PALLET_TRUCK', { referenceFamily: 'Crown PTH-class hand pallet truck' });
  const forkL = opts.forkLength ?? 1.15, spread = opts.outsideForkSpread ?? 0.685, forkW = opts.forkWidth ?? 0.16, forkH = 0.075;
  const m = furnitureMaterial('powderYellow');
  for (const sx of [-spread / 2 + forkW / 2, spread / 2 - forkW / 2]) { const fork = roundedBox(forkW, forkH, forkL, 0.025, m, 0.004); fork.position.set(sx, 0.075, -forkL / 2 + 0.12); tag(fork, 'PALLET_JACK_FORK'); g.add(fork); const lw = wheel(0.037, 0.070, furnitureMaterial('darkRubber'), 'PALLET_JACK_LOAD_WHEEL'); lw.rotation.y = Math.PI / 2; lw.position.set(sx, 0.05, -forkL + 0.17); g.add(lw); }
  const forkBridge = roundedBox(spread + 0.12, 0.19, 0.22, 0.04, m, 0.005); forkBridge.position.set(0, 0.18, 0.10); tag(forkBridge, 'PALLET_JACK_CHASSIS'); g.add(forkBridge);
  const steer = wheel(0.09, 0.05, furnitureMaterial('darkRubber'), 'PALLET_JACK_STEER_WHEEL'); steer.position.set(0, 0.11, 0.25); g.add(steer);
  const pump = cyl(0.055, 0.068, 0.38, furnitureMaterial('powderDark'), 'PALLET_JACK_HYDRAULIC_PUMP', [0, 0.40, 0.20], 18); g.add(pump);
  const handleStem = tube(new T.Vector3(0, 0.55, 0.20), new T.Vector3(0, 1.15, 0.42), 0.022, m, 'PALLET_JACK_HANDLE_STEM'); g.add(handleStem);
  const handle = new T.Mesh(new T.TorusGeometry(0.15, 0.022, 10, 28, Math.PI * 1.35), m); handle.rotation.z = Math.PI / 2; handle.rotation.y = -0.20; handle.position.set(0, 1.18, 0.44); tag(handle, 'PALLET_JACK_CONTROL_HANDLE'); g.add(handle);
  return auditBounds(g);
}

export function buildPlatformTrolley(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PLATFORM_TROLLEY'); const w = opts.width ?? 1.10, d = opts.depth ?? 0.72, deckH = 0.23;
  const deck = roundedBox(w, 0.08, d, 0.028, furnitureMaterial('powderBlue'), 0.006); deck.position.y = deckH; tag(deck, 'TROLLEY_DECK'); g.add(deck);
  const handle = uHandle(w * 0.70, 0.72, 0.020, furnitureMaterial('powderDark'), 'TROLLEY_PUSH_HANDLE'); handle.rotation.x = Math.PI / 2; handle.position.set(0, deckH + 0.02, d / 2 + 0.02); g.add(handle);
  for (const sx of [-w / 2 + 0.09, w / 2 - 0.09]) for (const sz of [-d / 2 + 0.09, d / 2 - 0.09]) { const c = caster({ radius: 0.065, width: 0.040 }); c.position.set(sx, 0, sz); g.add(c); }
  return auditBounds(g);
}

export function buildSheetTrolley(opts = {}) {
  const g = buildPlatformTrolley({ semantic: opts.semantic || 'CUT_SHEET_HANDLING_TROLLEY', width: opts.width ?? 1.25, depth: opts.depth ?? 0.82 });
  const w = opts.width ?? 1.25, d = opts.depth ?? 0.82;
  for (const sx of [-w / 2 + 0.05, w / 2 - 0.05]) for (const sz of [-d / 2 + 0.05, d / 2 - 0.05]) g.add(tube(new T.Vector3(sx, 0.30, sz), new T.Vector3(sx, 0.78, sz), 0.016, furnitureMaterial('galvanized'), 'SHEET_TROLLEY_CORNER_POST'));
  const load = roundedBox(w - 0.12, 0.22, d - 0.12, 0.010, furnitureMaterial('paper'), 0.003); load.position.y = 0.39; tag(load, 'SHEET_TROLLEY_PAPER_STACK'); g.add(load);
  return auditBounds(g);
}

export function buildDieToolTrolley(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'DIECUT_TOOL_TROLLEY'); const w = opts.width ?? 1.05, d = opts.depth ?? 0.72, h = opts.height ?? 1.00;
  const frame = furnitureMaterial('powderDark');
  const deck = roundedBox(w, 0.07, d, 0.018, furnitureMaterial('galvanized'), 0.004); deck.position.y = 0.22; tag(deck, 'DIE_TROLLEY_BASE_DECK'); g.add(deck);
  for (const sx of [-w / 2 + 0.05, w / 2 - 0.05]) for (const sz of [-d / 2 + 0.05, d / 2 - 0.05]) g.add(tube(new T.Vector3(sx, 0.20, sz), new T.Vector3(sx, h, sz), 0.020, frame, 'DIE_TROLLEY_UPRIGHT'));
  for (let i = 0; i < 5; i++) { const z = -d / 2 + 0.10 + i * (d - 0.20) / 4; g.add(tube(new T.Vector3(-w / 2 + 0.04, 0.28, z), new T.Vector3(w / 2 - 0.04, 0.28, z), 0.012, frame, 'DIE_TROLLEY_SLOT_RAIL')); }
  const handle = uHandle(0.42, 0.28, 0.016, frame, 'DIE_TROLLEY_HANDLE'); handle.rotation.z = Math.PI / 2; handle.position.set(w / 2 + 0.02, h - 0.25, 0); g.add(handle);
  for (const sx of [-w / 2 + 0.08, w / 2 - 0.08]) for (const sz of [-d / 2 + 0.08, d / 2 - 0.08]) { const c = caster({ radius: 0.060, width: 0.036 }); c.position.set(sx, 0, sz); g.add(c); }
  return auditBounds(g);
}

export function buildCartonBlankTrolley(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'CARTON_BLANK_TROLLEY'); const w = opts.width ?? 1.18, d = opts.depth ?? 0.76, h = opts.height ?? 1.05;
  const frame = furnitureMaterial('galvanized');
  const base = roundedBox(w, 0.06, d, 0.018, furnitureMaterial('powderLight'), 0.004); base.position.y = 0.20; tag(base, 'BLANK_TROLLEY_BASE'); g.add(base);
  for (const sx of [-w / 2 + 0.04, w / 2 - 0.04]) { g.add(tube(new T.Vector3(sx, 0.20, -d / 2), new T.Vector3(sx, h, -d / 2), 0.018, frame, 'BLANK_TROLLEY_END_FRAME')); g.add(tube(new T.Vector3(sx, 0.20, d / 2), new T.Vector3(sx, h, d / 2), 0.018, frame, 'BLANK_TROLLEY_END_FRAME')); }
  for (const y of [0.46, 0.76, h]) { g.add(tube(new T.Vector3(-w / 2, y, -d / 2), new T.Vector3(w / 2, y, -d / 2), 0.015, frame, 'BLANK_TROLLEY_SIDE_RAIL')); g.add(tube(new T.Vector3(-w / 2, y, d / 2), new T.Vector3(w / 2, y, d / 2), 0.015, frame, 'BLANK_TROLLEY_SIDE_RAIL')); }
  const stack = roundedBox(w - 0.12, 0.34, d - 0.12, 0.010, furnitureMaterial('carton'), 0.003); stack.position.y = 0.40; tag(stack, 'CARTON_BLANK_STACK'); g.add(stack);
  for (const sx of [-w / 2 + 0.08, w / 2 - 0.08]) for (const sz of [-d / 2 + 0.08, d / 2 - 0.08]) { const c = caster({ radius: 0.060, width: 0.036 }); c.position.set(sx, 0, sz); g.add(c); }
  return auditBounds(g);
}

export function buildWasteSegregationStation(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'WASTE_SEGREGATION_STATION'); const count = opts.count ?? 3, bw = opts.binWidth ?? 0.36, d = opts.depth ?? 0.42, h = opts.height ?? 0.72;
  const cols = ['safetyGreen', 'powderBlue', 'powderRed'];
  for (let i = 0; i < count; i++) { const x = (i - (count - 1) / 2) * (bw + 0.06); const body = roundedBox(bw, h * 0.82, d, 0.045, furnitureMaterial(cols[i % cols.length], { metalness: 0.02 }), 0.006); body.position.set(x, h * 0.41, 0); tag(body, 'WASTE_BIN_BODY'); g.add(body); const lid = roundedBox(bw + 0.015, 0.055, d + 0.015, 0.035, furnitureMaterial(cols[i % cols.length], { metalness: 0.02 }), 0.005); lid.position.set(x, h * 0.84, 0); tag(lid, 'WASTE_BIN_LID'); g.add(lid); const opening = roundedBox(bw * 0.52, 0.018, d * 0.28, 0.040, furnitureMaterial('screenDark'), 0.002); opening.position.set(x, h * 0.875, 0); tag(opening, 'WASTE_BIN_OPENING'); g.add(opening); const lp = labelPlate(bw * 0.55, 0.10, 'WASTE_BIN_LABEL'); lp.position.set(x, h * 0.56, -d / 2 - 0.018); g.add(lp); }
  return auditBounds(g);
}

export function buildFloorScale(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'INDUSTRIAL_FLOOR_SCALE'); const w = opts.width ?? 1.19, d = opts.depth ?? 0.84, h = opts.height ?? 0.08;
  const deck = roundedBox(w, h, d, 0.012, furnitureMaterial('powderLight', { color: 0x747f80, roughness: 0.62, metalness: 0.45 }), 0.004); deck.position.y = h / 2; tag(deck, 'FLOOR_SCALE_PLATFORM'); g.add(deck);
  for (let i = 0; i < 8; i++) { const tread = cube(w - 0.08, 0.004, 0.012, furnitureMaterial('screenDark'), 'FLOOR_SCALE_ANTI_SLIP_LINE', [0, h + 0.003, -d / 2 + 0.08 + i * (d - 0.16) / 7]); g.add(tread); }
  const pole = tube(new T.Vector3(w / 2 + 0.12, 0.02, d / 2 - 0.05), new T.Vector3(w / 2 + 0.12, 1.10, d / 2 - 0.05), 0.018, furnitureMaterial('powderDark'), 'SCALE_DISPLAY_POST'); g.add(pole);
  const display = roundedBox(0.30, 0.20, 0.08, 0.025, furnitureMaterial('blackPolymer'), 0.004); display.position.set(w / 2 + 0.12, 1.13, d / 2 - 0.05); tag(display, 'SCALE_WEIGHT_INDICATOR'); g.add(display);
  const screen = roundedBox(0.20, 0.07, 0.008, 0.010, furnitureMaterial('screenDark', { emissiveIntensity: 0.55 }), 0.001); screen.position.set(w / 2 + 0.12, 1.15, d / 2 - 0.095); tag(screen, 'SCALE_DISPLAY'); g.add(screen);
  return auditBounds(g);
}

export function buildStretchWrapper(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PALLET_STRETCH_WRAPPER'); const turntableD = opts.turntableDiameter ?? 1.50, mastH = opts.mastHeight ?? 2.35;
  const base = cyl(turntableD / 2, turntableD / 2, 0.13, furnitureMaterial('powderDark'), 'WRAPPER_TURNTABLE', [0, 0.065, 0], 48); g.add(base);
  const top = cyl(turntableD / 2 - 0.03, turntableD / 2 - 0.03, 0.018, furnitureMaterial('galvanized'), 'WRAPPER_TURNTABLE_TOP', [0, 0.139, 0], 48); g.add(top);
  const mast = roundedBox(0.20, mastH, 0.24, 0.025, furnitureMaterial('powderDark'), 0.005); mast.position.set(turntableD / 2 + 0.30, mastH / 2, 0); tag(mast, 'WRAPPER_MAST'); g.add(mast);
  const carriage = roundedBox(0.30, 0.48, 0.26, 0.030, furnitureMaterial('powderYellow'), 0.005); carriage.position.set(turntableD / 2 + 0.30, 0.75, -0.02); tag(carriage, 'WRAPPER_FILM_CARRIAGE'); g.add(carriage);
  const roll = cyl(0.10, 0.10, 0.42, furnitureMaterial('clearPlastic', { opacity: 0.50 }), 'WRAPPER_FILM_ROLL', [turntableD / 2 + 0.30, 0.75, -0.16], 28); g.add(roll);
  const panel = roundedBox(0.28, 0.42, 0.16, 0.025, furnitureMaterial('powderLight'), 0.004); panel.position.set(turntableD / 2 + 0.55, 1.15, 0); tag(panel, 'WRAPPER_CONTROL_BOX'); g.add(panel);
  const screen = roundedBox(0.17, 0.10, 0.008, 0.012, furnitureMaterial('screenDark', { emissiveIntensity: 0.50 }), 0.001); screen.position.set(turntableD / 2 + 0.55, 1.21, -0.085); tag(screen, 'WRAPPER_HMI'); g.add(screen);
  const eStop = cyl(0.028, 0.028, 0.030, furnitureMaterial('powderRed'), 'WRAPPER_ESTOP', [turntableD / 2 + 0.48, 1.05, -0.10], 18); eStop.rotation.x = Math.PI / 2; g.add(eStop);
  return auditBounds(g);
}

export function buildConvexMirror(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'WAREHOUSE_CONVEX_MIRROR'); const r = opts.radius ?? 0.30;
  const disc = new T.Mesh(new T.CircleGeometry(r, 40), furnitureMaterial('chrome', { roughness: 0.08, metalness: 0.98 })); tag(disc, 'CONVEX_MIRROR_FACE'); g.add(disc);
  const rim = new T.Mesh(new T.TorusGeometry(r + 0.025, 0.025, 10, 40), furnitureMaterial('powderYellow')); tag(rim, 'CONVEX_MIRROR_RIM'); g.add(rim);
  g.add(tube(new T.Vector3(0, 0, 0.02), new T.Vector3(0.35, -0.18, 0.15), 0.018, furnitureMaterial('galvanized'), 'CONVEX_MIRROR_BRACKET'));
  return g;
}

export function buildSafetyBollard(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'SAFETY_BOLLARD'); const h = opts.height ?? 0.95, r = opts.radius ?? 0.06;
  const post = cyl(r, r, h, furnitureMaterial('powderYellow'), 'BOLLARD_POST', [0, h / 2, 0], 24); g.add(post);
  const cap = new T.Mesh(new T.SphereGeometry(r * 1.02, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), furnitureMaterial('powderYellow')); cap.position.y = h; tag(cap, 'BOLLARD_CAP'); g.add(cap);
  const plate = roundedBox(0.22, 0.018, 0.22, 0.018, furnitureMaterial('powderDark'), 0.003); plate.position.y = 0.009; tag(plate, 'BOLLARD_BASE_PLATE'); g.add(plate);
  for (const sx of [-0.075, 0.075]) for (const sz of [-0.075, 0.075]) g.add(hexBolt(0.010, 0.012, furnitureMaterial('galvanized'), 'BOLLARD_ANCHOR_BOLT', [sx, 0.021, sz]));
  return auditBounds(g);
}

export function buildWheelChock(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'DOCK_WHEEL_CHOCK'); const wedge = new T.Shape(); wedge.moveTo(-0.16, 0); wedge.lineTo(0.16, 0); wedge.lineTo(0.12, 0.19); wedge.lineTo(-0.08, 0.19); wedge.lineTo(-0.16, 0);
  const geo = new T.ExtrudeGeometry(wedge, { depth: 0.22, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }); geo.translate(0, 0, -0.11);
  const o = new T.Mesh(geo, furnitureMaterial('darkRubber')); o.castShadow = true; tag(o, 'WHEEL_CHOCK_RUBBER_BODY'); g.add(o);
  g.add(tube(new T.Vector3(0.14, 0.18, 0.11), new T.Vector3(0.34, 0.28, 0.11), 0.006, furnitureMaterial('galvanized'), 'WHEEL_CHOCK_CHAIN_LINK_REFERENCE'));
  return auditBounds(g);
}

export function buildMaterialStatusBoard(opts = {}) {
  const g = buildPlanningBoard({ semantic: opts.semantic || 'MATERIAL_STATUS_BOARD', width: opts.width ?? 1.20, height: opts.height ?? 0.75 });
  g.userData.referenceFamily = 'production visual management board'; return g;
}

export function buildProofRack(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PRINT_PROOF_RACK'); const w = opts.width ?? 1.0, d = opts.depth ?? 0.42, h = opts.height ?? 1.45;
  const frame = furnitureMaterial('galvanized');
  for (const sx of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) g.add(tube(new T.Vector3(sx, 0.08, z), new T.Vector3(sx, h, z), 0.016, frame, 'PROOF_RACK_UPRIGHT'));
  for (let i = 0; i < 7; i++) { const y = 0.18 + i * (h - 0.30) / 6; const shelf = roundedBox(w - 0.05, 0.025, d - 0.04, 0.006, furnitureMaterial('galvanized'), 0.002); shelf.position.y = y; shelf.rotation.x = -0.05; tag(shelf, 'PROOF_RACK_SHELF'); g.add(shelf); }
  return auditBounds(g);
}

export function buildConsumablesCabinet(opts = {}) { return buildToolCabinet({ semantic: opts.semantic || 'PRINTING_CONSUMABLES_CABINET', width: opts.width ?? 0.82, depth: opts.depth ?? 0.48, height: opts.height ?? 1.80 }); }

// ---------------------------------------------------------------------------
// SPECIAL ROOM / WALL / EXTERIOR ACCESSORIES
// ---------------------------------------------------------------------------
export function buildMeetingTable(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'MEETING_TABLE');
  const w = opts.width ?? 2.20, d = opts.depth ?? 0.95, h = opts.height ?? 0.74;
  const top = roundedBox(w, 0.035, d, Math.min(0.20, d * 0.18), furnitureMaterial(opts.topMaterial || 'lightLaminate'), 0.005);
  top.position.y = h; tag(top, 'MEETING_TABLE_TOP'); g.add(top);
  const frame = furnitureMaterial('powderDark');
  const cross = roundedBox(w * 0.72, 0.045, 0.07, 0.012, frame, 0.003); cross.position.set(0, h - 0.10, 0); tag(cross, 'MEETING_TABLE_UNDERFRAME'); g.add(cross);
  for (const sx of [-w * 0.34, w * 0.34]) {
    const post = roundedBox(0.065, h - 0.07, 0.065, 0.012, frame, 0.003); post.position.set(sx, (h - 0.07) / 2, 0); tag(post, 'MEETING_TABLE_PEDESTAL'); g.add(post);
    const foot = roundedBox(0.48, 0.035, 0.075, 0.014, frame, 0.003); foot.position.set(sx, 0.035, 0); tag(foot, 'MEETING_TABLE_FOOT'); g.add(foot);
  }
  const port = roundedBox(0.22, 0.012, 0.10, 0.012, furnitureMaterial('blackPolymer'), 0.002); port.position.set(0, h + 0.023, 0); tag(port, 'MEETING_TABLE_POWER_DATA_LID'); g.add(port);
  return auditBounds(g);
}

export function buildBreakTable(opts = {}) {
  return buildMeetingTable({ semantic: opts.semantic || 'PANTRY_BREAK_TABLE', width: opts.width ?? 1.20, depth: opts.depth ?? 0.70, height: opts.height ?? 0.74, topMaterial: opts.topMaterial || 'lightLaminate' });
}

export function buildBreakChair(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PANTRY_STACKABLE_CHAIR');
  const polymer = furnitureMaterial(opts.material || 'blackPolymer', { color: opts.color ?? 0x68787b });
  const frame = furnitureMaterial('powderDark');
  const seat = roundedBox(0.44, 0.045, 0.43, 0.055, polymer, 0.006); seat.position.y = 0.46; tag(seat, 'BREAK_CHAIR_SEAT_SHELL'); g.add(seat);
  const back = roundedBox(0.43, 0.39, 0.045, 0.060, polymer, 0.006); back.position.set(0, 0.71, 0.18); back.rotation.x = -0.09; tag(back, 'BREAK_CHAIR_BACK_SHELL'); g.add(back);
  for (const sx of [-0.17, 0.17]) for (const sz of [-0.14, 0.14]) g.add(tube(new T.Vector3(sx, 0.03, sz), new T.Vector3(sx, 0.43, sz), 0.012, frame, 'BREAK_CHAIR_TUBULAR_LEG'));
  return auditBounds(g);
}

export function buildLightInspectionTable(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PREPRESS_LIGHT_INSPECTION_TABLE');
  const w = opts.width ?? 1.20, d = opts.depth ?? 0.70, h = opts.height ?? 0.82;
  const frame = furnitureMaterial('powderDark');
  const body = roundedBox(w, 0.18, d, 0.020, furnitureMaterial('powderLight'), 0.004); body.position.y = h - 0.10; tag(body, 'LIGHT_TABLE_BODY'); g.add(body);
  const glow = roundedBox(w - 0.11, 0.022, d - 0.11, 0.018, furnitureMaterial('lightPanel', { emissiveIntensity: 0.95 }), 0.003); glow.position.y = h + 0.01; tag(glow, 'LIGHT_TABLE_TRANSLUCENT_SURFACE'); g.add(glow);
  for (const sx of [-w / 2 + 0.07, w / 2 - 0.07]) for (const sz of [-d / 2 + 0.07, d / 2 - 0.07]) g.add(tube(new T.Vector3(sx, 0.04, sz), new T.Vector3(sx, h - 0.19, sz), 0.020, frame, 'LIGHT_TABLE_LEG'));
  const switchBox = roundedBox(0.16, 0.09, 0.06, 0.012, furnitureMaterial('blackPolymer'), 0.003); switchBox.position.set(w / 2 - 0.13, h - 0.13, -d / 2 - 0.03); tag(switchBox, 'LIGHT_TABLE_SWITCH_BOX'); g.add(switchBox);
  return auditBounds(g);
}

export function buildChemicalCabinet(opts = {}) {
  const g = buildToolCabinet({ semantic: opts.semantic || 'JANITOR_CHEMICAL_CABINET', width: opts.width ?? 0.55, depth: opts.depth ?? 0.40, height: opts.height ?? 1.55 });
  const w = opts.width ?? 0.55, d = opts.depth ?? 0.40, h = opts.height ?? 1.55;
  const warn = labelPlate(0.28, 0.14, 'CHEMICAL_CABINET_WARNING_LABEL_AREA'); warn.position.set(0, h * 0.62, -d / 2 - 0.036); g.add(warn);
  const lock = cyl(0.018, 0.018, 0.018, furnitureMaterial('chrome'), 'CHEMICAL_CABINET_LOCK', [0.08, h * 0.51, -d / 2 - 0.042], 18); lock.rotation.x = Math.PI / 2; g.add(lock);
  return auditBounds(g);
}

export function buildCountertopMicrowave(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'COUNTERTOP_MICROWAVE');
  const w = opts.width ?? 0.50, h = opts.height ?? 0.31, d = opts.depth ?? 0.40;
  const body = roundedBox(w, h, d, 0.025, furnitureMaterial('powderDark'), 0.005); body.position.y = h / 2; tag(body, 'MICROWAVE_BODY'); g.add(body);
  const door = roundedBox(w * 0.70, h * 0.72, 0.018, 0.018, furnitureMaterial('screenDark'), 0.003); door.position.set(-w * 0.09, h * 0.51, -d / 2 - 0.011); tag(door, 'MICROWAVE_DOOR_GLASS'); g.add(door);
  const ctrl = roundedBox(w * 0.18, h * 0.72, 0.018, 0.012, furnitureMaterial('blackPolymer'), 0.003); ctrl.position.set(w * 0.37, h * 0.51, -d / 2 - 0.011); tag(ctrl, 'MICROWAVE_CONTROL_PANEL'); g.add(ctrl);
  for (let i = 0; i < 4; i++) { const b = cyl(0.012, 0.012, 0.008, furnitureMaterial('powderLight'), 'MICROWAVE_BUTTON', [w * 0.37, h * (0.40 + i * 0.10), -d / 2 - 0.024], 12); b.rotation.x = Math.PI / 2; g.add(b); }
  return auditBounds(g);
}

export function buildWaterDispenser(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'PANTRY_WATER_DISPENSER');
  const w = opts.width ?? 0.32, d = opts.depth ?? 0.34, h = opts.height ?? 1.05;
  const body = roundedBox(w, h * 0.78, d, 0.025, furnitureMaterial('powderLight'), 0.005); body.position.y = h * 0.39; tag(body, 'WATER_DISPENSER_BODY'); g.add(body);
  const recess = roundedBox(w * 0.68, h * 0.27, 0.05, 0.018, furnitureMaterial('screenDark'), 0.003); recess.position.set(0, h * 0.54, -d / 2 - 0.02); tag(recess, 'WATER_DISPENSER_RECESS'); g.add(recess);
  for (const sx of [-0.05, 0.05]) { const tap = cyl(0.012, 0.012, 0.08, furnitureMaterial(sx < 0 ? 'powderBlue' : 'powderRed'), 'WATER_DISPENSER_TAP', [sx, h * 0.62, -d / 2 - 0.07], 12); tap.rotation.x = Math.PI / 2; g.add(tap); }
  const bottle = cyl(0.115, 0.13, 0.38, furnitureMaterial('clearPlastic', { color: 0x94c2d0, opacity: 0.35 }), 'WATER_BOTTLE', [0, h * 0.97, 0], 28); g.add(bottle);
  const neck = cyl(0.045, 0.055, 0.08, furnitureMaterial('clearPlastic', { color: 0x94c2d0, opacity: 0.35 }), 'WATER_BOTTLE_NECK', [0, h * 0.77, 0], 20); g.add(neck);
  return auditBounds(g);
}

export function buildLavatory(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'RESTROOM_LAVATORY');
  const w = opts.width ?? 0.55, d = opts.depth ?? 0.45, rimH = opts.rimHeight ?? 0.83;
  const ceramic = furnitureMaterial('whiteCeramic');
  const rim = roundedBox(w, 0.055, d, 0.10, ceramic, 0.006); rim.position.y = rimH; tag(rim, 'LAVATORY_RIM'); g.add(rim);
  const bowl = roundedBox(w * 0.75, 0.18, d * 0.66, 0.10, furnitureMaterial('whiteCeramic', { color: 0xdfe3df }), 0.006); bowl.position.set(0, rimH - 0.10, 0.02); tag(bowl, 'LAVATORY_BOWL'); g.add(bowl);
  const drain = cyl(0.025, 0.025, 0.010, furnitureMaterial('chrome'), 'LAVATORY_DRAIN', [0, rimH - 0.19, 0.02], 24); g.add(drain);
  const spoutCurve = new T.CatmullRomCurve3([new T.Vector3(0, rimH + 0.02, d / 2 - 0.08), new T.Vector3(0, rimH + 0.18, d / 2 - 0.08), new T.Vector3(0, rimH + 0.19, 0.04), new T.Vector3(0, rimH + 0.12, 0.00)]);
  const faucet = new T.Mesh(new T.TubeGeometry(spoutCurve, 18, 0.011, 10, false), furnitureMaterial('chrome')); tag(faucet, 'LAVATORY_FAUCET'); g.add(faucet);
  const pedestal = roundedBox(0.22, rimH - 0.18, 0.20, 0.09, ceramic, 0.006); pedestal.position.set(0, (rimH - 0.18) / 2, 0.08); tag(pedestal, 'LAVATORY_PEDESTAL'); g.add(pedestal);
  return auditBounds(g);
}

export function buildFloorDrain(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'FLOOR_DRAIN'); const s = opts.size ?? 0.12;
  const frame = roundedBox(s, 0.012, s, 0.010, furnitureMaterial('stainless'), 0.002); frame.position.y = 0.006; tag(frame, 'FLOOR_DRAIN_FRAME'); g.add(frame);
  for (let i = -2; i <= 2; i++) { const slot = roundedBox(s * 0.70, 0.004, 0.009, 0.003, furnitureMaterial('screenDark'), 0.001); slot.position.set(0, 0.014, i * s * 0.12); tag(slot, 'FLOOR_DRAIN_GRATE_SLOT'); g.add(slot); }
  return auditBounds(g);
}

export function buildToiletCubicleHardware(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'TOILET_CUBICLE_HARDWARE');
  const h = opts.doorHeight ?? 1.85, w = opts.doorWidth ?? 0.72;
  const door = roundedBox(w, h, 0.028, 0.012, furnitureMaterial('darkLaminate', { color: 0x9aa3a1 }), 0.003); door.position.y = 0.15 + h / 2; tag(door, 'TOILET_CUBICLE_DOOR'); g.add(door);
  for (const y of [0.52, 1.35]) { const hinge = cyl(0.015, 0.015, 0.09, furnitureMaterial('stainless'), 'TOILET_CUBICLE_HINGE', [-w / 2 - 0.015, y, 0], 16); g.add(hinge); }
  const latch = roundedBox(0.09, 0.045, 0.035, 0.010, furnitureMaterial('stainless'), 0.002); latch.position.set(w / 2 - 0.08, 1.02, -0.025); tag(latch, 'TOILET_CUBICLE_LATCH'); g.add(latch);
  for (const sx of [-w / 2 + 0.08, w / 2 - 0.08]) { const foot = cyl(0.018, 0.018, 0.15, furnitureMaterial('stainless'), 'TOILET_CUBICLE_FOOT', [sx, 0.075, 0], 16); g.add(foot); }
  const hook = uHandle(0.035, 0.07, 0.006, furnitureMaterial('stainless'), 'TOILET_CUBICLE_COAT_HOOK'); hook.position.set(0, 1.52, -0.035); hook.rotation.z = Math.PI / 2; g.add(hook);
  return auditBounds(g);
}

export function buildMopToolRack(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'JANITOR_MOP_TOOL_RACK'); const w = opts.width ?? 0.75;
  const rail = roundedBox(w, 0.07, 0.05, 0.012, furnitureMaterial('powderDark'), 0.003); tag(rail, 'MOP_RACK_RAIL'); g.add(rail);
  for (let i = 0; i < 4; i++) { const x = -w * 0.36 + i * w * 0.24; const grip = cyl(0.023, 0.023, 0.035, furnitureMaterial('darkRubber'), 'MOP_RACK_RUBBER_GRIP', [x, 0, -0.035], 16); grip.rotation.x = Math.PI / 2; g.add(grip); const hook = uHandle(0.05, 0.08, 0.006, furnitureMaterial('stainless'), 'MOP_RACK_HOOK'); hook.position.set(x, -0.06, -0.01); hook.rotation.z = Math.PI; g.add(hook); }
  return g;
}

export function buildWallDocumentHolder(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'WALL_DOCUMENT_HOLDER'); const w = opts.width ?? 0.34, h = opts.height ?? 0.44, d = opts.depth ?? 0.06;
  const back = roundedBox(w, h, 0.018, 0.012, furnitureMaterial('powderLight'), 0.003); back.position.y = h / 2; tag(back, 'DOCUMENT_HOLDER_BACK'); g.add(back);
  const pocket = roundedBox(w - 0.05, h * 0.56, d, 0.012, furnitureMaterial('acrylicClear', { opacity: 0.42 }), 0.003); pocket.position.set(0, h * 0.30, -d / 2); tag(pocket, 'DOCUMENT_HOLDER_POCKET'); g.add(pocket);
  const label = labelPlate(w * 0.64, 0.06, 'DOCUMENT_HOLDER_LABEL'); label.position.set(0, h * 0.78, -0.02); g.add(label);
  return g;
}

export function buildMaintenanceLogHolder(opts = {}) {
  return buildWallDocumentHolder({ semantic: opts.semantic || 'MAINTENANCE_LOG_HOLDER', width: opts.width ?? 0.30, height: opts.height ?? 0.38, depth: opts.depth ?? 0.05 });
}

export function buildInsulatingMatReference(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'INSULATING_MAT_REFERENCE', { complianceClaim: false }); const w = opts.width ?? 1.20, d = opts.depth ?? 0.75;
  const mat = roundedBox(w, 0.010, d, 0.018, furnitureMaterial('darkRubber'), 0.002); mat.position.y = 0.005; tag(mat, 'RUBBER_INSULATING_MAT_VISUAL_REFERENCE'); g.add(mat);
  for (let i = 0; i < 7; i++) { const rib = cube(w - 0.05, 0.004, 0.008, furnitureMaterial('greyRubber'), 'INSULATING_MAT_RIB', [0, 0.013, -d / 2 + 0.08 + i * (d - 0.16) / 6]); g.add(rib); }
  return auditBounds(g);
}

export function buildDockSign(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'DOCK_REFERENCE_SIGN');
  const w = opts.width ?? 0.52, h = opts.height ?? 0.42;
  const plate = roundedBox(w, h, 0.025, 0.018, furnitureMaterial(opts.warning ? 'powderYellow' : 'labelWhite'), 0.004); plate.position.y = h / 2; tag(plate, 'DOCK_SIGN_PLATE'); g.add(plate);
  const borderTop = roundedBox(w * 0.90, 0.018, 0.010, 0.004, furnitureMaterial('screenDark'), 0.001); borderTop.position.set(0, h * 0.40, -0.018); tag(borderTop, 'DOCK_SIGN_GRAPHIC_CUE'); g.add(borderTop);
  const borderBottom = borderTop.clone(); borderBottom.position.y = h * 0.18; tag(borderBottom, 'DOCK_SIGN_GRAPHIC_CUE'); g.add(borderBottom);
  return g;
}

export function buildWeatherproofWasteBin(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'EXTERIOR_WEATHERPROOF_WASTE_BIN');
  const w = opts.width ?? 0.46, d = opts.depth ?? 0.42, h = opts.height ?? 0.78;
  const body = roundedBox(w, h * 0.84, d, 0.055, furnitureMaterial('blackPolymer', { color: 0x4b5555 }), 0.008); body.position.y = h * 0.42; tag(body, 'EXTERIOR_BIN_BODY'); g.add(body);
  const lid = roundedBox(w + 0.035, 0.08, d + 0.035, 0.045, furnitureMaterial('blackPolymer'), 0.006); lid.position.y = h * 0.88; tag(lid, 'EXTERIOR_BIN_LID'); g.add(lid);
  const opening = roundedBox(w * 0.55, 0.12, 0.025, 0.030, furnitureMaterial('screenDark'), 0.003); opening.position.set(0, h * 0.63, -d / 2 - 0.020); tag(opening, 'EXTERIOR_BIN_OPENING'); g.add(opening);
  return auditBounds(g);
}

export function buildHoseReelCabinet(opts = {}) {
  const g = new T.Group(); tag(g, opts.semantic || 'HOSE_REEL_CABINET_REFERENCE', { sourceEvidenceRequired: true });
  const w = opts.width ?? 0.75, h = opts.height ?? 0.75, d = opts.depth ?? 0.24;
  const body = roundedBox(w, h, d, 0.025, furnitureMaterial('powderRed'), 0.005); body.position.y = h / 2; tag(body, 'HOSE_REEL_CABINET_BODY'); g.add(body);
  const window = roundedBox(w * 0.66, h * 0.62, 0.015, 0.020, furnitureMaterial('acrylicClear', { opacity: 0.30 }), 0.002); window.position.set(0, h * 0.52, -d / 2 - 0.010); tag(window, 'HOSE_REEL_CABINET_WINDOW'); g.add(window);
  const reel = new T.Mesh(new T.TorusGeometry(w * 0.21, 0.024, 10, 32), furnitureMaterial('darkRubber')); reel.position.set(0, h * 0.52, -d / 2 - 0.005); tag(reel, 'HOSE_REEL_VISIBLE_CUE'); g.add(reel);
  const handle = roundedBox(0.018, 0.13, 0.024, 0.006, furnitureMaterial('stainless'), 0.002); handle.position.set(w * 0.38, h * 0.50, -d / 2 - 0.030); tag(handle, 'HOSE_CABINET_HANDLE'); g.add(handle);
  return g;
}

// ---------------------------------------------------------------------------
// COMPOSITION / VALIDATION HELPERS
// ---------------------------------------------------------------------------
export const BUILDER_CATALOG = Object.freeze({
  taskChair: buildTaskChair,
  visitorChair: buildVisitorChair,
  officeDesk: buildOfficeDesk,
  mobilePedestal: buildMobilePedestal,
  mfp: buildMFP,
  credenza: buildCredenza,
  planningBoard: buildPlanningBoard,
  qcBench: buildQCBench,
  lightBooth: buildColorLightBooth,
  labStool: buildLabStool,
  flatFile: buildFlatFileCabinet,
  plateTrolley: buildPlateTrolley,
  hopperBin: buildHopperBin,
  spareRack: buildSparePartsRack,
  workbench: buildWorkshopWorkbench,
  toolCabinet: buildToolCabinet,
  toolCart: buildMobileToolCart,
  lockerBank: buildLockerBank,
  lockerBench: buildLockerBench,
  shoeRack: buildShoeRack,
  prayerBench: buildPrayerBench,
  prayerMat: buildPrayerMat,
  pantryRun: buildPantryRun,
  serviceSink: buildServiceSink,
  housekeepingCart: buildHousekeepingCart,
  restroomSet: buildRestroomAccessorySet,
  woodPallet: buildWoodPallet,
  paperboardPallet: buildPaperboardPalletLoad,
  reelCradle: buildReelCradle,
  palletJack: buildPalletJack,
  platformTrolley: buildPlatformTrolley,
  sheetTrolley: buildSheetTrolley,
  dieTrolley: buildDieToolTrolley,
  cartonBlankTrolley: buildCartonBlankTrolley,
  wasteStation: buildWasteSegregationStation,
  floorScale: buildFloorScale,
  stretchWrapper: buildStretchWrapper,
  convexMirror: buildConvexMirror,
  bollard: buildSafetyBollard,
  wheelChock: buildWheelChock,
  statusBoard: buildMaterialStatusBoard,
  proofRack: buildProofRack,
  consumablesCabinet: buildConsumablesCabinet,
  meetingTable: buildMeetingTable,
  breakTable: buildBreakTable,
  breakChair: buildBreakChair,
  lightInspectionTable: buildLightInspectionTable,
  chemicalCabinet: buildChemicalCabinet,
  countertopMicrowave: buildCountertopMicrowave,
  waterDispenser: buildWaterDispenser,
  lavatory: buildLavatory,
  floorDrain: buildFloorDrain,
  toiletCubicleHardware: buildToiletCubicleHardware,
  mopToolRack: buildMopToolRack,
  wallDocumentHolder: buildWallDocumentHolder,
  maintenanceLogHolder: buildMaintenanceLogHolder,
  insulatingMatReference: buildInsulatingMatReference,
  dockSignage: buildDockSign,
  weatherproofWasteBin: buildWeatherproofWasteBin,
  hoseCabinetOrReel: buildHoseReelCabinet,
  equipmentBollard: buildSafetyBollard,
});

export function buildFurnitureAsset(kind, options = {}) {
  const builder = BUILDER_CATALOG[kind];
  if (!builder) throw new Error(`Unknown furniture asset kind: ${kind}`);
  return builder(options);
}

export function orientToward(object, target, upAxis = 'y') {
  if (!object || !target) return object;
  const p = object.position, dx = target.x - p.x, dz = target.z - p.z;
  if (upAxis === 'y') object.rotation.y = Math.atan2(dx, dz);
  return object;
}

export function groundAsset(object, floorY = 0, tolerance = 0.01) {
  object.updateMatrixWorld(true); const b = new T.Box3().setFromObject(object); const delta = floorY - b.min.y;
  if (Math.abs(delta) > tolerance) object.position.y += delta;
  object.updateMatrixWorld(true); return object;
}

export function furnitureCollisionAudit(root, { includeInvisible = false, minimumGap = 0.025 } = {}) {
  const items = [];
  root.traverse(o => {
    if (!o.isGroup || !o.userData?.semantic || (!includeInvisible && o.visible === false)) return;
    const b = new T.Box3().setFromObject(o); if (b.isEmpty()) return;
    items.push({ o, b });
  });
  const collisions = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (a.o.parent === b.o || b.o.parent === a.o) continue;
    const ix = Math.min(a.b.max.x, b.b.max.x) - Math.max(a.b.min.x, b.b.min.x);
    const iy = Math.min(a.b.max.y, b.b.max.y) - Math.max(a.b.min.y, b.b.min.y);
    const iz = Math.min(a.b.max.z, b.b.max.z) - Math.max(a.b.min.z, b.b.min.z);
    if (ix > minimumGap && iy > minimumGap && iz > minimumGap) collisions.push({ a: a.o.userData.semantic, b: b.o.userData.semantic, overlap: [ix, iy, iz] });
  }
  return collisions;
}

export function furnitureGroundingAudit(root, floorY = 0, tolerance = 0.015) {
  const issues = [];
  for (const c of root.children) {
    const b = new T.Box3().setFromObject(c); if (b.isEmpty()) continue;
    const error = b.min.y - floorY;
    if (Math.abs(error) > tolerance) issues.push({ semantic: c.userData?.semantic || c.name, floorError: error });
  }
  return issues;
}

export function applyAssetTransform(asset, { x = 0, y = 0, z = 0, rotationY = 0, scale = 1 } = {}) {
  place(asset, x, y, z, rotationY); asset.scale.setScalar(scale); return asset;
}