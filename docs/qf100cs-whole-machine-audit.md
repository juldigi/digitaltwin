# BMJ-MCH-0021 QF-100CS — audit mesin utuh berjalan

Tanggal: 14 Oktober 2026. Mode `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`.
Identitas registry: ABM-2, serial 2103072CGB05, tahun 2022.

## Bukti dan batas

Sumber repository: `taxonomy-qf100cs.js`, `research-v123.js`, profile/runtime QF dan referensi keluarga QF1080B/C serta LQF1080CS. Exact-model public documentation, installed head count, tooling pattern, collector/stacker, pressure, envelope dan brand komponen BMJ belum terverifikasi. Association Jaya Makmur Mesindo–BMJ tidak membuktikan pemasok ABM-2. Semua unknown ini tetap `BLOCKED_EVIDENCE`.

## Urutan dan hasil pengukuran awal

| Bagian nyata | Pengukuran / temuan | Status |
|---|---|---|
| Stack staging / loading | Table top 0,590 m; workpiece center 0,810 m dengan tebal 55 mm, sehingga bottom 0,7825 m belum didukung saat loading. | IN_PROGRESS |
| X/Y moving platform | Working face 0,770 m; workpiece bottom 0,7825 m, gap 12,5 mm. Pada awal indexing platform center 0 sementara piece center −0,55; half width platform 0,825 dan piece 0,36 menyebabkan overhang 85 mm. | IN_PROGRESS |
| Fixed hydraulic head | Housing, rod dan plate sebelumnya bergerak sebagai satu group sebesar 160 mm; housing kehilangan mounting gantry. | Housing kini fixed; rod/plate stroke bersamaan. COMPLETE untuk koreksi mounting; contact masih IN_PROGRESS. |
| Pin-board / tooling | Board bottom 0,8325 m, top 0,9175 m; pressure plate rest bottom 0,930 m. Stroke 160 mm masih perlu direkonstruksi bersama pin-board dan stock agar tidak menembus tooling. | IN_PROGRESS; pola instalasi BLOCKED_EVIDENCE |
| Separation / waste support | Interface stock reference 0,7125–0,7475 m. Dinamika drop workpiece dan support aktual perlu ditelusuri sebelum klaim kontak. | IN_PROGRESS |
| Product receiving | Tray top 0,5775 m, x 1,22–1,94 m. Workpiece demo kembali ke platform dan belum mencapai tray; counter bukan bukti output fisik. | IN_PROGRESS |
| Hydraulic utility / controls / guarding | Keluarga PLC, servo dan hydraulic tersedia; brand, pressure dan route instalasi tidak terbukti. | BLOCKED_EVIDENCE; mode/mounting audit IN_PROGRESS |
| Normal/interior/LOD, taxonomy, factory parity | Gate runtime truth lulus; kedua urutan toggle dan pass visual mendalam belum ditutup. | IN_PROGRESS |

## Perbaikan teruji dan pass kedua

Fixed housing tetap pada gantry sepanjang press; hanya `hydraulic-ram-reference` dan `blanking-pressure-plate` bergerak. Posisi rest disimpan per mesh dan dipulihkan pada stop/restart. Tes memastikan housing diam, rod/plate stroke sama, pause tidak mengubah posisi, dan reset tepat.

Tes fokus: 9/9 lulus. Suite penuh: 1.596/1.596 lulus. Build 41 mesin berhasil. Rilis koreksi mounting menunggu pipeline dan verifikasi produksi. Audit mesin belum selesai; cursor harus tetap BMJ-MCH-0021. Lanjutkan reconstruction contact loading/platform/tooling/separation/output sebelum mesin berikutnya; jangan menganggap interlock logis sebagai validasi kontak fisik.
