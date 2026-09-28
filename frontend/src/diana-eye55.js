import * as THREE from 'three';import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {DIANA_EYE55_SPEC} from './data/dimensions-diana-eye55.js';import {DIANA_EYE55_TAXONOMY,DIANA_EYE55_TAXONOMY_BY_ID} from './data/taxonomy-diana-eye55.js';import {DIANA_EYE55_ORIENTATION,DIANA_EYE55_TECHNICAL_SOURCES} from './data/sources-diana-eye55.js';import {V141_SOURCE_STATS} from './data/research-v141.js';
const V=a=>new THREE.Vector3(...a);
export class DianaEye55MachineTemplate{
 constructor(){this.spec=DIANA_EYE55_SPEC;this.root=new THREE.Group();this.root.name='IPM 3 · DIANA EYE 55';this.root.userData={assetId:this.spec.assetId,nodeId:'diana55-root',spec:this.spec,sources:DIANA_EYE55_TECHNICAL_SOURCES,orientation:DIANA_EYE55_ORIENTATION,taxonomyVersion:'diana55-v252-oem-flow',detailPass:'V252_DIANA55_OEM_SILHOUETTE_FISHSCALE_FLOW',evidenceGrade:'OEM_PROCESS_GROUNDED',geometryStatus:'OEM_CURRENT_FAMILY_ENVELOPE_AND_PROCESS__BMJ_INSTALLED_OPTIONS_BOUNDED',engineeringDimensions:false,modeledEnvelopeMode:'STANDARD_FEEDER_FISH_SCALE_DELIVERY_REFERENCE'};this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.build();this.enrichV141();this.refineV254();this.refineV255();this.taxonomy=DIANA_EYE55_TAXONOMY;this.taxonomyById=DIANA_EYE55_TAXONOMY_BY_ID;for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);}
 group(parent,id,name,pos=[0,0,0],explode=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:this.spec.assetId,nodeId:id,selectable:true,explode:V(explode),confidence:'OEM_PROCESS_GROUNDED'};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mat(k){if(!this.materials.has(k)){const c={white:0xebeeee,light:0xcbd0d2,dark:0x252b2f,black:0x0d1215,steel:0x8a969b,silver:0xc3cacc,rubber:0x23282a,red:0xb4312e,blue:0x3c7289,green:0x579071,amber:0xd29b43,paper:0xe1cca2,glass:0x365c67,led:0xf0e7c2}[k]||0x888888;const m=new THREE.MeshStandardMaterial({color:c,metalness:['steel','silver'].includes(k)?.5:.08,roughness:k==='glass'?.16:.43,transparent:k==='glass',opacity:k==='glass'?.42:1});m.userData.baseOpacity=m.opacity;this.materials.set(k,m);}return this.materials.get(k);}
 mesh(g,geo,key,k='dark',p=[0,0,0],r=null){if(!this.geometries.has(key))this.geometries.set(key,geo());const m=new THREE.Mesh(this.geometries.get(key),this.mat(k));m.position.set(...p);if(r)m.rotation.set(...r);m.castShadow=k!=='glass';m.receiveShadow=true;m.userData.ownerId=g.userData.nodeId;g.add(m);this.meshes.push(m);return m;}
 box(g,s,p,k='dark',rad=.02){return this.mesh(g,()=>rad?new RoundedBoxGeometry(...s,2,rad):new THREE.BoxGeometry(...s),'b'+s+rad,k,p);}
 cyl(g,r,l,p,k='steel',role='',axis='z'){
  const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null,m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,22),'c'+r+l+axis,k,p,rot);
  const rotating=/^(feed-pulley|transport-pulley|vacuum-blower|delivery-pulley)$/.test(role);
  m.userData.rotor=rotating;m.userData.mechanismRole=role;m.userData.rotorAxis=axis;m.userData.radius=r;
  if(rotating)m.userData.spinDirection=/^(transport-pulley|delivery-pulley)$/.test(role)?-1:1;
  return m;
 }cover(m){m.userData.exteriorCover=true;return m;}
 build(){this.buildAccess();this.buildFeeder();this.buildTransport();this.buildInspection();this.buildCameras();this.buildLights();this.buildProcessing();this.buildReject();this.buildDelivery();this.buildExteriorIdentity();}
 buildAccess(){
  const g=this.group(this.root,'diana55-access','Frame and guarding');
  const frame=this.group(g,'diana55-access-frame','Machine base and side frames');
  this.box(frame,[7.34,.20,1.54],[0,.12,0],'dark',.035);
  for(let x=-3.55;x<=3.55;x+=.72)for(const z of [-.68,.68])this.box(frame,[.07,.46,.07],[x,.36,z],'steel',.010);
  const guard=this.group(g,'diana55-access-guard','Inspection-cell safety panels');
  for(const z of [-.77,.77]){this.cover(this.box(guard,[1.72,1.28,.07],[-.22,1.29,z],'white',.045));const stripe=this.cover(this.box(guard,[1.72,.065,.075],[-.22,.86,z+(z<0?-.018:.018)],'red',.008));stripe.userData.familyIdentityStripe=true;}
  const door=this.group(g,'diana55-access-door','Inspection service-access panels');
  for(const x of [-.62,.18]){const p=this.cover(this.box(door,[.62,.62,.025],[x,1.27,-.815],'light',.020));p.userData.serviceDoor=true;}
 }
 buildFeeder(){
  const g=this.group(this.root,'diana55-feeder','Blank feeding and alignment',[-3.20,0,0],[-.68,.16,0]);
  const stack=this.group(g,'diana55-feed-stack','Low blank pile / feeding table');this.box(stack,[.92,.07,1.12],[-.26,.31,0],'steel',.010);
  for(let i=0;i<9;i++)this.box(stack,[.58,.008,.82],[-.30,.37+i*.010,0],'paper',.001);
  const friction=this.group(g,'diana55-feed-friction','Stable feeding belts / feeding-knife zone');
  for(const z of [-.43,-.14,.14,.43]){const belt=this.box(friction,[1.22,.024,.105],[.24,.73,z],'green',.004);belt.userData.feedBelt=true;this.cyl(friction,.052,.14,[.76,.72,z],'amber','feed-pulley','z');}
  const align=this.group(g,'diana55-feed-align','Open alignment and pressing guides');
  for(const z of [-.56,.56]){this.box(align,[1.24,.045,.035],[.25,.93,z],'steel',.006);for(const x of [-.25,.18,.60])this.cyl(align,.038,.10,[x,.84,z*.72],'amber','guide-wheel','z');}
  const dbl=this.group(g,'diana55-feed-double','Ultrasonic double-sheet sensing zone');for(const z of [-.38,.38])this.box(dbl,[.07,.17,.09],[.72,.98,z],z<0?'blue':'green',.012);
 }
 buildTransport(){
  const g=this.group(this.root,'diana55-transport','Suction-belt transport',[-1.86,0,0],[-.30,.16,0]);
  const belt=this.group(g,'diana55-transport-belt','Suction belt');
  for(const z of [-.48,-.24,0,.24,.48]){const b=this.box(belt,[2.18,.023,.09],[0,.73,z],'green',.004);b.userData.suctionBelt=true;for(const x of [-.93,.93])this.cyl(belt,.050,.13,[x,.72,z],'steel','transport-pulley','z');}
  const drive=this.group(g,'diana55-transport-drive','Suction-belt drive / encoder reference');const motor=this.cyl(drive,.095,.22,[-.84,.46,.61],'dark','transport-drive-motor','x');motor.userData.rotor=true;motor.userData.rotorAxis='x';motor.userData.spinDirection=1;const enc=this.cyl(drive,.050,.024,[.84,.72,.61],'blue','transport-encoder','z');enc.userData.rotor=true;enc.userData.rotorAxis='z';enc.userData.spinDirection=-1;
  const vac=this.group(g,'diana55-transport-vacuum','Vacuum plenum');this.box(vac,[2.06,.26,1.12],[0,.51,0],'dark',.025);for(const x of [-.64,0,.64])this.cyl(vac,.050,.44,[x,.37,.59],'blue','vacuum-blower','x');
  const trigger=this.group(g,'diana55-transport-trigger','Inspection trigger / blank presence sensing');for(const z of [-.34,.34]){const p=this.box(trigger,[.040,.070,.040],[.82,.91,z],z<0?'blue':'green',.004);p.userData.mechanismRole=z<0?'inspection-trigger-emitter':'inspection-trigger-receiver';}
  const guide=this.group(g,'diana55-transport-guide','Transport guide rails');for(const z of [-.58,.58])this.box(guide,[2.14,.045,.035],[0,.94,z],'steel',.006);
 }
 buildInspection(){
  const g=this.group(this.root,'diana55-inspection','Inspection enclosure',[-.24,0,0],[0,.30,.42]);
  const tunnel=this.group(g,'diana55-inspection-tunnel','White inspection cell / enclosure');this.cover(this.box(tunnel,[1.72,1.34,1.54],[0,1.30,0],'white',.055));
  const window=this.group(g,'diana55-inspection-window','Darkened inspection window');for(const z of [-.79,.79]){const w=this.box(window,[1.22,.66,.022],[0,1.36,z],'glass',.030);w.userData.inspectionAperture=true;w.userData.silhouetteCritical=true;}
  const bed=this.group(g,'diana55-inspection-bed','Inspection suction-belt bed');for(const z of [-.48,-.24,0,.24,.48]){const b=this.box(bed,[1.70,.023,.09],[0,.73,z],'green',.004);b.userData.inspectBelt=true;}
 }
 buildCameras(){
  const g=this.group(this.root,'diana55-camera','Camera system',[-.24,0,0],[0,.45,.45]);
  const top=this.group(g,'diana55-camera-top','Upper camera rail · installed population unverified');top.userData.capacity=4;top.userData.installedCountVerified=false;
  this.box(top,[1.22,.055,.12],[0,1.84,0],'steel',.008);
  for(const x of [-.54,-.18,.18,.54]){const mount=this.box(top,[.08,.11,.10],[x,1.79,0],'dark',.010);mount.userData.cameraBay=true;mount.userData.capabilityMount=true;}
  const installedNeutral=this.box(top,[.22,.24,.20],[0,1.72,0],'dark',.022);installedNeutral.userData.cameraPopulationReference='ONE_NEUTRAL_HEAD_VISIBLE__ACTUAL_COUNT_UNKNOWN';installedNeutral.userData.installedCountAsserted=false;
  const barrel=this.cyl(top,.055,.080,[0,1.58,0],'dark','camera-optical-barrel','y');barrel.userData.opticalAxis='NEGATIVE_Y_TOWARD_SUCTION_BELT';barrel.userData.installedPopulationReferenceOnly=true;
  const lens=this.cyl(top,.046,.018,[0,1.535,0],'black','camera-lens','y');lens.userData.opticalAxis='NEGATIVE_Y_TOWARD_SUCTION_BELT';lens.userData.scanPlaneY=.73;lens.userData.installedPopulationReferenceOnly=true;
  const low=this.group(g,'diana55-camera-low','Low-angle mirror path');for(const z of [-.48,.48]){const m=this.box(low,[.38,.020,.15],[-.20,1.30,z],'silver',.004);m.rotation.z=z<0?.22:-.22;}
  const rear=this.group(g,'diana55-camera-rear','Rear-side camera capability bay');rear.userData.capacity=1;rear.userData.installedCountVerified=false;rear.userData.capabilityOnly=true;rear.visible=false;this.box(rear,[.20,.18,.18],[.30,.58,0],'dark',.020);
  const area=this.group(g,'diana55-camera-area','Area-camera capability bays');area.userData.capacity=2;area.userData.installedCountVerified=false;area.userData.capabilityOnly=true;area.visible=false;for(const z of [-.52,.52])this.box(area,[.17,.20,.17],[.44,1.45,z],'dark',.018);
 }
 buildLights(){
  const g=this.group(this.root,'diana55-light','LED illumination',[-.24,0,0],[0,.45,-.42]);
  const dome=this.group(g,'diana55-light-dome','Light-dome architecture');
  for(const x of [-.48,0,.48]){const a=this.box(dome,[.34,.05,1.06],[x,1.51,0],'led',.020);a.userData.inspectionLight=true;a.material=a.material.clone();a.material.userData.baseOpacity=1;for(let z=-.42;z<=.42;z+=.14){const fin=this.box(dome,[.28,.045,.016],[x,1.565,z],'silver',.002);fin.userData.mechanismRole='light-housing-cooling-fin-reference';}}
  const led=this.group(g,'diana55-light-led','Software-adjustable LED arrays');for(const z of [-.48,-.24,0,.24,.48]){const a=this.box(led,[1.12,.030,.045],[0,1.18,z],'led',.006);a.userData.inspectionLight=true;a.material=a.material.clone();a.material.userData.baseOpacity=1;}
  const low=this.group(g,'diana55-light-low','Low-angle illumination');for(const z of [-.56,.56]){const a=this.box(low,[1.02,.035,.045],[.06,1.00,z],'led',.006);a.rotation.x=z<0?.18:-.18;a.userData.inspectionLight=true;a.material=a.material.clone();a.material.userData.baseOpacity=1;}
 }
 buildProcessing(){
  const g=this.group(this.root,'diana55-processing','Image processing and operator interface',[.96,0,0],[.25,.20,.52]);
  const compute=this.group(g,'diana55-process-compute','GPU+CPU processing cabinet');this.box(compute,[.62,1.18,.54],[.06,.86,.66],'dark',.035);for(let y=.48;y<1.26;y+=.16)this.box(compute,[.40,.026,.020],[.38,y,.94],'steel',0);
  const hmi=this.group(g,'diana55-process-hmi','Operator terminal interface');hmi.userData.externalPedestal=true;
  const recipe=this.group(g,'diana55-process-recipe','Master / tolerance recipe interface');this.box(recipe,[.38,.15,.24],[.34,.62,-.72],'red',.018);
 }
 buildReject(){
  const g=this.group(this.root,'diana55-reject','Blank ejection / sorting',[1.62,0,0],[.52,.16,0]);g.userData.installedRejectActuationVerified=false;
  const gate=this.group(g,'diana55-reject-gate','Neutral defect-ejection diverter · installed actuator unverified');gate.userData.rejectReference='neutral-diverter';
  const blade=this.box(gate,[.10,.28,1.00],[-.04,.86,0],'red',.018);blade.userData.rejectGate=true;
  const home=this.box(gate,[.040,.050,.035],[-.18,1.02,-.42],'green',.004);home.userData.mechanismRole='reject-home-sensor-reference';
  const air=this.group(g,'diana55-reject-air','Blowing-ejection capability reference');air.userData.rejectReference='air-nozzle';air.userData.capabilityOnly=true;air.visible=false;for(const z of [-.30,-.10,.10,.30]){const n=this.cyl(air,.016,.07,[-.08,.84,z],'blue','reject-air-nozzle','x');n.userData.rejectAirNozzle=true;}
  const chute=this.group(g,'diana55-reject-chute','Defect ejection channel');this.box(chute,[.86,.07,.54],[.28,.48,.52],'steel',.014);const bin=this.box(chute,[.60,.30,.54],[.50,.28,.52],'light',.022);bin.userData.rejectCollection=true;
  const sensor=this.group(g,'diana55-reject-sensor','Reject confirmation sensing');for(const z of [-.36,.36])this.box(sensor,[.07,.13,.08],[-.44,.96,z],'blue',.010);
 }
 buildDelivery(){
  const g=this.group(this.root,'diana55-delivery','Fish-scale accepted/waste delivery',[2.78,0,0],[.72,.16,0]);
  const belt=this.group(g,'diana55-delivery-belt','Fish-scale delivery belts');
  for(const z of [-.42,-.14,.14,.42]){this.box(belt,[2.02,.023,.09],[.15,.70,z],'green',.004);for(const x of [-.78,.92])this.cyl(belt,.052,.13,[x,.69,z],'steel','delivery-pulley','z');}
  const stack=this.group(g,'diana55-delivery-stack','Fish-scale delivery / buffer interface');stack.userData.deliveryMode='FISH_SCALE_STANDARD_REFERENCE';
  for(let i=0;i<9;i++){const sheet=this.box(stack,[.46,.006,.34],[.20+i*.12,.75+i*.006,0],'paper',.001);sheet.rotation.y=0;sheet.userData.fishScaleReference=true;}
  const press=this.cyl(stack,.07,1.02,[.30,.88,0],'amber','delivery-pulley','z');press.userData.pressureRollReference=true;
  const counter=this.group(g,'diana55-delivery-counter','Output sensing / monitoring reference');for(const z of [-.34,.34])this.box(counter,[.07,.13,.08],[.96,.94,z],'green',.010);
 }
 buildExteriorIdentity(){
  const g=this.group(this.root,'diana55-exterior-v251','Diana Eye 55 OEM-family exterior identity');
  this.root.userData.visualRefinement='V252_DIANA_EYE55_LOW_FEEDER_WHITE_RED_CELL_FISHSCALE_DELIVERY';
  this.root.userData.visualEvidenceBoundary='MASTERWORK_HEIDELBERG_CURRENT_DIANA_EYE55__2023_BMJ_INSTALLED_OPTIONS_BOUNDED';
  g.userData.sourceBoundary=this.root.userData.visualEvidenceBoundary;
  // Red Masterwork identity stripe runs through the main white cell without duplicating the enclosure.
  for(const z of [-.812,.812]){const stripe=this.cover(this.box(g,[2.06,.055,.024],[-.10,.84,z],'red',.006));stripe.userData.familyAccent=true;stripe.userData.silhouetteCritical=true;}
  const feederFascia=this.cover(this.box(g,[1.14,.22,.08],[-3.14,.56,-.77],'light',.018));feederFascia.userData.feederIdentityPanel=true;
  const outputFascia=this.cover(this.box(g,[1.46,.22,.08],[2.94,.55,-.77],'light',.018));outputFascia.userData.acceptedDeliveryPanel=true;
  // Separate operator pedestal sits beside the cell in official product imagery.
  const hmi=this.group(g,'diana55-hmi-pedestal-v251','Separate touchscreen pedestal reference');
  const pedestal=this.cover(this.box(hmi,[.46,.88,.36],[.72,.62,-1.28],'light',.040));pedestal.userData.silhouetteCritical=true;
  const screen=this.box(hmi,[.36,.25,.025],[.72,1.02,-1.475],'glass',.020);screen.userData.mechanismRole='diana-eye-hmi-display-reference';
  this.box(hmi,[.34,.055,.30],[.72,.16,-1.28],'dark',.010);
 }
 enrichV141(){this.root.userData.researchVersion='V141';this.root.userData.researchSourceCount=V141_SOURCE_STATS.total;this.root.userData.uniqueResearchUrls=V141_SOURCE_STATS.uniqueUrls;this.root.userData.detailPass='V252_DIANA55_OEM_SILHOUETTE_FISHSCALE_FLOW';
  const tag=(m,role,evidence='MASTERWORK_DIANA_EYE_55_OEM')=>{if(m){m.userData.mechanismRole=role;m.userData.evidence=evidence;m.userData.detail=true;}return m;};
  const feeder=this.findNode('diana55-feed-friction');if(feeder){
    const knife=tag(this.box(feeder,[.08,.22,1.02],[.62,.91,0],'steel',.008),'patented-feeding-knife-reference','MASTERWORK_42_55_OEM');knife.rotation.z=-.16;
    tag(this.cyl(feeder,.055,.18,[-.18,.50,.58],'dark','vibration-motor-reference','x'),'vibration-motor-reference','MASTERWORK_42_55_OEM');
    const air=this.group(feeder,'diana55-feed-air-v123','Feeder air-blowing manifold',[0,0,0],[.10,.12,.12]);
    tag(this.cyl(air,.018,1.00,[.10,.68,0],'steel','air-manifold','z'),'feeder-air-manifold','MASTERWORK_42_55_OEM');
    for(const z of [-.40,-.20,0,.20,.40])tag(this.cyl(air,.010,.08,[.28,.70,z],'blue','air-nozzle','x'),'feeder-air-blowing-nozzle','MASTERWORK_42_55_OEM');
  }
  const dbl=this.findNode('diana55-feed-double');if(dbl){
    dbl.userData.oemTechnology='ULTRASONIC_DOUBLE_SHEET_DETECTION';
    for(const z of [-.36,.36]){
      tag(this.box(dbl,[.055,.11,.055],[.58,1.05,z],'blue',.008),'ultrasonic-double-sheet-emitter','MASTERWORK_42_55_OEM');
      tag(this.box(dbl,[.055,.11,.055],[.74,1.05,z],'green',.008),'ultrasonic-double-sheet-receiver','MASTERWORK_42_55_OEM');
    }
  }
  const top=this.findNode('diana55-camera-top');if(top){top.userData.oemCameraOptions=['8K color','4K high-speed color','8K B/W'];top.userData.installedCountVerified=false;for(const m of top.children.filter(o=>o.isMesh&&o.userData.mechanismRole==='camera-lens'))tag(m,'line-scan-camera-lens','MASTERWORK_DIANA_EYE_55_OEM');}
  const area=this.findNode('diana55-camera-area');if(area){area.userData.oemCapacity=2;area.userData.installedCountVerified=false;}
  const rear=this.findNode('diana55-camera-rear');if(rear){rear.userData.oemCapacity=1;rear.userData.installedCountVerified=false;}
  const lights=this.findNode('diana55-light');if(lights){lights.userData.oemIlluminationModes=4;lights.userData.softwareAdjustableIntensity=true;lights.userData.patentedLightDome=true;}
  const transport=this.findNode('diana55-transport');if(transport){transport.userData.transportType='SUCTION_BELT_OEM';transport.userData.triggerEncoderChain='FUNCTIONAL_REFERENCE';}
  const trig=this.findNode('diana55-transport-trigger');if(trig)trig.userData.captureInterlock='BLANK_PRESENT_AND_TRANSPORT_ENCODER';
  const reject=this.findNode('diana55-reject');if(reject){reject.userData.inlineFaultBlankEjectionConfirmed=true;reject.userData.installedRejectActuationVerified=false;reject.userData.boundary='OEM confirms inline ejection, but public source does not identify installed actuator type.';}
  const sensor=this.findNode('diana55-reject-sensor');if(sensor)for(const m of sensor.children.filter(o=>o.isMesh))tag(m,'reject-confirmation-sensor','MASTERWORK_DIANA_EYE_55_OEM');
 }

 refineV254(){
  this.root.userData.visualRefinement='V254_DIANA_EYE55_2023_FAMILY_PROCESS_REALISM';
  this.root.userData.detailPass='V254_DIANA55_FEED_INSPECT_EJECT_DUAL_FISHSCALE_REALISM';
  this.root.userData.processReality={
   feeder:'STABLE_BELTS_PATENTED_KNIFE_VIBRATION_AND_AIR_REFERENCE',
   transport:'SUCTION_BELT',
   inspection:'DARK_CELL_LED_DOME_CAMERA_CAPACITY_BOUNDED',
   reject:'DAMAGE_FREE_EJECTION_PATH__ACTUATOR_TYPE_UNVERIFIED',
   delivery:'FISH_SCALE_FINISHED_AND_WASTE_REFERENCE'
  };
  this.root.userData.installedOptionPolicy='BMJ_SERIAL_2023_OPTIONS_UNVERIFIED__DO_NOT_PROMOTE_CURRENT_OPTIONAL_HARDWARE_TO_INSTALLED';

  // Ground the long machine with actual-looking leveling pads instead of a floating rail.
  const frame=this.findNode('diana55-access-frame');
  if(frame){
   const feet=this.group(frame,'diana55-leveling-feet-v254','Leveling feet and floor pads');
   for(const x of [-3.42,-2.55,-1.65,-.72,.28,1.18,2.12,3.34])for(const z of [-.61,.61]){
    const stem=this.cyl(feet,.022,.16,[x,.10,z],'steel','leveling-stem','y');stem.userData.detail=true;
    const pad=this.cyl(feet,.075,.025,[x,.025,z],'dark','leveling-pad','y');pad.userData.detail=true;pad.userData.floorContact=true;
   }
  }

  // OEM/Masterwork: smooth ejection channel, jam detection, open adjustment mechanism and
  // noise-reduction safety cover. Actuator type stays neutral because BMJ serial-specific option is unknown.
  const reject=this.findNode('diana55-reject');
  if(reject){
   const cover=this.group(reject,'diana55-reject-safety-v254','Reject safety / noise-reduction enclosure');
   for(const z of [-.66,.66]){
    const side=this.cover(this.box(cover,[.92,.48,.045],[.18,1.08,z],'light',.024));side.userData.safetyNoiseReductionReference=true;
    const win=this.box(cover,[.46,.24,.018],[.20,1.10,z+(z<0?-.027:.027)],'glass',.014);win.userData.rejectViewingWindow=true;
   }
   const top=this.cover(this.box(cover,[.94,.055,1.30],[.18,1.34,0],'light',.018));top.userData.safetyNoiseReductionReference=true;
   const adjust=this.group(reject,'diana55-reject-adjustment-v254','Open reject adjustment mechanism');
   for(const z of [-.44,.44]){this.box(adjust,[.72,.035,.035],[.10,.67,z],'steel',.005);const wheel=this.cyl(adjust,.055,.035,[.38,.70,z],'amber','reject-adjust-handwheel','z');wheel.userData.detail=true;}
   const jam=this.group(reject,'diana55-reject-jam-v254','Reject paper-jam detection');
   for(const z of [-.36,.36]){const s=this.box(jam,[.045,.085,.045],[.55,.78,z],'blue',.006);s.userData.mechanismRole='reject-paper-jam-sensor';}
   reject.userData.v254OfficialFeatures=['smooth defective-product ejection channel','open adjustment mechanism','paper jam detection','safety noise-reduction protective cover'];
  }

  // Masterwork explicitly describes a scaly-paper delivery platform for finished products AND waste,
  // with a pressing roller and monitoring camera. Keep optional stacker hardware out of the live model.
  const oldRejectChute=this.findNode('diana55-reject-chute');
  oldRejectChute?.traverse(m=>{if(m.isMesh&&m.userData.rejectCollection){m.visible=false;m.userData.supersededByV254=true;m.userData.supersededReason='GENERIC_REJECT_BIN_REPLACED_BY_OEM_WASTE_FISH_SCALE_PATH';}});

  const delivery=this.findNode('diana55-delivery');
  if(delivery){
   const oldStack=this.findNode('diana55-delivery-stack');
   oldStack?.traverse(m=>{if(m.isMesh&&m.userData.fishScaleReference&&!m.userData.route){m.visible=false;m.userData.supersededByV254=true;m.userData.supersededReason='CENTER_GENERIC_FISHSCALE_REPLACED_BY_SEPARATE_GOOD_WASTE_LANES';}});
   const good=this.group(delivery,'diana55-delivery-good-v254','Finished-product fish-scale lane');
   const waste=this.group(delivery,'diana55-delivery-waste-v254','Waste fish-scale lane');
   good.userData.route='FINISHED_PRODUCT';waste.userData.route='WASTE';
   for(let i=0;i<8;i++){
    const x=-.48+i*.16;
    const a=this.box(good,[.46,.006,.28],[x,.755+i*.002,-.25],'paper',.001);a.userData.fishScaleReference=true;a.userData.route='GOOD';
    const b=this.box(waste,[.46,.006,.28],[x,.735+i*.002,.28],'paper',.001);b.userData.fishScaleReference=true;b.userData.route='WASTE';
   }
   for(const z of [-.56,0,.56]){const guide=this.box(delivery,[1.86,.035,.025],[.12,.80,z],'steel',.004);guide.userData.deliverySideGuide=true;}
   const monitoring=this.group(delivery,'diana55-delivery-monitor-v254','Finished / waste delivery monitoring camera');
   this.box(monitoring,[.10,.38,.10],[.72,1.15,.66],'steel',.010);
   const cam=this.box(monitoring,[.18,.14,.16],[.70,1.36,.50],'dark',.016);cam.userData.mechanismRole='delivery-monitoring-camera-reference';cam.userData.rotor=false;
   this.cyl(monitoring,.035,.045,[.70,1.32,.40],'black','delivery-monitor-lens','z').userData.rotor=false;
   const stacker=this.group(delivery,'diana55-side-stacker-capability-v254','Optional side stacker capability');
   stacker.userData.capabilityOnly=true;stacker.userData.installedVerified=false;stacker.visible=false;
   delivery.userData.v254DeliveryEvidence='MASTERWORK_SCALY_PAPER_FINISHED_AND_WASTE__PRESSING_ROLLER__MONITORING_CAMERA';
  }

  // Keep one physical HMI pedestal; current-generation 24-inch display is not asserted on BMJ 2023.
  const hmi=this.findNode('diana55-hmi-pedestal-v251');
  if(hmi){hmi.userData.bmjGenerationBoundary='2023_SERIAL__DISPLAY_SIZE_NOT_UPGRADED_FROM_CURRENT_2025_FAMILY_PAGE';}
 }

 refineV255(){
  this.root.userData.visualRefinement='V255_DIANA_EYE55_DOWNWARD_OPTICS_SCAN_PLANE_REALISM';
  this.root.userData.detailPass='V255_DIANA55_OPTICAL_AXIS_AND_SCAN_PLANE_REALISM';
  this.root.userData.opticalAxisPolicy='NEUTRAL_REFERENCE_HEAD_POINTS_DOWN_TO_SUCTION_BELT__INSTALLED_CAMERA_POPULATION_UNVERIFIED';
  this.root.userData.scanPlaneY=.73;
  this.root.userData.cameraPopulationPolicy='ONE_NEUTRAL_REFERENCE_HEAD_RENDERED__UP_TO_FOUR_TOP_CAMERAS_CAPABILITY_ONLY';
 }

 findNode(id){return id==='diana55-root'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData?.selectable)return p;return null;}resolveTaxonomyNode(id){return this.taxonomyById.get(id)?.meshRefs.map(ref=>this.findNode(ref)).find(Boolean)||null;}contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
 highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x17494a:0);m.material.emissiveIntensity=.3;}}highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x17494a:0);m.material.emissiveIntensity=.3;}}ghost(on,except=null){this.ghosted=!!on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m)),natural=m.material.userData?.baseOpacity??1;m.material.transparent=fade||natural<1;m.material.opacity=fade?.14:natural;m.material.depthWrite=!fade;}}isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
 setExteriorOpen(on=true){this.exteriorOpen=!!on;let count=0;for(const m of this.meshes)if(m.userData.exteriorCover){m.visible=!on;count++;}this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?count:0;}explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}setLow(){}reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);this.setExteriorOpen(open);}dispose(){for(const g of this.geometries.values())g.dispose();for(const m of this.materials.values())m.dispose();}
}
