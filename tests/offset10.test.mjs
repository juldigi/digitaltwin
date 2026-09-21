import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Offset10MachineTemplate} from '../frontend/src/offset10.js';
import {Offset10PrintingSimulation,OFFSET10_SIMULATION_STAGES} from '../frontend/src/simulation-offset10.js';
import {OFFSET10_DIMENSIONS,OFFSET10_MODULE_SEQUENCE,OFFSET10_MODULE_CENTERS,OFFSET10_PRINTING_UNIT_KEYS,OFFSET10_COATING_UNIT_KEYS,OFFSET10_Y_UNIT_KEYS} from '../frontend/src/data/dimensions-offset10.js';
import {OFFSET10_TAXONOMY,OFFSET10_TAXONOMY_BY_ID,offset10TaxonomyStats} from '../frontend/src/data/taxonomy-offset10.js';

test('Offset 10 configuration matches the BMJ final drawing module sequence',()=>{
  assert.equal(OFFSET10_MODULE_SEQUENCE.length,16);
  assert.deepEqual(OFFSET10_MODULE_SEQUENCE.map(m=>m.key),['PU1','PU2','CU1','Y1','PU4','PU5','PU6','PU7','PU8','PU9','PU10','PU11','CU2','Y2','PU14','CUF']);
  assert.equal(OFFSET10_PRINTING_UNIT_KEYS.length,11);
  assert.equal(OFFSET10_COATING_UNIT_KEYS.length,3);
  assert.equal(OFFSET10_Y_UNIT_KEYS.length,2);
  assert.equal(OFFSET10_MODULE_SEQUENCE.find(m=>m.key==='PU2').foilStar,true);
  assert.equal(OFFSET10_DIMENSIONS.verified.interdeckUvLampCount,6);
  assert.equal(OFFSET10_DIMENSIONS.verified.endOfPressUvLampCount,3);
  assert.equal(OFFSET10_DIMENSIONS.verified.deliveryExtensionModules,3);
  assert.equal(OFFSET10_DIMENSIONS.verified.pressElevation,.564);
  assert.equal(OFFSET10_DIMENSIONS.verified.maxSpeedSph,15000);
  assert.equal(OFFSET10_DIMENSIONS.verified.maxSheetWidth,1.040);
  assert.equal(OFFSET10_DIMENSIONS.verified.modulePitch,1.225);
  assert.equal(OFFSET10_DIMENSIONS.verified.baseReferenceLength,27.749);
  assert.equal(OFFSET10_DIMENSIONS.verified.machineOnlyWeightKg,98995);
  assert.equal(OFFSET10_DIMENSIONS.verified.overallPressWeightKg,110181);
});

test('Offset 10 builds all document-grounded physical modules and no CD102 roller numbering',()=>{
  const machine=new Offset10MachineTemplate();
  for(const module of OFFSET10_MODULE_SEQUENCE)assert.ok(machine.findNode('o10-'+module.key.toLowerCase()),'missing '+module.key);
  for(const id of ['o10-feeder','o10-feedboard','o10-foilstar','o10-foilstar-rolls','o10-delivery','o10-delivery-x3','o10-delivery-paper-stack','o10-prinect-center','o10-peripherals'])assert.ok(machine.findNode(id),'missing '+id);
  assert.ok(machine.meshes.length>350,'Offset 10 geometry is unexpectedly sparse');
  assert.ok(machine.meshes.length<1500,'Offset 10 exceeds mobile full-detail mesh budget');
  assert.equal(machine.root.userData.assetId,'MACHINE-OFFSET10');
  assert.equal(machine.root.userData.dimensionAudit.printingUnits,11);
  assert.equal(machine.root.userData.dimensionAudit.coatingUnits,3);
  assert.equal(machine.root.userData.dimensionAudit.yUnits,2);
  assert.equal(machine.findNode('o10-pu1-ink-roller-13'),null,'CD102-specific roller numbering must not leak into CX104');
  machine.dispose();
});

