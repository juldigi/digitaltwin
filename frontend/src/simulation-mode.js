// One controller per renderer; stages come from the active machine simulation.
export class SimulationModeController {
 constructor(){this.mode='continuous';this.stage=null;}
 setMode(mode,state){this.mode=mode==='stages'?'stages':'continuous';this.stage=state?.stage||null;return this.mode;}
 reset(){this.stage=null;}
 observe(simulation){
  if(this.mode!=='stages')return false;
  const state=simulation?.state?.();
  if(!state?.running)return false;
  const stage=state.stage||null;
  if(this.stage===null){this.stage=stage;return false;}
  if(!stage||stage===this.stage)return false;
  this.stage=stage;
  simulation.pause();
  return true;
 }
}
