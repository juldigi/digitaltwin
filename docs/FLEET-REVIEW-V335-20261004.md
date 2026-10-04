# V335 — pemeriksaan armada dan perbaikan simulasi

Tanggal: 4 Oktober 2026. Cakupan: seluruh 41 aset pada registry BMJ.

Perbaikan ini mengatasi kontrol simulasi mobile yang bertumpuk, hilangnya pengaturan alpha/depth material sesudah inspeksi, serta framing simulasi ketika ukuran canvas berubah. Tidak ada dimensi terpasang yang diganti dengan dimensi katalog generik. Mesin model-spesifik tetap dibedakan dari rekonstruksi family/reference; lulus pengujian perangkat lunak bukan sertifikasi kesamaan dengan unit fisik.

## Temuan dan perubahan

- Aturan grid mobile lama menempatkan konteks, mode, kecepatan, dan tombol pada sel yang bersaing. Grid dengan area bernama kini memberi konteks baris sendiri, mode/kecepatan baris sendiri, serta dua tombol aksi dengan lebar setara. Select memakai warna teks/surface tema yang sama, bukan `--ink` yang gelap di kartu gelap. Target aksi minimum 44 px dan teks panjang dapat membungkus.
- Kontrol Eksterior/Interior membedakan bentuk luar dengan potongan proses. Potongan bukan keadaan operasi fisik: penutup disembunyikan untuk menjelaskan mekanisme. Beralih tampilan tidak mengulang simulasi atau mengubah konfigurasi mesin.
- Offset 5 mempertahankan delapan PU, roller diagram aktual, upper deck terbuka, operator-side cabinet, dan custom installed dimensions. Normal view tidak ditutup dengan hood generik; potongan tidak menghapus mekanisme permanen.
- Reset Offset 5 sebelumnya membuat decal CanvasTexture tidak transparan dan mengubah depth-write efek UV. Material tersebut kini kembali ke alpha/depth yang dibuat pembangun model.
- Audit material tambahan menemukan cover opaque tetap `transparent=true` pada sheeter dan reference builders; kaca/HMI pada SX52, FZ1200, CX104 special, SP102, MK920, MK1060, Promatrix, MEDIA100, Diana Eye, Shark dan LY300 kembali `depthWrite=true`. Pemulihan bersama setelah polish menyimpan keadaan authored dan mengembalikannya saat ghost dinonaktifkan, termasuk material browser-only. Warna, geometri, dan pilihan OEM tidak diganti.
- Canvas resize saat simulasi melakukan fit ulang setelah aspect kamera diperbarui. Machine switch juga memperbarui ukuran canvas sebelum fit. Setelah panel simulasi dirender, fit berikutnya memakai layout yang sudah berubah.

## Pemeriksaan perangkat lunak

Semua audit di bawah dijalankan melalui export fungsi audit, bukan hanya membuka modul CLI yang tidak memiliki entry point.

| Pemeriksaan | Cakupan | Hasil |
|---|---:|---|
| Geometri, material finite, LOD silhouette, gerakan simulasi | 41 aset | 41 lulus |
| Camera framing desktop, portrait, operator | 41 aset | 41 lulus |
| Grounding dan motion | 41 aset | 41 lulus |
| Identitas node, taxonomy click resolution, ancestry, semantic click-through | 41 aset per audit | seluruhnya lulus |
| Dedicated dimension envelopes | 10 konfigurasi berdimensi | 10 lulus |
| Simulasi stage diversity dan visual semantics | 41 aset | 40 runnable; 1 blocked sesuai evidence |
| Bahasa stage | 40 simulasi, 318 stage | 0 isu |
| PDS process interlocks | 5 target | 0 pelanggaran |
| Runtime value presentation | 4 target | 0 isu |
| Browser-created lifecycle baru | 41 aset dengan canvas document | reset/highlight/ghost/cutaway/LOD/start/pause/resume/stop lulus; pose awal kembali |
| Material round-trip baru | 41 aset | transparent/opacity/depthWrite authored kembali |
| Offset 5 decal/UV dan portrait resize | regresi khusus | lulus |

Browser pengujian yang tersedia menonaktifkan WebGL. Test browser-created memakai canvas stub untuk menjalankan pembuatan material yang Node biasa lewati; tidak mengklaim pemeriksaan visual GPU. Aturan CSS diperiksa melalui sumber dan cascade; screenshot kontrol mobile di Safari belum terverifikasi karena browser ini tidak dapat menjalankan fixture lokal dan WebGL. Foto/nameplate/as-built diperlukan untuk menyelesaikan batas installed evidence di bawah.

## Pemeriksaan konfigurasi per aset

