# POLAR 115 EM-MON — stock removal and output audit

Asset BMJ-MCH-0001 / GLM-1 / serial 5831536. Scope: post-cut material split, support contact, clamp-release timing, operator-side removal route, reset and existing material-handling taxonomy. This cutter has no represented delivery conveyor; housing and controls remain the next audit part.

Evidence: installed BMJ front/oblique photographs IMG_2488.jpeg and IMG_2489.jpeg show the dark cutting table and accessible operator edge. The registered operating-process reference supports clamp release followed by stock removal or repositioning. No installed automatic unload, jogger, Autotrim or conveyor is visible or documented.

## Findings and repairs

- The front cut piece was forced to Y 1.006 m after separation. With an 85 mm represented pile and table top Y 0.940 m, its bottom floated 22.5 mm above the support surface. It now retains the audited pile center Y 0.9835 m, leaving the same 1 mm visualization clearance as the uncut and rear material.
- Output translation began at cycle phase 0.74 while the clamp did not fully release until phase 0.84. The removable piece now stays at the cut line until full clamp release, then travels along the existing front cutting table from phase 0.84 to 0.96.
- The rear remainder stays registered behind the cut line while the front piece moves toward the operator edge. The split conserves the original 680 mm represented depth as 420 mm front stock plus 260 mm rear remainder without overlap.
- At the final displayed removal position, more than 88% of the piece depth remains above the existing table; the small leading overhang communicates manual removal without adding unverified delivery hardware.
- Output state now exposes moving, ready and progress semantics. Stop/reset removes the separated view and restores the original pile exactly.
- Normal, interior, full-detail and low-detail modes keep the physical main table visible. Existing `P115.FEED.CENTER` taxonomy remains the correct navigable support; no fictional `polar-delivery` or conveyor was created.

## Validation and boundary

Focused tests sample the transformed table and both stock surfaces across the cycle, reject floating or penetrating stock, verify minimum support overlap, enforce clamp-before-output timing, confirm monotonic operator-side travel, material conservation, display modes, taxonomy and reset.

Exact manual handling direction after each production cut, operator technique, pile weight, air-table use during removal and any unattached auxiliary handling equipment are `BLOCKED_EVIDENCE`. Automatic unloading, jogger, waste extraction and Autotrim remain explicitly excluded rather than inferred.
