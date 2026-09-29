// Translate only presentation values. Keep API and machine identifiers unchanged.
const STATUS_LABELS=Object.freeze({
 VERIFIED:'Terverifikasi','HIGH CONFIDENCE':'Tingkat keyakinan tinggi','MEDIUM CONFIDENCE':'Tingkat keyakinan sedang',
 ESTIMATED:'Perkiraan',UNKNOWN:'Belum diketahui',UNVERIFIED:'Belum diverifikasi',
 APPROXIMATE:'Perkiraan',CONFLICTING:'Perlu ditinjau','DWG-VERIFIED':'Terverifikasi dari DWG',
 'USER-CONFIRMED':'Dikonfirmasi oleh pengguna','NOT_IMPLEMENTED':'Belum tersedia',
 'LAYOUT PLACEHOLDER':'Penanda posisi pada denah','PROCEDURAL':'Dibuat secara digital',
 RECONSTRUCTED:'Direkonstruksi dari sumber','PARTIAL':'Sebagian','OFFLINE':'Tidak tersambung',
 'CACHED DATA':'Salinan data di perangkat','MODE LOKAL':'Mode lokal'
});
export function readableStatus(value){
 if(value==null||value==='')return 'Belum tersedia';
 const raw=String(value);
 const known={
  'IDENTITY VERIFIED / VARIANT REFERENCE':'Identitas terverifikasi; detail menggunakan acuan jenis mesin',
  'IDENTITY VERIFIED / ACTUAL PHOTO GEOMETRY / CUTTER INTERNAL UNRESOLVED':'Identitas dan bentuk luar mengacu pada foto aktual; bagian dalam pemotong belum terverifikasi',
  'PROCEDURAL / RECONSTRUCTED':'Model 3D dibuat dari sumber yang tersedia',
  'PARTIAL / APPROXIMATE':'Sebagian detail masih merupakan perkiraan',
  'OFFLINE / CACHED DATA':'Tidak tersambung; menampilkan salinan data di perangkat',
  'OFFLINE / MODE LOKAL':'Tidak tersambung; mode lokal',
  'CACHED DATA':'Menampilkan salinan data di perangkat',
  'DATA TERSAMBUNG':'Data tersambung',
  'TEMPLATE_ONLY':'Hanya acuan template','LAYOUT_ESTIMATED':'Perkiraan dari denah','DRAWING_BASED':'Berdasarkan gambar','FIELD_VERIFIED':'Terverifikasi di lapangan','AS_BUILT_CONFIRMED':'Kondisi terpasang terkonfirmasi',
  'UNPLACED':'Belum ditempatkan','UNPLACED_UNTIL_DRAWING_AVAILABLE':'Belum ditempatkan; menunggu gambar aktual','AS_BUILT_OR_DRAWING_APPLIED':'Menggunakan data terpasang atau gambar aktual','MIXED_TEMPLATE_AND_APPLIED':'Gabungan acuan dan data yang sudah diterapkan',
  'INFERRED_POSITION':'Posisi hasil inferensi','REFERENCE_ONLY':'Hanya berdasarkan referensi','PHOTO_VERIFIED':'Terverifikasi dari foto','REFERENCE_PLUS_PHOTO':'Diverifikasi dengan referensi dan foto','SOURCE_REFERENCE':'Acuan sumber','DOCUMENTATION_REQUIRED':'Dokumentasi diperlukan'
 };
 if(known[raw])return known[raw];
 return raw.replace(/\b(?:HIGH CONFIDENCE|MEDIUM CONFIDENCE|DWG-VERIFIED|USER-CONFIRMED|NOT_IMPLEMENTED|LAYOUT PLACEHOLDER|CACHED DATA|MODE LOKAL|VERIFIED|ESTIMATED|UNKNOWN|UNVERIFIED|APPROXIMATE|CONFLICTING|PROCEDURAL|RECONSTRUCTED|PARTIAL|OFFLINE)\b/g,word=>STATUS_LABELS[word]||word);
}
