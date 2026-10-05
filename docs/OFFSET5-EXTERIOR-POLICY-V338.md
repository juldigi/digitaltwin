# V338 — interior references are inspection geometry

The user clarified that the supplied PU interior photo and roller diagram are
references for mechanisms inside the press, not an exterior presentation with
all internals exposed. V337 incorrectly required all diagram rollers to be
visible in the normal mobile view. The app also opened all covers automatically
when starting a simulation.

Offset 5 now defaults to its exterior. The 192 diagram-grounded rollers, PU main
cylinder bodies and internal gripper controls are shown only when the interior
is explicitly opened. The exterior green duct/service roller, open upper deck,
rounded operator cabinet, platforms and BMJ custom dimensions remain intact.
The same classification applies to initial creation, reset, quality changes,
and opening/closing the interior.

Starting Offset 5 simulation preserves the selected exterior/interior mode.
Internal ink-flow visualization follows that mode; the transport's cover toggle
changes the internal-flow visibility together with the cover state. Other
machines retain their existing start behavior.

When inspection is requested, mobile low detail still retains all 264 process
rotors. Corrected regression checks require 192 internal rollers hidden in
normal mode and visible in inspection mode. Tests execute the actual app start
handler for both modes and reject any automatic cover opening. All 29 focused
geometry, mobile, start-handler and fleet quality checks passed.

The prior V337 claim that the normal view should expose all installed rollers
is superseded. No dimensions, roller topology, colors, motion rates or sheet
paths are changed. Browser WebGL is unavailable in this environment; Safari
appearance must be confirmed separately.
