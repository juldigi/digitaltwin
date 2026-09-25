// DigitalTwin BMJ — cross-session JS merge ledger
// Generated 2026-09-25 against main@443ee110691fc2eea8835e8abd45ff8fce8e7de5.
// This manifest records source ownership. Runtime activation must reconcile against
// the current app ESM contracts and must never stack duplicate machine/building geometry.
export const CROSS_SESSION_MERGE_20260925 = Object.freeze({
  baselineCommit: '443ee110691fc2eea8835e8abd45ff8fce8e7de5',
  sourcePolicy: 'LATEST_SESSION_SOURCE_PRESERVED__NO_BLIND_RUNTIME_OVERRIDE',
  packages: Object.freeze({
    convertingV11: Object.freeze({ path: './converting-v11', files: 11, status: 'STAGED_FOR_RECONCILIATION', supersedes: ['comparative-v9','research-v5'] }),
    offsetFinal: Object.freeze({ path: './offset-final', files: 5, status: 'STAGED_FOR_RECONCILIATION' }),
    offsetRealismR2: Object.freeze({ path: './offset-realism-r2', files: 5, status: 'STAGED_REFINERS', rule: '5/8/9/10 enrich existing nodes; 7 standalone dedicated reconstruction' }),
    furnitureV3: Object.freeze({ path: './furniture-v3', files: 6, status: 'STAGED_WITH_REQUIRED_V2_DEPENDENCIES' }),
    utilityBuildingV4: Object.freeze({ path: './utility-building-v4', files: 55, status: 'STAGED_COMPLETE_PACKAGE', rule: 'replace one ownership block at a time; never stack old/new geometry' })
  }),
  retainedCurrentCore: Object.freeze({
    sheeting: 'frontend/src/sheeting.js V197 remains authoritative; no newer compatible standalone JS package exists',
    appState: 'frontend/src/state/app-state.js and current Stage-6 SSOT remain authoritative',
    machineRuntime: 'frontend/src/machine-runtime.js remains authoritative until per-module API reconciliation',
    factoryBuilding: 'frontend/src/factory-building.js remains active until V4 ownership migration is validated'
  })
});
export default CROSS_SESSION_MERGE_20260925;