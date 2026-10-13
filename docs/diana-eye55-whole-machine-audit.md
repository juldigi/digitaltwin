# Audit mesin utuh BMJ-MCH-0019 — Offline Inspection 3 / MK Diana Eye 55

Tanggal audit: 2026-10-13  
Mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`  
Urutan fungsi: blank feeder/alignment → suction-belt transport → inspection cell/camera/LED → image processing → reject decision/ejection → accepted fish-scale delivery dan recoverable reject output.

## Batas bukti

- Registry BMJ memastikan identitas `BMJ-MCH-0019`, SAP `IPM-3`, model `DIANA EYE 55`, serial `MP.FBA0-00058`, tahun 2023.
- Inventaris repository mencatat nol foto aktual terpetakan untuk aset ini. Geometri bersumber dari halaman/brosur resmi HEIDELBERG dan Masterwork untuk keluarga Diana Eye 42/55; bukan survei as-built serial BMJ.
- Jumlah/campuran camera, jenis actuator reject mechanical versus air-nozzle, optional side stacker, envelope serial BMJ, dan orientasi terhadap bangunan tetap `BLOCKED_EVIDENCE` serta tidak dipromosikan sebagai hardware terpasang.

## Audit hulu–hilir dan perbaikan

| Bagian | Hasil audit | Perbaikan / status |
|---|---|---|
| Feeder dan alignment | Pile, feeding belt, feeding knife, guide, air-assist, serta ultrasonic double-sheet reference mengikuti urutan OEM. Hardware opsi tidak dipromosikan. | Elevasi blank dikunci pada working face feeder. `COMPLETE` |
| Suction-belt transport | Pass pertama menemukan pusat blank berada 10–12 mm di bawah permukaan belt sehingga tampak menembus belt. | Jalur dinaikkan ke 0,744 m dan diuji terhadap triangle-bound aktual setiap zona. `COMPLETE` |
| Inspection cell / optics | Neutral reference head mengarah turun ke scan plane; camera capability yang belum terbukti tetap tersembunyi. LED dan viewing window hanya aktif saat blank berada di scan window. | Kontak blank di bed dikoreksi ke 0,744 m; optical boundary dipertahankan. `COMPLETE` |
| Processing / recipe | Capture → processing → deterministic demo decision berurutan; logical recipe tidak dirender sebagai hardware mengambang. | `NO_CHANGE_REQUIRED` |
| Reject system | Decision ID tetap menempel pada blank yang sama; hanya pivot diverter bergerak, sensor/frame tetap diam, reject turun kontinu ke tray recovery. | Jenis actuator terpasang tetap `BLOCKED_EVIDENCE`; mekanisme netral dipertahankan. |
| Accepted delivery | Pass branch kontinu ke fish-scale entry. Pass pertama menemukan jalur utama berada di bawah working face delivery belt. | Delivery contact dinaikkan dari 0,700 m ke 0,714 m; belt diberi semantic marker untuk gate geometri. `COMPLETE` |
| Frame, guarding, access, HMI | Leveling pads dan recovery support menyentuh lantai; cutaway menyembunyikan exterior accessory lengkap dan mempertahankan process internals. | Konfigurasi instalasi/as-built tetap `BLOCKED_EVIDENCE`. |
| Display / taxonomy / modes | Taxonomy enam level, isolate/show-only/highlight/ghost/explode, normal/interior/LOD, dan hidden capability boundary diperiksa dua urutan. | `COMPLETE` |

## Pass kedua

- Kontak blank diukur ulang pada feeder, dua titik transport, inspection bed, dan dua titik delivery; toleransi gate −1 sampai +6 mm dari permukaan kerja.
- Cabang accepted dan reject berawal tepat pada titik curve yang sama tanpa teleport; accepted naik ke fish-scale entry dan reject turun ke tray recovery.
- Start, pause, resume, stop/reset, trigger blank, encoder, vacuum hold, camera capture, processing, reject permit/confirmation, output counter, rotor whitelist, feeder knife, LED dan viewing-window restore diuji ulang.
- Capability camera rear/area, air-nozzle reject, side stacker, recipe logic dan obsolete waste lane tetap tersembunyi setelah kedua urutan interior/LOD, isolate, show-only dan reset.

## Validasi dan rilis

- Tes fokus Diana/inspection: 44/44 lulus.
- Gate lokal lulus: `npm test` 1.592/1.592 dan `npm run build` menghasilkan 41 mesin, 19 unidentified, serta bundle 2.918.524 byte.
- Pipeline Cloudflare, produksi dan verifikasi visual dicatat setelah rilis berhasil.
- Status saat laporan dibuat: `RELEASE_PENDING`; cursor tetap `BMJ-MCH-0019` sampai semua gate rilis terverifikasi.
