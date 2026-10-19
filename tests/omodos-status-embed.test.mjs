import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const embed = readFileSync(new URL('../frontend/src/omodos-status-embed.js', import.meta.url), 'utf8');
const building = readFileSync(new URL('../frontend/src/factory-building.js', import.meta.url), 'utf8');
const engine = readFileSync(new URL('../frontend/src/engine.js', import.meta.url), 'utf8');

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

test('mobile status callouts limit display count and avoid overlapping the factory view', () => {
  assert.match(embed, /const mobileLimit=mobile\?2:8/);
  assert.match(embed, /const mobile=matchMedia\('\(max-width:767px\)'\)\.matches\|\|matchMedia\('\(pointer:coarse\)'\)\.matches/);
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
  assert.ok(embed.includes("if(labelEl)labelEl.textContent=machineLabel;"));
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

test('mobile overview caps simultaneous status callouts at two and limits desktop callouts', () => {
  assert.match(embed, /const cardWidth=mobile\?104:122,cardHeight=mobile\?48:50/);
  assert.match(embed, /font-size:9px!important;font-weight:850!important;line-height:1\.2!important;color:#203c4f!important/);
  assert.match(embed, /card\.querySelector\('\.machine-label'\)\.textContent=shortName\(machine\)/);
  assert.match(embed, /\.machine-state\{display:block!important;visibility:visible!important;opacity:1!important/);
  assert.match(embed, /shown\+' kartu tampil/);
});



test('compact status cards always carry a live leader connector to their machine anchor', () => {
  assert.ok(embed.includes('#omodos-status-leaders{position:absolute;inset:0'));
  assert.ok(embed.includes("const leaderSvg=document.createElementNS('http://www.w3.org/2000/svg','svg')"));
  assert.ok(embed.includes('function ensureLeader(machineId)'));
  assert.ok(embed.includes('function updateLeader_(entry,rect)'));
  assert.ok(embed.includes("nodes.line.setAttribute('x1',entry.x.toFixed(1))"));
  assert.ok(embed.includes("nodes.line.setAttribute('y1',entry.y.toFixed(1))"));
  assert.ok(embed.includes("nodes.line.setAttribute('x2',end.x.toFixed(1))"));
  assert.ok(embed.includes("nodes.line.setAttribute('y2',end.y.toFixed(1))"));
  assert.ok(embed.includes('updateLeader_(entry,chosen.rect)'));
  assert.ok(embed.includes('hideLeaders_();'));
});

test('mobile status callouts use a compact name, status and date hierarchy', () => {
  assert.ok(embed.includes('.omodos-machine-status-card{width:118px;min-height:48px;padding:4px 6px 5px'));
  assert.ok(embed.includes("card.querySelector('.machine-label').textContent=shortName(machine)"));
  assert.ok(embed.includes("card.querySelector('.machine-state').textContent=compactStatus(status)"));
  assert.ok(embed.includes("card.querySelector('.machine-date').textContent=row?.date?formatDate(row.date):''"));
  assert.ok(embed.includes('const mobileLimit=mobile?2:8'));
});


test('status cards are visible, keyboard/touch activatable, and report the machine identity to OMODOS', () => {
  assert.match(embed, /pointer-events:auto;cursor:pointer;touch-action:manipulation/);
  assert.match(embed, /card\.setAttribute\('role','button'\);card\.tabIndex=0/);
  assert.match(embed, /card\.addEventListener\('click',activate\)/);
  assert.match(embed, /event\.key==='Enter'\|\|event\.key===' '/);
  assert.match(embed, /type:'OMODOS_FACTORY_STATUS_CARD_CLICK',version:1,code,name/);
  assert.match(embed, /if\(!chosen&&mobile\)/);
  assert.ok(embed.includes('const margin=5,gap=7,columns=Math.max(1,Math.floor((width-2*margin+gap)/(cardWidth+gap)));'));
  assert.match(embed, /card\.dataset\.machineLabel=machineLabel/);
});


test('OMODOS preview uses the low-power exterior profile and skips detailed machine hydration', () => {
  assert.match(engine, /this\.omodosStatusEmbed=new URLSearchParams\(location\.search\)\.get\('embed'\)==='omodos-status'/);
  assert.match(engine, /powerPreference:this\.omodosStatusEmbed\?'low-power':'high-performance'/);
  assert.match(engine, /this\.actualFactory=!this\.omodosStatusEmbed&&this\.capabilities\?\.memory<=2\?buildLowDetailFactory/);
  assert.match(engine, /if\(!this\.omodosStatusEmbed\)void this\.hydrateFactoryDetailedMachines\?\.\(l,l\.fleet\)/);
  assert.match(engine, /if\(this\.omodosStatusEmbed\)requested='hemat'/);
  assert.match(engine, /const frameInterval=this\.omodosStatusEmbed\?48/);
});

test('OMODOS preview disposes hidden building layers and builds static anchors only once per scene', () => {
  assert.match(embed, /function compactPreviewScene_\(/);
  assert.match(embed, /function disposePreviewSubtree_\(/);
  assert.match(embed, /state\.previewPrunedRoot!==signature/);
  assert.match(embed, /if\(!state\.lastAnchorAt\|\|rootChanged\)rebuildAnchors\(THREE,engine\)/);
  assert.match(embed, /const mobileLimit=mobile\?2:8/);
  assert.match(embed, /overlayMobile\?125:90/);
  assert.match(embed, /state\.summary=\{critical:/);
});
