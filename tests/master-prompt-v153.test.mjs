import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const building=fs.readFileSync(new URL('../frontend/src/factory-building.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('master-prompt foundation scope exposes exactly OFFSET 5 as the primary technical asset',()=>{
  assert.match(scope,/primaryMachineId:'BMJ-MCH-0003'/);
  assert.match(scope,/primaryRoute:'offset5'/);
  assert.match(scope,/primaryAssetName:'OFFSET 5'/);
  assert.match(scope,/expansionMode:'LAYOUT_PLACEHOLDERS_ONLY'/);
  assert.match(scope,/return Boolean\(machine\?\.has3D\)&&isFoundationPrimary\(machine\)/);
});

test('runtime cannot open detailed technical 3D for non-primary assets',()=>{
  assert.match(engine,/if\(!canOpenTechnical3D\(requested\)\)/);
  assert.match(engine,/placeholder tata letak/);
  assert.match(engine,/this\.machineKey=canOpenTechnical3D\(requested\)\?requested:FOUNDATION_SCOPE\.primaryRoute/);
  assert.doesNotMatch(engine,/universalMachineConfig/);
  assert.match(app,/if\(!canOpenTechnical3D\(route\)\)/);
  assert.match(app,/focusFoundationPlaceholder/);
});

test('asset discovery keeps the full registry but technical structure expansion is limited to the primary asset',()=>{
  assert.match(app,/has3D:scopedRegistryHas3D\(machine\)/);
  assert.match(app,/if\(!scopedRegistryHas3D\(machine\)\)continue/);
  assert.match(app,/Placeholder tata letak/);
  assert.match(app,/aset 3D teknis/);
  assert.match(app,/primary\?'Aset utama':'Placeholder'/);
});

test('factory meshes carry explicit foundation-scope truth metadata',()=>{
  assert.match(building,/foundationScope=isFoundationPrimary\(p\.machineId\)\?'PRIMARY_TECHNICAL_ASSET':'LAYOUT_PLACEHOLDER'/);
  assert.match(building,/technical3DEnabled:foundationScope==='PRIMARY_TECHNICAL_ASSET'/);
  assert.match(building,/mesh\.userData=\{machineId:p\.machineId,foundationScope\}/);
});

test('factory-first boot stays covered until CAD layout is loaded and failures are explicit',()=>{
  assert.match(app,/Menyiapkan denah pabrik/);
  assert.match(app,/bundledLayout=await loadBundledPlantLayout\(\)/);
  assert.match(app,/else showHome\(\)/);
  assert.match(app,/boot\.hidden=true/);
  assert.match(app,/Denah pabrik belum dapat dimuat/);
  assert.match(app,/Tidak ada geometri pengganti yang dibuat/);
  assert.match(app,/Muat Ulang/);
});

test('V153 cache includes the foundation policy and current cache-busted controller',()=>{
  assert.match(html,/app-shell-v79\.css\?v=157/);
  assert.match(html,/src\/app\.js\?v=157/);
  assert.match(html,/src\/app-shell-v79\.js\?v=157/);
  assert.match(sw,/factory-digital-twin-v157-phase3-interaction-20260922/);
  assert.match(sw,/src\/data\/foundation-scope\.js/);
});
