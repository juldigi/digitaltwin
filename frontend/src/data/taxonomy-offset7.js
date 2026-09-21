const SRC=Object.freeze(['BMJ-MACHINE-DATABASE','V123-YA1A1A-GOV','V123-GRAVURE-SHEETFED-PATENT','V123-SHEETFED-GRAVURE-US872','V123-GRAVURE-DOCTOR-US','V123-MOOG-PROGRAM','V123-MOOG-TECH','V123-GRAVURE-NIP-BOARD']);
const nodes=[];
const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='MECHANISM_REFERENCE')=>nodes.push(Object.freeze({
 id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
 confidence,verified:false,explodeVector:[level===2?.65:.12,level<4?.18:.08,0],
 explodeDistance:level===2?.88:level===3?.54:level===4?.34:level===5?.21:.12,
 focusCamera:null,description,maintenanceTag:null
}));
const root='O7';
add(root,null,1,'Mesin','OFFSET 7 · YA1A1A · Sheet-fed gravure press',['MACHINE-UNIVERSAL'],'Identitas YA1A1A berasal dari database BMJ dan external exact-model identity. Detail internal memakai mekanisme sheet-fed gravure yang terdokumentasi; ukuran dan opsi terpasang tetap evidence-bounded.','MODEL_IDENTITY_VERIFIED');

