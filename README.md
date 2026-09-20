# BMJ Packaging Offset — Factory Digital Twin V56

Digital Twin interaktif untuk area **Packaging Offset PT Bukit Muria Jaya**. V56 merupakan hasil recovery dari riwayat build yang terverifikasi setelah repositori lama tidak lagi tersedia.

## Cakupan V56

- **41 equipment** dari database mesin Packaging Offset.
- **3 digital twin khusus** dengan rekonstruksi lebih detail: Offset 5 / OFU-1, Offset 10, dan APM 2.
- **38 equipment lainnya** memakai builder parametrik berbasis keluarga proses agar seluruh database dapat dibuka dalam 3D tanpa mengklaim detail OEM yang belum terverifikasi.
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

Frontend disiapkan untuk GitHub Pages dari repo private **`juldigi/digitaltwin`**. Backend tersedia sebagai Cloudflare Workers + D1 dan tetap mempertahankan nama resource lama untuk kompatibilitas deployment. Lihat `docs/DEPLOYMENT.md`.

## Struktur penting

- `frontend/src/app.js` — routing UI dan machine context.
- `frontend/src/engine.js` — scene, camera, selection, transform dan renderer.
- `frontend/src/offset5.js`, `offset10.js`, `apm2.js` — geometry khusus.
- `frontend/src/universal-machine.js` — builder keluarga proses untuk equipment lainnya.
- `frontend/src/data/machine-registry.js` — registry 41 equipment.
- `frontend/src/data/plant-layout-data.js` — data layout yang digunakan aplikasi.
- `tests/` — regression, geometry, registry, backend dan UI tests.
- `backend/` — Workers API + D1.

## Prinsip recovery

V56 mempertahankan hasil kerja yang dapat dipulihkan dan menghindari mengarang dimensi, serial, layout, taxonomy, atau part yang tidak didukung sumber. Detail baru harus masuk dengan source/confidence yang jelas agar peningkatan fidelity tidak merusak bagian yang sudah tervalidasi.
