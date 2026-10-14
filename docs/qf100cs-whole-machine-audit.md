# BMJ-MCH-0021 QF-100CS — audit mesin utuh berjalan

Tanggal: 14 Oktober 2026. Mode `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`.
Identitas registry: ABM-2, serial 2103072CGB05, tahun 2022.

## Bukti dan batas

Sumber repository: `taxonomy-qf100cs.js`, `research-v123.js`, profile/runtime QF dan referensi keluarga QF1080B/C serta LQF1080CS. Exact-model public documentation, installed head count, tooling pattern, collector/stacker, pressure, envelope dan brand komponen BMJ belum terverifikasi. Association Jaya Makmur Mesindo–BMJ tidak membuktikan pemasok ABM-2. Semua unknown ini tetap `BLOCKED_EVIDENCE`.

## Urutan dan hasil pengukuran awal

| Bagian nyata | Pengukuran / temuan | Status |
|---|---|---|
| Stack staging / loading | Table top 0,590 m; workpiece center 0,810 m dengan tebal 55 mm, sehingga bottom 0,7825 m belum didukung saat loading. | IN_PROGRESS |
| X/Y moving platform | Working face 0,770 m; gap awal 12,5 mm dihilangkan dengan center workpiece 0,7975 m. Carriage rest disejajarkan −0,55 m terhadap workpiece; overhang awal 85 mm hilang. Sapuan 101 posisi indexing/registration membuktikan seluruh footprint ditopang carriage. | COMPLETE untuk indexing/registration; loading dan separation tetap terbuka. |
| Fixed hydraulic head | Housing, rod dan plate sebelumnya bergerak sebagai satu group sebesar 160 mm; housing kehilangan mounting gantry. | Housing kini fixed; rod/plate stroke bersamaan. COMPLETE untuk koreksi mounting; contact masih IN_PROGRESS. |
| Pin-board / tooling | Board bottom 0,8325 m, top 0,9175 m; pressure plate rest bottom 0,930 m. Stroke 160 mm masih perlu direkonstruksi bersama pin-board dan stock agar tidak menembus tooling. | IN_PROGRESS; pola instalasi BLOCKED_EVIDENCE |
| Separation / waste support | Interface stock reference 0,7125–0,7475 m. Dinamika drop workpiece dan support aktual perlu ditelusuri sebelum klaim kontak. | IN_PROGRESS |
| Product receiving | Tray top 0,5775 m, x 1,22–1,94 m. Workpiece demo kembali ke platform dan belum mencapai tray; counter bukan bukti output fisik. | IN_PROGRESS |
| Hydraulic utility / controls / guarding | Keluarga PLC, servo dan hydraulic tersedia; brand, pressure dan route instalasi tidak terbukti. | BLOCKED_EVIDENCE; mode/mounting audit IN_PROGRESS |
| Normal/interior/LOD, taxonomy, factory parity | Gate runtime truth lulus; kedua urutan toggle dan pass visual mendalam belum ditutup. | IN_PROGRESS |

## Perbaikan teruji dan pass kedua

Fixed housing tetap pada gantry sepanjang press; hanya `hydraulic-ram-reference` dan `blanking-pressure-plate` bergerak. Posisi rest disimpan per mesh dan dipulihkan pada stop/restart. Tes memastikan housing diam, rod/plate stroke sama, pause tidak mengubah posisi, dan reset tepat.

Tes fokus: 9/9 lulus. Suite penuh: 1.596/1.596 lulus. Build 41 mesin berhasil. Rilis koreksi mounting menunggu pipeline dan verifikasi produksi. Audit mesin belum selesai; cursor harus tetap BMJ-MCH-0021. Lanjutkan reconstruction contact loading/platform/tooling/separation/output sebelum mesin berikutnya; jangan menganggap interlock logis sebagai validasi kontak fisik.

## Lanjutan 14 Oktober — carriage contact

- Rilis housing `32f78ba364fe7d8c772d54fa652ddc815905205a` terverifikasi sukses: CI 38488879229, Cloudflare 38488879368, frontend 38488879230.
- Produksi memuat BMJ-MCH-0021, ABM-2, serial 2103072CGB05, tahun 2022, delapan sumber dan batas kesetaraan keluarga QF/LQF. Browser pemeriksaan tidak menyediakan WebGL dan beralih ke 2D; ini memverifikasi fallback/identitas, bukan kualitas visual kontak 3D.
- Center workpiece 0,810 → 0,7975 m; gap terhadap platform 12,5 → 0 mm. Center rest carriage 0 → −0,55 m; overhang 85 → 0 mm. Center saat press kembali 0 m sehingga mounting head tidak bergeser.
- Tes kontak memeriksa world bounds dan containment sepanjang 101 posisi indexing/registration serta restart. Tes fokus gabungan 10/10 lulus.
- Pass kedua mempertahankan housing diam, rod/plate bergerak bersama dan reset tepat. Loading, board/pin stroke, drop separation dan physical receiving tetap IN_PROGRESS; parameter ini tidak diganti dengan tebakan konfigurasi BMJ.
- Gate penuh 1.597/1.597 lulus; build 41 mesin berhasil. Kedua urutan interior/LOD, pause dan stop/reset diperiksa kembali dan carriage kembali tepat ke −0,55 m. Rilis lanjutan menunggu pipeline; cursor tidak berpindah.

## Lanjutan 14 Oktober — tooling, loading dan separation

- Rilis carriage `af769a8568828aacd6869be6e6efbe63aa2ab07f` terverifikasi sukses: CI 38494741746, frontend 38494742036, Cloudflare 38494741844.
- Pressure plate center 0,980 → 1,180 m; rod center 1,240 → 1,440 m. Board body center 0,860 → 1,1025 m; pin center 0,790 → 1,015 m. Posisi ini adalah rekonstruksi kontak model keluarga, bukan dimensi aktual serial BMJ.
- Board top 1,130 m bertemu plate bottom 1,130 m. Pin tip rest 0,925 m; stroke 160 → 100 mm menutup tepat ke stock top 0,825 m. Board, pin dan locator sekarang mengikuti rod/plate; barrel tetap diam pada gantry.
- Solid cylinders yang sebelumnya diberi label hole kini menjadi semantic reference tersembunyi; tidak dirender sebagai plug yang menonjol melalui board/plate.
- Gerak loading yang sebelumnya melayangkan stock dari staging dihapus. Demo dimulai dengan stock sudah duduk pada carriage; manual handoff tetap BLOCKED_EVIDENCE.
- Drop separation 45 → 0 mm menghilangkan penetrasi stock terhadap carriage padat. Extraction opening, waste/product separation fixture, serta transfer ke receiving tray tidak terverifikasi; physical output tetap BLOCKED_EVIDENCE. Counter siklus tidak membuktikan produk diterima tray.
- Pass kedua menyapu 401 posisi siklus: stock/support tetap kontak, board/plate tetap mounted dan pin tidak menembus stock. Kedua urutan interior/LOD, pause/resume/stop/reset serta show-only tidak memunculkan solid hole references. Tes fokus 11/11 lulus.
- Semua bagian telah ditelusuri; unknown input handoff, separation/extraction, actual receiving, utility/control/guarding as-built dan visual 3D tetap dicatat sebagai BLOCKED_EVIDENCE. Cursor tetap QF sampai rilis terbaru diverifikasi. Gate penuh 1.598/1.598 lulus; build 41 mesin, 19 unidentified, bundle 2.918.520 byte berhasil.
