import {buildingGroup,bBox,beamBetween,tagBuilding} from '../common/building-primitives-v3.js';
export const ROOF_STEEL_VERSION='RSSYS-V3-2026-09-25';
export const BMJ_ROOF_SECTIONS_REFERENCE_V3=Object.freeze([
 Object.freeze({id:'MAIN_HALL',x:51,width:90,z:-51,depth:90}),
 Object.freeze({id:'NORTH_WING',x:47.5,width:51,z:-99.5,depth:7}),
 Object.freeze({id:'WEST_WING',x:.5,width:11,z:-33,depth:44})
]);
export function buildRoofSteelSystemV3({sections=BMJ_ROOF_SECTIONS_REFERENCE_V3,eavesHeight=4.5,ridgeHeight=7.0,frameSpacing=6,purlinSpacing=1.55,showRoofPanels=true,showDaylightReferences=false}={}){
 const root=buildingGroup('BMJ_ROOF_STEEL_V3','ROOF_STEEL_SYSTEM',{version:ROOF_STEEL_VERSION,eavesHeight,ridgeHeight,heightEvidence:'USER_APPROXIMATE_MEASUREMENT',structuralStatus:'VISUAL_REFERENCE_NOT_ENGINEERING_MODEL'});
 for(const s of sections){const sec=buildingGroup('ROOF_SECTION_'+s.id,'ROOF_SECTION',{roofId:s.id,...s});root.add(sec);const half=s.width/2,rise=ridgeHeight-eavesHeight,slope=Math.atan2(rise,half),slopeLen=Math.hypot(half,rise);
  if(showRoofPanels)for(const sign of [-1,1]){const panel=bBox(sec,slopeLen,.12,s.depth,'roof','ROOF_PANEL',[sign*s.width/4,(ridgeHeight+eavesHeight)/2,0]);panel.rotation.z=-sign*slope;panel.userData.roofId=s.id;const blanket=bBox(sec,slopeLen-.10,.035,s.depth-.30,'roofInsulation','ROOF_INSULATION_BLANKET_REFERENCE',[sign*s.width/4,(ridgeHeight+eavesHeight)/2-.08,0],0,{lodMin:1});blanket.rotation.z=-sign*slope;
   if(showDaylightReferences)for(let zz=-s.depth/2+7;zz<s.depth/2-4;zz+=18){const dl=bBox(sec,slopeLen*.72,.024,1.05,'translucent','ROOF_TRANSLUCENT_DAYLIGHT_PANEL_REFERENCE',[sign*s.width/4,(ridgeHeight+eavesHeight)/2+.04,zz],0,{lodMin:2,installed:'UNVERIFIED'});dl.rotation.z=-sign*slope;}}
  // Portal frames: columns + rafters + eave haunch references.
  for(let zz=-s.depth/2+Math.min(3,frameSpacing/2);zz<s.depth/2;zz+=frameSpacing){for(const sign of [-1,1]){const x=sign*s.width/2;beamBetween(sec,[x,0,zz],[x,eavesHeight,zz],.075,'steel','PORTAL_COLUMN',{roofId:s.id});beamBetween(sec,[x,eavesHeight,zz],[0,ridgeHeight,zz],.075,'steel','PORTAL_RAFTER',{roofId:s.id});beamBetween(sec,[x,eavesHeight-.20,zz],[sign*(s.width/2-1.20),eavesHeight+.55,zz],.055,'steel','EAVE_HAUNCH_REFERENCE',{roofId:s.id,lodMin:2});}beamBetween(sec,[-s.width/2,eavesHeight,zz],[s.width/2,eavesHeight,zz],.035,'galvanized','PORTAL_EAVE_TIE_REFERENCE',{roofId:s.id,lodMin:2});}
  // Purlins parallel to building depth. Exact spacing is a visual reference.
  for(const sign of [-1,1])for(let run=0;run<=slopeLen;run+=purlinSpacing){const f=Math.min(1,run/slopeLen),x=sign*(s.width/2)*(1-f),y=eavesHeight+rise*f;beamBetween(sec,[x,y,-s.depth/2],[x,y,s.depth/2],.033,'galvanized','ROOF_PURLIN_REFERENCE',{roofId:s.id,lodMin:1});}
  // Anti-sag / fly bracing references at selected bays, kept visually sparse.
  for(let zz=-s.depth/2+frameSpacing;zz<s.depth/2-frameSpacing;zz+=frameSpacing*2){for(const sign of [-1,1]){const x1=sign*s.width*.22,x2=sign*s.width*.38,y1=ridgeHeight-rise*.44,y2=eavesHeight+rise*.22;beamBetween(sec,[x1,y1,zz-frameSpacing*.42],[x2,y2,zz+frameSpacing*.42],.018,'galvanized','ROOF_BRACING_REFERENCE',{roofId:s.id,lodMin:2});beamBetween(sec,[x1,y1,zz+frameSpacing*.42],[x2,y2,zz-frameSpacing*.42],.018,'galvanized','ROOF_BRACING_REFERENCE',{roofId:s.id,lodMin:2});}}
  // Gutters and downpipes at both eaves.
  for(const sign of [-1,1]){beamBetween(sec,[sign*s.width/2,eavesHeight-.06,-s.depth/2],[sign*s.width/2,eavesHeight-.06,s.depth/2],.045,'galvanized','ROOF_GUTTER_REFERENCE',{roofId:s.id});for(const zz of [-s.depth/2+.35,s.depth/2-.35]){beamBetween(sec,[sign*s.width/2,eavesHeight-.08,zz],[sign*s.width/2,.18,zz],.038,'galvanized','ROOF_DOWNPIPE_REFERENCE',{roofId:s.id});beamBetween(sec,[sign*s.width/2,.18,zz],[sign*(s.width/2+.24),.06,zz],.035,'galvanized','DOWNPIPE_SHOE_REFERENCE',{roofId:s.id,lodMin:1});}}
 }
 return root;
}