import * as THREE from 'three';
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS} from './data/dimensions-offset5.js';

// Printing-test visualisation for Offset 5.
// Process order: feeder -> register -> PU1..PU8 -> coater -> UV dryer/inspection -> delivery.
// Mechanical phasing, oscillator stroke, ink-flow timing and UV intensity are explanatory
// visualisation values only; they are not machine service settings.
const D=OFFSET5_DIMENSIONS.layout;
const UNIT_COLORS=[0x21b8d6,0xdf438c,0xf0c933,0x25282c,0xe57c32,0x4ab66d,0x4770d1,0x815ac3];
const PAPER=0xf4f0df;
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mod=(v,m)=>((v%m)+m)%m;

function arcPoint(cx,cy,r,deg){
  const a=THREE.MathUtils.degToRad(deg);
  return new THREE.Vector3(cx+Math.cos(a)*r,cy+Math.sin(a)*r,0);
}

function pathPoints(){
  const pts=[
    new THREE.Vector3(D.feederCenterX-.58,1.37,0),
    new THREE.Vector3(D.feederCenterX-.16,1.50,0),
    new THREE.Vector3(D.feederCenterX+.38,1.49,0),
    new THREE.Vector3(D.feedBoardCenterX-.48,1.40,0),
    new THREE.Vector3(D.feedBoardCenterX+.28,1.39,0),
    new THREE.Vector3(OFFSET5_UNIT_CENTERS[0]-.54,1.26,0)
  ];
  OFFSET5_UNIT_CENTERS.forEach((cx,i)=>{
    const icx=cx+.16,icy=.95,r=.270;
    // Dense tangent samples prevent Catmull-Rom interpolation from cutting inside the impression cylinder.
    for(const deg of [170,155,140,125,110,95,80,65,50,35,20,5])pts.push(arcPoint(icx,icy,r,deg));
    if(i<OFFSET5_UNIT_CENTERS.length-1){
      const next=OFFSET5_UNIT_CENTERS[i+1],tx=(cx+next)/2,ty=.70,tr=.247;
      for(const deg of [165,145,125,105,85,65,45,25,10])pts.push(arcPoint(tx,ty,tr,deg));
    }
  });
  const last=OFFSET5_UNIT_CENTERS.at(-1);
  pts.push(
    new THREE.Vector3(last+.62,.94,0),
    new THREE.Vector3(D.coaterCenterX-.48,1.02,0),
    new THREE.Vector3(D.coaterCenterX-.12,1.20,0),
    new THREE.Vector3(D.coaterCenterX+.42,1.24,0),
    new THREE.Vector3(D.dryerCenterX-.70,1.29,0),
    new THREE.Vector3(D.dryerCenterX-.32,1.29,0),
    new THREE.Vector3(D.dryerCenterX+.06,1.29,0),
    new THREE.Vector3(D.dryerCenterX+.46,1.30,0),
    new THREE.Vector3(D.inspectionCenterX,1.34,0),
    new THREE.Vector3(D.deliveryCenterX-1.00,1.54,0),
    new THREE.Vector3(D.deliveryCenterX-.58,1.52,0),
    new THREE.Vector3(D.deliveryCenterX-.30,1.47,0),
    new THREE.Vector3(D.deliveryCenterX-.10,1.36,0),
    new THREE.Vector3(D.deliveryCenterX+.10,1.24,0)
  );
  return pts;
}

function stageForX(x){
  if(x<D.feedBoardCenterX-.45)return 'Feeder';
  if(x<OFFSET5_UNIT_CENTERS[0]-.45)return 'Register / Feed Table';
  for(let i=0;i<OFFSET5_UNIT_CENTERS.length;i++){
    const end=i<OFFSET5_UNIT_CENTERS.length-1?(OFFSET5_UNIT_CENTERS[i]+OFFSET5_UNIT_CENTERS[i+1])/2:OFFSET5_UNIT_CENTERS[i]+.68;
    if(x<end)return 'Printing Unit '+(i+1);
  }
  if(x<D.dryerCenterX-.72)return 'Coating Unit';
  if(x<D.inspectionCenterX-.18)return 'Dryer / Extension';
  if(x<D.deliveryCenterX-.95)return 'Inline Inspection';
  return 'Delivery';
}

function printedUnitsForX(x){
  let count=0;
  for(const cx of OFFSET5_UNIT_CENTERS)if(x>cx+.22)count++;
  return Math.min(8,count);
}

