# BMJ-MCH-0014 · APM-8 Promatrix 106 CSB whole-machine audit

## Identity and evidence boundary

BMJ registry verifies **AUTOPLATEN - 8 STRIPPING & BLANKING**, model **Promatrix 106CSB**, serial **MP.DBE0-00100**, SAP **APM-8**, functional location **PC-PK2-CON-AUT-AUTOPLAT08**, and year **2022**. No installed-machine photo set is registered. HEIDELBERG primary product/brochure evidence supports the non-stop feeder, suction-belt register table, seven registered gripper bars, cutting, three-tool stripping, blanking, vacuum/tie-sheet process and non-stop delivery. MasterSet, logistics, chase changer, pre-makeready and exact installed tooling remain option-bounded.

## Input-to-output audit

| Section | Measured / observed | Finding and correction | Status |
|---|---|---|---|
| Non-stop feeder and suction pickup | Pile top `y=1.400 m`; cup lower face started at `y=1.775 m` | Cups were horizontal and the cycle left about `0.375 m` clearance. Axes are now vertical; combined head/cup travel is `0.375 m`, meeting the pile without penetration and resetting exactly. | COMPLETE |
| Suction-belt table and register | Belt surface around `y=1.1425 m`; front and pull/push side-lay references | Registration remains before chain pickup. Exact installed sensor, lay and logistics options lack installed evidence. | BLOCKED_EVIDENCE |
| Seven-bar registered gripper transport | Seven OEM-supported bars on twin chain rails | Cutting, stripping and blanking occur only at registered stops; sheets and bars freeze throughout each dwell. | COMPLETE |
| Cutting/creasing station | Plate top `y=1.380 m`; chase lower face `y=1.6725 m` | Previous `250 mm` stroke left `42.5 mm` clearance. Stroke is now `292.5 mm`; sheet follows the plate and cut outlines appear only after pressure contact. | COMPLETE |
| Three-tool stripping | Top-pin lower face `y=1.610 m`; moving middle faces `1.440–1.520 m`; bottom top `y=1.240 m` | Pins were horizontal, top overtravelled and bottom remained open. Pins are vertical; with middle travel retained, top/middle/bottom close at their represented faces using `55/35/235 mm` strokes without penetration. Waste is emitted only after stripping dwell. | COMPLETE |
| Blanking and tie-sheet process | Upper-tool lower face `y=1.650 m`; lower-tool top `y=1.250 m` | Prior combined travel was `220 mm`, leaving `180 mm` gap. Upper/lower strokes are now `200/200 mm`, meeting at `y=1.450 m`. Tie sheets remain explicitly demo-only. | COMPLETE |
| Non-stop delivery and output | Dynamic blanks, tie sheets and stripping waste use separate represented supports | Rake lifecycle, product layers, tie-sheet clearance, pallet output and reset pass. Exact installed rake/logistics and sample-sheet configuration remain unverified. | BLOCKED_EVIDENCE |
| Drive, pneumatics, controls, guards and access | Family-grounded drive, flywheel, locking-air, controls, guard windows and stairs | No optional logistics or serial-specific cabinet/routing was invented. Exact installed utility and safety configuration remains unknown. | BLOCKED_EVIDENCE |
| Display modes, inspection and taxonomy | Normal/interior/LOD, highlight/ghost/isolate/showOnly/explode and six-level taxonomy | Shared color materials leaked visual state and parent `showOnly` hid descendants. Materials are assembly-scoped and selected subtrees remain complete. | COMPLETE |

## Pass-two result

The second pass repeated contact checks throughout active feeder, cutting, stripping and blanking cycles; verified registered-stop interlocks, seven-bar pitch, distinct waste/product output, tie-sheet clearance, pause/resume/stop/reset, both interior/LOD orders and taxonomy navigation. It found and corrected premature cutting outlines, premature stripping waste, subtree loss and cross-assembly material-state leakage.

## Remaining blockers

- No installed APM-8 photo set or serial-specific installation drawing is registered.
- MasterSet, feeder/delivery logistics, chase changer, pre-makeready, exact tooling pattern and software generation remain unverified options.
- Exact pneumatic routing, cabinet contents, guard/interlock positions, sample-sheet configuration and operator-side installation details require site evidence.
- Published 7,500/8,000 sph references belong to different publication generations and are not promoted as measured site speed.

## Release validation

Focused Promatrix regression: **16/16 passed**. Full repository regression: **1,584/1,584 passed**. The 41-machine production build completed successfully (`2,925,680` bytes; 41 registered machines).
