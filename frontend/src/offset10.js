import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OFFSET10_DIMENSIONS,OFFSET10_MODULE_SEQUENCE,OFFSET10_MODULE_CENTERS,offset10DimensionAudit} from './data/dimensions-offset10.js';
import {OFFSET10_ORIENTATION,OFFSET10_TECHNICAL_SOURCES} from './data/sources-offset10.js';
import {OFFSET10_TAXONOMY,OFFSET10_TAXONOMY_BY_ID} from './data/taxonomy-offset10.js';
import {V123_SOURCE_STATS} from './data/research-v123.js';

const V=a=>new THREE.Vector3(...a);
const D=OFFSET10_DIMENSIONS.layout;
const PRINT_COLORS=[0x3bc4d9,0xd64283,0xe5bb38,0x25282c,0xef7f32,0x4caf69,0x4774d6,0x8359be,0x27a4b5,0xbf4f74,0x7c873c];

export class Offset10MachineTemplate{
  constructor(){
    this.root=new THREE.Group();this.root.name='MACHINE-OFFSET10';
    this.root.userData={assetId:'MACHINE-OFFSET10',orientation:OFFSET10_ORIENTATION,taxonomyVersion:'offset10-taxonomy-v1',machineEnvelope:OFFSET10_DIMENSIONS,dimensionAudit:offset10DimensionAudit(),sources:OFFSET10_TECHNICAL_SOURCES};
    this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;this.ghosted=false;
    this.palette={graphite:0x293238,black:0x12191d,silver:0xb7c0c1,steel:0x879397,light:0xe6e8e2,paper:0xf2edda,rubber:0x22272b,glass:0x69a9bd,red:0xb43835,yellow:0xe0b73e,blue:0x325c86,violet:0x7652ff,foil:0xd6c17b,green:0x3c8d68};
    this.build();this.enrichV123();
    this.taxonomy=OFFSET10_TAXONOMY;this.taxonomyById=OFFSET10_TAXONOMY_BY_ID;
    for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}
    this.original=this.parts.map(p=>p.position.clone());this.root.updateMatrixWorld(true);
  }
  group(parent,id,name,pos=[0,0,0],explode=[0,0,0],sources=['O10-FINAL-DRAWING'],note=''){
    const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:'MACHINE-OFFSET10',nodeId:id,selectable:true,confidence:'DOCUMENT_GROUNDED',sourceFiles:sources,note,explode:V(explode)};
    parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;
  }
  material(kind,owner){
    const key=(owner?.userData?.nodeId||'root')+':'+kind;
    if(!this.materials.has(key)){
      const glass=kind==='glass',foil=kind==='foil';
      this.materials.set(key,new THREE.MeshStandardMaterial({color:this.palette[kind]??this.palette.graphite,metalness:['steel','silver'].includes(kind)?.62:foil?.72:.20,roughness:kind==='paper'?.88:glass?.18:foil?.25:.48,transparent:glass,opacity:glass?.38:1}));
    }return this.materials.get(key);
  }
  mesh(parent,geo,key,kind='graphite',pos=[0,0,0],rotation=null){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,parent));m.position.set(...pos);if(rotation)m.rotation.set(...rotation);m.castShadow=kind!=='glass';m.receiveShadow=true;m.userData={assetId:'MACHINE-OFFSET10',ownerId:parent.userData.nodeId};parent.add(m);this.meshes.push(m);return m;
  }
  box(g,size,pos,kind='graphite',radius=0){return this.mesh(g,()=>radius?new RoundedBoxGeometry(...size,2,radius):new THREE.BoxGeometry(...size),'box:'+size+':'+radius,kind,pos);}
  cylinder(g,r,len,pos,kind='steel',axis='z'){return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,len,18),'cyl:'+r+':'+len,kind,pos,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0]);}
  ring(g,major,minor,pos,kind='steel',axis='z'){return this.mesh(g,()=>new THREE.TorusGeometry(major,minor,8,24),'ring:'+major+':'+minor,kind,pos,axis==='x'?[0,Math.PI/2,0]:axis==='y'?[Math.PI/2,0,0]:[0,0,0]);}
  tube(g,pts,r=.018,kind='rubber'){const curve=new THREE.CatmullRomCurve3(pts.map(V));return this.mesh(g,()=>new THREE.TubeGeometry(curve,28,r,6,false),'tube:'+JSON.stringify(pts)+':'+r,kind);}
  cover(o){if(o)o.userData.exteriorCover=true;return o;}
  service(o){if(o)o.userData.serviceDetail=true;return o;}
  labelPlate(g,text,pos=[0,0,0]){
    const plate=this.box(g,[.30,.12,.018],pos,'black',.012);plate.userData.label=text;return plate;
  }
  tread(g,size,pos){
    const base=this.box(g,size,pos,'steel',.025);base.userData.accessTread=true;return base;
  }
  sidePanel(g,pos,kind='light'){
    const key='cx104-side-panel-v53';
    const mesh=this.mesh(g,()=>{
      const s=new THREE.Shape();
      s.moveTo(-.48,-.84);s.lineTo(.48,-.84);s.lineTo(.48,.40);s.lineTo(.31,.84);s.lineTo(-.31,.84);s.lineTo(-.48,.40);s.closePath();
      const geo=new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:false});geo.computeVertexNormals();return geo;
    },key,kind,pos);
    mesh.userData.exteriorCover=true;return mesh;
  }
  roller(g,r,len,pos,kind,role){
    const m=this.cylinder(g,r,len,pos,kind);m.userData.rollerRadius=r;m.userData.rollerRole=role;m.userData.rotor=true;m.userData.rotorAxis='local-y';
    const numbered=Number((String(role).match(/(\d+)$/)||[])[1]||0);
    const map={plate:1,blanket:-1,impression:1,transfer:-1,fountain:1,'damp-form':-1,'damp-intermediate':1,'damp-distributor':-1,'damp-metering':1,'damp-pan':-1,'coating-anilox':1,'coating-form':-1,'coating-impression':1,'coating-transfer':-1,'sheet-brake':1};
    m.userData.spinDirection=map[role]??(numbered?(numbered%2?-1:1):1);
    m.userData.spinRate=role==='sheet-brake'?1.08:/^(plate|blanket|impression|transfer)$/.test(role)?1:/^coating-/.test(role)?.88:/^damp-/.test(role)?.72:.78;
    return m;
  }
  build(){
    this.buildPlatform();
    const printGroup=this.group(this.root,'o10-printing-units','Printing Units',[0,0,0],[0,.25,.7],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    const coatGroup=this.group(this.root,'o10-coating-units','Coating Units',[0,0,0],[.5,.2,-.4],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    const uvGroup=this.group(this.root,'o10-uv-system','UV / Drying System',[0,0,0],[.6,.5,0],['O10-UV-LAYOUT','O10-PROPOSAL']);
    let printIndex=0;
    for(const module of OFFSET10_MODULE_SEQUENCE){
      const x=OFFSET10_MODULE_CENTERS[module.key];
      if(module.type==='print'){this.buildPrintUnit(printGroup,module.key,x,printIndex++);if(module.foilStar)this.buildFoilStar(x);}
      else if(module.type==='coat')this.buildCoatingUnit(coatGroup,module.key,x);
      else this.buildYUnit(uvGroup,module.key,x);
    }
    this.buildFeeder();
    this.buildDelivery();
    this.buildPeripherals();
    this.buildPrinect();
  }
  buildPlatform(){
    const g=this.group(this.root,'o10-platform','Elevated platform / OS-DS access',[0,0,0],[0,-.35,.8],['O10-FINAL-DRAWING','O10-PROPOSAL'],'Press elevated 564 mm with ergonomic gallery/step access.');
    this.box(g,[27.20,.16,3.18],[1.55,.49,0],'black',.025);
    const os=this.group(g,'o10-platform-os','Operator-side gallery',[0,0,0],[0,-.15,-.5],['O10-PROPOSAL']);
    const ds=this.group(g,'o10-platform-ds','Drive-side gallery',[0,0,0],[0,-.15,.5],['O10-PROPOSAL']);
    this.cover(this.tread(os,[25.90,.09,.60],[1.15,.67,-1.79]));
    this.cover(this.tread(ds,[25.90,.09,.56],[1.15,.67,1.79]));
    for(const x of [-9.6,-5.9,-2.2,1.5,5.2,8.9,12.1])for(const z of [-2.08,2.08])this.cover(this.cylinder(g,.023,.68,[x,1.06,z],'steel','y'));
    for(const z of [-2.08,2.08])this.cover(this.cylinder(g,.022,25.8,[1.2,1.38,z],'steel','x'));
  }
  buildFeeder(){
    const g=this.group(this.root,'o10-feeder','Preset Plus Feeder',[D.feederCenterX,0,0],[-1.2,.1,0],['O10-PROPOSAL','O10-FINAL-DRAWING']);
    const frame=this.group(g,'o10-feeder-frame','Feeder frame',[0,0,0],[-.3,.2,0],['O10-PROPOSAL']);
    this.cover(this.box(frame,[2.60,1.72,3.02],[-.25,1.48,0],'light',.10));
    this.cover(this.box(frame,[1.08,.56,2.80],[-1.42,2.30,0],'graphite',.10));
    const pile=this.group(g,'o10-feeder-pile','Main / non-stop feeder pile',[0,0,0],[-.5,.1,0],['O10-PROPOSAL']);
    this.box(pile,[1.30,.10,1.72],[-1.12,.66,0],'steel',.018);
    this.box(pile,[1.22,1.10,1.62],[-1.12,1.23,0],'paper',.012);
    for(const z of [-.90,.90])this.cylinder(pile,.035,1.20,[-1.48,1.25,z],'steel','y');
    const head=this.group(g,'o10-feeder-head','Preset Plus feeding head',[0,0,0],[-.3,.35,0],['O10-PROPOSAL']);
    this.box(head,[.82,.30,1.72],[-.28,2.40,0],'graphite',.045);
    for(const z of [-.56,-.20,.20,.56]){this.cylinder(head,.035,.26,[-.03,2.20,z],'rubber','y');this.cylinder(head,.020,.18,[.18,2.13,z],'steel','y');}
    const air=this.group(g,'o10-feeder-air','Feeder air manifold',[0,0,0],[-.2,.3,.3],['O10-PROPOSAL']);
    this.cylinder(air,.038,1.58,[.26,2.28,0],'steel','z');for(const z of [-.60,-.30,0,.30,.60])this.tube(air,[[.26,2.28,z],[.42,2.10,z],[.55,1.93,z]],.010,'blue');
    const board=this.group(g,'o10-feedboard','Feed table / register',[1.66,0,0],[-.3,.2,0],['O10-PROPOSAL','O10-FINAL-DRAWING']);
    this.cover(this.box(board,[1.30,.72,2.30],[0,1.05,0],'graphite',.055));
    this.box(board,[1.34,.045,2.14],[0,1.43,0],'steel',.012);
    for(const z of [-.58,0,.58])this.box(board,[1.18,.02,.10],[0,1.47,z],'rubber',.005);
    const align=this.group(board,'o10-feedboard-align','XL sheet alignment / register',[0,0,0],[.2,.25,0],['O10-PROPOSAL']);
    for(const z of [-.50,.50])this.box(align,[.08,.12,.12],[.54,1.50,z],'steel',.010);
    for(const z of [-.68,.68])this.box(align,[1.16,.04,.04],[0,1.50,z],'steel',.006);
  }
  buildPrintUnit(parent,key,x,index){
    const id='o10-'+key.toLowerCase(),label=key.replace('PU','Printing Unit '),g=this.group(parent,id,label,[x,0,0],[0,.2,0],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    g.userData.moduleKey=key;g.userData.moduleType='print';g.userData.printIndex=index;

    const frame=this.group(g,id+'-frame',label+' frame',[0,0,0],[0,.10,.4],['O10-PROPOSAL']);
    const structure=this.group(frame,id+'-frame-structure',label+' paired side frames / crossmembers',[0,0,0],[0,.06,.18],['O10-PROPOSAL']);
    for(const z of [-1.24,1.24])for(const x0 of [-.39,.39])this.box(structure,[.10,1.76,.10],[x0,1.58,z],'steel',.014);
    for(const z of [-1.24,1.24])this.box(structure,[.88,.09,.10],[0,2.44,z],'steel',.012);
    this.box(structure,[.96,.16,2.62],[0,.67,0],'graphite',.025);

    const housing=this.group(g,id+'-frame-side-housing',label+' OS/DS ergonomic side housing',[0,0,0],[0,.15,.45],['O10-FINAL-DRAWING','O10-CX104-OFFICIAL']);
    this.sidePanel(housing,[0,1.72,-1.48],'light');
    this.sidePanel(housing,[0,1.72,1.36],'light');
    const osStrip=this.cover(this.box(housing,[.10,1.42,.025],[-.27,1.79,-1.495],'black',.006));osStrip.userData.intelliline=true;
    const led=this.cover(this.box(housing,[.018,1.10,.012],[-.27,1.84,-1.512],'blue',.004));led.material.emissive.setHex(0x3aa8e8);led.material.emissiveIntensity=.75;
    this.cover(this.box(housing,[.82,.28,2.70],[0,2.57,0],'graphite',.045));
    const unitLabel=this.cover(this.labelPlate(housing,key,[.17,2.30,-1.505]));unitLabel.userData.moduleLabel=true;

    const cyl=this.group(g,id+'-cylinders',label+' cylinder train / AirTransfer',[0,0,0],[0,.18,-.25],['O10-PROPOSAL']);
    const plate=this.group(cyl,id+'-plate','Plate cylinder',[0,0,0],[0,.10,0],['O10-PROPOSAL']);
    const plateMesh=this.roller(plate,.20,2.58,[.10,1.92,0],'steel','plate');plateMesh.userData.cylinderRole='plate';
    const blanket=this.group(cyl,id+'-blanket','Blanket cylinder',[0,0,0],[0,.10,0],['O10-PROPOSAL']);
    const blanketMesh=this.roller(blanket,.22,2.58,[-.08,1.49,0],'rubber','blanket');blanketMesh.userData.cylinderRole='blanket';
    const impression=this.group(cyl,id+'-impression','Double-diameter impression cylinder reference',[0,0,0],[0,.10,0],['O10-PROPOSAL']);
    const impressionMesh=this.roller(impression,.27,2.58,[.10,1.00,0],'steel','impression');impressionMesh.userData.cylinderRole='impression';
    const transfer=this.group(cyl,id+'-transfer','Triple-diameter AirTransfer reference',[0,0,0],[0,.10,0],['O10-PROPOSAL']);
    const transferMesh=this.roller(transfer,.27,2.54,[.43,.53,0],'graphite','transfer');transferMesh.userData.cylinderRole='transfer';
    const gripper=this.group(cyl,id+'-gripper','Low-maintenance universal gripper system',[0,0,0],[.1,.12,0],['O10-PROPOSAL']);
    for(const z of [-.84,-.42,0,.42,.84])this.box(gripper,[.13,.032,.055],[.30,.78,z],'steel',.005);

    const inking=this.group(g,id+'-inking',label+' high-performance inking unit',[0,0,0],[0,.48,.12],['O10-PROPOSAL']);
    const fountain=this.group(inking,id+'-ink-fountain','Foil-protected lined ink fountain',[0,0,0],[-.1,.2,0],['O10-PROPOSAL']);
    this.box(fountain,[.62,.22,2.18],[-.22,2.80,0],'graphite',.028);
    const fountainRoll=this.group(inking,id+'-ink-fountain-roll','Ink fountain roller',[0,0,0],[0,.14,0],['O10-PROPOSAL']);
    this.roller(fountainRoll,.095,2.08,[-.33,2.70,0],'steel','fountain');
    const distributors=this.group(inking,id+'-ink-distributors','Four phase-shifted ink distributors',[0,0,0],[0,.25,0],['O10-PROPOSAL']);
    const distributorData=[[-.30,2.28,.067],[-.10,2.38,.067],[.12,2.38,.067],[.32,2.27,.067]];
    distributorData.forEach((p,i)=>this.roller(distributors,p[2],2.08,[p[0],p[1],0],i%2?'steel':'silver','distributor-'+(i+1)));
    const form=this.group(inking,id+'-ink-form','Four different-sized inking form rollers',[0,0,0],[0,.18,0],['O10-PROPOSAL']);
    const formData=[[-.237,2.119,.060],[-.106,2.205,.065],[.106,2.205,.070],[.237,2.119,.062]];
    formData.forEach((p,i)=>this.roller(form,p[2],2.08,[p[0],p[1],0],'rubber','form-'+(i+1)));
    const transferInk=this.group(inking,id+'-ink-transfer','Ink transfer roller cluster',[0,0,0],[0,.22,0],['O10-PROPOSAL']);
    const transferData=[[-.41,2.47,.050],[-.23,2.55,.052],[0,2.54,.052],[.23,2.54,.052],[.42,2.45,.050]];
    transferData.forEach((p,i)=>this.roller(transferInk,p[2],2.08,[p[0],p[1],0],i%2?'rubber':'steel','transfer-'+(i+1)));
    const inkAux=this.group(inking,id+'-ink-aux','Ink agitator / ink mist extraction',[0,0,0],[0,.20,.2],['O10-PROPOSAL']);
    this.cylinder(inkAux,.022,2.10,[-.26,2.91,0],'steel');this.box(inkAux,[.74,.09,2.14],[.06,2.72,0],'graphite',.016);

    const damp=this.group(g,id+'-dampening','Alcolor five-roller dampening',[0,0,0],[.3,.32,-.18],['O10-PROPOSAL']);
    const rolls=this.group(damp,id+'-damp-rolls','Alcolor roller group',[0,0,0],[0,.18,0],['O10-PROPOSAL']);
    const dampData=[[.29,1.91,.058,'rubber','form'],[.42,2.02,.052,'steel','intermediate'],[.47,1.84,.063,'steel','distributor'],[.44,1.67,.064,'rubber','metering'],[.35,1.54,.072,'steel','pan']];
    dampData.forEach(p=>this.roller(rolls,p[2],2.06,[p[0],p[1],0],p[3],'damp-'+p[4]));
    const pan=this.group(damp,id+'-damp-pan','Dampening solution pan',[0,0,0],[.2,.1,0],['O10-PROPOSAL']);
    this.box(pan,[.38,.09,2.12],[.36,1.44,0],'steel',.018);
    const vario=this.group(damp,id+'-damp-vario','Vario / intermediate roller function',[0,0,0],[.1,.15,0],['O10-PROPOSAL']);
    this.box(vario,[.18,.06,.18],[.42,2.08,-1.14],'graphite',.012);
    const blower=this.group(damp,id+'-damp-blower','Dampening blower bar',[0,0,0],[.1,.15,.2],['O10-PROPOSAL']);
    this.cylinder(blower,.021,2.14,[.47,2.18,0],'steel');

    const auto=this.group(g,id+'-autoplate','AutoPlate plate changer',[0,0,0],[0,.25,.4],['O10-PROPOSAL']);
    this.box(auto,[.70,.11,2.30],[.04,2.31,0],'graphite',.028);
    const wash=this.group(g,id+'-washup','Program-controlled washup devices',[0,0,0],[0,.15,-.4],['O10-PROPOSAL']);
    this.box(wash,[.50,.07,2.10],[-.18,1.22,0],'graphite',.014);
    const airTransfer=this.group(g,id+'-airtransfer','AirTransfer Venturi sheet guidance',[0,0,0],[0,.20,-.2],['O10-PROPOSAL']);
    this.cylinder(airTransfer,.020,2.12,[.42,.86,0],'steel');for(const z of [-.72,-.36,0,.36,.72])this.cylinder(airTransfer,.007,.07,[.42,.80,z],'glass','y');
    const monitor=this.group(airTransfer,id+'-sheet-monitor','Sheet travel monitoring sensors',[0,0,0],[.1,.15,0],['O10-PROPOSAL']);
    for(const z of [-.62,.62])this.box(monitor,[.08,.07,.07],[.45,1.12,z],'black',.010);
  }
  buildFoilStar(x){
    const g=this.group(this.root,'o10-foilstar','FoilStar Gen.3 indexing · superstructure on PU2',[x,0,0],[0,.8,-.4],['O10-PROPOSAL','O10-FINAL-DRAWING'],'FoilStar is mounted directly on PU2; PU1 applies adhesive and PU2 transfers the aluminum pigment.');
    g.userData.mountedOn='PU2';

    const support=this.group(g,'o10-foilstar-superstructure','FoilStar superstructure / mounting frame',[0,0,0],[0,.30,0],['O10-PROPOSAL']);
    for(const z of [-1.22,1.22])for(const x0 of [-.39,.39])this.box(support,[.095,1.30,.095],[x0,3.02,z],'steel',.014);
    for(const z of [-1.22,1.22])this.box(support,[.88,.09,.095],[0,3.64,z],'steel',.012);
    this.box(support,[.86,.10,2.48],[0,2.44,0],'steel',.012);

    const hood=this.group(g,'o10-foilstar-hood','FoilStar upper housing',[0,0,0],[0,.45,0],['O10-CX104-OFFICIAL','O10-PROPOSAL']);
    this.cover(this.box(hood,[.92,1.48,.16],[0,3.48,-1.35],'graphite',.05));
    this.cover(this.box(hood,[.92,1.48,.16],[0,3.48,1.19],'graphite',.05));
    this.cover(this.box(hood,[.92,.24,2.54],[0,4.20,0],'graphite',.05));
    this.cover(this.box(hood,[.16,1.18,2.54],[-.42,3.50,0],'graphite',.04));

    const rolls=this.group(g,'o10-foilstar-rolls','FoilStar unwind / rewind friction shafts',[0,0,0],[0,.5,-.2],['O10-PROPOSAL']);
    const unwind=this.group(rolls,'o10-foilstar-unwinder','Unwinder friction shaft',[0,0,0],[0,.18,0],['O10-PROPOSAL']);
    const rewind=this.group(rolls,'o10-foilstar-rewinder','Rewinder friction shaft',[0,0,0],[0,.18,0],['O10-PROPOSAL']);
    const zPositions=[-.90,-.54,-.18,.18,.54,.90];
    zPositions.forEach((z,i)=>{
      const u=this.cylinder(unwind,.245,.22,[-.08,3.82,z],'foil','z');u.userData.foilReel='unwind';u.userData.reelIndex=i+1;
      this.ring(unwind,.245,.010,[-.08,3.82,z],'steel','z');
      const rw=this.cylinder(rewind,.165,.22,[.17,3.27,z],'graphite','z');rw.userData.foilReel='rewind';rw.userData.reelIndex=i+1;
    });
    this.cylinder(unwind,.045,2.25,[-.08,3.82,0],'steel','z');
    this.cylinder(rewind,.045,2.25,[.17,3.27,0],'steel','z');

    const dancer=this.group(g,'o10-foilstar-dancer','Indexing dancer / double-loop buffer',[0,0,0],[0,.35,.2],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL']);
    for(const [px,py] of [[-.18,3.36],[-.31,3.06],[.03,2.92],[.27,3.09]])this.cylinder(dancer,.045,2.12,[px,py,0],'steel','z');

    const web=this.group(g,'o10-foilstar-web','Foil web guide to and from PU2',[0,0,0],[0,.30,.2],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL']);
    for(const z of zPositions){
      const w=.11;
      const segs=[
        [[-.08,3.56,z],[ -.18,3.39,z]],
        [[-.18,3.31,z],[-.30,3.10,z]],
        [[-.30,3.02,z],[-.06,2.78,z]],
        [[-.06,2.78,z],[.08,2.20,z]],
        [[.08,2.20,z],[.26,2.94,z]],
        [[.26,3.02,z],[.17,3.12,z]]
      ];
      for(const [a,b] of segs){
        const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2,z],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
        const strip=this.box(web,[len,.008,w],mid,'foil',.002);strip.rotation.z=Math.atan2(dy,dx);strip.material.transparent=true;strip.material.opacity=.72;strip.userData.foilWeb=true;
      }
    }
    const nip=this.group(web,'o10-foilstar-transfer-nip','PU2 foil transfer nip',[0,0,0],[0,.12,0],['O10-PROPOSAL']);
    this.box(nip,[.16,.025,2.04],[.08,2.18,0],'foil',.004);

    const sensors=this.group(g,'o10-foilstar-sensors','FoilStar sensors / web monitoring',[0,0,0],[0,.25,.2],['O10-PROPOSAL']);
    for(const z of [-.93,.93])this.box(sensors,[.08,.08,.10],[-.04,3.53,z],'black',.010);
    this.box(sensors,[.12,.08,.10],[.30,3.08,-1.02],'black',.010);

    const ctrl=this.group(g,'o10-foilstar-control','FoilStar touchscreen / drive control',[0,0,0],[0,.3,.35],['O10-PROPOSAL']);
    this.box(ctrl,[.38,.58,.26],[.52,2.88,-1.33],'graphite',.035);
    this.box(ctrl,[.26,.28,.018],[.52,2.96,-1.472],'glass',.008);

    const loading=this.group(g,'o10-foilstar-loading','FoilStar reel loading device',[0,0,0],[0,.4,-.2],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL']);
    this.box(loading,[.10,.72,.10],[-.42,4.03,1.05],'steel',.014);
    const arm=this.box(loading,[.64,.08,.08],[-.12,4.36,1.05],'steel',.014);arm.rotation.z=-.08;
    this.cylinder(loading,.035,.52,[.18,4.18,1.05],'steel','y');
  }
  buildCoatingUnit(parent,key,x){
    const id='o10-'+key.toLowerCase(),label=key==='CUF'?'Final Coating Unit':key.replace('CU','Coating Unit '),g=this.group(parent,id,label,[x,0,0],[.2,.2,-.2],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    g.userData.moduleKey=key;g.userData.moduleType='coat';
    const frame=this.group(g,id+'-frame',label+' frame',[0,0,0],[0,.1,0],['O10-PROPOSAL']);
    const structure=this.group(frame,id+'-frame-structure',label+' structural frame',[0,0,0],[0,.06,.15],['O10-PROPOSAL']);
    for(const z of [-1.24,1.24])for(const x0 of [-.40,.40])this.box(structure,[.10,1.76,.10],[x0,1.58,z],'steel',.014);
    this.box(structure,[.96,.16,2.62],[0,.67,0],'graphite',.025);
    const housing=this.group(frame,id+'-frame-side-housing',label+' OS/DS housing',[0,0,0],[0,.15,.42],['O10-FINAL-DRAWING','O10-CX104-OFFICIAL']);
    this.sidePanel(housing,[0,1.72,-1.48],'light');this.sidePanel(housing,[0,1.72,1.36],'light');
    this.cover(this.box(housing,[.82,.25,2.70],[0,2.56,0],'graphite',.04));

    const chamber=this.group(g,id+'-chamber','Pressurized chamber doctor blade',[0,0,0],[0,.2,-.2],['O10-PROPOSAL','O10-CX104-OFFICIAL']);
    this.box(chamber,[.42,.16,2.18],[-.27,2.22,0],'graphite',.025);
    const anilox=this.group(g,id+'-anilox','Exchangeable Saphira anilox / screen roller',[0,0,0],[0,.15,0],['O10-PROPOSAL']);
    this.roller(anilox,.115,2.24,[-.10,2.01,0],'steel','coating-anilox');
    const drip=this.group(g,id+'-drip-tray','Coating drip tray / level sensor',[0,0,0],[0,.1,0],['O10-CX104-OFFICIAL']);
    this.box(drip,[.38,.08,2.22],[-.16,1.84,0],'steel',.018);
    const form=this.group(g,id+'-form','Coating form / blanket cylinder',[0,0,0],[0,.15,0],['O10-PROPOSAL']);
    this.roller(form,.22,2.54,[.06,1.54,0],'rubber','coating-form');
    const imp=this.group(g,id+'-impression','Coating impression / sheet transfer',[0,0,0],[0,.15,0],['O10-PROPOSAL']);
    this.roller(imp,.27,2.54,[.10,1.02,0],'steel','coating-impression');
    const transfer=this.group(g,id+'-transfer','Coating transfer / AirTransfer',[0,0,0],[0,.12,0],['O10-PROPOSAL']);
    this.roller(transfer,.27,2.50,[.42,.55,0],'graphite','coating-transfer');
    const supply=this.group(g,id+'-supply','CoatingStar supply interface',[0,0,0],[.1,.1,.2],['O10-PROPOSAL','O10-TECH-DATA']);
    this.tube(supply,[[-.34,2.15,.91],[-.45,1.72,.91],[-.43,1.04,.91]],.018,'blue');
  }
  buildYUnit(parent,key,x){
    const id='o10-'+key.toLowerCase(),g=this.group(parent,id,key.replace('Y','Y Unit ')+' · Interdeck UV',[x,0,0],[.2,.5,0],['O10-UV-LAYOUT','O10-FINAL-DRAWING','O10-PROPOSAL']);
    g.userData.moduleKey=key;g.userData.moduleType='dryer';
    const frame=this.group(g,id+'-frame',key+' dryer suspension frame',[0,0,0],[0,.1,0],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    const structure=this.group(frame,id+'-frame-structure',key+' structural suspension',[0,0,0],[0,.06,.14],['O10-FINAL-DRAWING']);
    for(const z of [-1.20,1.20])for(const x0 of [-.34,.34])this.box(structure,[.09,1.50,.09],[x0,1.50,z],'steel',.014);
    this.box(structure,[.78,.09,2.48],[0,2.25,0],'steel',.012);
    const housing=this.group(frame,id+'-frame-side-housing',key+' radiation shielding / service cover',[0,0,0],[0,.15,.40],['O10-PROPOSAL']);
    this.cover(this.box(housing,[.80,.86,.14],[0,1.75,-1.40],'graphite',.035));
    this.cover(this.box(housing,[.80,.86,.14],[0,1.75,1.26],'graphite',.035));
    this.cover(this.box(housing,[.80,.24,2.56],[0,2.29,0],'graphite',.035));

    const uv=this.group(g,id+'-uv',key+' · three IST UV slide-in cassettes',[0,0,0],[0,.35,0],['O10-UV-LAYOUT','O10-PROPOSAL']);
    for(let i=0;i<3;i++){
      const cx=-.24+i*.24,cass=this.group(uv,id+'-uv-cassette-'+(i+1),'UV cassette '+(i+1),[0,0,0],[0,.2,0],['O10-UV-LAYOUT']);
      this.box(cass,[.18,.085,2.20],[cx,1.90,0],'graphite',.014);
      const lamp=this.box(cass,[.12,.022,2.08],[cx,1.84,0],'violet',.004);lamp.userData.uvLamp=true;lamp.material.emissive.setHex(0x5d38ff);lamp.material.emissiveIntensity=.08;
      const beam=this.box(cass,[.12,.22,2.02],[cx,1.70,0],'glass',.003);beam.userData.uvBeam=true;beam.material.color.setHex(0x714cff);beam.material.emissive.setHex(0x5c39ff);beam.material.emissiveIntensity=.8;beam.material.opacity=.15;beam.material.depthWrite=false;beam.visible=false;
    }
    const guide=this.group(g,id+'-sheet-guide',key+' adjustable sheet guide / radiation shield',[0,0,0],[0,.12,0],['O10-PROPOSAL']);
    this.box(guide,[.74,.035,2.28],[0,1.48,0],'steel',.008);
  }
  buildDelivery(){
    const g=this.group(this.root,'o10-delivery','Preset Plus X3 Delivery',[D.deliveryCenterX,0,0],[1.2,.1,0],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    const x3=this.group(g,'o10-delivery-x3','Delivery extension X3',[0,0,0],[.4,.25,0],['O10-FINAL-DRAWING','O10-PROPOSAL']);
    const moduleXs=[-1.28,-.05,1.18];
    moduleXs.forEach((x,i)=>{
      const hood=this.group(x3,'o10-delivery-x'+(i+1),'X'+(i+1)+' delivery extension',[0,0,0],[.2,.2,0],['O10-FINAL-DRAWING']);
      this.cover(this.box(hood,[1.02,1.22,.16],[x,2.02,-1.42],'graphite',.05));
      this.cover(this.box(hood,[1.02,1.22,.16],[x,2.02,1.26],'graphite',.05));
      this.cover(this.box(hood,[1.02,.22,2.72],[x,2.57,0],'graphite',.05));
      this.box(hood,[.94,.08,2.44],[x,1.36,0],'steel',.018);
    });

    const eop=this.group(g,'o10-eop-uv','End-of-Press UV · 3 slide-out cassettes',[0,0,0],[.3,.5,0],['O10-UV-LAYOUT','O10-PROPOSAL']);
    for(let i=0;i<3;i++){
      const x=-1.22+i*.46,cass=this.group(eop,'o10-eop-uv-cassette-'+(i+1),'EOP UV cassette '+(i+1),[0,0,0],[0,.2,0],['O10-UV-LAYOUT']);
      this.box(cass,[.34,.09,2.24],[x,1.91,0],'graphite',.014);
      const lamp=this.box(cass,[.22,.022,2.10],[x,1.85,0],'violet',.004);lamp.userData.uvLamp=true;lamp.material.emissive.setHex(0x5d38ff);lamp.material.emissiveIntensity=.08;
      const beam=this.box(cass,[.20,.22,2.04],[x,1.71,0],'glass',.003);beam.userData.uvBeam=true;beam.material.color.setHex(0x714cff);beam.material.emissive.setHex(0x5c39ff);beam.material.opacity=.15;beam.material.depthWrite=false;beam.visible=false;
    }
    const combi=this.group(g,'o10-drystar-combination','DryStar Combination CAN 2E',[0,0,0],[.3,.35,0],['O10-TECH-DATA','O10-CX104-OFFICIAL']);
    for(const x of [-.70,-.16])this.box(combi,[.44,.10,2.22],[x,2.18,0],'graphite',.014);
    const cold=this.group(g,'o10-drystar-coldair','DryStar ColdAir 18°C',[0,0,0],[.3,.25,0],['O10-TECH-DATA']);
    this.box(cold,[.42,.10,2.22],[.42,2.18,0],'blue',.014);

    const chain=this.group(g,'o10-delivery-chain','Delivery gripper chain / guide rails',[0,0,0],[.3,.15,0],['O10-PROPOSAL']);
    for(const z of [-1.00,1.00])this.box(chain,[4.05,.055,.055],[.12,1.46,z],'steel',.010);
    const brake=this.group(g,'o10-delivery-sheet-brake','Presettable dynamic sheet brake',[0,0,0],[.3,.12,0],['O10-PROPOSAL','O10-CX104-OFFICIAL']);
    for(const z of [-.62,0,.62])this.roller(brake,.055,.22,[1.42,1.28,z],'rubber','sheet-brake');

    const pile=this.group(g,'o10-delivery-pile','Automatic non-stop delivery pile',[0,0,0],[.4,.1,0],['O10-PROPOSAL']);
    this.box(pile,[1.42,.10,1.80],[1.16,.70,0],'steel',.016);
    const paper=this.group(pile,'o10-delivery-paper-stack','Printed sheet receiving stack',[0,0,0],[.2,.1,0],['O10-PROPOSAL']);
    this.box(paper,[1.26,.88,1.66],[1.16,1.20,0],'paper',.010);
    for(let n=0;n<18;n++)this.box(paper,[1.265,.004,1.665],[1.16,.78+n*.045,0],'light');

    const air=this.group(g,'o10-delivery-air','Delivery air / Venturi guidance',[0,0,0],[.3,.2,0],['O10-PROPOSAL']);
    this.cylinder(air,.024,2.14,[.70,1.62,0],'steel','z');
    const control=this.group(g,'o10-delivery-control','Delivery local control / access',[0,0,0],[.2,.12,-.3],['O10-PROPOSAL']);
    this.box(control,[.38,.68,.26],[2.00,1.68,-1.38],'light',.04);
  }
  buildPeripherals(){
    const g=this.group(this.root,'o10-peripherals','Documented peripheral equipment',[0,0,0],[0,.5,1],['O10-FINAL-DRAWING','O10-TECH-DATA','O10-SYSTEM']);
    const units=[
      ['o10-central-cabinet','Central Control Cabinet',[-7.5,.85,3.20],[1.50,1.70,.68]],
      ['o10-airstar','AirStar Pro A1-R3-W',[-4.9,.72,3.22],[1.20,1.44,.72]],
      ['o10-combistar','CombiStar / beta.c',[ -2.9,.72,3.22],[1.14,1.44,.72]],
      ['o10-filterstar','FilterStar Compact',[-1.55,.72,3.22],[.74,1.44,.72]],
      ['o10-scrollstar','ScrollStar Plus',[-.50,.72,3.22],[.82,1.44,.72]],
      ['o10-lvg600','LVG-600 Varnish Supply',[5.20,.72,3.24],[1.05,1.44,.72]],
      ['o10-coatingstar','CoatingStar Compact Units',[7.00,.72,3.24],[1.36,1.44,.72]],
      ['o10-uv-xlc','UV XLC Control',[9.10,.90,3.22],[1.20,1.80,.76]],
      ['o10-uv-exhaust','UV Exhaust / Magic Cube',[11.0,.90,3.22],[1.20,1.80,.76]]
    ];
    for(const [id,name,pos,size] of units){const u=this.group(g,id,name,[0,0,0],[0,.2,.3],['O10-TECH-DATA','O10-FINAL-DRAWING']);this.box(u,size,pos,'graphite',.055);this.box(u,[size[0]*.72,size[1]*.18,.018],[pos[0],pos[1]+size[1]*.23,pos[2]-size[2]/2-.012],'light',.008);}
    const cool=this.group(g,'o10-cooling','Technotrans cooling-water system',[0,0,0],[0,.2,1],['O10-SYSTEM']);for(const x of [-2.9,0,2.9,5.8,8.7])this.tube(cool,[[x,.62,2.82],[x,.42,2.55],[x,.42,2.20]],.026,'blue');
  }
  buildPrinect(){
    const g=this.group(this.root,'o10-prinect-center','Prinect Press Center XL 3',[0,0,0],[0,.4,-.8],['O10-PROPOSAL','O10-FINAL-DRAWING']);
    this.box(g,[2.10,.86,.92],[-7.0,1.04,-3.05],'light',.08);
    this.box(g,[1.46,.62,.06],[-7.0,1.74,-2.62],'black',.025);
    this.box(g,[1.30,.50,.025],[-7.0,1.75,-2.585],'glass',.018);
    this.box(g,[1.94,.06,.70],[-7.0,1.48,-2.84],'steel',.018);
  }
  enrichV123(){
    this.root.userData.researchVersion='V123';
    this.root.userData.researchSourceCount=V123_SOURCE_STATS.total;
    this.root.userData.detailPass='V123_CX104_COATING_AIRTRANSFER_DELIVERY_FOILSTAR';
    const tag=(m,role,evidence='HEIDELBERG_CX104_OEM')=>{if(m){m.userData.mechanismRole=role;m.userData.evidence=evidence;m.userData.detail=true;}return m;};
    for(const key of ['CU1','CU2','CUF']){
      const id='o10-'+key.toLowerCase(),ch=this.findNode(id+'-chamber'),an=this.findNode(id+'-anilox'),drip=this.findNode(id+'-drip-tray');
      if(ch){
        tag(this.box(ch,[.36,.018,2.08],[-.27,2.285,0],'steel',.003),'doctor-blade-metering-edge');
        tag(this.box(ch,[.36,.018,2.08],[-.27,2.155,0],'steel',.003),'doctor-blade-sealing-edge');
        ch.userData.oemArchitecture='PRESSURIZED_CHAMBER_DOCTOR_BLADE';
      }
      if(an){
        for(const z of [-1.15,1.15])tag(this.box(an,[.16,.16,.10],[-.10,2.01,z],'graphite',.010),'compact-anilox-bearing-unit');
      }
      if(drip){
        for(const z of [-.86,.86])tag(this.box(drip,[.055,.10,.055],[.02,1.91,z],'blue',.006),'coating-level-sensor');
        drip.userData.oemFunction='DRIP_TRAY_WITH_LEVEL_SENSING';
      }
    }
    for(const m of OFFSET10_MODULE_SEQUENCE.filter(x=>x.type==='print')){
      const air=this.findNode('o10-'+m.key.toLowerCase()+'-airtransfer');
      if(air){
        air.userData.oemFunction='CONTACT_FREE_SHEET_GUIDE_VENTURI';
        air.userData.venturiNozzleTechnology=true;
        for(const z of [-.72,0,.72])tag(this.box(air,[.10,.018,.065],[.34,.84,z],'silver',.004),'airtransfer-venturi-nozzle');
      }
    }
    const brake=this.findNode('o10-delivery-sheet-brake');
    if(brake){
      brake.userData.oemFunction='PRESETTABLE_DYNAMIC_SHEET_BRAKE';
      for(const z of [-.90,-.30,.30,.90])tag(this.box(brake,[.34,.025,.08],[1.30,1.18,z],'black',.004),'sheet-brake-belt-reference');
      for(const z of [-.90,.90])tag(this.box(brake,[.08,.16,.08],[1.58,1.15,z],'steel',.006),'sheet-brake-position-sensor');
    }
    const pile=this.findNode('o10-delivery-pile');
    if(pile){
      for(const z of [-.78,.78])tag(this.box(pile,[.06,.18,.06],[1.72,1.08,z],'blue',.006),'delivery-pile-height-sensor');
    }
    const foil=this.findNode('o10-foilstar');
    if(foil){
      foil.userData.oemIndexingConfirmed=true;
      foil.userData.minimumFoilThicknessMicron=6;
      const sensors=this.findNode('o10-foilstar-sensors');
      if(sensors){
        tag(this.cylinder(sensors,.035,.08,[-.08,3.82,1.10],'steel','z'),'foil-unwind-index-encoder','HEIDELBERG_FOILSTAR');
        tag(this.cylinder(sensors,.035,.08,[.17,3.27,1.10],'steel','z'),'foil-rewind-index-encoder','HEIDELBERG_FOILSTAR');
        tag(this.box(sensors,[.08,.08,.06],[-.18,3.36,1.04],'blue',.006),'foil-dancer-position-sensor','HEIDELBERG_FOILSTAR');
      }
    }
  }
  resolvePart(object){let p=object;while(p&&p!==this.root){if(p.userData.selectable)return p;p=p.parent;}return null;}
  findNode(nodeId){return nodeId==='MACHINE-OFFSET10'?this.root:this.nodes.find(n=>n.userData.nodeId===nodeId)||null;}
  resolveTaxonomyNode(taxonomyId){
    let meta=this.taxonomyById.get(taxonomyId);
    while(meta){for(const ref of meta.meshRefs||[]){const node=this.findNode(ref);if(node)return node;}meta=meta.parentId?this.taxonomyById.get(meta.parentId):null;}
    return taxonomyId==='O10'?this.root:null;
  }
  contains(parent,node){for(let p=node;p;p=p.parent)if(p===parent)return true;return false;}
  explode(t,selected=null){const amount=THREE.MathUtils.clamp(Number(t)||0,0,1);for(const n of this.nodes)n.position.copy(n.userData.rest);const children=selected?.children.filter(c=>c.userData.selectable);const targets=selected?(children?.length?children:[selected]):this.parts;if(amount)for(const n of targets)n.position.addScaledVector(n.userData.explode,amount);this.root.updateMatrixWorld(true);}
  highlight(part){for(const m of this.meshes){m.material.emissive?.setHex(part&&this.contains(part,m)?0x174b47:0x000000);if(m.material.emissive)m.material.emissiveIntensity=.28;}}
  highlightMany(parts=[]){for(const m of this.meshes){const on=parts.some(part=>this.contains(part,m));m.material.emissive?.setHex(on?0x174b47:0);if(m.material.emissive)m.material.emissiveIntensity=.28;}}
  ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const faded=on&&(!except||!this.contains(except,m)),glass=m.material.color?.getHex()===this.palette.glass;m.material.transparent=faded||glass;m.material.opacity=faded?.14:glass?.38:1;m.material.depthWrite=!faded;m.material.needsUpdate=true;}}
  isolate(part,on=true){for(const n of this.nodes)n.visible=!on||!part||this.contains(part,n)||this.contains(n,part);}
  showOnly(parts=[],on=true){for(const n of this.nodes)n.visible=!on||!parts.length||parts.some(part=>n===part||this.contains(n,part));}
  setExteriorOpen(on=true){
    this.exteriorOpen=!!on;let hidden=0,serviceHidden=0;
    for(const n of this.nodes){
      if(n.userData.exteriorCover){n.visible=!this.exteriorOpen;if(this.exteriorOpen)hidden++;}
      if(n.userData.serviceDetail){n.visible=!this.exteriorOpen;if(this.exteriorOpen)serviceHidden++;}
    }
    for(const m of this.meshes){
      if(m.userData.exteriorCover){m.visible=!this.exteriorOpen;if(this.exteriorOpen)hidden++;}
      if(m.userData.serviceDetail){m.visible=!this.exteriorOpen;if(this.exteriorOpen)serviceHidden++;}
    }
    this.root.userData.exteriorHiddenCount=this.exteriorOpen?hidden:0;
    this.root.userData.serviceDetailHiddenCount=this.exteriorOpen?serviceHidden:0;
    this.root.userData.interiorCutawayVisible=this.exteriorOpen;
    this.root.updateMatrixWorld(true);
  }
  setLow(on){for(const m of this.meshes)if(m.userData.detail)m.visible=!on;}
  reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);if(open)this.setExteriorOpen(true);}
  dispose(){for(const g of this.geometries.values())g.dispose();for(const m of this.materials.values())m.dispose();}
}

export const OFFSET10_MODULE_COLORS=Object.freeze(PRINT_COLORS);
