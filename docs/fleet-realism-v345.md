# V345 — visible equipment and factory shadow coverage

The factory view reset the directional shadow camera to ±12 metres around world origin. Most installed assets and active IPAL lie outside that region. Camera framing now fits the same shadow light to opaque, visible geometry in the framed object. Hidden reference branches, transparent process films and labels do not inflate shadow bounds. Instanced geometry is included. Utility machine framing retains its existing equipment-only envelope.

The former 80 metre coverage cap is removed so the complete actual factory remains covered. Compact-machine minimum coverage is retained, and focus on an individual factory asset allocates the existing map to that asset. No extra shadow light, map or continuous bounds computation is added. The light target is explicitly attached to the scene and released with lighting teardown.

Opaque photo-derived IPAL vessels, supports and canopy columns are allowed to cast shadows. This is an optical correction, not a new equipment geometry claim. Existing shape, material colour, dimensions, taxonomy, simulation and mobile controls are unchanged. The economical quality profile continues to disable dynamic shadows.

Validation includes projected shadow-frustum corner containment for all 41 templates and the actual factory, active IPAL vessel/column casting, hidden-reference exclusions, compact-machine resolution and utility equipment focus. Full repository tests and production build are required before publication. Actual WebGL visual fidelity is still not established by these numerical tests.

Primary references:
- https://threejs.org/manual/pages/shadows.html
- https://threejs.org/docs/pages/DirectionalLight.html
- https://threejs.org/docs/pages/OrthographicCamera.html
