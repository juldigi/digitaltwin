# V347: round-component contour fidelity

All 41 machine templates now refine untouched full-circle cylinder geometry at inspection quality. Rollers, shafts, pulleys and cylinders retain their authored radius, length, axis and placement; eligible radial segments double up to 64. This reduces polygon chord error without redesigning cabinets, printing units or transfer junctions.

Only analytic cylinders with original position, normal, UV and index buffers qualify. Deformed or translated geometry, partial cylinders, small fasteners, vertex-coloured geometry, morphs, skinned and instanced meshes remain untouched. Economical/factory baking restores original geometry; repeated detail changes reuse the same replacements. Disposal restores originals and frees owned replacements once.

Reference: [Three.js CylinderGeometry](https://threejs.org/docs/pages/CylinderGeometry.html), documenting radial segmentation separately from physical radius, height and angular extent.

Validation includes mathematical contour error, dimensional and cap preservation, exclusion of authored special shapes, resource ownership, all 41 machine detail switches, existing geometry and simulation audits, full tests and production build. Existing factory baked assets should remain unchanged.

This is a targeted contour improvement, not proof that every machine exterior matches an as-built survey. Nineteen machine models still lack confirmed OEM identity. No unsupported cabinet layout, dimensions or mechanism has been invented to fill those gaps. Offset 5 dimensions and existing photo-derived junctions remain authoritative. Browser WebGL availability limits visual verification in the current environment.
