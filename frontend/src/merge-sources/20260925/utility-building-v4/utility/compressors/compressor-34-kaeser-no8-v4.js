import { buildCompressor34KaeserNo8V3,updateCompressor34KaeserNo8V3 } from './compressor-34-kaeser-no8-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const K34_V4_DETAIL_VERSION='K34-DETAIL-V4-2026-09-25';
export function buildCompressor34KaeserNo8V4(){
 const root=buildCompressor34KaeserNo8V3();root.name='K34_V4';root.userData.detailVersion=K34_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.9, 0.04, -0.54],{semantic:'K34_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.9, 0.04, -0.54],{semantic:'K34_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[-1.08, 0.63, 0.18],{semantic:'K34_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'K34_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'K34_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'K34',[0,1.58,-.59],{semantic:'K34_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor34KaeserNo8V4(root,dt,state={}){updateCompressor34KaeserNo8V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}