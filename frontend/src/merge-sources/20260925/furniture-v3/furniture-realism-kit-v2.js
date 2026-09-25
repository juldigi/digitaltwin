import * as T from 'three';
import * as V1 from './furniture-realism-kit-v1.js';
import {DIMENSION_PRESETS, REALISM_POLICY, SOURCE_LEDGER} from './furniture-realism-research-v2.js';

/**
 * BMJ Packaging Offset Digital Twin — Furniture Realism Kit V2
 * Extension layer. Does NOT modify the application or repository.
 * Everything is REFERENCE_REALISM_NOT_AS_BUILT until verified by BMJ field evidence.
 */
export * from './furniture-realism-kit-v1.js';
export const FURNITURE_REALISM_VERSION_V2 = 'FRK-V2-2026-09-25';
export const V2_ACCURACY = REALISM_POLICY.status;

const M = V1.furnitureMaterial;
const rb = V1.roundedBox;

function tag(o, semantic, extra = {}) {
  o.name = semantic;
  o.userData = {semantic, accuracy: V2_ACCURACY, researchVersion: FURNITURE_REALISM_VERSION_V2, ...extra};
  return o;
}
function box(w,h,d,mat,semantic,pos=[0,0,0]) {
  const o = new T.Mesh(new T.BoxGeometry(w,h,d),mat); o.position.set(...pos); o.castShadow=true; o.receiveShadow=true; return tag(o,semantic);
}
function cyl(rt,rbm,h,mat,semantic,pos=[0,0,0],radial=18) {
  const o = new T.Mesh(new T.CylinderGeometry(rt,rbm,h,radial),mat); o.position.set(...pos); o.castShadow=true; o.receiveShadow=true; return tag(o,semantic);
}
function tube(a,b,r,mat,semantic,radial=10) {
  const d = new T.Vector3().subVectors(b,a), len=d.length();
  const o = new T.Mesh(new T.CylinderGeometry(r,r,len,radial),mat); o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()); o.castShadow=true; return tag(o,semantic);
}
function torus(R,r,mat,semantic,pos=[0,0,0],rot=[0,0,0]) {
  const o = new T.Mesh(new T.TorusGeometry(R,r,10,28),mat); o.position.set(...pos); o.rotation.set(...rot); o.castShadow=true; return tag(o,semantic);
}
function plate(w,h,semantic,textHint='') {
  const o=rb(w,h,.008,.006,M('labelWhite'),.002); tag(o,semantic,{textHint}); return o;
}
function caster(radius=.045,width=.032,semantic='CASTER') {
  const g=new T.Group(); tag(g,semantic);
  const tire=cyl(radius,radius,width,M('darkRubber'),semantic+'_WHEEL'); tire.rotation.z=Math.PI/2; g.add(tire);
  const hub=cyl(radius*.34,radius*.34,width*1.08,M('galvanized'),semantic+'_HUB'); hub.rotation.z=Math.PI/2; g.add(hub);
  g.add(tube(new T.Vector3(-.026,radius+.055,0),new T.Vector3(-.026,radius+.012,0),.009,M('galvanized'),semantic+'_FORK_L'));
  g.add(tube(new T.Vector3(.026,radius+.055,0),new T.Vector3(.026,radius+.012,0),.009,M('galvanized'),semantic+'_FORK_R'));
  g.add(cyl(.028,.028,.025,M('galvanized'),semantic+'_SWIVEL',[0,radius+.064,0]));
  return g;
}
function bolt(x,y,z,semantic='FASTENER') { const o=cyl(.008,.008,.006,M('chrome'),semantic,[x,y,z],6); o.rotation.x=Math.PI/2; return o; }
function hinge(x,y,z,semantic='HINGE') { return box(.025,.075,.014,M('galvanized'),semantic,[x,y,z]); }
function handleBar(width=.18,semantic='HANDLE') {
  const g=new T.Group();tag(g,semantic); const mat=M('chrome');
  g.add(tube(new T.Vector3(-width/2,0,0),new T.Vector3(-width/2,.045,0),.007,mat,semantic+'_POST_L'));
  g.add(tube(new T.Vector3(width/2,0,0),new T.Vector3(width/2,.045,0),.007,mat,semantic+'_POST_R'));
  g.add(tube(new T.Vector3(-width/2,.045,0),new T.Vector3(width/2,.045,0),.007,mat,semantic+'_GRIP'));
  return g;
}
function wheelPair(g,x,z,y=.06,r=.055,semantic='WHEEL') {
  for(const sx of [-1,1]) { const c=caster(r,.032,semantic+'_'+sx); c.position.set(x+sx*.16,y-r,z); g.add(c); }
}
function setRef(g,sourceIds=[],extra={}) {
  g.userData={...g.userData,sourceIds,sourceFacts:sourceIds.map(id=>SOURCE_LEDGER.find(s=>s.id===id)?.facts||null),...extra}; return g;
}
function finalize(g,semantic,sourceIds=[],extra={}) {
  tag(g,semantic,extra); setRef(g,sourceIds); g.userData.lodPolicy={LOD0:'mass only',LOD1:'primary construction',LOD2:'hardware + labels',LOD3:'micro detail close-up'}; return g;
}

// ---------------------------------------------------------------------------
// 1) LOCKER / CHANGE ROOM
// ---------------------------------------------------------------------------
export function buildIndustrialLockerDetailed(opts={}) {
  const modules=opts.modules??3, mw=opts.moduleWidth??DIMENSION_PRESETS.industrialLocker.moduleWidth, d=opts.depth??DIMENSION_PRESETS.industrialLocker.depth, h=opts.height??DIMENSION_PRESETS.industrialLocker.height;
  const w=modules*mw, g=new T.Group(), body=M('powderLight'), door=M('powderBlue'), dark=M('powderDark');
  g.add(box(w,h,d,body,'LOCKER_CARCASS',[0,h/2,0]));
  for(let i=0;i<modules;i++){
    const x=-w/2+mw*(i+.5), panel=rb(mw-.012,h-.08,.018,.008,door,.002); panel.position.set(x,h/2,-d/2-.011); tag(panel,'LOCKER_DOOR',{module:i+1});g.add(panel);
    for(const yy of [h*.16,h*.83]) for(let k=-2;k<=2;k++){const vent=box(mw*.11,.012,.008,dark,'LOCKER_VENT_SLOT',[x+k*mw*.12,yy,-d/2-.022]);g.add(vent);}
    const recess=rb(.06,.13,.012,.01,M('blackPolymer'),.002);recess.position.set(x+mw*.28,h*.53,-d/2-.028);tag(recess,'LOCKER_RECESSED_HANDLE');g.add(recess);
    const num=plate(.08,.038,'LOCKER_NUMBER_PLATE','locker number');num.position.set(x,h*.72,-d/2-.029);g.add(num);
    g.add(hinge(x-mw*.43,h*.28,-d/2-.028,'LOCKER_HINGE_LOWER'));g.add(hinge(x-mw*.43,h*.72,-d/2-.028,'LOCKER_HINGE_UPPER'));
    const shelf=box(mw-.04,.018,d-.07,body,'LOCKER_TOP_SHELF',[x,h*.77,0]);g.add(shelf);
    g.add(tube(new T.Vector3(x-mw*.28,h*.71,0),new T.Vector3(x+mw*.28,h*.71,0),.008,M('chrome'),'LOCKER_COAT_RAIL'));
    const hook=cyl(.008,.008,.04,M('chrome'),'LOCKER_COAT_HOOK',[x,h*.68,.02],10);hook.rotation.x=Math.PI/2;g.add(hook);
  }
  for(const x of [-w/2+.05,w/2-.05])for(const z of [-d/2+.05,d/2-.05])g.add(box(.055,.10,.055,dark,'LOCKER_LEG',[x,.05,z]));
  return finalize(g,opts.semantic||'INDUSTRIAL_LOCKER_BANK_DETAILED',['LYON_LOCKER'],{dimensions:[w,h,d],modules});
}

