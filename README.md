# BMJ Packaging Offset — Factory Digital Twin V63

Digital Twin interaktif untuk area **Packaging Offset PT Bukit Muria Jaya**. V63 memfokuskan koreksi mendalam pada **Sheeting Lexus HSM-CTM7** berdasarkan visual anchor per zona dari brochure/foto HSM 56 2014 dan cross-check beberapa sumber keluarga HSM.

## Pembaruan V63 — Sheeting Lexus

Identitas BMJ tetap **LEXUS HSM-CTM7 · serial 00982 · SAP SBM-2 · tahun 2014** dan orientasi proses tetap **RIGHT → LEFT**.

V63 tidak lagi membangun silhouette dari satu asumsi arsitektur. Setiap zona memakai anchor visual yang dapat dilihat pada sumber:
- **Rollstand:** satu reel rendah dengan opposed chuck/two-sided support. Tidak ada tandem reel spekulatif.
- **Web handling:** frame guide/tension tinggi dengan empat roller utama yang seluruhnya mempunyai support/bearing.
- **Main head:** body abu-abu/toska besar dengan **panoramic inspection window**; dua large transverse process cylinders dan ring/collar di dalam direkonstruksi karena terlihat jelas pada foto.
- **Cross-cut:** fungsi cutting dipertahankan, tetapi exact knife HSM-CTM7 tidak dipaksakan karena sumber publik bertentangan antara istilah flat-bed dan rotary.
- **Outfeed:** long narrow-belt bed dengan banyak belt longitudinal, hanya dua roller transversal utama, dan lima batang adjustment dengan collar/knob seperti yang terlihat pada foto.
- **Stacker:** tower rigid dengan upper housing, safety guard, **flat lift table + pallet**; bukan portal terbuka generik.
- **Operator controls:** console rendah/kompak seperti foto, bukan pedestal HMI tinggi.
- **Access:** hanya localized stacker steps/landing; long catwalk generik dihapus.
- Simulasi dipetakan ulang terhadap path V63 dan pile sekarang berada di dalam stacker tower.
- Taxonomy 6 tingkat dipetakan ulang ke node fisik V63.
- Regression tests mengunci jumlah reel, roller, belt, adjustment rods, stacker geometry, module clearance dan collision.

## Evidence hierarchy

1. **Verified BMJ:** model plant, serial, SAP code, tahun.
2. **User-confirmed:** arah material RIGHT → LEFT.
3. **Primary visual family evidence:** BW Papersystems 2014 Lexus HSM 56 brochure/photo.
4. **Historical family evidence:** Mega Machinery/Megatech listing HSM 52/56/65 sebagai high-speed rotary sheeting machine.
5. **Process-family evidence:** referensi Lexus Indonesia untuk automatic tension, EPC dan computerized control.
6. **Secondary comparisons:** Great Wall/Accura hanya untuk pemahaman proses, bukan silhouette utama.

Karena BW HSM 56 menyebut “flat-bed knife” sementara sumber HSM family lain menyebut rotary, V63 tidak mengklaim exact cutting architecture HSM-CTM7. Bentuk yang terlihat di foto dimodelkan; fungsi yang tidak terbukti tetap berstatus unresolved.

## Cakupan aplikasi

- **41 equipment** dari database Packaging Offset.
- **4 digital twin khusus:** Offset 5 / OFU-1, Offset 10, APM 2, dan Sheeting Lexus.
- Taxonomy **6 tingkat:** Mesin → Unit Utama → Sub → Block → Part → Spesifik Part.
- 3D machine, factory layout, cutaway/exterior, explode, isolate, component labels, focus camera dan process simulation.
- Frontend + API dipublikasikan melalui **Cloudflare Workers Static Assets** dari repo private.

## Menjalankan lokal

```sh
npm ci
npm run build
npm test
npm run dev
```

## Deployment

Repo aktif: `juldigi/digitaltwin`. Push ke `main` menjalankan build, regression test, credential validation dan deployment ke Worker `digitaltwin`.

Detail: `docs/DEPLOYMENT.md`.

## Prinsip fidelity

Geometry family-reference tidak diperlakukan sebagai CAD OEM. Detail hanya dinaikkan menjadi verified jika didukung foto/drawing/data BMJ yang spesifik.
