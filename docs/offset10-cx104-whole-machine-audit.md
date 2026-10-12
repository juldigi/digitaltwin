# BMJ-MCH-0009 — whole-machine audit

Asset: OFFSET-10, HEIDELBERG Speedmaster CX 104-2+LY-8+LY-1+L UV + FoilStar.

## Evidence boundary

The BMJ final drawing, proposal Q417_R2_SF_FY27, IST UV layout, preinstallation report, technical-data package and technotrans system diagram prove the custom module order, 1.225 m pitch, 0.564 m elevation, FoilStar on PU2, six interdeck plus three end-of-press UV lamps, X3 delivery and the documented peripheral families. HEIDELBERG family material supports Preset Plus, AirTransfer, Alcolor, chamber-doctor/anilox coating and dynamic sheet-brake architecture. No identity-bearing installed photograph is registered for BMJ-MCH-0009, so the exact installed roller/nozzle population, pipe/cable runs and control-face details remain `BLOCKED_EVIDENCE`.

Orientation remains feeder-to-delivery `+X`, operator side `-Z`, drive side `+Z`; plant rotation remains external to the machine template. The verified custom dimensions and sequence were preserved.

## Ordered audit

| Section | Checks and measured result | Action/status |
|---|---|---|
| Preset Plus feeder/input | Lift-table top is `y=0.710 m`. The former 1.100 m paper block penetrated the table 30 mm and ended at `y=1.780 m`, about 380 mm below the suction-cup contact plane. | Pile set to the documented CX 104 family height of 1.320 m, seated exactly on the table and ending at `y=2.030 m`; four suction cups now meet that surface without penetration. Simulation pickup starts on the same surface. COMPLETE. |
| Feed table/register | Board, belts/references and descent from pickup to register were checked against the continuous sheet curve. | NO_CHANGE_REQUIRED; exact installed register hardware remains BLOCKED_EVIDENCE. |
| PU1 adhesive + transfer | Cylinder surfaces, roller separation, sheet nip and downstream transfer checked. PU1 remains the FoilStar adhesive stage. | COMPLETE; adhesive chemistry/settings BLOCKED_EVIDENCE. |
| PU2 FoilStar transfer | Six unwind and six rewind positions, superstructure/frame contact, dancer/web route, transfer nip, occupancy timing and pause/reset checked. | COMPLETE; serial-specific web setup BLOCKED_EVIDENCE. |
| CU1 + transfer | Chamber, anilox, form/impression and sheet corridor checked. | COMPLETE; blade setting and circulation routing BLOCKED_EVIDENCE. |
| Y1 + transfer | Three interdeck lamps, sheet guide and full-sheet occupancy timing checked. | COMPLETE; cassette/service routing BLOCKED_EVIDENCE. |
| PU4–PU11, each transfer | All eight units were checked individually for module alignment, roller/cylinder penetration, nip corridor, rotation role, ink/dampening flow and handoff. | COMPLETE; installed roller/nozzle counts BLOCKED_EVIDENCE. |
| CU2 + transfer | Coating nip, supply reference and next-stage handoff checked. | COMPLETE; plumbing BLOCKED_EVIDENCE. |
| Y2 + transfer | Three interdeck lamps and trailing-edge timing checked. | COMPLETE; cassette/service routing BLOCKED_EVIDENCE. |
| PU14 + transfer | Final print unit geometry, fluid visualization and transfer to CUF checked. | COMPLETE; installed roller/nozzle counts BLOCKED_EVIDENCE. |
| CUF/final coating | Final chamber/anilox/form/impression path checked before X3 delivery. | COMPLETE; coating recipe and plumbing BLOCKED_EVIDENCE. |
| X3 drying/delivery transport | Three EOP UV lamps, DryStar references, gripper-chain corridor and dynamic brake occupancy checked. | COMPLETE; exact chain geometry and dryer service routing BLOCKED_EVIDENCE. |
| Delivery pile/output | Static pile is supported 10 mm above its table and simulated sheets seat on the measured table surface. Start/pause/resume/stop/reset clears and restores the pile correctly. | COMPLETE. |
| Housing, controls, access and utilities | 391 selectable nodes and 979 meshes were checked for floor penetration, adjacent-module clearance, cutaway, LOD, isolate/show-only, highlight/ghost and taxonomy reachability. No below-floor mesh or roller penetration was found. | Fixed show-only subtree loss and interior/LOD order leakage. Installed utility routing remains BLOCKED_EVIDENCE. |

## Second pass and validation

The second pass repeated all printing/coating roller-pair checks, sheet-centerline clearance, FoilStar and UV occupancy, delivery braking, lifecycle reset and both interior/LOD toggle orders. It found two independent interaction defects: `showOnly` retained ancestors but dropped descendants, and restoring full LOD could reopen cover-mounted/service details while interior mode remained active. Both are now state-composed and regression-tested.

Focused validation passes 21 Offset-10 tests. Full repository tests, build, workflow IDs, release commit and production verification are recorded in `docs/fleet-audit-progress.json` after the release gates complete.

Remaining `BLOCKED_EVIDENCE`: installed-machine photographs; serial-specific roller/nozzle population; exact ink, adhesive, dampening and coating routes/settings; FoilStar web setup; UV/cooling/exhaust service routes; delivery-chain dimensions; HMI/control faces; utility pipe/cable routing. No speculative hardware was added.
