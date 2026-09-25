import {buildRoofSteelSystemV3,BMJ_ROOF_SECTIONS_REFERENCE_V3} from './roof-steel-system-v3.js';
import {bBox,beamBetween,buildingGroup} from '../common/building-primitives-v3.js';
export const ROOF_STEEL_VERSION_V4='RSSYS-V4-2026-09-25';
export {BMJ_ROOF_SECTIONS_REFERENCE_V3};
export function buildRoofSteelSystemV4(opts={}){
 const sections=opts.sections||BMJ_ROOF_SECTIONS_REFERENCE_V3,eavesHeight=opts.eavesHeight??4.5,ridgeHeight=opts.ridgeHeight??7;
 const root=buildRoofSteelSystemV3({...opts,sections,eavesHeight,ridgeHeight});root.name='BMJ_ROOF_STEEL_V4';root.userData.version=ROOF_STEEL_VERSION_V4;
 const details=buildingGroup('ROOF_EDGE_DETAILS_V4','ROOF_EDGE_DETAILS',{version:ROOF_STEEL_VERSION_V4,structuralStatus:'VISUAL_REFERENCE_NOT_ENGINEERING_MODEL'});root.add(details);
 for(const s of sections){
  const x0=s.x??0,z0=s.z??0,half=s.width/2,front=z0-s.depth/2,back=z0+s.depth/2;
  beamBetween(details,[x0,eavesHeight,z0-s.depth/2],[x0,ridgeHeight,z0-s.depth/2],.026,'galvanized','GABLE_RIDGE_FLASHING_REFERENCE',{roofId:s.id,lodMin:2});
  beamBetween(details,[x0,eavesHeight,z0+s.depth/2],[x0,ridgeHeight,z0+s.depth/2],.026,'galvanized','GABLE_RIDGE_FLASHING_REFERENCE',{roofId:s.id,lodMin:2});
  beamBetween(details,[x0-half,eavesHeight+.02,front],[x0+half,eavesHeight+.02,front],.022,'galvanized','GABLE_EAVE_FLASHING_REFERENCE',{roofId:s.id,lodMin:2});
  beamBetween(details,[x0-half,eavesHeight+.02,back],[x0+half,eavesHeight+.02,back],.022,'galvanized','GABLE_EAVE_FLASHING_REFERENCE',{roofId:s.id,lodMin:2});
  for(const zz of [front+.8,back-.8]){bBox(details,.34,.34,.34,'galvanized','ROOF_DRAIN_LEAF_GUARD_REFERENCE',[x0-half,eavesHeight-.12,zz],0,{roofId:s.id,lodMin:3,installed:'UNVERIFIED'});bBox(details,.34,.34,.34,'galvanized','ROOF_DRAIN_LEAF_GUARD_REFERENCE',[x0+half,eavesHeight-.12,zz],0,{roofId:s.id,lodMin:3,installed:'UNVERIFIED'});}
 }
 return root;
}