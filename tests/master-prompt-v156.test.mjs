import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const building=fs.readFileSync(new URL('../frontend/src/factory-building.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V162 retains the foundation boundary while restoring evidence-backed factory context',()=>{
 assert.match(scope,/release:'V162'/);
 assert.match(scope,/expansionMode:'EVIDENCE_GATED_CONTEXT'/);
 assert.match(scope,/showUtilitySystems:true/);
 assert.match(scope,/exposePlaceholderTechnicalMetadata:false/);
 assert.match(scope,/indexUtilitySystemsInSearch:true/);
});

test('factory navigation presents evidence-bounded utility systems as an active product area',()=>{
 assert.match(html,/id="nav-systems" data-section="system"/);
 assert.match(html,/data-mobile-nav="system" aria-label="Sistem utilitas"/);
 assert.match(shell,/const PHASE1_FOUNDATION=FOUNDATION_SCOPE\.expansionMode==='LAYOUT_PLACEHOLDERS_ONLY'/);
 assert.match(shell,/if\(!PHASE1_FOUNDATION\)\{stopSimulationForNavigation\('system'\);openSystemBrowser\(\)\}/);
 assert.match(shell,/function systemSurfaceMarkup\(\)/);
 assert.match(shell,/SISTEM PABRIK/);
 assert.match(shell,/id='layer-manager'|panel\.id='layer-manager'/);
 assert.match(css,/\.mobile-nav\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important\}/);
});

test('placeholder assets expose spatial context but not inventory technical metadata in Phase-1',()=>{
 const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf('async function switchActiveMachine',app.indexOf('function machineDetailDialog(machine){')));
 assert.match(detail,/const placeholderData=pair\('ID posisi',machine\.machineId\)\+pair\('Area',machine\.area\)/);
 assert.match(detail,/pair\('3D source','NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'\)/);
 assert.match(detail,/pair\('3D detail','NOT_IMPLEMENTED'\)/);
 assert.match(detail,/pair\('Dasar posisi',positionStatusLabel\(policy\.positionStatus\)\)/);
 assert.match(detail,/pair\('Status detail','Belum dibuka pada fase fondasi'\)/);
 assert.match(detail,/primary\?primaryData:placeholderData/);
 assert.match(detail,/Model 3D belum tersedia untuk aset ini/);
});

test('universal search keeps placeholder indexing spatial and removes utility-system discovery',()=>{
 const index=app.slice(app.indexOf('function buildUniversalSearchIndex(){'),app.indexOf('function universalSearchResults(query){'));
 assert.match(index,/const keywords=primary\?/);
 assert.match(index,/:\[machine\.name,machine\.machineId,machine\.area\]/);
 assert.doesNotMatch(index,/group:'SISTEM'/);
 assert.doesNotMatch(index,/title:'HVAC'/);
 assert.doesNotMatch(index,/title:'Udara Bertekanan'/);
});

test('factory Phase-1 inspector excludes routing controls while retaining explicit expansion boundary',()=>{
 const panel=app.slice(app.indexOf('function renderFactoryPanel(){'),app.indexOf('function renderPanel(tab=activeInspectorTab()){'));
 assert.match(panel,/Denah pabrik/);
 assert.match(panel,/Scope berbasis bukti/);
 assert.match(panel,/Model 3D mengikuti aset yang dipilih/);
 assert.doesNotMatch(panel,/data-routing-focus/);
 assert.doesNotMatch(panel,/utility_compressed_air/);
 assert.doesNotMatch(panel,/utility_ahu_piping/);
 assert.doesNotMatch(panel,/utility_ahu_ducting/);
});

test('V199 keeps functional interiors visible while bounding safety and utility references',()=>{
 assert.match(building,/layers\.landscape\.visible=false/);
 assert.match(building,/evidenceLayer:'REFERENCE_REALISM'/);
 assert.match(building,/functionalVisibleSemantic/);
 assert.match(building,/visibleFunctionalReferences/);
 assert.match(building,/REFERENCE_HIDDEN_BY_DEFAULT/);
 assert.match(building,/V204_CLOSED_ENVELOPE_AND_ROOM_SHELLS_WITH_DOOR_JAMBS_SWING_APPROACH_FINISH_TRANSITIONS_AND_VALID_FUNCTION_OPENINGS/);
 assert.match(building,/UTILITY_MODELS_RETAINED_FOR_EXPANSION_BUT_HIDDEN_IN_PHASE1_UI/);
});

test('offline cache prioritizes foundation and OFFSET 5 instead of preloading expansion machines',()=>{
 assert.match(sw,/factory-digital-twin-v218-mobile-ui-recovery-20260925/);
 for(const required of ['src/offset5.js','src/simulation.js','src/data/taxonomy-offset5.js','src/factory-building.js','src/data/dwg-fidelity.js'])assert.match(sw,new RegExp(required.replaceAll('/','\\/')));
 for(const excluded of ['src/offset10.js','src/apm2.js','src/sheeting.js','src/universal-machine.js','src/machine-runtime.js'])assert.doesNotMatch(sw,new RegExp(excluded.replaceAll('/','\\/')));
 assert.match(html,/app-shell-v79\.css\?v=218/);
 assert.match(html,/src\/app\.js\?v=218/);
 assert.match(html,/src\/app-shell-v79\.js\?v=218/);
 assert.match(shell,/v212-ui-ssot/);
});