test('Offset 10 has exactly six interdeck and three EOP UV lamps/beams',()=>{
  const machine=new Offset10MachineTemplate();
  const count=(node,flag)=>{let n=0;node?.traverse(o=>{if(o.userData?.[flag])n++;});return n;};
  assert.equal(count(machine.findNode('o10-y1-uv'),'uvLamp'),3);
  assert.equal(count(machine.findNode('o10-y2-uv'),'uvLamp'),3);
  assert.equal(count(machine.findNode('o10-eop-uv'),'uvLamp'),3);
  assert.equal(count(machine.findNode('o10-y1-uv'),'uvBeam'),3);
  assert.equal(count(machine.findNode('o10-y2-uv'),'uvBeam'),3);
  assert.equal(count(machine.findNode('o10-eop-uv'),'uvBeam'),3);
  for(const id of ['o10-y1-uv','o10-y2-uv','o10-eop-uv'])machine.findNode(id).traverse(o=>{if(o.userData.uvBeam)assert.equal(o.visible,false,'UV beam must start inactive');});
  machine.dispose();
});

test('Offset 10 FoilStar is a PU2-mounted superstructure with six unwind and six rewind web positions',()=>{
  const machine=new Offset10MachineTemplate(),foil=machine.findNode('o10-foilstar'),unwind=machine.findNode('o10-foilstar-unwinder'),rewind=machine.findNode('o10-foilstar-rewinder');
  const unwindReels=[],rewindReels=[];
  unwind.traverse(o=>{if(o.userData?.foilReel==='unwind')unwindReels.push(o);});
  rewind.traverse(o=>{if(o.userData?.foilReel==='rewind')rewindReels.push(o);});
  assert.equal(unwindReels.length,6,'FoilStar must expose six multi-web unwind reel positions');
  assert.equal(rewindReels.length,6,'FoilStar must expose six corresponding rewind positions');
  const pu2=new THREE.Vector3(),fs=new THREE.Vector3();
  machine.findNode('o10-pu2').getWorldPosition(pu2);foil.getWorldPosition(fs);
  assert.ok(Math.abs(pu2.x-fs.x)<1e-8,'FoilStar superstructure must be centered on PU2 rather than floating between units');
  assert.equal(foil.userData.mountedOn,'PU2');
  const supportBox=new THREE.Box3().setFromObject(machine.findNode('o10-foilstar-superstructure'));
  const frameBox=new THREE.Box3().setFromObject(machine.findNode('o10-pu2-frame-structure'));
  assert.ok(supportBox.min.y<=frameBox.max.y+.02,'FoilStar support does not physically meet the PU2 frame');
  assert.ok(supportBox.max.y>frameBox.max.y,'FoilStar superstructure should rise above PU2');
  const coreBox=new THREE.Box3().setFromObject(machine.findNode('o10-foilstar-superstructure'));
  assert.ok(coreBox.min.x>=pu2.x-.55&&coreBox.max.x<=pu2.x+.55,'FoilStar mounting frame exits the PU2 longitudinal envelope');
  assert.ok(machine.findNode('o10-foilstar-dancer'));
  assert.ok(machine.findNode('o10-foilstar-transfer-nip'));
  assert.ok(machine.findNode('o10-foilstar-loading'));
  assert.ok(machine.findNode('o10-foilstar-sensors'));
  machine.dispose();
});

