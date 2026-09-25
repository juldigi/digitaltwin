import { buildCompressor35AtlasCopcoNo9V3,updateCompressor35AtlasCopcoNo9V3 } from './compressor-35-atlas-copco-no9-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const A35_V4_DETAIL_VERSION='A35-DETAIL-V4-2026-09-25';
export function buildCompressor35AtlasCopcoNo9V4(){
 const root=buildCompressor35AtlasCopcoNo9V3();root.name='A35_V4';root.userData.detailVersion=A35_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.96, 0.04, -0.58],{semantic:'A35_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.96, 0.04, -0.58],{semantic:'A35_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[1.16, 0.68, 0.2],{semantic:'A35_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'A35_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'A35_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'A35',[0,1.58,-.59],{semantic:'A35_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor35AtlasCopcoNo9V4(root,dt,state={}){updateCompressor35AtlasCopcoNo9V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}