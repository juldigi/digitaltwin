import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const building=fs.readFileSync(new URL('../frontend/src/factory-building.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('OFFSET 5 full technical model is integrated at its factory placement without scale fitting',()=>{
 assert.match(engine,/primaryFactoryPlacement\(layout=this\.layout\)/);
 assert.match(engine,/FOUNDATION_SCOPE\.primaryMachineId/);
 assert.match(engine,/this\.machine\.position\.set\(p\.x,Number\.isFinite\(p\.z\)\?p\.z:0,-p\.y\)/);
 assert.match(engine,/this\.machine\.rotation\.y=\(Number\(p\.rotation\)\|\|0\)\*Math\.PI\/180/);
 assert.match(engine,/this\.machine\.scale\.setScalar\(Number\.isFinite\(p\.scale\)&&p\.scale>0\?p\.scale:1\)/);
 assert.match(engine,/factoryScaleFitApplied:false/);
 assert.match(engine,/factoryIntegrated:true/);
});

test('the old OFFSET 5 factory silhouette is hidden only while the detailed primary model is integrated',()=>{
 assert.match(engine,/syncPrimaryFactoryRepresentation\(\)/);
 assert.match(engine,/placeholder\.visible=!integrated&&this\.factoryMachineLayerVisible/);
 assert.match(engine,/this\.machine\.visible=integrated/);
 assert.match(engine,/name==='machines'/);
 assert.match(building,/if\(!isFoundationPrimary\(p\.machineId\)\)label\(p\.label/);
});

test('factory raycasting selects the integrated machine first and supports progressive component picking',()=>{
 assert.match(engine,/targets\.unshift\(this\.machine\)/);
 assert.match(engine,/id=FOUNDATION_SCOPE\.primaryMachineId/);
 assert.match(engine,/this\.onFactoryPartSelect\?\.\(part\)===true/);
 assert.match(app,/engine\.onFactoryPartSelect=part=>/);
 assert.match(app,/if\(!factoryAssetContextId\)return false/);
 assert.match(app,/choosePart\(part\);showPanel\(\);renderPanel\('structure'\)/);
});

test('primary asset selection stays in factory and follows smooth focus plus contextual detail lifecycle',()=>{
 assert.match(app,/function openPrimaryFactoryContext\(machine,\{historyMode='push'\}=\{\}\)/);
 assert.match(app,/factoryAssetContextId=machine\.machineId;setView\('factory'\)/);
 assert.match(app,/engine\?\.focusFactoryAsset\(machine\.machineId\)/);
 assert.match(app,/showPanel\(\);renderPanel\('overview'\)/);
 assert.match(app,/if\(isFoundationPrimary\(m\)\)openPrimaryFactoryContext\(m,\{historyMode:'push'\}\)/);
 assert.match(engine,/focusFactoryAsset\(id\).*this\.fit\(this\.machine\)/s);
 assert.match(engine,/this\.transition=\{start:performance\.now\(\)/);
});

test('OFFSET 5 detail exposes master-prompt truth fields directly',()=>{
 for(const label of ['Nama aset','Status operasi','3D source','3D detail','Data confidence','Posisi','Source count'])assert.match(app,new RegExp("pair\\('"+label+"'"));
 assert.match(app,/primaryTruth=assetTruth\(a,\{placement:placementForMachine\('BMJ-MCH-0003'\),sourceCount:TECHNICAL_SOURCES\.length\}\)/);
 assert.match(app,/a\.location\|\|'UNKNOWN'/);
});

test('camera contract includes isometric top fit machine fit factory and reset on desktop and mobile',()=>{
 for(const mode of ['iso','top','fit','factory','reset'])assert.match(html,new RegExp('data-camera="'+mode+'"'));
 assert.match(app,/if\(mode==='factory'\)/);
 assert.match(app,/if\(mode==='fit'\)/);
 assert.match(app,/if\(mode==='reset'\)/);
 assert.match(shell,/data-mobile-tool="iso"/);
 assert.match(shell,/data-mobile-tool="fit-machine"/);
 assert.match(shell,/data-mobile-tool="fit-factory"/);
});

test('splash is released by atomic factory readiness instead of an early load timer',()=>{
 assert.match(app,/dataset\.factoryReady='true'/);
 assert.match(app,/new CustomEvent\('bmj:factoryready'/);
 assert.match(app,/dataset\.factoryError='true'/);
 assert.match(shell,/addEventListener\('bmj:factoryready',finishSplash/);
 assert.match(shell,/addEventListener\('bmj:factoryerror',finishSplash/);
 assert.doesNotMatch(shell,/addEventListener\('load',[\s\S]{0,120}finishSplash/);
 assert.match(shell,/setTimeout\(\(\)=>\{if\(!splash/);
});

test('V156 release cache uses the integrated-factory shell',()=>{
 assert.match(html,/app-shell-v79\.css\?v=156/);
 assert.match(html,/src\/app\.js\?v=156/);
 assert.match(html,/src\/app-shell-v79\.js\?v=156/);
 assert.match(shell,/v156-master-prompt/);
 assert.match(sw,/factory-digital-twin-v156-offset5-factory-20260922/);
});
