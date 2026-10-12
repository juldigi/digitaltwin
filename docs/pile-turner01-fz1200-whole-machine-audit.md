# BMJ-MCH-0007 · PILE TURNER 01 · FZ 1200 whole-machine audit

Status: `COMPLETE`  
Audit mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`  
Asset identity: BMJ registry `PILE TURNER 01`, model `FZ 1200`, serial `24RVOFS0920`, year 2020, SAP `PLT-1`.

## Evidence boundary

- BMJ registry proves the asset identity, model string, serial, year, and SAP code.
- The public UANCHOR FZ1200 reference supports the functional sequence and model-family envelope: load, clamp, lift, turn 180°, air separation/dust removal, jog/alignment, lower, release, and unload.
- No installed-unit photo or serial-matched manual is available in the repository photo inventory. OEM, installed capacity/opening/power/envelope, nozzle count, blower layout, hydraulic-cylinder count, guard geometry, and serial-specific routing remain `BLOCKED_EVIDENCE`.
- No new optional hardware was added. Existing close-family components remain explicitly reference-only.

## Input-to-output audit and fixes

| Functional section | Before | Repair / result | Status |
|---|---|---|---|
| Load platform and lower support | Pallet slats penetrated the lower clamp plate by about 25 mm. | Platform body/slats were reseated so the slat top and lower clamp-plate underside meet at y=0.630 m without overlap. | `COMPLETE` |
| Clamp and pressure contact | `clampConfirmed` became true with about 28 mm remaining between the pressure face and pile. | Stroke changed from 0.470 m to the modeled contact distance 0.498 m; confirmation now derives from <=1 mm surface clearance. | `COMPLETE` |
| Lift and turning clearance | Clamp and yoke stay synchronized around the same horizontal Z pivot; turned pile remains above floor. | Regression checked through the full cycle; no unsupported dimensional change. | `NO_CHANGE_REQUIRED` |
| Turn lock and interlock | Clamp→lift clearance→turn→lock ordering was already enforced. | Retained and regression-tested; air cannot start before turn lock confirmation. | `NO_CHANGE_REQUIRED` |
| Air separation / dust path | Air visualization sat below the turned pile and layer expansion crossed the lower support face. | Air visualization was aligned to the modeled turned-pile working height. Layer separation now grows away from the supporting sheet, preserving contact. | `COMPLETE` |
| Jog / alignment | Jog plates covered only a small lower band of the turned pile. | Side and front/back plates now span the turned modeled pile envelope through airing expansion. | `COMPLETE` |
| Lower, release, unload | On release the pile stayed fixed while its new lower plate moved away, leaving a visible 0.498 m unsupported gap. | Gravity-follow behavior keeps the turned pile on the former upper plate throughout release/unload. | `COMPLETE` |
| Hydraulic drive | Pump/motor, manifold, hoses, cylinders, and phase gating remain reference-bounded. | Motion whitelist and hydraulic-active timing passed regression. Installed layout stays unknown. | `BLOCKED_EVIDENCE` |
| Controls, guard, normal/interior/LOD and taxonomy | Six-level taxonomy, cutaway restoration, low-detail restoration, pause/resume/stop/reset, and process-path state were already present. | Cross-fleet runtime/cutaway/visual-parity regressions passed. Installed console generation and guard geometry remain unknown. | `BLOCKED_EVIDENCE` |

## Second pass

The second pass measured world-space AABBs at rest, clamp contact, lift clearance, 180° turn, airing, jogging, lowering, and release. It found and fixed the support penetration, false clamp confirmation, airing/support penetration, jog-height mismatch, and floating unload listed above. The machine still uses five air jets only as a process visualization; that count is not asserted as installed hardware.

## Validation

- Focused FZ1200 suite: 11/11 passed.
- Runtime, simulation reset, cutaway, and visual parity regressions: 179/179 passed.
- Full release suite: 1,565/1,565 passed; build completed for all 41 assets.
- Release commit: `9c0718374c5704239abb9913fbfb451ca1404ddf`.
- Workflows: CI `38240782281`, frontend verification `38240782217`, Cloudflare `38240782415`; all completed successfully.
- Production: `https://digitaltwin.juldigi.workers.dev/` returned HTTP 200 after deployment.

## Remaining blockers

`BLOCKED_EVIDENCE`: installed OEM/nameplate values, site orientation, exact guard/HMI layout, nozzle and cylinder counts, blower/dust hardware arrangement, hydraulic/air routing, actuator types, and verified physical dimensions. These do not block the evidence-supported contact and process corrections above.
