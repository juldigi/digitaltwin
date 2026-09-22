import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PHOTO_RECONSTRUCTION,OffsetMachineTemplate} from '../frontend/src/offset5.js';

const html=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const referenceCss=readFileSync(new URL('../frontend/reference-v76.css',import.meta.url),'utf8');
const referenceUi=readFileSync(new URL('../frontend/src/reference-v76.js',import.meta.url),'utf8');
const mobileStableCss=readFileSync(new URL('../frontend/mobile-stable-v78.css',import.meta.url),'utf8');
const mobileStableUi=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const appShellCss=readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const css=readFileSync(new URL('../frontend/ui-v5.css',import.meta.url),'utf8');
const responsiveCss=readFileSync(new URL('../frontend/responsive-v5.css',import.meta.url),'utf8');
const experienceCss=readFileSync(new URL('../frontend/experience-v37.css',import.meta.url),'utf8');
const experienceJs=readFileSync(new URL('../frontend/src/experience-v37.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const taxonomy=readFileSync(new URL('../frontend/src/data/taxonomy-offset5.js',import.meta.url),'utf8');
const offset5=readFileSync(new URL('../frontend/src/offset5.js',import.meta.url),'utf8');
const simulation=readFileSync(new URL('../frontend/src/simulation.js',import.meta.url),'utf8');
const offset10=readFileSync(new URL('../frontend/src/offset10.js',import.meta.url),'utf8');
const simulation10=readFileSync(new URL('../frontend/src/simulation-offset10.js',import.meta.url),'utf8');
const taxonomy10=readFileSync(new URL('../frontend/src/data/taxonomy-offset10.js',import.meta.url),'utf8');
const dimensions10=readFileSync(new URL('../frontend/src/data/dimensions-offset10.js',import.meta.url),'utf8');
const sources10=readFileSync(new URL('../frontend/src/data/sources-offset10.js',import.meta.url),'utf8');
const apm2=readFileSync(new URL('../frontend/src/apm2.js',import.meta.url),'utf8');
const simulationApm2=readFileSync(new URL('../frontend/src/simulation-apm2.js',import.meta.url),'utf8');
const taxonomyApm2=readFileSync(new URL('../frontend/src/data/taxonomy-apm2.js',import.meta.url),'utf8');
const dimensionsApm2=readFileSync(new URL('../frontend/src/data/dimensions-apm2.js',import.meta.url),'utf8');
const sourcesApm2=readFileSync(new URL('../frontend/src/data/sources-apm2.js',import.meta.url),'utf8');
const sheeting=readFileSync(new URL('../frontend/src/sheeting.js',import.meta.url),'utf8');
const simulationSheeting=readFileSync(new URL('../frontend/src/simulation-sheeting.js',import.meta.url),'utf8');
const taxonomySheeting=readFileSync(new URL('../frontend/src/data/taxonomy-sheeting.js',import.meta.url),'utf8');
const sourcesSheeting=readFileSync(new URL('../frontend/src/data/sources-sheeting.js',import.meta.url),'utf8');
const registry=readFileSync(new URL('../frontend/src/data/machine-registry.js',import.meta.url),'utf8');
const runtime=readFileSync(new URL('../frontend/src/machine-runtime.js',import.meta.url),'utf8');

test('runtime hooks required by the 3D application remain available',()=>{
  for(const id of ['viewport','detail-panel','panel-content','nav-machine','nav-layout','nav-assets','nav-exterior','nav-sources','nav-help','focus-machine','edit-position','settings','connect','modal','toast','dwg-canvas'])assert.match(html,new RegExp(`id="${id}"`));
  for(const camera of ['iso','top','fit','reset'])assert.match(html,new RegExp(`data-camera="${camera}"`));
});

test('geometry baseline remains unchanged while the user interface is rebuilt',()=>{
  assert.equal(PHOTO_RECONSTRUCTION.version,'offset5-photo-pdf-v36');
  assert.equal(PHOTO_RECONSTRUCTION.repeatedHousings,8);
});

test('test-user shell uses clear user-facing navigation',()=>{
  for(const label of ['3D','Denah','Mesin','Struktur','Exterior','Referensi','Panel','Panduan'])assert.match(html,new RegExp(label));assert.match(html,/id="taxonomy-count"/);
  assert.match(html,/Mode uji/);
  assert.match(html,/Siap diuji/);
});

test('v53 uses the requested BMJ Digital Twin identity everywhere visible',()=>{
  assert.match(html,/<title>BMJ Digital Twin<\/title>/);
  assert.match(html,/>BMJ Digital Twin<small>Packaging Offset · Smart Factory<\/small>/);
  assert.match(app,/document\.title='BMJ Digital Twin · '\+name/);
  assert.doesNotMatch(html,/BMJ PACKAGING OFFSET · EKSPLORASI MESIN 3D/);
});

test('v42 has no single-element selector followed by forEach and covers dynamic button handlers',()=>{
  for(const source of [app,ui,experienceJs])assert.doesNotMatch(source,/^\s*\$\([^)]*\)\.forEach/m);
  for(const id of ['assemble','ghost','isolate','tree-root','exterior-open','exterior-close','disconnect','mapping','view-layout','cancel-position','reset-position','asset-result','clear-cache'])assert.ok(app.includes(id),`dynamic button ${id} has no application reference`);
  for(const selector of ['data-taxonomy','data-stage','data-exterior-area'])assert.ok(app.includes(`document.querySelectorAll('[${selector}]')`),`multi-element handler missing for ${selector}`);
});

test('all static buttons are actionable and none is permanently disabled',()=>{
  const buttons=[...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>({
    attrs:m[1],
    id:(m[1].match(/\bid="([^"]+)"/)||[])[1]||null,
    camera:(m[1].match(/\bdata-camera="([^"]+)"/)||[])[1]||null,
    tab:(m[1].match(/\bdata-tab="([^"]+)"/)||[])[1]||null,
    workbench:(m[1].match(/\bdata-workbench="([^"]+)"/)||[])[1]||null,
    partBack:/\bdata-part-label-back\b/.test(m[1]),
    mobile:(m[1].match(/\bdata-mobile-nav="([^"]+)"/)||[])[1]||null
  }));
  assert.equal(buttons.filter(b=>/\bdisabled\b/.test(b.attrs)).length,0,'a visible static button is disabled');
  for(const b of buttons){
    if(b.id)assert.ok(app.includes(b.id)||ui.includes(b.id),`button #${b.id} has no handler reference`);
    else if(b.camera)assert.match(app,/data-camera|dataset\.camera/);
    else if(b.tab)assert.match(app,/data-tab|dataset\.tab/);
    else if(b.workbench)assert.match(ui,/data-workbench|dataset\.workbench/);
    else if(b.partBack)assert.match(engine,/data-part-label-back/);
    else if(b.mobile)assert.ok(mobileStableUi.includes('data-mobile-nav'),`mobile nav ${b.mobile} has no handler`);
    else assert.fail('button without id or delegated data attribute');
  }
});

test('every floating information window can be closed and restored',()=>{
  for(const id of ['filter-close','keyplan-close','notice-close','close-panel','ui-close-workbench','modal-close','panel-launcher-close'])assert.match(html,new RegExp(`id="${id}"`));
  for(const id of ['show-filter','show-keyplan','show-notice','show-detail','show-workbench','panel-launcher'])assert.match(html,new RegExp(`id="${id}"`));
  for(const id of ['filter-close','keyplan-close','notice-close','close-panel','ui-close-workbench','panel-launcher-close','show-filter','show-keyplan','show-notice','show-detail','show-workbench'])assert.match(ui,new RegExp(id));
  assert.match(appShellCss,/\.panel-launcher-menu/);
});

test('mobile portrait and landscape keep panels inside the viewport',()=>{
  assert.match(html,/interactive-widget=resizes-content/);
  assert.match(html,/id="ui-backdrop"/);
  assert.match(appShellCss,/env\(safe-area-inset-top/);
  assert.match(appShellCss,/orientation:landscape/);
  assert.match(appShellCss,/@media\(max-width:767px\)/);
  assert.match(appShellCss,/@media\(min-width:768px\) and \(max-width:1024px\)/);
  assert.match(appShellCss,/100dvh/);
  assert.match(mobileStableUi,/visualViewport/);
  assert.match(mobileStableUi,/data-mobile-nav/);
  assert.match(mobileStableUi,/closeNav/);
});

test('visible shell avoids deployment and prototype terminology',()=>{
  const visible=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  for(const term of ['deployment','deploy','prototype','mockup','Cloudflare Workers','backend','HEADER CONFLICT','METADATA ONLY','SOURCE STATUS','WebGL'])assert.doesNotMatch(visible,new RegExp(term,'i'));
  for(const phrase of ['Koneksi backend','Cloudflare Workers','Layout pabrik · sumber DWG/DXF','Source Registry','geometry baseline','RECONSTRUCTED / APPROXIMATE'])assert.ok(!app.toLowerCase().includes(phrase.toLowerCase()),phrase);
});

test('conditional controls explain requirements rather than failing silently',()=>{
  assert.match(app,/Atur posisi memerlukan izin pengaturan/);
  assert.match(app,/Pengaturan denah memerlukan izin pengaturan/);
  assert.match(app,/Pilih bagian mesin terlebih dahulu/);
});

test('service worker refreshes the redesigned shell',()=>{
  assert.match(sw,/factory-digital-twin-v124-actual-plant-20260921/);
  assert.match(sw,/src\/universal-machine\.js/);
  assert.match(app,/template\.ghost\(true,part\)/,'object selection must automatically ghost all non-selected geometry');
  for(const asset of ['app-shell-v79.css','src/app-shell-v79.js','assets/splash-industrial-v79.webp','src/ui-v5.js','src/app.js','src/simulation.js'])assert.match(sw,new RegExp(asset.replaceAll('/','\\/')));
});

test('v41 keeps every right-sidebar taxonomy item clickable after repeated selections',()=>{
  assert.match(app,/document\.querySelectorAll\('\[data-taxonomy\]'\)\.forEach/);
  assert.match(app,/document\.querySelectorAll\('\[data-stage\]'\)\.forEach/);
  assert.doesNotMatch(app,/\$\('\[data-taxonomy\]'\)\.forEach/);
  assert.doesNotMatch(app,/\$\('\[data-stage\]'\)\.forEach/);
  assert.match(app,/selectTaxonomy\(b\.dataset\.taxonomy\)/);
});

test('v42 opens removable exterior covers while retaining frame and interior geometry',()=>{
  assert.match(html,/id="nav-exterior"/);
  assert.match(html,/Buka Exterior/);
  assert.match(html,/data-tab="exterior"/);
  assert.match(html,/id="asset-exterior-shortcut"/);
  assert.match(ui,/showDetail\('exterior'\)/);
  assert.match(app,/function enableExteriorOpen\(\)/);
  assert.match(app,/engine\.setLow\(false\)/);
  assert.match(app,/template\.setExteriorOpen\(true\)/);
  assert.match(app,/Buka Semua Cover/);
  assert.match(app,/Tutup Exterior/);
  assert.match(app,/Interior \+ frame\/support/);
  assert.match(app,/document\.querySelectorAll\('\[data-exterior-area\]'\)\.forEach/);
  assert.match(engine,/fitObjects\(objects=\[\]/);
  assert.match(offset5,/markExteriorCover\(object\)/);
  assert.match(offset5,/setExteriorOpen\(on=true\)/);
  assert.match(offset5,/press-'\+i\+'-frame/);
  assert.match(offset5,/press-'\+i\+'-cover/);
  assert.match(experienceCss,/\.exterior-area-button/);
});

test('v44 cutaway removes all PU housing, OS/DS guards and inter-PU access while keeping internal supports',()=>{
  const machine=new OffsetMachineTemplate();
  const frame=machine.findNode('press-0-frame');
  const cylinderTrain=machine.findNode('press-0-cylinder-train');
  const fountainSupport=machine.findNode('press-0-fountain-support');
  const serviceAccess=machine.findNode('press-0-service-access');
  const osSteps=machine.findNode('press-0-steps');
  const dsSteps=machine.findNode('press-0-drive-steps');
  assert.ok(frame&&cylinderTrain&&fountainSupport&&serviceAccess&&osSteps&&dsSteps);
  const frameMeshes=frame.children.filter(object=>object.isMesh);
  assert.ok(frameMeshes.length>0,'PU frame/housing group should contain geometry');
  assert.ok(frameMeshes.every(mesh=>mesh.userData.exteriorCover),'all remaining solid PU frame meshes must be removable in cutaway');
  machine.setExteriorOpen(true);
  assert.ok(frameMeshes.every(mesh=>mesh.visible===false),'OS/DS/top PU housing must disappear');
  assert.equal(serviceAccess.visible,false,'OS/DS service guard panels must disappear');
  assert.equal(osSteps.visible,false,'operator-side inter-PU stair and landing must disappear');
  assert.equal(dsSteps.visible,false,'drive-side inter-PU stair must disappear');
  assert.equal(cylinderTrain.visible,true,'internal cylinder train must remain visible');
  assert.equal(fountainSupport.visible,true,'internal fountain support must remain visible');
  assert.ok(machine.root.userData.exteriorHiddenCount>0,'cutaway should report hidden housing/access');
  machine.setExteriorOpen(false);
  assert.ok(frameMeshes.every(mesh=>mesh.visible===true),'PU housing must restore after closing exterior');
  assert.equal(serviceAccess.visible,true);
  assert.equal(osSteps.visible,true);
  assert.equal(dsSteps.visible,true);
  machine.dispose();
});

test('v45 exposes a safe Printing Test simulation with continuous sheet flow',()=>{
  assert.match(html,/id="tool-simulation"/);
  assert.match(html,/data-tab="simulation"/);
  assert.match(app,/PRINTING_SIMULATION_STAGES/);
  assert.match(app,/Mulai Printing Test/);
  assert.match(app,/simulationLocksStructure\(\)/);
  assert.match(app,/engine\.startPrintingSimulation\(\)/);
  assert.match(app,/engine\.pausePrintingSimulation\(\)/);
  assert.match(app,/engine\.stopPrintingSimulation\(\)/);
  assert.match(runtime,/if\(k==='offset5'\)return new PrintingSimulation\(machine,template\)/);
  assert.match(engine,/this\.simulation\?\.update\(now\)/);
  assert.match(simulation,/CatmullRomCurve3/);
  assert.match(simulation,/getPointAt\(t\)/);
  assert.match(simulation,/getTangentAt\(t\)/);
  assert.match(simulation,/sheetGapMeters=1\.34/);
  assert.match(simulation,/Printing Unit 8/);
  assert.match(simulation,/Coating Unit/);
  assert.match(simulation,/Inline Inspection/);
  assert.match(simulation,/buildFluidFlows\(\)/);
  assert.match(simulation,/inkFlowVisible/);
  assert.match(simulation,/Distributor A–D oscillation/);
  assert.match(experienceCss,/\.simulation-flow/);
  assert.match(experienceCss,/\.simulation-progress/);
});

test('v47 exposes flexible gripper-safe sheet travel, ink drips and live UV curing',()=>{
  assert.match(app,/sim-uv-state/);
  assert.match(app,/sim-uv-indicator/);
  assert.match(app,/Tetesan memanjang menunjukkan cucuran tinta/);
  assert.match(app,/UV beam aktif hanya ketika sheet melewati dryer/);
  assert.match(simulation,/createSheetGeometry\(/);
  assert.match(simulation,/Flexible printing-test sheet/);
  assert.match(simulation,/ink-drip/);
  assert.match(simulation,/inkFilmCurve/);
  assert.match(simulation,/dampeningCurve/);
  assert.match(simulation,/collectUVSystem\(\)/);
  assert.match(simulation,/setUV\(dryerOccupied,uvPulse\)/);
  assert.match(simulation,/uvLampCount/);
  assert.match(offset5,/dryer-uv-system/);
  assert.match(offset5,/uvLamp=true/);
  assert.match(offset5,/serviceDetail/);
  assert.match(taxonomy,/UV \/ Dryer Modules/);
  assert.match(experienceCss,/\.simulation-uv-card/);
  assert.match(experienceCss,/#sim-uv-state\.active/);
});

test('v48 removes the odd PU8 step, uses structural UV supports and accumulates delivery sheets',()=>{
  assert.match(offset5,/dryer-uv-support-frame/);
  assert.match(offset5,/UV module structural support frame/);
  assert.doesNotMatch(offset5,/this\.tread\(puCoater,\[puCoaterGap/);
  assert.match(offset5,/delivery-paper-stack/);
  assert.match(simulation,/buildPileSheets\(\)/);
  assert.match(simulation,/depositSheet\(sheet,cycle\)/);
  assert.match(simulation,/refreshDeliveryPileAnchor\(\)/);
  assert.match(simulation,/pileSheetsVisible/);
  assert.match(app,/id="sim-pile"/);
  assert.match(app,/gripper melepaskan sheet tepat di atas main pile/);
});

test('v49 exposes the normalized 41-machine plant registry without inventing geometry',()=>{
  assert.match(html,/id="machine-count">41/);
  assert.match(app,/MACHINE_REGISTRY_STATS/);
  assert.match(app,/searchMachines\(/);
  assert.match(app,/data-machine-id/);
  assert.match(app,/equipment terdaftar/);
  assert.match(app,/Seluruh equipment memiliki route model 3D/);
  assert.match(sw,/src\/data\/machine-registry\.js/);
});

test('v52 Offset 10 simulation uses the same full-interior cutaway workflow as Offset 5',()=>{
  assert.match(app,/function startPrintingSimulation\(\)[\s\S]*enableExteriorOpen\(\)/);
  assert.match(offset10,/frame-side-housing/);
  assert.match(offset10,/frame-structure/);
  assert.match(offset10,/interiorCutawayVisible/);
  assert.match(offset10,/this\.cover\(this\.tread\(os/);
  assert.match(offset10,/this\.cover\(this\.tread\(ds/);
});

test('v53 routes a rebuilt document-grounded CX104 twin without Offset 5 UI leakage',()=>{
  assert.match(app,/MACHINE_KEY/);
  assert.match(app,/ACTIVE_ROOT/);
  assert.match(app,/selectedTaxonomyId=selectedTaxonomyId\|\|ACTIVE_ROOT/);
  assert.match(app,/switchActiveMachine\(route\)/);
  assert.match(app,/history\.pushState/);
  assert.doesNotMatch(app,/machine=\$\{route\}&v=50/);
  assert.match(app,/Tidak ada foto aktual Offset 10 yang tersedia/);
  assert.match(app,/final drawing BMJ/);
  assert.match(runtime,/Offset10MachineTemplate/);
  assert.match(runtime,/Offset10PrintingSimulation/);
  assert.match(offset10,/o10-foilstar-superstructure/);
  assert.match(offset10,/o10-foilstar-unwinder/);
  assert.match(offset10,/o10-foilstar-rewinder/);
  assert.match(offset10,/o10-foilstar-dancer/);
  assert.match(offset10,/o10-foilstar-transfer-nip/);
  assert.match(offset10,/sidePanel\(/);
  assert.match(simulation10,/mesh\.userData\?\.foilReel/);
  assert.match(simulation10,/direction:mesh\.userData\.foilReel==='unwind'\?-1:1/);
  assert.match(taxonomy10,/O10\.FOIL','ADHESIVE/);
  assert.match(taxonomy10,/O10\.FOIL','TRANSFER/);
  assert.match(taxonomy10,/O10\.FOIL','REELS/);
  assert.match(taxonomy10,/O10\.FOIL','INDEX/);
  assert.match(dimensions10,/modulePitch:1\.225/);
  assert.match(dimensions10,/baseReferenceLength:27\.749/);
  assert.match(sources10,/O10-CX104-OFFICIAL/);
  assert.match(sources10,/O10-FOILSTAR-OFFICIAL/);
  for(const asset of ['src/offset10.js','src/simulation-offset10.js','src/data/dimensions-offset10.js','src/data/sources-offset10.js','src/data/taxonomy-offset10.js'])assert.match(sw,new RegExp(asset.replaceAll('/','\\/')));
});

test('v54 keeps APM2 as a dedicated 3D machine with process-specific UI and no invented suffix',()=>{
  assert.match(app,/\['offset10','apm2','sheeting'\]\.includes\(requested\)/);
  assert.match(app,/IS_APM2=MACHINE_KEY==='apm2'/);
  assert.match(app,/ACTIVE_ROOT=IS_OFFSET10\?'O10':IS_APM2\?'APM2':IS_SHEETING\?'SH':IS_GENERIC\?GENERIC_ROOT:'O5'/);
  assert.match(app,/machine\.machineId==='BMJ-MCH-0010'\?'apm2'/);
  assert.match(app,/switchActiveMachine\(route\)/);
  assert.match(engine,/switchMachine\(key\)/);
  assert.match(app,/Simulasi Proses APM 2/);
  assert.match(app,/register dan SideLay/);
  assert.match(app,/suffix E\/SE\/CER\/BMA tidak tersedia/);
  assert.match(app,/machine\.machineId==='BMJ-MCH-0010'\?'apm2'/);
  assert.match(runtime,/APM2MachineTemplate/);
  assert.match(runtime,/APM2ProcessSimulation/);
  assert.match(runtime,/if\(k==='apm2'\)return new APM2MachineTemplate\(\)/);
  assert.match(apm2,/MACHINE-APM2/);
  assert.match(apm2,/apm2-register-sidelay/);
  assert.match(apm2,/apm2-gripper-bar-/);
  assert.match(apm2,/apm2-moving-platen/);
  assert.match(apm2,/apm2-stripping-upper/);
  assert.match(simulationApm2,/Pressure \/ stripping dwell/);
  assert.match(simulationApm2,/SideLay/);assert.match(simulationApm2,/transportIsIndexing/);assert.match(simulationApm2,/platenRequiresStoppedTransport/);assert.match(simulationApm2,/strippingRequiresStoppedTransport/);
  assert.match(taxonomyApm2,/BMJ_Q2_2026_SIDELAY_MOTOR/);
  assert.match(dimensionsApm2,/suffix:'UNCONFIRMED'/);
  assert.doesNotMatch(dimensionsApm2,/model:'SP 102 (?:E|SE|CER|BMA)'/);
  assert.match(sourcesApm2,/APM2-BMJ-DATABASE/);
  assert.match(registry,/BMJ-MCH-0010[^\n]*1994,true/);
  for(const asset of ['src/apm2.js','src/simulation-apm2.js','src/data/dimensions-apm2.js','src/data/sources-apm2.js','src/data/taxonomy-apm2.js'])assert.match(sw,new RegExp(asset.replaceAll('/','\\/')));
});

test('v57 routes Sheeting Lexus as a dedicated right-to-left twin',()=>{
  assert.match(app,/IS_SHEETING=MACHINE_KEY==='sheeting'/);
  assert.match(app,/machine\.machineId==='BMJ-MCH-0002'\?'sheeting'/);
  assert.match(app,/SHEETING LEXUS/);
  assert.match(app,/RIGHT → LEFT/);
  assert.match(app,/Simulasi Proses Sheeting/);
  assert.match(runtime,/SheetingMachineTemplate/);
  assert.match(runtime,/SheetingProcessSimulation/);
  assert.match(runtime,/if\(k==='sheeting'\)return new SheetingMachineTemplate\(\)/);
  assert.match(sheeting,/processDirection:'RIGHT_TO_LEFT'/);
  assert.match(sheeting,/sheeting-rollstand/);
  assert.match(sheeting,/sheeting-cutter/);
  assert.match(sheeting,/sheeting-layboy/);
  assert.match(simulationSheeting,/Lift Table \/ Stacker/);
  assert.match(taxonomySheeting,/SHEETING LEXUS · HSM-CTM7/);
  assert.match(sourcesSheeting,/HSM 56/);
  assert.match(sourcesSheeting,/USER_CONFIRMED_REFERENCE/);
  for(const asset of ['src/sheeting.js','src/simulation-sheeting.js','src/data/sources-sheeting.js','src/data/taxonomy-sheeting.js'])assert.match(sw,new RegExp(asset.replaceAll('/','\\/')));
});

test('selected assemblies expose camera-tracked component labels with leader lines',()=>{
  assert.match(html,/id="part-label-layer"/);
  assert.match(experienceCss,/\.part-label-layer line/);
  assert.match(experienceCss,/\.part-label\.is-selected/);
  assert.match(engine,/setPartLabels\(part,taxonomyId=null\)/);
  assert.match(engine,/updatePartLabels\(\)/);
  assert.match(engine,/createElementNS\('http:\/\/www\.w3\.org\/2000\/svg','line'\)/);
  assert.match(app,/engine\.setPartLabels\(part,selectedTaxonomyId\)/);
  assert.match(app,/engine\.clearPartLabels\(\)/);
});

test('v40 labels drill through the six-level taxonomy with individually mapped gripper components',()=>{
  assert.match(html,/data-part-label-back/);
  assert.match(html,/data-part-label-stage/);
  assert.match(engine,/onTaxonomySelect=null/);
  assert.match(engine,/this\.onTaxonomySelect\?\.\(item\.meta\.id\)/);
  assert.match(engine,/taxonomyNodes\(meta,fallbackPart=null\)/);
  assert.match(app,/function taxonomyAtLevel\(level\)/);
  assert.match(app,/engine\.onTaxonomySelect=id=>selectTaxonomy\(id,\{revealPanel:false\}\)/);
  assert.match(taxonomy,/Gripper Bar A/);
  assert.match(taxonomy,/Gripper Bar B/);
  assert.match(taxonomy,/Gripper Shaft & Supports/);
  assert.match(taxonomy,/Return Spring & Pivot/);
  assert.match(taxonomy,/Opening Cam \/ Follower \/ Lever/);
  assert.match(taxonomy,/gripper-shaft/);
  assert.match(taxonomy,/gripper-spring/);
  assert.match(taxonomy,/gripper-cam/);
  assert.match(experienceCss,/\.part-label-nav/);
  assert.match(experienceCss,/\.part-label\.is-reference/);
});

test('V119 adaptive shell prevents duplicate mobile drawer toggles and restores workbench visibility',()=>{
  assert.match(appShellCss,/V119 adaptive layout hardening/);
  assert.match(appShellCss,/\.ui-workbench-open \.engineering-workbench/);
  assert.match(appShellCss,/var\(--app-vh,100dvh\)/);
  assert.match(appShellCss,/body:not\(\.panel-hidden\) \.scene-bottom/);
  assert.doesNotMatch(ui,/document\.body\.classList\.toggle\('nav-open'\)/);
  assert.match(ui,/app-shell-v79\.js owns the nav-open toggle/);
});

test('V79 interface keeps the scene primary, readable and secondary panels dismissible',()=>{
  assert.match(html,/<body class="panel-hidden ui-simple">/);
  assert.match(html,/app-shell-v79\.css/);
  assert.match(html,/app-shell-v79\.js/);
  assert.match(appShellCss,/aside#detail-panel/);
  assert.match(appShellCss,/panel-hidden aside#detail-panel/);
  assert.match(appShellCss,/orientation:landscape/);
  assert.match(mobileStableUi,/aria-expanded/);
  assert.match(experienceJs,/fullscreenchange/);
  assert.match(appShellCss,/--rail-w:92px/);
  assert.match(appShellCss,/\.rail button small/);
  assert.match(appShellCss,/\.view-switch button span/);
  assert.match(appShellCss,/\.statusbar/);
});

test('runtime binds every workbench button and provides a visual fallback without WebGL',()=>{
  assert.match(app,/\$\$\('\[data-workbench="dwg"\]'\)\.forEach/);
  assert.match(app,/function renderStaticMachineFallback/);
  assert.match(app,/Tampilan cadangan siap/);
  assert.match(app,/PU1–PU8/);
  assert.match(app,/PU2 \/ FoilStar/);
  assert.match(app,/'CU2','Y2','PU14','CUF'/);
  assert.match(app,/Final CU → X3 Delivery/);
});
