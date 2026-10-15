# Detailed wall audit — 15 October 2026

Base: `d480f2ceff3b316c50a6c7f09431d97bd4f0a669`. Scope is the digital model, not certification of the installed building. Machine audit cursor and completed machine results remain unchanged.

## Inventory and evidence

`wall-audit-inventory-20261015.json` records every mesh in the walls layer and every wall/partition/liner semantic elsewhere: 2,949 meshes, 36,324 triangles. Every position is transformed into world coordinates; each record contains bounds, visibility, layer ownership, triangle count and available source identity/dimensions. All vertices are finite. Reproduce with `node scripts/audit-walls.mjs`.

The source contains 355 normalized DXF wall runs. The source drawing establishes plan geometry; height, finish, installed construction and many room partitions remain visualization assumptions. Audit source: repository normalized `250804 layout offset.dxf` data, existing building/room/IPAL evidence annotations and actual runtime geometry. No new installed hardware or surveyed dimensions have been inferred from family examples.

| Wall family | Examination and result |
|---|---|
| Source walls | Examined transformed endpoints, widths, source handles, machine/door clipping and redundant collinear intervals. 276 assembled fragments before correction; 269 after. Original plan union and wider solid preserved. |
| Exterior supplements | All 19 meshes inventoried with world bounds; remain inferred perimeter closures. Their height and connection to the eave require installed evidence. |
| Room closures | All 56 supplement panels and 17 room liners examined; closed finish above the existing door frame was missing in 17 rooms. Added matching finish only. |
| Offset room partitions | All 25 lower opaque panels inventoried. They now follow wall-layer visibility; upper glass and glazing framing remain independently selectable with windows. Their installed layout is not certified. |
| IPAL operator room | Photo-derived rear/east/front walls, split west wall, front piers/headers and side sill/header pieces included in inventory. No new walls added around the open process canopy. |
| Plinths, skirts, girts and finishes | Every wall-layer detail included in bounds/finite-geometry audit. Intentional perpendicular contacts and finish layers are retained rather than deleted using a generic collision rule. |

## Supported corrections

1. **Nine redundant source-wall intervals, 15.67665 m total.** Equal centreline solids overlapped by 0.36725–4.6613 m; thin 105 mm walls also occupied wider 153 mm wall runs. Subtract only the contained interval, prioritize wider walls and retain uncovered ends. No broad snapping, wall relocation or bridging of a door/machine opening. All original source entries remain in the source data and removed handle pairs/lengths are retained in the audit ledger.
2. **17 missing door-header finish panels.** Previously the liner stopped on each side of the door but left a finish gap from the frame head to the ceiling. New 28 mm panels use the existing opening width and shell height, with their bottom at the existing frame's top (`jambH + 0.0275 m`). This is a finish closure, not a claim about an installed structural lintel. The clear opening, jambs and verified machine dimensions are unchanged.
3. **81 opaque panels escaped the wall toggle.** 56 inferred room panels and 25 press-room lower partitions remained in the building layer. They now attach to the wall layer with world transforms preserved. Floors, furniture and upper glazing retain their own layers.

## Second pass and validation

Independent world-endpoint scan finds **zero remaining exact-centreline source-wall overlap intervals**. This is an actual calculated result, not the legacy `doubleWallOverlaps: 0` metadata. World vertex inventory detects no nonfinite geometry. A separate pass over sorted world vertex sets finds zero exact visible wall-geometry duplicates; visible wall geometry has minimum Y = 0 m. This does not rule out every partial or perpendicular intersection. Targeted regressions cover reversed endpoints, partial overlap, width priority, nearby distinct lines, preserved openings, immutable input, layer ancestry and all 17 added headers. Existing room, access and clearance regressions also pass (24 tests).

Full regression/build and release status are recorded in `wall-audit-progress.json`. Production UI was opened on 15 October; it redirected to `?view=2d` and explicitly disabled 3D (“3D belum tersedia di perangkat ini”). Thus no visual 3D approval is claimed. HTTP/source hash and tests are deployment evidence only.

## Remaining work / BLOCKED_EVIDENCE

- Visual 3D walk-through of every wall face, interior/exterior toggle order, corners, roof junctions and openings is still required in a working 3D runtime.
- Survey/photo confirmation of actual wall heights, thicknesses/materials, exterior wall-to-eave closures, room partitions and structural lintels is missing. Source wall height 3.50 m and exterior supplements 3.56 m must not be promoted to surveyed dimensions; roof eave is a separate model parameter.
- Existing machine-clearance-driven wall shifts are retained and explicitly inventoried by source coordinates/shift; installed plan fidelity requires survey evidence before reversing them.
- The audit does not certify structural adequacy, fire resistance, building-code compliance or that every inferred partition exists on site.

The supported defects are repaired, but the broader “all walls realistic” validation remains **IN_PROGRESS** until visual inspection and the listed installed evidence are available.
