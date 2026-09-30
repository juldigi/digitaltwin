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
  'PROCEDURAL / PHOTO + DOCUMENT GROUNDED':'Model 3D dibuat dari foto aktual dan dokumen yang tersedia',
  'PROCEDURAL / DOCUMENT-GROUNDED':'Model 3D dibuat berdasarkan dokumen teknis yang tersedia',
  'PROCEDURAL / DATABASE + LEGACY FAMILY REFERENCES':'Model 3D dibuat dari data BMJ dan referensi lama keluarga mesin',
  'DEDICATED PROCEDURAL / BMJ PHOTO-GROUNDED RECONSTRUCTION':'Model 3D khusus dibuat dari rekonstruksi foto aktual BMJ',
  'BMJ_ACTUAL_EVIDENCE_AVAILABLE':'Bukti aktual BMJ tersedia',
  'OFFICIAL_DOCUMENTS_AVAILABLE':'Dokumen resmi tersedia',
  'SP102_FAMILY_REFERENCE_AVAILABLE':'Referensi keluarga SP 102 tersedia',
  'BMJ_ACTUAL_PHOTOSET_PRIMARY__HSM_FAMILY_PROCESS_SECONDARY':'Foto aktual BMJ menjadi sumber utama; referensi proses keluarga HSM menjadi sumber pendukung',
  'DEDICATED_EVIDENCE_AVAILABLE':'Bukti khusus untuk mesin ini tersedia',
  'FAMILY_REFERENCE_AVAILABLE':'Referensi keluarga mesin tersedia',
  'PRODUCTION_MACHINE':'Mesin produksi',
  'OFFSET_PRINTING':'Printing offset',
  '3D renderer unavailable':'Render 3D belum tersedia',
  'SOURCE ANNOTATION / REVIEW':'Anotasi sumber; perlu ditinjau',
  'PROCEDURAL / RECONSTRUCTED':'Model 3D dibuat dari sumber yang tersedia',
  'PARTIAL / APPROXIMATE':'Sebagian detail masih merupakan perkiraan',
  'PARTIAL / SOURCE COUNT UNKNOWN':'Sebagian; jumlah entitas sumber belum diketahui',
  'PARTIAL / NORMALIZED EXTRACTION':'Sebagian; hasil ekstraksi sudah dinormalisasi',
  'OFFLINE / CACHED DATA':'Tidak tersambung; menampilkan salinan data di perangkat',
  'OFFLINE / MODE LOKAL':'Tidak tersambung; mode lokal',
  'CACHED DATA':'Menampilkan salinan data di perangkat',
  'DATA TERSAMBUNG':'Data tersambung',
  'TEMPLATE_ONLY':'Hanya acuan template','LAYOUT_ESTIMATED':'Perkiraan dari denah','DRAWING_BASED':'Berdasarkan gambar','FIELD_VERIFIED':'Terverifikasi di lapangan','AS_BUILT_CONFIRMED':'Kondisi terpasang terkonfirmasi',
  'UNPLACED':'Belum ditempatkan','UNPLACED_UNTIL_DRAWING_AVAILABLE':'Belum ditempatkan; menunggu gambar aktual','AS_BUILT_OR_DRAWING_APPLIED':'Menggunakan data terpasang atau gambar aktual','MIXED_TEMPLATE_AND_APPLIED':'Gabungan acuan dan data yang sudah diterapkan',
  'INFERRED_POSITION':'Posisi diperkirakan dari data yang tersedia','REFERENCE_ONLY':'Hanya berdasarkan referensi','PHOTO_VERIFIED':'Terverifikasi dari foto','REFERENCE_PLUS_PHOTO':'Diverifikasi dengan referensi dan foto','SOURCE_REFERENCE':'Acuan sumber','DOCUMENTATION_REQUIRED':'Dokumentasi diperlukan'
 };
 if(known[raw])return known[raw];
 return raw.replace(/\b(?:HIGH CONFIDENCE|MEDIUM CONFIDENCE|DWG-VERIFIED|USER-CONFIRMED|NOT_IMPLEMENTED|LAYOUT PLACEHOLDER|CACHED DATA|MODE LOKAL|VERIFIED|ESTIMATED|UNKNOWN|UNVERIFIED|APPROXIMATE|CONFLICTING|PROCEDURAL|RECONSTRUCTED|PARTIAL|OFFLINE)\b/g,word=>STATUS_LABELS[word]||word);
}
