# BMJ-MCH-0010 · APM-2 BOBST SP 102 whole-machine audit

## Scope and evidence boundary

This audit follows the installed asset from pile input to delivery and then checks drive, control, guards, simulation lifecycle, interior/LOD composition and six-level taxonomy. BMJ records verify **APM-2**, **SP 102**, serial **57115506**, functional location **PC-PK2-CON-AUT-AUTOPLAT02**, and year **1994**. The repository contains no installed-machine photograph for this asset. Published SP 102 E/SE material is therefore used only as family/process evidence. The installed suffix and exact stripping/non-stop equipment remain unconfirmed.

## Ordered audit

| Functional section | Evidence and measured result | Finding / action | Status |
|---|---|---|---|
| Pile table, lift, separation head and feed belts | Family reference; pile top `y=1.360 m`, lift-cup bottom `y=1.448 m`, former maximum pickup descent `50 mm` | The cup stopped about `37.5 mm` above the pile. Increased the time-scaled demo stroke to `90 mm`, bringing the cup to the represented top sheet without changing the verified sheet envelope. Feed belts remain aligned at `y=1.431–1.449 m`. | COMPLETE |
| Register table, front lays and SideLay | Family process evidence plus BMJ Q2 SideLay history; table top `y=1.541 m`, shared sheet plane `y=1.535 m` | Alignment is within the modeled sheet thickness tolerance. Registration and SideLay act only while the chain is stopped. No additional hardware added. | NO_CHANGE_REQUIRED |
| Twin-chain gripper transport | SP 102 family chain-set and patent references; 14 unique bars, two rails, one pitch per cycle | Bars remain on both chain runs and freeze during process dwell. Count remains explicitly family-reference, not serial-specific. | NO_CHANGE_REQUIRED |
| Platen cutting/creasing | Family process evidence; tool face formerly traveled from `y=1.537 m` to `1.622 m` while animated sheet is at `y=1.550 m` | Removed `72 mm` of visible overtravel. Stroke is now `13 mm`, closing the reconstructed tool face to the animated sheet plane without passing through it. Toggle links remain phase-coupled. | COMPLETE |
| Stripping reference | SP 102 family reference only; installed APM-2 suffix/tooling not evidenced | Upper pins formerly intersected the board at rest. Raised the family-reference upper frame and board so pins clear at rest and approach the shared sheet plane only during stopped dwell. Configuration remains `strippingConfigurationVerified=false`. | COMPLETE / BLOCKED_EVIDENCE |
| Delivery release, pile table and output | Family process evidence; table top `y=0.520 m`, static pile top `y=1.140 m` | Dynamic output sheets are deposited on the computed table/pile surface and reset cleanly; no unsupported delivery hardware inferred. | NO_CHANGE_REQUIRED |
| Drive, controls, guards and service access | Family visual/parts references; installed control revision is not photographed | Rotor role list excludes static tooling and suction stems. Guard/exterior opening remains independent of process state. Exact installed cabinet contents and safety-device locations remain unknown. | BLOCKED_EVIDENCE |
| Navigation, interior, LOD and inspection | Runtime behavior and taxonomy | Fixed `showOnly`: a selected assembly now preserves both its ancestors and complete descendant subtree. Made interior and LOD visibility compose in either toggle order; reset preserves both selected modes. | COMPLETE |
| Start / pause / resume / stop / reset | Runtime state and deterministic tests | No time jump after pause/resume; stop restores mechanisms, static pile and gripper positions; process interlocks prevent platen/stripping work during indexing. | NO_CHANGE_REQUIRED |

## Pass-two findings

The second pass rechecked transformed bounding surfaces, transport dwell, output accumulation, mode toggle order and taxonomy resolution. It found the navigation subtree defect and the interior/LOD order dependency after the initial contact corrections; both were fixed and covered by regression tests. Materials are scoped per owning group, so highlight and ghost changes do not leak to unrelated assemblies.

## Remaining evidence blockers

- No installed APM-2 photo set is registered (`APM2_PHOTO_REGISTRY` is empty).
- The SP 102 suffix and installed stripping/non-stop configuration are unknown.
- Operator-side convention, internal electrical layout, utility routing and exact guard/interlock placement are reconstruction/reference only.
- Family speed, force, envelope, weight and 14-bar count must not be read as serial-specific acceptance dimensions.

## Validation

Focused tests cover identity, contact, clearance, one-pitch indexing, stopped process dwell, output/reset, lifecycle, navigation subtree, interior/LOD order and fail-closed autoplaten truth locks. Full repository tests and production build are release gates; workflow and production URL evidence are recorded in `docs/fleet-audit-progress.json` after deployment.
