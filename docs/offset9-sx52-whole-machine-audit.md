# BMJ-MCH-0006 — whole-machine audit

Asset: OFFSET-9, HEIDELBERG Speedmaster SX 52-4+L, serial GS001804, year 2024, SAP OFS-9.

## Evidence boundary

The BMJ registry proves the identity and installed `4 PU + L` sequence. HEIDELBERG SX 52 product and technical publications support the family process, 370 × 520 mm maximum sheet, 360 × 520 mm maximum print/coating area, 15,000 sph maximum speed, central suction-tape feeder, Alcolor, chamber-blade coating, feeder pile height and standard/high-pile capability values. No identity-bearing installed photograph is attached. Perfecting, dryer/UV, high-pile delivery, exact roller/nozzle counts, washup, TransferJacket variant, Press Center generation and serial-specific utility routing remain unverified.

Orientation remains sheet flow `-X → +X`, operator side `-Z`, drive side `+Z`.

## Ordered audit

| Section | Measured finding and action | Status |
|---|---|---|
| Feeder/input | Existing paper top was `y=1.250 m`; suction low point was `y=1.536 m`, leaving 286 mm non-contact. Paper height also ignored the official 0.915 m pile value. | Pile now uses 0.915 m and sits on lift top `y=0.525 m`; suction assembly is mounted 96 mm lower so its 45 + 14 mm stroke reaches `y=1.440 m` without penetration. COMPLETE. |
| Suction tape/register | Central tape, front/side lays and feeder Venturi references are aligned with the sheet entry plane. | NO_CHANGE_REQUIRED; installed nozzle population BLOCKED_EVIDENCE. |
| PU1 + transfer | Plate/blanket/impression/transfer surfaces, register handoff and path clearance checked. Path approaches the process nip without crossing a cylinder core. | COMPLETE; installed roller, AutoPlate, washup and jacket variants BLOCKED_EVIDENCE. |
| PU2 + transfer | Same transformed-surface, clearance and timing checks. | COMPLETE; option population BLOCKED_EVIDENCE. |
| PU3 + transfer | Same transformed-surface, clearance and timing checks. | COMPLETE; option population BLOCKED_EVIDENCE. |
| PU4 + transfer | Same checks through handoff to coating unit. | COMPLETE; option population BLOCKED_EVIDENCE. |
| Inline coating | One doctor edge penetrated the 105 mm anilox surface by about 27 mm; the other floated about 120 mm away. The chamber body was also displaced above the roller centerline. | Chamber centered to the represented anilox; both thin blade edges repositioned tangentially with less than 1 mm numerical error. Exact installed blade angle/pressure and circulation routing remain unasserted. COMPLETE/BLOCKED_EVIDENCE. |
| Delivery transport/brake | Six-bar loop and brake are simulation references. High-pile Venturi remains visibly option-bounded and inactive. | COMPLETE; installed high-pile option and exact chain timing BLOCKED_EVIDENCE. |
| Delivery pile/output | Static pile floated 5 mm above table and simulated sheets floated 7 mm. | Static and dynamic sheet bottoms now meet support plane `y=0.495 m`. COMPLETE. |
| Housing/control/access/utilities | Exterior/cutaway/LOD behavior, attached service details, taxonomy mapping and floor interfaces checked. | COMPLETE; installed Press Center generation, optional packages and utility routing BLOCKED_EVIDENCE. |

## Validation

Focused regressions assert identity/configuration boundaries, all real stations, feeder and delivery support/contact, chamber-blade tangency, cylinder-core clearance, rotor whitelist, gripper loop, coating/brake timing, option-bounded Venturi behavior, six-level taxonomy, cutaway and reset. Full repository test/build and deployment evidence are recorded in `docs/fleet-audit-progress.json` after release verification.

