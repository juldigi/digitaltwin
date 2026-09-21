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
 assert.equal(model.root.userData.researchVersion,'V121',id);
 assert.ok(model.root.userData.researchSourceCount>=100,id+' research ledger < 100 sources');
 assert.equal(model.root.userData.engineeringDimensions,false,id);
 for(const role of required)assert.ok(set.has(role),id+' missing V121 mechanism '+role);
 const sim=createMachineSimulation(id,model.root,model);
 assert.equal(sim.state().blocked,false,id);
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
 expectRoles('BMJ-MCH-0004',['feeder-sucker','side-lay','ink-circulation-pump','doctor-blade-holder','doctor-oscillator','impression-bearing','delivery-gripper','pile-side-jogger']);
});

test('V121 QF reference exposes servo XY, linear guides, hydraulic blanking and tooling details',()=>{
 expectRoles('BMJ-MCH-0021',['linear-guide','ball-screw-x','ball-screw-y','servo-drive','hydraulic-cylinder','blanking-pressure-plate','tooling-pin','separator-fork']);
});

test('V121 collator exposes suction, sensing, gathering and delivery mechanics',()=>{
 expectRoles('BMJ-MCH-0023',['feed-bin-shelf','vacuum-blower','vacuum-manifold-branch','double-miss-detector','gather-transport-roller','set-jogger']);
});

test('V121 Heidelberg CTP exposes plate transport, external drum, laser and bounded punch detail',()=>{
 const model=createMachineTemplate('BMJ-MCH-0025'),set=roles(model);
 for(const role of ['plate-side-guide','plate-transport-roller','plate-clamp-bar','drum-bearing','laser-linear-rail','laser-diode-module','internal-punch-pin'])assert.ok(set.has(role),role);
 const punches=[];model.root.traverse(o=>{if(o.userData?.mechanismRole==='internal-punch-pin')punches.push(o);});
 assert.ok(punches.length>=2);assert.ok(punches.every(p=>p.userData.evidence==='SUPRASETTER_OPTION_BOUNDARY'));
 assert.equal(model.root.userData.engineeringDimensions,false);model.dispose();
});

test('V121 SCREEN imagesetter uses capstan/polygon-mirror mechanics rather than a generic drum',()=>{
 expectRoles('BMJ-MCH-0027',['film-cassette-guide','capstan-transport-roller','tension-dancer','polygon-facet','laser-modulator','film-cutter','processor-interface-roller']);
});

test('V121 Zund reference exposes vacuum zones, gantry, modular tools and registration camera',()=>{
 expectRoles('BMJ-MCH-0028',['vacuum-port','vacuum-zone-divider','gantry-linear-guide','module-carrier','oscillating-knife','router-tool','icc-camera-lens','icc-led-ring']);
});

test('V121 compressor reference exposes a coherent screw-compressor oil/air flow package',()=>{
 expectRoles('BMJ-MCH-0031',['intake-filter','inlet-valve','motor-coupling','screw-airend-housing','separator-vessel','minimum-pressure-valve','oil-filter','thermostatic-valve','cooling-fan']);
});

test('V121 standard AHU exposes damper-filter-coil-drain-fan-service-discharge sections',()=>{
 expectRoles('BMJ-MCH-0036',['opposed-blade-damper','filter-bank','coil-fin','coil-header','drain-pan','supply-fan-wheel','fan-motor','service-door','discharge-plenum']);
});

test('V121 Sansin asset keeps brand-specific indoor/outdoor cooling boundary without inventing exact model',()=>{
 const model=createMachineTemplate('BMJ-MCH-0040'),set=roles(model);
 for(const role of ['return-inlet-damper','filter-bank','heat-exchange-fin','indoor-supply-fan','outdoor-condenser-fan','compressor-reference','valve-manifold','cooling-controller'])assert.ok(set.has(role),role);
 assert.match(model.root.userData.sansinBoundary,/exact YZKJ model\/capacity is not asserted/);
 model.dispose();
});
