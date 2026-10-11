# Offset 5 coating contact correction

The final custom module position, length, exterior and machine footprint remain unchanged. Three existing functional rollers are retained; no duplicate process train is added. Installed internal geometry and gripper timing are not asserted as OEM service data.

## Changes

Each roller has a separate rigid carrier that cancels the coater longitudinal scale before the roller rotates. This fixes the prior non-uniform scaling interaction that made a round static cylinder elliptical in motion. A shared section definition supplies geometry, journal supports, anilox drive centers and sheet constraints.

Visual clearances are 4 mm between coating and impression, 1 mm between anilox and coating, and 1 mm at the doctor blade. These are demonstration geometry constraints, not measured machine pressure settings. The blade and chamber holder are connected along the anilox contact plane. Existing blade hardware follows the revised section. The drain ends at the catch tray reference.

The catch tray is an individually selectable node, between the lower frame top (0.70 m) and impression bottom (0.775 m). Its bottom is 0.715 m and top 0.755 m; it no longer intersects either object. Coating, impression, anilox, doctor blade and catch tray have individual taxonomy mappings. The former motion label transfer-cylinder is replaced by coating-cylinder; the access plinth is no longer called a lower step.

The sheet curve constrains its centerline against actual coating and impression circles. Tests also raycast against moving roller triangles rather than relying only on nominal static circles.

## Evidence limit

IMG_1629, IMG_2391(1) and IMG_2392 establish exterior and access features. They do not establish the installed chamber section or complete PU8/coater handoff. The reconstruction does not invent a coating gripper or bridge the missing actual transfer train. Metadata explicitly marks the installed transfer and gripper as unverified.

## Validation

New runtime tests check roller roundness over 40 moving frames, sheet clearance against actual moving triangles, blade contact, tray/frame clearance and individual taxonomy mappings. Existing process, mobile and PU regressions remain required release checks. Rendering on the user's device is not certified by these geometry checks.
