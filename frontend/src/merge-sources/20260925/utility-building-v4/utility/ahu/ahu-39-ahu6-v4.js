import { buildAhu39Ahu6V3,updateAhu39Ahu6V3 } from './ahu-39-ahu6-v3.js';
import {flexibleConnector,flangePair,drainTrap,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const H39_V4_DETAIL_VERSION='H39-DETAIL-V4-2026-09-25';
export function buildAhu39Ahu6V4(){
 const root=buildAhu39Ahu6V3();root.name='H39_V4';root.userData.detailVersion=H39_V4_DETAIL_VERSION;
 flexibleConnector(root,[-2.12,1.12,-.02],[-2.3400000000000003,1.12,-.02],{r:.10,semantic:'H39_INLET_FLEX_CONNECTOR'});
 flangePair(root,[2.04,1.12,.04],[2.3200000000000003,1.12,.04],{r:.085,pipeR:.032,semantic:'H39_SUPPLY_FLANGED_CONNECTION'});
 drainTrap(root,[.08,.02,-.72],{semantic:'H39_COIL_CONDENSATE_P_TRAP'});
 cableTray(root,[-1.87,1.82,-.74],[1.86,1.82,-.74],{w:.17,semantic:'H39_LOCAL_CONTROL_CABLE_TRAY'});
 serviceLabel(root,'H39',[0,1.90,-.94],{semantic:'H39_SERVICE_ID_PLATE'});
 return root;
}
export function updateAhu39Ahu6V4(root,dt,state={}){updateAhu39Ahu6V3(root,dt,state);root.userData.v4State={running:state.running===true,airflow:Number(state.airflow??0),coolingEnabled:state.coolingEnabled!==false};}