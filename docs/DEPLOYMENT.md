# Deployment — Digital Twin V65

Repo: `juldigi/digitaltwin` (private)

## Pipeline

Push ke `main` harus lulus:
1. `npm ci`
2. `npm run build`
3. seluruh `npm test`
4. Cloudflare credential validation
5. Cloudflare Workers deployment

Service worker cache: `factory-digital-twin-v65-20260920`.

## V65 Sheeting gates

- BMJ identity dan RIGHT → LEFT tidak berubah.
- Rollstand tetap single low reel + two-sided support.
- Feed tetap 4 deliberate guide/tension rollers.
- Operator-side main-head window harus berupa **true aperture**: tidak boleh ada legacy full opaque side shell di belakang glass.
- Window harus selectable sebagai `sheeting-window`.
- Main head hanya mempunyai 1 dominant photographed process cylinder + 4 bands.
- Outfeed tetap 13 belts + 3 adjustment rod assemblies.
- Operator outfeed handwheel harus selectable sebagai `sheeting-outfeed-handwheel`.
- Reference skid load harus substantial, supported di pallet, dan hidden during live simulation.
- CTM7 tidak boleh otomatis menambahkan cut-to-mark sensor/geometry tanpa model-specific evidence.
- Significant accidental cross-module penetration harus tetap nol di luar mounted relationships.
- Dynamic web hanya upstream cut event; dynamic sheets hanya downstream; pile berakhir di stacker.

## Evidence boundary

HSM 56 2014 adalah family visual reference. Exact HSM-CTM7 cutter internals, OEM side naming, dan option package tetap unresolved sampai ada data BMJ atau OEM yang spesifik.
