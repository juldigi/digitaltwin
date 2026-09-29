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
 assert.match(app,/Pengeditan pabrik 3D sudah terbuka/);
});

test('scene save and revision restore clear transient isolation before replaying persisted state',()=>{
 const save=app.indexOf("panel.querySelector('#se-save')");
 const restore=app.indexOf("request('/api/scene/restore'");
 assert.ok(save>=0&&restore>=0);
 const saveFlow=app.slice(save,restore);assert.match(saveFlow,/isolationGuard\.restore\(\);await acceptState\(next\)/);assert.match(saveFlow,/markSavedCheckpoint\(overrides\);baseline=captureEditorBaseline\(\);applyIsolation\(\)/);
 assert.match(app.slice(restore,restore+1200),/isolationGuard\.restore\(\);await acceptState\(next\)/);
});

test('removed generated selections detach the gizmo instead of leaving an orphan transform target',()=>{
 assert.match(app,/selected&&!engine\.sceneObjects\.has\(selected\)&&\(selected\.startsWith\('copy:'\)\|\|selected\.startsWith\('new:'\)\)\)selected=null/);
});


test('scene editor layout is responsive and leaves canonical navigation reachable',()=>{
 assert.doesNotMatch(app,/z-index:10000/);
 assert.doesNotMatch(app,/panel\.style\.cssText/);
 assert.match(css,/#scene-editor-panel\{[\s\S]*?z-index:78/);
 assert.match(css,/@media\(max-width:767px\)\{[\s\S]*?#scene-editor-panel\{[\s\S]*?bottom:calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/@media\(max-height:560px\) and \(orientation:landscape\)\{[\s\S]*?#scene-editor-panel/);
 assert.match(css,/#scene-editor-panel \.se-nudge\{display:grid/);
});


test('V263 scene editor presents a simplified pick-adjust-save workflow',()=>{
 for(const label of ['Apa yang ingin diubah?','Atur objek','Simpan perubahan','Mesin','Dinding','Peralatan','Bangunan','Utilitas','Furnitur','Bagian Mesin','Jarak tiap klik','Geser sesuai arah layar','Taruh di lantai','Opsi lainnya','Pengaturan presisi','Bandingkan sebelum / sesudah','Alat teknis Superadmin'])assert.ok(app.includes(label),label);
 assert.match(app,/class="se-progress"/);
 assert.match(app,/primaryEditorCategories=editorCategories\.filter/);
 assert.match(app,/data-se-screen="up"/);
 assert.match(app,/moveSceneObjectInView\(selected,horizontal,vertical,editorMoveStep\)/);
 assert.match(app,/class="se-more-actions"/);
 assert.match(app,/class="se-advanced"/);
 assert.match(app,/class="se-admin-tools"/);
 assert.match(css,/V263 simplified editor/);
 assert.match(css,/\.se-direction-pad/);
 assert.match(css,/\.se-easy-toolbar/);
 assert.match(css,/\.se-save-bar/);
});

test('V264 editor compares drafts against the last saved checkpoint',()=>{
 assert.ok(app.includes('let savedOverrides=cloneOverrides(overrides)'));
 assert.ok(app.includes('const changedOverrideIds='));
 assert.ok(app.includes('const hasUnsavedChanges='));
 assert.ok(app.includes('selectedHasUnsavedChanges'));
 assert.ok(app.includes('engine.applySceneOverrides(savedOverrides)'));
 assert.ok(!app.includes("previewOriginal){engine.gizmo.detach();engine.applySceneOverrides({})"));
 assert.ok(app.includes('markSavedCheckpoint(overrides)'));
 assert.ok(app.includes('const captureEditorBaseline=()=>new Map'));
 assert.ok(app.includes('const refreshAssetNodeIndex=()=>'));
 assert.ok(app.includes('refreshAssetNodeIndex();Object.keys(overrides).forEach'));
 assert.ok(app.includes('baseline=captureEditorBaseline();applyIsolation()'));
 assert.ok(app.includes("previewOriginal||!hasUnsaved"));
 assert.ok(app.includes("objek memiliki perubahan baru"));
});

test('V264 lock state disables transform controls without blocking visibility state',()=>{
 assert.ok(app.includes('data-se-screen="up" ${transformBlocked?\'disabled\':\'\'}'));
 assert.ok(app.includes('data-se-mode="scale" ${engine.gizmo.mode===\'scale\'?\'class="active"\':\'\'} ${transformBlocked?\'disabled\':\'\'}'));
 assert.ok(app.includes('id="se-ground" ${transformBlocked?\'disabled\':\'\'}'));
 assert.ok(app.includes('const mutate=(fn,{allowLocked=false,allowHidden=false'));
 assert.ok(app.includes("querySelector('#se-hide')?.addEventListener('click',()=>{if(!selected||previewOriginal||current()?.deleted)return"));
 assert.ok(app.includes('allowLocked:true'));
});

test('V264 editor scopes controls to the selected object and scope',()=>{
 assert.ok(app.includes("canGround=Boolean(selected&&selectedVisible&&editorScope==='factory'&&['machines','furniture','uncategorized'].includes(editorCategory))"));
 assert.ok(app.includes('${canGround?`<button id="se-ground"'));
 assert.ok(app.includes("canScale=Boolean(selected&&selectedVisible&&editorScope==='factory'&&['furniture','uncategorized'].includes(editorCategory))"));
 assert.ok(app.includes("canDuplicate=Boolean(selected&&selectedVisible&&editorScope==='factory'&&editorCategory!=='machines'"));
 assert.ok(app.includes("!selected.startsWith('new:')"));
 assert.ok(app.includes("(canScale?['position','rotation','scale']:['position','rotation'])"));
 assert.ok(app.includes("Posisi relatif induk (meter)"));
 assert.ok(app.includes("Rotasi relatif induk (derajat)"));
 assert.ok(app.includes("editorScope==='factory'?`<fieldset><legend>Sejajarkan dengan aset lain"));
 assert.ok(app.includes('id="se-remove-generated"'));
 assert.ok(app.includes('id="se-restore-default"'));
 assert.ok(app.includes('id="se-reset" ${selectedChanged?\'\':\'disabled\'}'));
 assert.ok(app.includes("selectedGenerated&&!savedOverrides[selected]?'Batalkan objek baru':'Batalkan perubahan objek'"));
 assert.ok(app.includes("selectedGenerated||wallId===selected?'':`<div class=\"se-danger-zone\""));
});

test('V264 editor avoids false transactions and destructive ambiguity',()=>{
 assert.ok(app.includes('let dragChanged=false'));
 assert.ok(app.includes('if(!dragChanged){rollbackSnapshot(dragTransaction);dragTransaction=null;refreshEditorTransformUi();return;}'));
 assert.ok(app.includes('Math.abs((v[key]?.[axis]??0)-stored)<1e-9'));
 assert.ok(app.includes("if(!engine.dropSceneObjectToFloor(selected)){rollbackSnapshot(transaction)"));
 assert.ok(app.includes("if(!engine.alignSceneObject(selected,targetId,button.dataset.seAlign)){rollbackSnapshot(transaction)"));
 assert.ok(app.includes('Hapus objek ini dari tampilan 3D?'));
 assert.ok(app.includes('Pulihkan objek ini ke posisi bawaan model?'));
 assert.ok(app.includes('engine.rotateSceneObjectWorldY(selected,Number(button.dataset.seTurn)*editorRotateStep)'));
 assert.ok(app.includes('engine.moveSceneObjectWorld(selected,0,Number(direction)*editorMoveStep,0)'));
 assert.ok(app.includes("selectedGenerated&&savedOverrides[selected]?`<button id=\"se-remove-generated\""));
 assert.ok(app.includes('Pulihkan revisi ini? Perubahan editor yang belum disimpan akan diganti'));
 assert.ok(app.includes('removedSavedOverride=Object.keys(savedOverrides).some'));
 assert.ok(app.includes("stableJson(imported)===stableJson(overrides)"));
 assert.ok(app.includes('activeMachineKey:engine.machineKey||null'));
 assert.ok(app.includes("const snapshot=()=>{const transaction={redoBefore:[...redo],dropped:undo.length>=50?undo[0]:null}"));
 assert.ok(app.includes('const rollbackSnapshot=transaction=>{undo.pop();'));
 assert.ok(app.includes('if(transaction?.dropped!==null&&transaction?.dropped!==undefined)undo.unshift(transaction.dropped)'));
 assert.ok(app.includes('let dragChanged=false,dragTransaction=null'));
 assert.match(css,/V264 editor context guard/);
 assert.match(css,/body\.scene-editor-open aside#detail-panel/);
});


test('V264 editor owns the application context while it is open',()=>{
 assert.match(app,/closeOverlay as closeAppOverlay/);
 assert.match(app,/setView\('factory'\);closeAppOverlay\(\);setAppInspector\(false,'overview'\);engine\.setSceneEditing\(true\)/);
 assert.match(app,/document\.body\.classList\.add\('scene-editor-open'\)/);
 assert.match(app,/editorBackgroundTargets=\[\.\.\.document\.querySelectorAll\('\.rail,\.global-search,\.header-actions,#panel-toggle,\.scene-bottom,\.viewport-mode-switch,aside#detail-panel,\.canonical-simulation-transport,\.mobile-nav'\)\]/);
 assert.match(app,/for\(const element of editorBackgroundTargets\)element\.inert=true/);
 assert.match(app,/for\(const \[element,wasInert\] of editorBackgroundInert\)element\.inert=wasInert/);
 assert.match(app,/update\(\);panel\.focus\(\{preventScroll:true\}\)/);
 assert.match(app,/document\.body\.classList\.remove\('scene-editor-open'\)/);
 assert.match(css,/body\.scene-editor-open \.rail button/);
 assert.match(css,/body\.scene-editor-open #panel-toggle/);
 assert.match(css,/body\.scene-editor-open \.mobile-nav/);
 assert.match(css,/body\.scene-editor-open \.canonical-simulation-transport/);
});

test('V264 editor preview is fully read-only and uses the last persisted state',()=>{
 assert.match(app,/engine\.applySceneOverrides\(savedOverrides\)/);
 assert.match(app,/panel\.querySelectorAll\('button,input,select'\)\.forEach\(control=>\{if\(!\['se-preview','se-close'\]\.includes\(control\.id\)\)control\.disabled=true;\}\)/);
 assert.match(app,/Sedang melihat kondisi terakhir tersimpan/);
 assert.match(app,/Kondisi terakhir tersimpan · hanya melihat/);
 assert.doesNotMatch(app,/engine\.applySceneOverrides\(\{\}\);applyIsolation\(\)/);
});

test('V264 editor guards hidden deleted locked and isolated objects consistently',()=>{
 assert.match(app,/const isTransformBlocked=\(\)=>\{const value=current\(\);return !selected\|\|previewOriginal\|\|!value\|\|value\.locked\|\|value\.deleted\|\|value\.visible===false;\}/);
 assert.doesNotMatch(app,/\btransformBlocked\(\)/);
 assert.match(app,/engine\.onSceneTransform=\(\)=>\{if\(!isTransformBlocked\(\)\)/);
 assert.match(app,/if\(hiding&&isolated\)\{isolated=false;isolationGuard\.restore\(\);\}/);
 assert.match(app,/if\(!selected\|\|!selectedVisible\|\|previewOriginal\)return;isolated=!isolated/);
 assert.match(app,/const node=selected&&engine\.sceneObjects\.get\(selected\);if\(isolated&&node\)isolationGuard\.isolate/);
 assert.match(app,/\$\{v\?\.deleted\?'':`<button id="se-hide"/);
});

test('V264 editor movement labels and handlers match screen/world semantics',()=>{
 assert.ok(app.includes('Atas layar'));
 assert.ok(app.includes('Bawah layar'));
 assert.ok(app.includes("engine.moveSceneObjectWorld(selected,0,Number(direction)*editorMoveStep,0)"));
 assert.ok(app.includes("engine.moveSceneObjectInView(selected,horizontal,vertical,editorMoveStep)"));
 assert.ok(app.includes("engine.rotateSceneObjectWorldY(selected,Number(button.dataset.seTurn)*editorRotateStep)"));
 assert.ok(app.includes("Hanya objek ini"));
});

test('V264 editor parent and alignment controls cannot target invalid hierarchy states',()=>{
 assert.match(app,/editorScope==='machine'&&selected\?'<button id="se-parent"/);
 assert.ok(app.includes("normalized==='machine:'+engine.machineKey+':root'"));
 assert.ok(app.includes("!selectableEditorObject(normalized,target)"));
 assert.ok(app.includes(".filter(([id])=>'asset:'+id!==selected).map"));
});


test('V264 editor has no orphan interactive controls',()=>{
 const ids=['se-close','se-object','se-focus','se-isolate','se-edit-machine-parts','se-back-machine','se-parent','se-wall','se-hide','se-delete','se-delete-wall','se-lock','se-ground','se-duplicate','se-reset','se-remove-generated','se-restore-default','se-preview','se-undo','se-redo','se-save','se-export','se-load-file','se-history'];
 for(const id of ids){
  assert.ok(app.includes('id="'+id+'"'),id+' markup missing');
  assert.ok(app.includes("querySelector('#"+id+"')"),id+' handler missing');
 }
 for(const attr of ['data-se-category','data-se-mode','data-se-screen','data-se-nudge','data-se-turn','data-se-align','data-se-add','data-se-key','data-wall-point','data-se-revision']){
  assert.ok(app.includes(attr+'='),attr+' markup missing');
  assert.ok(app.includes("querySelectorAll('["+attr+"]')"),attr+' handler missing');
 }
});

test('V264 mobile editor keeps primary touch targets at least 44px',()=>{
 assert.match(css,/@media\(max-width:767px\)\{[\s\S]*?#scene-editor-panel \.se-header button,[\s\S]*?#scene-editor-panel \.se-primary-tools button,[\s\S]*?#scene-editor-panel \.se-turn-row button,[\s\S]*?#scene-editor-panel \.se-save-bar button,[\s\S]*?\{min-height:44px\}/);
 assert.match(css,/#scene-editor-panel \.se-direction-pad button,[\s\S]*?min-height:52px/);
 assert.match(css,/#scene-editor-panel \.se-category-grid button\{min-height:46px/);
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
 assert.match(app,/Posisi relatif induk \(meter\)/);
 assert.match(app,/Rotasi relatif induk \(derajat\)/);
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


test('factory editor list is registry-driven and all selected objects are precision keyboard movable',()=>{
 assert.match(app,/registryMachineChoices=MACHINE_REGISTRY\.slice\(\)/);
 assert.match(app,/name:machine\.name/);
 assert.match(app,/if\(category==='machines'\)\{const machineId=id\.replace\(\/\^asset:\/,'\'\)\|\|node\?\.userData\?\.machineId,record=MACHINE_REGISTRY_BY_ID\.get\(machineId\);return record\?/);
 assert.match(app,/Seluruh mesin bergerak sebagai satu unit/);
 assert.match(app,/document\.addEventListener\('keydown',onEditorKeyDown\)/);
 assert.match(app,/editorArrowKeys=\['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'\]/);
 assert.match(app,/editorMoveStep=\.01/);
 assert.match(app,/if\(isTransformBlocked\(\)\|\|!editorArrowKeys\.includes\(e\.key\)\)return/);
 assert.match(app,/const step=e\.shiftKey\?editorMoveStep\*10:editorMoveStep/);
 assert.match(app,/id="se-step-size"/);
 assert.match(app,/id="se-delete-wall"/);
 assert.match(app,/historyKey=\(e\.metaKey\|\|e\.ctrlKey\)/);
 assert.match(app,/e\.target\?\.closest\?\.\('button,summary,a,\[role="button"\]'\)\)return/);
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
 assert.match(app,/configureActiveMachine\(machineRoute\(machine\)\);applyActiveMachineState\(\);setActiveTaxonomyId\(ACTIVE_ROOT\);applyMachineShell\(\);await engine\.switchMachine\(MACHINE_KEY\)/);
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
 assert.match(app,/Mesin belum ditempatkan di pabrik 3D/);
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
 assert.match(app,/configureActiveMachine\(machineRoute\(machine\)\);applyActiveMachineState\(\);setActiveTaxonomyId\(ACTIVE_ROOT\);applyMachineShell\(\);await engine\.switchMachine\(MACHINE_KEY\)/);
 assert.match(app,/clearActiveMachineDescriptor\(\);applyActiveMachineState\(\);engine\.clearMachineContext\?\.\(\)/);
 assert.match(app,/scrollBefore=panel\.scrollTop/);
 assert.match(app,/advancedOpen=panel\.querySelector\('\.se-advanced'\)\?\.open/);
 assert.match(app,/moreOpen=panel\.querySelector\('\.se-more-actions'\)\?\.open/);
 assert.match(app,/adminOpen=panel\.querySelector\('\.se-admin-tools'\)\?\.open/);
 assert.match(app,/id:'uncategorized',label:'Belum dikategorikan'/);
});


test('machine selection uses a clear factory-first flow before explicit 3D inspection',()=>{
 assert.match(app,/async function openAssetContext\(machine\)\{[\s\S]*selectFactoryAssetContext\(machine,\{historyMode:'push',openDialog:true,focus:true\}\)/);
 assert.match(app,/Pilih satu aset untuk menyorot posisinya di pabrik/);
 assert.match(app,/asset-data-badge">Pilih di pabrik/);
 assert.match(app,/if\(item\.type==='machine'\)\{const record=MACHINE_REGISTRY_BY_ID\.get\(item\.machineId\);if\(record\)await openAssetContext\(record\);return;\}/);
 assert.match(app,/id="\$\{modelAvailable\?'open-machine-3d':'focus-layout-asset'\}"/);
});


test('V265 editor locks asynchronous transactions and rolls back failed machine loads',()=>{
 assert.match(app,/editorBusy=false/);
 assert.match(app,/panel\.setAttribute\('role','dialog'\)/);
 assert.match(app,/panel\.setAttribute\('aria-busy','false'\)/);
 assert.doesNotMatch(app,/panel\.setAttribute\('aria-modal','true'\)/);
 assert.match(app,/id="se-status" aria-live="polite"/);
 assert.match(app,/const setEditorBusy=\(on,message=''\)=>/);
 assert.match(app,/document\.body\.classList\.toggle\('scene-editor-busy',editorBusy\)/);
 assert.match(app,/panel\.querySelectorAll\('button,input,select'\)\.forEach\(control=>control\.disabled=true\)/);
 assert.match(app,/const payload=cloneOverrides\(overrides\);setEditorBusy\(true,'Menyimpan perubahan…'\)/);
 assert.match(app,/data:\{overrides:payload\}/);
 assert.match(app,/setEditorBusy\(true,'Membuka model bagian mesin…'\)/);
 assert.match(app,/catch\(error\)\{clearActiveMachineDescriptor\(\);applyActiveMachineState\(\);engine\.clearMachineContext\?\.\(\);engine\.setView\('factory',state\)/);
 assert.match(app,/finally\{setEditorBusy\(false\);\}\}\);/);
 assert.match(app,/engine\.onSceneSelect=\(id,node\)=>\{if\(editorBusy\)\{engine\.gizmo\.detach\(\);return;\}/);
 assert.match(css,/V265 editor transaction lock/);
 assert.match(css,/body\.scene-editor-busy #viewport\{[\s\S]*?pointer-events:none!important/);
});

test('V265 editor keyboard and focus lifecycle cannot leave incomplete transactions',()=>{
 assert.match(app,/String\(e\.key\|\|''\)==='Escape'/);
 assert.match(app,/panel\.querySelector\('#se-close'\)\?\.click\(\)/);
 assert.match(app,/const finishKeyboardMove=\(\)=>/);
 assert.match(app,/const onEditorWindowBlur=\(\)=>finishKeyboardMove\(\)/);
 assert.match(app,/window\.addEventListener\('blur',onEditorWindowBlur\)/);
 assert.match(app,/window\.removeEventListener\('blur',onEditorWindowBlur\)/);
 assert.match(app,/queueMicrotask\(\(\)=>editorReturnFocus\?\.isConnected&&editorReturnFocus\.focus/);
});

test('V265 editor releases busy state for save import and revision outcomes',()=>{
 assert.match(app,/if\(stableJson\(imported\)===stableJson\(overrides\)\)\{setEditorBusy\(false\);return toast\('Cadangan ini sama dengan kondisi editor saat ini\.'\);\}/);
 assert.match(app,/setEditorBusy\(true,'Memeriksa cadangan editor…'\)/);
 assert.match(app,/setEditorBusy\(true,'Memulihkan revisi…'\)/);
 assert.match(app,/setEditorBusy\(false\);toast\('Revisi berhasil dipulihkan\.'\)/);
 assert.match(app,/catch\(error\)\{setEditorBusy\(false\);toast\(error\.message,true\);\}/);
 assert.match(app,/document\.body\.classList\.remove\('scene-editor-open','scene-editor-busy'\)/);
});