export function buildLockerBenchDetailed(opts={}) {
  const L=opts.length??1.50,D=opts.depth??.38,H=opts.height??.45,g=new T.Group(),wood=M('beechMultiplex'),metal=M('galvanized');
  for(let i=-2;i<=2;i++){const slat=rb(L,.038,D/5-.012,.01,wood,.002);slat.position.set(0,H,-i*D/5);tag(slat,'LOCKER_BENCH_WOOD_SLAT');g.add(slat);}
  for(const x of [-L*.38,L*.38]){g.add(tube(new T.Vector3(x,.03,-D*.34),new T.Vector3(x,H-.02,-D*.34),.022,metal,'LOCKER_BENCH_LEG'));g.add(tube(new T.Vector3(x,.03,D*.34),new T.Vector3(x,H-.02,D*.34),.022,metal,'LOCKER_BENCH_LEG'));g.add(tube(new T.Vector3(x,.12,-D*.34),new T.Vector3(x,.12,D*.34),.018,metal,'LOCKER_BENCH_CROSSBAR'));}
  return finalize(g,opts.semantic||'LOCKER_BENCH_DETAILED',['LYON_LOCKER'],{dimensions:[L,H,D]});
}

// ---------------------------------------------------------------------------
// 2) JANITOR / HOUSEKEEPING
// ---------------------------------------------------------------------------
export function buildJanitorServiceSinkDetailed(opts={}) {
  const W=opts.width??DIMENSION_PRESETS.janitorSink.width,D=opts.depth??DIMENSION_PRESETS.janitorSink.depth,bowl=.305,H=opts.rimHeight??.82,g=new T.Group(),ss=M('stainless'),chrome=M('chrome');
  // bowl made as rim + side walls + bottom so cavity reads correctly
  const rimT=.038, wall=.026;
  g.add(box(W,rimT,D,ss,'SERVICE_SINK_ROLLED_RIM',[0,H,0]));
  g.add(box(W-2*rimT,.025,D-2*rimT,M('darkRubber'),'SERVICE_SINK_CAVITY_SHADOW',[0,H-.055,0]));
  for(const x of [-W/2+wall/2,W/2-wall/2])g.add(box(wall,bowl,D-2*rimT,ss,'SERVICE_SINK_BOWL_SIDE',[x,H-bowl/2-rimT,0]));
  for(const z of [-D/2+wall/2,D/2-wall/2])g.add(box(W-2*wall,bowl,wall,ss,'SERVICE_SINK_BOWL_SIDE',[0,H-bowl/2-rimT,z]));
  g.add(box(W-2*wall,.025,D-2*wall,ss,'SERVICE_SINK_BOWL_BOTTOM',[0,H-bowl-rimT,0]));
  g.add(box(W,.305,.035,ss,'SERVICE_SINK_FULL_BACKSPLASH',[0,H+.15,D/2-.018]));
  const drain=cyl(.055,.055,.018,chrome,'SERVICE_SINK_DRAIN',[0,H-bowl+.006,0],24);g.add(drain);g.add(torus(.043,.006,M('powderDark'),'SERVICE_SINK_DRAIN_GRATE',[0,H-bowl+.017,0],[Math.PI/2,0,0]));
  for(const x of [-W*.28,W*.28])g.add(tube(new T.Vector3(x,.12,D*.24),new T.Vector3(x,H-bowl+.02,D*.24),.026,ss,'SERVICE_SINK_WALL_SUPPORT_BRACKET'));
  // faucet with bucket hook spout vocabulary
  const z=D/2+.025;g.add(cyl(.027,.027,.12,chrome,'SERVICE_SINK_FAUCET_RISER',[0,H+.27,z]));g.add(tube(new T.Vector3(0,H+.33,z),new T.Vector3(0,H+.33,z-.18),.015,chrome,'SERVICE_SINK_BUCKET_HOOK_SPOUT'));g.add(tube(new T.Vector3(0,H+.33,z-.18),new T.Vector3(0,H+.25,z-.18),.015,chrome,'SERVICE_SINK_SPOUT_DROP'));
  for(const x of [-.10,.10]){g.add(cyl(.018,.018,.065,chrome,'SERVICE_SINK_FAUCET_VALVE',[x,H+.25,z],12));const hdl=tube(new T.Vector3(x-.035,H+.29,z),new T.Vector3(x+.035,H+.29,z),.008,chrome,'SERVICE_SINK_FAUCET_HANDLE');g.add(hdl);}
  return finalize(g,opts.semantic||'JANITOR_SERVICE_SINK_DETAILED',['ELKAY_ESS25202'],{dimensions:[W,H+.305,D],functionalCavity:true});
}

export function buildCompactHousekeepingCartDetailed(opts={}) {
  const L=opts.length??DIMENSION_PRESETS.housekeepingCartCompact.length,W=opts.width??DIMENSION_PRESETS.housekeepingCartCompact.width,H=opts.height??DIMENSION_PRESETS.housekeepingCartCompact.height,g=new T.Group(),poly=M('blackPolymer'),metal=M('galvanized');
  // molded base and upright spine
  const base=rb(L*.70,.16,W*.92,.055,poly,.012);base.position.set(-L*.08,.16,0);tag(base,'HOUSEKEEPING_CART_MOLDED_BASE');g.add(base);
  for(const x of [-L*.30,L*.12]){const post=rb(.10,H*.72,.10,.035,poly,.008);post.position.set(x,H*.47,0);tag(post,'HOUSEKEEPING_CART_UPRIGHT');g.add(post);}
  for(const y of [.43,.74,1.02]){const shelf=rb(L*.52,.055,W*.77,.025,poly,.006);shelf.position.set(-L*.08,y,0);tag(shelf,'HOUSEKEEPING_CART_ADJUSTABLE_SHELF');g.add(shelf);}
  // rear bag frame + bag
  const frameX=L*.42;for(const z of [-W*.30,W*.30])g.add(tube(new T.Vector3(frameX,.42,z),new T.Vector3(frameX,1.05,z),.018,metal,'HOUSEKEEPING_CART_BAG_FRAME'));g.add(tube(new T.Vector3(frameX,.98,-W*.30),new T.Vector3(frameX,.98,W*.30),.018,metal,'HOUSEKEEPING_CART_BAG_FRAME_TOP'));
  const bag=rb(.42,.65,W*.58,.08,M('clearPlastic',{color:0x6d7070,opacity:.30}),.008);bag.position.set(frameX+.12,.64,0);tag(bag,'HOUSEKEEPING_CART_WASTE_BAG');g.add(bag);
  // push handle
  const hx=-L*.48;g.add(tube(new T.Vector3(hx,.70,-W*.32),new T.Vector3(hx,1.14,-W*.32),.018,metal,'HOUSEKEEPING_CART_HANDLE_POST'));g.add(tube(new T.Vector3(hx,.70,W*.32),new T.Vector3(hx,1.14,W*.32),.018,metal,'HOUSEKEEPING_CART_HANDLE_POST'));g.add(tube(new T.Vector3(hx,1.14,-W*.32),new T.Vector3(hx,1.14,W*.32),.021,M('greyRubber'),'HOUSEKEEPING_CART_PUSH_GRIP'));
  // front caddy and side tool clips
  const caddy=rb(.46,.20,W*.65,.04,M('powderDark'),.006);caddy.position.set(-L*.26,1.12,0);tag(caddy,'HOUSEKEEPING_CART_SUPPLY_CADDY');g.add(caddy);for(let i=0;i<4;i++){const bottle=cyl(.032,.04,.20,M(i%2?'safetyGreen':'powderBlue'),'HOUSEKEEPING_CART_CHEMICAL_BOTTLE',[-L*.35+i*.09,1.27,-W*.12],12);g.add(bottle);}
  for(const z of [-W*.41,W*.41])for(const y of [.82,1.05])g.add(torus(.035,.008,metal,'HOUSEKEEPING_CART_TOOL_CLIP',[-L*.05,y,z],[Math.PI/2,0,0]));
  // casters: two large fixed + two swivels
  for(const [x,z] of [[-L*.30,-W*.33],[-L*.30,W*.33],[L*.28,-W*.33],[L*.28,W*.33]]){const c=caster(.052,.035,'HOUSEKEEPING_CART_CASTER');c.position.set(x,0,z);g.add(c);}
  return finalize(g,opts.semantic||'COMPACT_HOUSEKEEPING_CART_DETAILED',['RUBBERMAID_COMPACT_HK'],{dimensions:[L,H,W],casterCount:4});
}

