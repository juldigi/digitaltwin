export const OFFSET8_MODULE_SEQUENCE=[
 ...Array.from({length:8},(_,i)=>({key:'PU'+(i+1),type:'print',label:'Printing Unit '+(i+1)})),
 {key:'L1',type:'coat',label:'Coating Unit 1'},{key:'Y1',type:'dryer',label:'Dryer 1'},
 {key:'Y2',type:'dryer',label:'Dryer 2'},{key:'L2',type:'coat',label:'Coating Unit 2'}
];
export const OFFSET8_CENTERS=Object.fromEntries(OFFSET8_MODULE_SEQUENCE.map((m,i)=>[m.key,-3.55+i*1.18]));
export const OFFSET8_SPEC=Object.freeze({
 model:'Speedmaster CX 104-8+LYYL',serial:'XB001916',year:2022,sap:'OFS-8',
 maxSheet:[.720,1.040],minSheet:[.340,.480],maxPrint:[.710,1.020],
 stock:[.00003,.001],speedStandard:15000,speedOption:16500,gripperMargin:[.010,.012],
 feederPile:1.320,deliveryPile:1.295,printingUnits:8,coatingUnits:2,dryerSections:2,
 configuration:'8 PU + L + Y + Y + L',modulePitch:1.18,
 inkingRollerCountVerified:false,dampeningRollerCountVerified:false,dryerEnergyTechnologyVerified:false,deliveryGripperLoopDimensional:false,
 basis:'Official CX 104 technical limits; BMJ installed module sequence from machine registry/configuration record.'
});