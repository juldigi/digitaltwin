# V346 — bounded cinematic depth and edge treatment

The previous Sinematik pipeline was RenderPass → bloom → OutputPass and was restricted to focused machine view. The explicit Sinematik profile now uses RenderPass → GTAO → restrained bloom → SMAA → OutputPass for machine and factory views, including active IPAL. Existing geometry, installed dimensions, taxonomy, colours and simulation remain authoritative.

Transparent glazing and ghosted guards are excluded from the normal buffer, with visibility restored even after a buffer-render exception. This adapter is tested against the pinned Three.js r180 implementation. GTAO uses a 0.22 world-unit radius, 0.06 thickness, eight samples and a 0.35 blend. Denoise uses radius four and eight samples. Bloom strength is reduced from 0.12 to 0.08 and threshold raised to 0.98, avoiding an excessive glow treatment. SMAA operates before OutputPass in linear colour space. No blur, motion blur, artificial wear or depth-of-field obscures inspection geometry.

Composer targets are capped at two million pixels and 2× pixel ratio. GTAO runs at half the compositor width and height. The effect still needs extra GPU passes and memory: the cap is not a promise of stable frame rate on every phone. Automatic quality does not select Sinematik. Other profiles use direct rendering. One composer and one render loop remain in use.

Concurrent lazy requests share an import. A disabled or disposed context cannot allocate a stale pipeline. Leaving Sinematik releases the composer and each pass, including the GTAO shader material omitted by the installed Three.js r180 pass cleanup. GPU render failure restores the direct target, scene override material and line/point visibility before falling back to direct rendering.

Validation covers bounded resolution on phone/4K/8K views, pass order, single-flight imports, disable/dispose races, complete teardown, render-failure fallback and the installed GTAO parameter API. Full fleet and interface regressions and production build are required before release.

This improves realtime rendering, not model evidence. Nineteen installed machine identities remain unresolved. Browser verification currently cannot render WebGL 3D; no movie-quality or photorealistic visual validation is claimed. MCU-level production would additionally require film-grade measured assets, authored texture sets, scene lighting and offline rendering beyond this web twin.

Primary references:
- https://threejs.org/docs/pages/GTAOPass.html
- https://threejs.org/docs/pages/SMAAPass.html
- https://threejs.org/docs/pages/EffectComposer.html
- https://threejs.org/manual/pages/post-processing.html
