export const UPG_LY300_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0024',model:'UPG-LY300',oemReferenceModel:'LQ-UPG LY300',year:2025,
 envelopeM:[4.230,.720,1.700],weightKg:800,materialWidthMm:[50,250],lineSpeedMaxMMin:70,powerKw:16,
 feederMode:'Baffle type',feederMotor:'Frequency conversion',printhead:'Ricoh G5',printWidthMm:54.1,printSpeedReferenceMMin:114,
 cameraInspection:'2K line scan',resolutionsDpi:[600,800,1000,1100,1200,1600],paperPileHeightMm:200,
 positioningAccuracyMm:0.20,inkType:'LED curing UV ink',uvDryingKw:1,colour:'Black',belt:'PU black high-temperature-resistant',
 rejectMode:'Plate turning out',control:'PLC digital communication',drive:'Servo motor',
 processes:['automatic paging / sheet separation','uniform conveyor positioning','piezo UV variable-data printing','LED UV curing','camera inspection','reject separation','collection / strapping interface'],
 dimensionalBoundary:'The BMJ registry model UPG-LY300 matches the manufacturer model family LQ-UPG LY300. Core published dimensions and process devices are used. Customizable conveyor form, optional corona surface treatment, G5/G6 alternatives beyond the published UPG-LY300 table, exact collection/strapping hardware and BMJ installed printhead count remain configuration-specific.'
});
export const UPG_LY300_STATIONS=Object.freeze([
 {key:'FEED',label:'Automatic pager / feeder',x:-1.78},{key:'TRANSPORT',label:'Servo conveyor / positioning',x:-1.05},
 {key:'PRINT',label:'Ricoh G5 piezo print zone',x:-.25},{key:'UV',label:'LED UV curing',x:.48},
 {key:'CAMERA',label:'2K line-scan inspection',x:1.00},{key:'REJECT',label:'Plate-turn reject',x:1.48},
 {key:'COLLECT',label:'Collection / strapping interface',x:1.94}
]);
