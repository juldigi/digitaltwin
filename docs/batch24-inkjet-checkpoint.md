# BMJ-MCH-0024 UPG-LY300 — checkpoint 2026-10-14

Audit IN_PROGRESS. Source: registry, dimensions-upg-ly300.js, sources-upg-ly300.js, taxonomy, template and causal simulation at remote main 4ca47171. OEM references do not establish installed head count, accessory placement or plant direction. Installed photos, pneumatic/ink routing and strapping option remain BLOCKED_EVIDENCE.

Measured represented output support top: collection .415 m, reject tray .410 m. Old first accepted sheet bottom .354 m penetrated collection by 61 mm; rejected bottom .344 m penetrated reject tray by 66 mm. Accepted center x=1.98 caused a 60 mm right overhang on support. Corrected accepted center x=1.78, y=.421; reject center x=1.62, y=.416, z=.26. Pitch changed 14 to 12 mm to equal represented sheet thickness, eliminating floating layers. World bounds test verifies support contact and adjacent sheet contact. No machine envelope or installed hardware changed.

20 focused tests pass; 41-machine build passes. Full regression gate pending at checkpoint creation. Existing print→cure→inspect→decision causality and pause/resume/reset tests pass. This does not complete the full audit: input-pile support, paging-to-belt continuity, printhead/UV gap, reject trajectory, both mode orders, runtime visual check and second pass remain required. Cursor remains 0024 and batch 0024–0026 is retained.
