# POLAR 115 EM-MON — clamp and pressure-contact audit

Asset BMJ-MCH-0001 / GLM-1 / serial 5831536. Scope: represented pressure beam, stock-contact face, cylinder housing, motion ownership and contact causality. Knife and cutting-stick penetration remain the next audit part.

Evidence: installed BMJ front/oblique photographs IMG_2488.jpeg and IMG_2489.jpeg for throat/table relationship; registered POLAR EM-MON family operating references for hydraulic pressing and published clamp-pressure range. The photographs do not expose the internal cylinder arrangement or provide a surveyed pressure-bar stroke.

## Findings and repairs

- After the corrected material support plane, the former 110 mm clamp stroke left the contact face 6.5 mm above the pile while `clampContact` became true merely because animation progress exceeded 90%. The stroke is now derived from represented surfaces: resting face bottom Y 1.1425 m minus pile top Y 1.0260 m = 116.5 mm.
- Contact state is now geometry-derived. The simulation exposes `clampGap`; contact is asserted only within a .5 mm numerical tolerance and the sampled minimum remains non-negative, so the pressure face does not penetrate the pile.
- The simulation previously translated the entire `polar-clamp` group. That incorrectly moved the cylinder housing and family-reference pressure hardware as a rigid block. Motion now belongs only to `polar-clamp-beam` and `polar-clamp-contact`; both descend synchronously while the cylinder housing and parent assembly remain fixed.
- Existing piston-rod overlap remains sufficient across the 116.5 mm represented stroke, so no new cylinder, linkage or hydraulic routing was added.
- Beam/contact visibility is preserved in normal, interior, full-detail and low-detail modes. Stop/reset restores both moving nodes exactly.

## Validation and boundary

29 focused clamp, safety, transport, geometry, reset and fleet-smoke tests passed. Tests sample the full clamp cycle, measure transformed contact-face and pile surfaces, reject penetration, verify fixed cylinder/assembly positions, confirm synchronized beam/contact motion and validate all display modes.

The published 150–4500 daN range remains a family/archive reference, not a simulated setpoint or measured BMJ pressure. Exact installed stroke, hydraulic pressure, piston diameter, compressibility and force distribution are evidence-blocked. No pressure value is fabricated, and this visualization is not a press-force or safety validation.
