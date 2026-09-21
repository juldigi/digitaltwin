import * as THREE from 'three';
import {OFFSET10_DIMENSIONS,OFFSET10_MODULE_SEQUENCE,OFFSET10_MODULE_CENTERS,OFFSET10_PRINTING_UNIT_KEYS,OFFSET10_COATING_UNIT_KEYS} from './data/dimensions-offset10.js';

const D=OFFSET10_DIMENSIONS.layout,TAU=Math.PI*2,PAPER=0xf4f0df;
const COLORS=[0x21b8d6,0xdf438c,0xf0c933,0x25282c,0xe57c32,0x4ab66d,0x4770d1,0x815ac3,0x1d9ba8,0xbe5577,0x7e8b38];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,m)=>((v%m)+m)%m;

function pathPoints(){
  const pts=[
    new THREE.Vector3(D.feederCenterX-1.45,1.73,0),
    new THREE.Vector3(D.feederCenterX-.55,1.76,0),
    new THREE.Vector3(D.feederCenterX+.62,1.60,0),
    new THREE.Vector3(OFFSET10_MODULE_CENTERS.PU1-.52,1.40,0)
  ];
  OFFSET10_MODULE_SEQUENCE.forEach((module,i)=>{
    const x=OFFSET10_MODULE_CENTERS[module.key],y=module.type==='dryer'?1.42:module.type==='coat'?1.36:1.30;
    pts.push(new THREE.Vector3(x-.38,y+.05,0),new THREE.Vector3(x,y,0),new THREE.Vector3(x+.38,y+.04,0));
    if(i<OFFSET10_MODULE_SEQUENCE.length-1){
      const nx=OFFSET10_MODULE_CENTERS[OFFSET10_MODULE_SEQUENCE[i+1].key];
      pts.push(new THREE.Vector3((x+nx)/2,1.18,0));
    }
  });
  pts.push(
    new THREE.Vector3(D.deliveryCenterX-1.75,1.45,0),
    new THREE.Vector3(D.deliveryCenterX-.80,1.45,0),
    new THREE.Vector3(D.deliveryCenterX+.10,1.38,0),
    new THREE.Vector3(D.deliveryCenterX+.78,1.27,0),
    new THREE.Vector3(D.deliveryPileX,1.66,0)
  );
  return pts;
}
function stageForX(x){
  if(x<D.feederCenterX+1.10)return 'Preset Plus Feeder';
  for(let i=0;i<OFFSET10_MODULE_SEQUENCE.length;i++){
    const m=OFFSET10_MODULE_SEQUENCE[i],cx=OFFSET10_MODULE_CENTERS[m.key];
    const end=i<OFFSET10_MODULE_SEQUENCE.length-1?(cx+OFFSET10_MODULE_CENTERS[OFFSET10_MODULE_SEQUENCE[i+1].key])/2:cx+.65;
    if(x<end)return m.label;
  }
  return 'Preset Plus X3 Delivery';
}
function createSheetGeometry(l=10,w=8){
  const p=new Float32Array((l+1)*(w+1)*3),c=new Float32Array(p.length),idx=[];
  for(let i=0;i<l;i++)for(let j=0;j<w;j++){const a=i*(w+1)+j,b=a+1,d=(i+1)*(w+1)+j,e=d+1;idx.push(a,d,b,b,d,e);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));g.setIndex(idx);return g;
}
function flowCurve(cx,type='ink'){
  if(type==='damp')return new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx+.35,1.54,.04),new THREE.Vector3(cx+.44,1.67,.035),new THREE.Vector3(cx+.47,1.84,.03),
    new THREE.Vector3(cx+.42,2.02,.02),new THREE.Vector3(cx+.29,1.91,.01),new THREE.Vector3(cx+.10,1.92,0)
  ],false,'centripetal',.5);
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx-.33,2.80,.08),new THREE.Vector3(cx-.33,2.70,.07),new THREE.Vector3(cx-.23,2.55,.055),
    new THREE.Vector3(cx,2.54,.045),new THREE.Vector3(cx+.23,2.54,.035),new THREE.Vector3(cx+.32,2.27,.025),
    new THREE.Vector3(cx+.106,2.205,.015),new THREE.Vector3(cx+.10,1.92,0),new THREE.Vector3(cx-.08,1.49,0)
  ],false,'centripetal',.5);
}

