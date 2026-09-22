const SRC=Object.freeze([
 'BMJ-MACHINE-DATABASE','V123-ZUND-G3','V123-ZUND-S3','V123-ZUND-TOOLS','V123-ZUND-GEN3-PDF','V123-ZUND-URT','V123-ZUND-UM','V138-ZUND-VACUUM-MODULE-Z-CONTROL'
]);
const rows=[];
const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='ZUND_G3_S3_FAMILY_REFERENCE')=>rows.push(Object.freeze({
 id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
 confidence,verified:false,explodeVector:[level===2?.62:.12,level<4?.18:.08,0],
 explodeDistance:level===2?.80:level===3?.48:level===4?.30:level===5?.18:.11,focusCamera:null,description,maintenanceTag:null
}));
const root='ZUND28';
add(root,null,1,'Mesin','ZUND MACHINE',['MACHINE-UNIVERSAL'],'BMJ registry confirms Zünd brand only. Exact G3/S3/table size/module/tool package is unverified.','BMJ_BRAND_IDENTITY_ONLY');
const unit=(code,name,mesh,desc)=>{const id=root+'.'+code;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
const chain=(u,code,n3,n4,n5,n6,mesh,desc,confidence='ZUND_G3_S3_FAMILY_REFERENCE')=>{
 const a=u+'.'+code,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';
 add(a,u,3,'Sub',n3,[mesh],desc,confidence);add(b,a,4,'Block',n4,[mesh],desc,confidence);
 add(c,b,5,'Part',n5,[mesh],desc,confidence);add(d,c,6,'Spesifik Part',n6,[mesh],desc,confidence);
};

let u=unit('TABLE','Vacuum Cutting Table','universal-module-1','Flatbed vacuum hold-down platform; exact G3/S3 table size and vacuum architecture unknown.');
chain(u,'BED','Vacuum Bed','Table Vacuum Block','Vacuum Bed Service Group','Perforated / Acrylic Vacuum Surface Reference','zund-vacuum-bed','G3/S3 both use vacuum hold-down; exact bed construction depends on model.');
chain(u,'ZONE','Vacuum Zone / Distribution','Vacuum Distribution Block','Vacuum Zone Service Group','Vacuum Zone / Valve Reference','zund-vacuum-zones','Zone architecture is family-level; individual-zone topology on BMJ asset unverified.');

u=unit('GANTRY','X-Axis Travelling Beam','universal-module-2','Precision travelling beam / gantry.');
chain(u,'GUIDE','Beam Linear Motion','X-Axis Guide Block','Beam Motion Service Group','Linear Guide / Rack Reference','zund-gantry-guide','Precision X-axis family representation; exact drive technology/model-specific arrangement unverified.');
chain(u,'XDRIVE','Gantry Drive Service Chain','Servo / Rack-Pinion Block','Gantry Drive Service Group','Servo / Pinion / Linear-Bearing Reference','zund-gantry-guide','Drive components are functional service references; exact G3/S3 drive package on BMJ unit remains unverified.');
chain(u,'BEAM','Travelling Beam','Beam Structure Block','Beam Service Group','Gantry Beam / Carriage Rail','zund-gantry-beam','Common modular cutter travelling-beam architecture.');

u=unit('CARRIAGE','Y/Z Tool Carriage & Module Slots','universal-module-3','Tool carriage with modular carrier positions.');
chain(u,'Y','Carriage Traverse','Y-Axis Motion Block','Carriage Traverse Service Group','Carriage Linear Guide / Drive Reference','zund-carriage-y','Cross-beam carriage motion reference.');
chain(u,'SLOTS','Module Carrier Slots','Module Carrier Block','Module Interface Group','Universal Module Carrier / Tool Detection Reference','zund-module-slots','Zünd modular carriers accept multiple tool families; exact installed modules are unknown.');
chain(u,'ZACT','Module Z Pressure / Position Actuation','Module Z-Axis Block','Module Z Service Group','Z Actuator / Tool Detection / Bayonet Interface','zund-module-slots','Universal Module supports tool detection plus pressure/position modes; installed module version and tool remain unknown.');

u=unit('TOOLS','Installed Tool Package Boundary','universal-module-4','Tool heads are configurable and must not be assumed installed.');
chain(u,'CUT','Knife / Oscillating Tool Capability','Cutting Tool Option Block','Cutting Tool Capability Group','UCT / EOT / POT Family Boundary','zund-cut-tool-option','Compatible cutting tools are documented across G3/S3 but BMJ installed tool is unverified.','OPTION_BOUNDARY');
chain(u,'CREASE','Creasing Capability','Creasing Option Block','Creasing Capability Group','CTT Family Boundary','zund-crease-option','Creasing tools are selectable options, not installed claims.','OPTION_BOUNDARY');
chain(u,'ROUTER','Routing Capability','Router Option Block','Routing Capability Group','URT / RM Family Boundary','zund-router-option','Routing modules and URT are supported family options; installed spindle/module is unverified.','OPTION_BOUNDARY');
chain(u,'ARC','Automatic Router Bit Changer Capability','ARC Option Block','ARC Capability Group','ARC Magazine / Tool-Changer Boundary','zund-arc-option','ARC is a documented routing automation option, not an installed BMJ claim.','OPTION_BOUNDARY');

u=unit('SENSE','Registration / Initialization Boundary','universal-module-5','Registration camera and tool initialization capabilities vary by configuration.');
chain(u,'ICC','Camera Registration Capability','ICC Option Block','Registration Capability Group','ICC Camera / Lighting Reference','zund-icc-option','Camera registration is available in Zünd systems but installed camera package is unverified.','OPTION_BOUNDARY');
chain(u,'ITI','Tool Initialization Capability','Initialization Option Block','Tool Setup Capability Group','ITI / Initialization Pad Reference','zund-iti-option','Automated initialization is documented in S3 family and Zünd ecosystem; exact BMJ implementation unverified.','OPTION_BOUNDARY');

u=unit('CTRL','Operator / Vacuum / Material Handling','universal-module-6','Control console, vacuum generation and material-handling boundary.');
chain(u,'HMI','Operator Console','Control Console Block','Operator Interface Group','Display / Control Reference','zund-control','Family-level operator control representation.');
chain(u,'VAC','Vacuum Generator Interface','Vacuum Supply Block','Vacuum Generator Group','Vacuum Generator / Duct Interface','zund-vacuum-generator','Supplies table hold-down; exact pump/blower installation unverified.');
chain(u,'VACCTRL','Vacuum Hold-Down Control Chain','Vacuum Control Block','Vacuum Service Group','Control Valve / Pressure Sensor / Manifold / Zone Branches','zund-vacuum-generator','Zünd family documents adjustable vacuum hold-down; exact BMJ zone topology and generator model are not inferred.');
chain(u,'HANDLING','Conveyor / Roll-Off / Tandem Boundary','Material Handling Option Block','Material Handling Capability Group','Conveyor / Roll-Off / Tandem Family Boundary','zund-handling-option','Material-handling automation depends on model/configuration and is not asserted on BMJ asset.','OPTION_BOUNDARY');

export const ZUND_TAXONOMY=Object.freeze(rows);
export const ZUND_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));
