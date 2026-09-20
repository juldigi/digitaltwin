# BMJ Packaging Offset — Factory Digital Twin V67

V67 memperbaiki **mode simulasi pemotongan Sheeting Lexus** agar proses potong tidak lagi terlihat seperti kertas terbelah sendiri.

## Evidence yang dipakai

Identitas BMJ tetap HSM-CTM7 · serial 00982 · SAP SBM-2 · 2014 · RIGHT → LEFT.

BW Papersystems untuk Lexus HSM 56 tahun 2014 secara eksplisit menuliskan **600 gsm Knife load — Flat Bed Knife**. Itu cukup kuat untuk menampilkan sebuah **flat-bed knife family reference** di cut zone. Namun exact HSM-CTM7 blade profile, stroke, linkage, actuator dan timing OEM tetap belum terverifikasi.

## Geometry V67

Di dalam `sheeting-knife` sekarang ada:
- knife carrier;
- visible flat-bed blade;
- bright cutting edge;
- lower anvil reference;
- two side guide blocks.

Blade dibuat cukup tinggi agar bagian utamanya terlihat melalui inspection aperture/cutaway.

## Simulation V67

- blade selalu ada secara fisik di main head;
- carrier + blade + cutting edge bergerak sebagai satu assembly;
- stroke turun/naik disinkronkan dengan cut event;
- sheet baru **tidak dilepas sebelum blade mencapai contact timing**;
- blade kembali ke posisi rest setelah setiap stroke dan setelah Stop/Reset;
- upstream web tetap kontinu;
- downstream tetap FAST → SLOW → OVERLAP → LANDING → STACK;
- exact HSM-CTM7 knife actuation tidak diklaim.

## Verification

```sh
npm ci
npm run build
npm test
```

Regression test mengunci jumlah komponen knife, blade visibility, minimum visible stroke, synchronization dengan sheet release, reset behavior, transport sequence dan collision checks.
