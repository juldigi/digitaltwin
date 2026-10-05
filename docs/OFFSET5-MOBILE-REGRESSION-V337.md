# Offset 5 mobile mechanism visibility — V337

## Reproduction and cause

The app starts constrained/mobile renderers in low detail. Simulation opens the
interior while retaining that quality profile. Offset 5's base `setLow()` hid
every mesh marked `detail`, including the actual printing cylinders and all
192 rollers grounded in the installed IMG_2777 diagram. With low detail and
interior open, only 28 of 264 simulation rotors were visible; 236 were hidden.
The sheet trajectory continued to use those invisible process mechanisms.

Earlier lifecycle and geometry audits checked valid dimensions, finite poses,
reset behavior, and motion. They did not require all process rotors to remain
effectively visible through their ancestor chain in the mobile cutaway.

## Correction

Keep the diagram-grounded rollers, four main process-cylinder bodies per PU,
gripper controls, and delivery-drive sprockets visible in low detail. Continue
removing optional microdetail, and preserve the existing cutaway cover policy.
This also retains the installed roller arrangement in the normal open-upper-deck
view. No dimensions, positions, rotor counts, motion rates, or sheet paths change.

The new regression verifies all 264 process rotors through their ancestor chain
before/during/after simulation and a detail round-trip, while checking that
cutaway covers and optional detail remain hidden. A second test requires all
192 installed-diagram rollers in normal low-detail view. Eight focused checks
passed, including the Offset 5 truth lock and 41-asset quality round-trip.

This reproduces a specific visibility fault; mobile Safari visual confirmation
and confirmation against the user's previously accepted appearance are still
needed before describing the whole appearance as perfect.
