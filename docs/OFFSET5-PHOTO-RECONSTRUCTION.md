# OFFSET 5 — rekonstruksi geometri dari foto

## V320 — evidence precedence & cross-system contact guard (2026-10-02)

Deep-dive lanjutan terhadap `IMG_2777.jpeg` dan prosedur OEM `SMCD102_roller_remove_procedure.pdf` menemukan bahwa tabel prosedur generik SM/CD102 **tidak boleh dipakai untuk menimpa kondisi terpasang Offset 5**. Beberapa baris material/color memang berbeda dengan diagram yang terpasang di mesin BMJ.

- Authority kondisi terpasang tetap `IMG_2777.jpeg`: roller 15 = white/rubber-coated; 17/ZW = rubber-coated; 18/T = plastic-coated; 19/DW = rubber-coated + crowned; distributor A = stainless steel.
- Prosedur OEM tetap dipakai sebagai **REFERENCE_ONLY** untuk removal/installation sequence dan ink-stripe/contact-setting reference, bukan sebagai pengganti visual installed configuration.
- Konflik sumber dicatat eksplisit di source registry agar build berikutnya tidak kembali mengubah material roller hanya karena tabel OEM generik berbeda.
- Contact cross-system **roller 14 (white inking form roller 1) ↔ roller 17/ZW** sekarang dicatat eksplisit. Diagram aktual memperlihatkan pasangan ini, dan prosedur OEM memberi reference ink stripe 3 +1 mm.
- OEM contact references untuk 15↔fountain, 15↔A, form rollers↔C/D, form rollers↔plate, dan 14↔17 disimpan sebagai metadata service-reference dengan `installedSettingVerified=false`.
- Motion yang sudah ada untuk roller 15 dan distributor A–D sekarang memiliki provenance/boundary jelas: fungsi gerak divisualisasikan, tetapi amplitude, phase, RPM, dan service setpoint tidak diklaim sebagai data serial 550415.


## V319 — actual printing-unit roller diagram (2026-10-02)

Bukti baru `IMG_2777.jpeg` adalah foto **ROLLER DIAGRAM HEIDELBERG CD-102** yang terpasang pada mesin. Revisi V319 menjadikannya single source of truth untuk identitas dan tabel roller pada seluruh PU1–PU8, tanpa mengubah dimensi custom BMJ yang sudah dikunci.

- Inking roller 1–15 memakai designation, diameter nominal, color code dan material/remark yang terbaca pada diagram aktual.
- Distributor A–D dikoreksi: A = stainless steel; B/C/D = plastic-coated.
- Dampening dikoreksi: 16/FEAW = rubber-coated; 17/ZW = rubber-coated; 18/T = plastic-coated; 19/DW = rubber-coated + crowned; FR = chromium-plated.
- Warna identifikasi roller form/transfer pada model dipisahkan dari material struktur, sehingga biru/merah/kuning/putih tetap terlihat sebagai rubber-coated, bukan painted-steel.
- Urutan sectional `plate cylinder → blanket cylinder → impression cylinder` dinaikkan menjadi bukti foto-diagram. Transfer cylinder tetap reference-only karena tidak ditampilkan pada IMG_2777.
- Simulasi ink film sekarang mencakup roller 1–15 **dan distributor A–D**; dampening memakai film visual tipis pada 16/17/18/19/FR. Tidak ada droplet tinta/air floating.
- Arah/timing individual roller tetap simulasi kinematik visual; IMG_2777 tidak digunakan untuk mengarang nip pressure, bearer diameter, timing, phase, stripe setting, atau service setpoint.
- Exterior delapan PU tetap memakai geometri foto BMJ dan dimensi custom OFU-1; variasi warna sintetis antar-PU di fountain-support dihapus.
- Baseline visual yang sebelumnya benar pada V404/V405/V408 dipulihkan: **upper deck setiap PU tetap terbuka**, tidak ada solid hood/top cap, operator-side cabinet tetap melengkung, dan visible green ink-duct/fountain service roller tetap terlihat pada normal view termasuk mobile LOD.
- Proporsi visible green duct roll dikunci kembali ke baseline V408 (radius visual 0.135 scene-unit, span 1.46 scene-unit). Nilai ini adalah photo-reconstruction visual, bukan diameter OEM/service measurement.
- Ink-film color di open bay adalah visualisasi job-state per PU; warna tersebut tidak mengubah identitas material roller pada diagram aktual.
- RAKEL, AIR BLOWER (upper inking + blanket/impression zone), dan WATER dekat 18/T kini memiliki node/taxonomy tersendiri. Diagram mengonfirmasi zona callout saja; angle, pressure, nozzle bore, chemistry, flow dan setpoint tidak diklaim.
- Arah putar roller tidak lagi dibuat dengan pola ganjil/genap array. Simulasi memakai contact graph dari topology IMG_2777: setiap pasangan kontak counter-rotate, dengan surface-speed visual reference. Timing, phase, nip pressure dan RPM servis tetap tidak diklaim.
- Regression exterior yang menutup setiap PU dengan solid upper hood/closed ink enclosure dibatalkan. Baseline foto V404/V405/V408 dikembalikan: **upper deck OPEN**, tidak ada full-depth top beam/cap, ink-duct bay tetap terbuka, roller duct/service hijau tetap terlihat, dan operator cabinet mempertahankan identitas HEIDELBERG Speedmaster.
- Roller hijau yang terlihat di open-top diperlakukan sebagai visible fountain/duct service roller dari foto BMJ dan **tidak** diberi nomor 1–19 dari IMG_2777. Warna hijau tidak ditimpa warna job ketika simulasi berjalan; warna proses ditunjukkan oleh ink film dan roller train yang relevan.

