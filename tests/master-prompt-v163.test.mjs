import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V194 assigns navigation, view mode and inspector state to the canonical shell',()=>{
 for(const legacy of [
  /\$\('#mode-2d'\)\?\.addEventListener/,
  /\$\('#mode-3d'\)\?\.addEventListener/,
  /\$\('#nav-machine'\)\?\.addEventListener/,
  /\$\('#panel-toggle'\)\?\.addEventListener/,
  /panel-launcher/,
  /ui-workbench/
 ]) assert.doesNotMatch(ui,legacy);
 assert.match(shell,/function applyInspectorDom\(state=getState\(\)\)/);
 assert.match(shell,/function applyViewModeDom\(state=getState\(\)\)/);
 assert.match(shell,/setViewMode/);
 assert.match(shell,/setInspector/);
});

test('V194 compatibility UI layer is reduced to viewport shortcuts only',()=>{
 assert.match(ui,/function bindViewportShortcuts\(\)/);
 assert.match(ui,/function syncViewportMetadata\(\)/);
 assert.doesNotMatch(ui,/panel-launcher/);
 assert.doesNotMatch(ui,/workbench/);
 assert.doesNotMatch(ui,/mobile-panel-open/);
});

test('V163 cache identifiers force the controller cleanup onto existing devices',()=>{
 assert.match(html,/src\/ui-v5\.js\?v=167/);
 assert.match(sw,/factory-digital-twin-v209-architecture-convergence-20260925/);
});