test('Offset 10 taxonomy provides source-derived six levels with physical FoilStar process hierarchy',()=>{
  const machine=new Offset10MachineTemplate(),stats=offset10TaxonomyStats();
  assert.ok(stats.total>700,'taxonomy should contain a detailed six-stage CX104 hierarchy');
  for(let level=1;level<=6;level++)assert.ok(stats.byLevel[level]>0,'taxonomy level '+level+' is empty');
  for(const id of [
    'O10','O10.FEEDER','O10.PRINT.PU2','O10.FOIL','O10.FOIL.ADHESIVE','O10.FOIL.TRANSFER','O10.FOIL.REELS','O10.FOIL.INDEX','O10.FOIL.WEB',
    'O10.COAT.CU2','O10.UV.Y1','O10.UV.EOP','O10.DELIVERY','O10.ACCESS','O10.AUX'
  ])assert.ok(OFFSET10_TAXONOMY_BY_ID.has(id),'missing taxonomy '+id);
  for(const id of [
    'O10.PRINT.PU2.CYL','O10.FOIL.TRANSFER.MOUNT','O10.FOIL.REELS.SHAFTS','O10.COAT.CUF.APPLY',
    'O10.UV.Y2.CASSETTES','O10.DELIVERY.PILE','O10.AUX.UVXLC'
  ])assert.ok(machine.resolveTaxonomyNode(id),'taxonomy not mapped '+id);
  const adhesive=OFFSET10_TAXONOMY_BY_ID.get('O10.FOIL.ADHESIVE');
  const transfer=OFFSET10_TAXONOMY_BY_ID.get('O10.FOIL.TRANSFER');
  assert.ok(adhesive.meshRefs.includes('o10-pu1'),'FoilStar adhesive process must point to PU1');
  assert.ok(transfer.meshRefs.includes('o10-foilstar-superstructure'),'FoilStar transfer must point to PU2-mounted superstructure');
  assert.ok(!OFFSET10_TAXONOMY.some(n=>/inspection \/ service reference/i.test(n.name)),'generic placeholder taxonomy leaked into V53');
  machine.dispose();
});

test('Offset 10 adjacent process modules preserve longitudinal clearance',()=>{
  const machine=new Offset10MachineTemplate();machine.root.updateMatrixWorld(true);
  for(let i=0;i<OFFSET10_MODULE_SEQUENCE.length-1;i++){
    const left=machine.findNode('o10-'+OFFSET10_MODULE_SEQUENCE[i].key.toLowerCase()),right=machine.findNode('o10-'+OFFSET10_MODULE_SEQUENCE[i+1].key.toLowerCase());
    const a=new THREE.Box3().setFromObject(left),b=new THREE.Box3().setFromObject(right);
    const penetration=a.max.x-b.min.x;
    assert.ok(penetration<=.015,`${OFFSET10_MODULE_SEQUENCE[i].key} overlaps ${OFFSET10_MODULE_SEQUENCE[i+1].key} by ${penetration.toFixed(4)} m`);
  }
  const audit=machine.root.userData.dimensionAudit;
  assert.equal(audit.modulePitch,1.225);
  assert.ok(Math.abs(audit.spanDelta)<.02,`modeled press span differs from 27.749 m by ${audit.spanDelta} m`);
  machine.dispose();
});

test('Offset 10 PU1 cylinder and roller groups have no volumetric penetration',()=>{
  const machine=new Offset10MachineTemplate();machine.root.updateMatrixWorld(true);
  const centerRadius=(id,r)=>{const p=new THREE.Vector3();machine.findNode(id).children.find(o=>o.isMesh)?.getWorldPosition(p);return {p,r,id};};
  const cylinders=[
    centerRadius('o10-pu1-plate',.20),centerRadius('o10-pu1-blanket',.22),
    centerRadius('o10-pu1-impression',.27),centerRadius('o10-pu1-transfer',.27)
  ];
  for(let i=0;i<cylinders.length-1;i++){
    const a=cylinders[i],b=cylinders[i+1],d=Math.hypot(a.p.x-b.p.x,a.p.y-b.p.y);
    assert.ok(d>=a.r+b.r-.002,`${a.id} penetrates ${b.id}: ${d.toFixed(4)} < ${(a.r+b.r).toFixed(4)}`);
  }
  for(const groupId of ['o10-pu1-inking','o10-pu1-dampening']){
    const rollers=[];machine.findNode(groupId).traverse(o=>{if(o.isMesh&&Number.isFinite(o.userData?.rollerRadius)){const p=new THREE.Vector3();o.getWorldPosition(p);rollers.push({p,r:o.userData.rollerRadius,role:o.userData.rollerRole});}});
    assert.ok(rollers.length>=5,groupId+' has too few mapped rollers');
    for(let i=0;i<rollers.length;i++)for(let j=i+1;j<rollers.length;j++){
      const a=rollers[i],b=rollers[j],d=Math.hypot(a.p.x-b.p.x,a.p.y-b.p.y);
      assert.ok(d>=a.r+b.r-.002,`${groupId}: ${a.role} penetrates ${b.role} by ${(a.r+b.r-d).toFixed(4)} m`);
    }
  }
  machine.dispose();
});

