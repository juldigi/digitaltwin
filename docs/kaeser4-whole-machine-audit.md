# BMJ-MCH-0031 KAESER No.4 audit

Closure: COMPLETE (audit processed with BLOCKED_EVIDENCE retained). Implementation 08f2df9612e21315d17f23945b0e425edd1e3b7f passed 1617 tests/build and all three workflow gates; production module/chunk hashes match. See batch30-release.md for workflow/hash evidence. This supersedes RELEASE_PENDING below; installed configuration and visual3D remain unverified.

2026-10-14; base main 04927784da4b3b7a985f6e19a69c4c7c0f78a8cc, previous ledger gates SUCCESS. No.4 retains its own asset/brand/taxonomy and orientation; not assumed identical to No.6 or No.8.

Evidence: registry, taxonomy-compressors.js, reference-machines.js and photo manifest (zero identity-matched installed images). Library utility-asset-registry-v3.js read, exactModelVerified=false/asBuilt=false; its named facade variant is a reference, not a photo/manual. Fresh OEM sources reviewed: https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/ and https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-1-to-1-direct-drive/. These distinguish belt and 1:1 direct families; no drive choice or controller generation assigned to No.4.

| Functional section | Findings / corrections | BLOCKED_EVIDENCE |
| --- | --- | --- |
| Intake / inlet-vent valve | Handoff continuity fixed at .12 without adding intake hardware | Actual filter, silencer and pneumatic valve/control arrangement |
| Motor / SIGMA airend / transmission | Axes/rest states and six-level refs checked; tool-specific actual profiles not invented | Belt versus 1:1 direct, gearing, rotor lobe profiles/support/alignment. Existing schematic cylinders nominally overlap 13 mm and are not engineering clearance proof |
| Cooling-fluid separator / MPV-check | Air phase .28/.45 endpoint discontinuities removed; pressure losses remain normalized | Separator construction/cartridge stages, valve setpoints and safety/control interlocks |
| Fluid filter / thermostat / cooler | Phase .50 oil jump 100 mm → below 0.01 mm continuity error | Actual ETM installation, bypass topology, fluid temperatures and valve action |
| Aftercooler / centrifugal separator / drain | Reference flow handoffs/receiver-parent behavior checked | Installed cooler/fan clearance, ECO-DRAIN variant, drain/discharge plumbing |
| Ring / service takeoff / treatment | Removed ±70 mm distribution offsets and diagonal shortcuts; markers follow existing pipe centreline triangles with >1 mm radial clearance; ring parent follows explode | Receiver/dryer/filter package and missing upstream links not inferred. Phase <.32 distribution hidden rather than adding unproved piping |
| Cabinet / mounting / SIGMA CONTROL / navigation | Replaced covers persisted hidden: 7 reappearing covers → 0; mode/lifecycle/scoped-inspection checks pass | Exact model, cabinet/service clearances, mounts, control generation and power ratings |

Second pass separately instantiates No.4, samples fluid discontinuities, triangle support and mode sequences; shared fix also regressed compressor siblings. Installed clearances, pressure/thermal behavior and real control safety remain unknown. Preserve verified custom dimensions; none altered. Visual 3D unavailable, no HTTP/unit-test substitution.

Additional second-pass mounting defect: all nine top grille bars floated 26.5 mm above the existing cabinet panel. Bar centre Y 1.6600 → 1.6335 m, unchanged bar dimensions; each lower face now meets an actual top-panel triangle within 1 µm numerical tolerance. Cabinet dimensions and installed configuration were not changed. Rebuilt fleet geometry and repeated final-source full regression because this defect was found after the first full test run.

Status RELEASE_PENDING; cursor remains 0030 until batch implementation verified.
