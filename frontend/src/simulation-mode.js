const MODE_IDS=Object.freeze(['continuous','stages','training']);

const trainingLabel=machine=>{
 const area=String(machine?.area||'').toUpperCase(),name=String(machine?.name||'').toUpperCase();
 if(area==='UTILITY')return 'Pelatihan aliran utilitas';
 if(area.includes('PDS')||name.includes('CTP')||name.includes('CTF')||name.includes('ZUND'))return 'Pelatihan alur prepress';
 if(name.includes('INSPECTION')||name.includes('INSPEC'))return 'Pelatihan alur inspeksi';
 if(name.includes('OFFSET')||area.includes('PRINTING'))return 'Pelatihan alur cetak';
 if(area.includes('CONVERTING'))return 'Pelatihan alur converting';
 return 'Pelatihan alur proses';
};

export function simulationModeOptions(machine=null){
 return Object.freeze([
  Object.freeze({id:'continuous',label:'Proses penuh · berjalan terus'}),
  Object.freeze({id:'stages',label:'Tahap demi tahap · berhenti tiap tahap'}),
  Object.freeze({id:'training',label:trainingLabel(machine)+' · 0,5× + berhenti tiap tahap'})
 ]);
}

export function simulationModePreset(mode){
 const id=MODE_IDS.includes(mode)?mode:'continuous';
 return Object.freeze({
  id,
  pauseAtStage:id==='stages'||id==='training',
  lockSpeed:id==='training'?0.5:null,
  forcePathVisible:id==='training'
 });
}

// One controller per renderer; stages come from the active machine simulation.
export class SimulationModeController {
 constructor(){this.mode='continuous';this.stage=null;}
 setMode(mode,state){this.mode=MODE_IDS.includes(mode)?mode:'continuous';this.stage=state?.stage||null;return this.mode;}
 reset(){this.stage=null;}
 observe(simulation){
  if(!simulationModePreset(this.mode).pauseAtStage)return false;
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
