# V343 — Fleet surface fidelity and factory model compression

The request is to make all 41 machines and IPAL look like real industrial equipment. This revision addresses a shared rendering fault rather than changing verified machine dimensions or inventing OEM hardware.

## Visible rendering corrections

- All 41 detailed machine templates receive authored-name material classification. Coated cabinets, rubber and paper are dielectric; exposed metals retain a metallic response. Original colours, transparent glazing, process films and simulation light behaviour are preserved. Chrome retains a smoother authored finish.
- Factory baking used to group meshes only by colour, discard original normals, and recalculate normals after joining corners. That merged distinct material types and smoothed hard panel edges. Baking now retains material response, alpha and authored face normals. Degenerate triangles after quantization are omitted.
- Factory loader restores the baked normals and material response, with compatibility for older records. The actual visible equipment bounds determine bake centering, excluding hidden system diagrams.
- Active photo-derived IPAL: metallic tank/hopper/canopy surfaces, coated yellow frames and pump housings, and concrete paving/pads use separate material responses. Weathering overlays and translucent roof panels retain their authored treatment. This is surface presentation, not a claim of verified alloy or coating grade.
- A single cached 128px neutral-room PMREM serves balanced, high, technical and cinematic profiles in factory and machine views. Economical mode keeps reflections disabled. The environment represents presentation lighting, not a measured BMJ light field.

## Primary technical references

https://threejs.org/docs/pages/MeshStandardMaterial.html — metallic/roughness workflow, authored material response, environment maps.
https://threejs.org/docs/pages/PMREMGenerator.html — roughness-filtered environment lighting and bounded `fromScene` texture size.
https://threejs.org/docs/pages/RoomEnvironment.html — generated neutral room lighting.

## Validation and costs

New tests cover all 41 material classifications and ghost restoration, hard-edge normal preservation, distinct same-colour material descriptors, factory reconstruction, active IPAL surface separation, and reflection profile policy. Existing 41-machine silhouette/taxonomy, IPAL mechanics, grounding/motion and simulation-stage audits pass.

The richer compressed fleet is approximately 2.91 MB as base64, compared with 1.87 MB previously. Fourteen 210 KB chunks preserve progressive loading; the offline shell and build-time cache count cover all chunks. This costs initial download/decode memory, without an additional animation loop or per-frame environment generation.

Nineteen installed models remain unidentified; this revision does not certify serial-specific geometry. The available cloud browser lacks WebGL, so automated surface/geometry checks cannot substitute for rendered 3D visual approval on the user's device.
