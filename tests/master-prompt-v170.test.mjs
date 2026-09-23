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

test('V170 mobile More represents Reference without turning transient modals into sections',()=>{
 assert.match(shell,/const mobileSection=section==='reference'\?'more':section/);
 assert.match(shell,/q\('#nav-help'\)\?\.addEventListener\('click',\(\)=>\{beforeMajorOverlay\('modal'\);openOverlay\('modal'\)\}\)/);
 assert.match(shell,/q\('#nav-settings'\)\?\.addEventListener\('click',\(\)=>\{beforeMajorOverlay\('modal'\);q\('#settings'\)\?\.click\(\);openOverlay\('modal'\)\}\)/);
 assert.doesNotMatch(shell,/setActiveSection\('help'\)/);
 assert.doesNotMatch(shell,/setActiveSection\('settings'\)/);
});

test('V170 shell controller is cache-busted',()=>{
 assert.match(html,/src\/app-shell-v79\.js\?v=174/);
});
