# Offset 5 vacuum table correction

Scope: feed-board / central vacuum tape / register interface only. Evidence: IMG_1626 and Offset5.zip IMG_2468 / IMG_2470. Locked machine dimensions, feeder origin, PU1 origin and all downstream modules remain unchanged.

## Implemented

- Share the photo-derived 420 mm rise across the existing 1.40 m table between geometry and simulation. The central tape top is 1.334 m at the downstream edge; the sheet curve follows it with 2 mm visual clearance. The receiving throat stays attached to the same PU1 face, with the sheet above its deck.
- Keep two tape support rollers rigid and circular in world space. Independent carriers cancel the table's longitudinal stretch; the photo ramp raises their centres without shearing cylinder vertices. Their centre-to-tape normal distance accounts for the inclined tangent.
- Retain the two roller meshes through batching and rotate them as explicit tape support references. Their rate follows the illustrative sheet transport speed. Other service cylinders and gauge faces are not transport rotors.
- Replace 22 protruding glass pins with through-hole geometry in the central tape. Hole pattern and dimensions remain an approximation; they are not a verified installed specification. Teal-grey rubber follows the photo's central strip appearance.
- Remove three legacy board strips and the extra side-belt / pressure-roller proxy arrangement absent from the supplied photos. The central tape remains the transport reference.
- Remove two legacy front-lay fingers and the additional four / eight stop-finger proxy sets. Retain the manual family reference of fifteen front lays, explicitly mark installed count unverified, and preserve the supporting shaft / side-lay function.
- Keep one functional detector bridge, removing the extra crossbar and twelve assumed feelers. The manual option range remains metadata, not an installed count.
- Move three gauges from the low end-face to the upper drive-side fascia, with horizontally arranged faces. Keep gauge faces circular under the table scale.
- Clarify taxonomy descriptions for tape perforations, vacuum chambers, sensor / lay counts and infeed phase.

## Verification and limits

Tests raycast actual tape triangles under sampled sheet-curve points, check that a perforation is empty and intervening belt is solid, verify circular roller radii over multiple simulated rotations, and verify stop restores the roller pose. Existing photo, feeder, manual-research, geometry, taxonomy and full process checks also run.

The table rise, roller diameter, hole pattern and transport phasing remain visual references. Actual chamber segmentation, vacuum pressure, installed sensor / lay arrangement and gripper timing require installed evidence. The tape's physical holes remain a static surface representation; support rollers rotate, but a moving endless perforation loop is not asserted. Exact sheet gripping by each infeed finger is not claimed.
