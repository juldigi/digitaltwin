# BMJ-MCH-0024 — UPG-LY300 whole-machine audit

2026-10-14. Batch 0024–0026, AUDIT_THREE_MACHINES_THEN_FIX_VERIFY_DEPLOY. Registry model/year preserved; engineeringDimensions=false. Earlier release 4c620e04 passed CI 38515687575, frontend 38515687685, Cloudflare 38515687713; production fallback identity UPG-LY300/2025 verified before further work.

## Evidence

Repository dimensions, taxonomy, technical sources, previous checkpoint and photo manifest were read from current main. Manifest has no installed-photo identity match for this asset. Official UPG product page was reread on 2026-10-14: https://www.upg-consumable.com/uv-piezo-inkjet-printer-product/ . It supports baffle paging, servo transport, Ricoh G5, LED UV, 2K line camera and rejection/collection functions. OEM station geometry is reference evidence; installed head population, pressure/utility topology, strapping package and factory direction remain BLOCKED_EVIDENCE. Ricoh's official MH5420/5440 specification was checked but does not resolve installed nozzle-to-stock gap: https://www.ricoh.com/products/industrial-inkjet-printheads/ricoh-mh5420-mh5440 . No arbitrary jetting gap was assigned.

## Functional coverage and corrections

| Section | Evidence / measurement / result | Audit status |
|---|---|---|
| Baffle/input pile | Support top .425 m; pile now starts .4295 with 9 mm represented thickness and equal layer pitch, eliminating unsupported bottom/air gaps. Actual lift/air-cylinder layout unknown. | COMPLETE contact; BLOCKED_EVIDENCE installed lift |
| Paging/registration | Paging support top .602→.6175 m. Wheel bottom .610→.6295 m matches moving card top. Feeder, double-sheet-clear and positioning states checked. | COMPLETE model contact; installed sensor layout BLOCKED_EVIDENCE |
| Servo transport | Belt formerly ended x=.38, before UV/camera; existing belt extended inside same machine envelope to x=1.51, start x=-1.82. Pulley crown lowered to belt top .6175. Card lower face stays .6175 through process. | COMPLETE |
| Print / negative-pressure ink | Timed station trajectory now crosses print location during print permit; only positioned card prints. Negative-pressure readiness precedes jetting; pump whitelist excludes static pipes/cylinder. Installed nozzle gap, ink tube endpoints and setpoints unknown. | COMPLETE causal logic; BLOCKED_EVIDENCE physical jet/ink routing |
| LED UV | Curing enabled after printed card and occupancy; cover/service fittings obey interior/LOD. Exact curing distance/cabinet mount unknown. | COMPLETE logic; BLOCKED_EVIDENCE installation |
| Line camera / decision | Camera lens shaft corrected from horizontal Z to vertical Y facing material. Camera follows cured card; tracked decision precedes reject. Lens is not a rotor. | COMPLETE model axis/causality; installed optical geometry BLOCKED_EVIDENCE |
| Reject / accept | Branch reaches existing tray centers and support heights; accepted and rejected layers use 12 mm pitch. Rejection remains explicitly demo-only. Installed gate stroke/feedback/receiving trajectory unknown. | COMPLETE demo endpoint contact; BLOCKED_EVIDENCE installed transfer |
| Collection / strapping | Previous 61/66 mm penetration and 60 mm accepted overhang fixed by earlier checkpoint, retained and rechecked. Restart now clears old visible output. Strapper stays unverified option boundary. | COMPLETE model collection; BLOCKED_EVIDENCE strapper |
| Control / modes / taxonomy | Mesh-local material isolation fixes highlight/ghost bleed. showOnly retains all descendants. Clone materials registered with authored surface library after full regression found missing V343/V344 styling. Both interior/LOD orders, isolate/ghost/explode/reset, pause/resume/stop and 99 specific-part mappings checked. | COMPLETE |

## Second pass / limits

Second pass found paging contact, camera optical-axis, restart-output, subtree and surface-classification defects in addition to trajectory fixes. Focused route test verifies card contact at print/UV/camera phases; adjacent output layers contact without overlap. Published machine envelope metadata 4230×720×1700 mm retained. Scene normalization and custom placements not changed. No new hardware added. Exact nozzle/UV working gaps and installed utility/reject transfer remain open evidence blockers; this report does not claim installed-CAD fidelity. Runtime browser cannot render WebGL; fallback verification is separate from triangle/logic tests.

Audit processed with evidence blockers. Release remains RELEASE_PENDING until all gates and production are verified; cursor stays 0024 during release.
