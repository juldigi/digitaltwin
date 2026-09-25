import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V177 2D mode uses explicit plan copy instead of stale 3D wording',()=>{
  assert.match(shell,/syncViewModeText\(q\('#view-kicker'\),'DENAH PABRIK · 2D',is2d\)/);
  assert.match(shell,/Aset terpilih ditandai pada denah pabrik/);
  assert.match(shell,/Denah 2D · Aset terpilih/);
  assert.match(shell,/Pilih aset melalui menu Aset atau denah 2D\./);
});

test('V177 preserves external 3D copy while 2D mode is active and restores it later',()=>{
  const body=shell.slice(shell.indexOf('function syncViewModeText'),shell.indexOf('function syncViewModeContext'));
  assert.match(body,/el\.dataset\.viewMode3dText=el\.textContent/);
  assert.match(body,/el\.textContent!==last2d/);
  assert.match(body,/el\.textContent=el\.dataset\.viewMode3dText/);
  assert.match(body,/delete el\.dataset\.viewMode2dText;delete el\.dataset\.viewMode3dText;delete el\.dataset\.viewModeCopy/);
});

test('V177 canonical state subscriber owns both visible mode state and mode-specific copy',()=>{
  assert.match(shell,/subscribe\(state=>\{applyInspectorDom\(state\);applyViewModeDom\(state\);markSection\(state\.activeSection\);syncLayerControls\(\);syncAccessibleControls\(state\);syncPressedTools\(state\);syncInspectorTabs\(state\);syncVisualHierarchy\(state\);syncViewModeContext\(state\)/);
});

test('V177 shell and service worker are cache-busted',()=>{
  assert.match(html,/src\/app-shell-v79\.js\?v=213/);
  assert.match(sw,/factory-digital-twin-v213-mobile-layout-20260925/);
});
