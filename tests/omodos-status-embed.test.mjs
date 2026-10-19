import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const embed = readFileSync(new URL('../frontend/src/omodos-status-embed.js', import.meta.url), 'utf8');
const building = readFileSync(new URL('../frontend/src/factory-building.js', import.meta.url), 'utf8');

test('OMODOS status viewer is opt-in and only accepts the authenticated OMODOS parent origin', () => {
  assert.match(html, /src="\.\/src\/omodos-status-embed\.js\?v=1"/);
  assert.match(embed, /new URLSearchParams\(location\.search\)\.get\('embed'\) !== EMBED_KEY/);
  assert.match(embed, /ALLOWED_PARENT_ORIGINS = new Set\(\['https:\/\/omodos\.juldigi\.workers\.dev'\]\)/);
  assert.match(embed, /ALLOWED_PARENT_ORIGINS\.has\(event\.origin\)/);
  assert.match(embed, /payload\.type!=='OMODOS_FACTORY_STATUS'/);
});

test('embedded overview hides roof, walls, building envelope, and IPAL structure', () => {
  assert.match(embed, /const policy=\{building:false,ipal:true,floor:true,walls:false,doors:false,windows:false,air_curtain:false,furniture:false,roof:false/);
  assert.match(embed, /engine\.setFactoryLayer\(key,visible\)/);
  assert.match(embed, /const assetRoots=new Set\(\[\.\.\.engine\.actualFactory\.assets\.values\(\)\]\)/);
  assert.match(embed, /if\(!assetRoots\.has\(child\)\)child\.visible=false/);
});

test('IPAL process equipment remains visible while canopy/frame is selectively hidden', () => {
  assert.match(embed, /building:false,ipal:true/);
  for (const semantic of ['IPAL_OPEN_FRAME_COLUMN','IPAL_OPEN_FRAME_BASE','IPAL_CANOPY_RAFTER','IPAL_CANOPY_ROOF','IPAL_X_BRACE_REFERENCE']) {
    assert.ok(embed.includes(semantic), 'missing IPAL structural filter: ' + semantic);
  }
  assert.match(embed, /\.\.\.visibleMeshesUnder\(engine\.actualFactory\.layers\.ipal\)/);
  assert.match(building, /semantic:'IPAL_CANOPY_ROOF'/);
  assert.match(building, /semantic:'IPAL_CANOPY_RAFTER'/);
  assert.match(building, /semantic:'IPAL_OPEN_FRAME_BASE'/);
});

test('embedded overview disables machine-detail selection and avoids repeated policy writes', () => {
  assert.match(embed, /engine\.onFactorySelect=\(\)=>\{\}/);
  assert.match(embed, /if\(rootChanged\|\|!state\.policyApplied\)/);
  assert.doesNotMatch(embed, /if\(rootChanged\|\|now-state\.lastPolicyAt>900\)/);
  assert.match(embed, /if\(firstAuthorization\)state\.policyApplied=false/);
});


test('ambiguous SAP codes require a unique exact machine-name match', () => {
  assert.match(embed, /const sameCodePeers\s*=\s*code\?state\.registry\.filter/);
  assert.match(embed, /const payloadCodeRows\s*=\s*code\?state\.records\.filter/);
  assert.match(embed, /const codeIsUnique\s*=\s*sameCodePeers\.length===1&&payloadCodeRows\.length===1/);
  assert.match(embed, /exactCodePeers\.length===1&&exactCodePeers\[0\]\.machineId===machine\.machineId/);
  assert.match(embed, /An explicit different code must never be overridden by a fuzzy name match/);
});

test('leading-zero machine names compare consistently', () => {
  assert.match(embed, /function machineNameKey/);
  assert.match(embed, /machineNameKey\(row\.name\)/);
});

test('viewer READY is sent only after assets and status anchors exist', () => {
  assert.match(embed, /engine\.actualFactory\.assets\.size>0&&state\.anchors\.size>0/);
  assert.match(embed, /state\.parentOrigin&&ALLOWED_PARENT_ORIGINS\.has\(state\.parentOrigin\)/);
  assert.doesNotMatch(embed, /event\.source\.postMessage\(\{type:'OMODOS_FACTORY_STATUS_READY',version:1\},event\.origin\)/);
});

test('every visible registry machine gets a status card and ambiguous codes do not map silently', () => {
  assert.match(embed, /for\(const machine of state\.registry\)/);
  assert.match(embed, /const card=ensureCard\(entry\.machine\)/);
  assert.match(embed, /const exactCodePeers=sameCodePeers\.filter/);
  assert.match(embed, /exactCodePeers\.length===1&&exactCodePeers\[0\]\.machineId===machine\.machineId/);
  assert.match(embed, /const exactPeers=state\.registry\.filter/);
  assert.match(embed, /exactPeers\.length===1&&exactPeers\[0\]\.machineId===machine\.machineId/);
  assert.match(embed, /critical\|kritikal/);
  assert.match(embed, /s==='belum ada data'.*return 'unknown'/);
});

test('mobile status callouts stay readable without overlapping the factory view', () => {
  assert.match(embed, /const mobileLimit=mobile\?3:Infinity/);
  assert.match(embed, /entries\.sort\(\(a,b\)=>a\.statusPriority-b\.statusPriority\|\|a\.distance-b\.distance/);
  assert.match(embed, /if\(!chosen\)continue;/);
  assert.doesNotMatch(embed, /bestOverlap|if\(overlap<bestOverlap\)/);
  assert.match(embed, /shown\+' kartu tampil/);
  assert.match(embed, /data-status-summary/);
});

test('every displayed status card visibly labels the machine before showing its status', () => {
  assert.match(embed, /card\.innerHTML='<span class="machine-label"><\/span><span class="machine-state">/);
  assert.match(embed, /card\.querySelector\('\.machine-label'\)\.textContent=shortName\(machine\)/);
  assert.match(embed, /#omodos-status-overlay \.omodos-machine-status-card \.machine-label\{display:block!important/);
  assert.match(embed, /if\(labelEl\)labelEl\.textContent=shortName\(entry\.machine\)/);
  assert.match(embed, /\.omodos-machine-status-card \.machine-state\{display:block!important/);
});

test('compact labels remain distinct for repeated machine families', () => {
  assert.match(embed, /return brand\+'\s+'\+Number\(compressor\[2\]\)/);
  assert.match(embed, /return 'CTP Heidelberg 1'/);
  assert.match(embed, /return 'CTP Heidelberg 2'/);
  assert.match(embed, /return 'Folder Gluer '\+Number\(folder\[1\]\)/);
  assert.match(embed, /if\(\/polar\\s\*115\/i\.test\(raw\)\)return 'Polar 115'/);
  assert.match(embed, /card\.title=String\(machine\.name\|\|shortName\(machine\)\)/);
});

test('mobile overview caps simultaneous status callouts at three and gives machine names priority', () => {
  assert.match(embed, /const cardWidth=mobile\?116:122,cardHeight=mobile\?52:50/);
  assert.match(embed, /font-size:10px!important;font-weight:850!important;line-height:1\.25!important;color:#203c4f!important/);
  assert.match(embed, /card\.querySelector\('\.machine-label'\)\.textContent=shortName\(machine\)/);
  assert.match(embed, /\.machine-state\{display:block!important;visibility:visible!important;opacity:1!important/);
  assert.match(embed, /shown\+' kartu tampil/);
});
