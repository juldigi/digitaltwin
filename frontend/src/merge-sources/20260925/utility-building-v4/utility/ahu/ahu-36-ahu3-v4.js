import { buildAhu36Ahu3V3,updateAhu36Ahu3V3 } from './ahu-36-ahu3-v3.js';
import {flexibleConnector,flangePair,drainTrap,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const H36_V4_DETAIL_VERSION='H36-DETAIL-V4-2026-09-25';
export function buildAhu36Ahu3V4(){
 const root=buildAhu36Ahu3V3();root.name='H36_V4';root.userData.detailVersion=H36_V4_DETAIL_VERSION;
 flexibleConnector(root,[-2.15,1.12,-.02],[-2.37,1.12,-.02],{r:.10,semantic:'H36_INLET_FLEX_CONNECTOR'});
 flangePair(root,[2.06,1.12,.04],[2.3400000000000003,1.12,.04],{r:.085,pipeR:.032,semantic:'H36_SUPPLY_FLANGED_CONNECTION'});
 drainTrap(root,[.08,.02,-.72],{semantic:'H36_COIL_CONDENSATE_P_TRAP'});
 cableTray(root,[-1.9,1.82,-.74],[1.8800000000000001,1.82,-.74],{w:.17,semantic:'H36_LOCAL_CONTROL_CABLE_TRAY'});
 serviceLabel(root,'H36',[0,1.90,-.94],{semantic:'H36_SERVICE_ID_PLATE'});
 return root;
}
export function updateAhu36Ahu3V4(root,dt,state={}){updateAhu36Ahu3V3(root,dt,state);root.userData.v4State={running:state.running===true,airflow:Number(state.airflow??0),coolingEnabled:state.coolingEnabled!==false};}