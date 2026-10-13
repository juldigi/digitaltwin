# Audit mesin utuh BMJ-MCH-0016 — Folder Gluer 1 / BOBST MEDIA 100 II

Tanggal audit: 2026-10-13  
Mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`  
Urutan fungsi: blank feeder → alignment/pre-break → forming → glue → final fold/trombone → compression → delivery, ditambah drive/control, frame/access, simulasi dan navigasi.

## Batas bukti

- Identitas terpasang berasal dari registry BMJ: `BMJ-MCH-0016`, FGM-1, model MEDIA 100 II, serial `0341 06903`.
- Tidak ada foto aktual FGM-1 yang terpetakan di inventaris repository (`docs/fleet-photo-workspace-audit-v354.md`). Bentuk dan proses memakai brochure keluarga BOBST MEDIA II dan rekaman mesin pasar MEDIA 100 II yang sudah tercatat di `sources-media100.js`; sumber tersebut bukan bukti opsi yang terpasang pada serial BMJ.
- Suffix A1/A2, panjang envelope aktual, minimum blank aktual, jenis/jumlah glue head, glue pump/disc, crash-lock/4-6 corner package, kicker/ejector, control generation, inspection dan aksesori delivery tetap `BLOCKED_EVIDENCE`. Tidak ada hardware baru yang ditambahkan.

## Pass pertama: temuan dan perbaikan

| Bagian | Pemeriksaan | Temuan sebelum | Perbaikan / status |
|---|---|---|---|
| Feeder dan blank input | tumpuan pile, pickup, belt entry | tumpukan berhenti di Y≈0,629 m sedangkan belt crown berada di Y≈0,773 m; jalur karton awal Y=0,840 m sehingga tampak melayang | pile referensi dibuat kontinu sampai Y≈0,752 m; jalur pickup Y=0,758→0,783 m dan menyentuh belt. `COMPLETE` untuk geometri fungsi; detail feeder terpasang tetap `BLOCKED_EVIDENCE` |
| Alignment / pre-break | guide, belt, jalur | jalur Y=0,800 m meninggalkan celah sekitar 8 mm dari blank ke belt top | pusat jalur menjadi Y=0,792 m untuk kontak tipis terhadap belt top ≈0,783 m. `COMPLETE` |
| Forming / conversion | belt dan opsi folding | crash-lock hook terlihat sebagai hardware terpasang walaupun konfigurasi serial tidak terbukti | crash-lock hook dan servo/corner package dipertahankan hanya sebagai capability reference tersembunyi; taxonomy tidak lagi menandai `BOTTOM` sebagai installed-verified. Straight-line demo tetap tidak menggerakkan lock-bottom flap. `BLOCKED_EVIDENCE` untuk kit aktual |
| Glue | applicator, pump, glue-on-blank timing | dua disc dan pump terlihat walaupun jenis/jumlah glue system serial tidak terbukti | disc, pump dan upper heads disembunyikan sebagai capability-only; taxonomy `LOWER` tidak lagi verified. Glue stripe simulasi tetap demo-only dan baru muncul sesudah zona glue. `BLOCKED_EVIDENCE` untuk konfigurasi aktual |
| Final fold / trombone | belt, rail, opsi kicker | kicker sudah tersembunyi; route pada belt cukup dekat | evidence boundary dipertahankan; jalur Y=0,910 m mengikuti trombone crown ≈0,900 m. `COMPLETE` untuk fungsi keluarga; kicker `BLOCKED_EVIDENCE` |
| Compression | upper/lower belt dan stroke | lower belt top ≈0,750 m, upper bottom ≈1,000 m, sedangkan karton Y=0,880 m: celah bebas besar dan tidak ada compression contact | lower/upper belt dipasang pada Y=0,880/0,930 m, jalur karton Y=0,905 m, stroke visual upper carriage 4 mm. Blank tebal 18 mm sekarang beririsan ringan dengan kedua belt sebagai kontak kompresi. `COMPLETE` |
| Delivery | roller crown, table, output stack | route Y=0,840 m dan output stack Y=0,830 m tidak mengikuti crown roller lama; output tampak turun/melayang | exit roller menjadi Y=0,870 m (crown ≈0,930 m), route exit Y=0,940 m, output stack mulai Y=0,945 m, table dinaikkan untuk support. `COMPLETE` |
| Drive/control/frame | rotor whitelist, support, identity | tidak ditemukan gerak pada crossbar, cylinder, tombol atau opsi tersembunyi | 26 rotor hanya berasal dari feeder pulley, glue reference, trombone, exit, motor dan line drive. Detail instalasi drive/control tetap `BLOCKED_EVIDENCE` |
| Display dan taxonomy | highlight, ghost, isolate, show-only, interior, LOD | 238 mesh berbagi sedikit material mutable; highlight/ghost satu bagian dapat bocor ke bagian lain dan hasil tergantung urutan traversal | setiap dari 252 mesh memakai material mutable sendiri; highlight/ghost terlokalisasi. Baseline visibility menjaga capability-only tetap tersembunyi setelah isolate, interior, LOD dan reset. `COMPLETE` |

Envelope family-reference sesudah perbaikan adalah sekitar 11,500 × 1,593 × 2,7325 m pada axis X/Y/Z. Nilai ini bukan ukuran instalasi BMJ dan tidak dipromosikan menjadi engineering dimension.

## Pass kedua

- Menjalankan ulang start → pause → resume → stop/reset: elapsed tidak meloncat saat resume, output dibersihkan saat start/stop, upper compression kembali ke rest.
- Memeriksa dua urutan display: LOD→interior→normal dan interior→LOD→normal. Enam belas mesh capability-only tetap tersembunyi.
- Memeriksa highlight/ghost feeder terhadap compression: material feeder tetap opacity alami, compression tepat 0,14 saat ghost, emissive tidak bocor.
- Memeriksa seluruh delapan stage UI dan tujuh zona mekanis simultan; carton folding tetap position-based, glue menempel pada blank setelah aplikasi, dan output pile berada pada exit support.
- Memeriksa taxonomy enam level untuk FGM-1 dan FGM-3. Identitas/serial tetap terpisah; perubahan shared template tidak mengubah FGM-3 menjadi bukti instalasi FGM-1.

## Validasi

- Tes fokus: 46/46 lulus (`tests/media100.test.mjs` + `tests/machine-runtime.test.mjs`).
- Tes penuh dan build dicatat pada release gate commit ini.
- Status saat laporan dibuat: `RELEASE_PENDING`; cursor tidak dipindah sampai workflow dan produksi terverifikasi.

