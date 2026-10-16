# UX journey: factory → machine → next action

Base: d824b82c7544931f41ef054e1db1cc42e9b7656f. All three base release workflows passed.

## Product problem
The factory opened without a visible starting action. The catalogue started with production machines only, so an AHU search silently excluded utilities unless the user understood the category boundary. The selected-machine panel placed the main action after technical data and could promise opening a model on a device where that action was unavailable. Empty search results offered advice but no direct recovery.

## Implemented journey
1. A visible “Pilih mesin” action opens the existing catalogue from the factory heading. It hides in machine view and returns in factory view. Desktop and mobile use the same canonical action.
2. The catalogue starts with all production machines and utilities. Optional filters are named Semua / Mesin produksi / Utilitas. Pressed state is exposed as a button group. Component search remains scoped to the active machine.
3. Search failure offers “Tampilkan semua mesin”, which resets query, area and category together, then returns focus to search.
4. Selecting a machine preserves factory-first identity and location context. Its next action is placed before technical data, alongside “Pilih mesin lain”. The available-model path opens the existing machine route; the unavailable-render path honestly offers location and explains the device limitation.

5. Simulation entry uses a purpose-specific title, instruction and “Buka simulasi” action; ordinary browsing retains “Lihat detail”.

## Validation
88 initial focused tests passed; 60 chooser/context/language tests passed after the intent-copy adjustment, including executed chooser behavior for cross-category utility discovery and complete empty-state recovery. Build passed. The first full regression found an outdated literal category-label assertion. Updated only its labels and added the all-assets category assertion; scoped taxonomy, selection and utility boundary assertions remain. Complete regression and production checks remain pending the protected release pipeline.

## Scope and limits
No geometry, simulation engine, dimensions, machine identity or evidence was changed. This addresses the starting/discovery/selection/recovery journey. A formal usability study with novice operators and physical iPhone validation remain outstanding; this is not a claim of perfect UX.

## Production pass and cancellation follow-up
Release ffccef2d85c21b1559d90aa6692510fb9e4aba6f passed CI 38846754172, frontend 38846753917 and Cloudflare 38846754076. Production fingerprint ce8a7e0e37cdadd2 was observed. Actual browser checks: factory entry opens all 41 assets; AHU search finds 6 utilities without category changes; empty-state recovery restores 41 results and search focus; OFU-1 selects BMJ-MCH-0003; primary actions appear before technical information; changing machine opens the catalogue; factory navigation clears the selected route. Screenshots confirmed the entry action and readable selected-machine panel.

A second pass found cancelling the change-machine picker hid the prior detail. The chooser now restores that detail on close only when selection is uncommitted and the same asset remains selected in factory context. It cannot overwrite a newer selection. 68 chooser/context/language tests and build pass after this fix; final release gates and cancellation round-trip remain pending. Physical phone and novice-user validation remain outstanding.
