# BMJ-MCH-0013 · APM-7 MK 1060 ER whole-machine audit

## Identity and evidence boundary

BMJ registry verifies **AUTOPLATEN - 7 STRIPPING & BLANKING**, model **MK 1060 ER**, serial **20130830062**, SAP **APM-7**, functional location **PC-PK2-CON-AUT-STRIPPING**, and year **2013**. No installed-machine photo set is registered. The 2013 MK1060ER manual archive and current Masterwork family information support the feeder, register, intermittent gripper transport, platen die-cutting, double-action stripping, blanking, and separated product/edge-waste delivery sequence. Published variant differences remain separate; neither source is treated as serial-specific installation CAD.

## Input-to-output audit

| Section | Measured / observed | Finding and correction | Status |
|---|---|---|---|
| Non-stop pile feeder and suction pickup | Pile top `y=1.280 m`; cup lower face started at `y=1.730 m` | Four cups were incorrectly horizontal and stopped about `0.432 m` above the pile. Their axes are now vertical; combined head/cup travel is `0.450 m`, reaching the pile within `2 mm` and resetting exactly. | COMPLETE |
| Feed table and registration | Table/roller route around `y=1.12–1.17 m`; front and side lays remain represented | Process order and stopped/indexed timing are retained. Exact installed lay, sensor and feeder-option configuration is not evidenced. | BLOCKED_EVIDENCE |
| Intermittent gripper-chain transport | Nine modeled reference bars, two rails; transport dwell at platen, stripping and blanking | Bars and sheets remain frozen through all three process dwells and resume only during index. Exact installed bar/gripper count and pitch remain unverified. | BLOCKED_EVIDENCE |
| Flatbed platen and chase | Lower top `y=1.390 m`; chase lower face `y=1.6525 m` | Prior `0.250 m` stroke left a `12.5 mm` gap. Stroke is now `0.2625 m`; the sheet follows the closing lower platen, and die-cut marks appear only after actual pressure contact. | COMPLETE |
| Double-action stripping | Fixed female board spans `y=1.4525–1.5275 m` | Previous upper/lower strokes penetrated the board by up to `55 mm`, and lower needles were horizontal. Needles are vertical; upper/lower strokes now terminate at the two board faces (`52.5/47.5 mm`) without penetration. | COMPLETE |
| Blanking and product separation | Upper rubber lower face `y=1.5825 m`; lower support top `y=1.3525 m` | Previous combined travel left a `10 mm` open gap. Upper/lower travel is now `150/80 mm`, meeting at `y=1.4325 m` without overlap. | COMPLETE |
| Edge-waste and product delivery | Separate product and waste supports already receive separate dynamic output | Delivery placement, accumulation and restart/reset remain supported by represented surfaces. Exact installed jogger, sensor and conveyor configuration is not evidenced. | BLOCKED_EVIDENCE |
| Drive, lubrication, controls, guards and access | Family-grounded motor/flywheel, cabinet, control, lubrication and interlocked guard references | No unsupported installed routing or cabinet contents were added. Exact electrical, lubrication, pneumatic and guard/interlock installation remains unknown. | BLOCKED_EVIDENCE |
| Simulation, display modes and taxonomy | Start/pause/resume/stop/reset, normal/interior/LOD, highlight/ghost/isolate/showOnly/explode and six-level taxonomy | Shared color materials leaked highlight/ghost state across unrelated assemblies, and `showOnly(parent)` hid descendants. Materials are now assembly-scoped and subtree visibility includes descendants. Both toggle orders and lifecycle regressions remain green. | COMPLETE |

## Pass-two result

The second pass repeated feeder, platen, stripping and blanking contact checks through their active cycle, verified stopped-transport interlocks, checked product/waste output support, and exercised both interior/LOD orders plus inspection navigation. It found and corrected premature die-cut markings, parent taxonomy subtree loss, and cross-assembly material-state leakage. The full fleet geometry, lifecycle, taxonomy and presentation suite remained green after the changes.

## Remaining blockers

- No installed APM-7 photo set or serial-specific installation drawing is registered.
- Exact gripper count/pitch, feeder/register options, stripping pins/board pattern, blanking tool layout, delivery sensors/joggers, drive ratios and utility routes remain unverified.
- Manual and current family envelope/electrical values differ and remain separately recorded; neither is promoted as an as-built measurement.
- Operator-side orientation and exact cabinet, lubrication, pneumatic and interlock placement require installed evidence.

## Release validation

Focused MK1060ER regression: **12/12 passed**. Full repository regression: **1580/1580 passed**. Production build completed for all 41 machines. Workflow and production deployment evidence are recorded in `docs/fleet-audit-progress.json` after release verification.
