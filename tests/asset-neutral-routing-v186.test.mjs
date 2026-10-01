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
 assert.match(runtime,/if\(!k\)throw new Error\('Identitas mesin belum tersedia\.'\)/);
 assert.match(runtime,/throw new Error\(\`Model 3D untuk \$\{k\} belum tersedia\.\`\)/);
 assert.match(runtime,/throw new Error\(\`Simulasi untuk \$\{k\} belum tersedia\.\`\)/);
 assert.doesNotMatch(runtime,/return new OffsetMachineTemplate\(\);\s*\}/);
});

test('application routing preserves the selected machine instead of silently substituting Offset 5',()=>{
 assert.match(app,/if\(!requested\)\{clearActiveMachineDescriptor\(\);return false;\}/);
 assert.match(app,/MACHINE_KEY=requested/);
 assert.match(app,/if\(!normalizedRoute\)\{assetDialog\(\);return false;\}/);
 assert.match(app,/MACHINE_KEY=null/);
 assert.doesNotMatch(app,/MACHINE_KEY=FOUNDATION_SCOPE\.primaryRoute/);
});

test('engine rejects an empty switch request',()=>{
 assert.match(engine,/raw==='BMJ-MCH-0003'\?'offset5':raw\|\|null/);
 assert.match(engine,/if\(!requested\)\{this\.onError\?\.\('Pilih mesin atau peralatan sebelum membuka model 3D\.'\);return false;\}/);
});

test('V186 rotates active browser and service-worker identifiers',()=>{
 assert.match(index,/app-shell-v79\.css\?v=273/);
 assert.match(index,/src\/app\.js\?v=273/);
 assert.match(index,/src\/app-shell-v79\.js\?v=273/);
 assert.match(sw,/factory-digital-twin-v273-full-fleet-state-sync-20261001/);
 assert.match(app,/pair\('Versi aplikasi',APP_BUILD\)/);
});
