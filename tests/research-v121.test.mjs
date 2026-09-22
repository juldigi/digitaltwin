import test from 'node:test';
import assert from 'node:assert/strict';
import {V121_SOURCE_LEDGER,V121_SOURCE_STATS,V121_NEW_RESEARCH_SOURCES} from '../frontend/src/data/research-v121.js';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const roles=model=>{
 const set=new Set();
 model.root.traverse(o=>{if(o.userData?.mechanismRole)set.add(o.userData.mechanismRole);});
 return set;
};
const expectRoles=(id,required)=>{
 const model=createMachineTemplate(id),set=roles(model);
 assert.equal(model.root.userData.researchVersion,'V139',id);
 assert.ok(model.root.userData.researchSourceCount>=195,id+' current research ledger < 195 sources');
 assert.equal(model.root.userData.engineeringDimensions,false,id);
 for(const role of required)assert.ok(set.has(role),id+' missing V121 mechanism '+role);
 const sim=createMachineSimulation(id,model.root,model);
 const shouldBlock=id==='BMJ-MCH-0004';assert.equal(sim.state().blocked,shouldBlock,id);
 sim.dispose();model.dispose();
};

test(`V121 deep-research ledger contains ${V121_SOURCE_STATS.total} unique technical sources`,()=>{
 const urls=V121_SOURCE_LEDGER.map(s=>s.url);
 assert.ok(V121_SOURCE_STATS.total>=100,'source ledger has only '+V121_SOURCE_STATS.total);
 assert.ok(V121_SOURCE_STATS.newReviewed>=50,'new review batch too small');
 assert.ok(V121_SOURCE_STATS.oemPrimary>=25,'not enough OEM/primary references');
 assert.equal(new Set(urls).size,urls.length,'research ledger URLs are not unique');
 assert.equal(V121_NEW_RESEARCH_SOURCES.length,V121_SOURCE_STATS.newReviewed);
});

test('V121 source coverage spans every major production and utility machine family',()=>{
 const scopes=V121_SOURCE_LEDGER.map(s=>String(s.machineScope||''));
 for(const token of ['OFFSET5','OFFSET8/OFFSET10','POLAR115','APM2','MK920','MK1060ER','PROMATRIX106','MEDIA100','DIANAEYE55','SHARKN650','UPG-LY300','SHEETING','FZ1200','CTP','ZUND','COMPRESSOR','YA1A1A']){
  assert.ok(scopes.some(scope=>scope.includes(token)),token+' has no V121 evidence coverage');
 }
});

test('V121 gravure twin exposes sheet-fed registration, doctor-blade, ink and delivery mechanics',()=>{
 expectRoles('BMJ-MCH-0004',['feeder-sucker','side-lay-reference','ink-circulation-pump','doctor-blade-holder','doctor-axial-oscillator','impression-cylinder-journal','delivery-gripper-reference','pile-side-jogger']);
});

test('V121 QF reference exposes servo XY, linear guides, hydraulic blanking and tooling details',()=>{
 expectRoles('BMJ-MCH-0021',['x-axis-linear-guide','x-axis-ball-screw','y-axis-ball-screw','x-axis-servo-motor','main-hydraulic-cylinder-reference','blanking-pressure-plate','blanking-tool-pin','waste-frame-support-rail']);
});

test('V121 collator exposes suction, sensing, gathering and delivery mechanics',()=>{
 expectRoles('BMJ-MCH-0023',['feed-bin-shelf','vacuum-blower','vacuum-bin-branch','double-miss-feed-sensor-reference','gather-transport-roller','set-jogger']);
});

test('V121 Heidelberg CTP exposes plate transport, external drum, laser and bounded punch detail',()=>{
 const model=createMachineTemplate('BMJ-MCH-0025'),set=roles(model);
 for(const role of ['manual-plate-side-guide','plate-transport-roller','plate-clamp-reference','imaging-drum-bearing-reference','laser-linear-rail','heidelberg-laser-module-reference'])assert.ok(set.has(role),role);
 const punch=model.findNode('ctp-punch-option');assert.ok(punch);assert.equal(punch.userData.installedOptionVerified,false);
 assert.equal(model.root.userData.engineeringDimensions,false);model.dispose();
});

test('V121 SCREEN imagesetter uses capstan/polygon-mirror mechanics rather than a generic drum',()=>{
 expectRoles('BMJ-MCH-0027',['media-cassette-sideplate','capstan-drive-roller','gravity-tension-roller','five-facet-polygon-mirror-reference','laser-modulator-reference','media-cross-cutter','inline-processor-interface-boundary']);
});

test('V121 Zund reference exposes vacuum zones, gantry, modular tools and registration camera',()=>{
 expectRoles('BMJ-MCH-0028',['vacuum-port-reference','vacuum-zone-divider-reference','gantry-linear-guide-reference','universal-module-carrier-reference','cutting-tool-capability-envelope','routing-tool-capability-envelope','icc-camera-option-reference','icc-lighting-option-reference']);
});

test('V121 compressor reference exposes a coherent screw-compressor oil/air flow package',()=>{
 expectRoles('BMJ-MCH-0031',['kaeser-dry-intake-filter','kaeser-inlet-vent-valve-reference','kaeser-drive-interface-reference','kaeser-sigma-profile-airend','kaeser-cooling-fluid-separator-tank','kaeser-minimum-pressure-check-valve','kaeser-eco-fluid-filter-reference','kaeser-thermostatic-fluid-valve-reference','kaeser-cooling-fan-reference']);
});

test('V121 standard AHU exposes damper-filter-coil-drain-fan-service-discharge sections',()=>{
 expectRoles('BMJ-MCH-0036',['opposed-blade-damper-reference','ahu-filter-panel-reference','cooling-coil-fin-reference','cooling-coil-header-reference','sloped-condensate-drain-pan','supply-fan-wheel-reference','supply-fan-motor-reference','ahu-service-door','ahu-discharge-plenum']);
});

test('V121 Sansin asset keeps brand-specific indoor/outdoor cooling boundary without inventing exact model',()=>{
 const model=createMachineTemplate('BMJ-MCH-0040'),set=roles(model);
 for(const role of ['sansin-return-inlet-damper','sansin-filter-net-layer','sansin-evaporator-fin','sansin-indoor-supply-fan','sansin-outdoor-condenser-fan-reference','sansin-refrigeration-compressor-reference','sansin-refrigerant-valve-manifold-reference','sansin-cooling-controller-reference'])assert.ok(set.has(role),role);
 assert.match(model.root.userData.sansinBoundary,/not an exact 45N\/90N installation claim/i);
 model.dispose();
});
