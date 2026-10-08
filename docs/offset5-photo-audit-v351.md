# Offset 5 photo audit — V351

## Evidence and limits

Reviewed 40 physical photographs and one roller diagram, including the 16 originals in Offset5.zip (SHA256 9d4c37ac6b24df89e767a2fbad3aa2c7cc1a26e3e53bf09ab4e3b9908a6a3bd9). Contact sheets were inspected for the complete inventory; representative feeder, operator side, upper PU, inspection and internal views were also inspected at original resolution. These are photographic constraints, not installed-machine CAD or measured internal coordinates.

Historical inventory: IMG_0947, IMG_1165, IMG_1624, IMG_1625, IMG_1626, IMG_1627, IMG_1628, IMG_1628(2), IMG_1629, IMG_1630, IMG_1631, IMG_1633, IMG_1634, IMG_1656, IMG_1662, IMG_1970, IMG_1971, IMG_2312, IMG_2388(2), IMG_2389(1), IMG_2390(1), IMG_2391(1), IMG_2392, IMG_2395 (JPEG), plus IMG_2463 through IMG_2478 (HEIC). IMG_2777.jpeg is the diagram, not a physical photograph.

| Region / view | Principal photographs | Photographic constraint |
| --- | --- | --- |
| Feeder, vacuum table, PU1 | 1624–1626, 2395, 2468–2470 | Dark feeder portal and inclined vacuum table terminate at receiving PU1; avoid inventing another projecting conveyor. |
| Operator-side PU and gallery | 1627, 1628, 1662, 2392, 2465–2467 | Rounded silver cabinets, adjacent dark control seam, clipped steps and continuous checkerplate gallery. |
| Upper PU / fountain | 1970, 1971, 1628(2), 2471, 2472, 2476 | Dark fountain housing, angled silver liner and attached cover hardware; job ink varies. These views do not expose every schematic roller simultaneously. |
| Drive-side orientation | 2389(1), 2390(1), 2395, 2477, 2478 | Service panels and hoses differ from operator-side cabinets; preserve existing operator/drive orientation. |
| Coater, dryer, inspection | 1629–1633, 2391(1), 2465, 2473 | Sloped dryer housing and flat metallic inspection deck with bridge-mounted camera pods. |
| Delivery | 1656, 2312, 2388(2), 1634, 2463, 2464, 2474, 2475 | Dark side housing, metallic roof, front guard and gated pile. |
| Internal cylinder / dampening reference | 0947, 2777 diagram | Diagram WATER callout establishes function; it does not establish the rectangular projecting pan, its dimensions, mounting or return-hose route. |

## Concrete correction

Removed the invented rectangular dampening tray, water slab and two fabricated hoses from each of the eight PUs. They are absent in both exterior and interior, including running, paused and stopped simulation. This is a geometry removal, not another visibility-only workaround. The empty semantic pan reference explicitly records that its installed shape is unverified. Taxonomy selection targets the visible roller 18 functional reference rather than an empty mesh.

Numbered dampening rollers and the existing cylinder topology remain diagram references. No new guessed pan was substituted. User-adjusted dimensions, module pitch, positions, envelopes and roller diameters were preserved. Other regions above are audit constraints, not claims that all their geometry was rebuilt by this patch.

## Validation boundary

Regression checks cover all eight PUs, taxonomy resolution, low/high detail, both viewing modes and simulation lifecycle. Existing installed-dimension tests are retained. The available browser does not support WebGL; deployment/source verification therefore cannot establish multi-angle visual acceptance of the rendered 3D scene. Exact as-built fidelity of hidden internals remains unverified.