test('Offset 10 cutaway exposes complete press interior like Offset 5 while retaining structure',()=>{
  const machine=new Offset10MachineTemplate();
  const removable=[],structural=[];
  machine.root.traverse(o=>{
    if(o.isMesh&&o.userData.exteriorCover)removable.push(o);
    if(o.userData?.nodeId?.endsWith('-frame-structure'))structural.push(o);
  });
  assert.ok(removable.length>=45,'too few removable cover/access elements for a full Offset 10 cutaway');
  assert.ok(structural.length>=16,'cutaway must retain structural posts/crossmembers for every press module');
  machine.setExteriorOpen(true);
  assert.ok(removable.every(m=>!m.visible),'some exterior/access geometry still blocks the interior');
  assert.ok(structural.every(n=>n.visible),'structural press frame disappeared with covers');
  assert.equal(machine.root.userData.interiorCutawayVisible,true);
  assert.ok(machine.root.userData.exteriorHiddenCount>=removable.length);

  for(const key of OFFSET10_PRINTING_UNIT_KEYS){
    const id='o10-'+key.toLowerCase();
    for(const suffix of ['cylinders','inking','dampening','autoplate','washup','airtransfer'])
      assert.equal(machine.findNode(id+'-'+suffix)?.visible,true,key+' '+suffix+' must remain visible');
    const side=machine.findNode(id+'-frame-side-housing');
    const sideMeshes=[];side?.traverse(o=>{if(o.isMesh)sideMeshes.push(o);});
    assert.ok(sideMeshes.length>=2,key+' side housing not modeled');
    assert.ok(sideMeshes.every(m=>!m.visible),key+' side housing still obscures simulation interior');
  }
  for(const key of OFFSET10_COATING_UNIT_KEYS){
    const id='o10-'+key.toLowerCase();
    for(const suffix of ['chamber','anilox','form','impression','supply'])
      assert.equal(machine.findNode(id+'-'+suffix)?.visible,true,key+' '+suffix+' must remain visible');
  }
  for(const key of OFFSET10_Y_UNIT_KEYS){
    const id='o10-'+key.toLowerCase();
    assert.equal(machine.findNode(id+'-uv')?.visible,true,key+' UV internals must remain visible');
    assert.equal(machine.findNode(id+'-sheet-guide')?.visible,true,key+' sheet guide must remain visible');
  }
  assert.equal(machine.findNode('o10-foilstar')?.visible,true);
  assert.equal(machine.findNode('o10-delivery-chain')?.visible,true);
  assert.equal(machine.findNode('o10-delivery-sheet-brake')?.visible,true);
  assert.equal(machine.findNode('o10-delivery-paper-stack')?.visible,true);

  machine.setExteriorOpen(false);
  assert.ok(removable.every(m=>m.visible),'closed exterior did not restore covers/access');
  assert.equal(machine.root.userData.interiorCutawayVisible,false);
  machine.dispose();
});

