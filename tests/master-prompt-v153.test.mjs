import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const building=fs.readFileSync(new URL('../frontend/src/factory-building.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('technical 3D availability follows registry data for each asset',async()=>{
  const {canOpenTechnical3D,scopedRegistryHas3D}=await import('../frontend/src/data/foundation-scope.js');
  const {MACHINE_REGISTRY_BY_ID}=await import('../frontend/src/data/machine-registry.js');
  for(const id of ['BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0005','BMJ-MCH-0009','BMJ-MCH-0010']){
    const record=MACHINE_REGISTRY_BY_ID.get(id);
    assert.equal(canOpenTechnical3D(record),record.has3D);
    assert.equal(scopedRegistryHas3D(record),record.has3D);
  }
  assert.equal(canOpenTechnical3D('unknown-machine'),false);
});

test('engine creates the selected machine and simulation without another renderer',()=>{
  assert.match(engine,/async switchMachine\(key\)/);
  assert.match(engine,/import\('\.\/machine-runtime\.js'\)/);
  assert.match(engine,/this\.machineKey=requested/);
  assert.match(app,/await engine\.switchMachine\(MACHINE_KEY\)/);
  assert.match(app,/selectedAsset:assetId/);
});

test('asset discovery uses registry-backed 3D availability',()=>{
  assert.match(app,/has3D:scopedRegistryHas3D\(machine\)/);
  assert.match(app,/if\(!scopedRegistryHas3D\(machine\)\)continue/);
  assert.match(app,/switchActiveMachine\(machineRoute\(machine\)\)/);
});

test('factory meshes carry explicit foundation-scope truth metadata',()=>{
  assert.match(building,/foundationScope=canOpenTechnical3D\(p\.machineId\)\?'TECHNICAL_ASSET':'LAYOUT_PLACEHOLDER'/);
  assert.match(building,/technical3DEnabled:foundationScope==='TECHNICAL_ASSET'/);
  assert.match(building,/mesh\.userData=\{machineId:p\.machineId,foundationScope\}/);
});

test('factory-first boot stays covered until CAD layout is loaded and failures are explicit',()=>{
  assert.match(app,/Menyiapkan denah pabrik/);
  assert.match(app,/bundledLayout=await loadBundledPlantLayout\(\)/);
  assert.match(app,/await restoreHistoryContext\(\);/);
  assert.match(app,/boot\.hidden=true/);
  assert.match(app,/Denah pabrik belum dapat dimuat/);
  assert.match(app,/Tidak ada geometri pengganti yang dibuat/);
  assert.match(app,/Muat Ulang/);
});

test('V153 cache includes the foundation policy and current cache-busted controller',()=>{
  assert.match(html,/app-shell-v79\.css\?v=184/);
  assert.match(html,/src\/app\.js\?v=184/);
  assert.match(html,/src\/app-shell-v79\.js\?v=184/);
  assert.match(sw,/factory-digital-twin-v184-simulation-overlay-hardening-20260923/);
  assert.match(sw,/src\/data\/foundation-scope\.js/);
});
