const SRC=Object.freeze([
 'BMJ-MACHINE-DATABASE',
 'V123-JMM-FOLDER-BMJ',
 'V123-BOBST-MEDIA100-NEIGHBOR',
 'V123-BOBST-NOVAFOLD-PROCESS',
 'V123-BOBST-FOLD',
 'V138-BOBST-MASTERFOLD170',
 'V138-BOBST-NOVAFOLD'
]);
const rows=[];
const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='MULTI_VENDOR_FOLDER_GLUER_PROCESS_REFERENCE')=>rows.push(Object.freeze({
 id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
 confidence,verified:false,explodeVector:[level===2?.62:.12,level<4?.18:.08,0],
 explodeDistance:level===2?.82:level===3?.50:level===4?.31:level===5?.19:.11,
 focusCamera:null,description,maintenanceTag:null
}));
const root='FGM2';
add(root,null,1,'Mesin','FOLDER GLUER - 2 · FGM-2',['MACHINE-UNIVERSAL'],
 'BMJ registry verifies only the asset function/FLOC/SAP. OEM/model/serial are absent; twin uses a neutral multi-vendor folding-gluing process intersection.','BMJ_ASSET_FUNCTION_ONLY');
const unit=(code,name,mesh,desc)=>{const id=root+'.'+code;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
const chain=(u,code,n3,n4,n5,n6,mesh,desc,confidence='MULTI_VENDOR_FOLDER_GLUER_PROCESS_REFERENCE')=>{
 const a=u+'.'+code,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';
 add(a,u,3,'Sub',n3,[mesh],desc,confidence);add(b,a,4,'Block',n4,[mesh],desc,confidence);
 add(c,b,5,'Part',n5,[mesh],desc,confidence);add(d,c,6,'Spesifik Part',n6,[mesh],desc,confidence);
};

let u=unit('FEED','Blank Feeder & Separation','universal-module-1','Feeds individual carton blanks into the folding line.');
chain(u,'TABLE','Blank Stack / Feeder Table','Feeder Support Block','Blank Feed Service Group','Blank Stack Support & Side Guides','fgm2-feed-table','Neutral blank-support reference; feeder width/capacity are unknown.');
chain(u,'DRIVE','Feeder Transport','Feeder Drive Block','Feed-Belt Service Group','Feed Belts / Rollers','fgm2-feed-drive','Belt/roller feed is common process representation; vacuum/vibration hardware is not asserted.');
chain(u,'MOTOR','Feeder Section Drive','Motor / Pulley Block','Feeder Drive Service Group','Section Motor / Coupling / Pulley Reference','fgm2-feed-drive','Sectional drive reference only; exact FGM-2 motor/gear ratio is unverified.');
chain(u,'SEPARATE','Blank Separation','Separator Block','Blank Separation Group','Separator Gate / Friction Reference','fgm2-feed-separator','Single-blank separation function without claiming a specific OEM feeder technology.');

u=unit('ALIGN','Alignment & Prebreaking','universal-module-2','Aligns blank and pre-breaks fold lines.');
chain(u,'ALIGNER','Blank Alignment','Alignment Block','Alignment Service Group','Side Aligner / Guide Rail','fgm2-aligner','Blank alignment is common to industrial folder-gluers.');
chain(u,'PREBREAK','Prebreaker','Prebreak Block','Prebreaker Service Group','Right / Left Prebreak Belts & Guides','fgm2-prebreaker','Prebreaking process reference; exact tooling and angle are job-specific.');

u=unit('FOLD1','Primary Folding / Box-Style Capabilities','universal-module-3','Carries out initial folding while special box-style modules remain option-bounded.');
chain(u,'BELTS','Primary Folding Belts','Primary Fold Block','Folding Belt Service Group','Left / Right Folding Belts & Rails','fgm2-primary-fold','Common folding-belt process reference.');
chain(u,'DRIVE','Primary Fold Section Drive','Motor / Gearbox Block','Primary Fold Drive Service Group','Section Motor / Gearbox / Belt-Tension Support','fgm2-primary-fold','BOBST family references support driven belts and modular section drives; installed FGM-2 drive architecture remains unverified.');
chain(u,'LOCK','Crash-Lock Bottom Capability','Lock-Bottom Option Block','Crash-Lock Capability Group','Crash-Lock Hook / Folding Tool Envelope','fgm2-lockbottom-boundary','Crash-lock capability is common in multiple folder-gluer families but is not verified on FGM-2.','OPTION_BOUNDARY');
chain(u,'CORNER','4 / 6-Corner Capability','Corner-Fold Option Block','Corner Capability Group','4 / 6-Corner Servo / Hook Envelope','fgm2-corner-boundary','4/6-corner equipment is a family capability only; no installed configuration evidence exists.','OPTION_BOUNDARY');

u=unit('GLUE','Glue Application Boundary','universal-module-4','Applies adhesive; actual cold/hot-melt, gun/disc/wheel architecture is unknown.');
chain(u,'SUPPLY','Glue Supply','Glue Supply Block','Glue Supply Service Group','Reservoir / Pump / Hose Reference','fgm2-glue-supply','Functional adhesive-supply reference; chemistry and equipment brand are not asserted.');
chain(u,'APPLY','Glue Applicator Capability','Applicator Option Block','Glue Applicator Group','Gun / Nozzle / Disc / Wheel Capability Envelope','fgm2-glue-applicator-boundary','Media and JMM families use different glue architectures; FGM-2 installed type is unverified.','OPTION_BOUNDARY');
chain(u,'DETECT','Glue Detection Capability','Glue Inspection Option Block','Glue Detection Group','Glue-Line Sensor Capability Envelope','fgm2-glue-detection-boundary','Glue-line detection is available on some folder-gluer configurations but is not verified on FGM-2.','OPTION_BOUNDARY');

u=unit('FOLD2','Final Folding & Squaring','universal-module-5','Completes fold sequence and squares the carton before compression.');
chain(u,'BELTS','Final Folding Belts','Final Fold Block','Final Fold Service Group','Upper / Lower Folding Belts','fgm2-final-fold','Common final-fold transport reference.');
chain(u,'SQUARE','Squaring / Guide','Squaring Block','Squaring Service Group','Squaring Rails / Guide Plates','fgm2-squaring','Maintains carton geometry before compression.');

u=unit('PRESS','Compression Section','universal-module-6','Maintains pressure while adhesive sets.');
chain(u,'BELTS','Compression Conveyor','Compression Belt Block','Compression Service Group','Upper / Lower Compression Belts','fgm2-compression-belts','Compression conveyor is a common folder-gluer process stage.');
chain(u,'PRESSURE','Pressure Adjustment','Pressure Control Block','Pressure Adjustment Group','Pneumatic / Mechanical Pressure Reference','fgm2-pressure-reference','Pressure actuation architecture is not OEM/model verified.');
chain(u,'DRIVE','Compression Section Drive','Compression Drive Block','Compression Drive Service Group','Section Motor / Reducer / Tensioner / Pressure Rollers','fgm2-compression-belts','Independent compression/delivery drive concepts are family references only; exact FGM-2 hardware remains unverified.');

u=unit('OUT','Delivery & Control','universal-module-7','Discharges finished cartons and coordinates line operation.');
chain(u,'DELIVERY','Delivery Conveyor','Delivery Block','Delivery Service Group','Delivery Belts / Rollers','fgm2-delivery','Finished-carton discharge reference.');
chain(u,'DRIVE','Delivery Independent Drive Reference','Delivery Drive Block','Delivery Drive Service Group','Motor / Coupling / Box-Stream Regulator','fgm2-delivery','BOBST family references document independent delivery drive and stream regulation; BMJ FGM-2 OEM/model is unknown.');
chain(u,'COUNT','Counter / Kicker Capability','Counter Option Block','Count / Kicker Group','Counter / Kicker Capability Envelope','fgm2-counter-boundary','Kicker/counter hardware varies by machine and is unverified on FGM-2.','OPTION_BOUNDARY');
chain(u,'CONTROL','Operator Control','Control Block','HMI / Drive Control Group','Operator HMI / Main Control Reference','fgm2-control','Neutral control representation; CUBE or any JMM/OEM control system is not assigned.');
chain(u,'DOWNSTREAM','Packing / Bundling Boundary','Downstream Interface Block','Packing Interface Group','Packer / Bundler Handoff Boundary','fgm2-downstream-boundary','No downstream packing equipment is asserted as part of FGM-2.','OPTION_BOUNDARY');

export const FGM2_TAXONOMY=Object.freeze(rows);
export const FGM2_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));
