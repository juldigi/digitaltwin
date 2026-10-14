# BMJ-MCH-0027 SCREEN CTF audit

2026-10-14; base main 05efd91b7140edda0767b8c7454dba91e273a4d8. Registry confirms SCREEN and CTF only, not exact model/serial. No dimensions, orientation, installed options or new hardware assigned. Family geometry is not engineering/as-built CAD.

Evidence: frontend/src/data/machine-registry.js, taxonomy-imagesetter.js, mechanical-profiles.js, reference-machines.js; docs/fleet-photo-workspace-audit-v354.md has zero identity-matched installed photos. Library searches for CTF SCREEN/imagesetter returned generated legacy models or no identified installation files; not treated as installed evidence. SCREEN Katana OEM URL https://www.screen.co.jp/ga_dtp/en/news/pdf/newsbox/vol9_pdf/newsbox_9_4.pdf could not be retrieved in this run. Prior repository family claims retained as references, not freshly verified installation facts.

| Functional section | Examined / measured | Outcome / boundary |
| --- | --- | --- |
| Media cassette and loading | Existing roll radius 0.21 m, initial rigid rectangle centered within its roll envelope | Removed misleading moving rigid rectangle from loading/exposure display. Flexible film wrap/loading route BLOCKED_EVIDENCE; no invented rollers or spline |
| Capstan, front slack, gravity tension, rear slack | Existing roles/axes, brake and encoder windows, nominal roller/sheet layout | Functional reference only. Exact wrap, nip pressure, surface speed ratio, installed roller placement and continuous web topology BLOCKED_EVIDENCE |
| Polygon drive and scanner | Polygon-at-speed before exposure; common family metadata stays unverified | No guessed rpm, wavelength, installed facet count or optics alignment. BLOCKED_EVIDENCE |
| Laser and modulation | Exposure requires media, tension, encoder and polygon permits | Interlock regression passes; no claim of laser beam triangle contact without installed optical layout |
| Cutter and punch boundary | Cutting follows exposure completion; home status and option flag inspected | Optional punch remains unverified and inactive. Cutter/anvil installed stroke/clearance BLOCKED_EVIDENCE |
| Output cassette / processor interface | Reference tray top 0.520 m; film half-thickness 0.007 m. Before: final bottom 0.553 m, 33 mm gap | Output centre lands at 0.527 m by phase 0.96 and remains supported. World bounds test: zero vertical gap and no X overhang. Tray/processor installation still BLOCKED_EVIDENCE |
| Housing, controls, taxonomy and inspection | Six-level refs, isolated highlight/ghost, descendant visibility | Shared enrichment materials isolated; showOnly retains descendants. Housing dimensions/model and service access remain family-only |

Second pass: checked output footprint, start/stop visibility, causal permits, specific-part highlighting/ghost and showOnly. The unsupported upstream rectangle remains hidden even while semantic media-present permits operate. This is an honest visualization boundary, not a completed flexible-film reconstruction. Runtime 3D visual inspection unavailable; Node geometry and tests are not substituted for visual proof.

Release status: RELEASE_PENDING. Batch report records validation; cursor stays 0027 until verified deployment. Unknowns above are retained per section.
