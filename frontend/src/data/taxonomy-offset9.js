import {OFFSET9_MODULE_SEQUENCE} from './dimensions-offset9.js';

const rows=[];
const SRC=Object.freeze(['BMJ-ASSET-REGISTRY','SX52-OFFICIAL-PRODUCT-BROCHURE','SX52-OFFICIAL-TECHNICAL-DATA','SX52-CONFIGURATION-BOUNDARY']);
const add=(id,name,level,parentId,meshRefs=[],kind='assembly',description='',confidence='OFFICIAL_FAMILY_REFERENCE',verified=false)=>rows.push(Object.freeze({
 id,name,level,parentId,meshRefs:Object.freeze(meshRefs),kind,description,sourceRefs:SRC,confidence,verified,
 explodeVector:[level===2?.60:.12,level<4?.18:.08,0],explodeDistance:level===2?.78:level===3?.48:level===4?.30:level===5?.18:.11,focusCamera:null,maintenanceTag:null
}));
const chain=(parent,code,n4,n5,n6,ref,desc,confidence='OFFICIAL_FAMILY_REFERENCE')=>{
 const l4=parent+'.'+code,l5=l4+'.PART',l6=l5+'.SPEC';
 add(l4,n4,4,parent,[ref],'system',desc,confidence);
 add(l5,n5,5,l4,[ref],'component',desc,confidence);
 add(l6,n6,6,l5,[ref],'part',desc,confidence);
};

add('O9','Offset 9 · Speedmaster SX 52-4+L',1,null,['offset9-root'],'machine','BMJ registry verifies SX 52-4+L, serial GS001804, year 2024 and SAP OFS-9. Serial-specific option package remains bounded.','BMJ_IDENTITY_VERIFIED',true);

for(const [id,name,ref,desc] of [
 ['FEED','Feeder & Sheet Register','offset9-feeder','Sheet separation, central suction-tape transport, Venturi-assisted infeed and register.'],
 ['PRINT','Four Printing Units','offset9-print','Four straight-print offset units recorded by BMJ.'],
 ['COAT','Inline Coating Unit','offset9-coat','Installed +L coating section recorded by BMJ; chamber-blade family architecture.'],
 ['DELIVERY','Delivery','offset9-delivery','Gripper-chain delivery, Venturi sheet guidance, braking and pile; pile-height option unverified.'],
 ['CONTROL','Prinect Press Console','offset9-console','Operator console family representation; exact console generation/options unverified.'],
 ['ACCESS','Frames, Guards & Access','offset9-access','Machine base, frames, guard rails and service-access representation.']
])add('O9.'+id,name,2,'O9',[ref],'unit',desc,id==='PRINT'||id==='COAT'?'BMJ_CONFIGURATION_VERIFIED':'OFFICIAL_FAMILY_REFERENCE',id==='PRINT'||id==='COAT');

let base='O9.FEED';
add(base+'.PILE','Pile Lift & Pallet Table',3,base,['offset9-feeder-pile'],'subassembly','Pile support and lifting interface.');
chain(base+'.PILE','LIFT','Pile Lift Mechanism','Pile Lift Assembly','Pile Board / Lift-Chain Interface','offset9-feeder-pile','Pile support and lifting reference; exact chain/sensor package not serial-verified.');
add(base+'.HEAD','Suction Head & Sheet Separation',3,base,['offset9-feeder-head'],'subassembly','Suction feet separate the top sheet from feeder pile.');
chain(base+'.HEAD','SUCKER','Suction Feet','Suction Foot Assembly','Suction Cup / Vertical Pickup Element','offset9-feeder-head','Sheet pickup mechanism family reference.');
add(base+'.REGISTER','Feedboard & Register',3,base,['offset9-register'],'subassembly','Central suction tape and register section.');
chain(base+'.REGISTER','TAPE','Central Suction Tape','Suction-Tape Drive','Central Suction Belt & Wheels','offset9-register-suction-tape','Official SX 52 central suction-tape infeed principle.');
chain(base+'.REGISTER','VENTURI','Venturi Infeed','Venturi Air Assist','Venturi Nozzles','offset9-register-venturi','Official Venturi-assisted sheet infeed principle.');
chain(base+'.REGISTER','LAYS','Front & Side Register Lays','Register-Lay Assembly','Front / Side Lay Contact Elements','offset9-register-lays','Sheet-position register reference.');

