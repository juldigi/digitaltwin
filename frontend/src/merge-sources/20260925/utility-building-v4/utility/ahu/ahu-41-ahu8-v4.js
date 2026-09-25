import { buildAhu41Ahu8V3,updateAhu41Ahu8V3 } from './ahu-41-ahu8-v3.js';
import {flexibleConnector,flangePair,drainTrap,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const H41_V4_DETAIL_VERSION='H41-DETAIL-V4-2026-09-25';
export function buildAhu41Ahu8V4(){
 const root=buildAhu41Ahu8V3();root.name='H41_V4';root.userData.detailVersion=H41_V4_DETAIL_VERSION;
 flexibleConnector(root,[-2.18,1.12,-.02],[-2.4000000000000004,1.12,-.02],{r:.10,semantic:'H41_INLET_FLEX_CONNECTOR'});
 flangePair(root,[2.08,1.12,.04],[2.3600000000000003,1.12,.04],{r:.085,pipeR:.032,semantic:'H41_SUPPLY_FLANGED_CONNECTION'});
 drainTrap(root,[.08,.02,-.72],{semantic:'H41_COIL_CONDENSATE_P_TRAP'});
 cableTray(root,[-1.9300000000000002,1.82,-.74],[1.9000000000000001,1.82,-.74],{w:.17,semantic:'H41_LOCAL_CONTROL_CABLE_TRAY'});
 serviceLabel(root,'H41',[0,1.90,-.94],{semantic:'H41_SERVICE_ID_PLATE'});
 return root;
}
export function updateAhu41Ahu8V4(root,dt,state={}){updateAhu41Ahu8V3(root,dt,state);root.userData.v4State={running:state.running===true,airflow:Number(state.airflow??0),coolingEnabled:state.coolingEnabled!==false};}