export function buildJanitorChemicalShelfDetailed(opts={}) {
  const W=opts.width??1.20,D=opts.depth??.38,H=opts.height??1.80,g=new T.Group(),metal=M('galvanized');
  for(const x of [-W/2,W/2])for(const z of [-D/2,D/2])g.add(tube(new T.Vector3(x,.03,z),new T.Vector3(x,H,z),.016,metal,'JANITOR_SHELF_POST'));
  for(const y of [.18,.58,.98,1.38,1.76]){g.add(box(W,.035,D,metal,'JANITOR_SHELF_DECK',[0,y,0]));for(const z of [-D/2,D/2])g.add(tube(new T.Vector3(-W/2,y+.02,z),new T.Vector3(W/2,y+.02,z),.012,metal,'JANITOR_SHELF_EDGE_RAIL'));}
  for(let i=0;i<8;i++){const x=-W*.39+(i%4)*W*.26,y=i<4?.35:.75;const jug=rb(.18,.25,.13,.035,M(i%2?'powderBlue':'safetyGreen'),.006);jug.position.set(x,y,0);tag(jug,'JANITOR_CHEMICAL_JUG_REFERENCE',{actualChemical:'UNVERIFIED'});g.add(jug);const lab=plate(.09,.045,'JANITOR_CHEMICAL_LABEL','generic chemical label');lab.position.set(x,y,-.071);g.add(lab);}
  return finalize(g,opts.semantic||'JANITOR_CHEMICAL_SHELF_DETAILED',[],{dimensions:[W,H,D],chemicalIdentity:'UNVERIFIED'});
}

// ---------------------------------------------------------------------------
// 3) MAINTENANCE / WORKSHOP / SPARE PARTS
// ---------------------------------------------------------------------------
export function buildHeavyIndustrialCabinetDetailed(opts={}) {
  const W=opts.width??DIMENSION_PRESETS.strongCabinet.width,D=opts.depth??DIMENSION_PRESETS.strongCabinet.depth,H=opts.height??DIMENSION_PRESETS.strongCabinet.height,g=new T.Group(),steel=M('powderDark'),inner=M('powderLight');
  g.add(box(W,H,D,steel,'HEAVY_CABINET_WRAPAROUND_BODY',[0,H/2,0]));
  const gap=.014;for(const sx of [-1,1]){const door=rb(W/2-gap,H-.08,.025,.012,inner,.003);door.position.set(sx*(W/4),H/2,-D/2-.014);tag(door,'HEAVY_CABINET_DOOR',{side:sx<0?'LEFT':'RIGHT'});g.add(door);for(const y of [.20,H-.20])g.add(hinge(sx<0?-W/2+.018:W/2-.018,y,-D/2-.028,'HEAVY_CABINET_HINGE'));}
  for(const y of [.36,.72,1.08,1.44,1.78].filter(v=>v<H-.08))g.add(box(W-.09,.035,D-.08,inner,'HEAVY_CABINET_ADJUSTABLE_SHELF',[0,y,.01]));
  const handle=handleBar(.24,'HEAVY_CABINET_CAST_HANDLE');handle.rotation.z=Math.PI/2;handle.position.set(.11,H*.53,-D/2-.045);g.add(handle);
  // three-point locking rods
  g.add(tube(new T.Vector3(.02,.13,-D/2-.034),new T.Vector3(.02,H-.13,-D/2-.034),.008,M('chrome'),'HEAVY_CABINET_LOCK_ROD'));for(const y of [.15,H-.15])g.add(box(.07,.025,.025,M('chrome'),'HEAVY_CABINET_LOCK_CAM',[.02,y,-D/2-.035]));
  for(const x of [-W*.43,W*.43])for(const z of [-D*.40,D*.40])g.add(box(.07,.07,.07,M('powderDark'),'HEAVY_CABINET_FOOT',[x,.035,z]));
  return finalize(g,opts.semantic||'HEAVY_INDUSTRIAL_STORAGE_CABINET',['STRONGHOLD_56_244'],{dimensions:[W,H,D]});
}

export function buildFlammableSafetyCabinetReference(opts={}) {
  const W=opts.width??DIMENSION_PRESETS.flammableCabinet30gal.width,D=opts.depth??DIMENSION_PRESETS.flammableCabinet30gal.depth,H=opts.height??DIMENSION_PRESETS.flammableCabinet30gal.height,g=new T.Group(),yellow=M('powderYellow');
  // double-wall reading via outer shell + inner inset
  g.add(box(W,H,D,yellow,'SAFETY_CABINET_OUTER_SHELL',[0,H/2,0]));g.add(box(W-.05,H-.05,D-.05,M('powderLight',{color:0xd4aa20}),'SAFETY_CABINET_INNER_SHELL',[0,H/2,.015]));
  for(const sx of [-1,1]){const door=rb(W/2-.015,H-.09,.028,.012,yellow,.003);door.position.set(sx*W/4,H/2,-D/2-.018);tag(door,'SAFETY_CABINET_SELF_CLOSE_DOOR');g.add(door);for(const y of [.20,H-.20])g.add(hinge(sx<0?-W/2+.018:W/2-.018,y,-D/2-.033,'SAFETY_CABINET_PIANO_HINGE_SEGMENT'));}
  g.add(box(W-.08,.035,D-.08,M('powderYellow'),'SAFETY_CABINET_ADJUSTABLE_SHELF',[0,H*.47,0]));
  g.add(box(W-.04,.055,D-.04,M('powderYellow'),'SAFETY_CABINET_LEAKPROOF_SILL',[0,.055,0]));
  const handle=handleBar(.20,'SAFETY_CABINET_HANDLE');handle.rotation.z=Math.PI/2;handle.position.set(.09,H*.55,-D/2-.05);g.add(handle);
  for(const x of [-W*.38,W*.38]){const vent=cyl(.035,.035,.018,M('powderDark'),'SAFETY_CABINET_VENT_BUNG',[x,H*.78,-D/2-.028],18);vent.rotation.x=Math.PI/2;g.add(vent);}
  const lab=plate(.44,.16,'SAFETY_CABINET_WARNING_LABEL','FLAMMABLE / KEEP FIRE AWAY');lab.position.set(0,H*.76,-D/2-.055);g.add(lab);
  return finalize(g,opts.semantic||'FLAMMABLE_SAFETY_CABINET_REFERENCE',['JUST_RITE_30G'],{dimensions:[W,H,D],actualNeed:'VERIFY_BEFORE_PLACEMENT'});
}

export function buildMaintenanceShadowBoardDetailed(opts={}) {
  const W=opts.width??1.80,H=opts.height??1.00,g=new T.Group(),panel=M('powderBlue'),metal=M('galvanized');
  const board=rb(W,H,.035,.02,panel,.004);board.position.y=H/2;tag(board,'MAINTENANCE_SHADOW_BOARD');g.add(board);
  for(let row=0;row<5;row++)for(let col=0;col<10;col++){const hole=cyl(.006,.006,.02,M('powderDark'),'SHADOW_BOARD_PEG_HOLE',[-W*.43+col*W*.095,.12+row*.18,-.024],8);hole.rotation.x=Math.PI/2;g.add(hole);}
  const toolXs=[-.62,-.40,-.18,.08,.35,.60];for(let i=0;i<toolXs.length;i++){const x=toolXs[i],len=.25+i*.015;g.add(tube(new T.Vector3(x,.18,0),new T.Vector3(x,.18+len,0),.012,M(i%2?'chrome':'powderDark'),'SHADOW_BOARD_TOOL_REFERENCE'));const outline=box(.065,len+.04,.006,M('powderLight',{color:0xe7e7df}),'SHADOW_BOARD_TOOL_SHADOW',[x,.20+len/2,.020]);g.add(outline);}
  for(const x of [-W/2+.08,W/2-.08])g.add(tube(new T.Vector3(x,.02,.03),new T.Vector3(x,H-.02,.03),.012,metal,'SHADOW_BOARD_FRAME'));
  return finalize(g,opts.semantic||'MAINTENANCE_SHADOW_BOARD_DETAILED',[],{dimensions:[W,H,.035]});
}

