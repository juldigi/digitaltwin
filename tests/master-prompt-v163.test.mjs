import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V163 assigns canonical navigation and inspector state to one controller',()=>{
 assert.match(ui,/V163: navigation, view mode, theme, and inspector state are owned exclusively by app-shell-v79\.js/);
 for(const legacy of [
  /\$\('#mode-2d'\)\?\.addEventListener/,
  /\$\('#mode-3d'\)\?\.addEventListener/,
  /\$\('#nav-layout'\)\?\.addEventListener/,
  /\$\('#nav-machine'\)\?\.addEventListener/,
  /\$\('#nav-components'\)\?\.addEventListener/,
  /\$\('#nav-exterior'\)\?\.addEventListener/,
  /\$\('#ui-theme-toggle'\)\?\.addEventListener/,
  /\$\('#panel-toggle'\)\?\.addEventListener/,
  /\$\('#close-panel'\)\?\.addEventListener/
 ]) assert.doesNotMatch(ui,legacy);
 assert.match(shell,/setViewMode/);
 assert.match(shell,/setInspector/);
});

test('V163 keeps the foundation-status bridge and mobile utility behavior',()=>{
 assert.match(ui,/panel-launcher[^\n]+bmj:foundationstatusrequest/);
 assert.match(ui,/bindResponsiveLayout\(\)/);
 assert.match(ui,/bindShortcuts\(\)/);
});

test('V163 cache identifiers force the controller cleanup onto existing devices',()=>{
 assert.match(html,/src\/ui-v5\.js\?v=167/);
 assert.match(sw,/factory-digital-twin-v169-reference-card-selector-20260923/);
});
