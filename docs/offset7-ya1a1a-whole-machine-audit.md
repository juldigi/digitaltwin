# OFFSET 7 · YA1A1A whole-machine audit

Asset: `BMJ-MCH-0004` · BMJ name `OFFSET - 7 MACHINE` · model `YA1A1A` · serial `WDB-13006`.

## Evidence boundary

The BMJ registry identity and external exact-model references classify YA1A1A as a Beijing Zhenhengli/Ezgravtek single-colour sheet-fed gravure press. Repository sources include the YA1A1A public equipment register and installed/exterior references, supplemented only by documented sheet-fed gravure patents and manufacturer-family references. No installed BMJ photo set or serial-specific manual establishes exact dimensions, transport timing, drive topology, ink-feed mode, dryer energy technology, or delivery options. Those items remain `BLOCKED_EVIDENCE`; the twin must not be converted into a Heidelberg-style offset press.

## Whole functional path

1. **Sheet feeder / input** — suction head, vacuum supply and swing-pawl handoff remain family/mechanism references; installed geometry and timing are unresolved.
2. **Register and transfer** — lays and transfer-gripper references are present and taxonomy-mapped; installed settings and sheet path are unresolved.
3. **Ink supply** — adjustable pan and circulation are represented. Drop-feed remains explicitly an unverified option, not an installed claim.
4. **Gravure cylinder and doctor** — the doctor edge previously penetrated the 285 mm reference cylinder by about 66 mm. It is now tangent within the modeled family-reference tolerance.
5. **Impression / sheet control** — the cylinder pair retains a 5 mm modeled clearance and the pre-nip anti-slack reference remains separate. Exact pressure, diameters and gripper phasing are unresolved.
6. **Drying / exhaust** — functional plenum and exhaust references remain visible, with heater/UV/IR technology unasserted.
7. **High-pile delivery / output** — chain-guide and pile interfaces remain family references; non-stop equipment and timing are unresolved.
8. **Drive, control and access** — the fixed console and display no longer disappear with removable covers. Duplicate legacy service-door handles were removed, and cover seams now leave with the exterior in interior mode.

## Validation and unknowns

Normal, interior and low-LOD behavior is regression-tested. Taxonomy remains contiguous through six levels. Simulation remains fail-closed as `BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION`; no speculative sheet motion, ink flow, dryer activation or rotor timing was enabled. Required evidence to unblock it: BMJ installed photos from feeder through delivery, serial manual or electrical/mechanical drawings, cylinder/doctor measurements, ink circuit identification, dryer nameplate/technology and transport/drive timing.
