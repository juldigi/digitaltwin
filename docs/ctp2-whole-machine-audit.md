# BMJ-MCH-0026 — Heidelberg CTP 2 whole-machine audit

2026-10-14. Audit performed on a separately instantiated BMJ-MCH-0026; shared family implementation does not identify this unit as CTP 1. Evidence source and primary URL are listed in ctp1-whole-machine-audit.md; exact model and installed photos remain unknown per registry/photo manifest. Neither unit's options are inferred from the other's.

| Section | Independent measurement / result | Status |
|---|---|---|
| Input / loader | Entry lower face now .7175 m on support; installed handoff/bending path unavailable, plate staged rather than intersecting drum. | COMPLETE contact; BLOCKED_EVIDENCE loader path |
| Register / transport | Load/register/clamp/encoder interlocks checked; transport rollers cease during exposure. Installed sensors/stops unknown. | COMPLETE logic; BLOCKED_EVIDENCE hardware |
| Drum / plate | Center [.08,.82,0], radius .34, 18 facets. 15 mm nominal radius gap removed; triangle midpoint contact <1 µm at .34/.45/.60/.75 cycle. Drum and wrap share angular rate; release holds final angle while clamped. | COMPLETE model contact and sync |
| Clamp / mounting | Unverified penetrating detailed mount meshes suppressed and stay hidden through both toggle orders and reset; taxonomy retained. | BLOCKED_EVIDENCE installed clamp |
| Laser / IDS | Carriage lifted 50 mm; beam follows actual source and raycast surface endpoint. 2 mm surface marker replaces penetrating 20 mm sphere. Exposure permission tested. Actual optics/count unverified. | COMPLETE diagram geometry; BLOCKED_EVIDENCE installed optics |
| Release / output | Output lower face .7025 m on bed; no rigid plate travel through drum. Actual processor/stacker and transfer remain unknown. | COMPLETE contact/logic; BLOCKED_EVIDENCE transfer |
| Options / utility / guards | Punch/loader/debris/temperature/processor options not promoted to installed. Utility routing and cabinet/guard details unknown. | BLOCKED_EVIDENCE |
| Modes / navigation | Separate instance passes lifecycle, scoped inspection, two toggle orders and all 19 specific taxonomy refs. | COMPLETE code checks; 3D visual unverified |

Second pass executed separately on CTP 2, including same actual triangle-surface rays and rest/mode checks. Findings, fixes and limitations agree with shared-family implementation. Audit sections processed; release verification pending. No custom dimensions, identity or factory orientation changed.
