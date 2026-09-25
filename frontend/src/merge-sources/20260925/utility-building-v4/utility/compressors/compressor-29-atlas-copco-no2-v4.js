import { buildCompressor29AtlasCopcoNo2V3,updateCompressor29AtlasCopcoNo2V3 } from './compressor-29-atlas-copco-no2-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const A29_V4_DETAIL_VERSION='A29-DETAIL-V4-2026-09-25';
export function buildCompressor29AtlasCopcoNo2V4(){
 const root=buildCompressor29AtlasCopcoNo2V3();root.name='A29_V4';root.userData.detailVersion=A29_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.92, 0.04, -0.55],{semantic:'A29_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.92, 0.04, -0.55],{semantic:'A29_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[1.14, 0.64, 0.18],{semantic:'A29_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'A29_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'A29_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'A29',[0,1.58,-.59],{semantic:'A29_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor29AtlasCopcoNo2V4(root,dt,state={}){updateCompressor29AtlasCopcoNo2V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}