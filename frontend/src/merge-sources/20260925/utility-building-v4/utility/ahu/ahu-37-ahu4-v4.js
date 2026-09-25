import { buildAhu37Ahu4V3,updateAhu37Ahu4V3 } from './ahu-37-ahu4-v3.js';
import {flexibleConnector,flangePair,drainTrap,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const H37_V4_DETAIL_VERSION='H37-DETAIL-V4-2026-09-25';
export function buildAhu37Ahu4V4(){
 const root=buildAhu37Ahu4V3();root.name='H37_V4';root.userData.detailVersion=H37_V4_DETAIL_VERSION;
 flexibleConnector(root,[-2.05,1.12,-.02],[-2.27,1.12,-.02],{r:.10,semantic:'H37_INLET_FLEX_CONNECTOR'});
 flangePair(root,[1.96,1.12,.04],[2.24,1.12,.04],{r:.085,pipeR:.032,semantic:'H37_SUPPLY_FLANGED_CONNECTION'});
 drainTrap(root,[.08,.02,-.72],{semantic:'H37_COIL_CONDENSATE_P_TRAP'});
 cableTray(root,[-1.7999999999999998,1.82,-.74],[1.78,1.82,-.74],{w:.17,semantic:'H37_LOCAL_CONTROL_CABLE_TRAY'});
 serviceLabel(root,'H37',[0,1.90,-.94],{semantic:'H37_SERVICE_ID_PLATE'});
 return root;
}
export function updateAhu37Ahu4V4(root,dt,state={}){updateAhu37Ahu4V3(root,dt,state);root.userData.v4State={running:state.running===true,airflow:Number(state.airflow??0),coolingEnabled:state.coolingEnabled!==false};}