test('Offset 10 simulation traverses documented modules, activates FoilStar/UV and stacks delivery sheets',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  assert.ok(sim.pathLength>24&&sim.pathLength<40,'unexpected Offset 10 path length '+sim.pathLength);
  assert.equal(sim.state().uvLampCount,9);
  assert.equal(sim.foil.length,12,'simulation should animate six unwind + six rewind reel positions only');
  assert.ok(sim.rotors.length>100,'too few animated CX104 mechanisms');
  assert.equal(sim.flows.filter(f=>f.type==='ink').length,11);
  assert.equal(sim.flows.filter(f=>f.type==='damp').length,11);
  assert.equal(sim.flows.filter(f=>f.type==='coat').length,3);
  sim.start();sim.update(0);
  let foilSeen=false,uvSeen=false,pileSeen=false;
  for(let ms=16;ms<=26000;ms+=16){
    sim.update(ms);const s=sim.state();
    foilSeen ||= s.foilStarActive;uvSeen ||= s.uvActive;pileSeen ||= s.pileSheetsVisible>0;
  }
  assert.equal(foilSeen,true,'FoilStar never became active at PU2');
  assert.equal(uvSeen,true,'UV never activated at Y/EOP zones');
  assert.equal(pileSeen,true,'delivery never accumulated printed sheets');
  assert.ok(sim.state().completed>0);
  const stack=sim.pileSheets.filter(s=>s.mesh.visible);assert.ok(stack.length>0);
  const anchor=sim.pileAnchor;for(const sheet of stack){const a=sheet.mesh.geometry.attributes.position.array;let sx=0,sz=0,n=0;for(let i=0;i<a.length;i+=3){sx+=a[i];sz+=a[i+2];n++;}assert.ok(Math.abs(sx/n-anchor.x)<.02);assert.ok(Math.abs(sz/n-anchor.z)<.02);}
  sim.stop();assert.equal(sim.state().pileSheetsVisible,0);assert.equal(sim.state().uvActive,false);assert.equal(sim.state().foilStarActive,false);
  sim.dispose();machine.dispose();
});

test('Offset 10 stage list includes all physical modules and X3 delivery',()=>{
  assert.equal(OFFSET10_SIMULATION_STAGES[0],'Preset Plus Feeder');
  assert.equal(OFFSET10_SIMULATION_STAGES.at(-1),'Preset Plus X3 Delivery');
  for(const module of OFFSET10_MODULE_SEQUENCE)assert.ok(OFFSET10_SIMULATION_STAGES.includes(module.label));
  for(let i=1;i<OFFSET10_MODULE_SEQUENCE.length;i++)assert.ok(OFFSET10_MODULE_CENTERS[OFFSET10_MODULE_SEQUENCE[i].key]>OFFSET10_MODULE_CENTERS[OFFSET10_MODULE_SEQUENCE[i-1].key]);
});


test('V115 Offset10 process rotor set is role-tagged and excludes static cylindrical hardware',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  const required=['plate','blanket','impression','transfer','fountain','form-1','distributor-1','damp-form','damp-pan','coating-anilox','coating-form','coating-impression','coating-transfer'];
  const roles=new Set(sim.rotors.map(r=>r.role));
  for(const role of required)assert.ok(roles.has(role),'missing rotor role '+role);
  assert.equal(sim.rotors.every(r=>r.mesh.userData.rotor===true&&r.mesh.userData.rollerRole===r.role),true);
  const forbiddenOwners=['airtransfer','blower','drip-tray','chamber','sheet-monitor','foilstar-superstructure','foilstar-loading'];
  for(const r of sim.rotors){
    const owner=String(r.mesh.userData.ownerId||'');
    assert.equal(forbiddenOwners.some(x=>owner.includes(x)),false,'static hardware leaked into rotor set: '+owner);
  }
  assert.equal(sim.rotors.some(r=>!Number.isFinite(r.sign)||!Number.isFinite(r.rate)),false);
  sim.dispose();machine.dispose();
});

