# Deployment — Digital Twin V67

Repository: `juldigi/digitaltwin`

Service-worker cache: `factory-digital-twin-v67-20260921`.

## Required pipeline

1. `npm ci`
2. `npm run build`
3. `npm test`
4. Cloudflare credential validation
5. Workers deployment

## V67 Sheeting gates

- HSM-CTM7 identity dan RIGHT → LEFT tetap.
- BW HSM 56 `Flat Bed Knife` hanya digunakan sebagai **family reference**.
- `sheeting-knife` harus memiliki carrier, visible blade, cutting edge, anvil dan side guides.
- Carrier/blade/edge harus mempunyai motion `flat-bed-blade-reference`.
- Blade harus melakukan stroke visual yang nyata saat cut event.
- Sheet release harus tertunda sampai blade-contact timing.
- Blade harus kembali ke rest position saat Stop/Reset.
- Continuous upstream web tidak boleh terputus.
- FAST → SLOW → OVERLAP → LANDING tetap monotonic menuju LEFT.
- Significant accidental penetration tetap nol.
