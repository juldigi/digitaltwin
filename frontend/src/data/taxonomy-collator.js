const SRC=Object.freeze([
 'BMJ-MACHINE-DATABASE',
 'V123-HORIZON-VAC1000',
 'V123-HORIZON-VAC600H',
 'V123-DUPLO-DSC1060I',
 'V123-VERTICAL-COLLATOR-PATENT'
]);
const rows=[];
const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='MULTI_VENDOR_SUCTION_COLLATOR_PROCESS_REFERENCE')=>rows.push(Object.freeze({
 id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,confidence,verified:false,
 explodeVector:[level===2?.55:.12,level<4?.18:.08,0],explodeDistance:level===2?.72:level===3?.44:level===4?.28:level===5?.17:.10,
 focusCamera:null,description,maintenanceTag:null
}));
const root='COLLATOR';
add(root,null,1,'Mesin','COLLATOR MACHINE',['MACHINE-UNIVERSAL'],'BMJ registry contains no OEM/model/serial. Twin is a cross-family vertical air-suction collator process reference; modeled 10-bin tower is not an installed-count claim.','BMJ_IDENTITY_FUNCTION_ONLY');
const unit=(code,name,mesh,desc)=>{const id=root+'.'+code;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
const chain=(u,code,n3,n4,n5,n6,mesh,desc,confidence='MULTI_VENDOR_SUCTION_COLLATOR_PROCESS_REFERENCE')=>{
 const a=u+'.'+code,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';
 add(a,u,3,'Sub',n3,[mesh],desc,confidence);add(b,a,4,'Block',n4,[mesh],desc,confidence);
 add(c,b,5,'Part',n5,[mesh],desc,confidence);add(d,c,6,'Spesifik Part',n6,[mesh],desc,confidence);
};

let u=unit('TOWER','Modular Feed-Bin Tower','universal-module-1','Vertical modular tower; displayed ten bins are a cross-family visualization reference only.');
chain(u,'TRAYS','Feed Bin Trays','Tray Support Block','Bin Tray Service Group','Adjustable Sheet Tray / Side Guides','collator-bin-trays','Individual sheet stacks are loaded into vertically arranged trays.');
chain(u,'ROTORS','Suction Rotor Feed Modules','Rotor Feed Block','Suction Feed Service Group','Per-Bin Suction Rotor / Feed Belt','collator-suction-feeds','Cross-family suction-rotor principle separates and feeds one sheet from each selected bin.');
chain(u,'AIR','Per-Bin Air Separation','Air-Blow Block','Bin Air Service Group','Air-Blow Nozzle / Separation Flow','collator-bin-air','Individual air/blow assists sheet separation; installed hardware layout unverified.');

u=unit('VAC','Vacuum / Air Supply','universal-module-2','Vacuum/blower package and distribution to feed bins.');
chain(u,'BLOWER','Vacuum Blower','Vacuum Generation Block','Vacuum Service Group','Vacuum Blower / Pump Reference','collator-vacuum-blower','Provides suction for rotor/feed modules.');
chain(u,'MANIFOLD','Vacuum Manifold','Distribution Block','Vacuum Distribution Group','Main Manifold / Bin Branch Lines','collator-vacuum-manifold','Distributes suction to modeled feed bins.');

u=unit('SENSE','Sheet Sensing & Feed Integrity','universal-module-3','Detection layer for feed errors and bin condition.');
chain(u,'DOUBLE','Double / Miss Feed Detection','Feed Integrity Block','Double-Feed Sensor Group','High-Power / Optical Feed Sensor Reference','collator-double-feed','Official families document double-feed detection; sensor technology on BMJ asset is unknown.');
chain(u,'EMPTY','Bin Empty / Sheet Presence','Bin Status Block','Presence Sensor Group','Bin-Empty / Sheet-Presence Sensor','collator-bin-empty','Functional sensor reference; installed sensor type unverified.');

u=unit('GATHER','Vertical Gathering Transport','universal-module-4','Sheets from active bins merge into a common downward/gathering path.');
chain(u,'GUIDE','Gathering Guide Channel','Vertical Guide Block','Gather Guide Service Group','Guide Plates / Transport Channel','collator-gather-guide','Controls sheet path into the common gathering transport.');
chain(u,'DRIVE','Gathering Drive','Transport Drive Block','Gather Transport Group','Drive Rollers / Belt Reference','collator-gather-drive','Moves collated sheets toward delivery.');

u=unit('OUT','Set Delivery / Handoff','universal-module-5','Completed set exits toward stacker/jogger or downstream finisher boundary.');
chain(u,'BELT','Delivery Conveyor','Output Conveyor Block','Delivery Transport Group','Delivery Belts / Rollers','collator-delivery-belt','Transfers the collated set from tower.');
chain(u,'JOG','Set Jogging','Jogger Block','Set Alignment Group','Side / Tail Jogger Reference','collator-set-jogger','Aligns completed sets before handoff.');
chain(u,'BOUNDARY','Downstream Finisher Boundary','Interface Block','Downstream Interface Group','Stacker / Stitcher Handoff Boundary','collator-downstream-boundary','No downstream stitcher/stacker is asserted as installed on the BMJ collator.','OPTION_BOUNDARY');

u=unit('CTRL','Touchscreen / Control','universal-module-6','Operator interface, sequence control and fault monitoring.');
chain(u,'HMI','Operator Touchscreen','HMI Block','Operator Interface Group','Touchscreen / Job Sequence Control','collator-hmi','Touchscreen is common to modern suction collator families; exact BMJ controller unverified.');
chain(u,'IO','Bin Control / I-O','Control I-O Block','Bin Control Group','Bin Enable / Feed Fault I-O Reference','collator-control-io','Coordinates per-bin feed enable and feed-error status.');

export const COLLATOR_TAXONOMY=Object.freeze(rows);
export const COLLATOR_TAXONOMY_BY_ID=new Map(COLLATOR_TAXONOMY.map(n=>[n.id,n]));
