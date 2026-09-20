# Deployment GitHub + Cloudflare — Digital Twin V63

## Build & deployment

Repo: `juldigi/digitaltwin` (private).

Push ke `main` harus:
1. menjalankan `npm ci`;
2. menjalankan `npm run build`;
3. menjalankan seluruh `npm test`;
4. memvalidasi credential Cloudflare;
5. deploy Worker dari `backend/`.

Service worker cache V63: `factory-digital-twin-v63-20260920`.

## V63 Sheeting verification gate

Sebelum deployment dianggap valid:
- identitas tetap HSM-CTM7 / 00982 / SBM-2 / 2014;
- arah proses tetap RIGHT → LEFT;
- hanya **1 reel position** family-reference;
- rollstand rendah dengan opposed support;
- raised web frame mempunyai **4 guide/tension roller** dengan bearing/support;
- main head mempunyai panoramic window dan large photographed process cylinders;
- outfeed mempunyai **9 longitudinal belts**, **2 transport rollers**, **5 adjustment rods** dan collar/knob;
- stacker berupa rigid tower dengan flat lift table + pallet;
- operator control adalah low compact console;
- tidak ada long generic catwalk;
- module sequence unwind → feed → main head → outfeed → stacker mempunyai clearance;
- tidak ada significant accidental cross-owner mesh penetration di luar mounted relationships;
- continuous web berhenti di cross-cut zone;
- individual sheet hanya ada downstream dan pile berada di stacker tower;
- cutaway/explode/isolate/labels/reset tetap berfungsi.

## Cloudflare

Worker: `digitaltwin`

- static assets: `../dist`
- API: `/api/*`
- D1 binding: `DB`
- required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Worker secrets: `ADMIN_TOKEN`, `VIEWER_TOKEN`

## Evidence boundary

BW HSM 56 2014 adalah primary visual **family** reference, bukan bukti bahwa HSM-CTM7 BMJ identik. Public sources conflict mengenai knife architecture, sehingga exact cutting mechanism tetap unresolved sampai ada foto/drawing HSM-CTM7 BMJ.
