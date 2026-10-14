# BMJ-MCH-0029 Atlas Copco No.2 compressor audit

2026-10-14; base main 05efd91b7140edda0767b8c7454dba91e273a4d8. Atlas Copco brand/no.2 confirmed by registry; exact series, kW, drive, VSD, Full Feature/dryer/receiver and plant route are unverified. No hardware or pressure rating added.

Evidence: registry, taxonomy-compressors.js, mechanical-profiles.js, reference-machines.js, compressed-air-routes.js. Photo manifest has no identity-matched installed image. Library search found only unrelated general compressor literature, not identified No.2 installation evidence. OEM general process source reviewed: https://shopct.atlascopco.com/en-INT/products/1622314001/separator-oil (oil-injected family separation/lubrication explanation only; part compatibility is not assigned).

| Functional section | Audit result | Unknown / action |
| --- | --- | --- |
| Intake filter / inlet load-unload | Existing family roles and running flags | Actual filter/inlet location, valve travel, controls and measured intake pressure BLOCKED_EVIDENCE |
| Motor / coupling / airend | Existing rotor axes/rest transforms and family drive references retained | Exact coupling ratio, screw profiles/clearances/directions and drive arrangement BLOCKED_EVIDENCE; no geometry guessed |
| Separation vessel / minimum-pressure/check interface | Family separation logic and normalized pressure ordering checked | Installed vessel package, safety setpoints and oil carryover not inferred; BLOCKED_EVIDENCE |
| Oil circuit / cooling | Functional oil particles and cooler/fan roles checked | Actual hoses, thermal valve, cooling type, fan clearance and pipe contact BLOCKED_EVIDENCE |
| Aftercooler / condensate / discharge | Package versus plant flow classification | External air tails and receiver-drain particles attached to diagram group; they no longer float as installed machinery in normal view. Installed discharge/drain route BLOCKED_EVIDENCE |
| Receiver / treatment / distribution | Toggle previously revealed unverified network in normal mode; particles lived outside hidden group | Diagram toggle now requires interior; preference survives both LOD/interior orders. Distribution particles follow diagram parent. Effective-visible counts honor ancestors. Receiver/dryer/ring remain unverified functional references |
| Cabinet / mounting / controls / taxonomy | Exterior boundary and scoped inspection checked | Enrichment materials isolated; descendants preserved by showOnly. Exact cabinet/support/service clearance BLOCKED_EVIDENCE |

Second pass: tested normal → path toggle, interior → path off → LOD → normal → interior, path reenable, and ancestor visibility. Shared fix regressed all seven compressor assets, without selecting new machines for full audit. Pressure percentages remain normalized demo losses, not BMJ measurements. Flow diagrams do not prove pipe connectivity or real fluid dynamics. Visual 3D unavailable; not replaced by HTTP/tests.

Release status: RELEASE_PENDING. Batch cursor remains 0027 until verified implementation. Missing installed evidence remains recorded rather than filled with generic CAD.
