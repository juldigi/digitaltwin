# BMJ-MCH-0015 · APM-9 Promatrix 106 CSB whole-machine audit

## Identity and evidence boundary

BMJ registry verifies **AUTOPLATEN - 9 STRIPPING & BLANKING**, model **Promatrix 106CSB**, serial **MP.DBE0-00115**, SAP **APM-9**, functional location **PC-PK2-CON-AUT-AUTOPLAT09**, and year **2024**. No installed-machine photo set or serial-specific installation drawing is registered. HEIDELBERG primary product and brochure evidence supports the shared Promatrix 106 CSB process architecture; it does not prove that APM-9 has the same installed options, dimensions, guarding, routing, or software generation as APM-8.

## Input-to-output audit

| Section | Measured / observed | Finding and correction | Status |
|---|---|---|---|
| Non-stop feeder and suction pickup | Pile top `y=1.400 m`; cup lower face starts at `y=1.775 m`; commanded descent `0.375 m` | APM-9-specific runtime test confirms vertical cups reach the pile without penetration and reset exactly. | COMPLETE |
| Suction-belt table and register | Belt surface around `y=1.1425 m`; front and pull/push side-lay references | Flow reaches the seven-bar transport before cutting. Exact APM-9 sensor, lay and logistics options lack installed evidence. | BLOCKED_EVIDENCE |
| Seven-bar registered transport | Seven OEM-supported gripper bars on twin chain rails | One cycle advances one bar pitch; cutting, stripping and blanking remain interlocked to registered stops. | COMPLETE |
| Cutting and creasing | Plate top `y=1.380 m`; chase lower face `y=1.6725 m`; stroke `292.5 mm` | Contact closes without gap or penetration; cut marks appear only after the APM-9 sheet reaches pressure dwell. | COMPLETE |
| Three-tool stripping | Top/middle/bottom represented strokes `55/35/235 mm` | Tool faces close without penetration; waste appears only after stripping dwell and rests on the represented collection support. | COMPLETE |
| Blanking and tie-sheet process | Upper/lower strokes `200/200 mm`, meeting at `y=1.450 m` | Product and waste remain separated. Tie sheets remain explicitly demo-only, not an installed configuration claim. | COMPLETE |
| Non-stop delivery and output | Dynamic product, tie sheet and waste stacks use distinct supports | Rake, product accumulation, layer clearance and full stop/reset pass. Exact APM-9 pallet logistics and sample-sheet hardware remain unknown. | BLOCKED_EVIDENCE |
| Drive, pneumatics, controls, guards and access | Family-grounded drive, locking-air, control spine, windows and stairs | No APM-8 installation detail was promoted to APM-9. Exact utility routing, cabinets, guard and interlock placement remain unknown. | BLOCKED_EVIDENCE |
| Simulation, modes and taxonomy | APM-9 identity, six-level taxonomy, normal/interior/LOD, highlight/ghost/isolate/show-only/explode | Runtime state previously omitted the selected asset identity and process stages were English. State now carries APM-9 asset/SAP/serial/year and all stages are Indonesia-first. | COMPLETE |

## Pass-two result

The second pass repeated APM-9-specific feeder, cutting, stripping and blanking contact checks; verified gripper pitch and dwell interlocks; checked separated waste/product output, tie-sheet clearance, pause/resume/stop/reset, both interior/LOD orders and taxonomy subtree navigation. It found no evidence-supported reason to alter APM-9 geometry relative to the OEM family reference. The pass corrected the missing simulation identity and user-facing process language instead of inventing serial-specific hardware.

## Remaining blockers

- No installed APM-9 photo set, measured envelope, operating-side survey or installation drawing is registered.
- MasterSet, feeder/delivery logistics, chase changer, pre-makeready, exact tooling pattern and software/speed generation remain option-bounded.
- Exact pneumatic/vacuum routing, cabinet contents, guard/interlock positions, sample-sheet configuration and pallet logistics require site evidence.
- The repository's archived APM-9 reference envelope is not treated as verified as-built measurement.

## Release validation

Focused Promatrix/autoplaten regression: **42/42 passed**. Full repository regression: **1,585/1,585 passed**. The 41-machine production build completed successfully (`2,925,680` bytes; 41 registered machines).
