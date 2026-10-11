# PU1 and PU2 visual contact correction

Scope: primary cylinder contact geometry in PU1/PU2, bearing centers, impression gripper motion, and the existing PU1-to-PU2 transfer reference. The final custom footprint, unit centers, exterior covers and unit pitch are unchanged.

The shared section definition keeps plate and impression anchors fixed and solves blanket position from two circle-distance constraints. Visual gaps are 2 mm plate/blanket, 4 mm blanket/impression, and 2 mm impression/internal-transfer. These gaps admit a demonstration sheet; they are not measured pressure settings or OEM dimensions. PU3 onward retain their earlier cylinder positions.

The sheet curve uses actual section radii and constrains its centerline out of the impression and blanket bodies. The existing inter-unit drum uses its actual model axis (y=0.70) and radius (0.235); the sheet reference arc has 2 mm radial clearance. Impression gripper assemblies in the audited units orbit their impression axes as rigid assemblies, rather than translating horizontally. Opening dwell, registration and synchronization with a particular sheet remain explanatory, not reconstructed cam timing.

Bearing caps use cylinder coordinates. Bearing rails in the audited units follow the updated heights. Disconnected shaft and spring proxies in the first transfer bay, and unsupported gear discs in the audited units, stay hidden through low-detail, interior and reset transitions. No new process hardware is invented.

## Remaining evidence gap

IMG_2777 establishes primary plate/blanket/impression topology but does not establish the installed inter-unit transfer train. IMG_0947 and IMG_1165 depict the infeed/access area and do not prove the PU1-to-PU2 configuration. The single existing reference drum does not bridge the distance between the two impression cylinders. Metadata explicitly marks the missing handoff topology as unverified; this change does not claim a completed mechanical reconstruction. A confirmed inter-unit section or directly identifiable photographs are required to settle drum count, shaft centers, gripper fingers and cam timing.

## Validation

Runtime tests check primary cylinder gaps, concentric bearing caps, moving impression-gripper centers, mode/reset visibility, and dense sheet centerline clearance. These checks validate model geometry and motion, not OEM service accuracy or a WebGL visual inspection.