const unit=(code,name,mesh,desc)=>{const id=`${root}.${code}`;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
const chain=(u,code,n3,n4,n5,n6,mesh,desc,confidence='MECHANISM_REFERENCE')=>{
 const a=`${u}.${code}`,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';
 add(a,u,3,'Sub',n3,[mesh],desc,confidence);add(b,a,4,'Block',n4,[mesh],desc,confidence);
 add(c,b,5,'Part',n5,[mesh],desc,confidence);add(d,c,6,'Spesifik Part',n6,[mesh],desc,confidence);
};

let u=unit('FEED','Sheet Feeder','universal-module-1','Separasi lembar dan transfer awal menuju register.');
chain(u,'SUCTION','Suction feeder head','Vacuum separation block','Suction head service group','Sucker cups / suction rail','o7-feeder-suction','Suction cups memisahkan lembar dari pile sebelum transfer.','SHEETFED_FAMILY_REFERENCE');
chain(u,'SWING','Swing gripper transfer','Feeder swing-shaft block','Swing gripper service group','Swing pawl / gripper fingers','o7-feeder-swing-gripper','Patent sheet-fed gravure mendokumentasikan swing pawl yang menyerahkan lembar ke impression-cylinder gripper.','PRIMARY_MECHANISM');
chain(u,'VAC','Feeder vacuum supply','Vacuum generation block','Vacuum service group','Vacuum pump / manifold','o7-feeder-vacuum','Supply vakum untuk suction feeder.','SHEETFED_FAMILY_REFERENCE');

u=unit('REG','Register / Sheet Transfer','universal-module-2','Penjajaran lembar sebelum masuk nip gravure.');
chain(u,'LAY','Register lays','Front/side lay block','Register lay service group','Front lay / side lay references','o7-register-lays','Referensi arsitektur register sheet-fed; geometri installed YA1A1A belum terukur.','SHEETFED_FAMILY_REFERENCE');
chain(u,'TRANSFER','Transfer gripper','Register transfer block','Transfer gripper service group','Register gripper bar','o7-register-transfer','Menjaga leading edge saat sheet diserahkan ke impression cylinder.','SHEETFED_FAMILY_REFERENCE');

u=unit('INK','Ink Supply / Circulation','universal-module-3','Penyediaan, penampungan dan pengembalian tinta gravure.');
chain(u,'PAN','Ink pan','Adjustable pan block','Ink-pan lift service group','Adjustable ink pan / lift screws','o7-ink-pan','Sheet-fed gravure patent mendokumentasikan ink pan di bawah gravure cylinder yang dapat dinaik-turunkan.','PRIMARY_MECHANISM');
chain(u,'CIRC','Ink circulation','Pump / reservoir block','Ink circulation service group','Reservoir / pump / return lines','o7-ink-circulation','Sirkulasi tinta ditampilkan sebagai family reference; routing BMJ belum diverifikasi.','FAMILY_REFERENCE');
chain(u,'DROP','Drop-feed reference','Drop nozzle block','Drop-feed option group','Ink drop nozzle manifold','o7-ink-drop-option','Patent juga mendokumentasikan mode drop-feed; ditampilkan sebagai option reference, bukan klaim konfigurasi terpasang.','OPTION_BOUNDARY');

u=unit('GRAV','Gravure Cylinder / Doctor','universal-module-4','Pengisian cell gravure, doctoring, dan kesiapan image transfer.');
chain(u,'CYL','Gravure cylinder','Cylinder journal / bearing block','Gravure cylinder service group','Engraved cylinder / journals / bearings','o7-gravure-cylinder','Gravure cylinder berputar membawa tinta pada recessed cells menuju printing nip.','PRIMARY_MECHANISM');
chain(u,'DOC','Doctor blade','Doctor holder / pivot block','Doctor service group','Blade / holder / oscillator / damper','o7-doctor','Doctor blade mengikis tinta berlebih; oscillation longitudinal didokumentasikan pada gravure doctor systems.','PRIMARY_MECHANISM');

u=unit('IMP','Impression Cylinder / Sheet Control','universal-module-5','Menahan sheet dan membentuk printing nip terhadap gravure cylinder.');
chain(u,'CYL','Impression cylinder','Impression bearing block','Impression-cylinder service group','Impression cylinder / bearings / gripper jaw','o7-impression-cylinder','Impression cylinder gripper menahan lembar saat melewati printing nip.','PRIMARY_MECHANISM');
chain(u,'PRESS','Sheet press / anti-slack','Pre-nip sheet control block','Sheet control service group','Slack-suppression press roller','o7-impression-sheet-control','Patent sheet-fed gravure mendokumentasikan press roller sebelum nip untuk menekan slack.','PRIMARY_MECHANISM');

u=unit('DRY','Drying / Exhaust','universal-module-6','Pengeringan dan pembuangan udara proses setelah printing nip.');
chain(u,'AIR','Air treatment','Drying plenum block','Drying air service group','Air knife / plenum references','o7-dryer-air','Sheet-fed gravure systems dapat menggunakan hot-air/air-knife drying; teknologi heater YA1A1A belum diverifikasi.','FAMILY_OPTION_REFERENCE');
chain(u,'EXH','Exhaust','Exhaust duct block','Exhaust service group','Exhaust fan / duct reference','o7-dryer-exhaust','Exhaust path dimodelkan secara fungsional tanpa mengklaim kapasitas atau duct routing aktual.','FAMILY_REFERENCE');

u=unit('DEL','High-pile Delivery','universal-module-7','Transport akhir dan penumpukan lembar hasil cetak.');
chain(u,'CHAIN','Delivery transport','Delivery chain block','Delivery transport service group','Chain guides / sheet grippers','o7-delivery-chain','High-pile sheet delivery adalah arsitektur umum yang didokumentasikan pada sheet-fed gravure press program.','OEM_FAMILY_REFERENCE');
chain(u,'PILE','Delivery pile','Pile alignment block','Pile service group','Pile platform / side joggers','o7-delivery-pile','Penumpukan dan alignment lembar keluar; detail non-stop option belum diverifikasi.','OEM_FAMILY_REFERENCE');

u=unit('DRIVE','Drive / Control','universal-module-8','Sumber penggerak dan transmisi mekanik press.');
chain(u,'MOTOR','Main drive','Drive motor block','Main drive service group','Main drive motor reference','o7-main-drive','Motor utama ditampilkan sebagai mechanical family reference; rating aktual belum tersedia.','FAMILY_REFERENCE');
chain(u,'TRAN','Transmission','Mechanical transmission block','Transmission service group','Line shaft / gear train references','o7-transmission','Transmisi ditampilkan sebagai fungsi mekanik; topology drive YA1A1A belum diverifikasi.','OPTION_BOUNDARY');

export const OFFSET7_GRAVURE_TAXONOMY=Object.freeze(nodes);
export const OFFSET7_GRAVURE_TAXONOMY_BY_ID=new Map(OFFSET7_GRAVURE_TAXONOMY.map(n=>[n.id,n]));