ID tabel memakai empat digit terakhir `BMJ-MCH-`. Seluruh aset mendapat perbaikan material dan framing bersama serta pemeriksaan lifecycle. Sumber merujuk katalog di bagian berikut dan ledger model yang sudah ada di `frontend/src/data/sources-*.js` dan `research-v139.js`.

| Aset | Identitas registry | Acuan pemeriksaan | Batas yang dipertahankan |
|---|---|---|---|
| 0001 | POLAR 115 EM MON | P1; clamp–knife–backgauge/air table | N115 adalah family terkini; bukan bukti generasi EM MON |
| 0002 | LEXUS HSM-CTM7 | P2; rollstand, web handling, lift/outfeed | HSM56 bukan CTM7; wording flat-bed/rotary tidak dipaksakan |
| 0003 | Offset5 CD102-8+L | foto BMJ, diagram aktual, custom dimensions; P3 metadata | 8 PU tetap; brosur bukan CAD serial BMJ |
| 0004 | Offset7 YA1A1A | registry dan reference boundary | model belum terselesaikan; simulasi diblokir, tidak mengarang konfigurasi |
| 0005 | Offset8 CX104-8+LYYL | P4; feeder–PU–coating–delivery | urutan custom dan installed options tidak dinormalisasi |
| 0006 | Offset9 SX52-4+L | P5; straight-print small-format family | tidak diasumsikan Anicolor karena artikel unit lain |
| 0007 | Pile Turner01 FZ1200 | P6; turning/airing/alignment | OEM/nameplate dan rating installed belum dikonfirmasi |
| 0008 | Pile Turner03 FZ1200 | P6 | tidak menganggap ketiga serial identik |
| 0009 | Offset10 CX104 special + FoilStar | P4, ledger Offset10 | urutan 2+LY–8+LY–1+L milik BMJ tetap |
| 0010 | Autoplaten2 SP102 | P7; cam-driven platen family | CE/SE/E/PER suffix tidak diwariskan dari artikel lain |
| 0011 | Autoplaten5 MK920YMI | P8; history dan spare architecture | drive foil/heater terkait YM bukan otomatis YMI installed |
| 0012 | Autoplaten6 MK920YMI-II | P8 | suffix II dipertahankan tanpa perbedaan mekanik rekaan |
| 0013 | Autoplaten7 MK1060ER | P9; feed/cut/strip/blank/waste | tabel ERS tidak dipakai sebagai rating pasti ER |
| 0014 | Autoplaten8 Promatrix106CSB | P10; cut/strip/blank/non-stop delivery | chase changer/pre-makeready adalah options |
| 0015 | Autoplaten9 Promatrix106CSB | P10 | tidak menganggap opsi serial sama dengan 0014 |
| 0016 | Folder Gluer1 MEDIA100II | P11; folder-gluer core flow; existing MEDIA ledger | current EXPERTFOLD bukan model MEDIA; opsi tidak diwariskan |
| 0017 | Folder Gluer2 model kosong | P11 family/reference | tidak diberi identitas MEDIA100II |
| 0018 | Folder Gluer3 MEDIA100II | P11, MEDIA ledger | carton styles/glue system installed belum pasti |
| 0019 | Diana Eye55 | P12; lighting/capture/processing/reject | jumlah kamera, 4K/8K dan backside/area camera adalah opsi |
| 0020 | FS-SHARK-N650-P3N1 | P13 EN/ZH; transfer/inspection/reject/collection | 630×300 versus 630×450 konflik; suffix tidak didekode |
| 0021 | Autoblanking2 QF-100CS | P14 QF1080 reference | bukan bukti exact QF100CS; rating/platform installed unknown |
| 0022 | Pile Turner2 FZ1200 | P6 | nama/OEM/rating installed unknown |
| 0023 | Collator model kosong | neutral collating reference | bin count, feeder, controller dan output option unknown |
| 0024 | Digital Inkjet UPG-LY300 | P15; baffle feeder/Ricoh G5/LED UV/line scan/plate reject | head spec versus line speed dibedakan; installed options perlu bukti |
| 0025 | CTP Heidelberg model kosong | P16 thermal family, existing Suprasetter ledger | exact family/drum/laser count/loader belum terbukti |
| 0026 | CTP Heidelberg model kosong | P16 | tidak menyalin opsi 0025 ke 0026 |
| 0027 | CTF SCREEN model kosong | P17 metadata; existing SCREEN ledger | capstan/internal/external drum tidak ditentukan tanpa model |
| 0028 | Zünd model kosong | P18; vacuum zones/gantry/modular tooling | G3 ukuran/tools/ARC/ITI bukan bukti installed |
| 0029 | Atlas Copco No2 | P19 oil-injected screw family | exact model, VSD, dryer, receiver, power unknown |
| 0030 | Atlas Copco No3 | P19 | installed configuration tidak disamakan dengan No2/9 |
| 0031 | KAESER No4 | P20 fluid-cooled SIGMA family | belt versus direct drive/controller/options unknown |
| 0032 | KAESER No6 | P20 | exact model/power/drive unknown |
| 0033 | SWAN No7 | P21 TS-AD family | exact series/coupling versus PM/VFD unknown |
| 0034 | KAESER No8 | P20 | exact drive/dryer/receiver unknown |
| 0035 | Atlas Copco No9 | P19 | exact model/VSD/power unknown |
| 0036 | AHU3 | P22 functional sections | OEM, coil type, airflow/section order unknown |
| 0037 | AHU4 | P22 | installed fan drive/filter class unknown |
| 0038 | AHU5 | P22 | drain/coil/mixing arrangement reference |
| 0039 | AHU6 | P22 | canonical flow bukan as-built section sequence |
| 0040 | AHU7 SANSIN | P23 brand-family; existing NES ledger | YZKJ45N/90N capacity/fan count/refrigerant unknown |
| 0041 | AHU8 | P22 | section order/controls/droplet eliminator unknown |

