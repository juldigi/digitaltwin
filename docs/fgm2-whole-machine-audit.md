# Audit mesin utuh BMJ-MCH-0017 — Folder Gluer 2 / FGM-2

Tanggal audit: 13 Oktober 2026  
Mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`

## Batas bukti

- Registry BMJ memastikan identitas aset `BMJ-MCH-0017`, SAP `FGM-2`, fungsi Folder Gluer 2, area OFFSET CONVERTING, dan FLOC `PC-PK2-CON-FLG-00FOLDER02`.
- Registry tidak memuat OEM, model, serial, tahun, kapasitas, atau konfigurasi terpasang. Audit foto repository mencatat nol foto aktual beridentitas pasti untuk mesin ini.
- FGM-1 dan FGM-3 MEDIA 100 II hanya dipakai sebagai analogi keluarga di lokasi yang sama, bukan bukti bahwa FGM-2 adalah MEDIA 100 II. Referensi BOBST/Jaya Makmur dipakai hanya untuk irisan proses umum folder-gluer.
- Karena itu digital twin tetap merupakan representasi proses multi-vendor: feeding/separation, alignment/prebreak, folding, batas aplikasi adhesive, final fold, compression, dan delivery.

## Audit hulu ke hilir dan perbaikan

| Bagian | Temuan sebelum | Perbaikan/hasil | Status |
|---|---|---|---|
| Blank feeder & separation | Permukaan pile berada 65 mm di bawah feed belt; blank simulasi melayang 48,5 mm dari belt. | Permukaan pile, belt, roller, dan bidang bawah blank disatukan pada Y dunia 0,811 m. Separator tetap netral tanpa mengklaim vacuum/vibration OEM. | COMPLETE |
| Alignment & prebreak | Blank melayang 11 mm di atas alignment roller. | Roller dinaikkan sampai kontak 0 mm; skew masuk dan alignment menuju centerline tetap dipertahankan. | COMPLETE |
| Primary folding | Bidang blank melayang 28,5 mm dari belt. | Lower folding belts dikoreksi ke kontak 0 mm; timing prebreak/primary fold tidak berubah. | COMPLETE |
| Adhesive application boundary | Tidak ada permukaan transport kontinu di bawah blank; jenis cold/hot melt, gun/nozzle/disc/wheel tidak diketahui. | Ditambahkan hanya conveyor proses netral yang didukung fungsi folder-gluer. Hardware applicator, detection, crash-lock, serta 4/6-corner tetap tersembunyi dan tidak disimulasikan. | BLOCKED_EVIDENCE |
| Final folding & squaring | Blank menembus upper belt sekitar 44,5 mm, sementara lower belt tidak menopang blank. | Lower/upper belt diposisikan pada permukaan bawah/atas karton terlipat; penetrasi hilang dan clearance maksimum terukur 12,5 mm selama fase transisi. | COMPLETE |
| Compression | Blank menembus upper belt sekitar 30,5 mm dan melayang 53,5 mm dari lower belt. | Belt compression bawah/atas dipasang tepat pada envelope karton terlipat: kontak bawah 0 mm, penetrasi atas 0 mm. | COMPLETE |
| Delivery/output | Blank melayang 57 mm di atas delivery conveyor. | Delivery belts/rollers dinaikkan ke bidang keluaran; kontak kembali 0 mm. Counter/kicker dan downstream packer tetap tidak diklaim. | COMPLETE |
| Frame, drive, control & access | Seluruh detail adalah referensi keluarga; konfigurasi section drives/HMI aktual tidak diketahui. | Tidak mengubah envelope, orientasi, atau identitas. Tidak menambahkan motor, sensor, utility, guard, atau control model baru. | BLOCKED_EVIDENCE |
| Simulasi, LOD, interior & taxonomy | Material palette dipakai bersama sehingga highlight/ghost satu mesh dapat mengubah assembly lain; visibility baseline opsi dapat bocor setelah isolate/show-only. | Material mutable diklon per mesh; baseline `restVisible` dipertahankan. Dua urutan interior/LOD, isolate, show-only, highlight, ghost, reset, serta taxonomy enam level diuji. | COMPLETE |

## Pass kedua

- Mengukur 364 node, 325 mesh, 316 mesh terlihat, dan 29 active mesh; tidak ada mesh di bawah lantai.
- Menguji kontak blank pada tujuh zona berturut-turut. Gap akhir feeder, alignment, primary fold, glue transport, final fold, compression, dan delivery adalah 0 mm dalam toleransi numerik.
- Memeriksa lifecycle start/pause/resume/stop/reset dan drive phase feeder/fold/compression/delivery; opsi tak terverifikasi tidak masuk motion list.
- Memeriksa 100 entri taxonomy enam level; identitas FGM-2 tidak diwarisi dari FGM-1/FGM-3.
- Memeriksa kedua urutan toggle `LOD → interior` dan `interior → LOD`; capability-only geometry tetap tersembunyi setelah reset dan show-only.

## BLOCKED_EVIDENCE

Foto aktual nameplate dan seluruh sisi mesin; OEM/model/serial/tahun; teknologi separator feeder; jumlah/jenis belt dan roller; konfigurasi crash-lock serta 4/6-corner; chemistry dan hardware adhesive; glue detection; compression actuation; counter/kicker; downstream packing; section-drive topology; HMI/control; guarding/interlock; serta routing listrik, pneumatic, dan utility.

## Validasi

- Tes fokus folder/runtime/mechanical/research: 70/70 lulus.
- Pemeriksaan geometri kontak baru: 7/7 zona didukung tanpa gap atau penetrasi; upper final/compression tidak menembus karton.
- Gate lokal lulus: `npm test` 1.589/1.589 dan `npm run build` menghasilkan 41 mesin, 19 unidentified, serta bundle 2.918.524 byte.
- Status saat laporan dibuat: `RELEASE_PENDING`; cursor tetap pada `BMJ-MCH-0017` sampai workflow dan produksi terverifikasi.
