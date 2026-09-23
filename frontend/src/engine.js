import {buildActualFactory} from './factory-building.js';
import {buildFactoryOverview} from './factory-overview.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { cadToWorld } from './model.js';
import { plantDisplayPoint } from './data/plant-layout-data.js';

import {OffsetMachineTemplate} from './offset5.js';
import {PrintingSimulation} from './simulation.js';
import {FOUNDATION_SCOPE,canOpenTechnical3D} from './data/foundation-scope.js';
export {OffsetMachineTemplate};
const normalizeFoundationMachineKey=key=>{const raw=String(key??'').trim();return raw==='BMJ-MCH-0003'?'offset5':raw||null;};

export class FactoryEngine {
  constructor(container,onSelect){
    this.container=container;this.onSelect=onSelect;this.onTaxonomySelect=null;this.view='machine';this.layout=null;this.low=false;this.labels=true;this.isolated=false;this.partLabelEntries=[];
    {const requested=normalizeFoundationMachineKey(new URLSearchParams(location.search).get('machine'));this.requestedMachineKey=requested;this.machineKey=FOUNDATION_SCOPE.primaryRoute;}
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
    container.appendChild(this.renderer.domElement);const ariaMachine=FOUNDATION_SCOPE.primaryAssetName;this.renderer.domElement.setAttribute('aria-label',`Model 3D prosedural ${ariaMachine}. Gunakan tombol sudut pandang untuk navigasi.`);this.renderer.domElement.setAttribute('tabindex','0');
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xe8eef2);
    this.camera=new THREE.PerspectiveCamera(38,1,.05,1e7);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.minDistance=.4;this.controls.maxDistance=1e7;this.controls.maxPolarAngle=Math.PI*.495;
    this.controls.addEventListener('start',()=>this.transition=null);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x87979f,2.7));
    const key=new THREE.DirectionalLight(0xfffaf1,3.3);key.position.set(-5,12,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:50});key.shadow.bias=-.001;key.shadow.normalBias=.035;this.scene.add(key);this.key=key;
    this.studio=new THREE.Group();this.studio.name='Inspection studio — not factory';
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=.01;this.studio.add(floor);
    const grid=new THREE.GridHelper(150,100,0xd4dfe5,0xdce5ea);grid.material.transparent=true;grid.material.opacity=.38;this.studio.add(grid);this.scene.add(this.studio);
    this.template=new OffsetMachineTemplate();this.machine=this.template.root;this.scene.add(this.machine);
    this.simulation=new PrintingSimulation(this.machine,this.template);this.simulation.onUpdate=state=>this.onSimulationUpdate?.(state);
    this.factory=new THREE.Group();this.scene.add(this.factory);this.factorySelectionId=null;this.factorySelectionHelper=null;
    this.gizmo=new TransformControls(this.camera,this.renderer.domElement);this.scene.add(this.gizmo.getHelper());this.gizmo.addEventListener('dragging-changed',e=>{this.controls.enabled=!e.value;});this.gizmo.addEventListener('objectChange',()=>{if(this.gizmo.mode==='scale')this.machine.scale.setScalar(Math.max(.0001,this.machine.scale.x));this.onTransform?.();});
    this.ray=new THREE.Raycaster();this.down=null;this.renderer.domElement.addEventListener('dblclick',()=>{this.template.reset();this.clearPartLabels();this.isolated=false;if(this.view==='factory'){this.clearFactorySelection();this.fit(this.factory);}else this.fit(this.machine);this.onReset?.();});
    this.renderer.domElement.addEventListener('pointerdown',e=>this.down=[e.clientX,e.clientY]);
    this.renderer.domElement.addEventListener('pointerup',e=>{if(!this.down||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>5||this.gizmo.dragging||this.simulation?.active)return;const r=this.renderer.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);if(this.view==='factory'&&this.actualFactory){const hit=this.ray.intersectObjects([...this.actualFactory.assets.values()],true).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit)this.onFactorySelect?.(hit.object.userData.machineId);return;}const hit=this.ray.intersectObject(this.machine,true).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit&&this.machine.visible){const part=this.template.resolvePart(hit.object);if(part)this.onSelect(part);}});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
    this.last=0;this.render=this.render.bind(this);this.fit(this.machine,'iso',false);this.resize();this.frame=requestAnimationFrame(this.render);
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onError?.('Konteks grafis terputus. Muat ulang halaman untuk memulihkan penampil.');});
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
  render(now){this.frame=requestAnimationFrame(this.render);if(document.hidden||(this.low&&now-this.last<32))return;this.last=now;
    this.simulation?.update(now);
    if(this.transition){const t=Math.min((now-this.transition.start)/650,1),e=t*t*(3-2*t),a=this.transition;this.camera.position.lerpVectors(a.from,a.to,e);this.controls.target.lerpVectors(a.fromTarget,a.target,e);if(t===1)this.transition=null;}
    this.controls.update();this.renderer.render(this.scene,this.camera);this.updateLabel();this.updatePartLabels();
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
    this.clearPartLabels();if(!part||this.view!=='machine')return;
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
  setView(view,state){if(view!=='machine'&&this.simulation?.active)this.simulation.stop();this.view=view;this.gizmo.detach();this.template.reset();this.clearPartLabels();this.isolated=false;this.machine.position.set(0,0,0);this.machine.rotation.set(0,0,0);this.machine.scale.setScalar(1);this.studio.visible=view==='machine';this.factory.visible=view==='factory';if(this.factorySelectionHelper)this.factorySelectionHelper.visible=view==='factory';
    if(view==='factory')this.applyPlacement(state,this.layout||state.layout);else this.machine.visible=true;
    this.fit(view==='factory'?(this.currentFactoryTarget()||this.factory):this.machine);
  }
  applyPlacement(state,layout=this.layout||state.layout){const a=state.asset,l=layout;this.machine.visible=false;if(!l)return;if(l.baselineId){return;}
    if(a.layout_x!==null){this.machine.position.set(a.layout_x,a.layout_y,a.layout_z);this.machine.rotation.y=a.rotation*Math.PI/180;this.machine.scale.setScalar(a.scale);this.machine.visible=true;}
    else if(l.machineAnchor&&this.machineKey==='offset5'){const anchor=l.machineAnchor,p=cadToWorld(anchor.x,anchor.y,l.transform);this.machine.position.set(p.x,anchor.z*(l.transform.scale??1),p.z);this.machine.rotation.y=-(anchor.rotation+l.transform.rotation)*Math.PI/180;this.machine.visible=true;}
  }
  loadLayout(l){if(l===this.layout&&this.factory.children.length)return;this.clearFactory();this.layout=l;if(!l)return;
    if(l.baselineId&&(l.fleet||(this.low&&l.fleetOverview))){this.actualFactory=this.low&&l.fleetOverview?buildFactoryOverview(l,l.fleetOverview):buildActualFactory(l,l.fleet);this.factory.add(this.actualFactory.root);this.layoutStats={total:l.source.entityCount,rendered:l.actual.walls.length,unimplemented:0};return;}
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
  edit(on){if(on&&this.view==='factory'&&this.layout){this.machine.visible=true;this.gizmo.attach(this.machine);}else this.gizmo.detach();}
  setLow(on){this.low=on;this.renderer.setPixelRatio(on?1:Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=!on;this.template.setLow(on);this.resize();}
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
    this.simulation.onUpdate=state=>this.onSimulationUpdate?.(state);this.isolated=false;this.view='machine';this.machine.visible=true;this.factory.visible=false;this.template.setLow(this.low);this.fit(this.machine);this.resize();return true;
  }
  dispose(){cancelAnimationFrame(this.frame);this.clearPartLabels();this.clearFactorySelection();this.resizeObserver.disconnect();this.controls.dispose();this.gizmo.dispose();this.simulation?.dispose();this.template.dispose();this.clearFactory();this.studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.renderer.dispose();}
}