## Sumber internet yang diperiksa ulang

Status membedakan konten terbaca, hasil pencarian, dan URL gagal/redirect. Tidak ada hasil distributor acak yang dipakai untuk mengganti data BMJ. Sumber family tidak membuktikan installed machine.

| Kode | Penerbit dan URL | Dukungan / status |
|---|---|---|
| P1 | [HEIDELBERG cutting overview](https://www-server1.heidelberg.com/global/en/print_and_packaging/finishing/cutting/cutting___overview.jsp); [POLAR N115 sheet](https://www.polar-mohr.com/dl/14/29358/POLAR_High-Speed_Cutter_N_115_all_productsheet.pdf) | hasil search family; PDF kini redirect ke homepage, bukan manual EM MON |
| P2 | [BW Papersystems HSM56 PDF](https://www.bwpapersystems.com/docs/default-source/used-machines/lexus-2014-sheeter-500045.pdf?sfvrsn=ce1e827f_1); [used machines](https://www.bwpapersystems.com/products/used-machines) | PDF terbaca: HSM56, lift table, satu two-sided rollstand; bukan CTM7 |
| P3 | [HEIDELBERG CD102 brochure](https://www.heidelberg.com/global/media/es/global_media/products___sheetfed_offset/2020_20/product_brochures_1/speedmaster-cd-102-product-information.pdf) | ditemukan search; open gagal; bentuk tetap dari foto BMJ, tidak dari PDF yang gagal |
| P4 | [HEIDELBERG Indonesia CX104](https://www.heidelberg.com/id/id/printing/offset_printing/speedmaster_cx_104.jsp); [launch PDF](https://www.heidelberg.com/global/media/global_media/company___press_lounge/press_kits_1/2021_30/showtime_1/press_release/speedmaster_cx_104/20210622_E_Speedmaster_CX_104.pdf); [technical data PDF](https://www.heidelberg.com/global/media/en/global_media/products___sheetfed_offset/current_pictures/technical_data_1/technical-data-speedmaster-cx-104.pdf) | product terbaca; PDF search corroboration; AirTransfer/coating/PresetPlus family |
| P5 | [HEIDELBERG SX52 release](https://www.heidelberg.com/global/en/about_heidelberg/press_relations/press_release/press_release_details/press_release_114752.jsp); [2020 SX52 brochure](https://www.heidelberg.com/global/media/en/global_media/products___sheetfed_offset/2020_20/product_brochures_1/speedmaster-sx-52-product-information.pdf) | search metadata small-format family; tidak menentukan Anicolor installed |
| P6 | [UANCHOR FZ1200](https://www.playingcardsmachine.com/pile-turner/paper-stacker-pile-turner.html) | exact public model ditemukan; installed BMJ OEM tetap unknown |
| P7 | [BOBST SP102 cam-driven history](https://www.bobst.com/in/en/news/1662360438-bobst-celebrates-40-years-of-innovation-in-die-cutting) | terbaca; SP102-CE historical mechanism; suffix/rating tidak diwariskan |
| P8 | [Masterwork competitiveness](https://www.masterworkgroup.com/about-us/competitiveness/); [official spares](https://www.masterworkgroup.com/spare-parts-and-consumables/) | halaman terbaca; history/spare family corroboration |
| P9 | [Masterwork USA MK1060ER/ERS](https://www.masterworkusa.com/products/mk1060er-die-cutting-machine/) | terbaca; feed/cut/strip/blank/waste architecture; specs tabel ERS dibatasi |
| P10 | [HEIDELBERG Promatrix106CSB](https://www-server1.heidelberg.com/global/en/print_and_packaging/finishing/die_cutting/die_cutting__machines/promatrix_106_csb/promatrix_106_csb_1.jsp); [brochure](https://www.heidelberg.com/global/media/en/global_media/products___postpress_die_cutting/downloads_2/promatrix_106_cs_csb_lr.pdf) | product terbaca; blanking/non-stop delivery; optional changer tetap opsional |
| P11 | [BOBST folder-gluer overview](https://lebackend.bobst.com/usen/products/folding-gluing/folder-gluers/); [EXPERTFOLD](https://www.bobst.com/in/en/products/folding-gluing/expertfold-50-80-110) | search family corroboration; exact MEDIA100II manual baru tidak ditemukan |
| P12 | [HEIDELBERG Diana Eye](https://www.heidelberg.com/global/en/print_and_packaging/finishing/print_inspection_systems/offline/diana_eye_1.jsp); [42/55 brochure](https://www.heidelberg.com/global/media/en/global_media/products___postpress_offline_inspection/downloads_1/diana_eye_42_55_lr.pdf) | product terbaca; camera/lighting options tidak diasumsikan installed |
| P13 | [Focusight N650 English](https://en.focusight.net/en/Product/Printing/515.html); [Chinese](https://www.focusight.net/zh-cn/product/pro2/185.html) | English terbaca, Chinese search; max-format konflik dan unit paper weight literal dicatat |
| P14 | [UP GROUP QF1080C](https://www.shanghai-yuyin.com/QF-1080C-Automatic-Blanking-Machine-pd45746924.html); [LQ-QF1080C](https://www.shanghai-upg.com/LQ-QF-1080C-Automatic-Blanking-Machine-pd46586496.html) | product pertama terbaca; moving XY platform family, bukan exact QF100CS |
| P15 | [UPG LY300](https://www.upg-consumable.com/uv-piezo-inkjet-printer-product/) | terbaca; feeder/print/UV/camera/reject chain corroborated |
| P16 | [HEIDELBERG News 251](https://www.heidelberg.com/global/media/en/global_media/company___publications/heidelberg_news/editorial/pdf_10/HN_251.pdf); [News252](https://www.heidelberg.com/global/media/en/global_media/company___publications/heidelberg_news/editorial/pdf_10/HN_252.pdf) | search thermal/external-drum family; exact model BMJ kosong |
| P17 | [SCREEN Katana release](https://www.screen.co.jp/press/pdf/NR000310_02p.pdf); [newsbox9](https://www.screen.co.jp/ga_dtp/en/news/pdf/newsbox/vol9_pdf/newsbox_9_4.pdf) | release ditemukan search; newsbox open gagal; family ledger lama tidak ditingkatkan ke installed |
| P18 | [Zünd G3](https://www.zund.com/en/cutting-systems/digital-cutting-systems/g3-cutter) | terbaca; modular tooling dan zoned vacuum; G3 belum terbukti model BMJ |
| P19 | [Atlas Copco GA family](https://www.atlascopco.com/en-id/compressors/products/air-compressor/rotary-screw-compressor/ga-series); [GA30–90](https://www.atlascopco.com/en-id/compressors/products/air-compressor/rotary-screw-compressor/ga-30-90-plus-range) | search oil-injected family corroboration; installed model/power unknown |
| P20 | [KAESER fluid-cooled](https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/); [direct drive](https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-1-to-1-direct-drive/); [belt drive](https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-belt-drive/) | search corroboration: kedua drive tersedia; salah satunya tidak dipaksakan |
| P21 | [SWAN TS-AD](https://www.swan-aircompressor.com/en/products/screw/direct-driven-screw) | terbaca; flexible coupling/direct-drive family, bukan bukti series No7 |
| P22 | [Eurovent AHU group](https://www.eurovent.eu/product-group/pg-ahu-air-handling-units/); [AHU quality criteria](https://www.eurovent.eu/publications/eurovent-6-18-2022-quality-criteria-for-air-handling-units-first-edition/) | search technical family functions; tidak ada installed section drawing |
| P23 | [NES AC / PT Sansin Indonesia](https://www.nesacsentral.web.id/) | brand-family ditemukan search; direct open gagal; exact unit tidak diklaim |

Batas completion: perangkat lunak dan lifecycle armada diperiksa, masalah UI/material/framing ditangani. Kesamaan serial-per-serial dengan kondisi lapangan masih memerlukan foto seluruh sisi, nameplate dan drawing/opsi terpasang pada aset berstatus unknown/reference. Tidak ada hasil internet yang cukup untuk menggantikan bukti tersebut.
