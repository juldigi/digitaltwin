import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../frontend/index.html');
const engine = read('../frontend/src/engine.js');
const lite = read('../frontend/src/omodos-lite.js');
const sw = read('../frontend/sw.js');
const registry = read('../frontend/src/data/machine-registry.js');

test('OMODOS lite is an opt-in route and does not alter the default DigitalTwin route', () => {
  assert.match(html, /src\/omodos-lite\.js\?v=1/);
  assert.match(lite, /params\.get\('mode'\)\s*===\s*'omodos-lite'/);
  assert.match(engine, /new URLSearchParams\(location\.search\)\.get\('mode'\)==='omodos-lite'/);
  assert.match(sw, /'\.\/src\/omodos-lite\.js'/);
});

test('parent status messages are restricted to the production OMODOS origin and current iframe', () => {
  assert.match(lite, /https:\/\/omodos\.juldigi\.workers\.dev/);
  assert.match(lite, /event\.source !== window\.parent/);
  assert.match(lite, /allowedParentOrigins\.has\(event\.origin\)/);
  assert.match(lite, /data\.type !== 'OMODOS_MACHINE_STATUS_V1'/);
  assert.match(lite, /window\.parent\.postMessage\(\{ type: 'OMODOS_LITE_READY_V1' \}/);
});

test('lite scene hides building envelope and exposes only machine-root callouts', () => {
  for (const layer of ['building','ipal','floor','walls','doors','windows','air_curtain','furniture','roof','landscape','reference']) {
    assert.ok(lite.includes("'" + layer + "'"), 'missing layer policy: ' + layer);
  }
  assert.match(lite, /nextEngine\.setFactoryLayer\('machines', true\)/);
  assert.match(lite, /nextEngine\.setFactoryLayer\('unidentified', true\)/);
  assert.match(lite, /assetRoots\.has\(child\)/);
  assert.match(lite, /engine\.onFactorySelect = null/);
  assert.match(lite, /engine\.onSelect = \(\) => \{\}/);
  assert.doesNotMatch(lite, /machineDetailDialog|selectFactoryAssetContext/);
});

test('machine status mapping uses unique SAP codes and exact-name fallback for ambiguous codes', () => {
  assert.match(registry, /sapCode/);
  assert.match(lite, /registryByCode\.get\(code\)/);
  assert.match(lite, /registryByName\.get\(name\)/);
  assert.match(lite, /if \(candidates\.length !== 1\) continue/);
  assert.match(lite, /statusText\(status\)/);
});