for(const m of OFFSET9_MODULE_SEQUENCE.filter(m=>m.type==='print')){
 const ref='offset9-'+m.key.toLowerCase(),pu='O9.PRINT.'+m.key;
 add(pu,m.label,3,'O9.PRINT',[ref],'printing-unit','Installed printing unit in BMJ 4-color configuration.','BMJ_CONFIGURATION_VERIFIED',true);
 chain(pu,'FRAME','Paired Side Frames','Printing-Unit Frame','Side-Frame / Bearing Support Structure',ref+'-frame','Structural frame reference.');

 chain(pu,'INK','Speed-Compensated Inking','Inking Roller Train','Inking Working Roller Reference',ref+'-inking','Speed-compensated inking is official family architecture; represented roller count is not serial-verified.');
 chain(pu,'FOUNTAIN','Remote-Controlled Ink Fountain','Ink Fountain & Liner','Ink Fountain Liner / Metering Interface',ref+'-ink-fountain','Official Heidelberg remote-controlled ink fountain with liner; exact zone count not asserted.');
 chain(pu,'DAMP','Alcolor Film Dampening / Vario','Dampening Roller Train','Alcolor / Vario Working Element',ref+'-dampening','Official Alcolor film dampening with Vario family feature; represented roller count not serial-verified.');
 chain(pu,'PLATE','Plate Cylinder','Plate-Cylinder Assembly','Plate Surface / Clamp Interface',ref+'-plate','Official SX 52 plate-cylinder dimensions; serial-specific condition not inferred.');
 chain(pu,'AUTOPLATE','AutoPlate Interface','Semi-Automatic Plate-Change Assembly','AutoPlate Clamp / Guide Reference',ref+'-autoplate','AutoPlate is an SX 52 family feature; installed option on GS001804 remains unverified.');
 chain(pu,'BLANKET','Blanket Cylinder','Blanket-Cylinder Assembly','Blanket / Wash Interface',ref+'-blanket','Blanket cylinder is process-grounded; automatic washup is family capability only unless serial-confirmed.');
 chain(pu,'IMPRESSION','Impression Cylinder','Impression-Cylinder Assembly','Impression Surface / Jacket Interface',ref+'-impression','Offset impression-cylinder process reference.');
 chain(pu,'TRANSFER','Transfer Cylinder & Grippers','Sheet-Transfer Assembly','Transfer Cylinder / Gripper Bridge',ref+'-transfer','Sheet transfer between units.');
 chain(pu,'JACKET','TransferJacket Blue Family Reference','Sheet-Transfer Surface','TransferJacket Surface Reference',ref+'-transfer-jacket','TransferJacket Blue is documented for SX 52 family; installed jacket variant on GS001804 is unverified.','OPTION_BOUNDARY');
}

const coat='O9.COAT.L';
add(coat,'Inline Coating Unit',3,'O9.COAT',['offset9-l'],'coating-unit','BMJ +L configuration verified; exact installed coating consumables/options remain serial-specific.','BMJ_CONFIGURATION_VERIFIED',true);
chain(coat,'SUPPLY','Coating Circulation Interface','Coating Supply Assembly','Supply / Return Interface','offset9-l-supply','Coating supply/circulation functional interface.');
chain(coat,'ANILOX','Anilox Metering','Anilox Roller Assembly','Anilox Surface / Bearing Reference','offset9-l-meter','Chamber-blade coating architecture uses anilox metering; exact screen specification unverified.');
chain(coat,'CHAMBER','Chamber Doctor-Blade System','Chamber-Blade Assembly','Metering Blade / Sealing Blade / End Seal','offset9-l-chamber','Official chamber-blade coating family architecture.');
chain(coat,'FORM','Coating Plate / Blanket Cylinder','Coating Form Assembly','Coating Plate / Blanket Surface','offset9-l-form','Official SX 52 coating plate/blanket technical dimensions available; installed consumable type unverified.');
chain(coat,'IMPRESSION','Coating Impression Cylinder','Coating Impression Assembly','Impression Surface','offset9-l-impression','Supports transfer of coating to sheet.');

