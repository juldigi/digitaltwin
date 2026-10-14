# Audit mesin utuh BMJ-MCH-0022 — Pile Turner 02 / FZ 1200

Tanggal: 14 Oktober 2026. Mode `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`.
Identitas BMJ: serial `22000320`, tahun 2020, SAP `PLT-1` sesuai registry (tidak disamakan dengan PLT-1 BMJ-MCH-0007).

## Bukti

Registry, `dimensions-fz1200.js`, `sources-fz1200.js`, taxonomy dan template FZ digunakan kembali dari main terbaru. Halaman UANCHOR FZ1200 dibaca ulang: mendukung turning, airing, aligning/jogging, hydraulic station dan vibration tray. Angka referensi vendor bukan rating atau dimensi terpasang serial BMJ. Nama OEM, foto terpetakan untuk unit ini, envelope/orientasi, nozzle/blower/cylinder population, guard/HMI dan utility routing aktual belum terverifikasi.

Sumber: https://www.playingcardsmachine.com/pile-turner/sautomatic-dust-removing-paper-pile-turner.html ; repository `frontend/src/data/sources-fz1200.js`.

## Hulu–hilir

| Bagian nyata | Hasil | Status |
|---|---|---|
| Loading / lower support | Lower clamp bertumpu pada pallet platform y=0,630 m; kontak world bounds diperiksa pada instance BMJ-MCH-0022. | COMPLETE |
| Clamp / pressure face | Stroke referensi 0,498 m mencapai pile; confirmation dalam toleransi 1 mm terhadap permukaan. | COMPLETE |
| Lift / turning clearance | Clamp dan yoke bergerak bersama; sweep siklus 1.400 frame menunjukkan min pile y=0,6706385 m, tidak masuk lantai. | NO_CHANGE_REQUIRED |
| Turn / locking | Turn hanya setelah clamp dan lift-clearance; airing hanya setelah turn selesai dan lock. | NO_CHANGE_REQUIRED |
| Airing / dust removal | Air jet dan layer separation mengikuti izin dan fase nyata; hardware routing terpasang belum diketahui. | BLOCKED_EVIDENCE untuk instalasi; logika model lulus |
| Jog / alignment | Opposed plates bergerak hanya pada jog; alignment dan settling mendahului lower/release. | COMPLETE |
| Lower / release / unload | Pile mengikuti former upper plate sebagai support sesudah 180°; tidak floating saat release. Handoff keluar mesin aktual belum terverifikasi. | COMPLETE untuk kontak model; handoff BLOCKED_EVIDENCE |
| Hydraulic / air utility | Drive whitelist menyingkirkan cylinder/hose/manifold statis dari putaran. Installed pressure, count dan route belum terbukti. | BLOCKED_EVIDENCE |
| Guard / control / HMI | Identitas unit dipertahankan; exact panel/guard/sensor arrangement belum terverifikasi. | BLOCKED_EVIDENCE |
| Normal/interior/LOD / taxonomy | Enam level, show-only subtree, scoped inspection, dua urutan interior/LOD dan reset diperiksa ulang. | COMPLETE; visual runtime 3D menunggu kemampuan browser |

## Temuan dan perbaikan

Tahap UI sebelumnya dihitung dari delapan pembagian waktu sama besar, padahal window mekanisme tidak sama dan air/jog overlap. Akibatnya phase 0,12 dapat tertulis Load saat clamp aktif; phase 0,35 dapat tertulis Lift saat turn aktif. Tahap sekarang memilih mekanisme downstream yang sedang aktif: clamp → lift → turn/lock → air → jog → settle → lower/release. Pause mempertahankan tahap aktif dan stop kembali Load. Perubahan shared FZ berlaku pada ketiga aset dan diuji regresinya.

## Pass kedua / validasi

Tes fokus FZ/Pile02/runtime truth 22/22 lulus. Contact upper/pile, lower/platform dan turned-pile/support diukur kembali; interlock tidak gagal selama sweep. Dua urutan interior/LOD, show-only dan stop/reset mempertahankan identitas 22000320 serta posisi rest. Geometri dan dimensi custom tidak diubah. Suite penuh 1.600/1.600 lulus; build 41 mesin, 19 unidentified dan bundle 2.918.520 byte berhasil. Cursor tetap BMJ-MCH-0022 sampai deployment terverifikasi.

## Rilis terverifikasi

Commit `7f906b9657669e689d0dbba7c1c1a70b1bff972e` lulus frontend 38505109282, CI 38505109283 dan Cloudflare 38505109332. Produksi selesai memuat PILE TURNER 2/FZ1200, serial 22000320, tahun 2020 dan delapan sumber. WebGL tidak tersedia di browser pemeriksaan; fallback 2D terverifikasi, visual 3D belum terverifikasi. Audit semua bagian selesai diproses dengan blocker instalasi tetap terbuka. Cursor berikutnya BMJ-MCH-0023; gate ledger final wajib diperiksa sebelum audit baru.
