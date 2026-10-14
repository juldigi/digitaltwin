# BMJ-MCH-0028 Zünd platform audit

2026-10-14; base main 05efd91b7140edda0767b8c7454dba91e273a4d8. Registry confirms Zünd only; no model, table size, installed tools or handling options. Preserved reference envelope, identity and orientation. No cutting tool introduced.

Evidence: registry, taxonomy-zund.js, reference-machines.js, photo manifest (zero identified installed images), Library searches (no identified installation photo/manual). Official family source reviewed: https://www.zund.com/en/cutting-systems/modules-and-tools/universal-module — modular tool carrier with bayonet/tool detection and pressure/position modes, not proof of BMJ installed tool package.

| Functional section | Before / finding | Correction / unknown |
| --- | --- | --- |
| Material placement / vacuum bed | Bed support top 0.6475 m. Port tops 0.6625 m (15 mm raised); divider tops 0.659 m (11.5 mm raised) | Port markers flush at 0.6475 m; divider thickness 2 mm, top 0.6475 m. Material lower face contacts support, not elevated markers. Installed perforation count/zone topology remains BLOCKED_EVIDENCE |
| X gantry / guides / rack | Existing beam follows bounded XY reference | Guide mounting and exact transmission model BLOCKED_EVIDENCE; no travel-envelope resizing |
| Y/Z carriage and carrier slots | Carriage travels ±1.90 m X, ±0.80 m Z while module-slot group was fixed | Slots receive same displacement as carriage, maximum prior separation about 2.06 m becomes zero relative drift. Reset restores slot origin. No module count inferred |
| Tool capabilities | Knife, crease, router, ARC nodes exist as inactive boundaries | Tool action stays disabled. Tool package, work height, force and installed beam clearance BLOCKED_EVIDENCE |
| Registration / initialization | ICC/ITI flags and inactive boundaries checked | Not promoted to installed equipment. BLOCKED_EVIDENCE |
| Controls / vacuum interface / unload | Vacuum hold precedes motion; release follows reference cycle. No invented offset feeder/output | Actual handling/conveyor/unload scheme and vacuum plumbing BLOCKED_EVIDENCE |
| Housing / taxonomy / modes | Surface marker bounds and specific-part effects inspected | Enrichment material isolation and showOnly descendant restoration fixed. Installed table/support/access dimensions BLOCKED_EVIDENCE |

Second pass: sampled XY cycle every 0.025 normalized phase, constant carrier/carriage relative transform; stop restores rest; material/bed world AABB contact within 1 µm numerical tolerance. Bounded reference motion is not a real cutting program. No claim of installed tool-to-material contact or as-built geometry. Normal/interior/LOD and lifecycle regressions included; visual 3D remains unverified.

Release status: RELEASE_PENDING; do not advance batch until implementation gates and production verified.
