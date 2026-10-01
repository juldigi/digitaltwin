import * as THREE from 'three';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {OFFSET10_DIMENSIONS} from '../frontend/src/data/dimensions-offset10.js';
import {APM2_DIMENSIONS} from '../frontend/src/data/dimensions-apm2.js';
import {FZ1200_SPEC} from '../frontend/src/data/dimensions-fz1200.js';
import {MK1060_SPEC} from '../frontend/src/data/dimensions-mk1060.js';
import {POLAR115_SPEC} from '../frontend/src/data/dimensions-polar115.js';
import {DIANA_EYE55_SPEC} from '../frontend/src/data/dimensions-diana-eye55.js';
import {SHARK_N650_SPEC} from '../frontend/src/data/dimensions-shark-n650.js';
import {UPG_LY300_SPEC} from '../frontend/src/data/dimensions-upg-ly300.js';

const contracts=Object.freeze([
 {id:'BMJ-MCH-0001',label:'POLAR 115 EM-MON',reference:POLAR115_SPEC.referenceEnvelopeM,tolerance:[.55,1.65],evidence:'FAMILY_ARCHIVE_REFERENCE'},
 {id:'BMJ-MCH-0007',label:'FZ1200 #1',reference:FZ1200_SPEC.exactModelPublicReference.envelopeM,tolerance:[.55,1.65],evidence:'EXACT_MODEL_PUBLIC_REFERENCE'},
 {id:'BMJ-MCH-0008',label:'FZ1200 #3',reference:FZ1200_SPEC.exactModelPublicReference.envelopeM,tolerance:[.55,1.65],evidence:'EXACT_MODEL_PUBLIC_REFERENCE'},
 {id:'BMJ-MCH-0022',label:'FZ1200 #2',reference:FZ1200_SPEC.exactModelPublicReference.envelopeM,tolerance:[.55,1.65],evidence:'EXACT_MODEL_PUBLIC_REFERENCE'},
 {id:'BMJ-MCH-0010',label:'BOBST SP102',reference:[APM2_DIMENSIONS.layout.bodyLength,APM2_DIMENSIONS.layout.bodyWidth,APM2_DIMENSIONS.layout.bodyHeight],tolerance:[.65,1.55],evidence:'FAMILY_RANGE_FITTED_LAYOUT'},
 {id:'BMJ-MCH-0013',label:'MK1060ER',reference:[MK1060_SPEC.manual2013Reference.envelopeM[0],MK1060_SPEC.manual2013Reference.envelopeM[1],2.50],tolerance:[.65,1.50],evidence:'MODEL_OFFICIAL_REFERENCE'},
 {id:'BMJ-MCH-0019',label:'DIANA EYE 55',reference:DIANA_EYE55_SPEC.officialCurrentEnvelopeM.standardFeederFishScaleDelivery,tolerance:[.60,1.55],evidence:'CURRENT_FAMILY_CONFIGURATION'},
 {id:'BMJ-MCH-0020',label:'FS-SHARK N650',reference:[SHARK_N650_SPEC.modeledEnvelopeReferenceM.length,SHARK_N650_SPEC.modeledEnvelopeReferenceM.width,SHARK_N650_SPEC.modeledEnvelopeReferenceM.height],tolerance:[.60,1.55],evidence:'OEM_FISH_SCALE_OFFLINE_REFERENCE'},
 {id:'BMJ-MCH-0024',label:'UPG-LY300',reference:UPG_LY300_SPEC.envelopeM,tolerance:[.70,1.45],evidence:'EXACT_MODEL_OEM_REFERENCE'},
 {id:'BMJ-MCH-0009',label:'OFFSET 10 CX104',reference:[OFFSET10_DIMENSIONS.verified.baseReferenceLength,OFFSET10_DIMENSIONS.layout.structuralWidth,OFFSET10_DIMENSIONS.layout.foilStarTopY],tolerance:[.78,1.32],evidence:'BMJ_FINAL_DRAWING'}
]);

export function auditDedicatedDimensionEnvelopes(){
 const machines=[],failures=[];
 for(const contract of contracts){
  let template;
  try{
   template=createPolishedMachineTemplate(contract.id);template.root.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(template.root),size=box.getSize(new THREE.Vector3());
   const modeled=[size.x,size.z,size.y],ratios=modeled.map((value,index)=>value/contract.reference[index]);
   const [min,max]=contract.tolerance,problems=[];
   if(ratios.some(r=>!Number.isFinite(r)))problems.push('NON_FINITE_RATIO');
   if(ratios.some(r=>r<min||r>max))problems.push('REFERENCE_ENVELOPE_SCALE_DRIFT');
   const row={...contract,modeled:modeled.map(v=>+v.toFixed(3)),ratios:ratios.map(v=>+v.toFixed(3)),problems};
   machines.push(row);if(problems.length)failures.push(row);
  }catch(error){const row={...contract,problems:['EXCEPTION'],error:String(error?.stack||error)};machines.push(row);failures.push(row);}
  finally{template?.dispose?.();}
 }
 return {total:contracts.length,passed:contracts.length-failures.length,failed:failures.length,machines,failures};
}
