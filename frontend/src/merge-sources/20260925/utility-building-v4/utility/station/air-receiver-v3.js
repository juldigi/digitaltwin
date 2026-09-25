import {group,box,cylinder,cone,pipeBetween,gauge,portMarker,baseFeet} from '../common/utility-primitives-v3.js';
export const AIR_RECEIVER_V3_SPEC=Object.freeze({kind:'AIR_RECEIVER_REFERENCE',asBuilt:false,geometryStatus:'STATION_FUNCTIONAL_REFERENCE',notes:['Vertical receiver reference with gauge, relief-valve boundary, inlet/outlet, manual drain and support feet.','Capacity, MAWP, code stamp and nozzle sizes must come from field data before engineering use.']});
export function buildAirReceiverV3(opts={}){
 const r=opts.radius??.42,h=opts.shellHeight??1.60,root=group(opts.name||'AIR_RECEIVER_V3','AIR_RECEIVER',{...AIR_RECEIVER_V3_SPEC});
 const shellY=.28+h/2;cylinder(root,r,h,'galvanized','RECEIVER_SHELL',[0,shellY,0],36,'y');cone(root,0,r,.22,'galvanized','RECEIVER_BOTTOM_HEAD',[0,.28-.11,0],36);cone(root,r,0,.22,'galvanized','RECEIVER_TOP_HEAD',[0,.28+h+.11,0],36);
 for(const x of [-r*.52,r*.52])box(root,.12,.28,.12,'powderDark','RECEIVER_SUPPORT_FOOT',[x,.14,0]);gauge(root,.07,'RECEIVER_PRESSURE_GAUGE',[r*.62,.28+h*.76,-r*.70]);
 pipeBetween(root,[-r-.26,.28+h*.30,0],[-r,.28+h*.30,0],.035,'pipeBlue','RECEIVER_INLET');pipeBetween(root,[r,.28+h*.62,0],[r+.30,.28+h*.62,0],.035,'pipeBlue','RECEIVER_OUTLET');
 cylinder(root,.035,.12,'stainless','RELIEF_VALVE_REFERENCE',[0,.28+h+.30,0],16,'y',{setPressure:'UNVERIFIED'});pipeBetween(root,[0,.12,0],[0,.02,0],.015,'pvc','RECEIVER_MANUAL_DRAIN');
 portMarker(root,'RECEIVER_INLET_PORT',[-r-.34,.28+h*.30,0],[-1,0,0]);portMarker(root,'RECEIVER_OUTLET_PORT',[r+.38,.28+h*.62,0],[1,0,0]);portMarker(root,'RECEIVER_DRAIN_PORT',[0,.01,0],[0,-1,0]);return root;
}