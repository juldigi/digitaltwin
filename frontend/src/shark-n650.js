import * as THREE from 'three';import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SHARK_N650_SPEC} from './data/dimensions-shark-n650.js';import {SHARK_N650_TAXONOMY,SHARK_N650_TAXONOMY_BY_ID} from './data/taxonomy-shark-n650.js';import {SHARK_N650_ORIENTATION,SHARK_N650_TECHNICAL_SOURCES} from './data/sources-shark-n650.js';import {V141_SOURCE_STATS} from './data/research-v141.js';
const V=a=>new THREE.Vector3(...a);
export class SharkN650MachineTemplate{
 constructor(){this.spec=SHARK_N650_SPEC;this.root=new THREE.Group();this.root.name='IPM 4 · FS-SHARK-N650-P3N1';this.root.userData={assetId:this.spec.assetId,nodeId:'shark650-root',spec:this.spec,sources:SHARK_N650_TECHNICAL_SOURCES,orientation:SHARK_N650_ORIENTATION,taxonomyVersion:'shark650-v252-n650-offline-flow',detailPass:'V252_SHARK_N650_NEGATIVE_PITCH_RETURN_LINE',researchVersion:'V141',researchSourceCount:V141_SOURCE_STATS.total,uniqueResearchUrls:V141_SOURCE_STATS.uniqueUrls,evidenceGrade:'MODEL_FAMILY_PROCESS_GROUNDED',geometryStatus:'CURRENT_N650_OFFLINE_PROCESS_AND_ENVELOPE_REFERENCE__P3N1_OPTIONS_UNDECODED',engineeringDimensions:false,modeledMode:'FISH_SCALE_OFFLINE_REFERENCE'};this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.lowDetail=false;this.build();this.refineV254();this.refineV258();this.taxonomy=SHARK_N650_TAXONOMY;this.taxonomyById=SHARK_N650_TAXONOMY_BY_ID;for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);}
 group(parent,id,name,pos=[0,0,0],explode=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:this.spec.assetId,nodeId:id,selectable:true,explode:V(explode),confidence:'FAMILY_PROCESS_GROUNDED'};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mat(k,owner=null){const key=(owner?.userData?.nodeId||'root')+':'+k;if(!this.materials.has(key)){const c={white:0xeaeeee,light:0xc9d0d2,dark:0x283138,black:0x111619,steel:0x879499,silver:0xc3cbcd,rubber:0x23282a,blue:0x3074a1,cyan:0x4d9bb5,red:0xb13a33,green:0x548b70,amber:0xd4a04c,paper:0xdec89f,glass:0x315663,led:0xece8d1}[k]||0x888888;const m=new THREE.MeshStandardMaterial({color:c,metalness:['steel','silver'].includes(k)?.5:.08,roughness:k==='glass'?.16:.44,transparent:k==='glass',opacity:k==='glass'?.38:1});m.userData.baseOpacity=m.opacity;this.materials.set(key,m);}return this.materials.get(key);}
 mesh(g,geo,key,k='dark',p=[0,0,0],r=null){if(!this.geometries.has(key))this.geometries.set(key,geo());const m=new THREE.Mesh(this.geometries.get(key),this.mat(k,g));m.position.set(...p);if(r)m.rotation.set(...r);m.castShadow=k!=='glass';m.receiveShadow=true;m.userData.ownerId=g.userData.nodeId;g.add(m);this.meshes.push(m);return m;}
 box(g,s,p,k='dark',rad=.02){return this.mesh(g,()=>rad?new RoundedBoxGeometry(...s,2,rad):new THREE.BoxGeometry(...s),'b'+s+rad,k,p);}
 cyl(g,r,l,p,k='steel',role='',axis='z'){
  const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null,m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,22),'c'+r+l+axis,k,p,rot);
  const rotating=/^(transport-pulley|vacuum-blower|good-return|bad-return)$/.test(role);
  m.userData.rotor=rotating;m.userData.mechanismRole=role;m.userData.rotorAxis=axis;m.userData.radius=r;m.userData.reciprocator=role==='suction-cup';
  if(rotating)m.userData.spinDirection=/^(transport-pulley|bad-return)$/.test(role)?-1:1;
  return m;
 }cover(m){m.userData.exteriorCover=true;return m;}
 build(){this.buildAccess();this.buildFeeder();this.buildTransfer();this.buildInspection();this.buildVision();this.buildProcessing();this.buildReject();this.buildReturn();this.buildExteriorIdentity();}
 buildAccess(){
  const g=this.group(this.root,'shark650-access','Frame, platform and guarding');
  const frame=this.group(g,'shark650-access-frame','Machine base frame');this.box(frame,[6.72,.24,1.38],[0,.16,0],'dark',.035);
  for(let x=-3.12;x<=3.12;x+=.72)for(const z of [-.61,.61])this.box(frame,[.07,.50,.07],[x,.42,z],'steel',.010);
  const platform=this.group(g,'shark650-access-platform','Operator-side raised service platform');this.box(platform,[4.72,.12,.46],[.10,.29,-.96],'dark',.012);
  for(let x=-2.12;x<=2.26;x+=.46)this.box(platform,[.29,.018,.42],[x,.36,-.96],'steel',0);
  for(let x=-2.18;x<=2.30;x+=.92)this.box(platform,[.06,.62,.06],[x,.66,-1.15],'steel',.008);
  this.cyl(platform,.022,4.45,[.06,.98,-1.15],'steel','platform-handrail','x');
  const guard=this.group(g,'shark650-access-guard','Inspection tower safety guarding');
  for(const z of [-.72,.72])this.cover(this.box(guard,[1.48,1.58,.07],[-.12,1.55,z],'white',.050));
 }
 buildExteriorIdentity(){
  const g=this.group(this.root,'shark650-exterior-v251','FS-SHARK N650 current-family exterior identity');
  this.root.userData.visualRefinement='V252_SHARK_N650_LONG_LOW_CHASSIS_SINGLE_VISION_TOWER_BLUE_STRIPE';
  this.root.userData.visualEvidenceBoundary='FOCUSIGHT_N650_PRIMARY__P3N1_INSTALLED_OPTION_PACKAGE_UNDECODED';
  g.userData.sourceBoundary=this.root.userData.visualEvidenceBoundary;
  // Published N650 installations read as a long low conveyor/cabinet line interrupted by one tall vision tower.
  for(const [x,w] of [[-2.25,1.65],[1.16,1.05],[2.35,1.35]])for(const z of [-.69,.69]){const panel=this.cover(this.box(g,[w,.64,.08],[x,.64,z],'light',.030));panel.userData.lowChassis=true;}
  for(const z of [-.735,.735]){const stripe=this.cover(this.box(g,[5.95,.050,.020],[-.02,.83,z],'blue',.005));stripe.userData.familyAccent=true;stripe.userData.silhouetteCritical=true;}
  const feederFascia=this.cover(this.box(g,[1.05,.22,.08],[-2.92,.55,-.69],'light',.018));feederFascia.userData.feederIdentityPanel=true;
  // Operator monitor on a support arm is prominent in the product family.
  const hmi=this.group(g,'shark650-hmi-v251','Operator monitor and support arm reference');
  const mast=this.cyl(hmi,.032,.86,[.86,1.16,-1.02],'steel','hmi-mast-reference','y');mast.userData.structuralMountReference=true;
  const mount=this.box(hmi,[.16,.12,.38],[.86,.78,-.86],'steel',.010);mount.userData.hmiChassisMount=true;mount.userData.mountPolicy='CHASSIS_SIDE_TO_MONITOR_MAST_STRUCTURAL_REFERENCE';
  const arm=this.box(hmi,[.58,.055,.055],[.57,1.53,-1.02],'steel',.008);arm.rotation.z=-.15;
  const monitor=this.cover(this.box(hmi,[.46,.32,.075],[.29,1.63,-1.02],'dark',.030));monitor.userData.silhouetteCritical=true;
  this.box(hmi,[.37,.24,.020],[.29,1.63,-1.061],'glass',.016).userData.mechanismRole='shark-hmi-display-reference';
 }
 buildFeeder(){
  const g=this.group(this.root,'shark650-feeder','Automatic loading / negative-pitch infeed',[-2.90,0,0],[-.62,.16,0]);
  const stack=this.group(g,'shark650-feed-stack','Input blank support');this.box(stack,[.92,.07,1.08],[-.24,.32,0],'steel');for(let i=0;i<9;i++)this.box(stack,[.58,.009,.82],[-.30,.38+i*.010,0],'paper',.001);
  const suction=this.group(g,'shark650-feed-suction','Automatic suction pickup reference');suction.userData.feederModeReference='AUTOMATIC_SUCTION_PICKUP_REFERENCE';suction.userData.installedModeVerified=false;
  this.box(suction,[.62,.18,.96],[.18,1.04,0],'dark',.026);
  for(const z of [-.36,-.12,.12,.36]){const cup=this.cyl(suction,.030,.13,[.38,.89,z],'rubber','suction-cup','y');cup.userData.reciprocator=true;cup.userData.pickupAxis='NEGATIVE_Y_TOWARD_BLANK';this.box(suction,[.030,.18,.030],[.38,1.00,z],'steel');}
  const manifold=this.cyl(suction,.022,.90,[.14,1.08,0],'steel','feeder-vacuum-manifold','z');manifold.userData.mechanismRole='feeder-vacuum-manifold';
  const friction=this.group(g,'shark650-feed-friction','Alternate feeder capability reference');friction.userData.feederModeReference='ALTERNATE_FAMILY_OPTION';friction.userData.installedModeVerified=false;friction.userData.capabilityOnly=true;friction.visible=false;for(const z of [-.36,-.12,.12,.36])this.box(friction,[.82,.022,.09],[.34,.72,z],'rubber',.004);
  const separate=this.group(g,'shark650-feed-separate','Blank separation / spacing control');for(const z of [-.42,0,.42]){const p=this.box(separate,[.07,.17,.045],[-.42,.86,z],'blue',.010);p.userData.negativePitchSpacingReference=true;}
 }
 buildTransfer(){const g=this.group(this.root,'shark650-transfer','Full-suction transfer',[-1.58,0,0],[-.30,.16,0]);const belt=this.group(g,'shark650-transfer-belt','Full-suction transport belts');for(const z of [-.51,-.255,0,.255,.51]){const b=this.box(belt,[1.85,.025,.11],[0,.78,z],'rubber',.006);b.userData.suctionBelt=true;for(const x of [-.76,.76])this.cyl(belt,.055,.15,[x,.77,z],'steel','transport-pulley','z');}const drive=this.group(g,'shark650-transfer-drive','Transfer drive / encoder reference');const motor=this.cyl(drive,.10,.24,[-.72,.49,.68],'dark','transfer-drive-motor','x');motor.userData.rotor=true;motor.userData.rotorAxis='x';motor.userData.spinDirection=1;const coupling=this.cyl(drive,.045,.10,[-.57,.49,.68],'blue','transfer-drive-coupling','x');coupling.userData.mechanismRole='transfer-drive-coupling';const enc=this.cyl(drive,.052,.025,[.72,.77,.68],'cyan','transfer-encoder','z');enc.userData.rotor=true;enc.userData.rotorAxis='z';enc.userData.spinDirection=-1;
 const vac=this.group(g,'shark650-transfer-vacuum','Vacuum plenum / blowers');this.box(vac,[1.78,.32,1.26],[0,.55,0],'dark',.03);for(const x of [-.50,.12,.50])this.cyl(vac,.052,.50,[x,.40,.68],'blue','vacuum-blower','x');const vm=this.cyl(vac,.025,1.50,[0,.49,.55],'steel','transfer-vacuum-manifold','x');vm.userData.mechanismRole='transfer-vacuum-manifold';const vg=this.cyl(vac,.052,.025,[.64,.61,.68],'glass','transfer-vacuum-gauge','z');vg.userData.mechanismRole='transfer-vacuum-gauge';
 const guide=this.group(g,'shark650-transfer-guide','Adjustable transport guides');for(const z of [-.63,.63])this.box(guide,[1.80,.05,.04],[0,1.02,z],'steel',.008);}
 buildInspection(){
  const g=this.group(this.root,'shark650-inspection','Inspection tower',[-.12,0,0],[0,.32,.42]);
  const tower=this.group(g,'shark650-inspection-tower','Single vision tower / enclosure');this.cover(this.box(tower,[1.48,1.72,1.42],[0,1.48,0],'white',.060));
  const window=this.group(g,'shark650-inspection-window','Dark inspection aperture');for(const z of [-.73,.73]){const w=this.box(window,[1.05,.80,.022],[0,1.55,z],'glass',.032);w.userData.silhouetteCritical=true;}
  const bed=this.group(g,'shark650-inspection-bed','Inspection transport bed');for(const z of [-.46,-.23,0,.23,.46]){const b=this.box(bed,[1.48,.022,.09],[0,.78,z],'rubber',.004);b.userData.inspectBelt=true;}
 }
 buildVision(){
  const g=this.group(this.root,'shark650-vision','Camera and lighting system',[-.12,0,0],[0,.45,.45]);
  const camera=this.group(g,'shark650-vision-camera','Camera mounting rail · P3N1 suffix not decoded');camera.userData.referenceBayCount=3;camera.userData.installedCameraCountVerified=false;camera.userData.p3SuffixDecoded=false;
  this.box(camera,[1.04,.055,.11],[0,2.10,0],'steel',.008);
  for(const x of [-.40,0,.40]){const mount=this.box(camera,[.08,.10,.09],[x,2.04,0],'dark',.008);mount.userData.capabilityMount=true;}
  const head=this.box(camera,[.22,.25,.20],[0,1.91,0],'dark',.020);head.userData.cameraPopulationReference='NEUTRAL_SINGLE_HEAD_VISIBLE__P3N1_NOT_DECODED';
  const lens=this.cyl(camera,.050,.075,[0,1.76,0],'black','camera-lens','y');lens.userData.opticalAxis='NEGATIVE_Y_TOWARD_INSPECTION_BED';lens.userData.opticalTargetY=.78;lens.userData.installedPopulationReferenceOnly=true;
  const light=this.group(g,'shark650-vision-light','Program-controlled lighting / paper-shielding system');light.userData.programControlled=true;
  for(const z of [-.48,-.24,0,.24,.48]){const l=this.box(light,[1.08,.032,.050],[0,1.39,z],'led',.006);l.userData.inspectionLight=true;l.material=l.material.clone();l.material.userData.baseOpacity=1;}
  for(const z of [-.58,.58]){const shield=this.box(light,[1.18,.34,.030],[0,1.35,z],'dark',.010);shield.userData.mechanismRole='light-column-paper-shielding-reference';}
  const trigger=this.group(g,'shark650-vision-trigger','Inspection trigger / encoder sensing');for(const z of [-.36,.36]){const p=this.box(trigger,[.07,.14,.08],[-.58,.98,z],'cyan',.012);p.userData.mechanismRole=z<0?'inspection-trigger-emitter':'inspection-trigger-receiver';}const wheel=this.cyl(trigger,.050,.07,[-.45,.81,.50],'cyan','inspection-encoder-wheel','z');wheel.userData.rotor=true;wheel.userData.rotorAxis='z';wheel.userData.spinDirection=-1;
 }
 buildProcessing(){const g=this.group(this.root,'shark650-processing','Vision processing and recipe control',[.95,0,0],[.25,.18,.55]);const compute=this.group(g,'shark650-process-compute','Industrial vision computer');this.box(compute,[.72,1.48,.68],[.18,1.05,.94],'dark',.05);for(let y=.56;y<1.54;y+=.16)this.box(compute,[.46,.026,.024],[.54,y,1.28],'steel',0);const hmi=this.group(g,'shark650-process-hmi','Operator HMI');this.box(hmi,[.62,.78,.42],[.58,.95,-1.16],'white',.045);this.box(hmi,[.44,.30,.022],[.52,1.18,-1.39],'glass',.025);const recipe=this.group(g,'shark650-process-recipe','Inspection template / tolerance logic');recipe.userData.logicalOnly=true;recipe.userData.renderPolicy='SOFTWARE_LOGIC_NOT_PHYSICAL_HARDWARE';recipe.visible=false;}
 buildReject(){
  const g=this.group(this.root,'shark650-reject','Reject separation',[1.48,0,0],[.42,.16,0]);g.userData.installedRejectTypeVerified=false;
  const plate=this.group(g,'shark650-reject-plate','Neutral kick-off diverter reference');plate.userData.rejectReference='NEUTRAL_KICK_OFF_PATH';
  const p=this.box(plate,[.10,.30,.96],[-.02,.89,0],'red',.020);p.userData.rejectGate=true;const sol=this.box(plate,[.12,.10,.10],[-.34,.58,.46],'blue',.008);sol.userData.mechanismRole='reject-solenoid-reference';
  const air=this.group(g,'shark650-reject-air','Air-reject family capability reference');air.userData.rejectReference='AIR_OPTION';air.userData.capabilityOnly=true;air.visible=false;for(const x of [-.18,0,.18])this.cyl(air,.016,.08,[x,1.08,.56],'steel','air-nozzle','x');
  const track=this.group(g,'shark650-reject-track','Reject tracking / confirmation');for(const z of [-.37,.37])this.box(track,[.07,.13,.08],[.36,.97,z],'cyan',.012);
 }
 buildReturn(){
  const g=this.group(this.root,'shark650-return','Good/bad product return and collection',[2.58,0,0],[.68,.16,0]);g.userData.installedCollectionModeVerified=false;g.userData.officialGoodBadReturnLine=true;
  const good=this.group(g,'shark650-return-good','Accepted-product return / fish-scale lane');
  for(const z of [-.38,-.12,.12,.38]){this.box(good,[1.72,.023,.09],[0,.73,z-.18],'rubber',.004);for(const x of [-.72,.72])this.cyl(good,.050,.13,[x,.72,z-.18],'steel','good-return','z');}
  const gm=this.cyl(good,.085,.20,[-.76,.48,-.66],'dark','good-return-motor','x');gm.userData.rotor=true;gm.userData.rotorAxis='x';gm.userData.spinDirection=1;
  const bad=this.group(g,'shark650-return-bad','Rejected-product return lane');
  for(const z of [.38,.58]){this.box(bad,[1.48,.023,.10],[-.04,.56,z],'rubber',.004);for(const x of [-.62,.62])this.cyl(bad,.048,.13,[x,.55,z],'steel','bad-return','z');}
  const bm=this.cyl(bad,.082,.20,[-.68,.36,.66],'dark','bad-return-motor','x');bm.userData.rotor=true;bm.userData.rotorAxis='x';bm.userData.spinDirection=1;
  const stack=this.group(g,'shark650-return-stack','Vertical-palletizing capability reference');this.box(stack,[.72,.07,.72],[.92,.37,-.18],'steel');this.box(stack,[.64,.07,.52],[.78,.29,.52],'steel');stack.userData.verticalPalletizingCapability=true;stack.userData.installedVerticalPalletizerVerified=false;stack.userData.capabilityOnly=true;stack.visible=false;
  for(const z of [-.18,.52]){const sensor=this.box(stack,[.045,.065,.045],[.52,.62,z],'green',.004);sensor.userData.mechanismRole=z<0?'good-return-confirm-sensor-reference':'bad-return-confirm-sensor-reference';}
 }

 refineV254(){
  this.root.userData.visualRefinement='V254_SHARK_N650_AUTOMATED_NEGATIVE_PITCH_RETURN_REALISM';
  this.root.userData.detailPass='V254_N650_AUTOMATION_VISION_REJECT_RETURN_REALISM';
  this.root.userData.processReality={
   loading:'AUTOMATED_LOADING_REFERENCE__EXACT_FEEDER_OPTION_UNVERIFIED',
   transfer:'FULL_SUCTION_NEGATIVE_PITCH_REFERENCE',
   inspection:'SINGLE_VISION_TOWER_PROGRAMMED_LIGHT_SHIELDING',
   reject:'KICK_OFF_REFERENCE__EXACT_ACTUATOR_UNVERIFIED',
   return:'GOOD_BAD_RETURN_LINE_OFFICIAL__INSTALLED_COLLECTION_LAYOUT_UNVERIFIED'
  };
  this.root.userData.suffixBoundary='P3N1_PRESERVED_VERBATIM__NOT_DECODED';

  // V252 accidentally rendered two operator HMIs: one bulky generic cabinet and the family-correct
  // monitor-on-arm. Keep only the product-family monitor-on-arm visible.
  const duplicateHmi=this.findNode('shark650-process-hmi');
  if(duplicateHmi){duplicateHmi.visible=false;duplicateHmi.userData.supersededByV254=true;duplicateHmi.userData.supersededReason='DUPLICATE_GENERIC_HMI_REMOVED__FAMILY_MONITOR_ON_ARM_RETAINED';}
  const hmi=this.findNode('shark650-hmi-v251');
  if(hmi){hmi.userData.primaryOperatorInterface=true;hmi.userData.installedDisplayModelVerified=false;}

  // The previous full-length raised catwalk/rail was generic factory styling and is not supported
  // by the official N650 product description. Replace it with compact local service footing only.
  const longPlatform=this.findNode('shark650-access-platform');
  if(longPlatform){longPlatform.visible=false;longPlatform.userData.supersededByV254=true;longPlatform.userData.supersededReason='UNSUPPORTED_FULL_LENGTH_RAISED_CATWALK';}
  const access=this.findNode('shark650-access');
  if(access){
   const local=this.group(access,'shark650-local-service-step-v254','Compact operator service step');
   this.box(local,[1.16,.10,.42],[.48,.12,-.92],'dark',.012);
   for(const x of [.02,.48,.94]){const foot=this.cyl(local,.06,.025,[x,.025,-.92],'dark','floor-pad','y');foot.userData.floorContact=true;}
   local.userData.sourceBoundary='LOCAL_ACCESS_ONLY__NO_FULL_LENGTH_PLATFORM_CLAIM';
  }

  // Make the automatic loading end read as one coherent low feeder rather than loose floating pieces.
  const feeder=this.findNode('shark650-feeder');
  if(feeder){
   const hood=this.group(feeder,'shark650-feeder-hood-v254','Automatic loading feeder low enclosure');
   for(const z of [-.62,.62]){const side=this.cover(this.box(hood,[1.10,.48,.055],[-.10,.65,z],'light',.026));side.userData.lowFeederIdentity=true;}
   const nose=this.cover(this.box(hood,[.16,.52,1.18],[-.62,.67,0],'light',.025));nose.userData.lowFeederIdentity=true;
   for(const z of [-.42,.42]){const guide=this.box(hood,[1.02,.035,.035],[-.05,.86,z],'steel',.005);guide.userData.adjustableBlankGuide=true;}
  }

  // Official automation sequence includes loading, transfer, kicking off and collection.
  // Add guarded transition hardware while leaving the exact reject actuator undecoded.
  const reject=this.findNode('shark650-reject');
  if(reject){
   const guard=this.group(reject,'shark650-reject-guard-v254','Reject transition guard');
   for(const z of [-.61,.61]){const panel=this.cover(this.box(guard,[.74,.42,.045],[.16,1.05,z],'light',.022));panel.userData.rejectTransitionGuard=true;}
   this.cover(this.box(guard,[.76,.05,1.18],[.16,1.28,0],'light',.012));
   const confirmation=this.group(reject,'shark650-reject-confirm-v254','Reject route confirmation sensing');
   for(const z of [-.42,.42]){const s=this.box(confirmation,[.045,.085,.045],[.44,.72,z],'cyan',.006);s.userData.mechanismRole='reject-route-confirmation-sensor';s.userData.detail=true;}
  }

  // Good/bad return line is explicitly advertised by Focusight. Render both paths as low, continuous
  // fish-scale/return lanes and keep vertical palletizing as capability metadata only.
  const ret=this.findNode('shark650-return');
  if(ret){
   const good=this.findNode('shark650-return-good'),bad=this.findNode('shark650-return-bad');
   for(let i=0;i<9;i++){
    const x=-.58+i*.14;
    if(good){const s=this.box(good,[.50,.006,.30],[x,.755+i*.002,-.18],'paper',.001);s.userData.returnReference='GOOD_FISH_SCALE';}
    if(bad){const s=this.box(bad,[.50,.006,.26],[x,.585+i*.002,.52],'paper',.001);s.userData.returnReference='BAD_RETURN';}
   }
   const divider=this.box(ret,[1.58,.08,.035],[.02,.80,.18],'blue',.006);divider.userData.goodBadRouteDivider=true;
   const counter=this.group(ret,'shark650-return-monitor-v254','Good / bad return monitoring');
   for(const z of [-.18,.52]){const s=this.box(counter,[.055,.11,.055],[.62,.94,z],'cyan',.008);s.userData.mechanismRole=z<0?'good-return-monitor':'bad-return-monitor';s.userData.detail=true;}
   ret.userData.v254OfficialEvidence='FOCUSIGHT_GOOD_BAD_RETURN_LINE_AND_AUTOMATED_COLLECTION';
  }

  // Optional whole-machine dust-reduction integration is a published option, not a BMJ-installed claim.
  const dust=this.group(this.root,'shark650-dust-integration-capability-v254','Optional integrated dust-reduction device');
  dust.userData.capabilityOnly=true;dust.userData.installedVerified=false;dust.visible=false;
 }

 refineV258(){
  this.root.userData.visualRefinement='V258_SHARK_N650_TOWER_OPEN_BAY_RETURN_REALISM';
  this.root.userData.detailPass='V258_N650_GROUNDED_TOWER_OPTICS_AND_OPEN_REJECT_BAY';
  this.root.userData.opticalAxisPolicy='NEUTRAL_REFERENCE_HEAD_POINTS_DOWN_TO_INSPECTION_BED__P3N1_CAMERA_PACKAGE_UNDECODED';
  this.root.userData.scanPlaneY=.78;
  this.root.userData.photoSilhouetteEvidence='FOCUSIGHT_FS_SHARK_650_N650_FAMILY_INSTALLATION_PHOTOS_PLUS_CURRENT_N650_PRIMARY_PAGE';
  this.root.userData.installedOptionPolicy='P3N1_SUFFIX_PRESERVED__DO_NOT_INFER_CAMERA_OR_FEEDER_OPTION_COUNTS';

  const frame=this.findNode('shark650-access-frame');
  if(frame){
   const feet=this.group(frame,'shark650-leveling-feet-v258','Main chassis leveling feet and floor pads');
   for(const x of [-3.10,-2.05,-.88,.32,1.52,2.72])for(const z of [-.58,.58]){
    const stem=this.cyl(feet,.022,.14,[x,.10,z],'steel','leveling-stem','y');stem.userData.detail=true;
    const pad=this.cyl(feet,.072,.025,[x,.018,z],'dark','floor-pad','y');pad.userData.floorContact=true;pad.userData.detail=true;
   }
   frame.userData.floorSupportPolicy='TWELVE_VISIBLE_LEVELING_POINTS__VISUAL_REFERENCE_NOT_LOAD_CALCULATION';
  }

  const tower=this.findNode('shark650-inspection-tower');
  if(tower){
   for(const z of [-.735,.735]){
    const header=this.cover(this.box(tower,[1.18,.16,.025],[0,2.25,z],'blue',.012));header.userData.towerIdentityHeader=true;header.userData.silhouetteCritical=true;
    const vertical=this.cover(this.box(tower,[.08,.82,.027],[-.60,1.38,z],'blue',.008));vertical.userData.towerIdentityAccent=true;
   }
   tower.userData.v258TowerIdentity='WHITE_SINGLE_TOWER_DARK_APERTURE_BLUE_HEADER_AND_VERTICAL_ACCENT';
  }

  const reject=this.findNode('shark650-reject');
  if(reject){
   const bay=this.group(reject,'shark650-open-reject-bay-v258','Open transfer / reject structural bay');
   for(const z of [-.62,.62]){
    this.box(bay,[.08,.88,.08],[-.42,.77,z],'light',.012).userData.structuralOpenBay=true;
    this.box(bay,[.08,.88,.08],[.54,.77,z],'light',.012).userData.structuralOpenBay=true;
   }
   this.box(bay,[1.04,.08,1.28],[.06,1.23,0],'light',.012).userData.structuralOpenBay=true;
   this.box(bay,[1.00,.06,1.16],[.06,.39,0],'dark',.010).userData.structuralOpenBay=true;
   bay.userData.policy='STRUCTURAL_FRAME_ONLY__EXACT_REJECT_ACTUATOR_REMAINS_UNVERIFIED';
  }

  const feeder=this.findNode('shark650-feeder');
  if(feeder){
   const rails=this.group(feeder,'shark650-feeder-magazine-v258','Automatic feeder blank guide frame');
   for(const z of [-.46,.46]){
    {const r=this.box(rails,[.035,.62,.035],[-.26,1.13,z],'steel',.004);r.userData.detail=true;}
    {const r=this.box(rails,[.78,.035,.035],[.04,1.42,z],'steel',.004);r.userData.detail=true;}
   }
   {const r=this.box(rails,[.86,.05,.05],[.02,1.38,0],'steel',.006);r.userData.detail=true;}
   rails.userData.installedModeBoundary='GUIDE_FRAME_VISIBLE_FAMILY_REFERENCE__SUCTION_VS_ALTERNATE_FEEDER_OPTION_NOT_DECODED';
  }

  const ret=this.findNode('shark650-return');
  if(ret){
   ret.name='Return good/bad & pengumpulan output';
   ret.userData.v258ReturnPolicy='OFFICIAL_GOOD_BAD_RETURN_LINE__LOW_CONTINUOUS_LANES__VERTICAL_PALLETIZER_CAPABILITY_ONLY';
   const palletizer=this.findNode('shark650-return-stack');if(palletizer){palletizer.visible=false;palletizer.userData.capabilityOnly=true;}
  }
  const names={
   'shark650-feeder':'Pengumpanan otomatis / negative-pitch',
   'shark650-transfer':'Transfer full-suction',
   'shark650-inspection':'Menara inspeksi',
   'shark650-vision':'Camera & pencahayaan terkontrol',
   'shark650-processing':'Pemrosesan vision & recipe',
   'shark650-reject':'Pemisahan reject'
  };
  for(const [id,name] of Object.entries(names)){const node=this.findNode(id);if(node)node.name=name;}
 }

 findNode(id){return id==='shark650-root'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData?.selectable)return p;return null;}resolveTaxonomyNode(id){return this.taxonomyById.get(id)?.meshRefs.map(ref=>this.findNode(ref)).find(Boolean)||null;}contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
 highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x17494a:0);m.material.emissiveIntensity=.3;}}highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x17494a:0);m.material.emissiveIntensity=.3;}}ghost(on,except=null){this.ghosted=!!on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m)),natural=m.material.userData?.baseOpacity??1;m.material.transparent=fade||natural<1;m.material.opacity=fade?.14:natural;m.material.depthWrite=!fade;}}isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
 setExteriorOpen(on=true){this.exteriorOpen=!!on;let count=0;for(const m of this.meshes)if(m.userData.exteriorCover){m.visible=!on;count++;}if(this.lowDetail)for(const m of this.meshes)if(m.userData.detail&&!m.userData.silhouetteCritical)m.visible=false;this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?count:0;}explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}setLow(on=true){
  const next=!!on;if(next===this.lowDetail)return;
  this.lowDetail=next;
  let affected=0;
  for(const m of this.meshes){
   if(!m.userData.detail||m.userData.silhouetteCritical)continue;
   if(next){
    m.userData.lowDetailRestoreVisible=m.visible;m.visible=false;affected++;
   }else if(Object.prototype.hasOwnProperty.call(m.userData,'lowDetailRestoreVisible')){
    const restore=!!m.userData.lowDetailRestoreVisible;
    m.visible=(m.userData.exteriorCover&&this.exteriorOpen)?false:restore;
    delete m.userData.lowDetailRestoreVisible;affected++;
   }
  }
  this.root.userData.lowDetailActive=next;
  this.root.userData.lowDetailAffectedMeshes=affected;
}reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);this.setExteriorOpen(open);}dispose(){for(const g of this.geometries.values())g.dispose();for(const m of this.materials.values())m.dispose();}
}