## Perubahan

Model tujuh balok diganti dengan rekonstruksi bentuk luar yang bisa dipilih:

- Feeder berupa portal terbuka, rel, kepala feeder dan selang yang terlihat, pile lembar, serta meja kontrol.
- Meja transfer feeder, deretan housing melengkung, kisi pelindung, bak tinta dan roller atas.
- Pijakan antarunit, platform dengan pola pelat bordes berupa instanced geometry, dan tangga akses.
- Passage ke delivery, rangka delivery, panel terang, jendela gelap, serta pagar batang vertikal.
- Baseline V9 memperinci jalur feeder sampai PU1: guide pile, linkage kepala feeder, rear-edge separator, suction tape/pressure roller, front/side lay, infeed gripper, serta referensi roller dampening, plate-clamp, dan distribusi tinta PU1.
- Baseline V10 memperinci gripper system PU1 dan transfer PU1–PU2: impression gripper bar/shaft, finger, pad, pivot, end support, return-spring reference, operating lever, cam follower, dan opening-cam reference.
- Baseline V11 mengoreksi PU1: urutan plate–blanket–impression–transfer dibuat near-nip tanpa penetrasi volume, roller dampening/inking dipisahkan, dan taxonomy cylinder assembly serta jalur lembar diperinci.
- Baseline V12 memakai foto `IMG_1628(2).jpeg` dari arah feeder menuju delivery untuk mengoreksi PU1 top deck, grille longitudinal, shoulder cover, ink-fountain bridge, dan support arm tanpa mengubah internal non-overlap V11.

Acuan: foto aktual BMJ yang terdaftar di source registry, termasuk IMG_2777 sebagai internal roller-diagram reference. Tidak ada foto asli atau berkas DWG pabrik yang diterbitkan bersama frontend.

## Bukti dan batas

| Foto | Acuan bentuk |
| --- | --- |
| IMG_1624.jpeg / IMG_1625.jpeg | Portal feeder, pile, kepala feeder dan selang |
| IMG_1626.jpeg | Meja transfer, kisi dan roller terlihat |
| IMG_1627.jpeg / IMG_1628.jpeg | Cover melengkung, pola deretan, pijakan dan platform |
| IMG_1970.jpeg / IMG_1971.jpeg | Bak tinta dan roller atas terbuka |
| IMG_2312.jpeg / IMG_1656.jpeg | Delivery, panel atas, jendela, pagar dan tangga |

Seluruh dimensi adalah **VISUAL_ONLY / APPROXIMATE**. Delapan housing merupakan susunan rekonstruksi yang masih perlu verifikasi; jumlah/penomoran unit, coating, dryer, spesifikasi inspeksi dan komponen internal tidak dinyatakan terverifikasi. Warna tinta adalah ilustrasi. Foto tidak memberikan pengukuran dimensi aktual.

Istilah dan urutan fungsi feeder–PU1 diperkaya dari brosur Speedmaster CD 102, paten Heidelberg untuk suction-belt feed table (US5697606A), paten sheet alignment (US6681697B2), dan manual Preset Plus Feeder yang diarsipkan. Referensi tersebut tidak membuktikan konfigurasi terpasang, jumlah roller, diameter, nip, timing, phasing, atau setting mesin Offset 5; semua detail yang tidak tampak pada foto tetap ditandai **REFERENCE_ONLY** atau **MEDIUM_CONFIDENCE**.

DWG `250804 layout offset(1).dwg` berhasil diproses dengan @mlightcad/libredwg-web 0.7.11. Hasil awal: 37.943 entitas database; header INSUNITS=4; teks OFFSET 5 ditemukan pada handle 2337F. Angka tersebut adalah hasil ekstraksi awal, bukan jumlah objek fisik terverifikasi. Posisi teks bukan bukti footprint atau titik pusat mesin. Layout dan transformasi penempatan tidak diubah pada revisi geometri ini.

## Interaksi

- Pilih kelompok utama atau subkelompok pada tab Struktur; raycast mesh mengarah ke subkelompok pemiliknya.
- Slider tanpa pilihan memisahkan kelompok utama. Dengan pilihan, hanya anak langsung pilihan (atau pilihan jika merupakan leaf) yang bergerak. Bagian lain menjadi transparan.
- Isolasi mempertahankan visibility ancestor agar objek pilihan tetap terlihat.
- Rakit kembali, Reset, dan klik ganda mengembalikan transformasi tersimpan.
- Mode ringan menghilangkan detail pola bordes dan bayangan.
- Geometri statis digabung per kelompok/material. Baseline V12 memiliki 341 mesh/instance batches, 42 instanced mesh, 93 node geometri yang bisa dipilih, dan 674 node taxonomy enam tingkat. Registry berisi 23 foto unik dengan 15 foto aktif pada baseline.

## Validasi

Build lokal dan 46 pengujian Node lulus, termasuk uji matematis non-overlap empat silinder utama PU1, resolusi taxonomy feeder–PU1 dan gripper system, explode terpilih, reset berulang, hierarki, isolasi, nilai geometri finite, batas envelope, anggaran mesh mobile, serta regression backend. Envelope visual tetap 15,72 × 2,83 × 4,19 m. QA visual pada perangkat fisik dan verifikasi terhadap pengukuran mesin nyata tetap diperlukan.
