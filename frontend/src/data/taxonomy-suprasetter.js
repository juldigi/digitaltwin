const ASSETS=Object.freeze({
 'BMJ-MCH-0025':{no:25,label:'CTP HEIDELBERG MACHINE · CTP-1',sap:'CTP-1'},
 'BMJ-MCH-0026':{no:26,label:'CTP HEIDELBERG MACHINE · CTP-2',sap:'CTP-2'}
});
const SRC=Object.freeze(['BMJ-MACHINE-DATABASE','V123-SUPRA-A75','V123-SUPRA-A106','V123-SUPRA-TECH','V123-SUPRA-A52A75-GUIDE']);
const rowsFor=machineId=>{
 const a=ASSETS[machineId];if(!a)return [];
 const root='CTP'+a.no,rows=[];
 const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='SUPRASETTER_FAMILY_PRIMARY')=>rows.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
  confidence,verified:false,explodeVector:[level===2?.58:.12,level<4?.18:.08,0],
  explodeDistance:level===2?.76:level===3?.46:level===4?.29:level===5?.18:.11,focusCamera:null,description,maintenanceTag:null
 }));
 const unit=(code,name,mesh,desc)=>{const id=root+'.'+code;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
 const chain=(u,code,n3,n4,n5,n6,mesh,desc,conf='SUPRASETTER_FAMILY_PRIMARY')=>{
  const x=u+'.'+code,y=x+'.BLOCK',z=y+'.PART',w=z+'.SPEC';
  add(x,u,3,'Sub',n3,[mesh],desc,conf);add(y,x,4,'Block',n4,[mesh],desc,conf);
  add(z,y,5,'Part',n5,[mesh],desc,conf);add(w,z,6,'Spesifik Part',n6,[mesh],desc,conf);
 };
 add(root,null,1,'Mesin',a.label,['MACHINE-UNIVERSAL'],'BMJ registry confirms Heidelberg CTP identity only; exact Suprasetter model/format/loader package remains unknown.','BMJ_BRAND_IDENTITY_ONLY');

 let u=unit('LOAD','Plate Input / Loader Boundary','universal-module-1','Common manual entry plus bounded automatic-loader family capabilities.');
 chain(u,'MANUAL','Manual Plate Entry','Manual Entry Block','Plate Entry Service Group','Plate Support / Entry Guides','ctp-manual-entry','Manual basic-unit entry is represented without assigning a specific A52/A75/A106 format.');
 chain(u,'LOADER','Automatic Loader Capability Boundary','Loader Option Block','Loader Capability Group','ATL / DTL / ACL / DCL / APL Family Boundary','ctp-loader-boundary','Loader types vary strongly by Suprasetter model and are not verified on either BMJ CTP.','OPTION_BOUNDARY');

 u=unit('TRANSPORT','Plate Transport & Registration','universal-module-2','Plate transport from entry to imaging drum.');
 chain(u,'ROLLERS','Plate Transport','Transport Roller Block','Plate Transport Service Group','Transport Rollers / Guides','ctp-transport','Common plate handling path; exact roller count and loader-specific transport geometry remain unknown.');
 chain(u,'REGISTER','Plate Positioning','Register / Position Block','Plate Position Service Group','Plate Presence / Position Sensor Reference','ctp-register','Functional registration/sensing reference, not a serial-specific sensor claim.');

 u=unit('DRUM','External Imaging Drum','universal-module-3','External-drum Suprasetter imaging architecture.');
 chain(u,'BODY','Imaging Drum','External Drum Block','Drum Service Group','External Imaging Drum Surface','ctp-drum','External imaging drum is a Suprasetter family process reference.');
 chain(u,'CLAMP','Plate Clamping','Drum Clamp Block','Plate Clamp Service Group','Leading / Trailing Clamp Reference','ctp-drum-clamp','Plate retention on drum; exact clamp mechanism remains family-level.');

 u=unit('LASER','HEIDELBERG Thermal Laser / IDS','universal-module-4','HEIDELBERG-developed laser family with Intelligent Diode System.');
 chain(u,'RAIL','Laser Carriage','Laser Traverse Block','Laser Carriage Service Group','Linear Rail / Carriage','ctp-laser-rail','Laser carriage traverses imaging area in the family representation.');
 chain(u,'MODULE','Laser Modules','Laser Module Block','Laser Module Service Group','HEIDELBERG Laser Module Reference','ctp-laser-module','Module count depends on exact Suprasetter model/productivity configuration and is not inferred.');
 chain(u,'IDS','Intelligent Diode System','IDS Reliability Block','Laser Reliability Group','IDS Diode Redundancy Reference','ctp-ids','HEIDELBERG documents IDS across Suprasetter family; number of active diodes/modules is not asserted.');

 u=unit('PUNCH','Internal Punch Capability','universal-module-5','Internal punching is an optional family capability and must not animate unless BMJ installation is verified.');
 chain(u,'OPTION','Internal Punch Option Boundary','Punch Option Block','Punch Capability Group','Internal Punch Pair Reference','ctp-punch-option','Available punch pairs depend on Suprasetter model. Installation on CTP-1/2 is unverified.','OPTION_BOUNDARY');

 u=unit('OUT','Unload / Environmental Options','universal-module-6','Plate unload plus model-dependent debris and temperature-control capabilities.');
 chain(u,'UNLOAD','Plate Unload','Unload Path Block','Plate Unload Service Group','Unload Guides / Processor Handoff','ctp-unload','Common output path toward processor/stacker boundary.');
 chain(u,'PROCESSOR','Processor / Stacker Boundary','Downstream Interface Block','Downstream Handoff Group','Processor / Stacker Interface','ctp-processor-boundary','No exact online processor or stacker is verified for the BMJ assets.','OPTION_BOUNDARY');
 chain(u,'DEBRIS','Debris Removal Capability','Debris Option Block','Vacuum / Filter Capability Group','Debris Vacuum / Filter Reference','ctp-debris-option','Optional debris-removal system is documented on A75 and family variants; installation is unverified.','OPTION_BOUNDARY');
 chain(u,'TEMP','Temperature Stabilization Capability','Temperature Option Block','Temperature Control Capability Group','Temperature Stabilizer Reference','ctp-temp-stabilizer-option','A106/106 documents integrated temperature stabilization; exact BMJ model is unknown so this remains a capability boundary.','OPTION_BOUNDARY');

 return rows;
};
export const suprasetterTaxonomyFor=machineId=>Object.freeze(rowsFor(machineId));
export const suprasetterTaxonomyById=machineId=>new Map(suprasetterTaxonomyFor(machineId).map(n=>[n.id,n]));
