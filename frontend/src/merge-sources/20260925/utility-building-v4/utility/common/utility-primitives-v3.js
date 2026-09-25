import * as T from 'three';

export const UTILITY_PRIMITIVES_VERSION='UP-V3-2026-09-25';

export const UTILITY_MATERIALS=Object.freeze({
 powderLight:{color:0xd9dee0,roughness:.54,metalness:.28},
 powderDark:{color:0x343b3f,roughness:.58,metalness:.34},
 atlasYellow:{color:0xf0c91f,roughness:.48,metalness:.22},
 kaeserYellow:{color:0xf3cf16,roughness:.46,metalness:.24},
 swanBlue:{color:0x2876a7,roughness:.48,metalness:.24},
 sansinBlue:{color:0x376d91,roughness:.50,metalness:.25},
 galvanized:{color:0x9ba8ad,roughness:.42,metalness:.72},
 stainless:{color:0xbfc7c9,roughness:.28,metalness:.82},
 copper:{color:0xa9633c,roughness:.38,metalness:.65},
 blackRubber:{color:0x202426,roughness:.90,metalness:.02},
 filter:{color:0xd7c99f,roughness:.83,metalness:0},
 coilFin:{color:0xaab9bd,roughness:.38,metalness:.56},
 motorBlue:{color:0x315d78,roughness:.55,metalness:.38},
 motorDark:{color:0x30383b,roughness:.56,metalness:.42},
 pipeBlue:{color:0x3485a8,roughness:.44,metalness:.28},
 pipeGreen:{color:0x4f8f70,roughness:.48,metalness:.24},
 pvc:{color:0xe7e7e2,roughness:.62,metalness:.03},
 hazardYellow:{color:0xf0cf18,roughness:.52,metalness:.18},
 processBlue:{color:0x2b6f9e,roughness:.62,metalness:.08},
 processRed:{color:0xa63a32,roughness:.58,metalness:.12},
 concrete:{color:0xaab0ad,roughness:.92,metalness:.01},
 water:{color:0x4e9db4,roughness:.12,metalness:.02,transparent:true,opacity:.62},
 glass:{color:0xb8dbe1,roughness:.16,metalness:.02,transparent:true,opacity:.25}
});

