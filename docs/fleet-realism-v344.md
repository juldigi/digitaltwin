# V344 — optical microfinish for the detailed fleet and active IPAL

Detailed templates for all 41 registered machines now receive subtle procedural roughness variation appropriate to their existing surface classification: painted steel, stainless steel, galvanized steel, rubber, paper and concrete. Active photo-referenced IPAL surfaces use the same mechanism. Existing colour, geometry, machine taxonomy, dimensions and simulation visibility are preserved. Chrome, transparent materials, lights and authored roughness maps are excluded.

These finishes are optical references, not measured BMJ surface samples. No fabricated corrosion, scratches, stains or displacement are added. The 19 unidentified installed models remain unidentified; this change does not establish exact OEM fidelity.

Each template shares at most six deterministic 32 × 32 RGBA textures, with mipmaps to reduce distant aliasing. Materials release textures through a reference-counted pool; template and factory teardown also release remaining resources. No additional image downloads are required. Baked factory geometry has no UV coordinates and keeps its existing finish until progressive hydration loads the detailed template.

## Validation

- Targeted tests cover all 41 templates, deterministic texture data, preserved static colours and visible envelopes after simulation, authored-map exclusions, shared-resource disposal and active IPAL cleanup.
- Full repository test suite and production build are required before release.
- Automated geometry and material checks do not replace inspection on a WebGL-capable device or installation photographs.

## Primary implementation references

- https://threejs.org/docs/pages/MeshStandardMaterial.html — roughness map green channel multiplies material roughness.
- https://threejs.org/docs/pages/DataTexture.html — typed-array texture storage.
- https://threejs.org/docs/pages/Texture.html — texture filters and mipmaps.
- https://threejs.org/manual/pages/color-management.html — non-colour textures use NoColorSpace.