export function buildSparePartBinWallDetailed(opts={}) {
  const cols=opts.cols??6,rows=opts.rows??7,bw=opts.binWidth??.22,bh=opts.binHeight??.16,bd=opts.binDepth??.33,g=new T.Group(),rack=M('powderDark');
  const W=cols*bw+.16,H=rows*bh+.20;for(const x of [-W/2+.03,W/2-.03])g.add(box(.06,H,.07,rack,'BIN_WALL_UPRIGHT',[x,H/2,.04]));for(const y of [.08,H-.08])g.add(box(W,.06,.07,rack,'BIN_WALL_CROSSRAIL',[0,y,.04]));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const x=-W/2+.11+c*bw+bw/2,y=.12+r*bh+bh/2;const bin=rb(bw-.018,bh-.018,bd,.018,M((r+c)%3===0?'powderBlue':'powderLight'),.004);bin.position.set(x,y,-bd/2);tag(bin,'SPAREPART_HOPPER_BIN',{row:r+1,col:c+1});g.add(bin);
    const lip=box(bw-.035,.035,.018,M('powderDark'),'SPAREPART_BIN_FRONT_LIP',[x,y-bh*.25,-bd-.01]);g.add(lip);const lab=plate(bw*.55,.035,'SPAREPART_BIN_LABEL','location / part id');lab.position.set(x,y,-bd-.022);g.add(lab);
  }
  return finalize(g,opts.semantic||'SPAREPART_BIN_WALL_DETAILED',[],{dimensions:[W,H,bd],bins:cols*rows});
}

export function buildDrawerPartsCabinetDetailed(opts={}) {
  const W=opts.width??.82,D=opts.depth??.60,H=opts.height??1.05,rows=opts.rows??8,g=new T.Group(),body=M('powderDark'),front=M('powderLight');g.add(box(W,H,D,body,'PARTS_DRAWER_CABINET_BODY',[0,H/2,0]));
  const dh=(H-.12)/rows;for(let i=0;i<rows;i++){const y=.07+dh*(i+.5);const dr=rb(W-.06,dh-.018,.025,.006,front,.002);dr.position.set(0,y,-D/2-.014);tag(dr,'PARTS_DRAWER_FRONT',{drawer:i+1});g.add(dr);const h=handleBar(.20,'PARTS_DRAWER_PULL');h.position.set(0,y,-D/2-.055);g.add(h);const lab=plate(.16,.04,'PARTS_DRAWER_LABEL','part family');lab.position.set(-W*.29,y,-D/2-.049);g.add(lab);}
  for(const x of [-W*.42,W*.42])for(const z of [-D*.4,D*.4])g.add(box(.05,.06,.05,M('darkRubber'),'PARTS_CABINET_FOOT',[x,.03,z]));return finalize(g,opts.semantic||'SPAREPART_DRAWER_CABINET_DETAILED',[],{dimensions:[W,H,D],drawers:rows});
}

// ---------------------------------------------------------------------------
// 4) QC / PREPRESS
// ---------------------------------------------------------------------------
export function buildQCSampleCabinetDetailed(opts={}) {
  const W=opts.width??1.10,D=opts.depth??.45,H=opts.height??1.80,g=new T.Group(),body=M('powderLight'),glass=M('acrylicClear');g.add(box(W,H,D,body,'QC_SAMPLE_CABINET_BODY',[0,H/2,0]));
  for(const y of [.34,.68,1.02,1.36,1.68])g.add(box(W-.07,.025,D-.07,M('galvanized'),'QC_SAMPLE_CABINET_SHELF',[0,y,0]));
  for(const sx of [-1,1]){const door=rb(W/2-.02,H-.07,.018,.008,glass,.002);door.position.set(sx*W/4,H/2,-D/2-.011);tag(door,'QC_SAMPLE_CABINET_GLAZED_DOOR');g.add(door);g.add(hinge(sx<0?-W/2+.018:W/2-.018,H*.30,-D/2-.026,'QC_CABINET_HINGE'));g.add(hinge(sx<0?-W/2+.018:W/2-.018,H*.72,-D/2-.026,'QC_CABINET_HINGE'));}
  for(let i=0;i<12;i++){const x=-W*.34+(i%4)*W*.23,y=.22+Math.floor(i/4)*.34;const sample=box(.15,.018,.22,M(i%3===0?'paper':'carton'),'QC_SAMPLE_COUPON',[x,y,-D*.18]);sample.rotation.y=(i%2?-.08:.06);g.add(sample);}
  return finalize(g,opts.semantic||'QC_SAMPLE_STORAGE_CABINET_DETAILED',[],{dimensions:[W,H,D]});
}

export function buildQCInstrumentSideTableDetailed(opts={}) {
  const W=opts.width??.78,D=opts.depth??.60,H=opts.height??.84,g=new T.Group(),frame=M('powderDark');g.add(box(W,.045,D,M('lightLaminate'),'QC_INSTRUMENT_TABLE_TOP',[0,H,0]));
  for(const x of [-W*.43,W*.43])for(const z of [-D*.40,D*.40])g.add(tube(new T.Vector3(x,.06,z),new T.Vector3(x,H-.02,z),.018,frame,'QC_INSTRUMENT_TABLE_LEG'));
  g.add(box(W-.10,.025,D-.12,M('powderLight'),'QC_INSTRUMENT_LOWER_SHELF',[0,.26,0]));const inst=rb(.34,.22,.40,.035,M('powderLight'),.006);inst.position.set(0,H+.13,0);tag(inst,'QC_INSTRUMENT_GENERIC_ENVELOPE',{instrumentIdentity:'UNVERIFIED'});g.add(inst);const display=rb(.18,.07,.008,.006,M('screenDark'),.002);display.position.set(0,H+.16,-.205);tag(display,'QC_INSTRUMENT_DISPLAY_REFERENCE');g.add(display);const cable=tube(new T.Vector3(.13,H+.02,.15),new T.Vector3(.27,.30,.20),.006,M('darkRubber'),'QC_INSTRUMENT_CABLE');g.add(cable);return finalize(g,opts.semantic||'QC_INSTRUMENT_SIDE_TABLE_DETAILED',[],{dimensions:[W,H,D]});
}

export function buildPrepressPlateRackAFrame(opts={}) {
  const L=opts.length??1.45,W=opts.width??.78,H=opts.height??1.55,g=new T.Group(),frame=M('powderLight');
  // A-frame sides
  for(const x of [-L/2,L/2]){g.add(tube(new T.Vector3(x,.08,-W/2),new T.Vector3(x,H,0),.028,frame,'PREPRESS_AFRAME_UPRIGHT'));g.add(tube(new T.Vector3(x,.08,W/2),new T.Vector3(x,H,0),.028,frame,'PREPRESS_AFRAME_UPRIGHT'));}
  for(const y of [.12,.62,1.12])g.add(tube(new T.Vector3(-L/2,y,-W*.28),new T.Vector3(L/2,y,-W*.28),.022,frame,'PREPRESS_AFRAME_CROSSBAR'));
  for(const side of [-1,1])for(let i=0;i<6;i++){const y=.20+i*.20,z=side*(W*.18-i*.015);const plate=box(L*.80,.012,.36,M('paper',{color:i%2?0xc3ced0:0xb7c4c8}),'PREPRESS_PLATE_REFERENCE',[0,y,z]);plate.rotation.x=side*.16;g.add(plate);}
  for(const [x,z] of [[-L*.42,-W*.38],[-L*.42,W*.38],[L*.42,-W*.38],[L*.42,W*.38]]){const c=caster(.05,.032,'PREPRESS_AFRAME_CASTER');c.position.set(x,0,z);g.add(c);}
  return finalize(g,opts.semantic||'PREPRESS_PLATE_AFRAME_TROLLEY_DETAILED',[],{dimensions:[L,H,W],plateIdentity:'GENERIC_REFERENCE'});
}

export function buildPlateCassetteRackDetailed(opts={}) {
  const W=opts.width??1.00,D=opts.depth??.58,H=opts.height??1.90,slots=opts.slots??8,g=new T.Group(),metal=M('powderDark');g.add(box(W,H,D,metal,'PLATE_CASSETTE_RACK_CARCASS',[0,H/2,0]));
  for(let i=0;i<=slots;i++){const x=-W/2+.05+i*(W-.10)/slots;g.add(box(.018,H-.12,D-.10,M('galvanized'),'PLATE_CASSETTE_DIVIDER',[x,H/2,0]));}
  for(let i=0;i<slots;i++){const lab=plate(.07,.035,'PLATE_CASSETTE_SLOT_LABEL','plate slot');lab.position.set(-W/2+.08+(i+.5)*(W-.10)/slots,H-.10,-D/2-.014);g.add(lab);}
  return finalize(g,opts.semantic||'PREPRESS_PLATE_CASSETTE_RACK_DETAILED',[],{dimensions:[W,H,D],slots});
}

