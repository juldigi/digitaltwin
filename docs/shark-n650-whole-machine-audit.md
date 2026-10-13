# Audit mesin utuh BMJ-MCH-0020 — Offline Inspection 4 / Focusight FS-SHARK-N650-P3N1

Tanggal audit: 2026-10-14  
Mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`  
Urutan fungsi: pile input → suction pickup → negative-pitch full-suction transfer → inspection tower → vision processing → keputusan pass/reject → good/bad return collection.

## Batas bukti

- Registry BMJ memastikan identitas `BMJ-MCH-0020`, SAP `IPM-4`, model `FS-SHARK-N650-P3N1`, serial `FPS241216001`, tahun 2025.
- Inventaris repository mencatat nol foto aktual terpetakan untuk aset ini. Geometri memakai referensi keluarga resmi Focusight dan tidak dianggap survei as-built serial BMJ.
- Halaman resmi Inggris dan Tiongkok berbeda mengenai format maksimum (630 × 300 mm versus 630 × 450 mm). Konflik dipertahankan; suffix `P3N1` tidak didekode.
- Konfigurasi feeder, camera/light, reject actuator, arah instalasi, serta mode collection terpasang tetap `BLOCKED_EVIDENCE`; opsi keluarga tidak dipromosikan menjadi hardware terpasang.

## Audit hulu–hilir dan perbaikan

| Bagian | Hasil audit | Perbaikan / status |
|---|---|---|
| Pile input dan suction pickup | Pass pertama menemukan cup berhenti lebih dari 330 mm di atas pile dan stem tidak ikut bergerak, sehingga pickup hanya animasi menggantung. | Cup diposisikan 28 mm di atas pile; stroke 28 mm menutup celah. Empat stem sekarang bergerak bersama empat cup tanpa terlepas dari carrier. `COMPLETE` |
| Negative-pitch full-suction transfer | Blank pertama meloncat sekitar 285 mm dari pile ke transfer. Setelah itu pusat blank berada sekitar 62 mm di bawah working face belt. | Jalur dimulai di pile, naik melalui pickup, lalu bertumpu pada top surface transfer 0,794 m. Kurva spline yang overshoot diganti segmen kontak deterministik. `COMPLETE` |
| Inspection tower / camera / light | Pusat blank juga berada sekitar 61 mm di bawah bed inspeksi. Optik netral dan capability tersembunyi sudah mempertahankan batas bukti. | Jalur scan dikunci pada working face 0,793 m; scan window tetap berbasis occupancy. Paket optik terpasang tetap `BLOCKED_EVIDENCE`. |
| Vision processing / recipe | Capture, processing, keputusan demo deterministik dan tracking ID berurutan; recipe logic tidak dirender sebagai hardware. | `NO_CHANGE_REQUIRED` |
| Reject decision / separation | Blank mempertahankan tracking ID yang sama hingga cabang reject; hanya pivot netral bergerak. | Jenis actuator dan konfigurasi reject serial BMJ tetap `BLOCKED_EVIDENCE`. |
| Good/bad return collection | Entry output mengambang sekitar 10–14 mm di atas permukaan return dan belum memiliki semantic contact marker. | Good return dikunci pada 0,7445 m, bad return 0,5745 m; kedua belt diberi marker dan cabang diuji kontinu dari titik keputusan. `COMPLETE` |
| Frame, guarding, access, HMI | Support, enclosure, monitor mount dan floor contact konsisten terhadap model keluarga. | As-built guarding, clearance servis dan orientasi pabrik tetap `BLOCKED_EVIDENCE`. |
| Identity, display, simulation, taxonomy | Identitas exact, konflik sumber, suffix undecoded, taxonomy enam level, isolate/show-only/highlight/ghost/explode, normal/interior/LOD dan hidden capability boundary tersedia. | `COMPLETE` |

## Pass kedua

- Triangle/world bounds diukur ulang pada pile, suction cup, transfer belt, inspection bed, good return dan bad return; pusat blank berada di permukaan kerja dengan toleransi gate −1 sampai +3 mm.
- Jalur pickup–transfer–inspection–return kini kontinu tanpa teleport dan tanpa overshoot spline; good/bad branch berawal dari tracking point yang sama.
- Start, pause, resume, stop/reset, pickup stroke, transport drive, vacuum, encoder, lighting, capture, processing, reject permit, diverter, output stack dan rotor whitelist diuji kembali.
- Normal/interior dan adaptive LOD diuji pada kedua urutan; isolate/show-only/highlight/ghost/explode serta reset tetap tidak membocorkan node capability tersembunyi.

## Validasi dan rilis

- Tes fokus SHARK/inspection: 41/41 lulus.
- Gate lokal lulus: `npm test` 1.595/1.595 dan `npm run build` menghasilkan 41 mesin, 19 unidentified, serta bundle 2.918.524 byte.
- Rilis `c532d87e80c449215e79d253d390c556f808d690` lulus CI `38444629772`, deploy Cloudflare `38444629684`, dan verify frontend `38444629688`.
- Produksi memuat identitas `BMJ-MCH-0020 / IPM-4 / FPS241216001`, model FS-SHARK-N650-P3N1, delapan sumber, dan batas bukti P3N1/camera/feeder/reject. Browser tanpa WebGL turun aman ke 2D tanpa layar putih.
- Status mesin `COMPLETE`; cursor berikutnya `BMJ-MCH-0021`.
