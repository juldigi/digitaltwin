# BMJ Packaging Offset — Factory Digital Twin V68

V68 memperbaiki fungsi **roll besar turquoise pada Sheeting Lexus** agar tidak lagi sekadar berputar tanpa berinteraksi dengan web.

## Evidence boundary

Identitas BMJ tetap:
- HSM-CTM7
- serial 00982
- SAP SBM-2
- tahun 2014
- arah proses RIGHT → LEFT

Silhouette roll besar dan band putih tetap berasal dari foto resmi keluarga Lexus HSM 56 BW Papersystems.

Fungsi **Main Draw / Traction Drum** adalah process-family reference, bukan klaim nama OEM exact HSM-CTM7. Dasarnya:
- BW sheeter sheet-length/squaring control menyebut draw drum encoder dan knife marker;
- BW servo upgrade menyebut koordinasi cross cutter, knife dan draw-drum functions;
- Unico menghubungkan draw roll dengan cutter serta high/low-speed tapes;
- Maxson menempatkan large-diameter draw drum pada pull-roll section sebelum cutter.

## Geometry / web path V68

- web dari guide/tension menuju head infeed roller;
- web kemudian naik secara tangensial ke Main Draw / Traction Drum;
- web mengikuti sampled contact arc pada permukaan drum;
- web keluar tangensial menuju blade/anvil contact line;
- cut point disejajarkan dengan visible flat-bed knife;
- continuous web tetap tidak boleh menembus drum atau roller.

## Simulation V68

- web advance = elapsed process time × visual line speed;
- draw drum angular travel = web advance / drum radius;
- surface speed draw drum = visual web speed;
- target cut length menentukan interval cut;
- cut count dihitung dari web advance / target cut length;
- blade stroke tetap mencapai contact timing sebelum sheet dilepas;
- sheet lalu bergerak FAST → SLOW → OVERLAP → LANDING → STACK;
- Stop & Reset mengembalikan drum/blade/lift/jogger ke posisi awal.

## Verification

```sh
npm ci
npm run build
npm test
```

Regression test V68 memeriksa web benar-benar mencapai dan membelit permukaan draw drum, tidak menembus drum, wrap angle cukup terlihat, drum surface speed sama dengan web speed, cut berasal dari web advance, blade tetap sinkron, sheet tidak teleport, dan collision checks tetap bersih.