const MAT_CACHE=new Map();
export function utilityMaterial(name='powderLight',override={}){
 const base=UTILITY_MATERIALS[name]||UTILITY_MATERIALS.powderLight;
 const key=name+JSON.stringify(override);
 if(!MAT_CACHE.has(key))MAT_CACHE.set(key,new T.MeshStandardMaterial({...base,...override,side:T.DoubleSide,depthWrite:(override.opacity??base.opacity??1)>=1}));
 return MAT_CACHE.get(key);
}
export function tag(o,semantic,extra={}){o.userData={...o.userData,semantic,utilityPrimitiveVersion:UTILITY_PRIMITIVES_VERSION,...extra};return o;}
export function group(name,semantic=name,extra={}){const g=new T.Group();g.name=name;tag(g,semantic,extra);return g;}
export function box(parent,w,h,d,material='powderLight',semantic='BOX',p=[0,h/2,0],rotY=0,extra={}){
 const o=new T.Mesh(new T.BoxGeometry(w,h,d),utilityMaterial(material));o.position.set(...p);o.rotation.y=rotY;o.castShadow=true;o.receiveShadow=true;tag(o,semantic,extra);parent?.add(o);return o;
}
export function cylinder(parent,r,h,material='galvanized',semantic='CYLINDER',p=[0,h/2,0],segments=24,axis='y',extra={}){
 const o=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),utilityMaterial(material));o.position.set(...p);if(axis==='x')o.rotation.z=Math.PI/2;else if(axis==='z')o.rotation.x=Math.PI/2;o.castShadow=true;o.receiveShadow=true;tag(o,semantic,extra);parent?.add(o);return o;
}
export function cone(parent,rTop,rBottom,h,material='galvanized',semantic='CONE',p=[0,h/2,0],segments=24,extra={}){
 const o=new T.Mesh(new T.CylinderGeometry(rTop,rBottom,h,segments),utilityMaterial(material));o.position.set(...p);o.castShadow=true;o.receiveShadow=true;tag(o,semantic,extra);parent?.add(o);return o;
}
export function pipeBetween(parent,a,b,r=.025,material='galvanized',semantic='PIPE',extra={}){
 const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=new T.Vector3().subVectors(vb,va),len=d.length();if(len<1e-6)return null;
 const o=new T.Mesh(new T.CylinderGeometry(r,r,len,12),utilityMaterial(material));o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());tag(o,semantic,extra);parent?.add(o);return o;
}
export function torus(parent,major=.1,tube=.012,material='galvanized',semantic='RING',p=[0,0,0],rot=[Math.PI/2,0,0],extra={}){
 const o=new T.Mesh(new T.TorusGeometry(major,tube,10,30),utilityMaterial(material));o.position.set(...p);o.rotation.set(...rot);tag(o,semantic,extra);parent?.add(o);return o;
}
export function servicePanel(parent,w,h,t=.026,material='powderLight',semantic='SERVICE_PANEL',p=[0,h/2,0],rotY=0,extra={}){
 const panel=box(parent,w,h,t,material,semantic,p,rotY,{cutawayPanel:true,...extra});
 const frame=group(semantic+'_FRAME');panel.add(frame);const z=t*.58;
 for(const [x,y,ww,hh] of [[0,h/2-.018,w-.04,.012],[0,-h/2+.018,w-.04,.012],[-w/2+.018,0,.012,h-.04],[w/2-.018,0,.012,h-.04]]) box(frame,ww,hh,.007,'powderDark',semantic+'_SEAM',[x,y,z]);
 box(frame,.08,.018,.014,'powderDark',semantic+'_HANDLE',[w*.31,0,z+.006]);return panel;
}
export function louverBank(parent,w,h,count=8,material='powderDark',semantic='LOUVER_BANK',p=[0,0,0],rotY=0,extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);g.rotation.y=rotY;parent?.add(g);for(let i=0;i<count;i++){const y=-h/2+(i+.5)*h/count;const sl=box(g,w*.94,h/count*.38,.018,material,semantic+'_SLAT',[0,y,0],0,{index:i});sl.rotation.x=-.24;}return g;
}
export function filterBank(parent,w,h,depth=.10,rows=10,semantic='FILTER_BANK',p=[0,0,0],rotY=0,extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);g.rotation.y=rotY;parent?.add(g);box(g,w,h,depth,'galvanized',semantic+'_FRAME',[0,0,0]);
 for(let i=0;i<rows;i++){const y=-h/2+(i+.5)*h/rows;box(g,w*.91,h/rows*.54,depth*1.08,'filter',semantic+'_PLEAT',[0,y,-depth*.03],0,{row:i});}return g;
}
export function coilFace(parent,w,h,depth=.12,rows=16,semantic='COOLING_COIL',p=[0,0,0],rotY=0,extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);g.rotation.y=rotY;parent?.add(g);box(g,w,h,depth,'galvanized',semantic+'_CASING',[0,0,0]);
 for(let i=0;i<rows;i++){const y=-h/2+(i+.5)*h/rows;box(g,w*.92,.012,depth*1.06,'coilFin',semantic+'_FIN',[0,y,0],0,{row:i});}
 for(const x of [-w*.37,-w*.12,w*.13,w*.38])pipeBetween(g,[x,-h*.43,-depth*.58],[x,h*.43,-depth*.58],.012,'copper',semantic+'_TUBE');return g;
}
export function fanWheel(parent,r=.34,depth=.18,bladeCount=9,material='galvanized',semantic='FAN_WHEEL',p=[0,0,0],axis='z',extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);parent?.add(g);torus(g,r,.028,'powderDark',semantic+'_RIM',[0,0,0],axis==='z'?[0,0,0]:[Math.PI/2,0,0]);
 cylinder(g,.07,depth,'powderDark',semantic+'_HUB',[0,0,0],24,axis,extra);
 for(let i=0;i<bladeCount;i++){const a=i*Math.PI*2/bladeCount,blade=box(g,r*.52,.055,depth*.72,material,semantic+'_BLADE',[Math.cos(a)*r*.47,Math.sin(a)*r*.47,0],a+.34,{index:i});if(axis!=='z')blade.rotation.z=a+.34;}
 g.userData.rotationAxis=axis;return g;
}
export function screwRotor(parent,length=.62,r=.09,lobes=4,material='stainless',semantic='SCREW_ROTOR',p=[0,0,0],extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);parent?.add(g);cylinder(g,r,length,material,semantic+'_CORE',[0,0,0],24,'x');
 for(let i=0;i<lobes;i++){const phase=i*Math.PI*2/lobes;for(let j=0;j<14;j++){const x=-length/2+(j+.5)*length/14,a=phase+j*.43;const n=cylinder(g,r*.16,r*.06,material,semantic+'_LOBE',[x,Math.cos(a)*r*.82,Math.sin(a)*r*.82],8,'x',{lobe:i,station:j});n.rotation.x=a;}}return g;
}
export function damperBank(parent,w,h,bladeCount=6,material='galvanized',semantic='DAMPER',p=[0,0,0],rotY=0,extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);g.rotation.y=rotY;parent?.add(g);box(g,w,h,.05,'powderDark',semantic+'_FRAME',[0,0,0]);g.userData.blades=[];
 for(let i=0;i<bladeCount;i++){const y=-h/2+(i+.5)*h/bladeCount;const b=box(g,w*.90,h/bladeCount*.52,.025,material,semantic+'_BLADE',[0,y,-.03],0,{index:i});g.userData.blades.push(b);}return g;
}
export function motor(parent,length=.55,r=.18,material='motorBlue',semantic='MOTOR',p=[0,0,0],axis='x',extra={}){
 const g=group(semantic,semantic,extra);g.position.set(...p);parent?.add(g);cylinder(g,r,length,material,semantic+'_BODY',[0,0,0],28,axis);cylinder(g,r*.62,.07,'motorDark',semantic+'_END_BELL',[axis==='x'?length/2:0,0,axis==='z'?length/2:0],24,axis);box(g,r*1.05,r*.42,r*.62,'motorDark',semantic+'_TERMINAL_BOX',[0,r*.98,0]);return g;
}
export function gauge(parent,r=.055,semantic='PRESSURE_GAUGE',p=[0,0,0],rotY=0,extra={}){const g=group(semantic,semantic,extra);g.position.set(...p);g.rotation.y=rotY;parent?.add(g);cylinder(g,r,.018,'stainless',semantic+'_CASE',[0,0,0],24,'z');cylinder(g,r*.84,.020,'powderLight',semantic+'_FACE',[0,0,-.012],24,'z');pipeBetween(g,[0,0,-.024],[r*.45,r*.25,-.026],.008,'processRed',semantic+'_NEEDLE');return g;}
export function bolt(parent,p=[0,0,0],semantic='FASTENER',extra={}){return cylinder(parent,.012,.012,'stainless',semantic,p,8,'z',extra);}
export function baseFeet(parent,w,d,y=.04,semantic='BASE_FEET'){for(const x of [-w*.42,w*.42])for(const z of [-d*.38,d*.38]){box(parent,.12,.08,.12,'blackRubber',semantic,[x,y,z]);bolt(parent,[x,y+.045,z],semantic+'_ANCHOR');}}
export function cutaway(root,enabled=true){root.traverse(o=>{if(o.userData?.cutawayPanel)o.visible=!enabled;if(o.userData?.cutawayOnly)o.visible=enabled;});root.userData.cutaway=enabled;return root;}
export function markCutawayOnly(o){o.userData={...o.userData,cutawayOnly:true};o.visible=false;return o;}
export function applyDamperAngle(damper,angleRad){for(const b of damper?.userData?.blades||[])b.rotation.x=angleRad;}
export function safeDelta(dt,max=.05){return Math.max(0,Math.min(max,Number(dt)||0));}
export function portMarker(parent,id,p,direction=[1,0,0],extra={}){const g=group(id,'UTILITY_PORT',{portId:id,direction,...extra});g.position.set(...p);parent?.add(g);const tip=new T.Vector3(...direction).normalize().multiplyScalar(.16);pipeBetween(g,[0,0,0],tip.toArray(),.018,'hazardYellow',id+'_AXIS');return g;}