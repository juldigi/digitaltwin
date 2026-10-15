// Interior cutaways are an explicit inspection action for guarded machines.
// Keep Offset 5 PU covers and POLAR knife housing as-is when starting a run.
// The process simulation may still animate internal parts behind their guards.
export function shouldAutoOpenInteriorForSimulation(machineKey,interiorAlreadyOpen=false){
 if(interiorAlreadyOpen)return false;
 return machineKey!=='offset5'&&machineKey!=='BMJ-MCH-0001';
}
