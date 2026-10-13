# Audit mesin utuh BMJ-MCH-0018 — Folder Gluer 3 / BOBST MEDIA 100 II

Tanggal audit: 2026-10-13  
Mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`  
Urutan fungsi: blank feeder → alignment/pre-break → forming → glue boundary → final fold/trombone → compression → delivery, ditambah drive/control, frame/access, simulasi dan navigasi.

## Batas bukti

- Registry BMJ memastikan identitas `BMJ-MCH-0018`, SAP `FGM-3`, model `MEDIA 100 II`, serial `0341 142 07`.
- Inventaris repository mencatat nol foto aktual terpetakan untuk FGM-3. Geometri memakai bukti keluarga MEDIA II dan referensi pasar MEDIA 100 II; bukan CAD instalasi serial BMJ.
- Suffix A1/A2, envelope aktual, minimum blank aktual, konfigurasi glue, crash-lock/4–6 corner, ejector/kicker, kontrol, inspection dan delivery accessory tetap `BLOCKED_EVIDENCE`.

## Audit hulu–hilir dan perbaikan

| Bagian | Hasil audit | Perbaikan / status |
|---|---|---|
| Feeder dan blank input | Pile, pickup route, friction belts dan pulley berada pada kontak kontinu; tidak ada geometri di bawah lantai. | Shared MEDIA 100 contact correction dipertahankan. `COMPLETE` |
| Alignment / pre-break | Jalur blank mengikuti crown belt; guide dan pre-break rail tidak memotong blank. | Tidak perlu perubahan mekanis. `NO_CHANGE_REQUIRED` |
| Forming / conversion | Hardware crash-lock/corner hanya capability reference dan tersembunyi; straight-line demo tidak menggerakkan flap lock-bottom. | Boundary instalasi dipertahankan. `BLOCKED_EVIDENCE` |
| Adhesive boundary | Glue stripe mengikuti blank sesudah zona aplikasi; disc, pump, dan tiga head reference tetap tersembunyi. | Tidak mengklaim jenis/jumlah applicator. `BLOCKED_EVIDENCE` |
| Final fold / trombone | Belt, pulley, guide, dan karton tetap sejajar; tidak ada penetrasi karton. | `COMPLETE` |
| Compression | Karton bertemu lower/upper belt dengan compression stroke 4 mm dan kembali tepat saat reset. | `COMPLETE` |
| Delivery/output | Exit route mengikuti roller crown dan output stack bertumpu pada delivery plane. | `COMPLETE` |
| Drive/control/frame/access | Rotor whitelist hanya feeder, glue reference, trombone, exit dan line drive; crossbar, cylinder, button tidak ikut berputar. | Konfigurasi instalasi aktual tetap `BLOCKED_EVIDENCE` |
| Identity/evidence routing | Sumber teknis template memuat site-record FGM-1 dan FGM-3 sekaligus, sehingga bukti identitas tetangga dapat tampil pada FGM-3. | Ditambahkan filter sumber per asset. FGM-3 kini hanya membawa site-record FGM-3; sumber keluarga tetap bersama. `COMPLETE` |
| Display/taxonomy/simulation | Material mutable unik per mesh; capability hidden bertahan pada kedua urutan interior/LOD, isolate, show-only, ghost, highlight dan reset. Taxonomy enam level terpetakan. | `COMPLETE` |

## Pass kedua

- Model FGM-3 memiliki 252 mesh dengan material mutable terisolasi; envelope keluarga sekitar 11,500 × 1,593 × 2,7325 m dan tidak dipromosikan sebagai dimensi engineering BMJ.
- Jalur karton diperiksa pada feeder, pre-fold, forming, glue, final fold, compression dan exit; kontak/clearance mengikuti gate geometri shared MEDIA 100 yang telah terukur.
- Lifecycle start → pause → resume → stop/reset, delapan tahap proses, multi-carton, glue-on-blank, compression carriage dan output stack diuji ulang.
- Placard tunggal tetap `FGM-3 / 0341 142 07`; taxonomy dan sumber tidak membawa site-record FGM-1.
- Enam belas capability-only mesh tetap tersembunyi pada normal/interior/LOD dan sesudah navigasi seleksi.

## Validasi

- Tes fokus MEDIA 100, folder truth, runtime dan identity: 61/61 lulus.
- Gate lokal lulus: `npm test` 1.590/1.590 dan `npm run build` menghasilkan 41 mesin, 19 unidentified, serta bundle 2.918.524 byte.
- Status: `RELEASE_PENDING`; cursor tetap `BMJ-MCH-0018` sampai workflow dan produksi terverifikasi.

