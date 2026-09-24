import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const state=await readFile(new URL('../frontend/src/scene-editor-state.js',import.meta.url),'utf8');
const css=await readFile(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');

test('scene editor uses a reversible isolation guard instead of destructive visibility writes',()=>{
 assert.match(app,/createSceneIsolationGuard/);
 assert.match(app,/isolationGuard\.restore\(\)/);
 assert.match(app,/const isolationBoundary=\(\)=>editorScope==='machine'\?engine\.machine:engine\.factory/);
 assert.doesNotMatch(app,/while\(node\?\.parent&&node!==engine\.factory\)\{for\(const sibling/);
 assert.match(state,/export function createSceneIsolationGuard/);
});

test('scene editor cannot open duplicate floating panels',()=>{
 assert.match(app,/document\.querySelector\('#scene-editor-panel'\)/);
 assert.match(app,/Editor Scene 3D sudah terbuka/);
});

test('scene save and revision restore clear transient isolation before replaying persisted state',()=>{
 const save=app.indexOf("panel.querySelector('#se-save')");
 const restore=app.indexOf("request('/api/scene/restore'");
 assert.ok(save>=0&&restore>=0);
 assert.match(app.slice(save,restore),/isolationGuard\.restore\(\);await acceptState\(next\);applyIsolation\(\)/);
 assert.match(app.slice(restore,restore+1200),/isolationGuard\.restore\(\);await acceptState\(next\)/);
});

test('removed generated selections detach the gizmo instead of leaving an orphan transform target',()=>{
 assert.match(app,/!engine\.sceneObjects\.has\(selected\)\)\{engine\.gizmo\.detach\(\);if\(selected\.startsWith\('copy:'\)\|\|selected\.startsWith\('new:'\)\)selected=null/);
});


test('scene editor layout is responsive and leaves canonical navigation reachable',()=>{
 assert.doesNotMatch(app,/z-index:10000/);
 assert.doesNotMatch(app,/panel\.style\.cssText/);
 assert.match(css,/#scene-editor-panel\{[\s\S]*?z-index:78/);
 assert.match(css,/@media\(max-width:767px\)\{[\s\S]*?#scene-editor-panel\{[\s\S]*?bottom:calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/@media\(max-height:560px\) and \(orientation:landscape\)\{[\s\S]*?#scene-editor-panel/);
 assert.match(css,/#scene-editor-panel \.se-nudge\{display:grid/);
});


test('scene editor presents a guided three-step human-first workflow',()=>{
 for(const label of ['Pilih yang ingin diubah','Atur objek','Simpan perubahan','Mesin','Dinding','Aksesori & Peralatan','Bangunan & Ruangan','Utilitas','Furniture','Bagian Mesin','Geser ','Bandingkan dengan tampilan asli','Alat lanjutan Superadmin'])assert.match(app,new RegExp(label));
 assert.match(app,/class="se-progress"/);
 assert.match(app,/class="se-advanced"/);
 assert.match(app,/class="se-admin-tools"/);
 assert.match(css,/\.se-step-title/);
 assert.match(css,/\.se-selected-card/);
 assert.match(css,/\.se-save-bar/);
});

test('scene editor exposes real-world categories and keeps internal identifiers out of normal UI',()=>{
 assert.match(app,/editorCategories=\[/);
 for(const category of ['machines','walls','equipment','building','utilities','furniture'])assert.match(app,new RegExp("id:'"+category+"'"));
 assert.match(app,/const componentCategory=\{id:'components'/);
 assert.match(app,/data-se-category=/);
 assert.match(app,/selectableEditorObject/);
 assert.match(app,/normalizeEditorSelection/);
 assert.match(app,/assetIdByNode/);
 assert.doesNotMatch(app,/ID teknis:/);
 assert.doesNotMatch(app,/BMJ · baseline/);
 assert.doesNotMatch(app,/\$\{esc\(name\)\} · \$\{esc\(id\)\}<\/option>/);
 assert.match(app,/Buat cadangan editor/);
 assert.match(app,/Pulihkan dari cadangan/);
});

test('scene editor uses human-readable units and converts degree input back to radians',()=>{
 assert.match(app,/Posisi \(meter\)/);
 assert.match(app,/Rotasi \(derajat\)/);
 assert.match(app,/data-se-unit="\$\{key==='rotation'\?'deg':'raw'\}"/);
 assert.match(app,/stored=input\.dataset\.seUnit==='deg'\?value\*Math\.PI\/180:value/);
 assert.match(app,/Gerak bertahap/);
});

test('progressive editor controls are safe before any object is selected',()=>{
 assert.match(app,/querySelector\('#se-snap'\)\?\.addEventListener/);
 assert.match(app,/querySelector\('#se-focus'\)\?\.addEventListener/);
 assert.match(app,/querySelector\('#se-isolate'\)\?\.addEventListener/);
});


test('scene editor category cards are styled as primary object selection',()=>{
 assert.match(css,/\.se-category-grid\{display:grid/);
 assert.match(css,/\.se-category-grid button/);
 assert.match(css,/\.se-category-hint/);
});

test('factory editor normalizes clicks to stable walls and machine assets',()=>{
 assert.match(app,/const wallId=engine\.sceneWallId\(id\);if\(wallId\)return wallId/);
 assert.match(app,/const assetId=assetIdByNode\.get\(node\);if\(assetId\)return assetId/);
 assert.match(app,/editorCategory=editorCategoryFor\(normalized,target\)/);
});


test('machine editor list is registry-driven and whole-unit keyboard movable',()=>{
 assert.match(app,/registryMachineChoices=MACHINE_REGISTRY\.slice\(\)/);
 assert.match(app,/name:machine\.name/);
 assert.match(app,/if\(category==='machines'\)\{const machineId=id\.replace\(\/\^asset:\/,'\'\)\|\|node\?\.userData\?\.machineId,record=MACHINE_REGISTRY_BY_ID\.get\(machineId\);return record\?/);
 assert.match(app,/Seluruh mesin aktif sebagai satu unit/);
 assert.match(app,/document\.addEventListener\('keydown',onEditorKeyDown\)/);
 assert.match(app,/editorArrowKeys=\['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'\]/);
 assert.match(app,/const step=e\.shiftKey\?\.5:\.1/);
 assert.match(app,/moveSceneObjectInView\(selected,horizontal,vertical,step\)/);
 assert.match(app,/document\.removeEventListener\('keydown',onEditorKeyDown\)/);
 assert.match(css,/\.se-machine-edit-note/);
});

test('clicking any visual child of a factory machine normalizes to the machine root asset',()=>{
 assert.match(app,/for\(const \[assetId,root\] of engine\.actualFactory\?\.assets\|\|\[\]\)root\.traverse\(node=>assetIdByNode\.set\(node,'asset:'\+assetId\)\)/);
 assert.match(app,/const assetId=assetIdByNode\.get\(node\);if\(assetId\)return assetId/);
});


test('V197 editor keeps a machine parent context before drilling into components',()=>{
 assert.match(app,/editorMachineId=null/);
 assert.match(app,/if\(normalized\?\.startsWith\('asset:'\)\)editorMachineId=normalized\.slice\(6\)/);
 assert.match(app,/id="se-edit-machine-parts"/);
 assert.match(app,/configureActiveMachine\(machineRoute\(machine\)\);applyActiveMachineState\(\);selectedTaxonomyId=ACTIVE_ROOT;applyMachineShell\(\);await engine\.switchMachine\(MACHINE_KEY\)/);
 assert.match(app,/editorScope='machine';editorCategory='components'/);
 assert.match(app,/id="se-back-machine"/);
 assert.match(app,/editorScope='factory';editorCategory='machines'/);
 assert.doesNotMatch(app,/\{id:'components',label:'Komponen Mesin'/);
 assert.match(css,/\.se-machine-context/);
});

test('V197 editor shows the full registry and labels unplaced machines',()=>{
 assert.match(app,/registryMachineChoices=MACHINE_REGISTRY\.slice\(\)/);
 assert.match(app,/placed:Boolean\(engine\.actualFactory\?\.assets\?\.has\(machine\.machineId\)\)/);
 assert.match(app,/belum ditempatkan/);
 assert.match(app,/Mesin ada di database, belum ditempatkan di scene/);
});

test('V197 machine keyboard movement is camera-relative and installs one stable listener pair',async()=>{
 const engine=await readFile(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
 assert.match(engine,/moveSceneObjectInView\(id,horizontal=0,vertical=0,step=\.1\)/);
 assert.match(engine,/this\.camera\.getWorldDirection\(forward\)/);
 assert.match(app,/keyboardMoveActive/);
 assert.match(app,/document\.addEventListener\('keydown',onEditorKeyDown\)/);
 assert.match(app,/document\.addEventListener\('keyup',onEditorKeyUp\)/);
 assert.equal((app.match(/document\.addEventListener\('keydown',onEditorKeyDown\)/g)||[]).length,1);
 assert.equal((app.match(/document\.addEventListener\('keyup',onEditorKeyUp\)/g)||[]).length,1);
 assert.match(app,/if\(!keyboardMoveActive\)\{snapshot\(\);keyboardMoveActive=true;\}/);
});


test('Stage 5 synchronizes editor machine descriptor and preserves rerender context',()=>{
 assert.match(app,/configureActiveMachine\(machineRoute\(machine\)\);applyActiveMachineState\(\);selectedTaxonomyId=ACTIVE_ROOT;applyMachineShell\(\);await engine\.switchMachine\(MACHINE_KEY\)/);
 assert.match(app,/clearActiveMachineDescriptor\(\);applyActiveMachineState\(\);engine\.clearMachineContext\?\.\(\)/);
 assert.match(app,/scrollBefore=panel\.scrollTop/);
 assert.match(app,/advancedOpen=panel\.querySelector\('\.se-advanced'\)\?\.open/);
 assert.match(app,/adminOpen=panel\.querySelector\('\.se-admin-tools'\)\?\.open/);
 assert.match(app,/id:'uncategorized',label:'Belum dikategorikan'/);
});