base='O9.DELIVERY';
add(base+'.CHAIN','Gripper-Chain Transport',3,base,['offset9-delivery-chain'],'subassembly','Closed-loop gripper-chain transport reference.');
chain(base+'.CHAIN','DRIVE','Chain Drive','Chain / Sprocket Assembly','Chain Rail / Sprocket','offset9-delivery-chain','Delivery chain transport reference.');
add(base+'.GRIPPER','Delivery Gripper Bars',3,base,['offset9-delivery-grippers'],'subassembly','Gripper bars carry sheets through delivery loop.');
chain(base+'.GRIPPER','BAR','Gripper Bars','Gripper-Bar Assembly','Gripper Fingers / Chain Attachment','offset9-delivery-grippers','Delivery gripper-bar family reference.');
add(base+'.GUIDE','High-Pile Venturi Sheet Guidance · Option Boundary',3,base,['offset9-delivery-guide'],'subassembly','High-pile delivery family feature; BMJ standard versus high-pile option is not verified.','OPTION_BOUNDARY');
chain(base+'.GUIDE','VENTURI','High-Pile Venturi Guide Plate','Air-Guidance Assembly','Venturi Nozzles / Air Manifold','offset9-delivery-guide','Official SX 52 high-pile Venturi delivery principle; intentionally not treated as installed on GS001804.','OPTION_BOUNDARY');
add(base+'.BRAKE','Sheet Brake & Release',3,base,['offset9-delivery-brake'],'subassembly','Controlled deceleration before pile release.');
chain(base+'.BRAKE','BRAKE','Sheet Brake','Brake Assembly','Brake Wheel / Release Interface','offset9-delivery-brake','Sheet braking family reference; exact brake-belt/sensor package not asserted.');
add(base+'.PILE','Delivery Pile Lift',3,base,['offset9-delivery-stack'],'subassembly','Receives completed sheets.');
chain(base+'.PILE','LIFT','Pile Lift','Pile-Lift Assembly','Pile Board / Lift Interface','offset9-delivery-stack','Standard versus high-pile BMJ option is unverified.');

base='O9.CONTROL';
add(base+'.CONSOLE','Prinect Press Center 3 · Family Reference',3,base,['offset9-console'],'subassembly','Press Center 3 appears in SX 52 family documentation; GS001804 controller generation remains unverified.','OPTION_BOUNDARY');
chain(base+'.CONSOLE','HMI','Operator Interface','Console HMI Assembly','24-inch Multi-Touch Display · Family Reference','offset9-console','Prinect Press Center 3 family control-station reference; exact installed generation on BMJ asset is unverified.','OPTION_BOUNDARY');

base='O9.ACCESS';
add(base+'.FRAME','Base / Frame / Guarding',3,base,['offset9-access'],'subassembly','Machine supporting frame and guarding.');
chain(base+'.FRAME','GUARD','Safety Guarding','Guard / Rail Assembly','Guard Rail / Service Access Reference','offset9-access','Visualization of safety/access envelope; not engineering guard dimensions.');

export const OFFSET9_TAXONOMY=Object.freeze(rows);
export const OFFSET9_TAXONOMY_BY_ID=new Map(rows.map(node=>[node.id,node]));
export const offset9TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(node=>node.level===level).length]))});
