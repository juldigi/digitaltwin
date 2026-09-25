import { buildAhu40SansinAhu7V3,updateAhu40SansinAhu7V3 } from './ahu-40-sansin-ahu7-v3.js';
import {flexibleConnector,flangePair,drainTrap,cableTray,serviceLabel} from '../common/utility-detail-kit-v4.js';
export const S40_V4_DETAIL_VERSION='S40-DETAIL-V4-2026-09-25';
export function buildAhu40SansinAhu7V4(){
 const root=buildAhu40SansinAhu7V3();root.name='S40_V4';root.userData.detailVersion=S40_V4_DETAIL_VERSION;
 flexibleConnector(root,[-2.58,1.12,-.02],[-2.8000000000000003,1.12,-.02],{r:.10,semantic:'S40_INLET_FLEX_CONNECTOR'});
 flangePair(root,[2.48,1.12,.04],[2.7600000000000002,1.12,.04],{r:.085,pipeR:.032,semantic:'S40_SUPPLY_FLANGED_CONNECTION'});
 drainTrap(root,[.08,.02,-.72],{semantic:'S40_COIL_CONDENSATE_P_TRAP'});
 cableTray(root,[-2.33,1.82,-.74],[2.3000000000000003,1.82,-.74],{w:.17,semantic:'S40_LOCAL_CONTROL_CABLE_TRAY'});
 serviceLabel(root,'S40',[0,1.90,-.94],{semantic:'S40_SERVICE_ID_PLATE'});
 return root;
}
export function updateAhu40SansinAhu7V4(root,dt,state={}){updateAhu40SansinAhu7V3(root,dt,state);root.userData.v4State={running:state.running===true,airflow:Number(state.airflow??0),coolingEnabled:state.coolingEnabled!==false};}