export const OFFSET10_SIMULATION_STAGES=Object.freeze([
 'Preset Plus Feeder',...OFFSET10_MODULE_SEQUENCE.map(m=>m.label),'Preset Plus X3 Delivery'
]);
export const OFFSET10_INK_SEQUENCE=Object.freeze([
 'Ink fountain / fountain roller','Ink transfer cluster','Four ink distributors','Four form rollers','Plate cylinder','Blanket cylinder','Sheet'
]);

export class Offset10PrintingSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='OFFSET10-PRINTING-TEST';this.group.visible=false;machine.add(this.group);
    this.points=pathPoints();this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal',.5);this.pathLength=this.curve.getLength();
    this.sheetLength=.72;this.sheetWidth=1.04;this.sheetGap=1.30;this.cycleDistance=this.pathLength+2.6;this.sheetCount=Math.max(9,Math.floor(this.cycleDistance/this.sheetGap));
    this.sheets=[];this.pileSheets=[];this.rotors=[];this.oscillators=[];this.flows=[];this.uv=[];this.foil=[];this.materials=[];this.geometries=[];
    this.maxPileSheets=32;this.pileThickness=.0034;this.pileAnchor=new THREE.Vector3(D.deliveryPileX,1.66,0);
    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.emitAt=0;this.pathVisible=true;this.inkFlowVisible=true;this.uvActive=false;this.foilStarActive=false;this.onUpdate=null;this.baseMetersPerSecond=2.35;
    this.buildPath();this.buildSheets();this.buildPileSheets();this.refreshPile();this.buildFlows();this.collectMotion();this.collectUV();this.collectFoil();
  }
  material(params){const basic=params.basic;delete params.basic;const m=basic?new THREE.MeshBasicMaterial(params):new THREE.MeshStandardMaterial(params);this.materials.push(m);return m;}
  geometry(g){this.geometries.push(g);return g;}
  buildPath(){
    const pts=[];for(let i=0;i<=280;i++)pts.push(this.curve.getPointAt(i/280));
    const geo=this.geometry(new THREE.BufferGeometry().setFromPoints(pts)),mat=new THREE.LineBasicMaterial({color:0x3bc9e6,transparent:true,opacity:.36,depthWrite:false});this.materials.push(mat);
    this.pathLine=new THREE.Line(geo,mat);this.group.add(this.pathLine);
  }
  buildSheets(){
    const paper=new THREE.Color(PAPER),bands=COLORS.map(c=>new THREE.Color(c)),gripGeo=this.geometry(new THREE.BoxGeometry(.04,.025,1.08)),gripMat=this.material({color:0x20282d,roughness:.5,metalness:.4});
    for(let n=0;n<this.sheetCount;n++){
      const geo=this.geometry(createSheetGeometry()),mat=this.material({basic:true,vertexColors:true,side:THREE.DoubleSide}),mesh=new THREE.Mesh(geo,mat);mesh.visible=false;mesh.frustumCulled=false;this.group.add(mesh);
      const gripper=new THREE.Mesh(gripGeo,gripMat);gripper.visible=false;gripper.frustumCulled=false;this.group.add(gripper);
      const sheet={mesh,gripper,paper,bands,userData:{printed:-1,progress:0,lead:new THREE.Vector3(),trail:new THREE.Vector3(),lastCycle:-1}};this.colorSheet(sheet,0);this.sheets.push(sheet);
    }
  }
  colorSheet(sheet,count){
    if(sheet.userData.printed===count)return;const a=sheet.mesh.geometry.attributes.color,w=8,l=10;
    for(let i=0;i<=l;i++)for(let j=0;j<=w;j++){const band=Math.min(COLORS.length-1,Math.floor(j/(w+1)*COLORS.length)),col=band<count?sheet.bands[band]:sheet.paper,idx=i*(w+1)+j;a.setXYZ(idx,col.r,col.g,col.b);}
    a.needsUpdate=true;sheet.userData.printed=count;
  }
  buildPileSheets(){
    const paper=new THREE.Color(PAPER),bands=COLORS.map(c=>new THREE.Color(c));
    for(let i=0;i<this.maxPileSheets;i++){const geo=this.geometry(createSheetGeometry()),mat=this.material({basic:true,vertexColors:true,side:THREE.DoubleSide}),mesh=new THREE.Mesh(geo,mat);mesh.visible=false;mesh.frustumCulled=false;this.group.add(mesh);const s={mesh,paper,bands,userData:{printed:-1,serial:-1}};this.colorSheet(s,11);this.pileSheets.push(s);}
  }
  refreshPile(){
    const node=this.template.findNode('o10-delivery-paper-stack');if(!node)return this.pileAnchor;this.machine.updateMatrixWorld(true);node.updateWorldMatrix(true,true);
    const box=new THREE.Box3().setFromObject(node),p=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);this.machine.worldToLocal(p);this.pileAnchor.copy(p);this.pileAnchor.y+=.004;return p;
  }
  layoutPile(){
    const list=this.pileSheets.filter(s=>s.userData.serial>=0).sort((a,b)=>a.userData.serial-b.userData.serial),w=8,l=10;
    list.forEach((s,rank)=>{const a=s.mesh.geometry.attributes.position,y=this.pileAnchor.y+rank*this.pileThickness;for(let i=0;i<=l;i++){const x=this.pileAnchor.x-this.sheetLength/2+i/l*this.sheetLength;for(let j=0;j<=w;j++){const z=this.pileAnchor.z-this.sheetWidth/2+j/w*this.sheetWidth;a.setXYZ(i*(w+1)+j,x,y,z);}}a.needsUpdate=true;s.mesh.visible=true;});
  }
  deposit(sheet,cycle){if(sheet.userData.lastCycle===cycle)return;sheet.userData.lastCycle=cycle;this.completed++;const target=this.pileSheets[(this.completed-1)%this.maxPileSheets];target.userData.serial=this.completed;this.colorSheet(target,11);this.layoutPile();sheet.mesh.visible=false;sheet.gripper.visible=false;}
  updateSheet(sheet,distance){
    const visible=distance>=this.sheetLength&&distance<=this.pathLength;sheet.mesh.visible=visible;sheet.gripper.visible=visible;if(!visible)return false;
    const pos=sheet.mesh.geometry.attributes.position,w=8,l=10;let lead,trail;
    for(let i=0;i<=l;i++){const d=distance-this.sheetLength*(1-i/l),t=clamp(d/this.pathLength,0,1),p=this.curve.getPointAt(t);if(i===0)trail=p.clone();if(i===l)lead=p.clone();for(let j=0;j<=w;j++)pos.setXYZ(i*(w+1)+j,p.x,p.y+.006,-this.sheetWidth/2+j/w*this.sheetWidth);}
    pos.needsUpdate=true;sheet.gripper.position.copy(lead);sheet.gripper.position.y+=.018;const tan=this.curve.getTangentAt(clamp(distance/this.pathLength,0,1));sheet.gripper.rotation.z=Math.atan2(tan.y,tan.x);
    sheet.userData.progress=distance/this.pathLength;sheet.userData.lead.copy(lead);sheet.userData.trail.copy(trail);
    const printed=OFFSET10_PRINTING_UNIT_KEYS.filter(k=>lead.x>OFFSET10_MODULE_CENTERS[k]+.25).length;this.colorSheet(sheet,printed);return true;
  }
  addFlow(curve,color,type,phase){
    const geo=this.geometry(new THREE.TubeGeometry(curve,32,type==='ink'?.008:.006,6,false)),mat=this.material({basic:true,color,transparent:true,opacity:type==='ink'?.42:.25,depthWrite:false}),tube=new THREE.Mesh(geo,mat);this.group.add(tube);
    const pgeo=this.geometry(new THREE.SphereGeometry(type==='ink'?.022:.016,7,5)),pmat=this.material({color,emissive:color,emissiveIntensity:.55,roughness:.3}),particles=[];
    for(let i=0;i<4;i++){const p=new THREE.Mesh(pgeo,pmat);this.group.add(p);particles.push(p);}this.flows.push({curve,tube,particles,type,phase,speed:type==='ink'?.09:.065});
  }
  buildFlows(){
    OFFSET10_PRINTING_UNIT_KEYS.forEach((key,i)=>{const cx=OFFSET10_MODULE_CENTERS[key];this.addFlow(flowCurve(cx,'ink'),COLORS[i],'ink',i*.07);this.addFlow(flowCurve(cx,'damp'),0x49bee0,'damp',i*.05+.3);});
    for(const key of OFFSET10_COATING_UNIT_KEYS){const cx=OFFSET10_MODULE_CENTERS[key],curve=new THREE.CatmullRomCurve3([new THREE.Vector3(cx-.35,2.30,.08),new THREE.Vector3(cx-.12,2.05,.04),new THREE.Vector3(cx+.08,1.55,0)],false,'centripetal',.5);this.addFlow(curve,0xd2b25a,'coat',cx*.01);}
  }
  collectMotion(){
    const seen=new Set();
    this.machine.traverse(mesh=>{
      if(!mesh.isMesh||!mesh.userData?.rotor||!mesh.userData?.rollerRole||seen.has(mesh.uuid))return;
      seen.add(mesh.uuid);this.rotors.push({mesh,initial:mesh.quaternion.clone(),role:mesh.userData.rollerRole,rate:mesh.userData.spinRate||.8,sign:mesh.userData.spinDirection||1});
    });
    for(const key of OFFSET10_PRINTING_UNIT_KEYS){const n=this.template.findNode('o10-'+key.toLowerCase()+'-ink-distributors');if(n)this.oscillators.push({object:n,initial:n.position.clone(),axis:'z',amp:.035,rate:.72,phase:this.oscillators.length*.31});}
  }
  collectUV(){for(const id of ['o10-y1-uv','o10-y2-uv','o10-eop-uv'])this.template.findNode(id)?.traverse(mesh=>{if(mesh.userData.uvLamp)this.uv.push({mesh,type:'lamp',initial:mesh.material.emissiveIntensity});if(mesh.userData.uvBeam)this.uv.push({mesh,type:'beam',initialVisible:mesh.visible,initialOpacity:mesh.material.opacity});});}
  collectFoil(){this.template.findNode('o10-foilstar-rolls')?.traverse(mesh=>{if(mesh.isMesh&&mesh.userData?.foilReel)this.foil.push({mesh,initial:mesh.quaternion.clone(),direction:mesh.userData.foilReel==='unwind'?-1:1});});}
  setUV(activeZones=[]){
    this.uvActive=activeZones.length>0;for(const item of this.uv){let root=item.mesh.parent?.userData?.nodeId||'',active=activeZones.some(z=>root.startsWith(z));if(item.type==='lamp')item.mesh.material.emissiveIntensity=active?2.4:.08;else{item.mesh.visible=active;item.mesh.material.opacity=active?.18:.15;}}
  }
  state(){
    const moving=this.sheets.filter(s=>s.mesh.visible),lead=[...moving].sort((a,b)=>b.userData.progress-a.userData.progress)[0],p=lead?.userData.lead||this.points[0];
    return {active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,stage:stageForX(p.x),completed:this.completed,progress:lead?.userData.progress||0,sheetsVisible:moving.length,pileSheetsVisible:this.pileSheets.filter(s=>s.mesh.visible).length,rotorCount:this.rotors.length,rotorRoles:[...new Set(this.rotors.map(r=>r.role))],oscillatorCount:this.oscillators.length,mechanismCount:this.rotors.length+this.oscillators.length,inkFlowCount:this.flows.length,uvLampCount:9,uvActive:this.uvActive,foilStarActive:this.foilStarActive,pathVisible:this.pathVisible,inkFlowVisible:this.inkFlowVisible};
  }
  emit(force=false){const now=performance?.now?.()||Date.now();if(!force&&now<this.emitAt)return;this.emitAt=now+120;this.onUpdate?.(this.state());}
  start(){if(!this.active){this.elapsed=0;this.completed=0;for(const p of this.pileSheets){p.mesh.visible=false;p.userData.serial=-1;}for(const s of this.sheets)s.userData.lastCycle=-1;}this.refreshPile();this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;this.emit(true);return this.state();}
  pause(){if(this.active){this.running=false;this.lastNow=null;this.emit(true);}return this.state();}
  resume(){if(this.active){this.running=true;this.lastNow=null;this.emit(true);}return this.state();}
  stop(){this.active=false;this.running=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.group.visible=false;for(const s of this.sheets){s.mesh.visible=false;s.gripper.visible=false;s.userData.lastCycle=-1;this.colorSheet(s,0);}for(const p of this.pileSheets){p.mesh.visible=false;p.userData.serial=-1;}for(const r of this.rotors)r.mesh.quaternion.copy(r.initial);for(const o of this.oscillators)o.object.position.copy(o.initial);for(const f of this.foil)f.mesh.quaternion.copy(f.initial);this.setUV([]);this.foilStarActive=false;this.emit(true);return this.state();}
  setSpeed(v){this.speed=clamp(Number(v)||1,.35,2);this.emit(true);return this.state();}
  setPathVisible(on){this.pathVisible=!!on;this.pathLine.visible=this.pathVisible;this.emit(true);return this.state();}
  setInkFlowVisible(on){this.inkFlowVisible=!!on;for(const f of this.flows){f.tube.visible=this.inkFlowVisible;for(const p of f.particles)p.visible=this.inkFlowVisible;}this.emit(true);return this.state();}
  update(now){
    if(!this.active)return;if(!this.running){this.lastNow=now;return;}if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min(Math.max((now-this.lastNow)/1000,0),.05),scaled=dt*this.speed;this.lastNow=now;this.elapsed+=scaled;const travelled=this.elapsed*this.baseMetersPerSecond;
    const zones=new Set();this.foilStarActive=false;
    for(let i=0;i<this.sheets.length;i++){
      const s=this.sheets[i],absolute=travelled-i*this.sheetGap;if(absolute<this.sheetLength){s.mesh.visible=false;s.gripper.visible=false;continue;}
      const cycle=Math.floor(absolute/this.cycleDistance),local=mod(absolute,this.cycleDistance);if(local>this.pathLength){this.deposit(s,cycle);continue;}if(!this.updateSheet(s,local))continue;
      const x=s.userData.lead.x;
      for(const key of ['Y1','Y2'])if(Math.abs(x-OFFSET10_MODULE_CENTERS[key])<.65)zones.add('o10-'+key.toLowerCase()+'-uv');
      if(x>D.deliveryCenterX-1.75&&x<D.deliveryCenterX-.25)zones.add('o10-eop-uv');
      if(Math.abs(x-OFFSET10_MODULE_CENTERS.PU2)<.75)this.foilStarActive=true;
    }
    const angular=4.6*scaled;for(const r of this.rotors)r.mesh.rotateY((r.sign||1)*(r.rate||.8)*angular);const phase=this.elapsed*TAU;for(const o of this.oscillators)o.object.position[o.axis]=o.initial[o.axis]+Math.sin(phase*o.rate+o.phase)*o.amp;
    for(const f of this.foil)if(this.foilStarActive)f.mesh.rotateY((f.direction||1)*angular*.82);
    if(this.inkFlowVisible)for(const f of this.flows)for(let i=0;i<f.particles.length;i++){const t=mod(this.elapsed*f.speed+f.phase+i/f.particles.length,1);f.particles[i].position.copy(f.curve.getPointAt(t));f.particles[i].scale.setScalar(.75+.25*Math.sin(phase+i));}
    this.setUV([...zones]);this.emit(false);
  }
  dispose(){this.stop();this.machine.remove(this.group);for(const g of this.geometries)g.dispose();for(const m of this.materials)m.dispose();}
}
