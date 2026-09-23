import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const runtime=readFileSync(new URL('../frontend/src/machine-runtime.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('runtime no longer defaults unknown or empty routes to Offset 5',()=>{
 assert.match(runtime,/return raw\?\(LEGACY_MACHINE_ROUTE\[raw\]\|\|raw\):null/);
 assert.match(runtime,/if\(!k\)throw new Error\('Machine key is required'\)/);
 assert.match(runtime,/throw new Error\(\`No 3D template registered for \$\{k\}\`\)/);
 assert.match(runtime,/throw new Error\(\`No simulation registered for \$\{k\}\`\)/);
 assert.doesNotMatch(runtime,/return new OffsetMachineTemplate\(\);\s*\}/);
});

test('application routing preserves the selected machine instead of silently substituting Offset 5',()=>{
 assert.match(app,/if\(!requested\)throw new Error\('Aset mesin harus dipilih sebelum membuka model 3D\.'\)/);
 assert.match(app,/MACHINE_KEY=requested/);
 assert.match(app,/if\(!normalizedRoute\)\{assetDialog\(\);return false;\}/);
 assert.match(app,/machine\?\.machineId\|\|null/);
});

test('engine rejects an empty switch request',()=>{
 assert.match(engine,/raw==='BMJ-MCH-0003'\?'offset5':raw\|\|null/);
 assert.match(engine,/if\(!requested\)\{this\.onError\?\.\('Pilih aset sebelum membuka model 3D\.'\);return false;\}/);
});

test('V186 rotates active browser and service-worker identifiers',()=>{
 assert.match(index,/app-shell-v79\.css\?v=187/);
 assert.match(index,/src\/app\.js\?v=187/);
 assert.match(index,/src\/app-shell-v79\.js\?v=187/);
 assert.match(sw,/factory-digital-twin-v187-simulation-contract-hardening-20260923/);
 assert.match(app,/pair\('Versi aplikasi','V187'\)/);
});
