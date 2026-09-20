# BMJ Packaging Offset — Factory Digital Twin V62

Digital Twin interaktif area **Packaging Offset PT Bukit Muria Jaya**. V62 melanjutkan build V61 dengan rekonstruksi ulang **Sheeting Lexus HSM-CTM7** berdasarkan bukti visual keluarga yang lebih spesifik, tanpa mengubah geometry khusus Offset 5, Offset 10, dan APM 2.

## Pembaruan V62

### Sheeting Lexus
- Identitas BMJ tetap: **LEXUS HSM-CTM7**, serial **00982**, SAP **SBM-2**, tahun **2014**.
- Orientasi proses yang dikonfirmasi pengguna tetap **RIGHT → LEFT**.
- Referensi visual utama sekarang adalah brochure/foto **Lexus HSM 56 tahun 2014** dari BW Papersystems, bukan silhouette generik Great Wall/Accura.
- Interpretasi **dua reel tandem** V59–V61 dihapus. V62 memakai **satu fixed-position/two-sided rollstand family reference** seperti yang terlihat/dideskripsikan pada HSM 56 2014.
- Feed/tension/EPC memakai roller lebih sedikit dan setiap roller utama memiliki bearing/support yang terlihat agar tidak tampak mengambang.
- Cutter diubah menjadi **enclosed cross-cut head** dengan inspection window. Exact knife HSM-CTM7 tetap unresolved; HSM 56 flat-bed knife hanya dipakai sebagai family evidence.
- Delivery diubah menjadi **narrow-belt transport bed** dengan roller bearing/support, adjustment/hold-down rods, dan bukan slab besar.
- Layboy diubah menjadi **tall portal stacker + flat lift table + pallet**, mengikuti anchor visual HSM 56.
- Catwalk kuning panjang V61 dihapus dan diganti service deck pendek yang mempunyai support ke lantai.
- HMI dipisahkan dari service deck untuk menghindari penetration.
- Simulasi diperbarui: continuous web hanya sebelum cutter, cut sheet sesudah cutter, pile berada pada portal lift-table stacker.
- Taxonomy 6 tingkat dipetakan ulang ke node fisik V62: reel/chuck, unwind guide, feed rollers, EPC, knife/counterbar, transport rollers, adjustment section, portal stacker.
- Regression test baru menolak kembalinya tandem reel spekulatif, accidental cross-module penetration, dan moving/static collision.

### Evidence policy
Sumber publik mengenai Lexus sheeter tidak sepenuhnya konsisten. Referensi Indonesia menyebut servo single-rotary + double hydraulic shaftless unwind + auto tension/EPC, sedangkan brochure HSM 56 2014 mencatat flat-bed knife + fixed-position two-sided rollstand. V62:
1. mempertahankan fakta BMJ dan orientasi user-confirmed sebagai verified,
2. memprioritaskan HSM 56 2014 sebagai **visual family reference**,
3. memakai sumber Lexus Indonesia untuk fungsi proses seperti tension/EPC,
4. tidak mengklaim exact HSM-CTM7 geometry sebagai OEM-verified tanpa drawing/foto BMJ yang spesifik.

## Cakupan

- **41 equipment** dari database mesin Packaging Offset.
- **4 digital twin khusus**: Offset 5 / OFU-1, Offset 10, APM 2, dan Sheeting Lexus.
- **37 equipment lainnya** memakai builder parametrik berbasis keluarga proses.
- Taxonomy **6 tingkat**: Mesin → Unit Utama → Sub → Block → Part → Spesifik Part.
- Mode 3D mesin, denah pabrik, cutaway/exterior, explode, isolate, component labels, kamera fokus, dan simulasi proses.
- Frontend dan API dipublikasikan melalui **Cloudflare Workers Static Assets** dari repo private.
- Rendering Three.js lokal dengan fallback tampilan ketika WebGL tidak tersedia.

## Mesin khusus

### Offset 5 — OFU-1
Heidelberg Speedmaster **CD 102-8+L**, serial **550415**, tahun **2011**. Geometry mencakup feeder, PU1–PU8, transfer/gripper, coating/dryer, inspection dan delivery.

### Offset 10
Heidelberg Speedmaster **CX104-2-LY-8-LY-1-LX3**. Model menggunakan dokumen proyek/final drawing Heidelberg yang tersedia, termasuk konfigurasi UV, FoilStar dan X3 delivery.

### APM 2
BOBST **SP 102**, serial **57115506**, tahun **1994**. Model proses mencakup feeder, register/SideLay, gripper chain, platen, stripping dan delivery.

### Sheeting Lexus
LEXUS **HSM-CTM7**, serial **00982**, kode **SBM-2**, tahun **2014**. V62 mempertahankan arah kanan → kiri dan membangun silhouette dari family evidence HSM 56 2014 dengan status confidence yang eksplisit.

## Menjalankan secara lokal

Memerlukan Node.js 24.

```sh
npm ci
npm run build
npm test
npm run dev
```

## Deployment

Repo aktif tetap private di **`juldigi/digitaltwin`**. `npm run build` menghasilkan `dist`, kemudian workflow Cloudflare menjalankan Wrangler dari `backend/`. Binding `ASSETS` menyajikan frontend dari `../dist`, sedangkan route `/api/*` ditangani Worker dan D1.

## Struktur penting

- `frontend/src/app.js` — routing UI dan machine context.
- `frontend/src/engine.js` — scene, camera, selection, transform dan renderer.
- `frontend/src/offset5.js`, `offset10.js`, `apm2.js`, `sheeting.js` — geometry khusus.
- `frontend/src/simulation-sheeting.js` — simulasi Sheeting V62.
- `frontend/src/data/sources-sheeting.js` — evidence/confidence Sheeting.
- `frontend/src/data/taxonomy-sheeting.js` — taxonomy 6 tingkat Sheeting.
- `tests/sheeting.test.mjs` — regression geometry/simulation Sheeting.
- `backend/` — Workers API + D1 + static asset binding.

## Prinsip fidelity

Detail yang belum mempunyai bukti tidak dinaikkan menjadi verified. Family reference membantu mendekati bentuk/fungsi, tetapi tidak dianggap pengganti drawing OEM atau foto aktual BMJ.
