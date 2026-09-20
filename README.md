# BMJ Packaging Offset — Factory Digital Twin V58

Digital Twin interaktif untuk area **Packaging Offset PT Bukit Muria Jaya**. V58 melanjutkan hasil recovery dari riwayat build yang terverifikasi setelah repositori lama tidak lagi tersedia.

## Pembaruan V58

- Sheeting Lexus menjalankan **continuous web sebelum knife**, lalu membuat **individual cut sheet hanya setelah cutter**.
- Reel, roller, chuck, dan drive berputar terhadap sumbu lokal cylinder sehingga tidak wobble.
- Layboy menurunkan lift table secara progresif saat pile bertambah agar receiving height tetap konsisten.
- Geometry feed/delivery dirapikan: roller dekoratif dikurangi, delivery menggunakan pola belt/overlap yang lebih terbaca, dan pile statis dihapus dari geometry dasar.
- Frontend dan API dipublikasikan melalui **Cloudflare Workers Static Assets** dari repo private; GitHub Actions untuk frontend dipakai sebagai build/test verification, bukan GitHub Pages.

## Cakupan V58

- **41 equipment** dari database mesin Packaging Offset.
- **4 digital twin khusus** dengan rekonstruksi lebih detail: Offset 5 / OFU-1, Offset 10, APM 2, dan Sheeting Lexus.
- **37 equipment lainnya** memakai builder parametrik berbasis keluarga proses agar seluruh database dapat dibuka dalam 3D tanpa mengklaim detail OEM yang belum terverifikasi.
- Taxonomy **6 tingkat**: Mesin → Unit Utama → Sub → Block → Part → Spesifik Part.
- Mode **3D mesin**, **denah pabrik**, cutaway/exterior, explode, isolate, component labels, kamera fokus, dan simulasi proses.
- Rendering Three.js lokal dengan fallback tampilan ketika WebGL tidak tersedia.
- Layout pabrik memakai data yang dipulihkan dari DXF/layout aktual; posisi yang belum tervalidasi tetap diberi status approximate/reconstruction.

## Mesin khusus

### Offset 5 — OFU-1
Heidelberg Speedmaster **CD 102-8+L**, serial **550415**, tahun **2011**. Geometry mencakup feeder, PU1–PU8, transfer/gripper, coating/dryer, inspection dan delivery. Foto aktual serta referensi teknis yang tersedia dipakai sebagai acuan visual; detail yang tidak dapat dibuktikan tidak diperlakukan sebagai CAD resmi.

### Offset 10
Heidelberg Speedmaster **CX104-2-LY-8-LY-1-LX3**. Model menggunakan dokumen proyek/final drawing Heidelberg yang tersedia, termasuk konfigurasi UV, FoilStar dan X3 delivery. Field database yang belum tersedia tetap ditandai unknown, bukan diisi dengan asumsi.

### APM 2
BOBST **SP 102**, serial **57115506**, tahun **1994**. Model proses mencakup feeder, register/SideLay, gripper chain, platen, stripping dan delivery. Varian/suffix yang belum terkonfirmasi tidak diklaim.

### Sheeting Lexus
Identitas pabrik **HSM-CTM7**, serial **00982**, kode **SBM-2**, tahun **2014**. Geometry khusus mempertahankan orientasi proses kanan → kiri dan memakai Lexus HSM 56 hanya sebagai family reference, bukan klaim bahwa HSM-CTM7 identik dengan varian tersebut.

## Data dan confidence

Registry membedakan informasi **verified**, **recovered**, **family reference**, dan **approximate**. Equipment generik tetap dapat dieksplorasi, tetapi bentuk proseduralnya bukan pengganti drawing OEM. Posisi layout yang belum memiliki anchor terverifikasi juga tidak dianggap sebagai posisi final.

## Menjalankan secara lokal

Memerlukan Node.js 24.

```sh
npm ci
npm run build
npm test
npm run dev
```

Buka alamat yang ditampilkan oleh server development. Jangan menjalankan aplikasi melalui `file://`.

## Deployment

Repo tetap private di **`juldigi/digitaltwin`**. `npm run build` menghasilkan folder `dist`, kemudian workflow Cloudflare menjalankan Wrangler dari `backend/`. Binding `ASSETS` pada Worker menyajikan frontend dari `../dist`, sedangkan route `/api/*` ditangani oleh Worker dan D1. Lihat `docs/DEPLOYMENT.md`.

## Struktur penting

- `frontend/src/app.js` — routing UI dan machine context.
- `frontend/src/engine.js` — scene, camera, selection, transform dan renderer.
- `frontend/src/offset5.js`, `offset10.js`, `apm2.js`, `sheeting.js` — geometry khusus.
- `frontend/src/universal-machine.js` — builder keluarga proses untuk equipment lainnya.
- `frontend/src/data/machine-registry.js` — registry 41 equipment.
- `frontend/src/data/plant-layout-data.js` — data layout yang digunakan aplikasi.
- `tests/` — regression, geometry, registry, backend dan UI tests.
- `backend/` — Workers API + D1 + static asset binding.

## Prinsip recovery

V58 mempertahankan hasil kerja yang dapat dipulihkan dan menghindari mengarang dimensi, serial, layout, taxonomy, atau part yang tidak didukung sumber. Detail baru harus masuk dengan source/confidence yang jelas agar peningkatan fidelity tidak merusak bagian yang sudah tervalidasi.
