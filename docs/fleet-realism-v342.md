# V342 — AHU impeller and IPAL pump continuity

The 41-machine fleet was rechecked for visible full/low-detail silhouette, taxonomy references, grounding/motion and simulation stage transitions. These automated checks verify runtime consistency, not serial-specific real-world fidelity.

## Corrections

- AHU 3, 4, 5, 6 and 8: replace the opaque full-radius cylinder and stationary blades stacked at the centre with a small rotating hub and rim-mounted radial blades. Blades inherit the shaft rotation and restore with simulation stop. The geometry remains a functional radial-fan reference; installed fan type, blade count and profile are explicitly unverified.
- Separate IPAL utility-source model: close the shaft gap between the stationary motor and volute, and add base-connected motor/volute feet. Only the coupling rotates. This source-model correction is distinct from the active photo-derived factory IPAL, whose stair and pump regression checks also pass.

## Evidence

Eurovent 6/18 (2022), section 9, identifies centrifugal/radial fans and distinguishes blade, housing, transmission and array variants. It supports the functional radial impeller family, not the exact installed BMJ AHU configuration:
https://www.eurovent.eu/wp-content/uploads/eurovent-rec-6-18-quality-criteria-for-air-handling-units-2022-en-2.pdf

The IPAL model retains its V206 fifteen-photo relative-layout evidence and does not add an invented cross-unit process route.

## Validation and limits

- New regression tests check blade placement in the shaft-normal plane, inherited rotation, stop restoration, coupling endpoints and base-to-housing supports.
- Existing V341 tests check all 41 visible silhouettes and taxonomy references, active photo-derived IPAL stairs/flanges, and utility model stationary motor behaviour.
- Grounding/motion and simulation-stage audits pass all 41 entries; Offset 7 remains deliberately blocked because its installed transport configuration is unverified.
- Nineteen machine models remain unidentified. Family references cannot establish exact installed geometry, options or dimensions.
