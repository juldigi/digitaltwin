# BMJ-MCH-0005 — whole-machine audit

Asset: OFFSET-8, HEIDELBERG Speedmaster CX 104-8+LYYL, serial XB001916, year 2022, SAP OFS-8.

## Evidence boundary

The registry proves the machine identity and installed sequence `8 PU + L1 + Y1 + Y2 + L2`. HEIDELBERG CX 104 technical and product material provides the family dimensions, maximum sheet/print format, stock range, standard/optional speed, pile heights, Preset Plus feeder/delivery, AirTransfer, Alcolor, chamber doctor blade/anilox coating, dryer coordination and dynamic sheet brake. No identity-bearing installed BMJ photograph is currently attached to this asset. Family references therefore support process architecture only, not the exact installed roller/nozzle population, dryer energy package, coating-circulation plumbing, optional controls or service-side routing.

Orientation remains sheet flow `-X → +X`, operator side `-Z`, drive side `+Z`. The registered custom identity and LYYL order were preserved.

## Ordered audit

| Section | Checks and measured result | Action/status |
|---|---|---|
| Feeder/input | Lift-table top is `y=0.650 m`. The former 1.020 m paper block ended at `y=1.670 m`, while the suction-cup low point was about `y=1.970 m`: a 300 mm non-contact gap. Official feeder pile height is 1.320 m. | Paper pile set to 1.320 m and seated at `y=0.650 m`; combined 55 mm head and 15 mm cup stroke now reaches the `y=1.970 m` top plane without crossing it. COMPLETE. |
| Stream feeder/register | Feedboard, three feed wheels and side/register references are aligned with the model sheet route. No supported dimensional defect found. | NO_CHANGE_REQUIRED. |
| PU1 + transfer | Plate/blanket/impression/transfer surfaces, AirTransfer guide and path clearance checked. Sheet centerline remains outside cylinder cores and approaches the real nip region. | COMPLETE; installed roller/nozzle counts BLOCKED_EVIDENCE. |
| PU2 + transfer | Same transformed-surface and transfer checks; no overlap regression. | COMPLETE; counts BLOCKED_EVIDENCE. |
| PU3 + transfer | Same transformed-surface and transfer checks; no overlap regression. | COMPLETE; counts BLOCKED_EVIDENCE. |
| PU4 + transfer | Same transformed-surface and transfer checks; no overlap regression. | COMPLETE; counts BLOCKED_EVIDENCE. |
| PU5 + transfer | Same transformed-surface and transfer checks; no overlap regression. | COMPLETE; counts BLOCKED_EVIDENCE. |
| PU6 + transfer | Same transformed-surface and transfer checks; no overlap regression. | COMPLETE; counts BLOCKED_EVIDENCE. |
| PU7 + transfer | Same transformed-surface and transfer checks; no overlap regression. | COMPLETE; counts BLOCKED_EVIDENCE. |
| PU8 + transfer | Same transformed-surface and transfer checks; handoff continues into L1. | COMPLETE; counts BLOCKED_EVIDENCE. |
| L1 coating | Chamber-doctor/anilox/blanket/impression process family and sheet route checked. Existing family-reference geometry retained; exact blade pressure/contact setting and circulation routing are not asserted. | COMPLETE; installed detail BLOCKED_EVIDENCE. |
| Y1 dryer | Sheet guide clearance, process cassette bank, recirculation and exhaust references checked. Activation is sheet-occupancy driven. | COMPLETE; installed energy technology BLOCKED_EVIDENCE. |
| Y2 dryer | Same functional and timing checks. No UV/LED/IR package inferred from `Y`. | COMPLETE; installed energy technology BLOCKED_EVIDENCE. |
| L2 coating | Same evidence boundary and process checks as L1; final coating pass precedes delivery. | COMPLETE; installed detail BLOCKED_EVIDENCE. |
| Delivery/output | Delivery-table top is `y=0.650 m`; former static stack bottom was `y=0.635 m`, penetrating the table by 15 mm. Gripper loop, dynamic brake and simulated sheet accumulation were also checked. | Static stack raised 15 mm so its bottom is exactly `y=0.650 m`; dynamic sheets remain seated from `y=0.6505 m`. COMPLETE. |
| Housing/control/access/utilities | Exterior covers hide in interior mode, paired side frames and access structure retain clearance, taxonomy selection remains mapped. Exact installed HMI/options and service connections are not evidenced. | COMPLETE; installed options BLOCKED_EVIDENCE. |

## Validation and remaining unknowns

Automated regressions now assert feeder support/contact, delivery support, official CX 104 limits, all 12 registered modules, PU/transfer path clearance, occupancy-driven coating/drying/braking, delivery gripper-loop motion/reset, normal/interior behavior, taxonomy and evidence routing. The full repository test/build gates are recorded in `docs/fleet-audit-progress.json` after release verification.

Remaining `BLOCKED_EVIDENCE`: identity-bearing installed photos; exact inking/dampening roller and AirTransfer nozzle population; chamber blade setting and coating-supply routing; Y1/Y2 energy technology; exact delivery-chain dimensions/timing; installed HMI, optional equipment and utility routing. These do not block the independent contact fixes or functional digital-twin validation.
