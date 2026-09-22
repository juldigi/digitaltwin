const SRC=Object.freeze([
 'BMJ-MACHINE-DATABASE',
 'V123-SCREEN-KATANA5000',
 'V123-SCREEN-FTR3035-3050',
 'V123-SCREEN-FTR3050-USED',
 'V123-SCREEN-KATANA5055-INSTALLED','V139-SCREEN-DRIVE-INTERLOCK'
]);
const rows=[];
const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='SCREEN_FTR_KATANA_FAMILY_REFERENCE')=>rows.push(Object.freeze({
 id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
 confidence,verified:false,explodeVector:[level===2?.58:.12,level<4?.18:.08,0],
 explodeDistance:level===2?.76:level===3?.46:level===4?.29:level===5?.18:.11,
 focusCamera:null,description,maintenanceTag:null
}));
const root='CTF27';
add(root,null,1,'Mesin','CTF IMAGESETTER SCREEN MACHINE',['MACHINE-UNIVERSAL'],
 'BMJ registry confirms SCREEN imagesetter identity but no exact model/serial. Twin uses process intersection of FT-R/Katana capstan/polygon-mirror families.','BMJ_BRAND_IDENTITY_ONLY');
const unit=(code,name,mesh,desc)=>{const id=root+'.'+code;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
const chain=(u,code,n3,n4,n5,n6,mesh,desc,confidence='SCREEN_FTR_KATANA_FAMILY_REFERENCE')=>{
 const a=u+'.'+code,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';
 add(a,u,3,'Sub',n3,[mesh],desc,confidence);add(b,a,4,'Block',n4,[mesh],desc,confidence);
 add(c,b,5,'Part',n5,[mesh],desc,confidence);add(d,c,6,'Spesifik Part',n6,[mesh],desc,confidence);
};

let u=unit('SUPPLY','Media Cassette / Supply','universal-module-1','Roll-media loading and automatic feed boundary.');
chain(u,'CASSETTE','Media Supply Cassette','Cassette Support Block','Media Supply Service Group','Roll Media Cassette / Spindle Reference','ctf-media-cassette','FT-R/Katana families use roll media; exact cassette dimensions and media widths depend on model.');
chain(u,'BRAKE','Supply Roll Brake / Tension Boundary','Supply Brake Block','Supply Tension Service Group','Brake / Brake Actuator Reference','ctf-media-cassette','Functional media-tension reference only; exact brake architecture on BMJ unit is unverified.');
chain(u,'LOAD','Automatic Media Loading','Media Load Block','Media Entry Service Group','Automatic Feed / Entry Guide','ctf-auto-load','Automatic material loading is documented on FT-R family references.');

u=unit('TRANSPORT','Capstan Transport / Tension','universal-module-2','Capstan transport with slack management and gravity tension reference.');
chain(u,'CAPSTAN','Capstan Media Transport','Capstan Drive Block','Capstan Service Group','Capstan / Nip Roller Pair','ctf-capstan','SCREEN FT-R/Katana use capstan-style media transport.');
chain(u,'CAPDRIVE','Capstan Drive / Encoder','Capstan Drive Service Block','Capstan Drive Service Group','Motor / Coupling / Encoder / Nip Pressure Arm','ctf-capstan','Functional position and transport-control chain; exact motor/encoder hardware remains model-specific.');
chain(u,'SLACK_FRONT','Front Slack Zone','Front Slack Block','Slack Control Group','Front Slack Loop / Guide','ctf-front-slack','Katana documents front slack zone to isolate feed irregularities.');
chain(u,'GRAVITY','Gravity Tension Roller','Tension Regulation Block','Tension Roller Group','Gravity Roller Reference','ctf-gravity-roller','Katana documents a gravity roller regulating media tension across width.');
chain(u,'SLACK_REAR','Rear Slack Zone','Rear Slack Block','Slack Control Group','Rear Slack Loop / Guide','ctf-rear-slack','Katana documents rear slack zone before uptake/output.');

u=unit('SCAN','High-Speed Polygon Scanner','universal-module-3','Polygon-mirror fast-scan imaging architecture.');
chain(u,'MIRROR','Polygon Mirror','Polygon Scanner Block','Fast-Scan Mirror Group','Multi-Facet Polygon Mirror','ctf-polygon-mirror','Katana 5000 official literature documents five-facet polygon mirror up to 14,400 rpm; exact BMJ family/model remains unknown.');
chain(u,'MOTOR','Polygon Drive','Scanner Drive Block','Polygon Motor Group','High-Speed Polygon Motor Reference','ctf-polygon-drive','Motorized high-speed polygon scan reference; exact motor and rpm on BMJ unit unverified.');
chain(u,'SPEED','Polygon Speed Feedback / Driver','Scanner Interlock Block','Polygon Speed Service Group','Speed Sensor / Motor Driver Reference','ctf-polygon-drive','Exposure permit in simulation requires polygon-at-speed; exact speed-feedback electronics are not asserted.');

u=unit('LASER','Laser / Beam Optics','universal-module-4','Red laser family and beam-focusing optics.');
chain(u,'SOURCE','Laser Source','Laser Source Block','Laser Source Service Group','Red Laser Diode / Solid-State Source Boundary','ctf-laser-source','FT-R/Katana references use red laser family around 633–635 nm; exact BMJ wavelength/model unverified.');
chain(u,'OPTICS','Beam Shaping / Focus Optics','Optical Path Block','Optics Service Group','Focus Lens / Beam Path Reference','ctf-optics','SCREEN documentation describes special focusing optics around polygon scan; exact lens prescription is not modeled.');
chain(u,'MOD','Imaging Modulator','Imaging Control Block','Laser Modulation Group','Laser Modulator / Exposure Control Reference','ctf-laser-modulator','Functional imaging modulation representation; exact electronics not asserted.');

u=unit('CUT','Cut / Punch Boundary','universal-module-5','Exposed media cutting plus optional punch capability.');
chain(u,'CUTTER','Media Cutter','Cutter Block','Cutter Service Group','Cross-Cut Blade / Anvil Reference','ctf-cutter','FT-R references document automatic media cut/output; cutter geometry is family-level.');
chain(u,'CUTINT','Cutter Actuation / Home Interlock','Cutter Interlock Block','Cutter Interlock Service Group','Actuator / Home Sensor Reference','ctf-cutter','Simulation allows cutter stroke only after exposure complete; installed actuator and home sensor type are unverified.');
chain(u,'PUNCH','Punch Option Boundary','Punch Capability Block','Punch Option Group','Register / Tail Punch Reference','ctf-punch-option','Katana supports multiple punch formats and optional tail punch; BMJ installed punch is unverified.','OPTION_BOUNDARY');

u=unit('OUT','Output / Processor Interface','universal-module-6','Output cassette or optional inline processor path.');
chain(u,'CASSETTE','Output Cassette','Output Collection Block','Output Cassette Group','Film Output Cassette Reference','ctf-output-cassette','Katana supports output cassette; exact BMJ cassette package unverified.');
chain(u,'OUTSENSE','Output Media Detection','Output Sensor Block','Output Detection Service Group','Output Media Sensor Reference','ctf-output-cassette','Functional output-detection reference only; installed sensor/cassette package remains unverified.');
chain(u,'PROCESSOR','Inline Processor Boundary','Processor Interface Block','Online Processor Group','Inline Processor / OLP Handoff Boundary','ctf-processor-boundary','Katana/FT-R families can feed inline processors; no BMJ processor model is verified.','OPTION_BOUNDARY');
chain(u,'CONTROL','RIP / Control Boundary','RIP Interface Block','Control Interface Group','RIP / SCSI / Job Control Reference','ctf-control-boundary','SCREEN families use external RIP/control interfaces; exact installed RIP generation and interface are unverified.','OPTION_BOUNDARY');

export const SCREEN_IMAGESETTER_TAXONOMY=Object.freeze(rows);
export const SCREEN_IMAGESETTER_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));
