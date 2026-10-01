import {universalMachineConfig} from '../universal-machine.js';

const SPECIAL_TRUTH=Object.freeze({
 'BMJ-MCH-0002':Object.freeze({
  source3D:'DEDICATED PROCEDURAL / BMJ PHOTO-GROUNDED RECONSTRUCTION',
  dataConfidence:'IDENTITY VERIFIED / ACTUAL PHOTO GEOMETRY / CUTTER INTERNAL UNRESOLVED',
  discoveryStatus:'BMJ_ACTUAL_PHOTOSET_PRIMARY__HSM_FAMILY_PROCESS_SECONDARY',
  simulationStatus:'VERIFIED_PROCESS_MODEL'
 }),
 'BMJ-MCH-0003':Object.freeze({
  source3D:'PROCEDURAL / PHOTO + DOCUMENT GROUNDED',
  dataConfidence:'HIGH CONFIDENCE',
  discoveryStatus:'BMJ_ACTUAL_EVIDENCE_AVAILABLE',
  simulationStatus:'VERIFIED_PROCESS_MODEL'
 }),
 'BMJ-MCH-0009':Object.freeze({
  source3D:'PROCEDURAL / DOCUMENT-GROUNDED',
  dataConfidence:'HIGH CONFIDENCE',
  discoveryStatus:'OFFICIAL_DOCUMENTS_AVAILABLE',
  simulationStatus:'VERIFIED_PROCESS_MODEL'
 }),
 'BMJ-MCH-0010':Object.freeze({
  source3D:'PROCEDURAL / DATABASE + LEGACY FAMILY REFERENCES',
  dataConfidence:'IDENTITY VERIFIED / VARIANT REFERENCE',
  discoveryStatus:'SP102_FAMILY_REFERENCE_AVAILABLE',
  simulationStatus:'VERIFIED_PROCESS_MODEL'
 })
});

const UNKNOWN_PROFILE=Object.freeze({
 source3D:'UNKNOWN',dataConfidence:'UNVERIFIED',discoveryStatus:'DOCUMENTATION_REQUIRED',
 simulationStatus:'BLOCKED',dedicated:false,simulationAvailable:false
});

export function machineTruthProfile(machineOrId){
 const machineId=typeof machineOrId==='string'?machineOrId:machineOrId?.machineId;
 if(!machineId)return UNKNOWN_PROFILE;
 const special=SPECIAL_TRUTH[machineId];
 if(special)return Object.freeze({...special,dedicated:true,simulationAvailable:true});
 const config=universalMachineConfig(machineId);
 if(!config)return UNKNOWN_PROFILE;
 const simulationStatus=config.evidence.simulation;
 const dedicated=simulationStatus==='VERIFIED_PROCESS_MODEL';
 const simulationAvailable=dedicated||simulationStatus==='FAMILY_PROCESS_MODEL';
 return Object.freeze({
  source3D:dedicated
   ?'DEDICATED PROCEDURAL / '+config.evidence.geometry
   :simulationAvailable
    ?'REFERENCE PROCEDURAL / '+config.evidence.geometry
    :'PROCEDURAL / '+config.evidence.geometry,
  dataConfidence:config.evidence.grade,
  discoveryStatus:dedicated?'DEDICATED_EVIDENCE_AVAILABLE':simulationAvailable?'FAMILY_REFERENCE_AVAILABLE':'EVIDENCE_BOUNDED_REFERENCE',
  simulationStatus,
  dedicated,
  simulationAvailable
 });
}
