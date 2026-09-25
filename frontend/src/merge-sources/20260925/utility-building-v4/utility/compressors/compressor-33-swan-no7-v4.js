import { buildCompressor33SwanNo7V3,updateCompressor33SwanNo7V3 } from './compressor-33-swan-no7-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const S33_V4_DETAIL_VERSION='S33-DETAIL-V4-2026-09-25';
export function buildCompressor33SwanNo7V4(){
 const root=buildCompressor33SwanNo7V3();root.name='S33_V4';root.userData.detailVersion=S33_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.78, 0.04, -0.46],{semantic:'S33_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.78, 0.04, -0.46],{semantic:'S33_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[0.98, 0.56, 0.18],{semantic:'S33_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'S33_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'S33_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'S33',[0,1.58,-.59],{semantic:'S33_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor33SwanNo7V4(root,dt,state={}){updateCompressor33SwanNo7V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}