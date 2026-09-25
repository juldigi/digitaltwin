import {buildActualFactory} from './factory-building.js';
import {sceneIdentity} from './scene-editor-state.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { cadToWorld } from './model.js';
import { plantDisplayPoint } from './data/plant-layout-data.js';
import {RENDER_PROFILES,resolveProfile,configureRenderer} from './render/render-config.js';
import {createIndustrialLighting} from './render/lighting-system.js';
import {createIndustrialMaterial} from './render/material-library.js';
import {AdaptiveQuality} from './render/adaptive-quality.js';

import {OffsetMachineTemplate} from './offset5.js';
import {PrintingSimulation} from './simulation.js';
import {FOUNDATION_SCOPE,canOpenTechnical3D} from './data/foundation-scope.js';
export {OffsetMachineTemplate};
const normalizeFoundationMachineKey=key=>{const raw=String(key??'').trim();return raw==='BMJ-MCH-0003'?'offset5':raw||null;};

const neutralSimulation=()=>({
 active:false,onUpdate:null,
 update(){},start(){return this.state()},pause(){return this.state()},resume(){return this.state()},stop(){return this.state()},
 setSpeed(){return this.state()},setPathVisible(){return this.state()},setInkFlowVisible(){return this.state()},
 state(){return{available:false,blocked:true,blockedReason:'Pilih mesin untuk menjalankan simulasi.',active:false,running:false,paused:false,speed:1,stage:null,completed:0,progress:0,sheetsVisible:0,rotorCount:0}},
 dispose(){}
});
const neutralTemplate=()=>{
 const root=new THREE.Group();root.name='Factory context';root.visible=false;root.userData={semantic:'FACTORY_CONTEXT'};
 return{
  root,taxonomy:[],taxonomyById:new Map(),
  reset(){},resolvePart(){return null},findNode(){return null},resolveTaxonomyNode(){return null},
  setLow(){},highlight(){},ghost(){},explode(){},isolate(){},dispose(){}
 };
};

function buildLowDetailFactory(layout,fleet){
  const root=new THREE.Group();root.name='BMJ · mobile low-detail factory';
  const layers={};
  for(const name of ['building','roof','machines','labels','landscape','reference','unidentified','utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors']){
    layers[name]=new THREE.Group();layers[name].name=name;root.add(layers[name]);
  }
  layers.roof.visible=false;layers.labels.visible=false;layers.landscape.visible=false;layers.reference.visible=false;
  for(const name of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])layers[name].visible=false;
  const assets=new Map(),boxGeo=new THREE.BoxGeometry(1,1,1);
  const machineMaterial=createIndustrialMaterial('paintedSteel',{color:0xb8c8d2,roughness:.8,metalness:.12});
  const unidentifiedMaterial=new THREE.MeshStandardMaterial({color:0xc9bea4,roughness:.9,metalness:0});
  const assetPoints=[];
  for(const f of fleet||[]){
    const p=f?.placement||{},size=Array.isArray(f?.size)?f.size:[2,1,2];
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
    const w=Math.max(.25,Number(size[0])||2),h=Math.max(.35,Number(size[1])||1),d=Math.max(.25,Number(size[2])||2);
    const g=new THREE.Group();g.name=p.label||p.machineId||'Machine';g.position.set(p.x,0,-p.y);g.rotation.y=(Number(p.rotation)||0)*Math.PI/180;
    g.userData={machineId:p.machineId,placementStatus:p.status,foundationScope:canOpenTechnical3D(p.machineId)?'TECHNICAL_ASSET':'LAYOUT_PLACEHOLDER',mobileProxy:true};
    const mesh=new THREE.Mesh(boxGeo,p.status==='UNIDENTIFIED'?unidentifiedMaterial:machineMaterial);mesh.position.y=h/2;mesh.scale.set(w,h,d);mesh.userData={machineId:p.machineId,mobileProxy:true};mesh.receiveShadow=false;mesh.castShadow=false;g.add(mesh);
    (p.status==='UNIDENTIFIED'?layers.unidentified:layers.machines).add(g);if(p.machineId)assets.set(p.machineId,g);
    assetPoints.push([p.x-w/2,-p.y-d/2],[p.x+w/2,-p.y+d/2]);
  }
  const walls=Array.isArray(layout?.actual?.walls)?layout.actual.walls:[];
  const wallSpecs=[];
  for(const wall of walls){
    const a=wall?.a,b=wall?.b;if(!Array.isArray(a)||!Array.isArray(b))continue;
    const ax=Number(a[0]),az=-Number(a[1]),bx=Number(b[0]),bz=-Number(b[1]);if(![ax,az,bx,bz].every(Number.isFinite))continue;
    const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);if(len<.08)continue;
    wallSpecs.push({x:(ax+bx)/2,z:(az+bz)/2,len,angle:-Math.atan2(dz,dx),width:Math.max(.06,Number(wall.width)||.12)});
    assetPoints.push([ax,az],[bx,bz]);
  }
  if(wallSpecs.length){
    const wallMat=new THREE.MeshStandardMaterial({color:0x9aadb7,roughness:.92,metalness:0}),instanced=new THREE.InstancedMesh(boxGeo,wallMat,wallSpecs.length),dummy=new THREE.Object3D();
    wallSpecs.forEach((w,i)=>{dummy.position.set(w.x,2.25,w.z);dummy.rotation.set(0,w.angle,0);dummy.scale.set(w.len,4.5,w.width);dummy.updateMatrix();instanced.setMatrixAt(i,dummy.matrix);});instanced.instanceMatrix.needsUpdate=true;instanced.receiveShadow=false;instanced.castShadow=false;layers.building.add(instanced);
  }
  if(assetPoints.length){
    let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const [x,z] of assetPoints){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);}
    const floor=new THREE.Mesh(new THREE.BoxGeometry(Math.max(10,maxX-minX+8),.08,Math.max(10,maxZ-minZ+8)),createIndustrialMaterial('factoryConcrete',{color:0xdfe7eb}));
    floor.position.set((minX+maxX)/2,-.04,(minZ+maxZ)/2);floor.receiveShadow=false;layers.building.add(floor);
  }
  root.userData={baselineId:layout?.baselineId||null,mobileLowDetail:true,renderStatus:'MOBILE_LOW_DETAIL_FACTORY_PROXY'};
  return {root,layers,assets,update(){},dispose(){}};
}