test('V115 Offset10 rotor direction is stable by mechanical role rather than traversal order',()=>{
  const a=new Offset10MachineTemplate(),sa=new Offset10PrintingSimulation(a.root,a);
  const b=new Offset10MachineTemplate(),sb=new Offset10PrintingSimulation(b.root,b);
  const map=s=>new Map(s.rotors.map(r=>[(r.mesh.userData.ownerId||'')+'|'+r.role,{sign:r.sign,rate:r.rate}]));
  const ma=map(sa),mb=map(sb);assert.equal(ma.size,mb.size);
  for(const [k,v] of ma){assert.deepEqual(mb.get(k),v,'role motion changed across identical builds: '+k);}
  for(const [role,expected] of [['plate',1],['blanket',-1],['impression',1],['transfer',-1],['coating-anilox',1],['coating-form',-1],['coating-impression',1],['coating-transfer',-1]]){
    const matches=sa.rotors.filter(r=>r.role===role);assert.ok(matches.length>0,role);assert.equal(matches.every(r=>r.sign===expected),true,role+' direction mismatch');
  }
  sa.dispose();a.dispose();sb.dispose();b.dispose();
});

test('V115 Offset10 static cylindrical references remain unchanged during simulation',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  const staticMeshes=[];
  for(const id of ['o10-pu1-airtransfer','o10-pu1-damp-blower','o10-cu1-drip-tray','o10-cu1-chamber','o10-foilstar-loading']){
    machine.findNode(id)?.traverse(o=>{if(o.isMesh&&o.geometry?.type==='CylinderGeometry'&&!o.userData.rotor)staticMeshes.push(o);});
  }
  assert.ok(staticMeshes.length>0);
  const q=staticMeshes.map(m=>m.quaternion.clone());
  sim.start();sim.update(0);for(let ms=16;ms<=1500;ms+=16)sim.update(ms);
  assert.equal(staticMeshes.every((m,i)=>m.quaternion.angleTo(q[i])<1e-10),true);
  sim.dispose();machine.dispose();
});


test('V116 Offset10 dynamic sheet brake is idle until a sheet enters the controlled slowdown zone',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  const brakes=sim.rotors.filter(r=>r.role==='sheet-brake');assert.equal(brakes.length,3);
  const q0=brakes.map(r=>r.mesh.quaternion.clone());
  sim.start();sim.update(0);
  for(let ms=16;ms<=1200;ms+=16)sim.update(ms);
  assert.equal(sim.state().deliveryBrakeActive,false);
  assert.equal(brakes.every((r,i)=>r.mesh.quaternion.angleTo(q0[i])<1e-10),true,'sheet brake rotated before sheet arrival');

  let seen=false,rotated=false;
  for(let ms=1216;ms<=26000;ms+=16){
    sim.update(ms);
    if(sim.state().deliveryBrakeActive){
      seen=true;
      rotated ||= brakes.some((r,i)=>r.mesh.quaternion.angleTo(q0[i])>.001);
    }
    if(seen&&rotated)break;
  }
  assert.equal(seen,true,'delivery slowdown zone never activated');
  assert.equal(rotated,true,'dynamic sheet brake did not rotate while sheet occupied slowdown zone');
  sim.stop();
  assert.equal(sim.state().deliveryBrakeActive,false);
  assert.equal(brakes.every((r,i)=>r.mesh.quaternion.angleTo(q0[i])<1e-8),true,'sheet brake phase did not reset');
  sim.dispose();machine.dispose();
});

