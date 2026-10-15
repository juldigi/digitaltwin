# Audit detail interior, kemudian eksterior — 15 Oktober 2026

Base `887937a8f939709162667704c8d4b860d0034a13`; ketiga gate base telah SUCCESS. Mode kerja ini tidak memindahkan cursor mesin dan tidak mengaktifkan ulang automation.

Status keseluruhan **IN_PROGRESS**. Pemeriksaan geometri dan koreksi di bawah telah diproses; kesesuaian seluruh bangunan terpasang serta inspeksi visual 3D belum dapat dinyatakan selesai.

## Cakupan dan bukti

- Inventaris seluruh **10.927 mesh non-mesin**, mencakup **261.459 triangle** termasuk instance tanaman. Posisi setiap vertex ditransformasikan, termasuk instance; tidak ditemukan vertex nonfinite.
- Seluruh **20 konteks ruang** diperiksa melalui template aktif, shell, pintu, lantai/plafon, furnitur, akses dan penopangnya. Model memuat 17 ruang tertutup dan tiga zona fungsi terbuka. Label denah menjadi bukti fungsi/lokasi, bukan inventaris furnitur terpasang.
- Eksterior mencakup perimeter/bukaan, loading dock, atap utama, drainase, kanopi IPAL, fasad ruang operator, paving, taman dan gerbang. Lapisan atap berisi 336 mesh; landscape 135 mesh dengan 405 instance. Referensi tersembunyi tetap dihitung, tanpa dipromosikan menjadi peralatan terpasang.
- Arsip asli **IPAL.zip** berhasil dipulihkan: 15 HEIC IMG_2511–IMG_2525. Seluruhnya dilihat pada contact sheet; IMG_2516 dan IMG_2524 juga diperiksa pada resolusi penuh. Hash arsip/foto dan batas cakupan dicatat di `architecture-photo-evidence-20261015.json`. Foto menunjukkan kanopi terbuka, pot bertingkat pada rangka luar, paving, dan fasad operator di bawah awning. Foto tidak membuktikan interior kantor/toilet/gudang lain.
- Runtime produksi dibuka dan selesai memuat, tetapi tetap mengalihkan ke `?view=2d`; kontrol 3D dinonaktifkan dengan pesan “3D belum tersedia di perangkat ini”. Tidak ada klaim pemeriksaan visual 3D berhasil.

## Perbaikan interior yang terukur

Ukuran berikut berasal dari geometri model, bukan pengukuran bangunan aktual. Angka kontak diperiksa dari bounds dunia pada komponen terkait.

| Bagian | Sebelum | Sesudah |
|---|---|---|
| Kabinet wastafel toilet | Puncak kabinet 1,25 m menelan mangkuk yang puncaknya 0,96 m | Kabinet tetap setinggi 0,82 m, turun ke lantai; mangkuk terpasang di atasnya |
| 60 kaki kursi tamu/meeting | Celah 10 mm ke dudukan | Kaki mencapai dudukan; tidak menambah komponen |
| 18 penopang lengan kursi kerja | Terpisah 27,5 mm secara lateral dari dudukan | Penopang digeser ke tepi dudukan; bertemu secara fisik |
| Dua ragum workshop | Mengambang 52,5 mm di atas meja | Dasar menyentuh worktop |
| Empat tutup karton sparepart | Celah 13 mm | Menyentuh puncak karton |
| Bangku locker | Melayang 130 mm tanpa kaki | Blok bangku diturunkan sampai lantai |
| 12 sample QC | Celah 6,5 mm ke meja | Sample bertumpu pada worktop |
| 70 kontak lapisan trolley | Celah 7–42,5 mm | Lapisan berurutan menyentuh deck/lapisan sebelumnya |
| 24 sample pada proof rack | Mengambang 23 mm di atas tray | Sample menyentuh tray |
| 52 lapisan pada empat pallet RMS | Lapisan pertama menembus deck 4,5 mm; celah 2 mm antarlapis | Kontak kontinu dari deck ke setiap lapisan |
| Empat pelindung atas RMS | Celah 31,5 mm | Pelindung menyentuh lapisan terakhir |

Proses routing layer sebelumnya memasang parent dan setiap child ke layer tujuan secara terpisah. Akibatnya assembly rak/pallet/trolley menjadi kosong dan detailnya menjadi objek lepas. Routing kini mempertahankan child jika sudah berada di bawah layer tujuan melalui parent. Transform dunia, jumlah mesh, jumlah instance dan hasil audit footprint 20 ruang tetap sama. Uji regresi memastikan keempat assembly pallet RMS tetap memuat detailnya.

## Perbaikan eksterior

**Gerbang referensi:** jarak sumbu tiang 7 m dan tebal tiang 0,45 m membentuk bentang dalam 6,55 m, sementara daun hanya 5 m. Celah 0,775 m di kedua ujung ditutup dengan menyesuaikan daun ke sisi dalam tiang. Posisi tiang, bukaan keseluruhan dan clearance bawah daun 0,10 m dipertahankan. Gerbang tetap diberi status landscape reference, bukan hasil survei aktual.

