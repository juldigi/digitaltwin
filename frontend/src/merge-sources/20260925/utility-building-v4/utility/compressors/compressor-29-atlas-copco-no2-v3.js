import {group,box,cylinder,pipeBetween,servicePanel,louverBank,fanWheel,screwRotor,motor,gauge,baseFeet,portMarker,cutaway,markCutawayOnly,safeDelta,utilityMaterial} from '../common/utility-primitives-v3.js';

export const COMPRESSOR_29_SPEC=Object.freeze({
 machineId:'BMJ-MCH-0029',name:'COMPRESSOR ATLAS COPCO NO.2',brand:'ATLAS COPCO',referenceFamily:'GA/G OIL-INJECTED ROTARY SCREW',
 exactModelVerified:false,asBuilt:false,geometryStatus:'FAMILY_REFERENCE_WITH_MACHINE_SPECIFIC_VISUAL_VARIANT',
 footprint:{length:2.46,width:1.10,height:1.78},serviceSide:'FRONT_NEGATIVE_Z',airflow:'FRONT_INTAKE_TO_REAR_TOP_COOLER',
 notes:['Long-low service-side package variant','No VSD/full-feature/dryer claim','Internal component positions are maintainability-oriented family visualization, not OEM engineering CAD.']
});

export function buildCompressor29AtlasCopcoNo2V3(){
 const root=group('COMPRESSOR_29_ATLAS_COPCO_NO2','UTILITY_MACHINE',{...COMPRESSOR_29_SPEC});
 const shell=group('C29_SHELL','COMPRESSOR_ENCLOSURE');root.add(shell);
 box(shell,2.46,.12,1.10,'powderDark','BASE_SKID',[0,.06,0]);baseFeet(shell,2.32,1.0,.025,'C29_BASE_FOOT');
 box(shell,2.42,.10,1.06,'atlasYellow','TOP_PANEL',[0,1.73,0]);
 box(shell,2.42,1.58,.055,'atlasYellow','REAR_PANEL',[0,.86,.525]);
 box(shell,.055,1.58,1.00,'atlasYellow','LEFT_END_PANEL',[-1.202,.86,0]);
 box(shell,.055,1.58,1.00,'atlasYellow','RIGHT_END_PANEL',[1.202,.86,0]);
 const doorA=servicePanel(shell,1.08,1.42,.028,'atlasYellow','C29_FRONT_SERVICE_DOOR_A',[-.61,.86,-.535]);
 const doorB=servicePanel(shell,1.08,1.42,.028,'atlasYellow','C29_FRONT_SERVICE_DOOR_B',[.61,.86,-.535]);
 louverBank(shell,.78,.50,9,'powderDark','C29_INTAKE_LOUVERS',[-.74,.52,-.558]);
 louverBank(shell,.88,.36,7,'powderDark','C29_COOLER_EXHAUST',[.70,1.39,.558],Math.PI);
 box(shell,.33,.22,.035,'powderDark','C29_CONTROLLER_FACE',[.82,1.16,-.566]);
 box(shell,.20,.10,.016,'glass','C29_CONTROLLER_DISPLAY',[.82,1.18,-.587]);
 for(const x of [-1.05,-.25,.55,1.05])box(shell,.012,1.45,.018,'powderDark','C29_PANEL_SEAM',[x,.86,-.554]);

 const internals=group('C29_INTERNALS','COMPRESSOR_INTERNALS');root.add(internals);
 const intake=markCutawayOnly(group('C29_INTAKE_MODULE','AIR_INTAKE'));internals.add(intake);
 cylinder(intake,.19,.34,'filter','C29_DRY_INTAKE_FILTER',[-.86,.62,-.23],28,'x');
 const inletValve=cylinder(intake,.12,.18,'galvanized','C29_LOAD_UNLOAD_INLET_VALVE',[-.61,.62,-.23],24,'x',{configuration:'FUNCTIONAL_REFERENCE'});inletValve.userData.moving='INLET_VALVE';
 pipeBetween(intake,[-.47,.62,-.23],[-.30,.62,-.12],.052,'galvanized','C29_INTAKE_DUCT');
 const drive=markCutawayOnly(group('C29_DRIVE_MODULE','DRIVE'));internals.add(drive);motor(drive,.58,.19,'motorDark','C29_MAIN_MOTOR',[-.55,.38,.13],'x');
 pipeBetween(drive,[-.22,.38,.13],[-.08,.38,.13],.045,'stainless','C29_DRIVE_COUPLING_BOUNDARY',{driveType:'UNVERIFIED'});
 const airend=markCutawayOnly(group('C29_AIREND_MODULE','ROTARY_SCREW_AIREND'));internals.add(airend);
 box(airend,.68,.36,.40,'powderDark','C29_AIREND_HOUSING',[.25,.42,.13]);
 const rotorM=screwRotor(airend,.55,.073,5,'stainless','C29_MALE_ROTOR',[.25,.46,.06]);
 const rotorF=screwRotor(airend,.55,.066,4,'stainless','C29_FEMALE_ROTOR',[.25,.34,.20]);
 pipeBetween(airend,[.56,.42,.13],[.78,.62,.16],.045,'pipeBlue','C29_COMPRESSED_OIL_AIR_PATH');
 const separator=markCutawayOnly(group('C29_SEPARATOR_MODULE','OIL_AIR_SEPARATION'));internals.add(separator);
 cylinder(separator,.25,.72,'powderDark','C29_SEPARATOR_VESSEL',[.83,.73,.18],28,'y');
 cylinder(separator,.16,.49,'filter','C29_SEPARATOR_ELEMENT',[.83,.76,.18],28,'y');
 pipeBetween(separator,[.83,1.10,.18],[.98,1.22,.18],.036,'pipeBlue','C29_MIN_PRESSURE_PATH');
 cylinder(separator,.075,.16,'galvanized','C29_MIN_PRESSURE_VALVE',[1.02,1.22,.18],18,'x');
 gauge(separator,.052,'C29_SEPARATOR_PRESSURE_GAUGE',[.98,1.02,-.06]);
 const oil=markCutawayOnly(group('C29_OIL_CIRCUIT','OIL_CIRCUIT'));internals.add(oil);
 cylinder(oil,.075,.23,'filter','C29_OIL_FILTER',[.08,.27,-.25],18,'y');
 pipeBetween(oil,[.08,.39,-.25],[.30,.50,.02],.022,'copper','C29_OIL_SUPPLY_LINE');
 pipeBetween(oil,[.83,.40,.18],[.56,.26,-.17],.020,'copper','C29_OIL_RETURN_LINE');
 const cooling=markCutawayOnly(group('C29_COOLING_MODULE','COOLING'));internals.add(cooling);
 box(cooling,.78,.54,.08,'coilFin','C29_AFTERCOOLER_FACE',[.66,1.34,.22]);
 box(cooling,.78,.45,.06,'coilFin','C29_OIL_COOLER_FACE',[.66,.88,.22]);
 const fan=fanWheel(cooling,.25,.14,10,'galvanized','C29_COOLING_FAN',[.65,1.36,.08],'z');
 cylinder(cooling,.085,.16,'motorDark','C29_FAN_MOTOR',[.65,1.36,-.07],20,'z');
 const moisture=markCutawayOnly(group('C29_MOISTURE_MODULE','CONDENSATE_MANAGEMENT'));internals.add(moisture);
 cylinder(moisture,.10,.24,'galvanized','C29_MOISTURE_SEPARATOR',[1.00,.48,-.20],20,'y');
 pipeBetween(moisture,[1.00,.35,-.20],[1.00,.18,-.20],.015,'pvc','C29_ELECTRONIC_DRAIN_LINE');

 portMarker(root,'C29_AIR_INTAKE',[-1.24,.62,-.33],[-1,0,0]);
 portMarker(root,'C29_AIR_DISCHARGE',[1.24,1.22,.18],[1,0,0]);
 portMarker(root,'C29_CONDENSATE_DRAIN',[1.00,.10,-.20],[0,-1,0]);
 root.userData.animation={rotorM,rotorF,fan,inletValve,loaded:0,targetLoad:0,run:false};
 root.userData.cutawayPanels=[doorA,doorB];
 cutaway(root,false);return root;
}

export function updateCompressor29AtlasCopcoNo2V3(root,dt,state={}){
 const a=root?.userData?.animation;if(!a)return;const d=safeDelta(dt),run=state.running===true,target=run?Math.max(0,Math.min(1,state.load??.72)):0;a.run=run;a.targetLoad=target;a.loaded+=(target-a.loaded)*Math.min(1,d*2.4);
 const rpm=run?(38+62*a.loaded):0;a.rotorM.rotation.x+=d*rpm*.72;a.rotorF.rotation.x-=d*rpm*.91;a.fan.rotation.z+=d*(run?9+13*a.loaded:0);a.inletValve.rotation.x=.10+a.loaded*.74;
}
export function setCompressor29Cutaway(root,enabled=true){return cutaway(root,enabled);}