function largestCylinder(node){
  const list=[];
  node?.traverse(object=>{if(object.isMesh&&object.geometry?.type==='CylinderGeometry')list.push(object);});
  return list.sort((a,b)=>{
    const ap=a.geometry.parameters||{},bp=b.geometry.parameters||{};
    return (bp.radiusTop||0)*(bp.height||0)-(ap.radiusTop||0)*(ap.height||0);
  })[0]||null;
}

function firstLever(node){
  let result=null;
  node?.traverse(object=>{
    if(result||!object.isMesh||object.geometry?.type!=='BoxGeometry')return;
    const p=object.geometry.parameters||{};
    if((p.width||0)>.14&&(p.height||0)<.08&&(p.depth||0)<.09)result=object;
  });
  return result;
}

function inkDripCurve(cx){
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx-.10,2.80,.10),
    new THREE.Vector3(cx-.06,2.73,.075),
    new THREE.Vector3(cx-.015,2.68,.050),
    new THREE.Vector3(cx+.06,2.63,.026),
    new THREE.Vector3(cx+.1484,2.5783,.010)
  ],false,'centripetal',.5);
}

function inkFilmCurve(cx,side='left'){
  if(side==='right')return new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx+.1484,2.5783,.018),
    new THREE.Vector3(cx+.3246,2.4447,.016),
    new THREE.Vector3(cx+.4447,2.4040,.014),
    new THREE.Vector3(cx+.4118,2.2820,.012),
    new THREE.Vector3(cx+.4467,2.1658,.010),
    new THREE.Vector3(cx+.5474,2.1696,.009),
    new THREE.Vector3(cx+.3479,2.0922,.007),
    new THREE.Vector3(cx+.2336,2.0554,.005),
    new THREE.Vector3(cx+.3421,1.9759,.004),
    new THREE.Vector3(cx+.16,1.79,.002),
    new THREE.Vector3(cx-.12,1.39,.001)
  ],false,'centripetal',.5);
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx+.1484,2.5783,-.018),
    new THREE.Vector3(cx+.3246,2.4447,-.016),
    new THREE.Vector3(cx+.2065,2.2607,-.014),
    new THREE.Vector3(cx+.1019,2.2161,-.012),
    new THREE.Vector3(cx+.0380,2.2955,-.010),
    new THREE.Vector3(cx-.0279,2.2355,-.009),
    new THREE.Vector3(cx+.1639,2.1309,-.007),
    new THREE.Vector3(cx+.0109,2.1290,-.006),
    new THREE.Vector3(cx-.0259,2.0031,-.004),
    new THREE.Vector3(cx+.1019,2.0515,-.003),
    new THREE.Vector3(cx+.16,1.79,-.002),
    new THREE.Vector3(cx-.12,1.39,-.001)
  ],false,'centripetal',.5);
}

function dampeningCurve(cx){
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx+.72,1.68,.09),
    new THREE.Vector3(cx+.7082,1.7571,.075),
    new THREE.Vector3(cx+.5764,1.8597,.060),
    new THREE.Vector3(cx+.4370,1.8307,.045),
    new THREE.Vector3(cx+.4796,1.7067,.035),
    new THREE.Vector3(cx+.4273,1.9372,.020),
    new THREE.Vector3(cx+.3421,1.9759,.010),
    new THREE.Vector3(cx+.16,1.79,.004)
  ],false,'centripetal',.5);
}

