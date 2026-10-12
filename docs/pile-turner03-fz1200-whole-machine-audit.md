# BMJ-MCH-0008 · PILE TURNER 03 · FZ 1200 whole-machine audit

Status: `COMPLETE`  
Audit mode: `AUDIT_ONE_MACHINE_THEN_FIX_VERIFY_DEPLOY`  
Identity: BMJ registry `PILE TURNER 03`, model `FZ 1200`, serial `2105080SF34`, year 2022, SAP `PLT-3`.

## Evidence boundary

- The BMJ registry proves this unit's identity, serial, year, functional location, and model string. It is not interchangeable with BMJ-MCH-0007 or BMJ-MCH-0022.
- Repository photo inventory records zero installed photos with identity proven for BMJ-MCH-0008.
- Exact-model public references support the FZ1200 functional sequence only. Installed OEM, capacity, opening, envelope, guard/HMI arrangement, actuator and cylinder population, blower/nozzle population, and utility routing remain `BLOCKED_EVIDENCE`.
- The contact corrections released for BMJ-MCH-0007 are shared by the FZ1200 template and were remeasured against this asset instance rather than assumed valid.

## Whole-machine audit

| Functional section | Result | Status |
|---|---|---|
| Load platform and lower support | Lower clamp plate contacts the platform at y=0.630 m without the previous 25 mm penetration. | `COMPLETE` |
| Clamp and pressure contact | Modeled 0.498 m stroke reaches the pile face; confirmation requires <=1 mm clearance. | `COMPLETE` |
| Lift and turning clearance | Clamp and yoke remain phase-locked around the Z pivot; pile and rotating envelope stay above floor. | `NO_CHANGE_REQUIRED` |
| Turn position lock | Turn remains gated by clamp contact and lift clearance; air remains gated by completed, locked turn. | `NO_CHANGE_REQUIRED` |
| Air separation and dust path | Air visualization reaches the turned pile. Layer separation expands away from its supporting face. Installed nozzle/dust layout remains unknown. | `COMPLETE` |
| Jog and alignment | Side and front/back jog plates span the turned pile working height and move only in the jog phase. | `COMPLETE` |
| Lower, release and unload | Turned pile follows its lower support during release instead of floating. | `COMPLETE` |
| Hydraulic and air utility | Functional timing and rotor whitelist pass; serial-specific installed routing/population is unavailable. | `BLOCKED_EVIDENCE` |
| Controls, guards and HMI | Identity remains `PILE TURNER 03` / `2105080SF34`; installed console generation and guard layout are unavailable. | `BLOCKED_EVIDENCE` |
| Normal/interior/LOD and taxonomy | Cutaway/LOD restore, six-level taxonomy, start/pause/resume/stop/reset, isolate, highlight, ghost, showOnly, and explode were audited. | `COMPLETE` |

## Repairs in this run

1. Replaced shared FZ1200 mesh materials with node-scoped material instances. Highlight and ghost state can no longer leak from a selected component to unrelated components with the same finish.
2. Corrected `showOnly` so it retains the selected node, its ancestor path, and all descendants. Previously descendants were hidden, making part-level navigation appear empty.
3. Added explicit PILE TURNER 03 identity and interaction regression coverage. Material clones are disposed with the template to avoid resource leakage.

## Second pass

The second pass repeated the full load→clamp→lift→turn→lock→air→jog→lower→release cycle and exercised interaction modes in both LOD/cutaway orders. World-space contact checks retained the released BMJ-MCH-0007 geometry corrections. The newly found defects were interaction-state isolation and descendant visibility, not process geometry.

## Validation

- Focused FZ1200 plus lifecycle/cutaway/taxonomy/simulation regressions: 145/145 passed.
- Full release suite: 1,566/1,566 passed; build completed for all 41 assets.
- Release commit: `abc8e471f294e7dd12f850975c508eab5724b5b5`.
- Workflows: CI `38248606897`, frontend verification `38248606822`, Cloudflare `38248607428`; all completed successfully.
- Production returned HTTP 200 after deployment.

## Remaining blockers

`BLOCKED_EVIDENCE`: installed photos, nameplate/OEM confirmation, actual dimensions and plant-facing orientation, installed guard/HMI, air and hydraulic routing, nozzle/blower/cylinder count, turn actuator, pressure and capacity values. No speculative hardware was added.