**Awning ruang operator IPAL:** foto IMG_2524 mendukung atap miring dan rangka penopang di bawahnya. Model sebelumnya memakai rotasi panel −0,055 rad sementara purlin menanjak ke arah sebaliknya. Pemeriksaan vertex aktual menemukan ujung ketujuh purlin menembus bidang atap sekitar **189,74 mm**. Panel kini searah dengan penopang, dan setiap purlin ditempatkan berdasarkan triangle aktualnya sampai menyentuh underside atap. Ini memperhitungkan bentuk tabung enam sisi, bukan hanya radius lingkaran nominal.

Kedua purlin ujung diposisikan pada kolom yang sudah ada; jumlah member tidak ditambah. Tinggi kolom disesuaikan sampai bertemu permukaan bawah purlin. Knee brace tetap member yang sama. Talang berada pada tepi atap dan downpipe tersambung ke pusat talangnya. Lampu yang sudah difoto ditempatkan menyentuh triangle bawah beam. Footprint awning, ukuran panel, lokasi kolom, dimensi ruang dan identitas peralatan tidak diubah. Penyesuaian kontak ini tidak mengubah status dimensi foto sebagai perkiraan.

## Pass kedua dan validasi

- **249 pemeriksaan kontak terpilih:** 245 celah/occlusion positif dan empat penetrasi awal RMS pada baseline; setelah koreksi tidak ada deviasi kontak di atas toleransi 1 mm. Angka ini hanya untuk pasangan yang didefinisikan, bukan klaim seluruh collision bangunan nol.
- Ketujuh purlin awning menyentuh underside atap dalam toleransi numerik. Uji tambahan memakai vertex triangle, raycast lampu–beam, kontak kolom–purlin dan sambungan talang–downpipe.
- Regresi khusus turut mempertahankan perbaikan curb exhaust, clearance PV, arah drain shoe, floor arrow, sumber denah, akses ruang, IPAL terbuka, dimensi/posisi/orientasi mesin serta perbaikan dinding sebelumnya.
- Full regression, build, commit, workflow dan hash produksi dicatat dalam `interior-exterior-audit-progress.json`. Tidak menganggap metadata legacy `doubleWallOverlaps: 0` atau HTTP 200 sebagai bukti visual.

Inventaris per mesh beserta konteks ruang/assembly dan batas dunia: `interior-exterior-audit-after-20261015.json`. Pengukuran baseline: `interior-exterior-audit-before-20261015.json`. Reproduksi hasil akhir: `node scripts/audit-interior-exterior.mjs`.

## Sisa pemeriksaan dan BLOCKED_EVIDENCE

| Bagian | Status dan batas |
|---|---|
| Semua ruang | CODE_GEOMETRY_PROCESSED; foto aktual furnitur, finish dan dimensi ruang selain yang terlihat pada foto IPAL masih BLOCKED_EVIDENCE |
| Seluruh interior/eksterior visual | IN_PROGRESS: perlu walk-through 3D untuk occlusion, normal, pencahayaan, corner, toggle dan persepsi skala |
| Perimeter, tinggi dinding dan roof junction | BLOCKED_EVIDENCE dari audit dinding sebelumnya tetap berlaku; jangan menaikkan perkiraan menjadi dimensi terukur |
| Ruang operator IPAL | Fasad/awning diperiksa terhadap foto; profil gable, penutupan atas dan susunan atap ruangnya sendiri masih perlu rekonsiliasi lebih lanjut; tidak dinyatakan lengkap |
| Trolley referensi | Geometri dudukan caster ke deck dan support bawah blank trolley masih belum lengkap; konfigurasi mount/perangkat tambahan tidak direkayasa sebagai hardware terpasang |
| Loading dock, jalan dan gerbang umum | Geometri model diperiksa; inventaris/pengukuran lapangan, drain outlet dan susunan terpasang belum terkonfirmasi |
| Interior listrik/MEP, keselamatan dan struktur | Tidak dilakukan sertifikasi engineering, routing aktual, fire rating atau kepatuhan bangunan |

Foto aktual IPAL telah pulih; blocker ini tidak lagi dicatat sebagai arsip hilang. Foto tersebut tetap tidak menghilangkan kebutuhan bukti untuk area lain.

## Hasil pengujian lokal kode final

Full regression: **1.636/1.636 PASS**, tanpa gagal/skip, 275.972,737 ms. Build PASS. Source dan dist `factory-building.js` cocok: SHA256 `1d17f428178a2dc6adcc1eae249dd3eabd83c5f3d0ddbcbe01505088f23506aa`. Rilis menunggu gate pipeline; audit visual/as-built tetap IN_PROGRESS.
