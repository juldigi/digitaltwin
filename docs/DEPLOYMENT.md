# Deployment GitHub + Cloudflare — Digital Twin V64

Repo aktif: `juldigi/digitaltwin` (private).

## Pipeline

Push ke `main` harus lulus:
1. `npm ci`
2. `npm run build`
3. seluruh `npm test`
4. Cloudflare credential validation
5. Workers deployment

Service-worker cache: `factory-digital-twin-v64-20260920`.

## V64 Sheeting verification gate

Deployment V64 tidak boleh lolos bila regression test gagal terhadap kontrak berikut:
- identitas BMJ dan RIGHT → LEFT tetap;
- tepat 1 paper reel, 1 reel core, 2 chuck hubs dan 12 visible hub bolts;
- rollstand mempunyai swing/hydraulic support;
- feed memakai inclined frame dan hanya 4 deliberate guide/tension rollers;
- panoramic main window mempunyai 1 dominant process cylinder, 4 bright bands, 2 handles dan 10 lower guide fingers;
- tidak ada competing second large process cylinder;
- outfeed mempunyai 13 longitudinal belts, 2 main rotating transport rollers dan 3 adjustment rods;
- adjustment hardware mempunyai 9 pedestals, 18 triangular braces, 9 collars dan 9 knobs;
- console tetap rendah/kompak dan tidak menembus main head;
- stacker mempunyai 4 columns, front/rear header, side cabinet, guarded sides, lift table dan pallet;
- reference paper load harus supported dan hilang saat simulation mulai;
- major modules mempunyai physical X clearance;
- significant accidental cross-module penetration ditolak;
- dynamic web hanya upstream cut event, dynamic sheet hanya downstream;
- finished pile tetap di dalam stacker tower dan lift table turun sesuai pertumbuhan pile.

## Cloudflare

Worker: `digitaltwin`

- assets: `../dist`
- Worker routes: `/api/*`
- D1 binding: `DB`
- GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Worker secrets: `ADMIN_TOKEN`, `VIEWER_TOKEN`

## Evidence boundary

HSM 56 2014 digunakan sebagai **family visual anchor**, bukan klaim bahwa BMJ HSM-CTM7 identik. Exact HSM-CTM7 cutter internals tetap unresolved sampai tersedia foto/drawing spesifik.
