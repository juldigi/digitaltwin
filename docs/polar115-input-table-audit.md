# POLAR 115 EM-MON — input table audit

Asset BMJ-MCH-0001 / GLM-1 / serial 5831536. Scope: input cutting deck, plain side extension, single perforated side table, grid, legs and taxonomy. Subsequent transport/backgauge and cutting contacts are separate audit parts.

Evidence: current Library IMG_2488.jpeg (libfile_74818f19f88c8191992c1c365a762bdd), visually inspected original front view; IMG_2489.jpeg (libfile_ed97b8542fa881919c02617868a363f3) resolved oblique view; repository photo registry and existing photo-oriented template. Front photo shows one white perforated table on slender grounded legs and opposite dark extension. Original dimensions and mirrored photo frame retained; dimensions are reference, not surveyed installation data.

## Findings and repairs
- Nozzle cylinders previously centered at Y .964 with radius .009 and height .006; side deck top .930. Lowest port surface .961 left a 31 mm unsupported gap. Changed center to .931: base .928 intersects deck 2 mm, top .934 projects 4 mm. This is a visual air-port reference, not measured installed nozzle protrusion or a new pneumatic assembly.
- Grid was centered at local X 0 inside side group, while deck center is X .11. Added explicit center parameter .11: grid and deck now share world X center after photo reflection, with all 88 port bounding surfaces contained inside the existing deck footprint.
- Taxonomy incorrectly called the dark extension a perforated air-float table. Updated side descriptions and verifiedFeatures to match sole perforated table; family/archive listings remain explicitly separate sources.
- Tube legs and floor pads share their existing coordinates and remain grounded. No guessed feed conveyor, jogger or pallet loader added.
- Deck remains visible in normal/interior and low/full detail; no input cover is removed during cutaway. No fixed asset dimensions, orientation or installed table outline changed.

## Validation and boundaries
22 targeted POLAR/contact/fleet-reset tests passed. Regression measures transformed port surfaces, footprint and grid centering; retains live table across display modes and checks photo-consistent labels. Build and full Cloudflare release gate required before part completion.

Loading pile is a demo reference: its original width 1.08 m exceeds .88 m side deck width, initial center .76 straddles the table junction, and bottom .9625 sits 22.5 mm above main .94 surface (32.5 mm above side .93). Do not certify loading transport or air float as realistic. These contact defects must be addressed together with path/backgauge/clamp causality in the next transport/registration part; simply lowering pile now would invalidate clamp contact and cutting relationships. No measured installed stock format, nozzle layout or pneumatic routing is available from the photo. Report those exact installed values as evidence blockers, rather than deriving them from perspective.
