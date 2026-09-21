export const OFFSET9_MODULE_SEQUENCE=Object.freeze([
 ...Array.from({length:4},(_,i)=>Object.freeze({key:`PU${i+1}`,type:'print',label:`Printing Unit ${i+1}`})),
 Object.freeze({key:'L',type:'coat',label:'Inline Coating Unit'})
]);

export const OFFSET9_CENTERS=Object.freeze({PU1:-1.92,PU2:-.78,PU3:.36,PU4:1.50,L:2.70});

export const OFFSET9_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0006',model:'Speedmaster SX 52-4+L',serial:'GS001804',year:2024,sap:'OFS-9',
 maxSheet:[.370,.520],minSheet:[.105,.145],maxPrint:[.360,.520],stockStandard:[.00003,.00040],stockOptionMax:.00060,
 maxSpeed:15000,gripperMargin:[.008,.010],plate:[.459,.525],plateThickness:[.00010,.00015],blanket:[.460,.536],blanketThickness:.00195,
 feederPile:.915,standardDeliveryPile:.535,highPileDelivery:.695,printingUnits:4,coatingUnits:1,configuration:'4 PU + L',
 referenceEnvelope5L:[7.67,2.04,1.62],
 dimensionalBoundary:'Official overall envelope is published for a sample SX 52-5+L high-pile configuration. The BMJ 4+L overall length is therefore modeled proportionally and is not asserted as an as-built measurement.'
});
