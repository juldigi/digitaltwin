# POLAR 115 EM-MON — safety arms and cut interlock audit

Asset BMJ-MCH-0001 / GLM-1 / serial 5831536. Scope: photographed front safety/control arms, their mounting, visible photocell apertures, two-hand functional command, light-barrier response and anti-repeat behavior. Clamp force/contact and blade geometry are audited separately.

Evidence: installed BMJ front and oblique photographs IMG_2488.jpeg / IMG_2489.jpeg; repository source registry; POLAR 92/115/137/155 EMC/EM-MONITOR operating-instruction archive and type-115 operating-manual safety reference already registered in `sources-polar115.js`. The photographs establish the two projecting arms, left mushroom control, drilled right face and mounting relation. Family manuals establish two-hand simultaneity, anti-repeat and light-barrier safety behavior, but the available BMJ angles do not prove the exact locations of two separate cut actuators.

## Findings and repairs

- Both represented arms are physically supported: each arm overlaps its existing mounting shoe by 35 mm vertically and remains attached through normal, interior, full-detail and low-detail modes.
- The template showed an additional guessed yellow/red button pair on top of the two arms alongside the separately photo-verified left mushroom control. The functional two-hand node is retained, but those four guessed meshes are now persistently suppressed and tagged `installedActuatorLocationVerified: false`; display/LOD changes cannot reveal them.
- The prior simulation generated `twoHandCommand` from cycle time alone. It now models independent left/right inputs, rising-edge timestamps and a 500 ms simultaneity window. The default demonstration supplies a valid paired pulse; explicit test/control inputs must meet the same rule.
- Anti-repeat now has a real armed state. Holding both inputs across a cycle boundary cannot cause a second cut; both must be released and validly pressed again.
- If either hand is released or the light barrier is obstructed before separation, the uncommitted knife and clamp retract instead of freezing mid-stroke. After a completed cut, the knife may finish its safe upstroke.
- Safety state now exposes left/right input, simultaneity validity and anti-repeat armed status. It explicitly reports that installed actuator positions are unverified.

## Validation and boundary

27 focused safety, transport, POLAR geometry, reset and fleet-smoke tests passed. Tests verify transformed arm-to-shoe mounting, persistent suppression of guessed buttons in every display combination, rejection of presses outside the 500 ms window, one cut for a held command, re-arm only after release, and retraction when one hand is removed during an uncommitted downstroke.

Exact BMJ light-curtain emitter/receiver internals, actuator contact types, safety relay model, safety PLC wiring and measured stopping time remain evidence-blocked. No invisible beam, relay, wiring or redundant channel hardware was invented. This visualization is not a substitute for functional safety validation, proof testing or measured stopping-distance assessment on the machine.
