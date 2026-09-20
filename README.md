# BMJ Packaging Offset — Factory Digital Twin V69

V69 memulai rekonstruksi seluruh mesin dengan **evidence-integrity gate**. Perubahan ini sengaja menghentikan perilaku lama yang memutar object generik dan menghasilkan produk fiktif tanpa hubungan mekanis.

## Status model

Empat twin dedicated tetap dipisahkan:
- Offset 5 · Heidelberg CD 102-8+L
- Offset 10 · Heidelberg CX 104 project configuration
- APM 2 · BOBST SP 102 family reconstruction
- Sheeting Lexus · HSM-CTM7 identity / HSM 56 visual-family reference

Tiga puluh tujuh mesin lain sekarang mempunyai profil bukti eksplisit:
- `MODEL_IDENTIFIED`: model diketahui, tetapi konfigurasi terpasang belum cukup untuk diklaim exact.
- `IDENTITY_ONLY`: nama aset tersedia, namun model/serial/OEM atau susunan modul belum tersedia.
- `OFFICIAL_FAMILY_REFERENCE`, `FAMILY_REFERENCE`, atau `PLACEHOLDER`: status geometry yang ditampilkan.

## Simulation integrity

`UniversalProcessSimulation` lama telah dinonaktifkan. Mesin non-dedicated sekarang:
- tidak memutar mesh berdasarkan indeks;
- tidak menambah completed count setiap empat detik;
- tidak membuat sheet/product fiktif;
- tidak mengklaim actuator, interlock, timing, atau material flow yang belum tervalidasi;
- menampilkan alasan spesifik mengapa simulasi diblokir.

Simulasi baru hanya boleh diaktifkan setelah tersedia bukti untuk material path, actuator, support/bearing, interlock, timing relationship, dan output/stack behavior.

## Next fidelity batches

Geometry reference yang masih generik bukan hasil akhir. Penggantian dilakukan per keluarga dan per zona, dengan urutan:
1. exact identity/nameplate;
2. primary OEM drawing/manual/brochure;
3. foto aktual BMJ empat sisi dan interior aman;
4. module configuration dan orientation;
5. six-level taxonomy mapped ke geometry nyata;
6. collision/support/grounding tests;
7. mechanically causal simulation tests.

Evidence integrity gate berlaku untuk seluruh route universal pada V69.\n\n## Verification

```sh
npm ci
npm run build
npm test
```