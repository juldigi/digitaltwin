# BMJ Packaging Offset — Factory Digital Twin V65

V65 melanjutkan koreksi **Sheeting Lexus HSM-CTM7** tanpa mengubah dedicated twin Offset 5, Offset 10, dan APM 2.

## Sheeting V65

Identitas BMJ tetap **HSM-CTM7 · serial 00982 · SAP SBM-2 · 2014** dan arah proses tetap **RIGHT → LEFT**.

Perubahan utama:
- main-head operator side diubah dari panel solid + kaca menjadi **true hollow panoramic inspection aperture**;
- window assembly sekarang node selectable sendiri untuk taxonomy/focus/isolate/explode;
- satu turquoise process cylinder dengan 4 bright bands tetap menjadi dominant photographed mechanism;
- outfeed mempertahankan 13 longitudinal belts, 3 adjustment rod assemblies, triangular supports, collars dan knobs;
- ditambahkan **selectable operator-side outfeed handwheel** dari foto resmi BW;
- reference paper stack di stacker diubah dari beberapa slab tipis menjadi **substantial supported skid load** di atas blue pallet;
- reference skid otomatis hilang saat simulation dan diganti dynamic sheet pile;
- exact HSM-CTM7 tetap unresolved: pencarian literal designation tersebut belum menghasilkan OEM drawing/manual/photo publik yang spesifik;
- generic cut-to-mark literature hanya dipakai sebagai process comparison; **CTM7 tidak diasumsikan berarti cut-to-mark**.

## Evidence hierarchy

1. Database BMJ — identitas mesin.
2. Konfirmasi pengguna — arah RIGHT → LEFT.
3. BW Papersystems 2014 HSM 56 brochure — primary family visual/spec reference.
4. BW full-resolution HSM 56 image — component-level visual anchor.
5. Historical HSM family listing — corroboration only.
6. Indonesian Lexus process reference — tension/EPC/control functions only.
7. Generic sheeter control/stacker sources — simulation/process comparison only.

## Verification

```sh
npm ci
npm run build
npm test
```

Regression tests mengunci physical module clearance, window architecture, component counts, taxonomy mapping, simulation behavior, and cross-module penetration.
