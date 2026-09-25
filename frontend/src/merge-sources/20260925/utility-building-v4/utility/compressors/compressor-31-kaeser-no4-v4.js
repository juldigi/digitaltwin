import { buildCompressor31KaeserNo4V3,updateCompressor31KaeserNo4V3 } from './compressor-31-kaeser-no4-v3.js';
import {vibrationIsolator,valveAssembly,flangePair,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const K31_V4_DETAIL_VERSION='K31-DETAIL-V4-2026-09-25';
export function buildCompressor31KaeserNo4V4(){
 const root=buildCompressor31KaeserNo4V3();root.name='K31_V4';root.userData.detailVersion=K31_V4_DETAIL_VERSION;root.userData.geometryStatus=root.userData.geometryStatus||'FAMILY_REFERENCE';
 vibrationIsolator(root,[-0.88, 0.04, -0.52],{semantic:'K31_VIBRATION_ISOLATOR_1'});
 vibrationIsolator(root,[0.88, 0.04, -0.52],{semantic:'K31_VIBRATION_ISOLATOR_2'});
 valveAssembly(root,[-1.05, 0.62, 0.18],{semantic:'K31_DISCHARGE_ISOLATION_VALVE_1'});
 flangePair(root,[.72,.72,.14],[1.02,.72,.14],{r:.062,pipeR:.024,semantic:'K31_DISCHARGE_FLANGED_SPOOL'});
 cableTray(root,[-.72,1.56,-.46],[.64,1.56,-.46],{w:.13,semantic:'K31_LOCAL_CABLE_TRAY'});
 serviceLabel(root,'K31',[0,1.58,-.59],{semantic:'K31_SERVICE_ID_PLATE'});
 return root;
}
export function updateCompressor31KaeserNo4V4(root,dt,state={}){updateCompressor31KaeserNo4V3(root,dt,state);root.userData.v4State={running:state.running===true,load:Number(state.load??0)};}