export class FactoryEngine {
  constructor(container,onSelect){
    const mobileRender=matchMedia('(max-width:767px)').matches||matchMedia('(pointer:coarse)').matches;
    this.container=container;this.onSelect=onSelect;this.onTaxonomySelect=null;this.view='factory';this.layout=null;this.low=mobileRender;this.mobileRender=mobileRender;this.renderFaulted=false;this.labels=true;this.isolated=false;this.partLabelEntries=[];
    {const params=new URLSearchParams(location.search),requested=normalizeFoundationMachineKey(params.get('machine')||params.get('asset'));this.requestedMachineKey=requested;this.machineKey=null;}
    this.renderer=new THREE.WebGLRenderer({antialias:!mobileRender,alpha:false,powerPreference:mobileRender?'low-power':'high-performance',stencil:false,preserveDrawingBuffer:false});
    this.capabilities={mobile:mobileRender,memory:navigator.deviceMemory||4,cores:navigator.hardwareConcurrency||4,maxTextureSize:this.renderer.capabilities.maxTextureSize};
    this.requestedQuality='auto';this.qualityProfile=resolveProfile('auto',this.capabilities);
    this.adaptiveQuality=new AdaptiveQuality(()=>{if(this.requestedQuality==='auto'&&this.qualityProfile!=='hemat')this.applyQualityProfile('hemat');});
    configureRenderer(this.renderer,{profile:this.qualityProfile,devicePixelRatio});
    container.appendChild(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Digital Twin 3D Pabrik Packaging Offset. Pilih mesin untuk membuka model detail.');this.renderer.domElement.setAttribute('tabindex','0');
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xe8eef2);
    this.camera=new THREE.PerspectiveCamera(38,1,.05,1e7);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.minDistance=.4;this.controls.maxDistance=1e7;this.controls.maxPolarAngle=Math.PI*.495;
    this.controls.addEventListener('start',()=>this.transition=null);
    this.lighting=createIndustrialLighting(this.scene);this.key=this.lighting.key;
    configureRenderer(this.renderer,{profile:this.qualityProfile,devicePixelRatio,shadowLight:this.key});
    this.studio=new THREE.Group();this.studio.name='Inspection studio — not factory';
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=.01;this.studio.add(floor);
    const grid=new THREE.GridHelper(150,100,0xd4dfe5,0xdce5ea);grid.material.transparent=true;grid.material.opacity=.38;this.studio.add(grid);this.scene.add(this.studio);
    this.template=neutralTemplate();this.machine=this.template.root;this.scene.add(this.machine);
    this.simulation=neutralSimulation();this.simulation.onUpdate=state=>this.onSimulationUpdate?.(state);
    this.factory=new THREE.Group();this.scene.add(this.factory);this.factorySelectionId=null;this.factorySelectionHelper=null;
    this.gizmo=new TransformControls(this.camera,this.renderer.domElement);this.scene.add(this.gizmo.getHelper());this.gizmo.addEventListener('dragging-changed',e=>{this.controls.enabled=!e.value;});this.gizmo.addEventListener('objectChange',()=>{if(!this.sceneEditing&&this.gizmo.mode==='scale')this.machine.scale.setScalar(Math.max(.0001,this.machine.scale.x));this.onTransform?.();this.onSceneTransform?.();});
    this.ray=new THREE.Raycaster();this.down=null;this.renderer.domElement.addEventListener('dblclick',()=>{if(this.sceneEditing)return;this.template.reset();this.clearPartLabels();this.isolated=false;if(this.view==='factory'){this.clearFactorySelection();this.fit(this.factory);}else this.fit(this.machine);this.onReset?.();});
    this.renderer.domElement.addEventListener('pointerdown',e=>this.down=[e.clientX,e.clientY]);
    this.renderer.domElement.addEventListener('pointerup',e=>{if(!this.down||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>5||this.gizmo.dragging||this.simulation?.active)return;const r=this.renderer.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);if(this.sceneEditing){const hit=this.ray.intersectObject(this.view==='machine'?this.machine:this.factory,true).find(h=>this.isObjectVisible(h.object));if(hit){let node=hit.object;while(node&&!this.sceneObjectIds?.has(node))node=node.parent;if(node)this.selectSceneObject(this.sceneObjectIds.get(node));}return;}if(this.view==='factory'&&this.actualFactory){const hit=this.ray.intersectObjects([...this.actualFactory.assets.values()],true).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit)this.onFactorySelect?.(hit.object.userData.machineId);return;}const hit=this.ray.intersectObject(this.machine,true).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit&&this.machine.visible){const part=this.template.resolvePart(hit.object);if(part)this.onSelect(part);}});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
    this.last=0;this.render=this.render.bind(this);this.studio.visible=false;this.resize();this.frame=requestAnimationFrame(this.render);
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.renderFaulted=true;this.onError?.('Konteks grafis terputus. Tampilan dialihkan ke denah 2D agar navigasi tetap dapat digunakan.');});
    this.renderer.domElement.addEventListener('webglcontextrestored',()=>{this.renderFaulted=false;this.setQualityProfile(this.requestedQuality);this.resize();this.onRecovered?.();});
  }
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  framingProfile(object=this.machine){const portrait=this.container.clientWidth<=767&&this.container.clientHeight>this.container.clientWidth;const machine=object===this.machine&&this.view==='machine';return {portrait,machine,padding:portrait&&machine?1.06:1.18,targetLift:portrait&&machine?-.08:0};}
  fit(object=this.machine,mode='iso',animate=true){
    object.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(object);if(box.isEmpty())return;
    const c=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),profile=this.framingProfile(object);
    c.y+=size.y*profile.targetLift;
    const radius=Math.max(size.length()*.5,.5),v=this.camera.fov*Math.PI/360,h=Math.atan(Math.tan(v)*this.camera.aspect),distance=radius/Math.sin(Math.min(v,h))*profile.padding;
    // Verified operator-side view: near delivery (+X), walkway side (-Z).
    const direction=mode==='top'?new THREE.Vector3(0,1,.0001):new THREE.Vector3(.85,.7,-1.25).normalize();
    const end=c.clone().addScaledVector(direction,distance);
    if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){this.controls.target.copy(c);this.camera.position.copy(end);this.controls.update();return;}
    this.transition={start:performance.now(),from:this.camera.position.clone(),to:end,fromTarget:this.controls.target.clone(),target:c};
  }
  fitObjects(objects=[],mode='iso',animate=true){
    const list=(objects||[]).filter(Boolean),box=new THREE.Box3();
    for(const object of list){object.updateWorldMatrix(true,true);const partBox=new THREE.Box3().setFromObject(object);if(!partBox.isEmpty())box.union(partBox);}
    if(box.isEmpty())return;
    const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),profile=this.framingProfile(list.length===1?list[0]:null);center.y+=size.y*profile.targetLift;const radius=Math.max(size.length()*.5,.5),v=this.camera.fov*Math.PI/360,h=Math.atan(Math.tan(v)*this.camera.aspect),distance=radius/Math.sin(Math.min(v,h))*profile.padding;
    const direction=mode==='top'?new THREE.Vector3(0,1,.0001):new THREE.Vector3(.85,.7,-1.25).normalize(),end=center.clone().addScaledVector(direction,distance);
    if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){this.controls.target.copy(center);this.camera.position.copy(end);this.controls.update();return;}
    this.transition={start:performance.now(),from:this.camera.position.clone(),to:end,fromTarget:this.controls.target.clone(),target:center};
  }
  render(now){this.frame=requestAnimationFrame(this.render);if(this.renderFaulted||document.hidden||now-this.last<RENDER_PROFILES[this.qualityProfile].frameInterval)return;this.last=now;
    try{
      this.simulation?.update(now);
      if(this.view==='factory')this.actualFactory?.update?.(now);
      if(this.transition){const t=Math.min((now-this.transition.start)/RENDER_PROFILES[this.qualityProfile].cameraMs,1),e=t*t*(3-2*t),a=this.transition;this.camera.position.lerpVectors(a.from,a.to,e);this.controls.target.lerpVectors(a.fromTarget,a.target,e);if(t===1)this.transition=null;}
      this.controls.update();this.renderer.render(this.scene,this.camera);if(this.requestedQuality==='auto'&&!document.hidden)this.adaptiveQuality.frame(now);this.updateLabel();if(!this.low){try{this.updatePartLabels();}catch(error){console.warn('[Digital Twin labels disabled after overlay error]',error);this.clearPartLabels();}}
    }catch(error){this.renderFaulted=true;console.error('[Digital Twin renderer]',error);this.onError?.('Render 3D terhenti. Tampilan dialihkan ke denah 2D agar menu tetap dapat digunakan.');}
  }
  updateLabel(){const el=document.getElementById('machine-label');if(!el)return;el.hidden=!this.labels||!this.machine.visible;if(el.hidden)return;this.machine.updateWorldMatrix(true,true);const p=new THREE.Vector3(0,2.9,0).applyMatrix4(this.machine.matrixWorld);const distance=p.distanceTo(this.camera.position);p.project(this.camera);if(p.z>1||p.z< -1||Math.abs(p.x)>.97||Math.abs(p.y)>.94){el.hidden=true;return;}el.style.left=((p.x*.5+.5)*this.container.clientWidth)+'px';el.style.top=((-p.y*.5+.5)*this.container.clientHeight)+'px';document.getElementById('label-detail').hidden=distance>80;}
  clearPartLabels(){
    this.partLabelEntries=[];const layer=document.getElementById('part-label-layer');if(!layer)return;
    layer.hidden=true;layer.querySelector('.part-label-items')?.replaceChildren();layer.querySelector('svg')?.replaceChildren();
    const nav=layer.querySelector('.part-label-nav'),back=layer.querySelector('[data-part-label-back]');if(nav)nav.hidden=true;if(back)back.onclick=null;
  }
  taxonomyNodes(meta,fallbackPart=null){
    if(!meta)return fallbackPart?[fallbackPart]:[];
    const exact=(meta.meshRefs||[]).map(ref=>this.template.findNode(ref)).filter(Boolean);
    if(exact.length)return [...new Set(exact)];
    const descendants=[];for(const candidate of this.template.taxonomy){
      let p=candidate;while(p?.parentId){if(p.parentId===meta.id){descendants.push(candidate);break;}p=this.template.taxonomyById.get(p.parentId);}
    }
    const inherited=[];for(const child of descendants)for(const ref of child.meshRefs||[]){const node=this.template.findNode(ref);if(node&&!inherited.includes(node))inherited.push(node);}
    return inherited.length?inherited:(fallbackPart?[fallbackPart]:[]);
  }
  setPartLabels(part,taxonomyId=null){
    this.clearPartLabels();if(!part||this.view!=='machine'||this.low||matchMedia('(max-width:767px)').matches)return;
    const layer=document.getElementById('part-label-layer'),items=layer?.querySelector('.part-label-items'),svg=layer?.querySelector('svg');if(!layer||!items||!svg)return;
    const selectedMeta=taxonomyId?this.template.taxonomyById.get(taxonomyId):null,direct=selectedMeta?this.template.taxonomy.filter(n=>n.parentId===selectedMeta.id):[];
    const candidates=[],addMeta=(meta,selected=false)=>{
      const nodes=this.taxonomyNodes(meta,part);if(!nodes.length)return;
      const mapped=(meta.meshRefs||[]).some(ref=>!!this.template.findNode(ref)),childCount=this.template.taxonomy.filter(n=>n.parentId===meta.id).length;
      candidates.push({nodes,node:nodes[0],meta,name:meta.name,selected,mapped,childCount});
    };
    if(selectedMeta){addMeta(selectedMeta,true);for(const meta of direct)addMeta(meta,false);}
    if(!candidates.length){
      const children=part.children.filter(child=>child.userData.selectable),fallback=children.length?children:[part];
      for(const node of fallback)candidates.push({nodes:[node],node,meta:null,name:node.name||node.userData.nodeId||'Komponen',selected:node===part,mapped:true,childCount:0});
    }
    const limit=matchMedia('(max-width:767px)').matches?8:16,selected=candidates.filter(x=>x.selected),others=candidates.filter(x=>!x.selected).slice(0,Math.max(0,limit-selected.length));
    for(const [index,item] of [...selected,...others].entries()){
      const label=document.createElement('button');label.type='button';label.className='part-label'+(item.selected?' is-selected':'')+(!item.mapped?' is-reference':'');label.title=item.name;
      const name=document.createElement('span');name.className='part-label-name';name.textContent=item.name;label.append(name);
      const meta=document.createElement('span');meta.className='part-label-meta';meta.textContent=item.meta?('L'+item.meta.level+(item.childCount?' · buka detail':item.mapped?' · komponen':' · referensi')):'Komponen 3D';label.append(meta);
      if(item.meta){
        label.dataset.taxonomyId=item.meta.id;label.setAttribute('aria-label',item.name+', tingkat '+item.meta.level+(item.childCount?', buka detail berikutnya':''));
        label.addEventListener('pointerdown',event=>event.stopPropagation());
        label.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();this.onTaxonomySelect?.(item.meta.id);});
      }else label.disabled=true;
      const line=document.createElementNS('http://www.w3.org/2000/svg','line'),dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',item.selected?'4.5':'3.5');
      if(item.selected){line.classList.add('is-selected-line');dot.classList.add('is-selected-dot');}else if(!item.mapped){line.classList.add('is-reference-line');dot.classList.add('is-reference-dot');}
      svg.append(line,dot);items.append(label);this.partLabelEntries.push({...item,index,label,line,dot});
    }
    const nav=layer.querySelector('.part-label-nav'),back=layer.querySelector('[data-part-label-back]'),stage=layer.querySelector('[data-part-label-stage]');
    if(selectedMeta&&nav){nav.hidden=false;if(stage)stage.textContent='L'+selectedMeta.level+' · '+selectedMeta.name;if(back){back.hidden=!selectedMeta.parentId;back.onclick=selectedMeta.parentId?(event=>{event.preventDefault();event.stopPropagation();this.onTaxonomySelect?.(selectedMeta.parentId);}):null;}}
    layer.hidden=!this.partLabelEntries.length;this.updatePartLabels();
  }
  updatePartLabels(){
    const layer=document.getElementById('part-label-layer');if(!layer||!this.partLabelEntries.length){if(layer)layer.hidden=true;return;}
    layer.hidden=!this.labels||!this.machine.visible||this.view!=='machine';if(layer.hidden)return;
    this.machine.updateWorldMatrix(true,true);const w=this.container.clientWidth,h=this.container.clientHeight,placed=[];
    for(const entry of this.partLabelEntries){
      const visibleNodes=entry.nodes.filter(node=>node.visible);if(!visibleNodes.length){entry.label.hidden=entry.line.hidden=entry.dot.hidden=true;continue;}
      const box=new THREE.Box3();let hasBox=false;for(const node of visibleNodes){const nodeBox=new THREE.Box3().setFromObject(node);if(!nodeBox.isEmpty()){box.union(nodeBox);hasBox=true;}}
      const world=hasBox?box.getCenter(new THREE.Vector3()):visibleNodes[0].getWorldPosition(new THREE.Vector3()),projected=world.clone().project(this.camera);
      const visible=projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<=1.08&&Math.abs(projected.y)<=1.08;
      entry.label.hidden=entry.line.hidden=entry.dot.hidden=!visible;if(!visible)continue;
      const anchorX=(projected.x*.5+.5)*w,anchorY=(-projected.y*.5+.5)*h,ring=Math.floor(entry.index/2),side=entry.index%2===0?-1:1;
      let labelX=entry.selected?anchorX:anchorX+side*(96+ring*18),labelY=entry.selected?anchorY-44:anchorY-28-ring*25;
      labelX=Math.max(92,Math.min(w-92,labelX));labelY=Math.max(52,Math.min(h-16,labelY));
      for(const prior of placed)if(Math.abs(labelX-prior.x)<165&&Math.abs(labelY-prior.y)<34)labelY=Math.min(h-16,prior.y+35);
      placed.push({x:labelX,y:labelY});entry.label.style.left=labelX+'px';entry.label.style.top=labelY+'px';
      entry.line.setAttribute('x1',String(labelX));entry.line.setAttribute('y1',String(labelY+3));entry.line.setAttribute('x2',String(anchorX));entry.line.setAttribute('y2',String(anchorY));entry.dot.setAttribute('cx',String(anchorX));entry.dot.setAttribute('cy',String(anchorY));
    }
  }
  startPrintingSimulation(){return this.simulation?.start();}
  pausePrintingSimulation(){return this.simulation?.pause();}
  resumePrintingSimulation(){return this.simulation?.resume();}
  stopPrintingSimulation(){return this.simulation?.stop();}
  setPrintingSimulationSpeed(value){return this.simulation?.setSpeed(value);}
  setPrintingSimulationPathVisible(on){return this.simulation?.setPathVisible(on);}
  setPrintingSimulationInkFlowVisible(on){return this.simulation?.setInkFlowVisible(on);}
  getPrintingSimulationState(){return this.simulation?.state()||{available:false,blocked:true,blockedReason:'Simulasi belum tersedia untuk aset ini.',active:false,running:false,paused:false,speed:1,stage:null,completed:0,progress:0,sheetsVisible:0,rotorCount:0};}
  isPrintingSimulationActive(){return !!this.simulation?.active;}
  setView(view,state){if(view!=='machine'&&this.simulation?.active)this.simulation.stop();this.view=view;if(!this.sceneEditing)this.gizmo.detach();this.template.reset();this.clearPartLabels();this.isolated=false;this.machine.position.set(0,0,0);this.machine.rotation.set(0,0,0);this.machine.scale.setScalar(1);this.studio.visible=view==='machine';this.factory.visible=view==='factory';if(this.factorySelectionHelper)this.factorySelectionHelper.visible=view==='factory';
    if(view==='factory')this.applyPlacement(state,this.layout||state.layout);else{this.machine.visible=true;this.applySceneOverrides(state?.sceneOverrides||this.sceneOverrides||{});}
    this.fit(view==='factory'?(this.currentFactoryTarget()||this.factory):this.machine);
  }
  applyPlacement(state,layout=this.layout||state.layout){const a=state.asset,l=layout;this.machine.visible=false;if(!l)return;if(l.baselineId){return;}
    if(a.layout_x!==null){this.machine.position.set(a.layout_x,a.layout_y,a.layout_z);this.machine.rotation.y=a.rotation*Math.PI/180;this.machine.scale.setScalar(a.scale);this.machine.visible=true;}
    else if(l.machineAnchor&&this.machineKey==='offset5'){const anchor=l.machineAnchor,p=cadToWorld(anchor.x,anchor.y,l.transform);this.machine.position.set(p.x,anchor.z*(l.transform.scale??1),p.z);this.machine.rotation.y=-(anchor.rotation+l.transform.rotation)*Math.PI/180;this.machine.visible=true;}
  }
  loadLayout(l){if(l===this.layout&&this.factory.children.length&&(!l?.fleet||this.loadedFleet===l.fleet))return;this.clearFactory();this.sceneBase=new WeakMap();this.appliedSceneIds=new Set();this.layout=l;if(!l)return;
    if(l.baselineId&&l.fleet){
      // Low render resolution must not replace the real plant with block proxies.
      // Retain the detailed scene on phones; the proxy is reserved for truly
      // constrained devices that report no more than 2 GB of memory.
      this.actualFactory=this.capabilities?.memory<=2?buildLowDetailFactory(l,l.fleet):buildActualFactory(l,l.fleet);
      this.factory.add(this.actualFactory.root);this.loadedFleet=l.fleet;this.layoutStats={total:l.source.entityCount,rendered:l.actual.walls.length,unimplemented:0};return;
    }
    if(Array.isArray(l.referenceBatches)){
      this.layoutStats={total:l.source?.entityCount??l.referenceBatches.length,rendered:0,unimplemented:l.source?.entityCount??0};
      const profile=l.layout3D;
      if(profile){
        const p0=plantDisplayPoint(l.bounds.minX,l.bounds.minY,l),p1=plantDisplayPoint(l.bounds.maxX,l.bounds.maxY,l);
        const floor=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(p1.x-p0.x),profile.floor.thicknessMeters,Math.abs(p1.z-p0.z)),new THREE.MeshStandardMaterial({color:0xdce4e7,roughness:.96,metalness:0}));
        floor.position.set((p0.x+p1.x)/2,-profile.floor.thicknessMeters/2,(p0.z+p1.z)/2);floor.receiveShadow=true;floor.name='DXF factory floor';floor.userData={sourceType:'DXF_PLAN_EXTRUSION',semantic:'FLOOR',confidence:profile.floor.confidence,renderStatus:'3D_ASSUMED_HEIGHT'};this.factory.add(floor);
        const box=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
        for(const spec of [{semantic:'WALL',color:0x8198a3,...profile.wall},{semantic:'COLUMN',color:0x526d7a,...profile.column}]){
          const segments=[];
          for(const batch of l.referenceBatches.filter(b=>b.semantic===spec.semantic))for(let i=0;i<batch.points.length;i+=4){const a=plantDisplayPoint(batch.points[i],batch.points[i+1],l),b=plantDisplayPoint(batch.points[i+2],batch.points[i+3],l),dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len>.02)segments.push({a,b,len,angle:Math.atan2(dz,dx)});}
          if(!segments.length)continue;
          const mat=new THREE.MeshStandardMaterial({color:spec.color,roughness:.88,metalness:0}),mesh=new THREE.InstancedMesh(box,mat,segments.length);mesh.name='DXF 3D '+spec.semantic.toLowerCase();mesh.castShadow=!this.low;mesh.receiveShadow=true;
          segments.forEach((s,i)=>{dummy.position.set((s.a.x+s.b.x)/2,spec.heightMeters/2,(s.a.z+s.b.z)/2);dummy.rotation.set(0,-s.angle,0);dummy.scale.set(s.len,spec.heightMeters,spec.thicknessMeters);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;
          mesh.userData={sourceType:'DXF_PLAN_EXTRUSION',sourceFile:l.source.file,derivedFile:l.source.derivedFile,semantic:spec.semantic,confidence:'SOURCE_XY_WITH_ASSUMED_HEIGHT',heightMeters:spec.heightMeters,thicknessMeters:spec.thicknessMeters,heightConfidence:spec.heightConfidence,instanceCount:segments.length,renderStatus:'3D'};this.factory.add(mesh);this.layoutStats.rendered+=segments.length;
        }
      }
      const colors={CAD_REFERENCE:0x315363,WALL:0x91aab5,COLUMN:0x5f8fa5,WINDOW:0x5aa6c8,SECURITY:0xa58d58};
      for(const batch of l.referenceBatches){
        if(!Array.isArray(batch.points)||batch.points.length<4)continue;
        const verts=[];
        for(let i=0;i<batch.points.length;i+=4){
          const a=plantDisplayPoint(batch.points[i],batch.points[i+1],l),b=plantDisplayPoint(batch.points[i+2],batch.points[i+3],l);
          verts.push(new THREE.Vector3(a.x,.025,a.z),new THREE.Vector3(b.x,.025,b.z));
        }
        const geo=new THREE.BufferGeometry().setFromPoints(verts),mat=new THREE.LineBasicMaterial({color:colors[batch.semantic]||colors.CAD_REFERENCE,transparent:true,opacity:batch.semantic==='CAD_REFERENCE'?.48:.92});
        const line=new THREE.LineSegments(geo,mat),group=new THREE.Group();group.name='CAD '+batch.layer;
        group.userData={sourceType:'DXF_DERIVED_FROM_DWG',sourceFile:l.source.file,derivedFile:l.source.derivedFile,sourceLayer:batch.layer,confidence:batch.confidence||'UNVERIFIED',semantic:batch.semantic||'CAD_REFERENCE',renderStatus:'2D_REFERENCE',engineeringScale:'UNKNOWN'};
        group.add(line);this.factory.add(group);this.layoutStats.rendered++;
      }
      if(Array.isArray(l.identifiedLabels)){
        const assetPattern=/(CX\s*104|SX\s*52|Polar-115|MACHINE\s+IPM|MESIN\s+UV|CTP#\d+)/i;
        for(const label of l.identifiedLabels){
          const p=plantDisplayPoint(label.x,label.y,l),asset=assetPattern.test(label.text||'');
          const marker=new THREE.Group();marker.name='CAD label · '+label.text;
          marker.position.set(p.x,.08,p.z);marker.userData={sourceType:'DXF_DERIVED_FROM_DWG',sourceFile:l.source.file,derivedFile:l.source.derivedFile,sourceLayer:label.layer,sourceEntityId:label.handle||null,semantic:asset?'ASSET_POSITION_PLACEHOLDER':'CAD_LABEL',confidence:'SOURCE_REFERENCE',engineeringScale:'UNKNOWN',label:label.text,sourceX:label.x,sourceY:label.y};
          const dot=new THREE.Mesh(new THREE.CircleGeometry(asset ? .38 : .20,16),new THREE.MeshBasicMaterial({color:asset?0x36a9e1:0x6f8793,transparent:true,opacity:asset ? .95 : .7,side:THREE.DoubleSide}));dot.rotation.x=-Math.PI/2;marker.add(dot);
          if(typeof document!=='undefined'){
            const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
            if(ctx){canvas.width=256;canvas.height=48;ctx.font='600 18px system-ui';ctx.fillStyle=asset?'#bce9ff':'#9cb3be';ctx.fillText(String(label.text).slice(0,26),6,28);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(7.2,1.35,1);sprite.position.set(3.7,.85,0);marker.add(sprite);}
          }
          this.factory.add(marker);this.layoutStats.rendered++;
        }
      }
      if(l.machineFootprint?.structuralBodyBounds){
        const f=l.machineFootprint;
        const addRect=(bounds,color,opacity,name,kind)=>{
          const coords=[[bounds.minX,bounds.minY],[bounds.maxX,bounds.minY],[bounds.maxX,bounds.maxY],[bounds.minX,bounds.maxY],[bounds.minX,bounds.minY]];
          const pts=coords.map(([x,y])=>{const p=plantDisplayPoint(x,y,l);return new THREE.Vector3(p.x,.065,p.z);});
          const mat=new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.55,gapSize:.30});
          const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat);line.computeLineDistances();
          const group=new THREE.Group();group.name=name;group.userData={sourceType:'DXF_GEOMETRIC_INFERENCE',sourceFile:l.source.file,assetCode:f.assetCode,confidence:f.placementConfidence,semantic:kind,renderStatus:'INFERRED_OVERLAY'};
          group.add(line);this.factory.add(group);this.layoutStats.rendered++;
        };
        addRect(f.serviceInclusiveBounds,0xb08352,.34,'OFU-1 service-inclusive analysis envelope','ANALYSIS_ENVELOPE');
        addRect(f.structuralBodyBounds,0xffb45f,.92,'OFU-1 structural body candidate','STRUCTURAL_BODY_CANDIDATE');
        const zoneStyle={
          DELIVERY_EXTENSION_CANDIDATE:[0xe3a65a,.82],
          REPEATED_PRESS_TRAIN_CANDIDATE:[0x57b6d9,.88],
          FEEDER_CANDIDATE:[0x77c895,.88],
          DRIVE_SERVICE_STRIP_CANDIDATE:[0xb28cd8,.70]
        };
        for(const zone of f.functionalZones||[]){
          const [color,opacity]=zoneStyle[zone.kind]||[0xc0c8cc,.65];
          addRect(zone.bounds,color,opacity,'OFU-1 zone · '+zone.name,zone.kind);
        }
        const a=plantDisplayPoint(f.cadCenterlineX,f.centerlineSpan.minY,l),b=plantDisplayPoint(f.cadCenterlineX,f.centerlineSpan.maxY,l);
        const center=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x,.07,a.z),new THREE.Vector3(b.x,.07,b.z)]),new THREE.LineDashedMaterial({color:0xffcf8a,transparent:true,opacity:.7,dashSize:.8,gapSize:.45}));center.computeLineDistances();
        center.name='OFU-1 CAD centerline';center.userData={sourceType:'DXF_GEOMETRIC_INFERENCE',assetCode:f.assetCode,confidence:f.placementConfidence,semantic:'CENTERLINE_REFERENCE'};this.factory.add(center);this.layoutStats.rendered++;
      }
      this.layoutStats.unimplemented=Math.max(0,this.layoutStats.total-this.layoutStats.rendered);
      return;
    }
    const t=l.transform;this.layoutStats={total:l.entities.length,rendered:0,unimplemented:0};
    const allowed=new Set(['FLOOR','WALL','COLUMN','DOOR','OPENING','CORRIDOR','AREA','FOOTPRINT','BOUNDARY','STAIRS','RAMP']);
    for(const e of l.entities){const semantic=l.layerMapping?.[e.layer]||e.semantic||'UNKNOWN';const group=new THREE.Group();group.name=e.id;group.userData={sourceType:'DWG',sourceFile:l.source.file,sourceLayer:e.layer,sourceEntityId:e.id,confidence:e.confidence,semantic,raw:e,renderStatus:'NOT_IMPLEMENTED'};this.factory.add(group);
      if(!allowed.has(semantic)||!e.points||e.points.length<2){this.layoutStats.unimplemented++;continue;}
      const points=e.points.map(p=>cadToWorld(...p,t));const verts=points.map(p=>new THREE.Vector3(p.x,.025,p.z));if(e.closed)verts.push(verts[0].clone());
      const color={FLOOR:0xb0c4ce,WALL:0x6c8290,COLUMN:0x4b687a,DOOR:0xb19052,FOOTPRINT:0x699687,BOUNDARY:0x203e50}[semantic]||0x91a6b1;
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(verts),new THREE.LineBasicMaterial({color}));group.add(line);group.userData.renderStatus='2D_REFERENCE';
      if(e.closed&&points.length>=3&&['FLOOR','WALL','COLUMN','AREA'].includes(semantic)){
        const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.z)));let geo;
        if(['WALL','COLUMN'].includes(semantic)&&e.height&&e.heightSource){geo=new THREE.ExtrudeGeometry(shape,{depth:e.height*(t.scale??1),bevelEnabled:false});geo.rotateX(-Math.PI/2);group.userData.renderStatus='3D';}
        else{geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);group.userData.renderStatus='2D_REFERENCE';}
        const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.9,side:THREE.DoubleSide,transparent:semantic==='AREA',opacity:semantic==='AREA'?.2:1}));mesh.receiveShadow=true;mesh.castShadow=group.userData.renderStatus==='3D';group.add(mesh);
      }
      this.layoutStats.rendered++;
    }
  }
  setFactoryLayer(name,on){if(this.actualFactory?.layers[name])this.actualFactory.layers[name].visible=!!on;if(this.factorySelectionHelper&&this.factorySelectionId){const selected=this.actualFactory?.assets.get(this.factorySelectionId);this.factorySelectionHelper.visible=this.view==='factory'&&!!selected&&this.isObjectVisible(selected);}}
  isObjectVisible(object){for(let node=object;node;node=node.parent)if(node.visible===false)return false;return true;}
  clearFactorySelection(){this.factorySelectionId=null;if(this.factorySelectionHelper){this.scene.remove(this.factorySelectionHelper);this.factorySelectionHelper.geometry?.dispose();this.factorySelectionHelper.material?.dispose();this.factorySelectionHelper=null;}return true;}
  selectFactoryAsset(id,{focus=false,mode='iso'}={}){
    const object=this.actualFactory?.assets.get(id);if(!object)return null;
    this.clearFactorySelection();this.factorySelectionId=id;
    const helper=new THREE.BoxHelper(object,0x1677d2);helper.name='FACTORY_ASSET_SELECTION_OVERLAY';helper.userData={semantic:'SELECTION_OVERLAY',machineId:id,sourceType:'UI_STATE_NOT_FACTORY_GEOMETRY'};helper.material.transparent=true;helper.material.opacity=.92;helper.material.depthTest=false;helper.renderOrder=999;helper.visible=this.view==='factory'&&this.isObjectVisible(object);this.factorySelectionHelper=helper;this.scene.add(helper);
    if(focus)this.fit(object,mode);return object;
  }
  currentFactoryTarget(){return this.factorySelectionId?this.actualFactory?.assets.get(this.factorySelectionId)||this.factory:this.factory;}
  focusFactorySelection(mode='iso'){const target=this.currentFactoryTarget();if(target)this.fit(target,mode);return target;}
  focusFactoryAsset(id,mode='iso'){return this.selectFactoryAsset(id,{focus:true,mode});}
  clearFactory(){this.clearFactorySelection();this.actualFactory=null;this.factory.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>{m.map?.dispose();m.dispose();});else{o.material?.map?.dispose();o.material?.dispose();}});this.factory.clear();}
  registerSceneObjects(){
    this.sceneObjects=new Map();this.sceneObjectIds=new WeakMap();
    const walk=(node,path)=>{
      const generatedId=node.userData.editorCopyRoot||node.userData.editorNewRoot;
      if(generatedId){this.sceneObjects.set(generatedId,node);node.traverse(child=>this.sceneObjectIds.set(child,generatedId));return;}
      if(node.isObject3D){const id='node:'+path;this.sceneObjectIds.set(node,id);this.sceneObjects.set(id,node);if(!this.sceneBase)this.sceneBase=new WeakMap();if(!this.sceneBase.has(node))this.sceneBase.set(node,{position:node.position.toArray(),rotation:[node.rotation.x,node.rotation.y,node.rotation.z],scale:node.scale.toArray(),visible:node.visible});}
      node.children.forEach((child,index)=>walk(child,path+'.'+index));
    };
    this.factory.children.forEach((child,index)=>walk(child,String(index)));
    for(const node of [...this.sceneObjects.values()])if(node.userData.editorStableId){const id=node.userData.editorStableId;if(!this.sceneObjects.has(id)){this.sceneObjects.set(id,node);this.sceneObjectIds.set(node,id);}}
    for(const [id,node] of this.actualFactory?.assets||[]){this.sceneObjects.set('asset:'+id,node);this.sceneObjectIds.set(node,'asset:'+id);}
    if(this.machine){const machinePath='machine:'+this.machineKey+':',parts=new Map(),duplicates=new Set();const registerMachine=(node,path)=>{if(node.userData.editorCopyRoot){const generatedId=node.userData.editorCopyRoot;this.sceneObjects.set(generatedId,node);node.traverse(child=>this.sceneObjectIds.set(child,generatedId));return;}const id=machinePath+path;this.sceneObjects.set(id,node);this.sceneObjectIds.set(node,id);if(!this.sceneBase)this.sceneBase=new WeakMap();if(!this.sceneBase.has(node))this.sceneBase.set(node,{position:node.position.toArray(),rotation:[node.rotation.x,node.rotation.y,node.rotation.z],scale:node.scale.toArray(),visible:node.visible});const partId=node.userData?.nodeId;if(typeof partId==='string'&&/^[A-Za-z0-9_.-]+$/.test(partId)){if(parts.has(partId))duplicates.add(partId);else parts.set(partId,node);}node.children.forEach((child,index)=>registerMachine(child,path==='root'?String(index):path+'.'+index));};registerMachine(this.machine,'root');for(const [partId,node] of parts)if(!duplicates.has(partId)){const id='part:'+this.machineKey+':'+partId;this.sceneObjects.set(id,node);this.sceneObjectIds.set(node,id);}}
    return this.sceneObjects;
  }
  setSceneEditing(on){this.sceneEditing=!!on;if(!on){this.gizmo.detach();this.onSceneTransform=null;}else this.registerSceneObjects();}
  selectSceneObject(id){const node=this.sceneObjects?.get(id);if(!node)return;this.sceneSelectedId=id;if(this.sceneOverrides?.[id]?.locked)this.gizmo.detach();else this.gizmo.attach(node);this.onSceneSelect?.(id,node);return node;}
  sceneIdentity(id){return sceneIdentity(this.sceneObjects?.get(id));}
  sceneWallId(id){let node=this.sceneObjects?.get(id);while(node&&node!==this.factory){if(node.userData.editorWall)return this.sceneObjectIds?.get(node)||null;node=node.parent;}return null;}
  sceneWallEndpoints(id){const wall=this.sceneObjects?.get(id);if(!wall?.userData.editorWall)return null;wall.updateWorldMatrix(true,false);const half=wall.userData.sourceLength/2;return [-half,half].map(x=>{const point=new THREE.Vector3(x,0,0).applyMatrix4(wall.matrixWorld);return [point.x,point.z];});}
  setSceneWallEndpoints(id,points){const wall=this.sceneObjects?.get(id);if(!wall?.userData.editorWall)return false;const [a,b]=points,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.28||length>10000)return false;
    wall.parent.updateWorldMatrix(true,false);const midpoint=new THREE.Vector3((a[0]+b[0])/2,0,(a[1]+b[1])/2),start=new THREE.Vector3(...[a[0],0,a[1]]),end=new THREE.Vector3(...[b[0],0,b[1]]);
    wall.position.copy(wall.parent.worldToLocal(midpoint));const localDirection=end.sub(start).transformDirection(new THREE.Matrix4().copy(wall.parent.matrixWorld).invert());wall.rotation.y=Math.atan2(-localDirection.z,localDirection.x);wall.scale.x=length/wall.userData.sourceLength;return true;
  }
  alignSceneObject(id,targetId,axis){const node=this.sceneObjects?.get(id),target=this.sceneObjects?.get(targetId);if(!node||!target||node===target||!['x','z','xz'].includes(axis))return false;for(let p=node.parent;p;p=p.parent)if(p===target)return false;for(let p=target.parent;p;p=p.parent)if(p===node)return false;
    node.updateWorldMatrix(true,true);target.updateWorldMatrix(true,true);
    const center=new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3()),other=new THREE.Box3().setFromObject(target).getCenter(new THREE.Vector3());
    if(axis.includes('x'))center.x=other.x;if(axis.includes('z'))center.z=other.z;
    const old=node.getWorldPosition(new THREE.Vector3()),delta=center.sub(new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3()));
    node.parent.updateWorldMatrix(true,false);node.position.copy(node.parent.worldToLocal(old.add(delta)));return true;
  }
  dropSceneObjectToFloor(id){const node=this.sceneObjects?.get(id);if(!node)return;const box=new THREE.Box3().setFromObject(node);node.position.y-=box.min.y;}
  moveSceneObjectInView(id,horizontal=0,vertical=0,step=.1){
    const node=this.sceneObjects?.get(id);if(!node||(!horizontal&&!vertical))return false;
    const forward=new THREE.Vector3();this.camera.getWorldDirection(forward);forward.y=0;if(forward.lengthSq()<1e-8)forward.set(0,0,-1);forward.normalize();
    const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();
    const delta=new THREE.Vector3().addScaledVector(right,horizontal*step).addScaledVector(forward,vertical*step);
    node.updateWorldMatrix(true,false);const world=node.getWorldPosition(new THREE.Vector3()).add(delta);
    if(node.parent){node.parent.updateWorldMatrix(true,false);node.position.copy(node.parent.worldToLocal(world));}else node.position.copy(world);
    return true;
  }
  sceneObjectInfo(id){const node=this.sceneObjects?.get(id);if(!node)return null;node.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(node),size=box.getSize(new THREE.Vector3());const collisions=[];
    if(id.startsWith('asset:')&&!box.isEmpty())for(const [otherId,other] of this.actualFactory?.assets||[]){if('asset:'+otherId===id||!this.isObjectVisible(other))continue;const otherBox=new THREE.Box3().setFromObject(other);if(box.intersectsBox(otherBox)){const overlap=box.clone().intersect(otherBox).getSize(new THREE.Vector3());if(Math.min(overlap.x,overlap.y,overlap.z)>.05)collisions.push(otherId);}}
    return {dimensions:size.toArray(),collisions:collisions.slice(0,8)};
  }
  sceneSnapshot(){const result={};for(const [id,node] of this.sceneObjects||[]){if(id.startsWith('node:')&&[...this.actualFactory?.assets.values()||[]].includes(node))continue;const values={position:node.position.toArray(),rotation:[node.rotation.x,node.rotation.y,node.rotation.z],scale:node.scale.toArray(),visible:node.visible};result[id]=values;}return result;}
  applySceneOverrides(overrides={}){
    for(const copy of this.sceneCopies?.values()||[])copy.parent?.remove(copy);
    for(const created of this.sceneGenerated?.values()||[]){created.parent?.remove(created);created.geometry?.dispose();created.material?.dispose();}
    this.sceneCopies=new Map();this.registerSceneObjects();this.staleSceneOverrides=[];
    this.sceneGenerated=new Map();
    for(const id of this.appliedSceneIds||[]){const node=this.sceneObjects.get(id),v=node&&this.sceneBase.get(node);if(!v)continue;node.position.fromArray(v.position);node.rotation.set(...v.rotation);node.scale.fromArray(v.scale);node.visible=v.visible;}
    this.appliedSceneIds=new Set();
    for(const [id,v] of Object.entries(overrides)){
      if(id.startsWith('copy:'))continue;
      const node=this.sceneObjects.get(id);if(!node){this.staleSceneOverrides.push(id);continue;}
      if(v.identity&&v.identity!==sceneIdentity(node)){this.staleSceneOverrides.push(id);continue;}
      node.position.fromArray(v.position);node.rotation.set(...v.rotation);node.scale.fromArray(v.scale);node.visible=v.visible&&!v.deleted;
      this.appliedSceneIds.add(id);
    }
    for(const [id,v] of Object.entries(overrides))if(id.startsWith('copy:')){
      const source=this.sceneObjects.get(v.sourceId);
      if(!source||v.identity&&v.identity!==sceneIdentity(source)){this.staleSceneOverrides.push(id);continue;}
      let meshCount=0;source.traverse(node=>{if(node.isMesh)meshCount++;});
      if(meshCount>300){this.staleSceneOverrides.push(id);continue;}
      const copy=source.clone(true);copy.name='Duplikat '+(source.name||source.userData.semantic||v.sourceId);
      copy.userData={...copy.userData,editorCopyRoot:id,accuracy:'SUPERADMIN_ADDED_COPY'};
      copy.traverse(child=>this.sceneObjectIds.set(child,id));source.parent.add(copy);
      copy.position.fromArray(v.position);copy.rotation.set(...v.rotation);copy.scale.fromArray(v.scale);copy.visible=v.visible&&!v.deleted;
      this.sceneCopies.set(id,copy);this.sceneObjects.set(id,copy);
    }
    for(const [id,v] of Object.entries(overrides))if(id.startsWith('new:')){
      const geometry=v.shape==='box'?new THREE.BoxGeometry(1,1,1):v.shape==='cylinder'?new THREE.CylinderGeometry(.5,.5,1,24):null;
      if(!geometry){this.staleSceneOverrides.push(id);continue;}
      const object=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x879ba3,roughness:.78,metalness:.16}));
      object.name=v.shape==='box'?'Kotak tambahan Superadmin':'Silinder tambahan Superadmin';
      object.userData={semantic:'SUPERADMIN_ADDED_PRIMITIVE',editorNewRoot:id};object.castShadow=true;object.receiveShadow=true;
      this.factory.add(object);object.position.fromArray(v.position);object.rotation.set(...v.rotation);object.scale.fromArray(v.scale);object.visible=v.visible&&!v.deleted;
      this.sceneGenerated.set(id,object);this.sceneObjects.set(id,object);this.sceneObjectIds.set(object,id);
    }
    this.sceneOverrides=overrides;
  }
  edit(on){if(on&&this.view==='factory'&&this.layout){this.machine.visible=true;this.gizmo.attach(this.machine);}else this.gizmo.detach();}
  setQualityProfile(requested='auto'){
    this.requestedQuality=requested;
    this.adaptiveQuality.reset();
    return this.applyQualityProfile(resolveProfile(requested,this.capabilities));
  }
  applyQualityProfile(profile){
    this.qualityProfile=profile;
    this.low=this.qualityProfile==='hemat';
    configureRenderer(this.renderer,{profile:this.qualityProfile,devicePixelRatio,shadowLight:this.key});
    this.template.setLow(this.low);this.resize();return this.qualityProfile;
  }
  setLow(on){return this.setQualityProfile(on?'hemat':'auto');}
  clearMachineContext(){
    if(this.simulation?.active)this.simulation.stop();
    this.gizmo.detach();this.clearPartLabels();this.simulation?.dispose();this.template?.dispose();if(this.machine)this.scene.remove(this.machine);
    this.machineKey=null;this.template=neutralTemplate();this.machine=this.template.root;this.scene.add(this.machine);this.simulation=neutralSimulation();this.simulation.onUpdate=state=>this.onSimulationUpdate?.(state);
    this.machine.visible=false;this.isolated=false;this.view='factory';this.studio.visible=false;this.factory.visible=true;this.renderer.domElement.setAttribute('aria-label','Digital Twin 3D Pabrik Packaging Offset. Pilih mesin untuk membuka model detail.');
    this.applySceneOverrides(this.sceneOverrides||{});if(this.factory?.children?.length)this.fit(this.factory,'iso');this.resize();return true;
  }
  async switchMachine(key){
    const requested=normalizeFoundationMachineKey(key);
    if(!requested){this.onError?.('Pilih aset sebelum membuka model 3D.');return false;}
    if(!canOpenTechnical3D(requested)){this.onError?.('Model 3D untuk aset ini belum tersedia.');return false;}
    if(this.machineKey===requested)return true;
    if(this.simulation?.active)this.simulation.stop();
    const {createMachineTemplate,createMachineSimulation}=await import('./machine-runtime.js');
    const nextTemplate=createMachineTemplate(requested);
    let nextSimulation;
    try{nextSimulation=createMachineSimulation(requested,nextTemplate.root,nextTemplate);}
    catch(error){nextTemplate.dispose?.();throw error;}
    this.gizmo.detach();this.clearPartLabels();this.simulation?.dispose();this.template?.dispose();if(this.machine)this.scene.remove(this.machine);
    this.machineKey=requested;
    this.template=nextTemplate;
    this.machine=this.template.root;this.scene.add(this.machine);
    this.simulation=nextSimulation;
    const label=this.renderer.domElement;label.setAttribute('aria-label',`Model 3D ${this.machine.name||requested}. Gunakan tombol sudut pandang untuk navigasi.`);
    this.simulation.onUpdate=state=>this.onSimulationUpdate?.(state);this.isolated=false;this.view='machine';this.machine.visible=true;this.applySceneOverrides(this.sceneOverrides||{});this.factory.visible=false;this.template.setLow(this.low);this.fit(this.machine);this.resize();return true;
  }
  dispose(){cancelAnimationFrame(this.frame);this.clearPartLabels();this.clearFactorySelection();this.resizeObserver.disconnect();this.controls.dispose();this.gizmo.dispose();this.simulation?.dispose();this.template.dispose();this.clearFactory();this.studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.lighting.dispose();this.renderer.dispose();}
}