// ---------------------------------------------------------------------------
// 5) PANTRY / BREAK ROOM
// ---------------------------------------------------------------------------
export function buildBreakroomCabinetRunDetailed(opts={}) {
  const L=opts.length??3.20,D=opts.depth??.62,Htop=opts.worktopHeight??.90,g=new T.Group(),cab=M('darkLaminate'),top=M('lightLaminate'),ss=M('stainless');
  const modules=Math.max(3,Math.round(L/.64)),mw=L/modules;
  g.add(box(L,.04,D,top,'PANTRY_COUNTERTOP',[0,Htop,0]));
  for(let i=0;i<modules;i++){const x=-L/2+mw*(i+.5);g.add(box(mw-.012,Htop-.08,D-.04,cab,'PANTRY_BASE_CABINET',[x,(Htop-.08)/2,.02]));const door=rb(mw-.045,Htop-.15,.018,.008,M('lightLaminate'),.002);door.position.set(x,(Htop-.08)/2,-D/2-.012);tag(door,'PANTRY_BASE_DOOR');g.add(door);const h=handleBar(.12,'PANTRY_DOOR_HANDLE');h.rotation.z=Math.PI/2;h.position.set(x+mw*.30,Htop*.60,-D/2-.045);g.add(h);}
  // sink module near left third
  const sx=-L*.18;g.add(box(.62,.025,.42,ss,'PANTRY_SINK_RIM',[sx,Htop+.018,0]));g.add(box(.52,.16,.33,M('powderDark',{color:0x6b7374}),'PANTRY_SINK_BOWL_SHADOW',[sx,Htop-.07,0]));g.add(tube(new T.Vector3(sx,Htop+.04,.12),new T.Vector3(sx,Htop+.34,.12),.014,M('chrome'),'PANTRY_FAUCET_RISER'));g.add(torus(.10,.014,M('chrome'),'PANTRY_FAUCET_ARCH',[sx,Htop+.34,.02],[0,0,Math.PI/2]));
  // wall cabinets
  const upperY=1.68,upperH=.62;for(let i=0;i<modules;i++){const x=-L/2+mw*(i+.5);g.add(box(mw-.014,upperH,.34,cab,'PANTRY_WALL_CABINET',[x,upperY,.16]));const d=rb(mw-.045,upperH-.05,.018,.008,M('lightLaminate'),.002);d.position.set(x,upperY,-.02);tag(d,'PANTRY_WALL_CABINET_DOOR');g.add(d);}
  // backsplash
  g.add(box(L,.46,.014,M('whiteCeramic'),'PANTRY_BACKSPLASH',[0,1.15,D/2+.018]));
  return finalize(g,opts.semantic||'PANTRY_CABINET_RUN_DETAILED',[],{dimensions:[L,2.0,D]});
}

export function buildCommercialRefrigeratorDetailed(opts={}) {
  const W=opts.width??.72,D=opts.depth??.72,H=opts.height??1.78,g=new T.Group(),body=M('stainless');g.add(rb(W,H,D,.035,body,.009));tag(g.children[0],'PANTRY_REFRIGERATOR_BODY');
  const seam=box(W-.06,.012,.012,M('powderDark'),'REFRIGERATOR_DOOR_SEAM',[0,H*.40,-D/2-.018]);g.add(seam);for(const y of [H*.27,H*.66]){const h=handleBar(.34,'REFRIGERATOR_HANDLE');h.rotation.z=Math.PI/2;h.position.set(W*.33,y,-D/2-.055);g.add(h);}for(const x of [-W*.38,W*.38])for(const z of [-D*.38,D*.38])g.add(box(.04,.055,.04,M('darkRubber'),'REFRIGERATOR_FOOT',[x,.028,z]));return finalize(g,opts.semantic||'COMMERCIAL_BREAKROOM_REFRIGERATOR',[],{dimensions:[W,H,D]});
}

export function buildMicrowaveShelfTowerDetailed(opts={}) {
  const W=opts.width??.68,D=opts.depth??.52,H=opts.height??1.65,g=new T.Group();g.add(box(W,H,D,M('darkLaminate'),'MICROWAVE_TOWER_CARCASS',[0,H/2,0]));for(const y of [.52,1.02,1.58])g.add(box(W-.05,.025,D-.05,M('lightLaminate'),'MICROWAVE_TOWER_SHELF',[0,y,0]));
  const microwave=rb(.53,.31,.40,.035,M('powderDark'),.006);microwave.position.set(0,.78,-.02);tag(microwave,'COUNTERTOP_MICROWAVE_REFERENCE');g.add(microwave);const glass=rb(.32,.19,.008,.015,M('screenDark'),.002);glass.position.set(-.06,.80,-.225);tag(glass,'MICROWAVE_DOOR_WINDOW');g.add(glass);for(let i=0;i<4;i++)g.add(cyl(.009,.009,.007,M('chrome'),'MICROWAVE_CONTROL_BUTTON',[.19,.70+i*.06,-.228],10));return finalize(g,opts.semantic||'PANTRY_MICROWAVE_TOWER_DETAILED',[],{dimensions:[W,H,D]});
}

// ---------------------------------------------------------------------------
// 6) RESTROOM
// ---------------------------------------------------------------------------
export function buildCommercialToiletDetailed(opts={}) {
  const g=new T.Group(),cer=M('whiteCeramic'),chrome=M('chrome');const bowl=rb(.38,.28,.58,.16,cer,.02);bowl.position.set(0,.29,.05);tag(bowl,'COMMERCIAL_TOILET_BOWL');g.add(bowl);const seat=torus(.16,.028,M('blackPolymer'),'TOILET_SEAT',[0,.46,-.04],[Math.PI/2,0,0]);seat.scale.z=1.25;g.add(seat);const tank=rb(.42,.52,.18,.035,cer,.008);tank.position.set(0,.70,.26);tag(tank,'TOILET_CISTERN');g.add(tank);g.add(cyl(.012,.012,.055,chrome,'TOILET_FLUSH_BUTTON',[.13,.98,.23],12));g.add(tube(new T.Vector3(0,.08,.27),new T.Vector3(0,.03,.27),.028,chrome,'TOILET_FLOOR_WASTE_CONNECTION'));return finalize(g,opts.semantic||'COMMERCIAL_TOILET_DETAILED',[],{dimensions:[.42,.98,.68]});
}

export function buildRestroomCubicleDetailed(opts={}) {
  const W=opts.width??.95,D=opts.depth??1.50,H=opts.height??1.95,g=new T.Group(),panel=M('darkLaminate'),metal=M('stainless');
  for(const x of [-W/2,W/2])g.add(box(.025,H,D,panel,'TOILET_CUBICLE_SIDE_PANEL',[x,H/2+.08,0]));g.add(box(W,.025,D,M('whiteCeramic'),'TOILET_CUBICLE_FLOOR_REFERENCE',[0,.013,0]));const door=rb(W-.14,H-.12,.025,.012,panel,.003);door.position.set(0,H/2+.08,-D/2);tag(door,'TOILET_CUBICLE_DOOR');g.add(door);for(const y of [.45,1.45])g.add(hinge(-W/2+.09,y,-D/2-.018,'TOILET_CUBICLE_HINGE'));const lock=box(.08,.04,.02,metal,'TOILET_CUBICLE_LATCH',[W*.32,1.02,-D/2-.025]);g.add(lock);for(const x of [-W*.44,W*.44])for(const z of [-D*.42,D*.42])g.add(cyl(.015,.02,.16,metal,'TOILET_CUBICLE_PEDESTAL',[x,.08,z],12));const toilet=buildCommercialToiletDetailed();toilet.position.set(0,0,.28);g.add(toilet);return finalize(g,opts.semantic||'RESTROOM_CUBICLE_DETAILED',[],{dimensions:[W,H,D]});
}

export function buildRestroomVanityDetailed(opts={}) {
  const W=opts.width??1.20,D=opts.depth??.52,H=opts.height??.86,g=new T.Group(),top=M('lightLaminate'),body=M('darkLaminate'),cer=M('whiteCeramic');g.add(box(W,.045,D,top,'RESTROOM_VANITY_TOP',[0,H,0]));g.add(box(W-.04,H-.08,D-.04,body,'RESTROOM_VANITY_CABINET',[0,(H-.08)/2,.02]));
  const basin=rb(.48,.10,.34,.12,cer,.015);basin.position.set(0,H+.005,0);tag(basin,'RESTROOM_LAVATORY_BASIN');g.add(basin);g.add(cyl(.055,.055,.018,M('chrome'),'RESTROOM_DRAIN',[0,H+.025,0],24));g.add(tube(new T.Vector3(0,H+.03,.12),new T.Vector3(0,H+.28,.12),.014,M('chrome'),'RESTROOM_FAUCET_RISER'));g.add(tube(new T.Vector3(0,H+.28,.12),new T.Vector3(0,H+.28,-.06),.014,M('chrome'),'RESTROOM_FAUCET_SPOUT'));
  const mirror=rb(W*.72,.72,.018,.012,M('chrome',{color:0xbcc9ca,roughness:.12,metalness:.84}),.002);mirror.position.set(0,1.42,D/2+.02);tag(mirror,'RESTROOM_MIRROR');g.add(mirror);return finalize(g,opts.semantic||'RESTROOM_VANITY_DETAILED',['BOBRICK_WASHROOM'],{dimensions:[W,1.80,D]});
}

