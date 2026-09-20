# BMJ Packaging Offset — Factory Digital Twin V64

Digital Twin interaktif untuk area **Packaging Offset PT Bukit Muria Jaya**. V64 melanjutkan rekonstruksi **Sheeting Lexus HSM-CTM7** dengan detail mekanis yang diturunkan langsung dari anchor visual resmi HSM 56 2014, tanpa mengubah dedicated geometry Offset 5, Offset 10, dan APM 2.

## Fokus V64 — Sheeting Lexus

Identitas BMJ tetap **HSM-CTM7 · serial 00982 · SAP SBM-2 · 2014** dan arah proses tetap **RIGHT → LEFT**.

V64 memperbaiki detail yang masih terlalu generik pada V63:
- rollstand memakai **satu reel rendah**, exposed opposed chuck/hub, bolt circle, swing arm serta hydraulic support;
- generic tall four-post feed tower diganti **inclined two-sided web guide frame**;
- feed path dikunci menjadi **4 roller utama** dengan bearing pada side frame;
- main head memakai panoramic window dengan **1 dominant turquoise process cylinder**, 4 bright bands dan end caps;
- competing second large cylinder V63 dihapus;
- ditambahkan black window handles, repeating guide fingers dan metal service plate;
- outfeed memakai **13 longitudinal belts**, hanya 2 transport rollers dan **3 transverse adjustment assemblies**;
- setiap adjustment assembly mempunyai triangular green supports, bronze collars dan black hand knobs;
- low operator console dibuat integrated dengan pushbutton, E-stop dan lever;
- stacker dibuat sebagai **open-front rigid tower** dengan mesh guards, side cabinet, internal lift guides, flat lift table, blue pallet dan grounded side steps;
- paper stack referensi diletakkan secara fisik di atas pallet dan otomatis disembunyikan saat simulation berjalan;
- simulation path mengikuti rollstand → inclined guide → main head → belt outfeed → stacker dan menggerakkan reel/core/chuck/guide rollers/main process cylinder/outfeed rollers/lift table.

## Evidence hierarchy

1. Database BMJ — identitas mesin.
2. Konfirmasi pengguna — arah material RIGHT → LEFT.
3. BW Papersystems HSM 56 2014 brochure — primary family visual/spec reference.
4. BW Papersystems full-resolution HSM 56 image — primary component-level visual anchor untuk main head/outfeed.
5. Historical Mega Machinery HSM 52/56/65 listing — family corroboration.
6. Indonesian Lexus reference — process-function corroboration untuk tension/EPC/control.
7. Generic sheeter references — hanya secondary comparison.

Exact HSM-CTM7 knife architecture tetap **unresolved** karena sumber publik keluarga HSM tidak sepenuhnya konsisten. V64 hanya memodelkan bentuk/fungsi internal yang cukup didukung bukti.

## Aplikasi

- 41 equipment dalam machine registry.
- 4 dedicated twins: Offset 5, Offset 10, APM 2, Sheeting Lexus.
- Taxonomy 6 tingkat.
- 3D, factory layout, cutaway, explode, isolate, labels, camera focus dan process simulation.
- Runtime melalui Cloudflare Workers Static Assets dari private repository.

## Local verification

```sh
npm ci
npm run build
npm test
npm run dev
```

## Fidelity rule

Photo/family evidence tidak dianggap sebagai OEM CAD. Geometry exact hanya dinyatakan verified jika ada foto/drawing/data BMJ yang spesifik.
