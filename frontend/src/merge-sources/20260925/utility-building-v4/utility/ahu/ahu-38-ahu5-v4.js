import { buildAhu38Ahu5V3,updateAhu38Ahu5V3 } from './ahu-38-ahu5-v3.js';
import {flexibleConnector,flangePair,drainTrap,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const H38_V4_DETAIL_VERSION='H38-DETAIL-V4-2026-09-25';
export function buildAhu38Ahu5V4(){
 const root=buildAhu38Ahu5V3();root.name='H38_V4';root.userData.detailVersion=H38_V4_DETAIL_VERSION;
 flexibleConnector(root,[-2.22,1.12,-.02],[-2.4400000000000004,1.12,-.02],{r:.10,semantic:'H38_INLET_FLEX_CONNECTOR'});
 flangePair(root,[2.12,1.12,.04],[2.4000000000000004,1.12,.04],{r:.085,pipeR:.032,semantic:'H38_SUPPLY_FLANGED_CONNECTION'});
 drainTrap(root,[.08,.02,-.72],{semantic:'H38_COIL_CONDENSATE_P_TRAP'});
 cableTray(root,[-1.9700000000000002,1.82,-.74],[1.9400000000000002,1.82,-.74],{w:.17,semantic:'H38_LOCAL_CONTROL_CABLE_TRAY'});
 serviceLabel(root,'H38',[0,1.90,-.94],{semantic:'H38_SERVICE_ID_PLATE'});
 return root;
}
export function updateAhu38Ahu5V4(root,dt,state={}){updateAhu38Ahu5V3(root,dt,state);root.userData.v4State={running:state.running===true,airflow:Number(state.airflow??0),coolingEnabled:state.coolingEnabled!==false};}