export function buildRestroomAccessoryBankDetailed(opts={}) {
  const g=new T.Group(),ss=M('stainless');const towel=rb(.28,.40,.10,.022,ss,.005);towel.position.set(-.40,1.20,0);tag(towel,'RESTROOM_PAPER_TOWEL_DISPENSER');g.add(towel);const slot=box(.17,.018,.008,M('powderDark'),'TOWEL_DISPENSER_SLOT',[-.40,1.08,-.055]);g.add(slot);const soap=rb(.12,.22,.10,.025,M('stainless'),.004);soap.position.set(0,1.18,0);tag(soap,'RESTROOM_SOAP_DISPENSER');g.add(soap);g.add(box(.05,.02,.04,M('chrome'),'SOAP_DISPENSER_PUSH_BAR',[0,1.11,-.06]));const waste=rb(.32,.56,.20,.03,ss,.006);waste.position.set(.42,.55,0);tag(waste,'RESTROOM_WASTE_RECEPTACLE');g.add(waste);return finalize(g,opts.semantic||'RESTROOM_ACCESSORY_BANK_DETAILED',['BOBRICK_WASHROOM'],{families:['towel','soap','waste']});
}

// ---------------------------------------------------------------------------
// 7) ELECTRICAL ROOM
// ---------------------------------------------------------------------------
export function buildElectricalInsulatingMatRun(opts={}) {
  const L=opts.length??4.0,W=opts.width??1.0,Tm=opts.thickness??.006,g=new T.Group();const mat=rb(L,Tm,W,.018,M('darkRubber'),.002);mat.position.y=Tm/2;tag(mat,'ELECTRICAL_INSULATING_MAT_REFERENCE',{electricalRating:'UNVERIFIED_FOR_BMJ'});g.add(mat);for(const z of [-W/2+.03,W/2-.03])g.add(box(L,.003,.04,M('powderYellow'),'ELECTRICAL_MAT_VISIBILITY_EDGE',[0,Tm+.002,z]));return finalize(g,opts.semantic||'ELECTRICAL_INSULATING_MAT_RUN',[],{dimensions:[L,Tm,W],safetyNote:'Reference only; actual electrical class must be verified'});
}

export function buildElectricalDocumentStationDetailed(opts={}) {
  const g=new T.Group(),body=M('powderLight');const holder=rb(.42,.56,.07,.018,body,.004);holder.position.set(0,.60,0);tag(holder,'ELECTRICAL_DRAWING_HOLDER');g.add(holder);for(let i=0;i<5;i++){const sheet=box(.34,.005,.24,M('paper'),'ELECTRICAL_DRAWING_SHEET',[0,.48+i*.018,-.04]);sheet.rotation.x=-.10;g.add(sheet);}const lab=plate(.27,.055,'ELECTRICAL_DOC_LABEL','SLD / PANEL DRAWING');lab.position.set(0,.80,-.04);g.add(lab);return finalize(g,opts.semantic||'ELECTRICAL_DOCUMENT_STATION_DETAILED',[],{documentContent:'UNVERIFIED'});
}

// ---------------------------------------------------------------------------
// 8) DISPATCH / LOADING DOCK
// ---------------------------------------------------------------------------
export function buildIndustrialPackingStationDetailed(opts={}) {
  const W=opts.width??DIMENSION_PRESETS.packingTable.width,D=opts.depth??DIMENSION_PRESETS.packingTable.depth,H=opts.height??DIMENSION_PRESETS.packingTable.height,g=new T.Group(),steel=M('powderDark'),top=M('stainless');
  g.add(box(W,.038,D,top,'PACKING_TABLE_STEEL_WORKTOP',[0,H,0]));for(const x of [-W*.44,W*.44])for(const z of [-D*.40,D*.40])g.add(tube(new T.Vector3(x,.04,z),new T.Vector3(x,H-.02,z),.023,steel,'PACKING_TABLE_ADJUSTABLE_LEG'));
  g.add(box(W-.16,.035,.356,M('galvanized'),'PACKING_TABLE_BOTTOM_SHELF',[0,.25,0]));
  // rear uprights and shelf
  for(const x of [-W*.46,W*.46])g.add(tube(new T.Vector3(x,H+.02,D*.42),new T.Vector3(x,1.72,D*.42),.02,steel,'PACKING_STATION_UPRIGHT'));
  g.add(box(W-.08,.035,.30,M('powderLight'),'PACKING_STATION_UPPER_SHELF',[0,1.55,D*.38]));
  // roll holders
  g.add(tube(new T.Vector3(-W*.32,1.30,D*.38),new T.Vector3(W*.32,1.30,D*.38),.018,M('chrome'),'PACKING_ROLL_HOLDER_BAR'));for(const x of [-.32,0,.32]){const roll=cyl(.09,.09,.18,M('kraft'),'PACKING_MATERIAL_ROLL',[x,1.30,D*.38],24);roll.rotation.z=Math.PI/2;g.add(roll);}
  const cutter=box(.48,.05,.11,M('powderDark'),'PACKING_TAPE_CUTTER_RAIL',[W*.22,H+.07,-D*.30]);g.add(cutter);const scale=rb(.36,.055,.30,.015,M('powderLight'),.004);scale.position.set(-W*.25,H+.05,-D*.13);tag(scale,'PACKING_BENCH_SCALE_REFERENCE');g.add(scale);const scanner=rb(.10,.20,.14,.03,M('blackPolymer'),.005);scanner.position.set(W*.35,H+.16,-D*.15);scanner.rotation.z=-.18;tag(scanner,'PACKING_BARCODE_SCANNER_REFERENCE');g.add(scanner);
  return finalize(g,opts.semantic||'INDUSTRIAL_PACKING_STATION_DETAILED',['ULINE_H6864'],{dimensions:[W,1.72,D]});
}

export function buildDockBumperDetailed(opts={}) {
  const W=opts.width??DIMENSION_PRESETS.dockBumper.width,H=opts.height??DIMENSION_PRESETS.dockBumper.height,D=opts.depth??DIMENSION_PRESETS.dockBumper.depth,g=new T.Group(),rubber=M('darkRubber');const block=rb(W,H,D,.015,rubber,.005);block.position.y=H/2;tag(block,'DOCK_MOLDED_RUBBER_BUMPER');g.add(block);for(const x of [-W*.28,W*.28])for(const y of [H*.28,H*.72]){const washer=cyl(.025,.025,.008,M('galvanized'),'DOCK_BUMPER_ANCHOR_WASHER',[x,y,-D/2-.005],16);washer.rotation.x=Math.PI/2;g.add(washer);g.add(bolt(x,y,-D/2-.012,'DOCK_BUMPER_ANCHOR_BOLT'));}return finalize(g,opts.semantic||'DOCK_BUMPER_DETAILED',['VESTIL_DOCK_BUMPER'],{dimensions:[W,H,D]});
}

export function buildDockWheelChockStationDetailed(opts={}) {
  const g=new T.Group(),rubber=M('darkRubber'),metal=M('galvanized');const shape=new T.Shape();shape.moveTo(-.18,0);shape.lineTo(.18,0);shape.lineTo(.11,.20);shape.lineTo(-.08,.20);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSegments:2,bevelSize:.008,bevelThickness:.008});geo.translate(0,0,-.12);const chock=new T.Mesh(geo,rubber);chock.castShadow=true;tag(chock,'DOCK_WHEEL_CHOCK');g.add(chock);for(let i=0;i<5;i++)g.add(box(.22,.012,.012,M('greyRubber'),'CHOCK_TREAD_RIB',[0,.04+i*.032,-.125]));
  // chain and wall holder
  let prev=new T.Vector3(.16,.12,.05);for(let i=0;i<11;i++){const p=new T.Vector3(.20+i*.045,.10+Math.sin(i*.8)*.018,.05);g.add(tube(prev,p,.006,metal,'WHEEL_CHOCK_CHAIN_LINK_REFERENCE',6));prev=p;}const holder=box(.22,.28,.08,M('powderYellow'),'WHEEL_CHOCK_WALL_HOLDER',[.76,.26,.05]);g.add(holder);return finalize(g,opts.semantic||'DOCK_WHEEL_CHOCK_STATION',['POWERAMP_CHOCK'],{dimensions:[1.0,.40,.30]});
}

