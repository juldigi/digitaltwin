# POLAR 115 EM-MON — knife and cutting-stick audit

Asset BMJ-MCH-0001 / GLM-1 / serial 5831536. Scope: represented knife blade, carrier, cutting stick, fixed drive/sensing references, downstroke ownership and cut-contact causality. Stock removal and output remain the next audit part.

Evidence: installed BMJ photographs IMG_2488.jpeg and IMG_2489.jpeg for the table, throat and cut-line relationship; registered POLAR EM-MON family operating references for the guillotine sequence. The photographs do not expose the internal knife-drive linkage, blade bevel, cutting-stick groove or installed wear condition.

## Findings and repairs

- The represented cutting stick projected 37.5 mm above the 0.940 m table surface and intersected the resting paper pile. Its existing 25 mm section is now embedded with its top exactly flush to the represented table plane; the pile retains the audited 1 mm support clearance.
- Simulation formerly translated the whole `polar-knife` assembly. This incorrectly moved the cutting stick, hydraulic-drive interface, top-position sensor and linkage references. Motion now belongs only to `polar-knife-blade` and `polar-knife-carrier`; stationary references remain fixed throughout the cycle and reset.
- The former 330 mm animation stroke stopped before the represented pile and stick. Stroke is now derived from the higher raked blade-bottom corner to the cutting-stick surface (approximately 372.1 mm), so the full cutting edge reaches the contact plane without penetrating it.
- Cut completion is now geometry-derived from `knifeGap` within a 0.5 mm numerical tolerance. It is no longer triggered by 97% animation progress.
- The carrier rest height was raised 20 mm so its lower surface preserves about 1.9 mm clearance above the represented 85 mm pile at full blade contact. This is a geometry-derived clearance correction, not a surveyed installed dimension.
- Blade and carrier remain synchronized and visible in normal, interior, full-detail and low-detail modes.

## Validation and boundary

Focused geometry and cycle tests measure transformed stick/table/pile surfaces, fixed-versus-moving ownership, blade/carrier synchronization, terminal contact without penetration, carrier clearance, display modes and stop/reset restoration. The full release suite and production deployment are required before this part becomes complete.

Exact blade bevel, skew setting, cutting-stick groove/profile, wear depth, installed stroke, carrier linkage and hydraulic timing are `BLOCKED_EVIDENCE`. Existing family-reference linkage geometry is not promoted to a measured BMJ installation, and no additional roller, linkage, cylinder or pipe was invented.
