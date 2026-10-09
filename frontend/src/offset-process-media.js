import * as THREE from 'three';
const COLORS=[0x00bade,0xe73791,0xffd32a,0x31343b,0xff7e27,0x34bb70,0x9274e7,0x8299ac];
// Short, component-attached process markers. These show flow, not installed pipe routing or leaks.
export function attachOffsetProcessMedia(sim,template){
 const flows=[],resources=[];let enabled=true,elapsed=0,lastNow=null;
 template.root.updateMatrixWorld(true);
 const nodes=template.nodes||[];
 const inkNodes=nodes.filter(n=>/^(press-\d+-open-ink-bay|o10-pu\d+-ink-fountain|offset[89]-pu\d+-ink-fountain)$/.test(n.userData.nodeId||''));
 // Offset 8 has a combined inking node rather than a separate fountain.
 if(!inkNodes.length)inkNodes.push(...nodes.filter(n=>/^offset8-pu\d+-inking$/.test(n.userData.nodeId||'')));
 const dampNodes=nodes.filter(n=>/^(press-\d+-damp-roller-18-body|o10-pu\d+-dampening|offset[89]-pu\d+-dampening)$/.test(n.userData.nodeId||''));
 const airNodes=nodes.filter(n=>/^(press-\d+-air-blower-nip|o10-pu\d+-cylinders|offset[89]-pu\d+-cylinders)$/.test(n.userData.nodeId||''));
 function add(node,kind,color,index){
  const box=new THREE.Box3().setFromObject(node);if(box.isEmpty())return;
  const center=node.worldToLocal(box.getCenter(new THREE.Vector3()));
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12),3));
  const material=new THREE.PointsMaterial({color,size:kind==='air'?.022:.026,transparent:true,opacity:kind==='air'?.75:.95,depthWrite:false,sizeAttenuation:true});
  const points=new THREE.Points(geometry,material);points.name=`PROCESS-${kind.toUpperCase()}-FLOW`;
  Object.assign(points.userData,{processMedium:kind,processIndicator:true,installedRoutingVerified:false,unit:index+1});points.visible=false;points.raycast=()=>{};node.add(points);
  flows.push({node,points,center,kind,index});resources.push(geometry,material);
 }
 inkNodes.forEach((n,i)=>add(n,'ink',COLORS[i%8],i));dampNodes.forEach((n,i)=>add(n,'dampening-water',0x43cfff,i));airNodes.forEach((n,i)=>add(n,'air',0xf0f9ff,i));
 function sync(now){
  if(lastNow!==null&&sim.active&&sim.running)elapsed+=Math.min(.05,Math.max(0,(now-lastNow)/1000))*(sim.speed||1);lastNow=now;
  for(const flow of flows){
   flow.points.visible=!!sim.active&&enabled&&(flow.kind==='ink'||template.exteriorOpen===true);
   const a=flow.points.geometry.attributes.position;
   for(let j=0;j<4;j++){
    const t=(elapsed*.65+j/4+flow.index*.13)%1,c=flow.center;
    // Stay within 90 mm of the identified component; no tray, hose or remote fluid source is created.
    a.setXYZ(j,c.x+(flow.kind==='air'?.09*t:0),c.y+(flow.kind==='air'?0:.045-.09*t),c.z-.30+j*.20);
   }
   a.needsUpdate=true;flow.points.geometry.computeBoundingBox();flow.points.geometry.computeBoundingSphere();
  }
 }
 sync(0);
 const update=sim.update.bind(sim),stop=sim.stop.bind(sim),dispose=sim.dispose.bind(sim),toggle=sim.setInkFlowVisible?.bind(sim);
 sim.update=now=>{update(now);sync(now)};
 sim.stop=(...args)=>{const result=stop(...args);elapsed=0;lastNow=null;sync(0);return result};
 sim.setInkFlowVisible=on=>{enabled=!!on;toggle?.(on);sync(lastNow||0);return sim.state()};
 sim.dispose=()=>{flows.forEach(f=>f.points.removeFromParent());resources.forEach(r=>r.dispose());dispose()};
 sim.processMedia={flows,sync,get enabled(){return enabled}};
 return sim;
}
