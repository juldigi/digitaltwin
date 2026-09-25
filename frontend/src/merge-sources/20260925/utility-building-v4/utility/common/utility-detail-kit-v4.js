import * as T from 'three';
import {group,box,cylinder,pipeBetween,torus,bolt,utilityMaterial,tag} from './utility-primitives-v3.js';

export const UTILITY_DETAIL_KIT_VERSION='UDK-V4-2026-09-25';

export function vibrationIsolator(parent,p=[0,0,0],{r=.055,h=.05,semantic='VIBRATION_ISOLATOR'}={}){
 const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true});g.position.set(...p);parent?.add(g);
 cylinder(g,r,h,'blackRubber',semantic+'_ELASTOMER',[0,h/2,0],18,'y');
 cylinder(g,r*.58,.012,'stainless',semantic+'_TOP_PLATE',[0,h+.006,0],18,'y');
 cylinder(g,r*.58,.012,'stainless',semantic+'_BASE_PLATE',[0,.006,0],18,'y');
 bolt(g,[0,h+.018,0],semantic+'_ANCHOR');return g;
}

export function flangePair(parent,a,b,{r=.07,pipeR=.025,material='galvanized',semantic='FLANGED_CONNECTION'}={}){
 const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va),len=d.length();if(len<1e-5)return null;const u=d.clone().normalize();
 const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true});parent?.add(g);pipeBetween(g,a,b,pipeR,material,semantic+'_SPOOL');
 for(const t of [.08,.92]){const p=va.clone().addScaledVector(d,t);const disc=new T.Mesh(new T.CylinderGeometry(r,r,.018,20),utilityMaterial(material));disc.position.copy(p);disc.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),u);tag(disc,semantic+'_FLANGE',{visualReference:true});g.add(disc);}return g;
}

export function flexibleConnector(parent,a,b,{r=.07,semantic='FLEXIBLE_CONNECTOR'}={}){
 const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true});parent?.add(g);const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va),len=d.length(),u=d.clone().normalize();
 const body=new T.Mesh(new T.CylinderGeometry(r*.82,r*.82,len,20),utilityMaterial('blackRubber'));body.position.copy(va).add(vb).multiplyScalar(.5);body.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),u);tag(body,semantic+'_BODY');g.add(body);
 for(const t of [.08,.92]){const p=va.clone().addScaledVector(d,t);const ring=new T.Mesh(new T.TorusGeometry(r,.010,8,24),utilityMaterial('stainless'));ring.position.copy(p);ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),u);tag(ring,semantic+'_CLAMP');g.add(ring);}return g;
}

export function valveAssembly(parent,p=[0,0,0],{axis='x',r=.055,semantic='ISOLATION_VALVE'}={}){
 const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true});g.position.set(...p);parent?.add(g);cylinder(g,r,.12,'galvanized',semantic+'_BODY',[0,0,0],20,axis);
 cylinder(g,.015,.12,'stainless',semantic+'_STEM',[0,.09,0],12,'y');torus(g,.065,.010,'processRed',semantic+'_HANDWHEEL',[0,.155,0],[Math.PI/2,0,0]);return g;
}

export function drainTrap(parent,p=[0,0,0],{semantic='CONDENSATE_DRAIN_TRAP'}={}){
 const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true});g.position.set(...p);parent?.add(g);
 pipeBetween(g,[0,.24,0],[0,.05,0],.018,'pvc',semantic+'_DROP');pipeBetween(g,[0,.05,0],[.11,.05,0],.018,'pvc',semantic+'_LOWER');pipeBetween(g,[.11,.05,0],[.11,.15,0],.018,'pvc',semantic+'_RISE');return g;
}

export function cableTray(parent,a,b,{w=.16,h=.045,semantic='UTILITY_CABLE_TRAY'}={}){
 const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va),len=d.length();if(len<1e-5)return null;const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true,lodMin:2});parent?.add(g);
 const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(1,0,0),d.clone().normalize());for(const z of [-w/2,w/2]){const rail=box(g,len,h,.018,'galvanized',semantic+'_SIDE',[0,0,z]);rail.quaternion.copy(q);}for(let x=-len/2+.10;x<len/2;x+=.22){const rung=box(g,.018,.018,w,'galvanized',semantic+'_RUNG',[x,0,0]);rung.quaternion.copy(q);}g.position.copy(va).add(vb).multiplyScalar(.5);return g;
}

export function serviceLabel(parent,text,p=[0,0,0],{w=.28,h=.10,semantic='SERVICE_LABEL'}={}){
 const plate=box(parent,w,h,.008,'powderDark',semantic,p,0,{version:UTILITY_DETAIL_KIT_VERSION,labelText:String(text),visualReference:true,lodMin:2});return plate;
}

export function guardedFanFace(parent,p=[0,0,0],{r=.32,semantic='FAN_GUARD'}={}){
 const g=group(semantic,semantic,{version:UTILITY_DETAIL_KIT_VERSION,visualReference:true,lodMin:2});g.position.set(...p);parent?.add(g);torus(g,r,.014,'powderDark',semantic+'_RING',[0,0,0],[0,0,0]);for(let a=0;a<Math.PI;a+=Math.PI/6){const x=Math.cos(a)*r,y=Math.sin(a)*r;pipeBetween(g,[-x,-y,0],[x,y,0],.006,'powderDark',semantic+'_WIRE');}return g;
}