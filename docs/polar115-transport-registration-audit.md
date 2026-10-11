# POLAR 115 EM-MON — stock transport and backgauge registration audit

Asset BMJ-MCH-0001 / GLM-1 / serial 5831536. Scope: simulated stock loading position, table support, lateral/forward route and registration against the represented backgauge rake. Clamp, knife and stock-removal behavior remain separate audit parts.

Evidence: installed BMJ photographs IMG_2488.jpeg and IMG_2489.jpeg, the photo-oriented POLAR template, and the existing evidence-bounded 115 EM-MON process definition. The photographs establish the single perforated side table, its backstop, the central dark table, cutting throat and general backgauge direction. They do not establish an installed stock format or exact programmed cut dimension.

## Findings and repairs

- The loading pile originally started at Z −0.34 m with 0.68 m depth, so its rear edge reached Z 0 and occupied the side-table backstop envelope. Moved the demo start center to Z −0.72 m. The pile now remains within the existing table length and has at least 155 mm transformed-plan clearance from that stop while it first translates sideways; forward travel begins only after that lateral move completes.
- The 85 mm demo pile originally rested with its bottom at Y .9625 m, 22.5 mm above the main table. Set its resting bottom to Y .941 m: 1 mm above the represented main table top (.940 m). Split pieces reuse the same support plane.
- The prior air animation was signed ±6 mm, which could drive the corrected pile 5 mm into the table. Changed this to a unilateral 0–6 mm visual lift. This is an animation cue, not an assertion of measured air-cushion height.
- Backgauge motion previously stopped after 260 mm, leaving 77.5 mm between the rake front and the positioned stock rear edge. Changed the represented stroke to 337 mm, producing a controlled .5 mm visualization clearance. The simulation now exposes `registrationGap` and `backgaugeContact` instead of claiming registration solely from elapsed time.
- The material path guide now follows the corrected load point and is positioned 12 mm above the pile top. Original stock width, cut depth, machine dimensions, installed orientation and photographed hardware are unchanged.

## Validation and remaining boundary

24 focused POLAR, transport, contact, reset and fleet-smoke tests passed. The regression samples 580 motion frames, measures transformed material/table/stop surfaces, rejects any backstop intersection or downward air penetration, and verifies the .5 mm registration state before clamping.

The current clamp-contact flag remains timing-derived. After the corrected stock support plane, the represented pressure face stops 6.5 mm above the pile top at its nominal full stroke. That is recorded for the next **clamp and pressure contact** audit and must not be hidden by raising the pile again. Exact installed stock thickness, backgauge program position and air-cushion height remain evidence-blocked; no new conveyor, pusher, jogger or pneumatic routing was invented.
