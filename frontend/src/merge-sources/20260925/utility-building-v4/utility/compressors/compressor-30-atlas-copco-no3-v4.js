import { buildCompressor30AtlasCopcoNo3V3,updateCompressor30AtlasCopcoNo3V3 } from './compressor-30-atlas-copco-no3-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const A30_V4_DETAIL_VERSION='A30-DETAIL-V4-2026-09-25';
export function buildCompressor30AtlasCopcoNo3V4(){
 const root=buildCompressor30AtlasCopcoNo3V3();root.name='A30_V4';root.userData.detailVersion=A30_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.86, 0.04, -0.5],{semantic:'A30_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.86, 0.04, -0.5],{semantic:'A30_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[1.08, 0.58, 0.16],{semantic:'A30_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'A30_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'A30_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'A30',[0,1.58,-.59],{semantic:'A30_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor30AtlasCopcoNo3V4(root,dt,state={}){updateCompressor30AtlasCopcoNo3V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}