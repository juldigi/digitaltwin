import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const embed = read('../frontend/src/omodos-status-embed.js');
const html = read('../frontend/index.html');
const app = read('../frontend/src/app.js');
const registry = read('../frontend/src/data/machine-registry.js');

test('OMODOS viewer is an opt-in route; regular DigitalTwin remains intact', () => {
  assert.match(embed, /get\('embed'\)\s*!==\s*EMBED_KEY/);
  assert.match(embed, /const EMBED_KEY\s*=\s*'omodos-status'/);
  assert.match(html, /src="\.\/src\/omodos-status-embed\.js\?v=/);
  assert.match(app, /window\.__BMJ_FACTORY_ENGINE__\s*=\s*engine/);
});

test('parent-to-iframe status protocol checks source and allowed origin', () => {
  assert.match(embed, /https:\/\/omodos\.juldigi\.workers\.dev/);
  assert.match(embed, /event\.source!==window\.parent/);
  assert.match(embed, /ALLOWED_PARENT_ORIGINS\.has\(event\.origin\)/);
  assert.match(embed, /payload\.type!==\s*'OMODOS_FACTORY_STATUS'/);
  assert.match(embed, /type:'OMODOS_FACTORY_STATUS_READY'/);
});

test('viewer hides the building envelope, retains machine assets and disables detail selection', () => {
  for (const layer of ['building:false','walls:false','doors:false','windows:false','roof:false','machines:true','labels:false']) {
    assert.ok(embed.includes(layer), 'missing embed layer rule: ' + layer);
  }
  assert.match(embed, /engine\.onFactorySelect=\(\)=>\{\}/);
  assert.match(embed, /engine\.onTaxonomySelect=\(\)=>\{\}/);
  assert.match(embed, /state\.authorized/);
});

test('Indonesian critical status is shown with the critical visual style', () => {
  assert.match(embed, /critical\|kritikal/);
});

test('missing or unavailable machine status stays neutral', () => {
  assert.match(embed, /s==='belum ada data'/);
  assert.match(embed, /s==='belum tersedia'/);
});

test('ambiguous SAP codes cannot override a unique full machine name', () => {
  assert.match(registry, /sapCode/);
  assert.match(embed, /registryAliasOwners/);
  assert.match(embed, /registryNameCounts/);
  assert.match(embed, /nameIsUnique&&name===nameKey/);
  assert.match(embed, /owners\?\.size===1&&owners\.has\(machineId\)/);
  assert.match(embed, /Duplicate SAP codes \(for example PLT-1\)/);
});
