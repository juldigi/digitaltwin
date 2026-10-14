# BMJ-MCH-0032 KAESER No.6 audit

2026-10-14; base main 04927784da4b3b7a985f6e19a69c4c7c0f78a8cc, closure gates SUCCESS. No.6 audited as a separate registry asset, not declared the same installation as No.4/No.8.

Evidence: registry row 0032, taxonomy and family model source, photo manifest (zero identified installed photos). Library utility registry read: exactModelVerified=false/asBuilt=false; TALL_SERVICE_CABINET variant does not verify installed geometry. OEM belt/direct-drive sources reviewed as family-only: https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/ and https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-1-to-1-direct-drive/.

| Section | Audit / correction | Remaining unknown |
| --- | --- | --- |
| Intake and vent/load-unload | Reference air endpoints continuous at .12; no filter/valve added | Actual intake hardware/valve action and thresholds BLOCKED_EVIDENCE |
| Motor and SIGMA airend | Axes, rates as illustrative references, rest transforms and detailed taxonomy checked | Exact drive, actual ratios/phasing, shaft supports and screw profiles BLOCKED_EVIDENCE. Nominal 13 mm overlap of cylindrical screw proxies is not an engineered mesh and was not arbitrarily changed |
| Fluid separator and minimum-pressure/check | .28/.45 air handoffs continuous; normalized pressure profile retained | Tank/cartridge stages, scavenge/pressure/safety details BLOCKED_EVIDENCE |
| Fluid circuit and thermal cooling | .50 Z jump 100 mm → below 0.01 mm numerical error; loop endpoints match | Actual thermostat/ETM, hoses/nozzles, thermal states and fluid flow BLOCKED_EVIDENCE |
| Air cooling, condensate and discharge | .58/.70 handoffs and receiver-parent classification checked | Actual fan sweep, cooler/discharge/drain mount and route BLOCKED_EVIDENCE |
| Distribution ring / treatment boundaries | Particles follow existing pipe segments, not ring/drop diagonals; ±70 mm off-centre lanes removed; triangle clearance >1 mm; follows ring explode | Installed receiver/dryer/ring diameters and missing connector geometry BLOCKED_EVIDENCE; unsupported pre-ring segment hidden, no new pipes |
| Cabinet, mounting, control and inspection | Seven retired covers no longer revive after normal/LOD toggles; modes/lifecycle/taxonomy/explode inspected independently | Installed cabinet/services/support/controller/power data BLOCKED_EVIDENCE |

Second pass includes No.6-specific construction, continuous-flow sampling and actual pipe triangle checks. Normal view excludes distribution reference; interior diagrams remain expressly not as-built. Factory bake updated for retired covers while identity/orientation and authored component dimensions are unchanged. Visual 3D proof remains unavailable.

Additional second-pass mounting defect: all nine top grille bars floated 26.5 mm above the existing cabinet panel. Bar centre Y 1.6600 → 1.6335 m, unchanged bar dimensions; each lower face now meets an actual top-panel triangle within 1 µm numerical tolerance. Cabinet dimensions and installed configuration were not changed. Rebuilt fleet geometry and repeated final-source full regression because this defect was found after the first full test run.

Status RELEASE_PENDING. Do not move cursor until full tests, release gates and production verified.
