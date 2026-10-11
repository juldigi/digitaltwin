# Offset 5 — UV dryer and inspection contact corrections

The photo audit identified five sheet/roller penetrations (30–36 mm), a floating final support, both camera axes blocked by lighting, disconnected camera cables, and dryer hood/upright interference. Photos IMG_1633 and Offset5.zip/IMG_2473 establish exterior silhouettes and the two camera housings; they do not establish UV cassette count, lamp technology, cooling topology, optical calibration, or installed transport hardware.

## Corrected visual geometry

- All six existing support rollers have a 35 mm radius and axis Y=1.254 m. The sheet reference bed is Y=1.290 m, giving 1 mm nominal clearance. The delivery rise begins beyond the last support and uses a smooth transition.
- Each roller has a carrier that cancels the dryer parent X stretch before rotation. Surface speed follows the sheet reference, with stop/reset restoring its rest quaternion.
- Lighting moves downstream to local X=0.26 m. Side arms attach to the crossbeam outside the optical paths; a downstream mounting rail connects both lights. Actual ray intersections verify both camera axes clear lighting, mounts, cable routing and calibration references.
- Camera cables reach the existing enclosure; a support connects the enclosure to the access deck. The hood terminates upstream of both bridge uprights. Upright feet meet the existing cabinet top.
- UV illumination is a steady sheet-occupancy cue, without artificial power oscillation. This does not simulate curing dose or actual lamp switching control.
- Named cassette/optics groups and separate lighting A/B groups support more precise component selection. Reflector/window, cooling and monitoring parts have component mappings.

## Evidence limits

The installed module footprint, custom unit pitch and centers are preserved. Cooling fans/plenum, transport hardware, enclosure mounting, encoder and target remain functional references; their installed configuration is not established. No claim of calibrated optics, curing performance or real inspection/defect detection is made.

## Verification

Regression tests raycast actual moving roller triangles against the sheet centerline, verify circular geometry through 24 motion frames, check unobstructed optical axes, hood/upright clearance, cable/enclosure contact and component mappings. Browser WebGL was unavailable in this environment, so these checks do not certify rendered appearance on user devices.
