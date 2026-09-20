# BMJ Packaging Offset — Factory Digital Twin V66

V66 berfokus pada dua hal: **deep-dive Sheeting Lexus HSM family** dan **rekonstruksi total mode simulation Sheeting**.

## Evidence

Identitas BMJ tetap:
- HSM-CTM7
- serial 00982
- SAP SBM-2
- tahun 2014
- arah proses RIGHT → LEFT

Sumber visual primer tetap BW Papersystems HSM 56 2014. Pencarian tambahan V66 mencakup BW used-machine product registry, historical LEXUS/HSM 52/56/65 listing, Pasaban folio-sheeter process map, Unico sheeter/cutoff control references, Maxson stacker sequence, dan Case Paper industrial sheeter installation.

Sumber generic hanya dipakai untuk **process architecture**, bukan untuk mengklaim geometry exact HSM-CTM7.

## Geometry V66

- low fixed-position rollstand;
- inclined supported web-guide/tension frame;
- true hollow inspection aperture;
- one dominant banded process cylinder;
- exact knife mechanism tetap unresolved;
- delivery belt-bed sekarang mempunyai node process terpisah:
  - Fast Tape Separation Zone
  - Slow Tape Transfer Zone
  - Overlap Tape Zone
- operator handwheel, adjustment rods/collars/knobs, rigid stacker tower, lift table dan blue pallet dipertahankan.

## Simulation V66

Simulation lama dirombak total.

- continuous web sekarang berupa **connected ribbon**, bukan potongan marker kertas yang tersebar;
- route web menghindari center roller dan mengikuti sisi permukaan roller;
- moving stripes hanya menunjukkan arah gerak di atas web kontinu;
- setiap cut menghasilkan **1 sheet** dengan cut ID sendiri;
- sheet tidak direcycle dengan modulo sehingga tidak teleport dari stacker kembali ke cutter;
- downstream dibagi fast → slow → overlap → landing;
- fast tape membuka gap setelah cut;
- slow/overlap mengurangi spacing antarsheet sebelum stacker;
- cut-event pulse muncul singkat pada cross-cut reference;
- dynamic sheet size disesuaikan dengan pallet/stack width;
- sheet masuk stacker melalui landing trajectory, bukan menghilang;
- pile tumbuh dari pallet;
- lift table hanya mulai turun saat pile mendekati target delivery height;
- debug centerline dapat disembunyikan tanpa menghilangkan material web;
- unresolved knife reference tidak lagi dianimasikan sebagai mekanisme palsu.

## Verification

```sh
npm ci
npm run build
npm test
```

V66 regression gates memeriksa route clearance terhadap roller, monotonic sheet travel, absence of backward teleport, fast/slow/overlap zone mapping, stack support, lift compensation, cut pulse, collision, taxonomy dan reset behavior.