export function buildDockGuardRailDetailed(opts={}) {
  const L=opts.length??2.4,H=opts.height??1.10,g=new T.Group(),yellow=M('powderYellow');for(const x of [-L/2,0,L/2])g.add(tube(new T.Vector3(x,.02,0),new T.Vector3(x,H,0),.035,yellow,'DOCK_GUARDRAIL_POST'));for(const y of [.55,1.02])g.add(tube(new T.Vector3(-L/2,y,0),new T.Vector3(L/2,y,0),.032,yellow,'DOCK_GUARDRAIL_RAIL'));for(const x of [-L/2,0,L/2]){g.add(box(.16,.012,.16,M('galvanized'),'DOCK_GUARDRAIL_BASEPLATE',[x,.006,0]));for(const sx of [-.05,.05])g.add(bolt(x+sx,.012,-.05,'DOCK_GUARDRAIL_ANCHOR'));}return finalize(g,opts.semantic||'DOCK_EDGE_GUARDRAIL_DETAILED',[],{dimensions:[L,H,.16]});
}

// ---------------------------------------------------------------------------
// 9) WAREHOUSE / RMS / FG
// ---------------------------------------------------------------------------
export function buildSelectivePalletRackBayDetailed(opts={}) {
  const W=opts.width??DIMENSION_PRESETS.palletRackBay.width,D=opts.depth??DIMENSION_PRESETS.palletRackBay.depth,H=opts.height??DIMENSION_PRESETS.palletRackBay.height,levels=opts.levels??3,g=new T.Group(),upr=M('powderBlue'),beam=M('safetyOrange'),brace=M('galvanized');
  const frameX=[-W/2,W/2];for(const x of frameX){for(const z of [-D/2,D/2])g.add(box(.075,H,.075,upr,'PALLET_RACK_UPRIGHT_POST',[x,H/2,z]));for(let y=.30;y<H-.20;y+=.52){g.add(tube(new T.Vector3(x,y,-D/2),new T.Vector3(x,y+.26,D/2),.018,brace,'PALLET_RACK_DIAGONAL_BRACE'));g.add(tube(new T.Vector3(x,y,D/2),new T.Vector3(x,y+.26,-D/2),.018,brace,'PALLET_RACK_DIAGONAL_BRACE'));}}
  for(let i=1;i<=levels;i++){const y=.30+i*(H-.55)/(levels+1);for(const z of [-D/2,D/2]){g.add(box(W-.08,.11,.08,beam,'PALLET_RACK_LOAD_BEAM',[0,y,z]));for(const x of [-W/2+.07,W/2-.07])g.add(box(.055,.12,.10,M('powderYellow'),'PALLET_RACK_BEAM_LOCK',[x,y,z]));}for(let x=-W*.35;x<=W*.35;x+=W*.175)g.add(tube(new T.Vector3(x,y,-D/2+.04),new T.Vector3(x,y,D/2-.04),.012,brace,'PALLET_RACK_DECK_SUPPORT'));}
  for(const x of frameX)for(const z of [-D/2,D/2]){g.add(box(.18,.012,.18,M('galvanized'),'PALLET_RACK_BASEPLATE',[x,.006,z]));for(const sx of [-.05,.05])g.add(bolt(x+sx,.012,z-.05,'PALLET_RACK_ANCHOR'));}
  // yellow upright protectors at aisle face
  for(const x of frameX){const guard=rb(.18,.62,.18,.035,M('powderYellow'),.006);guard.position.set(x,.31,-D/2-.10);tag(guard,'PALLET_RACK_UPRIGHT_PROTECTOR');g.add(guard);}
  return finalize(g,opts.semantic||'SELECTIVE_PALLET_RACK_BAY_DETAILED',['MECALUX_SELECTIVE_RACK'],{dimensions:[W,H,D],levels});
}

export function buildWrappedPaperboardPalletDetailed(opts={}) {
  const W=opts.width??1.20,D=opts.depth??1.00,H=opts.loadHeight??.95,g=new T.Group();const pallet=V1.buildWoodPallet({width:W,depth:D,semantic:'RMS_WOOD_PALLET'});g.add(pallet);
  for(let i=0;i<10;i++){const sheet=box(W*.91,.045,D*.86,M(i%3?'paper':'kraft'),'RMS_PAPERBOARD_REAM_LAYER',[0,.17+i*(H-.20)/10,0]);g.add(sheet);}
  const wrap=box(W*.96,H,D*.92,M('clearPlastic',{opacity:.13,roughness:.16}),'RMS_STRETCH_WRAP',[0,.16+H/2,0]);g.add(wrap);for(const x of [-W*.32,W*.32])g.add(box(.032,H+.04,D*.96,M('powderBlue'),'RMS_VERTICAL_STRAP',[x,.16+H/2,0]));for(const x of [-W*.46,W*.46])for(const z of [-D*.42,D*.42])g.add(box(.04,H+.02,.04,M('kraft'),'RMS_CORNER_PROTECTOR',[x,.16+H/2,z]));const lab=plate(.22,.12,'RMS_PALLET_LABEL','material status / lot');lab.position.set(W*.30,.60,-D*.47);g.add(lab);return finalize(g,opts.semantic||'RMS_WRAPPED_PAPERBOARD_PALLET_DETAILED',[],{dimensions:[W,H+.18,D],inventory:'NOT_ACTUAL'});
}

export function buildWheeledWasteBinDetailed(opts={}) {
  const W=opts.width??.58,D=opts.depth??.72,H=opts.height??1.02,g=new T.Group(),poly=M('safetyGreen');const body=rb(W,H*.76,D,.055,poly,.012);body.position.set(0,H*.42,0);body.rotation.x=-.015;tag(body,'WHEELED_WASTE_BIN_BODY');g.add(body);const lid=rb(W+.04,.08,D+.03,.04,M('powderDark'),.008);lid.position.set(0,H*.83,-.03);lid.rotation.x=-.08;tag(lid,'WHEELED_WASTE_BIN_LID');g.add(lid);g.add(tube(new T.Vector3(-W*.35,H*.82,D*.42),new T.Vector3(W*.35,H*.82,D*.42),.016,M('galvanized'),'WASTE_BIN_LID_HINGE'));for(const x of [-W*.30,W*.30]){const wh=cyl(.085,.085,.055,M('darkRubber'),'WASTE_BIN_WHEEL',[x,.085,D*.34],18);wh.rotation.z=Math.PI/2;g.add(wh);const hub=cyl(.028,.028,.062,M('galvanized'),'WASTE_BIN_WHEEL_HUB',[x,.085,D*.34],14);hub.rotation.z=Math.PI/2;g.add(hub);}const label=plate(.22,.11,'WASTE_BIN_SEGREGATION_LABEL','waste stream');label.position.set(0,H*.48,-D/2-.02);g.add(label);return finalize(g,opts.semantic||'WHEELED_WASTE_BIN_DETAILED',[],{dimensions:[W,H,D]});
}

export function buildMaterialHandlingBarrierDetailed(opts={}) {
  const L=opts.length??2.0,H=opts.height??1.05,g=new T.Group(),yellow=M('powderYellow');for(const x of [-L/2,0,L/2]){g.add(tube(new T.Vector3(x,.05,0),new T.Vector3(x,H,0),.032,yellow,'WAREHOUSE_BARRIER_POST'));g.add(box(.16,.012,.16,M('galvanized'),'WAREHOUSE_BARRIER_BASEPLATE',[x,.006,0]));}for(const y of [.50,.98])g.add(tube(new T.Vector3(-L/2,y,0),new T.Vector3(L/2,y,0),.032,yellow,'WAREHOUSE_BARRIER_RAIL'));return finalize(g,opts.semantic||'MATERIAL_HANDLING_SAFETY_BARRIER',[],{dimensions:[L,H,.16]});
}

