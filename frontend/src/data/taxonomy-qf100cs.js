const SRC=Object.freeze([
 'BMJ-MACHINE-DATABASE',
 'V123-QF1080B-YUYIN',
 'V123-QF1080C-YUYIN',
 'V123-LQF1080CS-UPG',
 'V123-QF-FAMILY-ADVANTAGES',
 'V123-QF1080C-INSTALL-VISUAL'
]);
const nodes=[];
const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='CLOSE_FAMILY_PROCESS_REFERENCE')=>nodes.push(Object.freeze({
 id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
 confidence,verified:false,
 explodeVector:[level===2?.62:.12,level<4?.18:.08,0],
 explodeDistance:level===2?.84:level===3?.52:level===4?.33:level===5?.20:.12,
 focusCamera:null,description,maintenanceTag:null
}));
const root='QF100';
add(root,null,1,'Mesin','AUTOBLANKING MACHINE 2 · QF-100CS',['MACHINE-UNIVERSAL'],
 'Identitas model/serial berasal dari database BMJ. Mekanisme menggunakan keluarga QF/LQF-1080 sebagai close-family process reference; exact equivalence QF-100CS tidak diklaim.','MODEL_IDENTITY_BMJ_ONLY');

const unit=(code,name,mesh,desc)=>{const id=`${root}.${code}`;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
const chain=(u,code,n3,n4,n5,n6,mesh,desc,confidence='CLOSE_FAMILY_PROCESS_REFERENCE')=>{
 const a=`${u}.${code}`,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';
 add(a,u,3,'Sub',n3,[mesh],desc,confidence);add(b,a,4,'Block',n4,[mesh],desc,confidence);
 add(c,b,5,'Part',n5,[mesh],desc,confidence);add(d,c,6,'Spesifik Part',n6,[mesh],desc,confidence);
};

let u=unit('STAGE','Infeed / Stack Staging','universal-module-1','Area loading die-cut stack sebelum indexing.');
chain(u,'TABLE','Stack support table','Stack table block','Stack-table service group','Support table / low-friction surface','qf100-stack-table','Menopang stack hasil die-cut sebelum masuk area kerja.');
chain(u,'GUIDE','Stack guides','Side-guide block','Stack-guide service group','Adjustable side / end guides','qf100-stack-guides','Membatasi posisi stack sebelum platform bergerak.');
chain(u,'SENSE','Stack sensing','Presence-sensor block','Stack sensor service group','Photoelectric presence sensor','qf100-stack-sensors','Sensor keberadaan/posisi ditampilkan sebagai family reference.');

u=unit('XY','Servo Moving Platform X/Y','universal-module-2','Platform bergerak dua sumbu di bawah blanking head yang tetap.');
chain(u,'PLATFORM','Moving platform','Platform carriage block','Moving-platform service group','Rigid XY work platform','qf100-platform','Platform membawa stack melalui area kerja; head tetap.');
chain(u,'X','X-axis drive','X linear-motion block','X-axis service group','X ball screw / linear guides / servo','qf100-x-axis','Servo, ball screw dan straight-line guide didokumentasikan pada keluarga QF/LQF.');
chain(u,'Y','Y-axis drive','Y linear-motion block','Y-axis service group','Y ball screw / linear guides / servo','qf100-y-axis','Gerak sumbu kedua untuk indexing area blanking.');
chain(u,'POS','Position feedback','Position-control block','Position sensing service group','Photoelectric / limit sensors','qf100-position-sensors','Photoelectric device dan position limiter menjaga akurasi keluarga mesin.');

u=unit('HEAD','Fixed Hydraulic Blanking Head','universal-module-3','Hydraulic blanking head tetap; jumlah head unit BMJ belum terverifikasi.');
chain(u,'FRAME','Gantry head frame','Fixed-head frame block','Head-frame service group','Upper gantry / head supports','qf100-head-frame','Gantry structure menjaga blanking head tetap terhadap moving platform.');
chain(u,'CYL','Hydraulic actuation','Hydraulic cylinder block','Hydraulic head service group','Main cylinder / ram / pressure plate','qf100-head-ram','Tekanan blanking diberikan vertikal oleh hydraulic head.');
chain(u,'GUIDE','Head guidance','Ram-guide block','Ram guide service group','Guide posts / bushings','qf100-head-guides','Menjaga pressure plate turun tegak; detail exact BMJ belum tersedia.');

u=unit('TOOL','Tooling / Honeycomb Pin Board','universal-module-4','Tooling blanking menggunakan pin-board family reference.');
chain(u,'BOARD','Honeycomb pin board','Pin-board carrier block','Pin-board service group','Honeycomb board / hole field','qf100-pin-board','UPG mendokumentasikan honeycomb plate dengan hole field untuk susunan pin.');
chain(u,'PINS','Blanking pins','Pin tooling block','Tooling-pin service group','Removable blanking pins','qf100-tooling-pins','Pins disusun mengikuti bentuk produk yang akan dipisahkan.');
chain(u,'LOCK','Tooling retention','Tool-lock block','Tool retention service group','Pin-board clamp / locator references','qf100-tooling-lock','Retention geometry adalah family reference, bukan installed-tool claim.');

u=unit('SEP','Blank / Waste Separation','universal-module-5','Produk ditekan keluar dari waste frame saat stack berada pada posisi terprogram.');
chain(u,'PRESS','Blank separation interface','Separation pressure block','Blank separation service group','Pressure plate / pin contact interface','qf100-separation-interface','Proses blanking memisahkan produk dari waste frame tanpa memodelkan fork/conveyor yang tidak terbukti.');
chain(u,'FRAME','Waste-frame support','Waste support block','Waste-frame service group','Waste-frame support rails','qf100-waste-support','Menahan area waste selama produk didorong keluar; detail fixture BMJ belum terverifikasi.');

u=unit('OUT','Collection / Stacker Boundary','universal-module-6','Area penerimaan produk; automatic collector/stacker adalah option boundary.');
chain(u,'TRAY','Receiving area','Receiving tray block','Receiving service group','Product receiving tray','qf100-receiving-tray','Tray penerima ditampilkan sebagai interface proses minimum.');
chain(u,'OPTION','Automatic collector option','Collector option block','Collector option group','Collector / stacker capability marker','qf100-collector-option','Keluarga QF memiliki varian collecting/stacker; instalasi pada QF-100CS BMJ belum terverifikasi.','OPTION_BOUNDARY');

u=unit('CTRL','PLC / Hydraulic Cabinet','universal-module-7','Kontrol motion, pressure, interlock dan operator interface.');
chain(u,'HMI','Operator control','HMI block','Operator-interface service group','Touchscreen / controls','qf100-hmi','Keluarga QF/LQF menggunakan PLC dan touchscreen/HMI.');
chain(u,'HYD','Hydraulic power unit','Hydraulic-power block','Hydraulic service group','Pump / reservoir / manifold','qf100-hydraulic-unit','Menyuplai blanking head; brand/component exact unit BMJ tidak diklaim.');
chain(u,'PLC','Electrical / PLC','PLC cabinet block','Electrical-control service group','PLC / servo-drive cabinet','qf100-plc-cabinet','Koordinasi X/Y servo, position limit, pressure cycle dan safety.');

export const QF100CS_TAXONOMY=Object.freeze(nodes);
export const QF100CS_TAXONOMY_BY_ID=new Map(QF100CS_TAXONOMY.map(n=>[n.id,n]));
