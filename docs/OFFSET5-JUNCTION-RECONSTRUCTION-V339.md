# V339 — Offset 5 exterior and interfaces

## Evidence reviewed

Actual supplied BMJ photographs were reopened for this change (not inferred from old comments):

- IMG_1626: vacuum table meets PU1 guarded receiving face; stacked grilles, connected lower register housing.
- IMG_1627: broad curved silver operator cabinets and recessed inter-unit access.
- IMG_1628: stacked transverse grille faces; top is open between attached service members. No full-depth roof is added.
- IMG_1662: continuous checker-plate inter-PU landing covering lower mechanisms, supported approach steps.
- IMG_1630 and IMG_2391: sloped dryer hood followed by flat cabinet deck; inspection bridge is mounted to the continuous downstream installation.
- Historical V408_PU_GREEN_INK_DUCT_ROLL_FIX.html: checked actual V404/V408 code, including disabled V403 roof placeholders. A summary describing V403 as the accepted closed top was contradicted by the file itself. Preserve the open service deck and external green duct roller.

OEM cross-checks (family topology, not installed BMJ dimensions):

- HEIDELBERG Japan CD102 product information: https://www.heidelberg.com/jp/ja/products/press/format_70_x_100/spedmaster_cd_102/product_information_10/product_information_15.jsp
- HEIDELBERG history, CD102 double-diameter impression / triple-diameter transfer principle: https://www-server1.heidelberg.com/global/en/about_heidelberg/our_history/stories/from_the_tiegel_to_the_speedmaster.jsp
- Heidelberg-authored March 2020 CD102 brochure, pages 4–6, explicitly sample/optional configurations: https://pdf.directindustry.com/pdf/heidelberger-druckmaschinen-ag/speedmaster-cd-102/124193-935728.html
- HEIDELBERG CD102 eight-color coating/UV press reference: https://www.heidelberg.com/global/en/about_heidelberg/press_relations/press_release/press_release_details/press_release_122112.jsp
- Official March 2020 PDF was found but its fetch was blocked; no claim of reading that PDF is made.

## Corrections

1. PU transverse faces now have stacked upper/lower protection grilles and attached service handles. Rounded silver operator cabinet, external green roller and open upper deck remain.
2. Root-level inter-unit transfer drums/grippers are internal inspection geometry. Added bearing saddles/frame ties had a second visibility override in offset5-realism.js; it now follows the same interior state rather than re-exposing them in normal exterior or hiding their mounts during cutaway.
3. Vacuum table→PU1 receives a guarded throat spanning the actual locked face gap (0.26 scene units), with deck at table elevation and attached side cheeks. It does not move/rescale PU1 or table.
4. Coater/dryer and dryer/delivery transitions now use supported flat cabinet decks instead of raised black/white canopies. Cabinet seams and latches follow the photo arrangement. Transition cabinets and covers are no longer optional LOD details; all three downstream junctions remain present on mobile.

## Boundaries and validation

The custom BMJ envelope, 1.95 unit pitch, PU centers and module lengths are unchanged. Interface dimensions are photo reconstruction constrained by those endpoints, not serial-specific OEM CAD measurements. The inside roller diagram cannot define normal exterior shape.

Tests check actual world-space endpoints, supported flat decks, all eight guard extents, transfer visibility through quality/reset cycles, and 600-frame simulations in both detail modes. Existing process/nip/contact, dimensional, cutaway and fleet checks also run in the full release suite. Automated browser environment has no WebGL; these tests do not certify an iPhone visual match.
