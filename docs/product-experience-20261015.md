# Product experience — workspace and machine discovery

Base: `c29a47991e99f30717baf6c50de1c15a394875e7`. This change addresses the observed composition and discovery problems; it does not certify the application as a finished flagship product.

## Observed production baseline

At a 1363 × 936 desktop viewport, the header occupied 68 px and `main.twin-shell` had 868 px available. However, its grid formed rows of 361 px and 507 px. The closed inspector remained an auto-placed grid item after the column template changed to two columns. Consequently the factory workspace and canvas were only 361 px high: 41.6% of the available working height.

Machine discovery opened a text-heavy two-column modal. Model identifiers appeared in two successive lines; every card repeated a generic “3D / Model 3D” marker rather than showing the machine. The primary action already selected the asset in the factory and opened its context, which is retained.

## Implementation

- Give the navigation rail, workspace and inspector explicit column/row placement. A closed inspector cannot create an unintended second grid row. Keep the existing panel open/close state, responsive positioning and source layout.
- Generate 41 transparent 640 × 320 PNG previews from the existing baked fleet triangles. An orthographic projection, painter sorting and bounded surface shading produce identification previews; they are not photographs or new machine models. A deterministic Node-only rasterizer and PNG encoder keep build generation independent of WebGL and external imaging services. Combined payload: 292,656 bytes. No source geometry, dimensions, orientation, evidence or simulation is modified.
- Replace generic 3D badges with previews. Show code/model once, area once, and a single “Lihat detail” action. Retain source machine names and registry IDs. Compact the introduction and tabs.
- Use three visual cards per desktop row, two at intermediate widths, and a compact image-plus-copy row on phones. Images are lazy-loaded; keyboard focus, search, filtering, component search and simulation-intent routing retain their existing behavior.
- Extend the current final experience stylesheet instead of adding another stylesheet layer. Previews are build outputs and participate in the existing build fingerprint and cache refresh.

## Validation and limits

Preview verification independently inflates all 41 PNG images, checks dimensions, nonempty transparent silhouettes and total payload below 1 MiB. Six sample previews were inspected as a raster contact sheet, including POLAR, Sheeting, Offset 5/8, CTP and AHU. Selection/editor regressions retain factory-first behavior and machine heading/evidence fallbacks.

The local server cannot be reached by the separate browser environment (`ERR_CONNECTION_REFUSED`). Production visual verification is therefore required after the guarded release. Record actual post-release grid dimensions, gallery image decode, search, selection, and panel round-trip before marking the desktop composition verified.

The production browser currently exposes 2D with 3D disabled. No visual 3D material, camera or cinematic-quality claim is made. Responsive CSS is retained and adjusted, but no physical iPhone pixel verification is claimed. Remaining product work includes a visually verified complete Offset 5 inspection/simulation experience, render/material direction and device-specific visual QA.

Release status and verification results: `product-experience-progress.json`.
