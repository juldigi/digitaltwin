import {auditSimulationStageDiversity} from './audit-simulation-stages.mjs';
import {readableSimulationStage} from '../frontend/src/display-language.js';

const ENGLISH_CUE=/\b(?:prepare|close|advance|hold|return|release|repeat|continuous|automatic|servo|positioning|illumination|camera\s+capture|inspection|collection|delivery\s+accepted|load|clamp|lift\s+to|turn\s+pile|air\s+separation|stabilize|lower\s+and\s+release|unwind|web\s+tension|sheet-length|material\s+separation|take-away|slow-speed|stack\s+entry|pile\s+separation|feed-table|registered\s+gripper|cutting\s+pressure|stripping\s+action|blanking|blank\s+separation|compression\s+dwell|glue\s+application|final\s+fold|ejection)\b/i;

export function auditSimulationStageLanguage(){
 const base=auditSimulationStageDiversity(),rows=[],issues=[];
 for(const machine of base.machines){
  if(machine.blocked)continue;
  for(const stage of machine.stages||[]){
   const shown=readableSimulationStage(stage),same=shown===stage;
   const internalToken=same&&(/[_]{2,}|^[A-Z0-9_]+$/.test(stage)||/\b(?:UNKNOWN|UNVERIFIED|REFERENCE_ONLY|PROCESS_MODEL)\b/.test(stage));
   const untranslatedEnglish=same&&ENGLISH_CUE.test(stage);
   const row={machineId:machine.machineId,name:machine.name,stage,shown,internalToken,untranslatedEnglish};
   rows.push(row);
   if(internalToken||untranslatedEnglish)issues.push(row);
  }
 }
 return {machines:base.runnable,stages:rows.length,issues,issueCount:issues.length};
}
