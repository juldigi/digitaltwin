import {OFFSET5_TAXONOMY} from './taxonomy-offset5.js';
import {PHOTO_REGISTRY as OFFSET5_PHOTOS,TECHNICAL_SOURCES as OFFSET5_SOURCES} from './sources-offset5.js';
import {OFFSET10_TAXONOMY} from './taxonomy-offset10.js';
import {OFFSET10_PHOTO_REGISTRY,OFFSET10_TECHNICAL_SOURCES} from './sources-offset10.js';
import {APM2_TAXONOMY} from './taxonomy-apm2.js';
import {APM2_PHOTO_REGISTRY,APM2_TECHNICAL_SOURCES} from './sources-apm2.js';
import {SHEETING_TAXONOMY} from './taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES} from './sources-sheeting.js';
import {POLAR115_PHOTO_REGISTRY} from './sources-polar115.js';
import {normalizePhotoRegistry} from './photo-evidence.js';
import {universalTaxonomy,universalTechnicalSources} from '../universal-machine.js';

const dbSource=machine=>Object.freeze({
 id:'BMJ-MACHINE-DATABASE',
 title:'Database Mesin Packaging Offset BMJ',
 publisher:'PT Bukit Muria Jaya',
 type:'USER_PROVIDED',
 confidence:'VERIFIED',
 supports:[machine?.name,machine?.model,machine?.serial,machine?.sapCode,machine?.functionalLocation].filter(Boolean)
});

function boundedSources(machine){
 const technical=universalTechnicalSources(machine.machineId);
 const hasBmj=technical.some(source=>source?.publisher==='PT Bukit Muria Jaya'||/\bBMJ\b/i.test(String(source?.title||'')));
 return hasBmj?technical:[dbSource(machine),...technical];
}

export function searchCorpusForMachine(machine,route=machine?.machineId){
 if(!machine?.machineId)return Object.freeze({taxonomy:Object.freeze([]),sources:Object.freeze([]),photos:Object.freeze([])});
 let taxonomy=[],sources=[],photos=[];
 if(route==='offset5'){taxonomy=OFFSET5_TAXONOMY;sources=OFFSET5_SOURCES;photos=OFFSET5_PHOTOS;}
 else if(route==='offset10'){taxonomy=OFFSET10_TAXONOMY;sources=OFFSET10_TECHNICAL_SOURCES;photos=OFFSET10_PHOTO_REGISTRY;}
 else if(route==='apm2'){taxonomy=APM2_TAXONOMY;sources=APM2_TECHNICAL_SOURCES;photos=APM2_PHOTO_REGISTRY;}
 else if(route==='sheeting'){taxonomy=SHEETING_TAXONOMY;sources=SHEETING_TECHNICAL_SOURCES;photos=SHEETING_PHOTO_REGISTRY;}
 else{
  taxonomy=universalTaxonomy(machine.machineId);
  sources=boundedSources(machine);
  if(machine.machineId==='BMJ-MCH-0001')photos=POLAR115_PHOTO_REGISTRY;
 }
 return Object.freeze({
  taxonomy:Object.freeze([...taxonomy]),
  sources:Object.freeze([...sources]),
  photos:normalizePhotoRegistry(photos)
 });
}
