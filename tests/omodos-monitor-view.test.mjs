import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../frontend/monitor.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../frontend/src/monitor.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../frontend/monitor.css',import.meta.url),'utf8');

test('monitor page is parent-authorized and denies direct navigation by default',()=>{
  assert.match(html,/id="monitor-gate"/);
  assert.match(html,/id="monitor-app" class="monitor-app" hidden/);
  assert.match(js,/const OMODOS_ORIGIN='https:\/\/omodos\.juldigi\.workers\.dev'/);
  assert.match(js,/event\.origin!==OMODOS_ORIGIN/);
  assert.match(js,/event\.data\?\.authorized!==true/);
  assert.match(js,/event\.data\?\.role!=='Superadmin'/);
  assert.match(js,/function rejectAccess\(\)/);
});

test('monitor excludes roof, walls, furniture, doors and machine-detail actions',()=>{
  assert.match(js,/building:false/);
  assert.match(js,/walls:false/);
  assert.match(js,/roof:false/);
  assert.match(js,/furniture:false/);
  assert.match(js,/machines:true/);
  assert.match(js,/engine\.onFactorySelect=\(\)=>\{\}/);
  assert.doesNotMatch(js,/machineDetailDialog|selectFactoryAssetContext/);
});

test('machine cards derive status from OMODOS messages and never claim sensor real-time status',()=>{
  assert.match(js,/OMODOS_FACTORY_MONITOR_INIT/);
  assert.match(js,/statuses:event\.data\.statuses/);
  assert.match(html,/status terakhir dari Logbook\/Patrol/);
  assert.match(html,/bukan telemetri sensor real-time/);
  assert.match(css,/\.machine-status-card\.critical/);
  assert.match(css,/\.machine-status-card\.attention/);
  assert.match(css,/\.machine-status-card\.normal/);
});
