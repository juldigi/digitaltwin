/*
 * BMJ Digital Twin v11 Ultra Detail
 * APM-6 — AUTOPLATEN 6 STAMPING — MK 920 YMI-II
 * Machine-local geometry/state/animation; do not replace with a shared generic machine.
 * SOURCE: https://www.masterworkgroup.com/about-us/competitiveness/
 * SOURCE: https://www.masterworkgroup.com/spare-parts-and-consumables/
 */
(function(global){
'use strict';
const MACHINE_ID="APM-6";
const SPEC={
  "maxSheetClassMM": 920,
  "process": "hot foil stamping / hologram transfer family",
  "identityNote": "YMI-II suffix retained from BMJ database"
};
const ENVELOPE_M=[8.85, 3.85, 2.9];
const STATIONS=[
  {
    "id": "feeder",
    "label": "Feeder",
    "x": 0,
    "height": 1.58,
    "components": [
      "pile lift",
      "suction head",
      "sheet separator",
      "front guide",
      "side guide"
    ]
  },
  {
    "id": "register",
    "label": "Register/feed table",
    "x": 1.5,
    "height": 1.3,
    "components": [
      "feed belts",
      "roller bank",
      "brush wheels",
      "sheet travel sensor"
    ]
  },
  {
    "id": "foil_carrier",
    "label": "Foil reel carrier",
    "x": 2.55,
    "height": 2.3,
    "components": [
      "reel shafts",
      "frame-tied supports",
      "brakes",
      "guide rollers",
      "tension dancers"
    ]
  },
  {
    "id": "stamping",
    "label": "Hot stamping platen",
    "x": 3.65,
    "height": 1.75,
    "components": [
      "heated platen",
      "die/chase",
      "counterplate",
      "pressure drive",
      "thermal shielding"
    ]
  },
  {
    "id": "foil_control",
    "label": "Foil advance/rewind",
    "x": 5.3,
    "height": 2.1,
    "components": [
      "servo advance rollers",
      "foil pull shafts",
      "rewind shafts",
      "web guides",
      "foil waste roll"
    ]
  },
  {
    "id": "delivery",
    "label": "Delivery",
    "x": 6.42,
    "height": 1.72,
    "components": [
      "gripper opening",
      "joggers",
      "pile lift",
      "pallet"
    ]
  }
];
const MOTIONS=[
  {
    "id": "sheet_cycle",
    "target": "sheet",
    "type": "linear",
    "path": "feeder→delivery",
    "rate": 1
  },
  {
    "id": "foil_index_multi",
    "target": "foil-web",
    "type": "index-hold-index",
    "path": "carrier→stamping→rewind",
    "rate": 0.62
  },
  {
    "id": "platen_press",
    "target": "lower-platen",
    "type": "reciprocating-y",
    "path": "stamping",
    "rate": 0.1
  },
  {
    "id": "dancer_compensation",
    "target": "dancer-arm",
    "type": "oscillating-z",
    "path": "foil",
    "rate": 0.12
  },
  {
    "id": "rewind_accumulate",
    "target": "waste-foil-roll",
    "type": "rotate-indexed",
    "path": "foil",
    "rate": 1
  }
];
const VISUAL_DNA={
  "operatorSide": "foil path visible through guarded access, HMI outside web path",
  "driveSide": "foil pull/rewind drive and electrical cabinets",
  "support": "reel bridge columns visibly land on machine frame"
};
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');}
function taxonomy(){const r=[];for(const st of STATIONS){r.push({l1:MACHINE_ID,l2:st.id,l3:st.id+'_assembly',l4:st.id+'_block',l5:st.id+'_frame',l6:st.id+'_frame_001',label:st.label});st.components.forEach((c,i)=>r.push({l1:MACHINE_ID,l2:st.id,l3:st.id+'_assembly',l4:st.id+'_'+slug(c)+'_block',l5:st.id+'_'+slug(c),l6:st.id+'_'+slug(c)+'_'+String(i+1).padStart(3,'0'),label:c}));}return r;}
function materials(T){return{frame:new T.MeshStandardMaterial({color:0x3b4148,metalness:.55,roughness:.38}),panel:new T.MeshStandardMaterial({color:0xd8d9d5,metalness:.2,roughness:.48}),dark:new T.MeshStandardMaterial({color:0x24282d,metalness:.35,roughness:.42}),belt:new T.MeshStandardMaterial({color:0x202225,roughness:.72}),roller:new T.MeshStandardMaterial({color:0x858b90,metalness:.72,roughness:.28}),glass:new T.MeshPhysicalMaterial({color:0x9db9c2,transparent:true,opacity:.26,roughness:.16,transmission:.28}),safety:new T.MeshStandardMaterial({color:0xe9a51a,metalness:.2,roughness:.45})};}
function box(T,n,s,p,m,parent){const q=new T.Mesh(new T.BoxGeometry(...s),m);q.name=n;q.position.set(...p);q.castShadow=true;q.receiveShadow=true;q.userData.machineId=MACHINE_ID;parent.add(q);return q;}
function cyl(T,n,r,l,p,rot,m,parent){const q=new T.Mesh(new T.CylinderGeometry(r,r,l,24),m);q.name=n;q.position.set(...p);q.rotation.set(...rot);q.castShadow=true;q.receiveShadow=true;q.userData.machineId=MACHINE_ID;parent.add(q);return q;}
function addBase(T,root,M){const L=ENVELOPE_M[0],W=Math.min(ENVELOPE_M[1],2.6);box(T,'base_rail_os',[L,.16,.14],[L/2,.08,W*.4],M.frame,root);box(T,'base_rail_ds',[L,.16,.14],[L/2,.08,-W*.4],M.frame,root);for(let x=.35;x<L;x+=.75)box(T,'crossmember_'+x.toFixed(2),[.1,.12,W*.82],[x,.08,0],M.frame,root);}
function addStations(T,root,M){STATIONS.forEach((st,i)=>{const g=new T.Group();g.name=st.id;g.position.x=st.x;root.add(g);const w=i===STATIONS.length-1?1.05:Math.max(.85,(STATIONS[i+1]?.x??st.x+1.2)-st.x-.1);const zs=Math.min(ENVELOPE_M[1]*.72,1.75);box(T,st.id+'_upright_os',[.11,st.height,.11],[.12,st.height/2,zs/2],M.frame,g);box(T,st.id+'_upright_ds',[.11,st.height,.11],[.12,st.height/2,-zs/2],M.frame,g);box(T,st.id+'_top_os',[w,.11,.11],[w/2,st.height,zs/2],M.frame,g);box(T,st.id+'_top_ds',[w,.11,.11],[w/2,st.height,-zs/2],M.frame,g);const y=0.88;box(T,st.id+'_deck',[w,.09,zs*.94],[w/2,y,0],M.dark,g);for(let k=0;k<4;k++)cyl(T,st.id+'_roller_'+k,.045,Math.max(.55,zs*.84),[.18+k*(w-.3)/3,y+.08,0],[Math.PI/2,0,0],M.roller,g);if(['diecutter','blanker','foil'].includes("foil")){box(T,st.id+'_os_guard',[w*.82,Math.max(.42,st.height-y-.18),.065],[w*.52,y+(st.height-y)/2,zs/2+.1],M.panel,g);box(T,st.id+'_window',[w*.42,Math.max(.18,(st.height-y)*.28),.018],[w*.5,y+.4,zs/2+.14],M.glass,g);}if("foil"==='foldergluer'){for(let b=0;b<5;b++)box(T,st.id+'_belt_'+b,[w*.94,.018,.07],[w*.5,y+.045,(b-2)*.19],M.belt,g);box(T,st.id+'_adjust_bridge',[.075,.65,1.42],[w*.52,y+.36,0],M.frame,g);}if("foil"==='inspection'&&st.id.includes('inspect')){box(T,st.id+'_hood',[w*.95,.82,1.52],[w*.5,y+.54,0],M.dark,g);box(T,st.id+'_camera_gantry',[w*.76,.055,1.3],[w*.5,y+.79,0],M.frame,g);for(let c=0;c<3;c++)box(T,st.id+'_camera_'+c,[.14,.12,.18],[w*(.3+.2*c),y+.7,0],M.dark,g);}if("foil"==='foil'&&st.id.includes('foil')){for(let r=0;r<4;r++){const rx=w*(.22+.18*r);box(T,st.id+'_reel_support_'+r,[.07,.92,.07],[rx,y+.48,.62],M.frame,g);cyl(T,st.id+'_reel_'+r,.13,.5,[rx,y+.88,0],[Math.PI/2,0,0],M.roller,g);}}});}
function addServices(T,root,M){const L=ENVELOPE_M[0],W=Math.min(ENVELOPE_M[1],2.8);box(T,'drive_side_electrical_cabinet',[.82,1.45,.48],[L*.56,.725,-W*.47],M.panel,root);box(T,'drive_side_service_plinth',[.92,.09,.58],[L*.56,.045,-W*.47],M.frame,root);box(T,'hmi_pedestal',[.18,1.1,.18],[L*.42,.55,W*.5],M.frame,root);box(T,'hmi_panel',[.48,.34,.1],[L*.42,1.18,W*.5],M.dark,root);}
function build(T,options={}){if(!T)throw new Error(MACHINE_ID+' requires THREE');const root=new T.Group();root.name=MACHINE_ID;root.userData={machineId:MACHINE_ID,name:"AUTOPLATEN 6 STAMPING",model:"MK 920 YMI-II",spec:SPEC,taxonomy:taxonomy(),motions:MOTIONS,visualDNA:VISUAL_DNA,evidenceStatus:"REFERENCE_VERIFIED_MODEL_FAMILY"};const mm=materials(T);addBase(T,root,mm);addStations(T,root,mm);addServices(T,root,mm);return root;}
function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function apply(root,p,s){root.userData.sim={phase:p,sheetProgress:p,gripperProgress:p,pressLift:Math.max(0,Math.sin(Math.PI*2*p))**2,stripLift:Math.max(0,Math.sin(Math.PI*2*(p-.12)))**2,blankLift:Math.max(0,Math.sin(Math.PI*2*(p-.24)))**2,foilIndex:p<.58?p/.58:1,beltPhase:(p*8)%1,rejectGate:0,cycle:s.cycle};if("foil"==='inspection'){const bad=s.defects.has(s.productSeq);root.userData.sim.lightMode=Math.floor((p*4)%4);root.userData.sim.cameraAcquire=p>.34&&p<.58;root.userData.sim.rejectGate=bad&&p>.68&&p<.79?1:0;}if("foil"==='foldergluer'){root.userData.sim.prefold=smooth(.18,.42,p);root.userData.sim.bottomFold=smooth(.34,.58,p);root.userData.sim.glueOn=p>.48&&p<.62;root.userData.sim.finalFold=smooth(.56,.82,p);root.userData.sim.compression=p>.76?smooth(.76,1,p):0;}}
function createSimulation(root){const state={running:false,phase:0,t:0,cycle:0,productSeq:0,defects:new Set()};const hz=Math.max(.45,Math.min(2.2,((SPEC.maxSpeedSPH||3600)/3600)*.62));return{state,start(){state.running=true;},stop(){state.running=false;},reset(){state.running=false;state.phase=0;state.t=0;state.cycle=0;state.productSeq=0;state.defects.clear();},injectDefect(id){state.defects.add(id);},tick(dt){if(!state.running||!Number.isFinite(dt)||dt<=0)return state;state.t+=Math.min(dt,.05);state.phase=(state.phase+dt*hz)%1;const c=Math.floor(state.t*hz);if(c>state.cycle){state.cycle=c;state.productSeq++;}apply(root,state.phase,state);return state;}};}
function validate(root){const issues=[];if(!root)issues.push('missing root');if(STATIONS.length<5)issues.push('station chain too short');const ids=new Set();taxonomy().forEach(t=>{if(ids.has(t.l6))issues.push('duplicate '+t.l6);ids.add(t.l6);});if(ENVELOPE_M.some(v=>!Number.isFinite(v)||v<=0))issues.push('invalid envelope');return{ok:issues.length===0,issues};}
const api=Object.freeze({id:MACHINE_ID,spec:SPEC,envelopeM:ENVELOPE_M,stations:STATIONS,motions:MOTIONS,visualDNA:VISUAL_DNA,taxonomy,build,createSimulation,validate});global.BMJ_MACHINE_MODULES=global.BMJ_MACHINE_MODULES||{};global.BMJ_MACHINE_MODULES[MACHINE_ID]=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
