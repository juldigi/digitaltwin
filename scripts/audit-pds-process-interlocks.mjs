import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const TARGETS=Object.freeze([
 {machineId:'BMJ-MCH-0021',family:'blanker'},
 {machineId:'BMJ-MCH-0025',family:'ctp'},
 {machineId:'BMJ-MCH-0026',family:'ctp'},
 {machineId:'BMJ-MCH-0027',family:'ctf'},
 {machineId:'BMJ-MCH-0028',family:'zund'}
]);

export function auditPdsProcessInterlocks(){
 const rows=[],violations=[];
 for(const target of TARGETS){
  let template,simulation;
  const observed=new Set();
  try{
   template=createPolishedMachineTemplate(target.machineId);
   simulation=createMachineSimulation(target.machineId,template.root,template);
   const initial=simulation.start();
   if(initial?.blocked){violations.push({...target,code:'UNEXPECTED_BLOCKED'});continue;}
   for(let frame=0;frame<=1800;frame++){
    simulation.update(frame*1000/60);
    if(frame%5)continue;
    const s=simulation.state?.()||{};
    if(target.family==='blanker'){
     if(s.blankingHeadPressing){
      observed.add('pressing');
      if(s.platformIndexing)violations.push({...target,code:'PRESS_WHILE_INDEXING',frame});
      if(!s.blankerPlatformAtPress)violations.push({...target,code:'PRESS_WITHOUT_PLATFORM_AT_PRESS',frame});
      if(!s.blankerHydraulicPressureActive)violations.push({...target,code:'PRESS_WITHOUT_HYDRAULIC_PRESSURE',frame});
      if(!s.blankerHydraulicPumpActive)violations.push({...target,code:'PRESS_WITHOUT_HYDRAULIC_PUMP',frame});
      if(!s.blankerHydraulicValvePressActive)violations.push({...target,code:'PRESS_WITHOUT_PRESS_VALVE',frame});
      if(!s.mechanicalInterlockSafe)violations.push({...target,code:'PRESS_INTERLOCK_UNSAFE',frame});
     }
     if(s.blankerSeparationActive){
      observed.add('separation');
      if(!s.blankerPlatformAtPress)violations.push({...target,code:'SEPARATION_WITHOUT_PLATFORM_AT_PRESS',frame});
      if(!s.blankerHydraulicPumpActive)violations.push({...target,code:'SEPARATION_WITHOUT_HYDRAULIC_PUMP',frame});
      if(!s.blankerHydraulicValveReturnActive)violations.push({...target,code:'SEPARATION_WITHOUT_RETURN_VALVE',frame});
     }
    }else if(target.family==='ctp'){
     if(s.ctpExposureActive){
      observed.add('exposure');
      for(const [field,code] of [
       ['ctpExposurePermit','CTP_EXPOSURE_WITHOUT_PERMIT'],
       ['ctpPlatePresent','CTP_EXPOSURE_WITHOUT_PLATE'],
       ['ctpRegisterConfirmed','CTP_EXPOSURE_WITHOUT_REGISTER'],
       ['ctpClampConfirmed','CTP_EXPOSURE_WITHOUT_CLAMP'],
       ['ctpDrumEncoderSync','CTP_EXPOSURE_WITHOUT_ENCODER_SYNC'],
       ['ctpInterlockSafe','CTP_EXPOSURE_INTERLOCK_UNSAFE'],
       ['ctpLaserTraverseActive','CTP_EXPOSURE_WITHOUT_LASER_TRAVERSE']
      ])if(!s[field])violations.push({...target,code,frame});
     }
     if(s.ctpUnloadPermit){
      observed.add('unload');
      if(s.ctpClampConfirmed)violations.push({...target,code:'CTP_UNLOAD_WHILE_CLAMPED',frame});
     }
    }else if(target.family==='ctf'){
     if(s.exposureActive){
      observed.add('exposure');
      for(const [field,code] of [
       ['imagesetterExposurePermit','CTF_EXPOSURE_WITHOUT_PERMIT'],
       ['imagesetterMediaPresent','CTF_EXPOSURE_WITHOUT_MEDIA'],
       ['imagesetterTensionValid','CTF_EXPOSURE_WITHOUT_TENSION'],
       ['imagesetterCapstanEncoderActive','CTF_EXPOSURE_WITHOUT_ENCODER'],
       ['imagesetterPolygonAtSpeed','CTF_EXPOSURE_WITHOUT_POLYGON_SPEED'],
       ['imagesetterInterlockSafe','CTF_EXPOSURE_INTERLOCK_UNSAFE']
      ])if(!s[field])violations.push({...target,code,frame});
     }
     if(s.cuttingActive){
      observed.add('cutting');
      for(const [field,code] of [
       ['imagesetterCutterPermit','CTF_CUT_WITHOUT_PERMIT'],
       ['imagesetterExposureComplete','CTF_CUT_BEFORE_EXPOSURE_COMPLETE'],
       ['imagesetterMediaPresent','CTF_CUT_WITHOUT_MEDIA'],
       ['imagesetterInterlockSafe','CTF_CUT_INTERLOCK_UNSAFE']
      ])if(!s[field])violations.push({...target,code,frame});
     }
    }else if(target.family==='zund'){
     if(s.vacuumHoldActive)observed.add('vacuum');
     if(s.zundAxisMotionActive)observed.add('axis');
     if(s.zundToolActionActive){
      observed.add('tool');
      if(!s.installedToolPackageVerified)violations.push({...target,code:'ZUND_TOOL_ACTION_WITHOUT_VERIFIED_TOOL_PACKAGE',frame});
      if(!s.zundAxisMotionActive)violations.push({...target,code:'ZUND_TOOL_ACTION_WITHOUT_AXIS_MOTION',frame});
     }
     if(s.zundVacuumContactActive!==s.vacuumHoldActive)violations.push({...target,code:'ZUND_VACUUM_CONTACT_STATE_MISMATCH',frame});
     if(s.zundVacuumControlActive!==s.vacuumHoldActive)violations.push({...target,code:'ZUND_VACUUM_CONTROL_STATE_MISMATCH',frame});
     const expectedMode=s.vacuumHoldActive?'HOLD':'RELEASE';
     if(s.zundVacuumMode!==expectedMode)violations.push({...target,code:'ZUND_VACUUM_MODE_MISMATCH',frame,actual:s.zundVacuumMode,expected:expectedMode});
     if(!s.installedToolPackageVerified&&s.zundToolActionActive)violations.push({...target,code:'ZUND_UNVERIFIED_TOOL_ANIMATED',frame});
    }
    if((s.completed??0)>0&&frame>300)break;
   }
  }catch(error){
   violations.push({...target,code:'EXCEPTION',error:String(error?.stack||error)});
  }finally{simulation?.dispose?.();template?.dispose?.();}
  rows.push({...target,observed:[...observed]});
 }
 return {targets:TARGETS.length,rows,violations,violationCount:violations.length};
}
