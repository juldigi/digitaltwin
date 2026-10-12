# BMJ-MCH-0012 · APM-6 MK 920 YMI-II whole-machine audit

## Identity and evidence boundary

BMJ registry verifies **AUTOPLATEN - 6 STAMPING**, model **MK 920 YMI - II**, serial **20130529398A**, SAP **APM-6**, functional location **PC-PK2-CON-AUT-HOTSTAMP02**, and year **2013**. The repository has no registered installed-machine photo set. The suffix `II` is retained as site identity only; no mechanical option is inferred from it. Model/family sources support the 920 × 650 mm sheet class, 6500 sph stamping reference, pneumatic plate locking, 1 mm foil advance and three longitudinal foil-pull axes. Related MK920YM values remain reference-only.

## Input-to-output audit

| Section | Measured / observed | Finding and correction | Status |
|---|---|---|---|
| Pile feeder, lift and suction pickup | Pile top `y=1.340 m`; four vertical cups meet it within `8 mm` and return with more than `0.30 m` clearance | APM-5 contact correction is shared by the dedicated MK920 template and was revalidated under APM-6 identity. Pickup has no penetration or residual transform after stop. | NO_CHANGE_REQUIRED |
| Registration table and lays | Feed-wheel surface and sheet route meet around `y=1.15 m` | Register remains upstream of platen dwell. No unsupported sensor, lay count or non-stop feeder option was added. | NO_CHANGE_REQUIRED |
| Intermittent gripper transport | Two rails and six reference bars; installed count explicitly unverified | One-pitch indexing, stopped pressure dwell and restart/reset were verified for APM-6. Exact installed bar count and gripper details remain unknown. | BLOCKED_EVIDENCE |
| Heated platen and chase contact | Lower-platen top closes from `y=1.400 m` to chase lower face `y=1.580 m` | Registered sheet reaches platen center `x≈0.05 m`, follows the `180 mm` platen stroke and meets the chase without overtravel. | NO_CHANGE_REQUIRED |
| Foil unwind, advance and waste rewind | Three longitudinal family-supported pull axes; reel/web representation explicitly unverified | Pull and rewind stay idle during pressure dwell and operate only after platen opens. No transverse pull axes or 20-zone related-YM configuration was promoted. | BLOCKED_EVIDENCE |
| Gripper release and delivery pile | Delivery table top `y=0.460 m`; first dynamic output rests at `y=0.466 m` | Output begins empty, is released only at delivery, remains supported and resets cleanly. | NO_CHANGE_REQUIRED |
| Drive, control, guarding and access | Motor, flywheel/clutch, cams, exterior guards and platform represented at family level | Runtime selection preserves APM-6 model, serial, year and SAP identity. Installed cabinet contents, utility routing and exact interlock positions lack evidence. | BLOCKED_EVIDENCE |
| Interior, LOD, inspection and taxonomy | Dedicated APM-6 six-level taxonomy; shared MK920 geometry with bounded installed options | Both cutaway/LOD orders, highlight, ghost, isolate, subtree navigation, explode/reset and rotor whitelist pass. No identity leakage to APM-5 was found. | COMPLETE |
| WebGL-unavailable fallback and simulation stages | Production visual audit showed a `Stripping` block and `strip waste` stage | These were unsupported for the APM-6 stamping evidence set. Removed the fictional station and corrected fallback/profile order to feeder → register → gripper/platen → foil advance and waste rewind → delivery → drive/control. | COMPLETE |

## Pass-two result

The second pass rechecked the APM-6 identity route, all transformed feeder/platen/delivery contact surfaces, one-pitch gripper timing, foil interlocks, pause/resume/stop/restart, both interior/LOD orders, node-scoped inspection and the six-level taxonomy. A live production fallback inspection exposed the otherwise-hidden fictional `Stripping` station; source and process profiles now fail closed to the evidence-supported hot-foil sequence.

## Remaining blockers

- No installed APM-6 photo set or serial-specific manual is registered.
- Installed foil-reel and gripper-bar counts, heating-zone count, transverse axes, platen force, exact envelope, feeder/delivery options and utility routes remain unverified.
- Exact cabinet contents, controls revision, guard/interlock positions and operator-side orientation require installed evidence.
- Model/family format and speed values are reference limits, not as-built acceptance measurements.
- Full WebGL pixels could not be observed in the cloud audit browser because that browser exposed the application fallback; geometry, runtime state and fallback presentation were checked independently.

## Release validation

Focused regression covers APM-6 identity, evidence boundaries, fallback/process order, pickup and platen contacts, gripper timing, foil causality, delivery support, lifecycle, inspection modes, taxonomy and runtime truth. Full repository tests, build, workflows and production response are recorded in `docs/fleet-audit-progress.json` after deployment.
