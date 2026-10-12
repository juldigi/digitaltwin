# BMJ-MCH-0011 · APM-5 MK 920 YMI whole-machine audit

## Identity and evidence boundary

BMJ registry verifies **AUTOPLATEN - 5 STAMPING**, model **MK 920 YMI**, serial **20110509330**, SAP **APM-5**, and year **2011**. The repository has no registered installed-machine photo set. Manufacturer/archive and parts sources support the MK 920 YMI hot-foil/die-cutting process, 920 × 650 mm model format, 6500 sph stamping reference, pneumatic plate locking, 1 mm foil-advance control, and three longitudinal foil-pull systems. Related MK920YM values are not promoted to this installed YMI asset.

## Input-to-output audit

| Section | Measured / observed | Finding and correction | Status |
|---|---|---|---|
| Pile feeder and lift | Represented pile top `y=1.340 m`; former suction bottom `y=1.720 m` and only `56 mm` combined travel | Cups were horizontal and stopped about `0.28 m` above the pile. Corrected cup axis to vertical and pickup travel to meet the represented top sheet within `8 mm` tolerance, with no pile penetration and exact stop reset. | COMPLETE |
| Registration table and lays | Feed-wheel surface `y=1.142 m`; sheet route passes the register at about `y=1.15 m` | Register support and route align. Registration remains upstream of the stopped platen dwell. No unsupported sensor or lay count added. | NO_CHANGE_REQUIRED |
| Intermittent gripper transport | Two chain rails; six visual reference bars explicitly marked `installedBarCountVerified=false` | Previous dwell froze transport at normalized path `0.42`, physically upstream of the platen. Corrected dwell to `0.55`, placing the registered sheet at platen center `x≈0.05 m`; one-pitch indexing and dwell freeze remain intact. | COMPLETE / BLOCKED_EVIDENCE |
| Heated platen and chase | Lower top at rest `y=1.400 m`; chase lower face `y=1.580 m`; former lower-platen endpoint `y=1.650 m` | Former `250 mm` demo stroke passed through the sheet and tool stack. Corrected stroke to `180 mm`; the registered sheet is now carried with the lower platen to `y=1.580 m`, exactly meeting the chase without overtravel. | COMPLETE |
| Hot-foil unwind, pull and rewind | Three longitudinal model-level pull axes; represented reel/web count remains unverified | Hot-foil imprint now occurs only for the sheet physically inside the platen window. Pull axes and waste rewind remain idle during pressure dwell and move only after platen opens. No transverse axes or 20-zone YM configuration added. | COMPLETE / BLOCKED_EVIDENCE |
| Gripper release and delivery pile | Delivery table top `y=0.460 m`; first dynamic product is placed at `y=0.466 m` | Output starts empty, deposits once after the sheet completes its path, stays supported on the table, and restores the static stack after stop. | NO_CHANGE_REQUIRED |
| Drive, control, guard and access | Main motor, flywheel/clutch, indexing cam, release cam and operator access represented at family level | Rotor whitelist excludes static guards, suction hardware, controls and platen structure. Installed cabinet contents, utility route and exact interlock locations are not evidenced. | BLOCKED_EVIDENCE |
| Interior, LOD, isolate, highlight, ghost, explode and taxonomy | 244 meshes; six-level taxonomy for the exact APM-5 identity | Materials were shared globally, so highlighting or ghosting one assembly altered unrelated assemblies. Materials are now scoped per owning node. `showOnly` now preserves selected ancestors and all descendants. Interior/LOD order and reset remain stable. | COMPLETE |

## Pass-two result

The second pass rechecked transformed contact surfaces over a full pickup, dwell, release and reset sequence. It also checked pause/resume, stop/restart, rotor restoration, delivery support, both interior/LOD toggle orders, component visibility and the fail-closed autoplaten truth contract. The pass found and fixed the process-coordinate mismatch that had stamped a sheet upstream of the physical platen, plus the material-state leak and incomplete `showOnly` subtree.

## Remaining blockers

- No installed APM-5 photo set is registered.
- Installed foil-reel count, gripper-bar count, heating-zone count, transverse foil axes, platen force, exact envelope and delivery options are unverified.
- Exact pneumatic/electrical routing, control revision and guard/interlock positions require installed photos or serial-specific documentation.
- Model/family speed and format values are reference limits, not as-built acceptance measurements.

## Release validation

Focused regression covers pickup contact, register/platen coordinate alignment, sheet/tool contact, foil-transfer causality, stopped transport, open-platen foil advance, supported delivery, lifecycle reset, material isolation, subtree navigation, LOD/interior composition and taxonomy. Full repository tests, build, workflows and production response are recorded in `docs/fleet-audit-progress.json` after deployment.
