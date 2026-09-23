import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V174 visible 2D and 3D controls follow canonical viewMode',()=>{
 const body=shell.slice(shell.indexOf('function syncAccessibleControls'),shell.indexOf('function syncPressedTools'));
 assert.match(body,/const mode2d=q\('#mode-2d'\),mode3d=q\('#mode-3d'\),is2d=state\.viewMode==='2d'/);
 assert.match(body,/mode2d\.classList\.toggle\('active',is2d\)/);
 assert.match(body,/mode3d\.classList\.toggle\('active',!is2d\)/);
 assert.match(body,/mode2d\.setAttribute\('aria-pressed',String\(is2d\)\)/);
 assert.match(body,/mode3d\.setAttribute\('aria-pressed',String\(!is2d\)\)/);
});

test('V174 one state subscriber synchronizes view controls after click or history restore',()=>{
 assert.match(shell,/subscribe\(state=>\{markSection\(state\.activeSection\);syncLayerControls\(\);syncAccessibleControls\(state\)/);
 assert.match(shell,/addEventListener\('bmj:historyrestore'/);
 assert.match(shell,/setState\(\{selectedAsset:detail\.selectedAsset\|\|null,selectedNode:detail\.selectedNode\|\|null,sceneMode,viewMode,cameraPreset,activeSection\},\{url:false\}\)/);
});

test('V174 shell and service worker are cache-busted',()=>{
 assert.match(html,/src\/app-shell-v79\.js\?v=174/);
 assert.match(sw,/factory-digital-twin-v176-runtime-selector-safety-20260923/);
});
