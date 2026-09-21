import {OffsetMachineTemplate} from './offset5.js';
import {PrintingSimulation} from './simulation.js';
import {Offset10MachineTemplate} from './offset10.js';
import {Offset10PrintingSimulation} from './simulation-offset10.js';
import {APM2MachineTemplate} from './apm2.js';
import {APM2ProcessSimulation} from './simulation-apm2.js';
import {SheetingMachineTemplate} from './sheeting.js';
import {SheetingProcessSimulation} from './simulation-sheeting.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig} from './universal-machine.js';
import {Polar115MachineTemplate} from './polar115.js';
import {Polar115ProcessSimulation} from './simulation-polar115.js';
import {Offset8MachineTemplate} from './offset8.js';
import {Offset8PrintingSimulation} from './simulation-offset8.js';
import {Offset9MachineTemplate} from './offset9.js';
import {Offset9PrintingSimulation} from './simulation-offset9.js';
import {MK920MachineTemplate} from './mk920.js';
import {MK920StampingSimulation} from './simulation-mk920.js';
import {MK1060MachineTemplate} from './mk1060.js';
import {MK1060ProcessSimulation} from './simulation-mk1060.js';
import {Promatrix106MachineTemplate} from './promatrix106.js';
import {Promatrix106ProcessSimulation} from './simulation-promatrix106.js';
import {Media100MachineTemplate} from './media100.js';
import {Media100ProcessSimulation} from './simulation-media100.js';
import {DianaEye55MachineTemplate} from './diana-eye55.js';
import {DianaEye55ProcessSimulation} from './simulation-diana-eye55.js';
import {SharkN650MachineTemplate} from './shark-n650.js';
import {SharkN650ProcessSimulation} from './simulation-shark-n650.js';
import {FZ1200MachineTemplate} from './fz1200.js';
import {FZ1200ProcessSimulation} from './simulation-fz1200.js';
import {UpgLy300MachineTemplate} from './upg-ly300.js';
import {UpgLy300ProcessSimulation} from './simulation-upg-ly300.js';

export const LEGACY_MACHINE_ROUTE=Object.freeze({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
});
export const normalizeMachineKey=key=>LEGACY_MACHINE_ROUTE[key]||key||'offset5';

export const DEDICATED_MACHINE_KEYS=Object.freeze([
 'offset5','sheeting','offset10','apm2',
 'BMJ-MCH-0001','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008',
 'BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015',
 'BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024'
]);
const DEDICATED_SET=new Set(DEDICATED_MACHINE_KEYS);
export const isDedicatedMachineKey=key=>DEDICATED_SET.has(normalizeMachineKey(key));

export function createMachineTemplate(key){
 const k=normalizeMachineKey(key);
 if(k==='offset5')return new OffsetMachineTemplate();
 if(k==='sheeting')return new SheetingMachineTemplate();
 if(k==='offset10')return new Offset10MachineTemplate();
 if(k==='apm2')return new APM2MachineTemplate();
 if(k==='BMJ-MCH-0001')return new Polar115MachineTemplate();
 if(k==='BMJ-MCH-0005')return new Offset8MachineTemplate();
 if(k==='BMJ-MCH-0006')return new Offset9MachineTemplate();
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(k))return new FZ1200MachineTemplate(k);
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(k))return new MK920MachineTemplate(k);
 if(k==='BMJ-MCH-0013')return new MK1060MachineTemplate();
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(k))return new Promatrix106MachineTemplate(k);
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k))return new Media100MachineTemplate(k);
 if(k==='BMJ-MCH-0019')return new DianaEye55MachineTemplate();
 if(k==='BMJ-MCH-0020')return new SharkN650MachineTemplate();
 if(k==='BMJ-MCH-0024')return new UpgLy300MachineTemplate();
 if(universalMachineConfig(k))return new UniversalMachineTemplate(k);
 return new OffsetMachineTemplate();
}

export function createMachineSimulation(key,machine,template){
 const k=normalizeMachineKey(key);
 if(k==='offset5')return new PrintingSimulation(machine,template);
 if(k==='sheeting')return new SheetingProcessSimulation(machine,template);
 if(k==='offset10')return new Offset10PrintingSimulation(machine,template);
 if(k==='apm2')return new APM2ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0001')return new Polar115ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0005')return new Offset8PrintingSimulation(machine,template);
 if(k==='BMJ-MCH-0006')return new Offset9PrintingSimulation(machine,template);
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(k))return new FZ1200ProcessSimulation(machine,template);
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(k))return new MK920StampingSimulation(machine,template);
 if(k==='BMJ-MCH-0013')return new MK1060ProcessSimulation(machine,template);
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(k))return new Promatrix106ProcessSimulation(machine,template);
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k))return new Media100ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0019')return new DianaEye55ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0020')return new SharkN650ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0024')return new UpgLy300ProcessSimulation(machine,template);
 if(universalMachineConfig(k))return new UniversalProcessSimulation(machine,template);
 return new PrintingSimulation(machine,template);
}
