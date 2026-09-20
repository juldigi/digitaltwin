# BMJ Packaging Offset — Factory Digital Twin V66

V66 berfokus pada **deep-dive Sheeting Lexus HSM family** dan **rekonstruksi total mode simulasi Sheeting**.

## Identitas BMJ

- Model plant: HSM-CTM7
- Serial: 00982
- SAP: SBM-2
- Tahun: 2014
- Arah proses terkonfirmasi: RIGHT → LEFT

## Evidence hierarchy

**Visual family anchor utama**
- BW Papersystems · Lexus HSM 56 tahun 2014.
- Foto resolusi tinggi BW dipakai untuk rollstand, windowed main head, process cylinder, outfeed hardware dan stacker silhouette.

**Process architecture cross-check**
- BW Papersystems vacuum overlap: high-speed tape → vacuum overlap → low-speed tape.
- BW Papersystems stacker top tapes: sheet control dari low-speed tape menuju front stop/stack.
- Pasaban CL165 / CX165 / KB: unwinder, pulling, cross-cutting, overlap group, back-stops/joggers dan lowered stacking table.
- Unico Sheeter Control: draw roll, cutter, high/low-speed tape drive dan coordinated line control.
- Maxson MSP / layboy references: high-speed tape, low-speed tape, shingle/overlap, air cushion, back jog, side jogger dan automatic feed-down table.

Sumber process generic **tidak** dipakai untuk mengklaim bahwa geometry internal HSM-CTM7 identik.

## Geometry V66

- low fixed-position two-sided rollstand;
- inclined supported web-guide / tension frame;
- true hollow inspection aperture;
- one dominant banded process cylinder;
- exact knife mechanism tetap unresolved;
- delivery dibagi menjadi selectable process zones:
  - Fast Tape Separation Zone
  - Slow Tape Transfer Zone
  - Overlap Tape Zone
- operator handwheel + adjustment rod/collar/knob tetap;
- rigid stacker tower + lift table + blue pallet;
- process-reference front stop, back jog dan side jogger ditambahkan di dalam stacker untuk membuat proses penumpukan konsisten.

## Simulation V66

Simulation lama tidak lagi memakai sheet yang recycle modulo sepanjang satu spline.

- web upstream adalah **connected continuous ribbon**;
- route web melewati sisi permukaan roller, bukan pusat roller;
- moving stripes hanya menandai arah aliran;
- exact knife tidak digerakkan secara palsu;
- setiap cut event melahirkan satu sheet dengan stable cut ID;
- lifecycle sheet: **FAST → SLOW → OVERLAP → LANDING → STACK**;
- fast tape membuka gap setelah cut;
- slow tape mengurangi spacing;
- overlap memberi shingle effect tanpa z-fighting;
- landing memakai smooth descent menuju live pile top;
- front/back stop dan side jogger bergerak kecil untuk alignment visual;
- pile tumbuh dari pallet;
- lift table turun mengikuti pertumbuhan pile;
- debug centerline default **OFF** supaya mode simulasi lebih bersih;
- menyembunyikan debug path tidak pernah menyembunyikan actual continuous web.

## Verification

```sh
npm ci
npm run build
npm test
```

Regression suite memeriksa syntax, route clearance, monotonic sheet travel, absence of backward teleport, process-zone mapping, stack support, jogger actuation, lift compensation, collision, taxonomy dan reset behavior.
