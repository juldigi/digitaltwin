import {ACTUAL_PLANT_GZIP} from './plant-actual-data.js';
import {MACHINE_REGISTRY} from './machine-registry.js';
export const BASELINE_ID='BMJ-250804-RED-20260921';
const known={
 'BMJ-MCH-0001':[94.19,59.45,90,'POLAR 115','ANNOTATION'],
 'BMJ-MCH-0002':[86.51,60.32,90,'SHEETING','ANNOTATION'],
 'BMJ-MCH-0003':[53.851,90.976,180,'OFFSET 5','DXF_FOOTPRINT'],
 'BMJ-MCH-0004':[66.262,69.685,180,'OFFSET 7','DXF_FOOTPRINT'],
 'BMJ-MCH-0005':[49.275,34.477,180,'OFFSET 8','DXF_FOOTPRINT'],
 'BMJ-MCH-0006':[49.750,73.185,180,'OFFSET 9','DXF_ZONE'],
 'BMJ-MCH-0007':[22.119,88.959,0,'PILE TURNER 1','DXF_LABEL'],
 'BMJ-MCH-0008':[75.986,41.595,0,'PILE TURNER 3','DXF_LABEL'],
 'BMJ-MCH-0009':[48.91,61.01,180,'OFFSET 10','ANNOTATION'],
 'BMJ-MCH-0010':[17.54,59.8,90,'APM 2','DXF_ZONE'],
 'BMJ-MCH-0011':[14.774,75.758,90,'APM 5','DXF_FOOTPRINT'],
 'BMJ-MCH-0012':[21.73,75.758,90,'APM 6','DXF_FOOTPRINT'],
 'BMJ-MCH-0013':[21.73,43.653,90,'APM 7','DXF_FOOTPRINT'],
 'BMJ-MCH-0014':[9.411,77.436,90,'APM 8','DXF_FOOTPRINT'],
 'BMJ-MCH-0015':[10.037,41.887,90,'APM 9','DXF_FOOTPRINT'],
 'BMJ-MCH-0016':[12.835,21,90,'FOLDER GLUER 1','DXF_ZONE'],
 'BMJ-MCH-0017':[21.37,21,90,'FOLDER GLUER 2','DXF_ZONE'],
 'BMJ-MCH-0018':[17.172,21,90,'FOLDER GLUER 3','DXF_ZONE'],
 'BMJ-MCH-0019':[29.45,38.11,90,'IPM 3','ANNOTATION'],
 'BMJ-MCH-0020':[33.19,37.53,90,'IPM 4','ANNOTATION'],
 'BMJ-MCH-0022':[77.99,82.24,0,'PILE TURNER 2','DXF_LABEL'],
 'BMJ-MCH-0027':[3.7,39.5,0,'CTF SCREEN','DXF_ROOM']
};
export const MACHINE_PLACEMENTS=Object.freeze(MACHINE_REGISTRY.map(m=>{
 const p=known[m.machineId];return Object.freeze({machineId:m.machineId,label:p?.[3]||m.name,x:p?.[0]??null,y:p?.[1]??null,rotation:p?.[2]??0,status:p?.[4]||'UNIDENTIFIED',flowStatus:'AXIS_CONFIRMED_DIRECTION_UNVERIFIED',scale:1});
}));
export async function decodePlantData(value){const raw=Uint8Array.from(atob(value),c=>c.charCodeAt(0));return JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}
let cache;
export async function loadActualPlantLayout(){
 if(cache)return cache;const data=await decodePlantData(ACTUAL_PLANT_GZIP),s=data.source;
 cache={baselineId:BASELINE_ID,actual:data,placements:MACHINE_PLACEMENTS,source:{...s,derivedFile:s.file,unitStatus:'GRID_CALIBRATED',unitResolution:'600 DXF units = 6000 mm; 0.01 metre/source unit'},bounds:data.bounds,
 transform:{originX:s.originX,originY:s.originY,scale:.01,rotation:0,sourceUnits:'drawing-unit'},
 displayTransform:{originX:0,originY:0,scale:1,rotation:0,flipY:true},
 utilityRoutingStatus:'TEMPLATE_ONLY',utilityRoutingOverrides:{},
 referenceBatches:[{layer:'250804',semantic:'CAD_REFERENCE',points:data.segments.flat()}],
 identifiedLabels:data.labels.map(l=>({...l,layer:'0'})),assetCandidates:MACHINE_PLACEMENTS.filter(p=>p.status!=='UNIDENTIFIED'),areaCandidates:data.labels.filter(l=>/room|r\.|workshop|toilet|mushola|dock|rms|fps|sparepart/i.test(l.text)).map(l=>({...l,label:l.text})),
 audit:{unitFinding:'Skala grid 600 unit = 6 m.',sourceFinding:'DXF 250804 + revisi posisi pengguna; elevasi dan lanskap perkiraan visual.'},positionStatus:'BASELINE REVISI PENGGUNA',extractionRevision:124};
 return cache;
}
// A selected baseline cannot be displaced by cached coordinates from another drawing.
export function selectPlantLayout(saved,bundled){return bundled?.baselineId===BASELINE_ID?bundled:(saved||bundled);}