test('V117 Offset10 FoilStar UV and sheet brake states exactly follow their own sheet-occupancy zones',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  sim.start();sim.update(0);let foilSeen=false,uvSeen=false,brakeSeen=false;
  for(let ms=16;ms<=26000;ms+=16){
    sim.update(ms);const s=sim.state(),visible=sim.sheets.filter(x=>x.mesh.visible);
    const expectedFoil=visible.some(x=>Math.abs(x.userData.lead.x-OFFSET10_MODULE_CENTERS.PU2)<.75);
    const expectedBrake=visible.some(x=>Math.abs(x.userData.lead.x-(OFFSET10_DIMENSIONS.layout.deliveryCenterX+1.42))<.58);
    const expectedUV=visible.some(x=>{
      const px=x.userData.lead.x;
      return Math.abs(px-OFFSET10_MODULE_CENTERS.Y1)<.65||Math.abs(px-OFFSET10_MODULE_CENTERS.Y2)<.65||(px>OFFSET10_DIMENSIONS.layout.deliveryCenterX-1.75&&px<OFFSET10_DIMENSIONS.layout.deliveryCenterX-.25);
    });
    assert.equal(s.foilStarActive,expectedFoil,'FoilStar state diverged from PU2 occupancy');
    assert.equal(s.deliveryBrakeActive,expectedBrake,'sheet-brake state diverged from delivery occupancy');
    assert.equal(s.uvActive,expectedUV,'UV state diverged from Y/EOP occupancy');
    foilSeen||=s.foilStarActive;uvSeen||=s.uvActive;brakeSeen||=s.deliveryBrakeActive;
  }
  assert.ok(foilSeen&&uvSeen&&brakeSeen);
  sim.dispose();machine.dispose();
});

test('V117 Offset10 sheet centerline clears blanket impression and coating nip cylinders',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  machine.root.updateMatrixWorld(true);
  const samples=Array.from({length:1801},(_,i)=>sim.curve.getPointAt(i/1800));
  const clearance=(mesh)=>{
    const p=new THREE.Vector3();mesh.getWorldPosition(p);const r=mesh.userData.rollerRadius;
    let min=Infinity;for(const s of samples){const d=Math.hypot(s.x-p.x,s.y-p.y);if(d<min)min=d;}
    return {min,r,role:mesh.userData.rollerRole,owner:mesh.userData.ownerId};
  };
  const checks=[];
  for(const key of OFFSET10_PRINTING_UNIT_KEYS){
    const id='o10-'+key.toLowerCase();
    for(const suffix of ['blanket','impression']){
      const node=machine.findNode(id+'-'+suffix),mesh=node?.children.find(o=>o.isMesh&&Number.isFinite(o.userData.rollerRadius));
      assert.ok(mesh,id+'-'+suffix);checks.push(clearance(mesh));
    }
  }
  for(const key of OFFSET10_COATING_UNIT_KEYS){
    const id='o10-'+key.toLowerCase();
    for(const suffix of ['form','impression']){
      const node=machine.findNode(id+'-'+suffix),mesh=node?.children.find(o=>o.isMesh&&Number.isFinite(o.userData.rollerRadius));
      assert.ok(mesh,id+'-'+suffix);checks.push(clearance(mesh));
    }
  }
  for(const q of checks)assert.ok(q.min>=q.r-.004,(q.owner||'')+'/'+(q.role||'')+' centerline penetration '+(q.r-q.min).toFixed(4)+' m');
  sim.dispose();machine.dispose();
});

test('V117 Offset10 print and coating centerline passes through intended nip corridors',()=>{
  const machine=new Offset10MachineTemplate(),sim=new Offset10PrintingSimulation(machine.root,machine);
  const curveSamples=Array.from({length:1201},(_,i)=>sim.curve.getPointAt(i/1200));
  for(const key of OFFSET10_PRINTING_UNIT_KEYS){
    const x=OFFSET10_MODULE_CENTERS[key],pts=curveSamples.filter(p=>Math.abs(p.x-x)<.08);assert.ok(pts.length>0);
    const avg=pts.reduce((s,p)=>s+p.y,0)/pts.length;assert.ok(avg>1.245&&avg<1.295,key+' print nip y '+avg);
  }
  for(const key of OFFSET10_COATING_UNIT_KEYS){
    const x=OFFSET10_MODULE_CENTERS[key],pts=curveSamples.filter(p=>Math.abs(p.x-x)<.08);assert.ok(pts.length>0);
    const avg=pts.reduce((s,p)=>s+p.y,0)/pts.length;assert.ok(avg>1.285&&avg<1.330,key+' coating nip y '+avg);
  }
  sim.dispose();machine.dispose();
});
