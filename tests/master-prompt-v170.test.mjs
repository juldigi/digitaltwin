import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const shell=read('../frontend/src/app-shell-v79.js');

test('V170 inspector tabs synchronize canonical section and inspector state',()=>{
 assert.match(shell,/const INSPECTOR_TAB_SECTION=\{overview:'asset',structure:'asset',data:'asset',exterior:'asset',simulation:'simulation',sources:'reference'\}/);
 assert.match(shell,/qa\('#detail-panel \[role="tab"\]'\)\.forEach\(tab=>tab\.addEventListener\('click'/);
 assert.match(shell,/setInspector\(true,tabKey\);setActiveSection\(section\);markSection\(section\);requestAnimationFrame\(syncSimulationTransport\)/);
 assert.doesNotMatch(shell,/q\('\[data-tab="simulation"\]'\)\?\.addEventListener/);
});

test('V170 leaving Simulation through another inspector tab hides simulation section state',()=>{
 assert.match(shell,/overview:'asset'/);
 assert.match(shell,/structure:'asset'/);
 assert.match(shell,/data:'asset'/);
 assert.match(shell,/exterior:'asset'/);
 assert.match(shell,/sources:'reference'/);
 assert.match(shell,/const transportOpen=section==='simulation'/);
});

test('V193 keeps Simulation and Reference contextual under the Asset domain',()=>{
 assert.match(shell,/function primarySectionFor\(section\)/);
 assert.match(shell,/return section==='simulation'\|\|section==='reference'\?'asset':section/);
 assert.doesNotMatch(html,/id="nav-simulation-mode"/);
 assert.doesNotMatch(html,/id="nav-sources"/);
 assert.match(html,/data-tab="simulation"/);
 assert.match(html,/data-tab="sources"/);
 assert.doesNotMatch(shell,/setActiveSection\('help'\)/);
 assert.doesNotMatch(shell,/setActiveSection\('settings'\)/);
});

test('V170 shell controller is cache-busted',()=>{
 assert.match(html,/src\/app-shell-v79\.js\?v=221/);
});
