# V336 — quality and interior visibility

Continuation of [the V335 fleet review](FLEET-REVIEW-V335-20261004.md).

## Reproduced faults

Across all 41 asset templates, opening the interior, switching low detail on,
and switching it off changed mesh visibility in 20 assets. The affected assets
were BMJ-MCH-0002, 0003, 0004, 0005, 0009, 0021, 0023, 0028, 0029–0039,
and 0041. Offset 5 restored 30 mesh visibility flags incorrectly; Offset 8
restored 236. Detail setters and cover setters independently overwrote the
same visibility flags.

A second sequence—open interior, enable low detail, close interior, restore
full detail—left 10 Diana Eye 55 meshes and six Shark N650 meshes hidden.
Their low-detail restore snapshots retained the earlier cutaway state.

## Correction

The shared presentation adapter composes each template's existing cover and
detail methods. After a detail change it reapplies the current cover state;
in low detail it retains the meshes hidden by the original detail method.
Cover changes likewise reapply low detail. A reentrancy guard supports models
whose existing detail method itself calls the cover method.

This retains model-specific rules for silhouette-critical geometry, permanent
hidden parts, process mechanisms, and mounted service details. It changes no
dimensions, roller counts, material assignments, installed configuration,
simulation speed, or source confidence. Offset 5 retains the BMJ custom
dimension and photo reconstruction contract.

## Verification

- All 41 templates return to their exact prior mesh visibility after an
  open-interior quality round-trip.
- All 41 return to their closed full-detail visibility after closing the
  interior while in low detail and then restoring full detail.
- All 41 produce the same low-detail interior visibility regardless of
  whether quality or cover mode is switched first.
- Focused fleet, browser-material lifecycle, quality and simulation-mode
  checks: 25 tests passed.

The regression test exercises actual templates rather than reproducing their
visibility implementation. Full release verification is required before merge.

## Evidence scope

This update fixes runtime visibility composition. Physical-source findings,
installed-model uncertainties, and primary-source links remain in the V335
review. It does not certify serial-specific physical accuracy. Mobile Safari
3D rendering has not been directly verified in this environment.
