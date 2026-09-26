// Translate only presentation values. Keep API and machine identifiers unchanged.
const STATUS_LABELS=Object.freeze({
 VERIFIED:'Terverifikasi','HIGH CONFIDENCE':'Keyakinan tinggi','MEDIUM CONFIDENCE':'Keyakinan sedang',
 ESTIMATED:'Perkiraan',UNKNOWN:'Belum diketahui',UNVERIFIED:'Belum diverifikasi',
 APPROXIMATE:'Perkiraan',CONFLICTING:'Perlu ditinjau','DWG-VERIFIED':'Terverifikasi dari DWG',
 'USER-CONFIRMED':'Dikonfirmasi pengguna','NOT_IMPLEMENTED':'Belum tersedia',
 'LAYOUT PLACEHOLDER':'Penanda posisi pada denah','PROCEDURAL':'Dibuat secara digital',
 RECONSTRUCTED:'Direkonstruksi','PARTIAL':'Sebagian','OFFLINE':'Tidak tersambung',
 'CACHED DATA':'Salinan data di perangkat','MODE LOKAL':'Mode lokal'
});
export function readableStatus(value){
 if(value==null||value==='')return 'Belum tersedia';
 const raw=String(value);
 const known={
  'IDENTITY VERIFIED / VARIANT REFERENCE':'Identitas terverifikasi; detail memakai acuan jenis mesin',
  'IDENTITY VERIFIED / ACTUAL PHOTO GEOMETRY / CUTTER INTERNAL UNRESOLVED':'Identitas dan bentuk luar mengacu pada foto aktual; bagian dalam pemotong belum terverifikasi',
  'PROCEDURAL / RECONSTRUCTED':'Model 3D dibuat dari sumber yang tersedia',
  'PARTIAL / APPROXIMATE':'Sebagian detail masih berupa perkiraan',
  'OFFLINE / CACHED DATA':'Tidak tersambung; menampilkan salinan data di perangkat',
  'OFFLINE / MODE LOKAL':'Tidak tersambung; mode lokal',
  'CACHED DATA':'Menampilkan salinan data di perangkat',
  'DATA TERSAMBUNG':'Data tersambung'
 };
 if(known[raw])return known[raw];
 return raw.replace(/\b(?:HIGH CONFIDENCE|MEDIUM CONFIDENCE|DWG-VERIFIED|USER-CONFIRMED|NOT_IMPLEMENTED|LAYOUT PLACEHOLDER|CACHED DATA|MODE LOKAL|VERIFIED|ESTIMATED|UNKNOWN|UNVERIFIED|APPROXIMATE|CONFLICTING|PROCEDURAL|RECONSTRUCTED|PARTIAL|OFFLINE)\b/g,word=>STATUS_LABELS[word]||word);
}
