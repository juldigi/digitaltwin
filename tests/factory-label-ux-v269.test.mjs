import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const engine=read('../frontend/src/engine.js');
const factory=read('../frontend/src/factory-building.js');
const state=read('../frontend/src/state/app-state.js');
const sw=read('../frontend/sw.js');

test('V269 factory labels use depth-aware sprite material instead of drawing through objects',()=>{
 assert.match(factory,/SpriteMaterial\(\{map:texture,transparent:true,depthTest:true,depthWrite:false\}\)/);
 assert.doesNotMatch(factory,/SpriteMaterial\(\{map:texture,depthTest:false\}\)/);
 assert.match(factory,/factoryLabel:true/);
 assert.match(factory,/baseLabelWidth:width,baseLabelHeight:height/);
});

test('V269 machine labels carry selection identity so focus can suppress unrelated labels',()=>{
 assert.match(factory,/role:'MACHINE',machineId:p\.machineId/);
 assert.match(engine,/selectedId&&data\.machineId===selectedId/);
 assert.match(engine,/if\(selectedId&&!selected\)\{sprite\.visible=false;continue;\}/);
});

test('V269 keeps label size stable while zooming and culls overlapping labels',()=>{
 assert.match(engine,/captureFactoryLabels\(\)/);
 assert.match(engine,/updateFactoryLabels\(\)/);
 assert.match(engine,/THREE\.MathUtils\.clamp\(distance\/45,\.12,1\.25\)/);
 assert.match(engine,/if\(selectedId&&this\.transition\)\{for\(const sprite of sprites\)sprite\.visible=false;return;\}/);
 assert.match(engine,/const overlaps=!selected&&placed\.some/);
 assert.match(engine,/if\(this\.view==='factory'\)this\.updateFactoryLabels\(\)/);
});

test('V269 component labels also stay out of the way while camera focus is moving',()=>{
 assert.match(engine,/layer\.hidden=!this\.labels\|\|!this\.machine\.visible\|\|this\.view!=='machine'\|\|Boolean\(this\.transition\)/);
});

test('V269 label toggle controls every tagged factory label including non-label subgroups',()=>{
 assert.match(engine,/if\(name==='labels'\)this\.labels=!!on/);
 assert.match(engine,/const selectedId=this\.factorySelectionId\|\|null,enabled=this\.labels!==false/);
});

test('V269 rotates internal build/cache identity without changing public release query',()=>{
 assert.match(state,/APP_BUILD='2026\.09\.30-269'/);
 assert.match(sw,/factory-digital-twin-v269-adaptive-map-labels-20260930/);
 assert.match(sw,/const RELEASE='222'/);
});