// ---------------------------------------------------------------------------
// 10) PRODUCTION LINE-SIDE / GENERAL ACCESSORIES
// ---------------------------------------------------------------------------
export function buildLineSideSupportStationDetailed(opts={}) {
  const W=opts.width??1.20,D=opts.depth??.62,H=opts.height??.95,g=new T.Group(),frame=M('powderDark');g.add(box(W,.045,D,M('stainless'),'LINE_SIDE_WORKTOP',[0,H,0]));for(const x of [-W*.43,W*.43])for(const z of [-D*.38,D*.38])g.add(tube(new T.Vector3(x,.055,z),new T.Vector3(x,H-.02,z),.02,frame,'LINE_SIDE_STATION_LEG'));g.add(box(W-.10,.025,D-.10,M('galvanized'),'LINE_SIDE_LOWER_SHELF',[0,.25,0]));for(let i=0;i<3;i++){const tray=rb(.30,.06,.22,.018,M('powderLight'),.003);tray.position.set(-W*.28+i*W*.28,H+.06,-.10);tag(tray,'LINE_SIDE_SAMPLE_TRAY');g.add(tray);}const board=plate(.52,.30,'LINE_SIDE_STATUS_BOARD','status / sample / hold');board.position.set(0,1.32,D*.30);g.add(board);for(const [x,z] of [[-W*.44,-D*.39],[-W*.44,D*.39],[W*.44,-D*.39],[W*.44,D*.39]]){const c=caster(.04,.028,'LINE_SIDE_STATION_CASTER');c.position.set(x,0,z);g.add(c);}return finalize(g,opts.semantic||'PRODUCTION_LINE_SIDE_SUPPORT_STATION',[],{dimensions:[W,1.48,D]});
}

export function buildColumnImpactGuardDetailed(opts={}) {
  const W=opts.width??.45,D=opts.depth??.45,H=opts.height??.80,g=new T.Group(),yellow=M('powderYellow');for(const side of [-1,1]){const p=rb(.10,H,D,.03,yellow,.006);p.position.set(side*W/2,H/2,0);tag(p,'COLUMN_GUARD_SIDE');g.add(p);const q=rb(W,H,.10,.03,yellow,.006);q.position.set(0,H/2,side*D/2);tag(q,'COLUMN_GUARD_SIDE');g.add(q);}for(const x of [-W/2,W/2])for(const z of [-D/2,D/2])g.add(box(.12,.012,.12,M('galvanized'),'COLUMN_GUARD_BASEPLATE',[x,.006,z]));return finalize(g,opts.semantic||'COLUMN_IMPACT_GUARD_DETAILED',[],{dimensions:[W,H,D]});
}

export function buildWeatherproofOutdoorBinDetailed(opts={}) {
  const W=opts.width??.62,D=opts.depth??.62,H=opts.height??1.05,g=new T.Group(),body=M('powderDark');const shell=rb(W,H*.88,D,.06,body,.012);shell.position.set(0,H*.46,0);tag(shell,'OUTDOOR_BIN_BODY');g.add(shell);const hood=rb(W+.05,.20,D+.06,.08,M('powderLight'),.012);hood.position.set(0,H*.91,0);tag(hood,'OUTDOOR_BIN_RAIN_HOOD');g.add(hood);const opening=rb(W*.52,.18,.03,.04,M('blackPolymer'),.004);opening.position.set(0,H*.73,-D/2-.025);tag(opening,'OUTDOOR_BIN_OPENING');g.add(opening);for(const x of [-W*.36,W*.36])for(const z of [-D*.36,D*.36])g.add(box(.05,.06,.05,M('darkRubber'),'OUTDOOR_BIN_FOOT',[x,.03,z]));return finalize(g,opts.semantic||'WEATHERPROOF_OUTDOOR_WASTE_BIN',[],{dimensions:[W,H,D]});
}

// ---------------------------------------------------------------------------
// Catalog + audits
// ---------------------------------------------------------------------------
export const BUILDER_CATALOG_V2 = Object.freeze({
  industrialLockerDetailed:buildIndustrialLockerDetailed,lockerBenchDetailed:buildLockerBenchDetailed,
  janitorServiceSinkDetailed:buildJanitorServiceSinkDetailed,compactHousekeepingCartDetailed:buildCompactHousekeepingCartDetailed,janitorChemicalShelfDetailed:buildJanitorChemicalShelfDetailed,
  heavyIndustrialCabinetDetailed:buildHeavyIndustrialCabinetDetailed,flammableSafetyCabinetReference:buildFlammableSafetyCabinetReference,maintenanceShadowBoardDetailed:buildMaintenanceShadowBoardDetailed,sparePartBinWallDetailed:buildSparePartBinWallDetailed,drawerPartsCabinetDetailed:buildDrawerPartsCabinetDetailed,
  qcSampleCabinetDetailed:buildQCSampleCabinetDetailed,qcInstrumentSideTableDetailed:buildQCInstrumentSideTableDetailed,prepressPlateRackAFrame:buildPrepressPlateRackAFrame,plateCassetteRackDetailed:buildPlateCassetteRackDetailed,
  breakroomCabinetRunDetailed:buildBreakroomCabinetRunDetailed,commercialRefrigeratorDetailed:buildCommercialRefrigeratorDetailed,microwaveShelfTowerDetailed:buildMicrowaveShelfTowerDetailed,
  commercialToiletDetailed:buildCommercialToiletDetailed,restroomCubicleDetailed:buildRestroomCubicleDetailed,restroomVanityDetailed:buildRestroomVanityDetailed,restroomAccessoryBankDetailed:buildRestroomAccessoryBankDetailed,
  electricalInsulatingMatRun:buildElectricalInsulatingMatRun,electricalDocumentStationDetailed:buildElectricalDocumentStationDetailed,
  industrialPackingStationDetailed:buildIndustrialPackingStationDetailed,dockBumperDetailed:buildDockBumperDetailed,dockWheelChockStationDetailed:buildDockWheelChockStationDetailed,dockGuardRailDetailed:buildDockGuardRailDetailed,
  selectivePalletRackBayDetailed:buildSelectivePalletRackBayDetailed,wrappedPaperboardPalletDetailed:buildWrappedPaperboardPalletDetailed,wheeledWasteBinDetailed:buildWheeledWasteBinDetailed,materialHandlingBarrierDetailed:buildMaterialHandlingBarrierDetailed,
  lineSideSupportStationDetailed:buildLineSideSupportStationDetailed,columnImpactGuardDetailed:buildColumnImpactGuardDetailed,weatherproofOutdoorBinDetailed:buildWeatherproofOutdoorBinDetailed,
});

export function buildFurnitureAssetV2(kind,opts={}) {
  if (BUILDER_CATALOG_V2[kind]) return BUILDER_CATALOG_V2[kind](opts);
  return V1.buildFurnitureAsset(kind,opts);
}

export function enforceFurnitureQualityMetadata(root) {
  let meshes=0,groups=0,missingSemantic=0,referenceMarked=0;
  root.traverse(o=>{if(o.isMesh)meshes++;if(o.isGroup)groups++;if(!o.userData?.semantic)missingSemantic++;if(/REFERENCE|NOT_AS_BUILT/.test(String(o.userData?.accuracy||'')))referenceMarked++;});
  return {version:FURNITURE_REALISM_VERSION_V2,meshes,groups,missingSemantic,referenceMarked,pass:missingSemantic===0};
}

export function assemblyGroundingAuditV2(root,floorY=0,tolerance=.015) {
  const problems=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isGroup||o===root)return;const sem=String(o.userData?.semantic||o.name||'');if(!/(CABINET|LOCKER|CART|TROLLEY|RACK|BENCH|TABLE|BIN|SINK|STATION|PALLET|BARRIER|CUBICLE)/i.test(sem))return;const b=new T.Box3().setFromObject(o);if(Number.isFinite(b.min.y)&&Math.abs(b.min.y-floorY)>tolerance&&b.min.y>floorY+tolerance)problems.push({semantic:sem,minY:+b.min.y.toFixed(4),issue:'FLOATING_ASSEMBLY'});});return {count:problems.length,problems,pass:problems.length===0};
}

export function materialDiversityAuditV2(root) {
  const mats=new Set(),semantics=new Set();root.traverse(o=>{if(o.isMesh){if(o.material?.uuid)mats.add(o.material.uuid);if(o.userData?.semantic)semantics.add(o.userData.semantic);}});return {materialCount:mats.size,semanticMeshTypes:semantics.size,pass:mats.size>=4};
}