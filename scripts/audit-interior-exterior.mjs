import fs from 'node:fs';
import * as T from 'three';
import {fileURLToPath} from 'node:url';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

export function inspectArchitecture(root,layers){
 root.updateMatrixWorld(true);const inventory=[],byLayer={},contacts=[];let invalidVertices=0;
 const bounds=o=>new T.Box3().setFromObject(o),sem=o=>o.userData?.semantic||'',find=(g,re)=>{const out=[];g.traverse(o=>{if(o.isMesh&&re.test(sem(o)))out.push(o);});return out;};
 root.traverse(o=>{
  if(!o.isMesh)return;let p=o,layer=null,visible=true,room=null,assembly=null;
  while(p){if(!p.visible)visible=false;if(!room&&p.userData?.roomLabel)room=p.userData.roomLabel;if(!assembly&&p.isGroup&&sem(p))assembly=sem(p);if(p.parent===root)layer=p.name;p=p.parent;}
  if(['machines','unidentified','labels'].includes(layer))return;
  const a=o.geometry.attributes.position,bb=new T.Box3(),instances=o.isInstancedMesh?o.count:1;
  for(let k=0;k<instances;k++){const matrix=o.matrixWorld.clone();if(o.isInstancedMesh){const im=new T.Matrix4();o.getMatrixAt(k,im);matrix.multiply(im);}
   for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(matrix);if(![v.x,v.y,v.z].every(Number.isFinite))invalidVertices++;else bb.expandByPoint(v);}
  }
  const category=layer==='landscape'||layer==='roof'?'EXTERIOR':/^IPAL/.test(sem(o))?'IPAL_CONTEXT':'INTERIOR_AND_ENVELOPE';
  const s=byLayer[layer]||={meshes:0,visible:0,instances:0,triangles:0};s.meshes++;s.visible+=Number(visible);s.instances+=instances;s.triangles+=(o.geometry.index?.count||a.count)/3*instances;
  inventory.push({semantic:sem(o)||'UNTAGGED',layer,category,room,assembly,visible,instances,min:bb.min.toArray().map(x=>+x.toFixed(6)),max:bb.max.toArray().map(x=>+x.toFixed(6)),evidence:o.userData.accuracy||'SOURCE_OR_CONTEXT_GEOMETRY_NOT_SURVEY_CERTIFIED'});
 });
 root.traverse(g=>{
  if(sem(g)==='V202_ROOM_FURNITURE_GROUP'){
   const counters=find(g,/^V202_TOILET_BASIN_COUNTER$/),bowls=find(g,/^V202_TOILET_BASIN_BOWL_REFERENCE$/);
   for(const c of counters)contacts.push({kind:'BASIN_COUNTER_OCCLUSION',room:g.userData.roomLabel,excess:bounds(c).max.y-Math.max(...bowls.map(b=>bounds(b).max.y))});
   const tables=find(g,/_WORKBENCH_TABLE_TOP$/),vises=find(g,/_BENCH_VISE$/);for(const v of vises)if(tables.length)contacts.push({kind:'VISE_SUPPORT_GAP',room:g.userData.roomLabel,gap:bounds(v).min.y-bounds(tables[0]).max.y});
   const inspections=find(g,/_INSPECTION_TABLE_TOP$/);for(const sheet of find(g,/_SAMPLE_SHEET$/))if(inspections.length)contacts.push({kind:'QC_SAMPLE_GAP',gap:bounds(sheet).min.y-bounds(inspections[0]).max.y});
   const cartons=find(g,/^V202_SPAREPART_CLOSED_CARTON_REFERENCE$/);for(const lid of find(g,/^V202_SPAREPART_CARTON_LID_REFERENCE$/)){const c=cartons.find(c=>Math.hypot(c.position.x-lid.position.x,c.position.z-lid.position.z)<.001);if(c)contacts.push({kind:'CARTON_LID_GAP',gap:bounds(lid).min.y-bounds(c).max.y});}
   for(const bench of find(g,/^V202_LOCKER_BENCH$/))contacts.push({kind:'LOCKER_BENCH_GROUND_GAP',gap:bounds(bench).min.y});
  }
  if(/^V202_.*_CHAIR_ASSEMBLY$/.test(sem(g))){
   const seat=find(g,/_CHAIR_SEAT$/)[0];if(!seat)return;
   for(const arm of find(g,/_CHAIR_ARM_POST$/))contacts.push({kind:'CHAIR_ARM_GAP',gap:Math.max(0,Math.abs(arm.position.x)-arm.scale.x/2-seat.scale.x/2)});
   for(const leg of find(g,/_CHAIR_LEG$/))contacts.push({kind:'CHAIR_LEG_GAP',gap:bounds(seat).min.y-bounds(leg).max.y});
  }
  if(sem(g)==='RMS_CUT_SHEET_STACK_REFERENCE'){
   const center=g.getWorldPosition(new T.Vector3()),near=re=>find(root,re).filter(o=>{const v=o.getWorldPosition(new T.Vector3());return Math.hypot(v.x-center.x,v.z-center.z)<.01;}),deck=near(/^RMS_BLUE_PLASTIC_PALLET_DECK_REFERENCE$/)[0],sheets=near(/^RMS_PAPER_SHEET_LAYER_REFERENCE$/).sort((a,b)=>bounds(a).min.y-bounds(b).min.y),cap=near(/^RMS_REAM_TOP_PROTECTOR_REFERENCE$/)[0];let top=bounds(deck).max.y;
   for(const sheet of sheets){contacts.push({kind:'RMS_STACK_GAP',gap:bounds(sheet).min.y-top});top=bounds(sheet).max.y;}
   contacts.push({kind:'RMS_CAP_GAP',gap:bounds(cap).min.y-top});
  }
  const stackWidths=/_MOBILE_PAPER_TROLLEY_REFERENCE$/.test(sem(g))?[1.15,.98]:/_CUT_SHEET_HANDLING_TROLLEY_REFERENCE$/.test(sem(g))?[1.16,1.03]:/_CARTON_BLANK_TROLLEY_REFERENCE$/.test(sem(g))?[1.08,.96]:null;
  if(stackWidths){const boxes=g.children.filter(o=>o.isMesh&&o.geometry.type==='BoxGeometry'),deck=boxes.find(o=>Math.abs(o.scale.x-stackWidths[0])<1e-5),sheets=boxes.filter(o=>Math.abs(o.scale.x-stackWidths[1])<1e-5).sort((a,b)=>bounds(a).min.y-bounds(b).min.y);if(deck){let top=bounds(deck).max.y;for(const sheet of sheets){contacts.push({kind:'TROLLEY_STACK_GAP',assembly:sem(g),gap:bounds(sheet).min.y-top});top=bounds(sheet).max.y;}}}
  if(/_PROOF_SAMPLE_RACK_REFERENCE$/.test(sem(g))){const trays=g.children.filter(o=>o.isMesh&&Math.abs(o.scale.x-.90)<1e-6),sheets=g.children.filter(o=>o.isMesh&&Math.abs(o.scale.x-.76)<1e-6);for(const sheet of sheets){const tray=trays.filter(t=>bounds(t).max.y<=bounds(sheet).min.y+1e-6).sort((a,b)=>bounds(b).max.y-bounds(a).max.y)[0];if(tray)contacts.push({kind:'PROOF_TRAY_SHEET_GAP',gap:bounds(sheet).min.y-bounds(tray).max.y});}}
 });
 const gate=layers.landscape.children.find(o=>o.isMesh&&Math.abs(o.position.x+9)<1e-6&&Math.abs(o.position.y-1.15)<1e-6);
 if(gate)contacts.push({kind:'GATE_POST_GAP',gap:(7-.45-gate.scale.z)/2});
 const canopyRoof=find(root,/^IPAL_PHOTO_SECONDARY_CANOPY_CORRUGATED_PANEL$/)[0],canopyContacts=[];
 if(canopyRoof){const inverse=canopyRoof.matrixWorld.clone().invert();for(const beam of find(root,/^IPAL_PHOTO_SECONDARY_CANOPY_PURLIN$/)){let highest=-Infinity;const a=beam.geometry.attributes.position;for(let i=0;i<a.count;i++)highest=Math.max(highest,new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(beam.matrixWorld).applyMatrix4(inverse).y);canopyContacts.push({semantic:sem(beam),signedRoofUndersideDistanceM:(highest+.5)*canopyRoof.scale.y});}}
 return {scope:'All non-machine architecture/context mesh vertices, including instanced plants and hidden study references. Visible counts honor every ancestor.',byLayer,invalidVertices,contacts,canopyContacts,inventory,rooms:root.userData.roomFurnitureAudit,limitations:['Source labels define room functions; furniture and exterior landscape are not an installed inventory','3D visual walk-through and installed construction evidence remain unresolved','Triangle bounds and selected contact checks do not prove absence of every intersection']};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [l,f]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);const b=buildActualFactory(l,f),report=inspectArchitecture(b.root,b.layers);
 const path=process.argv[2]||'docs/interior-exterior-audit-after-20261015.json';fs.writeFileSync(path,JSON.stringify(report)+'\n');console.log(JSON.stringify({byLayer:report.byLayer,invalidVertices:report.invalidVertices,contactViolations:report.contacts.filter(x=>x.kind==='BASIN_COUNTER_OCCLUSION'?x.excess>.001:Math.abs(x.gap)>.001).length,rooms:report.rooms.length}));
}
