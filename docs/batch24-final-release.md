# Batch 0024–0026 final implementation release

2026-10-14. Parent main 4c620e04f51a68bbb9b36a4d265595ed55adaa56. Earlier checkpoint CI 38515687575, Verify frontend 38515687685 and Cloudflare 38515687713 successful; production fallback identities checked before final corrections.

Reports: inkjet-ly300-whole-machine-audit.md, ctp1-whole-machine-audit.md, ctp2-whole-machine-audit.md. All three machines' sections processed with installed-evidence blockers retained. Cursor stays 0024 until release verification; next batch is 0027 CTF SCREEN, 0028 Zund, 0029 Atlas Copco Compressor.

Final validation: 48 focused tests pass; 12 surface/resource regression tests pass after fixing clone registration; full suite 1608/1608 pass; build 41 machines, 19 unidentified, bundle 2918300 bytes. Both toggle orders, scoped effects, lifecycle, material path and triangle-contact tests included. Remote blob hashes checked against git hash-object for all implementation/baked geometry files. No force push or competing modification.

RELEASE_PENDING: next run must resolve current main/history for this implementation, verify CI/frontend/deployment, verify production then close ledger before advancing. Installed CTP loading/unloading bending paths, clamp/optics/options, Inkjet nozzle working gap and utility/reject installation remain BLOCKED_EVIDENCE. No complete installed-machine reconstruction is claimed. WebGL visual verification remains unavailable; fallback checks cannot prove 3D appearance.

## Release verification and overlay follow-up

Implementation 39037b7d9c4db7a1d55b758545fac4a7a400ca15: Cloudflare 38521908259, frontend 38521908260 and CI 38521908266 all successful. Production SHA-256 hashes for upg-ly300.js, simulation-upg-ly300.js and reference-machines.js match the tested build. Ledger 94d6a610bd9a5aa488cee382a1abe8b2e2645a0a also passed all three workflows.

The remaining second-pass defect was the LY300 path overlay: old smoothed control points began at (-1.95, 0.66) and ended at (1.90, 0.62), while the material starts at (-1.86, 0.5125), uses transport centre height 0.6235 and lands at x=1.78. The overlay now shares the frozen station keys used by material interpolation, uses straight segments (no unproved overshoot) and ends at first accepted-sheet centre height 0.421. It is a primary-route aid, not evidence of installed reject mechanics. No hardware or machine dimension changed.

Added regression checks every station, intermediate accepted-route phases, first-sheet landing and overlay pause/resume/stop visibility. Existing triangle-contact, modes and three-machine lifecycle regressions remain required. Cursor remains 0024 until this follow-up release is verified.

Follow-up validation: 4 targeted tests and full suite 1609/1609 pass; build 41 machines, 19 unidentified, bundle 2918300 bytes. Follow-up release remains RELEASE_PENDING until workflows and production are verified.