function createSheetGeometry(lengthSegments=12,widthSegments=8){
  const positions=new Float32Array((lengthSegments+1)*(widthSegments+1)*3);
  const colors=new Float32Array(positions.length),indices=[];
  for(let i=0;i<lengthSegments;i++)for(let j=0;j<widthSegments;j++){
    const a=i*(widthSegments+1)+j,b=a+1,c=(i+1)*(widthSegments+1)+j,d=c+1;
    indices.push(a,c,b,b,c,d);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geo.setIndex(indices);geo.computeBoundingSphere();
  return geo;
}

export class PrintingSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;
    this.group=new THREE.Group();this.group.name='PRINTING-TEST-SIMULATION';this.group.visible=false;this.machine.add(this.group);
    this.points=pathPoints();this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal',.5);this.pathLength=this.curve.getLength();
    this.sheetLength=.66;this.sheetWidth=1.02;this.sheetLengthSegments=12;this.sheetWidthSegments=8;
    this.sheetGapMeters=1.34;this.cycleDistance=this.pathLength+this.sheetGapMeters*2;this.sheetCount=Math.max(8,Math.floor(this.cycleDistance/this.sheetGapMeters));
    this.sheets=[];this.pileSheets=[];this.rotors=[];this.oscillators=[];this.levers=[];this.gripperMotions=[];this.joggerMotions=[];this.fluidFlows=[];this.inkSurfaces=[];
    this.uvLamps=[];this.uvBeams=[];this.materials=[];this.geometries=[];
    this.maxPileSheets=32;this.pileSheetThickness=.0035;this.pileAnchor=new THREE.Vector3(D.deliveryCenterX+.10,1.22,0);
    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.emitAt=0;this.pathVisible=true;this.inkFlowVisible=true;this.uvActive=false;this.onUpdate=null;
    this.baseMetersPerSecond=2.15;
    this.buildPath();this.buildSheets();this.buildPileSheets();this.refreshDeliveryPileAnchor();this.buildFluidFlows();this.collectMechanicalMotion();this.collectInkSurfaces();this.collectUVSystem();
  }
  material(params){
    const basic=params.basic;delete params.basic;
    const m=basic?new THREE.MeshBasicMaterial(params):new THREE.MeshStandardMaterial(params);this.materials.push(m);return m;
  }
  geometry(g){this.geometries.push(g);return g;}
  buildPath(){
    const verts=[];for(let i=0;i<=260;i++)verts.push(this.curve.getPointAt(i/260));
    const geo=this.geometry(new THREE.BufferGeometry().setFromPoints(verts));
    const mat=new THREE.LineBasicMaterial({color:0x57d3ff,transparent:true,opacity:.42,depthWrite:false});this.materials.push(mat);
    this.pathLine=new THREE.Line(geo,mat);this.pathLine.name='Sheet travel path';this.pathLine.renderOrder=4;this.group.add(this.pathLine);
  }
  buildSheets(){
    const paperColor=new THREE.Color(PAPER),bandColors=UNIT_COLORS.map(c=>new THREE.Color(c));
    const gripGeo=this.geometry(new THREE.BoxGeometry(.035,.022,1.08)),gripMat=this.material({color:0x20282d,roughness:.52,metalness:.45});
    for(let i=0;i<this.sheetCount;i++){
      const geo=this.geometry(createSheetGeometry(this.sheetLengthSegments,this.sheetWidthSegments));
      const mat=this.material({basic:true,vertexColors:true,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(geo,mat);mesh.name='Flexible printing-test sheet '+(i+1);mesh.visible=false;mesh.renderOrder=6;mesh.frustumCulled=false;this.group.add(mesh);
      const gripper=new THREE.Mesh(gripGeo,gripMat);gripper.name='Leading-edge gripper '+(i+1);gripper.visible=false;gripper.renderOrder=7;gripper.frustumCulled=false;this.group.add(gripper);
      const sheet={mesh,gripper,paperColor,bandColors,userData:{progress:0,printed:-1,leadPosition:new THREE.Vector3(),trailPosition:new THREE.Vector3(),leadDistance:0,lastDeliveryCycle:-1}};
      this.setSheetColors(sheet,0);this.sheets.push(sheet);
    }
  }
  buildPileSheets(){
    const paperColor=new THREE.Color(PAPER),bandColors=UNIT_COLORS.map(color=>new THREE.Color(color));
    for(let i=0;i<this.maxPileSheets;i++){
      const geo=this.geometry(createSheetGeometry(this.sheetLengthSegments,this.sheetWidthSegments));
      const mat=this.material({basic:true,vertexColors:true,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(geo,mat);mesh.name='Delivered printed sheet '+(i+1);mesh.visible=false;mesh.renderOrder=6;mesh.frustumCulled=false;this.group.add(mesh);
      const sheet={mesh,paperColor,bandColors,userData:{printed:-1,serial:-1}};
      this.setSheetColors(sheet,8);this.pileSheets.push(sheet);
    }
  }
  refreshDeliveryPileAnchor(){
    const stack=this.template.findNode('delivery-paper-stack');
    if(!stack)return this.pileAnchor;
    this.machine.updateMatrixWorld(true);stack.updateWorldMatrix(true,true);
    const box=new THREE.Box3().setFromObject(stack),center=box.getCenter(new THREE.Vector3()),top=new THREE.Vector3(center.x,box.max.y,center.z);
    this.machine.worldToLocal(top);this.pileAnchor.copy(top);this.pileAnchor.y+=this.pileSheetThickness*.6;
    return this.pileAnchor;
  }
  layoutPileSheet(sheet,rank){
    const pos=sheet.mesh.geometry.attributes.position,w=this.sheetWidthSegments,l=this.sheetLengthSegments;
    const y=this.pileAnchor.y+rank*this.pileSheetThickness;
    for(let i=0;i<=l;i++){
      const x=this.pileAnchor.x-this.sheetLength/2+(i/l)*this.sheetLength;
      for(let j=0;j<=w;j++){
        const z=this.pileAnchor.z-this.sheetWidth/2+(j/w)*this.sheetWidth,index=i*(w+1)+j;
        pos.setXYZ(index,x,y,z);
      }
    }
    pos.needsUpdate=true;sheet.mesh.visible=true;
  }
  relayoutPileSheets(){
    const visible=this.pileSheets.filter(sheet=>sheet.userData.serial>=0).sort((a,b)=>a.userData.serial-b.userData.serial);
    visible.forEach((sheet,rank)=>this.layoutPileSheet(sheet,rank));
  }
  depositSheet(sheet,cycle){
    if(sheet.userData.lastDeliveryCycle===cycle)return false;
    sheet.userData.lastDeliveryCycle=cycle;this.completed++;
    const slot=(this.completed-1)%this.maxPileSheets,pileSheet=this.pileSheets[slot];
    pileSheet.userData.serial=this.completed;this.setSheetColors(pileSheet,8);
    this.relayoutPileSheets();
    sheet.mesh.visible=false;sheet.gripper.visible=false;
    return true;
  }
  resetDeliveryPile(){
    for(const sheet of this.pileSheets){sheet.mesh.visible=false;sheet.userData.serial=-1;}
    for(const sheet of this.sheets)sheet.userData.lastDeliveryCycle=-1;
  }
  setSheetColors(sheet,printed){
    if(sheet.userData.printed===printed)return;
    const attr=sheet.mesh.geometry.attributes.color,w=this.sheetWidthSegments,l=this.sheetLengthSegments;
    for(let i=0;i<=l;i++)for(let j=0;j<=w;j++){
      const band=Math.min(w-1,j===w?w-1:j),color=band<printed?sheet.bandColors[band]:sheet.paperColor,index=i*(w+1)+j;
      attr.setXYZ(index,color.r,color.g,color.b);
    }
    attr.needsUpdate=true;sheet.userData.printed=printed;
  }
  updateSheet(sheet,leadDistance){
    const visible=leadDistance>=this.sheetLength&&leadDistance<=this.pathLength;
    sheet.mesh.visible=visible;sheet.gripper.visible=visible;
    if(!visible)return false;
    const pos=sheet.mesh.geometry.attributes.position,w=this.sheetWidthSegments,l=this.sheetLengthSegments;
    let trail=null,lead=null;
    for(let i=0;i<=l;i++){
      const distance=leadDistance-this.sheetLength*(1-i/l),t=clamp(distance/this.pathLength,0,1),p=this.curve.getPointAt(t);
      if(i===0)trail=p.clone();if(i===l)lead=p.clone();
      for(let j=0;j<=w;j++){
        const z=-this.sheetWidth/2+(j/w)*this.sheetWidth,index=i*(w+1)+j;
        pos.setXYZ(index,p.x,p.y+.008,z);
      }
    }
    pos.needsUpdate=true;
    const t=clamp(leadDistance/this.pathLength,0,1),tan=this.curve.getTangentAt(t),angle=Math.atan2(tan.y,tan.x);
    sheet.gripper.position.copy(lead);sheet.gripper.position.y+=.020;sheet.gripper.rotation.set(0,0,angle);
    sheet.userData.progress=t;sheet.userData.leadPosition.copy(lead);sheet.userData.trailPosition.copy(trail);sheet.userData.leadDistance=leadDistance;
    this.setSheetColors(sheet,printedUnitsForX(lead.x));
    return true;
  }
  addFlow(curve,{color,type,count,speed,phase,radius=.008,opacity=.34,particleRadius=.018,dropScale=1}){
    const tubeGeo=this.geometry(new THREE.TubeGeometry(curve,40,radius,6,false));
    const tubeMat=this.material({basic:true,color,transparent:true,opacity,depthWrite:false});
    const tube=new THREE.Mesh(tubeGeo,tubeMat);tube.name=type+' flow';tube.renderOrder=5;this.group.add(tube);
    const particleGeo=this.geometry(new THREE.SphereGeometry(particleRadius,8,6));
    const particleMat=this.material({color,emissive:color,emissiveIntensity:type==='ink-drip'?.95:.58,roughness:.28,metalness:.02,transparent:true,opacity:.96});
    const particles=[];
    for(let p=0;p<count;p++){
      const mesh=new THREE.Mesh(particleGeo,particleMat);mesh.renderOrder=8;
      if(type==='ink-drip')mesh.scale.set(.72,dropScale,.72);
      this.group.add(mesh);particles.push(mesh);
    }
    this.fluidFlows.push({type,curve,tube,particles,speed,phase});
  }
  buildFluidFlows(){
    OFFSET5_UNIT_CENTERS.forEach((cx,unit)=>{
      const color=UNIT_COLORS[unit];
      this.addFlow(inkDripCurve(cx),{color,type:'ink-drip',count:5,speed:.16,phase:unit*.073,radius:.010,opacity:.52,particleRadius:.038,dropScale:1.85});
      this.addFlow(inkFilmCurve(cx,'left'),{color,type:'ink-film-left',count:5,speed:.070,phase:unit*.051+.12,radius:.007,opacity:.34,particleRadius:.017});
      this.addFlow(inkFilmCurve(cx,'right'),{color,type:'ink-film-right',count:5,speed:.073,phase:unit*.059+.29,radius:.007,opacity:.34,particleRadius:.017});
      this.addFlow(dampeningCurve(cx),{color:0x45bfe5,type:'dampening',count:4,speed:.060,phase:unit*.061+.37,radius:.006,opacity:.28,particleRadius:.015});
    });
  }
  addRotor(mesh,sign=1,rate=1){
    if(!mesh||this.rotors.some(entry=>entry.mesh===mesh))return;
    const axis=mesh.geometry?.type==='TorusGeometry'?'z':'y';
    this.rotors.push({mesh,sign,rate,axis,initial:mesh.quaternion.clone()});
  }
  addNodeRotors(id,sign=1,rate=1,{torus=true}={}){
    const node=this.template.findNode(id);if(!node)return;
    let index=0;node.traverse(mesh=>{
      if(!mesh.isMesh)return;
      const type=mesh.geometry?.type;if(type!=='CylinderGeometry'&&!(torus&&type==='TorusGeometry'))return;
      this.addRotor(mesh,index++%2?-sign:sign,rate*(1+(index%3)*.04));
    });
  }
  addOscillator(object,axis='z',amplitude=.04,frequency=1,phase=0){
    if(!object)return;this.oscillators.push({object,axis,amplitude,frequency,phase,initial:object.position.clone()});
  }
  addLever(object,amplitude=.12,frequency=1,phase=0){
    if(!object)return;this.levers.push({object,amplitude,frequency,phase,initial:object.rotation.z});
  }
  collectMechanicalMotion(){
    for(const id of ['feeder-head','feeder-separation','feeder-suction-cups','feeder-head-linkage','feedboard-transport','vacuum-table'])this.addNodeRotors(id,-1,.72);
    this.addOscillator(this.template.findNode('feeder-suction-cups'),'y',.045,1.15,0);
    this.addOscillator(this.template.findNode('feeder-separation'),'x',.035,1.15,.4);
    this.addOscillator(this.template.findNode('feeder-head-linkage'),'x',.026,1.15,.75);
    this.addOscillator(this.template.findNode('feedboard-front-lays'),'y',.012,1.15,.55);

    const inkCodes=['13','2','1','14','3','4','5','6','7','8','9','10','11','12','15'],dampCodes=['16','17','FR','19','18'];
    for(let i=0;i<8;i++){
      const unitSign=i%2?-1:1;
      for(const type of ['plate','blanket','impression','transfer'])this.addRotor(largestCylinder(this.template.findNode(`press-${i}-cylinder-${type}-body`)),type==='blanket'||type==='transfer'?-unitSign:unitSign,1);
      this.addNodeRotors(`press-${i}-drive-gears`,unitSign,.94);
      this.addRotor(largestCylinder(this.template.findNode(`press-${i}-ink-fountain-roller-body`)),unitSign,.84);
      inkCodes.forEach((code,index)=>this.addRotor(largestCylinder(this.template.findNode(`press-${i}-ink-roller-${code}-body`)),index%2?-unitSign:unitSign,1.08));
      for(const code of ['A','B','C','D'])this.addRotor(largestCylinder(this.template.findNode(`press-${i}-ink-distributor-${code}-body`)),code.charCodeAt(0)%2?-unitSign:unitSign,.92);
      dampCodes.forEach((code,index)=>this.addRotor(largestCylinder(this.template.findNode(`press-${i}-damp-roller-${code}-body`)),index%2?-unitSign:unitSign,1.02));
      this.addNodeRotors(`press-${i}-impression-gripper`,unitSign,.90,{torus:false});
      this.addNodeRotors(`press-${i}-gripper-control`,-unitSign,.82,{torus:false});
      for(const code of ['A','B','C','D'])this.addOscillator(this.template.findNode(`press-${i}-ink-distributor-${code}`),'z',.045,.72,code.charCodeAt(0)*.37+i*.21);
      this.addOscillator(this.template.findNode(`press-${i}-ink-roller-15`),'x',.038,.92,i*.27);
      this.addOscillator(this.template.findNode(`press-${i}-damp-roller-FR`),'z',.028,.64,i*.31+.6);
      this.addOscillator(this.template.findNode(`press-${i}-impression-gripper`),'x',.010,1.12,i*.19);
      this.addLever(firstLever(this.template.findNode(`press-${i}-gripper-control`)),.10,1.12,i*.19);
    }

    for(let n=1;n<=7;n++){
      const base=`transfer-pu${n}-pu${n+1}`;
      this.addRotor(largestCylinder(this.template.findNode(base)),n%2?-1:1,.88);
      this.addNodeRotors(`${base}-gripper-shaft`,1,.95);
      this.addNodeRotors(`${base}-gripper-cam`,-1,.82);
      this.addLever(firstLever(this.template.findNode(`${base}-gripper-cam`)),.16,.88,n*.28);
      for(const suffix of ['a','b']){
        const object=this.template.findNode(`${base}-gripper-${suffix}`);if(!object)continue;
        this.gripperMotions.push({object,initial:object.position.clone(),frequency:.88,phase:(suffix==='a'?0:Math.PI)+n*.28,amplitudeX:.060,amplitudeY:.040});
      }
    }

    for(const id of ['coater-chamber','coater-chamber-locks','dryer-sheet-path','dryer-ventilation','delivery-sheet-brake','delivery-drive-sprockets','delivery-chain-tensioners','delivery-pile-lift'])this.addNodeRotors(id,1,.78);
    const joggers=this.template.findNode('delivery-joggers');
    joggers?.traverse(object=>{
      if(!object.isMesh||object.geometry?.type!=='BoxGeometry')return;
      this.joggerMotions.push({object,initial:object.position.clone(),amplitude:.016,phase:object.position.z<0?0:Math.PI});
    });
  }
  collectInkSurfaces(){
    for(let i=0;i<8;i++){
      const color=new THREE.Color(UNIT_COLORS[i]),ids=[
        `press-${i}-ink-fountain-roller-body`,`press-${i}-inking-train`,`press-${i}-inking-distribution`,
        `press-${i}-cylinder-plate-body`,`press-${i}-cylinder-blanket-body`
      ],seen=new Set();
      for(const id of ids)this.template.findNode(id)?.traverse(mesh=>{
        if(!mesh.isMesh||seen.has(mesh.material))return;seen.add(mesh.material);
        const m=mesh.material;if(!m?.emissive)return;
        this.inkSurfaces.push({material:m,color,initialEmissive:m.emissive.clone(),initialIntensity:m.emissiveIntensity});
      });
    }
  }
  applyInkFilm(on){
    for(const surface of this.inkSurfaces){
      if(on){surface.material.emissive.copy(surface.color);surface.material.emissiveIntensity=.20;}
      else{surface.material.emissive.copy(surface.initialEmissive);surface.material.emissiveIntensity=surface.initialIntensity;}
      surface.material.needsUpdate=true;
    }
  }
  collectUVSystem(){
    const uv=this.template.findNode('dryer-uv-system');
    uv?.traverse(mesh=>{
      if(!mesh.isMesh)return;
      if(mesh.userData.uvLamp)this.uvLamps.push({mesh,material:mesh.material,count:mesh.userData.uvElementCount||1,initialEmissive:mesh.material.emissive.clone(),initialIntensity:mesh.material.emissiveIntensity});
      if(mesh.userData.uvBeam)this.uvBeams.push({mesh,material:mesh.material,count:mesh.userData.uvElementCount||1,initialVisible:mesh.visible,initialOpacity:mesh.material.opacity,initialIntensity:mesh.material.emissiveIntensity});
    });
  }
  setUV(active,intensity=1){
    this.uvActive=!!active;
    for(const lamp of this.uvLamps){
      lamp.material.emissive.setHex(0x6c42ff);
      lamp.material.emissiveIntensity=this.uvActive?2.2*intensity:.08;
      lamp.material.needsUpdate=true;
    }
    for(const beam of this.uvBeams){
      beam.mesh.visible=this.uvActive;
      beam.material.opacity=this.uvActive?.15+.09*intensity:beam.initialOpacity;
      beam.material.emissiveIntensity=this.uvActive?1.1*intensity:beam.initialIntensity;
      beam.material.needsUpdate=true;
    }
  }
  restoreUV(){
    this.uvActive=false;
    for(const lamp of this.uvLamps){lamp.material.emissive.copy(lamp.initialEmissive);lamp.material.emissiveIntensity=lamp.initialIntensity;lamp.material.needsUpdate=true;}
    for(const beam of this.uvBeams){beam.mesh.visible=beam.initialVisible;beam.material.opacity=beam.initialOpacity;beam.material.emissiveIntensity=beam.initialIntensity;beam.material.needsUpdate=true;}
  }
  state(){
    const visible=this.sheets.filter(s=>s.mesh.visible),leading=visible.sort((a,b)=>b.userData.progress-a.userData.progress)[0],p=leading?.userData.leadPosition||this.points[0];
    return {
      active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,stage:stageForX(p.x),completed:this.completed,pathLength:this.pathLength,
      pathVisible:this.pathVisible,inkFlowVisible:this.inkFlowVisible,progress:leading?.userData.progress||0,sheetsVisible:visible.length,
      rotorCount:this.rotors.length,oscillatorCount:this.oscillators.length+this.levers.length+this.gripperMotions.length+this.joggerMotions.length,
      mechanismCount:this.rotors.length+this.oscillators.length+this.levers.length+this.gripperMotions.length+this.joggerMotions.length,
      inkFlowCount:this.fluidFlows.length,pileSheetsVisible:this.pileSheets.filter(sheet=>sheet.mesh.visible).length,uvLampCount:this.uvLamps.reduce((sum,item)=>sum+item.count,0),uvBeamCount:this.uvBeams.reduce((sum,item)=>sum+item.count,0),uvActive:this.uvActive
    };
  }
  emit(force=false){
    const now=performance?.now?.()||Date.now();if(!force&&now<this.emitAt)return;this.emitAt=now+120;this.onUpdate?.(this.state());
  }
  start(){
    if(!this.active){this.elapsed=0;this.completed=0;this.resetDeliveryPile();}
    this.refreshDeliveryPileAnchor();
    this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;this.applyInkFilm(true);this.emit(true);return this.state();
  }
  pause(){if(this.active){this.running=false;this.lastNow=null;this.emit(true);}return this.state();}
  resume(){if(this.active){this.running=true;this.lastNow=null;this.emit(true);}return this.state();}
  stop(){
    this.active=false;this.running=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.group.visible=false;
    for(const sheet of this.sheets){sheet.mesh.visible=false;sheet.gripper.visible=false;sheet.userData.progress=0;sheet.userData.leadDistance=0;sheet.userData.lastDeliveryCycle=-1;this.setSheetColors(sheet,0);}
    this.resetDeliveryPile();
    for(const rotor of this.rotors)rotor.mesh.quaternion.copy(rotor.initial);
    for(const item of this.oscillators)item.object.position.copy(item.initial);
    for(const item of this.levers)item.object.rotation.z=item.initial;
    for(const item of this.gripperMotions)item.object.position.copy(item.initial);
    for(const item of this.joggerMotions)item.object.position.copy(item.initial);
    this.applyInkFilm(false);this.restoreUV();this.emit(true);return this.state();
  }
  setSpeed(value){this.speed=clamp(Number(value)||1,.35,2);this.emit(true);return this.state();}
  setPathVisible(on){this.pathVisible=!!on;this.pathLine.visible=this.pathVisible;this.emit(true);return this.state();}
  setInkFlowVisible(on){
    this.inkFlowVisible=!!on;
    for(const flow of this.fluidFlows){flow.tube.visible=this.inkFlowVisible;for(const particle of flow.particles)particle.visible=this.inkFlowVisible;}
    this.emit(true);return this.state();
  }
  update(now){
    if(!this.active)return;
    if(!this.running){this.lastNow=now;return;}
    if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min(Math.max((now-this.lastNow)/1000,0),.05);this.lastNow=now;
    const scaled=dt*this.speed;this.elapsed+=scaled;
    const travelled=this.elapsed*this.baseMetersPerSecond;

    let dryerOccupied=false;
    const dryerLeft=D.dryerCenterX-D.dryerLength/2-.12,dryerRight=D.dryerCenterX+D.dryerLength/2+.12;
    for(let i=0;i<this.sheets.length;i++){
      const sheet=this.sheets[i],absolute=travelled-i*this.sheetGapMeters;
      if(absolute<this.sheetLength){sheet.mesh.visible=false;sheet.gripper.visible=false;continue;}
      const cycle=Math.floor(absolute/this.cycleDistance),local=mod(absolute,this.cycleDistance);
      if(local>this.pathLength){
        this.depositSheet(sheet,cycle);
        continue;
      }
      if(!this.updateSheet(sheet,local))continue;
      const a=sheet.userData.trailPosition.x,b=sheet.userData.leadPosition.x;
      if(b>=dryerLeft&&a<=dryerRight)dryerOccupied=true;
    }

    const angular=5.0*scaled;
    for(const rotor of this.rotors)rotor.axis==='z'?rotor.mesh.rotateZ(rotor.sign*rotor.rate*angular):rotor.mesh.rotateY(rotor.sign*rotor.rate*angular);
    const phase=this.elapsed*TAU;
    for(const item of this.oscillators)item.object.position[item.axis]=item.initial[item.axis]+Math.sin(phase*item.frequency+item.phase)*item.amplitude;
    for(const item of this.levers)item.object.rotation.z=item.initial+Math.sin(phase*item.frequency+item.phase)*item.amplitude;
    for(const item of this.gripperMotions){
      const a=phase*item.frequency+item.phase;item.object.position.x=item.initial.x+Math.sin(a)*item.amplitudeX;item.object.position.y=item.initial.y+Math.cos(a)*item.amplitudeY;
    }
    for(const item of this.joggerMotions)item.object.position.z=item.initial.z+Math.sin(phase*1.05+item.phase)*item.amplitude;

    if(this.inkFlowVisible){
      for(const flow of this.fluidFlows){
        for(let i=0;i<flow.particles.length;i++){
          const t=mod(this.elapsed*flow.speed+flow.phase+i/flow.particles.length,1),p=flow.curve.getPointAt(t);
          flow.particles[i].position.copy(p);
          const pulse=.78+.22*Math.sin(phase*1.35+i*.85+flow.phase);
          if(flow.type==='ink-drip')flow.particles[i].scale.set(.72*pulse,1.85*pulse,.72*pulse);
          else flow.particles[i].scale.setScalar(pulse);
        }
      }
    }

    const uvPulse=.82+.18*Math.sin(phase*1.8);
    this.setUV(dryerOccupied,uvPulse);
    this.emit(false);
  }
  dispose(){
    this.stop();this.machine.remove(this.group);for(const g of this.geometries)g.dispose();for(const m of this.materials)m.dispose();
  }
}

export const PRINTING_SIMULATION_STAGES=Object.freeze([
  'Feeder','Register / Feed Table','Printing Unit 1','Printing Unit 2','Printing Unit 3','Printing Unit 4',
  'Printing Unit 5','Printing Unit 6','Printing Unit 7','Printing Unit 8','Coating Unit','Dryer / Extension','Inline Inspection','Delivery'
]);

export const INK_SIMULATION_SEQUENCE=Object.freeze([
  'Ink fountain / zone metering','Tetesan tinta ke ductor / vibrator','Transfer roller train','Distributor A–D oscillation',
  'Form rollers','Plate cylinder','Blanket cylinder','Sheet'
]);
