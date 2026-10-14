# Audit mesin utuh BMJ-MCH-0023 — Collator Machine

Tanggal: 14 Oktober 2026. Mode `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`.

## Batas bukti

Registry BMJ hanya menetapkan identitas fungsi `COLLATOR MACHINE`; OEM, model, serial, tahun, jumlah bin, dimensi, orientasi instalasi dan perangkat downstream tidak tersedia. Twin tetap berupa intersection proses multi-vendor, bukan rekonstruksi mesin terpasang. Bukti primer yang dibaca ulang: Horizon VAC-1000 (rotary suction, IR double-feed sensing, touchscreen), Horizon VAC-L600H (individual bin blowing dan suction rotor), serta Duplo DSC-10/60i (dual-fan separation dan double-feed sensing). Sepuluh bin tetap dinyatakan sebagai referensi visual, bukan klaim jumlah bin BMJ.

Sumber: https://www.horizon.co.jp/products/en/products/collators/vac1000/vac1000_e.html ; https://www.horizon.co.jp/products/en/products/collators/vacl600h/vacl600h_e.html ; https://www.duplousa.com/product/dsc-10-60i-collator/ .

## Audit hulu–hilir

| Bagian fungsi | Hasil | Status |
|---|---|---|
| Feed-bin tower / sheet stack | Lembar proses awal sebelumnya berada pada pusat shelf dan sudah terlihat sebelum feed. Titik awal dinaikkan 50 mm ke permukaan stack; transient sheet kini tersembunyi sampai window feed. | COMPLETE |
| Per-bin separation / suction rotor | Urutan air separation, rotor pickup dan blower diperiksa. Fungsi didukung referensi keluarga; topology/nozzle/blower BMJ tidak diketahui. | BLOCKED_EVIDENCE instalasi; logika lulus |
| Feed integrity sensing | Double/miss-feed dan bin-empty state mengikuti feed aktif. Tipe/populasi sensor BMJ belum terbukti. | BLOCKED_EVIDENCE instalasi; logika lulus |
| Vertical gathering transport | Sepuluh feed window bergerak ke common gathering path tanpa teleport; rotor hanya berputar untuk bin aktif. | COMPLETE |
| Set delivery conveyor / jog | Set sebelumnya 42–49 mm menembus belt dan antarlembar overlap 2 mm. Output disusun mulai y=0,6085 m: sisi bawah set tepat pada belt top y=0,6025 m, pitch 12 mm sama dengan tebal sheet. | COMPLETE |
| Downstream handoff | Interface dijaga sebagai option boundary; stacker/stitcher/finisher tidak diklaim terpasang. | BLOCKED_EVIDENCE |
| HMI / bin I-O | Stage label kini mengikuti window proses sebenarnya, bukan enam pembagian waktu sama. Exact controller, guard dan interlock BMJ belum tersedia. | BLOCKED_EVIDENCE instalasi; state lulus |
| Normal/interior/LOD/taxonomy | Dua urutan interior/LOD, show-only, ghost, explode, reset dan taxonomy level 1–6 diperiksa. | COMPLETE |

## Pass kedua dan validasi

World-space bounds diukur pada geometry runtime. Delivery belt berada pada y=0,5775–0,6025 m; set hasil sekarang mulai pada y=0,6025 m dan setiap pasangan sheet bersentuhan tanpa penetrasi. Start, pause, resume, stop dan restart menjaga visibilitas serta posisi rest. Identitas unknown dan seluruh evidence boundary dipertahankan; tidak ada hardware baru yang ditambahkan.

Tes fokus Collator dan regresi keluarga: 85/85 lulus. Suite penuh 1.603/1.603 lulus; build menghasilkan 41 mesin, 19 unidentified dan bundle 2.918.520 byte. Pemeriksaan visual produksi dilakukan setelah deployment; browser tanpa WebGL hanya dapat memverifikasi fallback, sehingga visual 3D tidak akan diklaim tanpa render aktual.

## Rilis

Status sementara `RELEASE_PENDING` sampai commit implementasi, seluruh workflow dan produksi terverifikasi. Cursor tidak berpindah sebelum gate tersebut selesai.
