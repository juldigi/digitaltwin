import { buildCompressor32KaeserNo6V3,updateCompressor32KaeserNo6V3 } from './compressor-32-kaeser-no6-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const K32_V4_DETAIL_VERSION='K32-DETAIL-V4-2026-09-25';
export function buildCompressor32KaeserNo6V4(){
 const root=buildCompressor32KaeserNo6V3();root.name='K32_V4';root.userData.detailVersion=K32_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.94, 0.04, -0.56],{semantic:'K32_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.94, 0.04, -0.56],{semantic:'K32_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[-1.12, 0.66, 0.2],{semantic:'K32_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'K32_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'K32_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'K32',[0,1.58,-.59],{semantic:'K32_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor32KaeserNo6V4(root,dt,state={}){updateCompressor32KaeserNo6V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}