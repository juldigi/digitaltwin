import {CONFIDENCE} from './confidence.js';

export const ORIENTATION=Object.freeze({
  coordinateSystem:{x:'+X · arah aliran material',y:'+Y · vertikal',z:'+Z · sisi drive'},
  feedDirection:'FEEDER_TO_DELIVERY_POSITIVE_X',operatorSide:'NEGATIVE_Z',driveSide:'POSITIVE_Z',
  feederEnd:'NEGATIVE_X',deliveryEnd:'POSITIVE_X',confidence:CONFIDENCE.HIGH
});


// V319 — actual on-machine roller diagram photographed by the user on Offset 5.
// This is an installed-machine visual authority for roller identity/topology/nominal table data,
// but it is NOT a nip-setting, pressure, bearer or dimensional service measurement.
export const OFFSET5_ACTUAL_ROLLER_DIAGRAM=Object.freeze({
  revision:'offset5-print-unit-reality-v319',
  sourceId:'SRC-O5-ROLLER-DIAGRAM-IMG2777',
  sourceFile:'IMG_2777.jpeg',
  title:'ROLLER DIAGRAM · HEIDELBERG CD-102',
  evidenceClass:'USER_PHOTO_OF_ON_MACHINE_DIAGRAM',
  appliesTo:'OFFSET 5 · CD 102-8+L · PU1-PU8',
  confirms:Object.freeze([
    'inking roller codes 1-15 and distributor rollers A-D',
    'dampening rollers 16/FEAW, 17/ZW, 18/T, 19/DW and FR',
    'nominal roller diameters, color identification and material/remark table',
    'relative sectional topology above the plate cylinder',
    'plate → blanket → impression cylinder order',
    'RAKEL, AIR BLOWER and WATER callout zones shown on the posted diagram'
  ]),
  boundary:'SCHEMATIC_TOPOLOGY_AND_NOMINAL_TABLE_ONLY__DO_NOT_INFER_NIP_PRESSURE_TIMING_BEARER_DIAMETER_OR_SERVICE_SETTING'
});

const freezeRollers=rows=>Object.freeze(rows.map(row=>Object.freeze({...row,sectionCenter:Object.freeze(row.sectionCenter)})));

export const OFFSET5_INKING_ROLLERS=freezeRollers([
  {code:'1',designation:'2nd inking form roller',diameterMM:72,colorCode:'blue',surface:'rubber-coated',materialKind:'rollerBlue',sectionCenter:[.2336,2.0554,0]},
  {code:'2',designation:'3rd inking form roller',diameterMM:66,colorCode:'red',surface:'rubber-coated',materialKind:'rollerRed',sectionCenter:[.1019,2.0515,0]},
  {code:'3',designation:'Ink transfer roller',diameterMM:56,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.1639,2.1309,0]},
  {code:'4',designation:'Ink transfer roller',diameterMM:80,colorCode:'yellow',surface:'rubber-coated',materialKind:'rollerYellow',sectionCenter:[.3111,2.2123,0]},
  {code:'5',designation:'Ink transfer roller',diameterMM:68,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.2065,2.2607,0]},
  {code:'6',designation:'Ink transfer roller',diameterMM:72,colorCode:'blue',surface:'rubber-coated',materialKind:'rollerBlue',sectionCenter:[.1019,2.2161,0]},
  {code:'7',designation:'Ink transfer roller',diameterMM:56,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.0380,2.2955,0]},
  {code:'8',designation:'Ink transfer roller',diameterMM:60,colorCode:'white',surface:'rubber-coated',materialKind:'rollerWhite',sectionCenter:[-.0279,2.2355,0]},
  {code:'9',designation:'Ink transfer roller',diameterMM:66,colorCode:'red',surface:'rubber-coated',materialKind:'rollerRed',sectionCenter:[.4467,2.1658,0]},
  {code:'10',designation:'Ink transfer roller',diameterMM:56,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.5474,2.1696,0]},
  {code:'11',designation:'Ink transfer roller',diameterMM:80,colorCode:'yellow',surface:'rubber-coated',materialKind:'rollerYellow',sectionCenter:[.4447,2.4040,0]},
  {code:'12',designation:'Ink transfer roller',diameterMM:68,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.5532,2.4389,0]},
  {code:'13',designation:'4th inking form roller',diameterMM:80,colorCode:'yellow',surface:'rubber-coated',materialKind:'rollerYellow',sectionCenter:[-.0259,2.0031,0]},
  {code:'14',designation:'1st inking form roller',diameterMM:60,colorCode:'white',surface:'rubber-coated',materialKind:'rollerWhite',sectionCenter:[.3421,1.9759,0]},
  {code:'15',designation:'Ink vibrator',diameterMM:59,colorCode:null,surface:'rubber-coated',materialKind:'rubber',sectionCenter:[.1484,2.5783,0]}
]);

export const OFFSET5_INK_DISTRIBUTORS=freezeRollers([
  {code:'A',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'stainless steel',materialKind:'steel',sectionCenter:[.3246,2.4447,0]},
  {code:'B',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.4118,2.2820,0]},
  {code:'C',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.3479,2.0922,0]},
  {code:'D',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.0109,2.1290,0]}
]);

export const OFFSET5_DAMPENING_ROLLERS=freezeRollers([
  {code:'16',diagramAlias:'FEAW',designation:'Dampening form roller',diameterMM:78,colorCode:null,surface:'rubber-coated',materialKind:'rubber',sectionCenter:[.4370,1.8307,0]},
  {code:'17',diagramAlias:'ZW',designation:'Intermediate roller',diameterMM:56,colorCode:null,surface:'rubber-coated',materialKind:'rubber',sectionCenter:[.4273,1.9372,0]},
  {code:'18',diagramAlias:'T',designation:'Water pan roller',diameterMM:108,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.7082,1.7571,0]},
  {code:'19',diagramAlias:'DW',designation:'Metering roller',diameterMM:98,colorCode:null,surface:'rubber-coated',materialKind:'rubber',crowned:true,sectionCenter:[.5764,1.8597,0]},
  {code:'FR',diagramAlias:'FR',designation:'Dampening distributor',diameterMM:85,colorCode:null,surface:'chromium-plated',materialKind:'chromium',sectionCenter:[.4796,1.7067,0]}
]);

export const OFFSET5_FORM_ROLLER_ORDER=Object.freeze(['14','1','2','13']);

export const TECHNICAL_SOURCES=Object.freeze([
  {id:'SRC-O5-ROLLER-DIAGRAM-IMG2777',title:'Offset 5 · on-machine ROLLER DIAGRAM HEIDELBERG CD-102',publisher:'PT Bukit Muria Jaya / installed machine evidence',url:null,type:'USER_PHOTO_OF_ON_MACHINE_DIAGRAM',confidence:CONFIDENCE.PHOTO_VERIFIED,localFile:'IMG_2777.jpeg',supports:['roller codes 1-19, A-D and FR','nominal diameters','roller material/remark table','form-roller color identification','relative inking/dampening topology','plate-blanket-impression sequence','RAKEL / AIR BLOWER / WATER callout zones'],boundary:'Diagram is a schematic and nominal table; it does not provide installed nip pressure, timing, bearer diameter, wear condition or service setting.'},
  {id:'SRC-CD102-SERVICE-MANUAL',title:'Speedmaster CD 102 · electrical/service manual (446 pages)',publisher:'Heidelberger Druckmaschinen AG',url:null,type:'USER_SUPPLIED_OEM_MANUAL',confidence:CONFIDENCE.HIGH,localFile:'pdfcoffee.com_cd102pdf-4-pdf-free.pdf',supports:['feeder pile centering 11M9','pile support adjustment 11M8','suction-head height 11M5','suction-head/format adjustment 11M6','pile stops 11M11/11M12','format wheels 11M4','cover-guide height 1M4','front-lay adjustment 1M2/1M3','printing-pressure adjustment 1...nM5','sheet-arrival and monitoring architecture']},
  {id:'SRC-CD102-ROLLER-PROCEDURE',title:'SM/CD102 · Removing and installing the inking rollers',publisher:'Heidelberger Druckmaschinen AG',url:null,type:'USER_SUPPLIED_OEM_PROCEDURE',confidence:CONFIDENCE.HIGH,localFile:'SMCD102_roller_remove_procedure.pdf',supports:['roller map 1-19','distributor rollers A-D','dampening distributor FR','roller diameters and materials','inking form roller color identification','roller removal sequence','ink-stripe adjustment references']},
  {id:'SRC-HEIDELBERG-CD102',title:'Speedmaster CD 102 · official product information',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.heidelberg.com/global/media/en/global_media/products___sheetfed_offset/2020_20/product_brochures_1/speedmaster-cd-102-product-information.pdf',type:'MANUFACTURER_PRODUCT_INFORMATION',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['Preset Plus feeder','front-lay sheet alignment','sheet arrival monitoring','special gripper systems','AirTransfer sheet transport','inking and Alcolor dampening','ink fountain','chamber-blade coating unit','dryer system','sheet brake','Preset Plus delivery','central lubrication']},
  {id:'SRC-HD-SUCTION-BELT-PATENT',title:'Device for adapting negative pressure in a suction-belt feed table',publisher:'Heidelberger Druckmaschinen AG',url:'https://patents.google.com/patent/US5697606A/en',type:'MANUFACTURER_PATENT',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['suction-belt feed table','negative-pressure chambers','sheet transport','operating-condition adaptation']},
  {id:'SRC-HD-SHEET-ALIGN-PATENT',title:'Device for aligning sheets in a feeder of a sheet-processing machine',publisher:'Heidelberger Druckmaschinen AG',url:'https://patents.google.com/patent/US6681697B2/en',type:'MANUFACTURER_PATENT',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['feed table','sheet alignment','front lay reference','side-pull reference','sheet sensor reference']},
  {id:'SRC-HD-PRESET-PLUS-MANUAL',title:'Preset Plus Feeder operating manual · archived mirror',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.scribd.com/document/458032567/CD-102-New-Feeder-1-pdf',type:'MANUFACTURER_MANUAL_MIRROR',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['blowing/suction nozzle','propelling roller','pull plate','suction tape module','guide plate','drive roller','idler pulley','multiple-sheet detector']},
  {id:'SRC-FOCUSIGHT-SWAN',title:'FS-SWAN Offset Printing Online Inspection System',publisher:'Focusight Technology Co., Ltd.',url:'https://en.focusight.net/en/Product/Printing/536.html',type:'MANUFACTURER_PRODUCT_PAGE',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['inline sheet inspection','camera/imaging assembly','lighting','image processing','alarm and marking system']},
  {id:'SRC-SM102-INSTALL-DIMENSIONS',title:'Speedmaster SM 102 technical specifications · family reference only',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.scribd.com/document/591071065/SM-102-Specs',type:'MANUFACTURER_MANUAL_MIRROR',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['102-platform family component spacing context only'],boundary:'BMJ OFU-1 is a custom installed machine; these generic family dimensions must not override user-confirmed plant dimensions.'},
  {id:'SRC-SX102-DIMENSION-CROSSCHECK',title:'Speedmaster SX 102 · official technical information',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_sx_102/technical_data___equipment_5/technical_data___equipment_5.jsp',type:'MANUFACTURER_TECHNICAL_DATA',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['102-format sheet orientation','Preset Plus functional family context'],boundary:'Reference family only; not a dimensional substitute for custom BMJ OFU-1.'},
  {id:'SRC-CD102-8LX-DIMENSION-CROSSCHECK',title:'Heidelberg CD 102-8+LX used-machine family visual reference',publisher:'ROEPA / used-equipment listing',url:'https://roepa.com/offers/heidelberg-cd-102-8-lx-2000-from-2005-380885?locale=de',type:'SECONDARY_EQUIPMENT_LISTING',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['older CD102 eight-color long-delivery silhouette and component sequence only'],boundary:'Not BMJ serial 550415 and never used to normalize BMJ custom installed dimensions.'},
  {id:'SRC-USER-PHOTOS',title:'Foto aktual OFFSET 5',publisher:'PT Bukit Muria Jaya',url:null,type:'USER_EVIDENCE',confidence:CONFIDENCE.PHOTO_VERIFIED,supports:['outer housing','visible feeder structure','operator platform','visible delivery structure','visible inline-inspection gantry']}
]);

export const PHOTO_REGISTRY=Object.freeze([
  ['p01','IMG_2312.jpeg','Delivery pile/end','end view toward printing units','active_geometry_reference',CONFIDENCE.HIGH],
  ['p02','IMG_1970.jpeg','Printing units','upper ink/roller','active_geometry_reference',CONFIDENCE.HIGH],
  ['p03','IMG_1971.jpeg','Printing units','upper ink/roller','active_geometry_reference',CONFIDENCE.HIGH],
  ['p04','IMG_1656.jpeg','Delivery','panel view','active_geometry_reference',CONFIDENCE.HIGH],
  ['p05','IMG_1624.jpeg','Feeder end','controls/end view','active_geometry_reference',CONFIDENCE.HIGH],
  ['p06','IMG_1625.jpeg','Feeder pile','open frame and suction head','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p07','IMG_1626.jpeg','Feed board / PU1 interface','board, grille and gauge detail','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p08','IMG_1627.jpeg','Printing units','operator side','active_geometry_reference',CONFIDENCE.HIGH],
  ['p09','IMG_1628.jpeg','Printing units','upper operator side','active_geometry_reference',CONFIDENCE.HIGH],
  ['p10','IMG_1629.jpeg','Coating / delivery transition','platform, raised hood and end housing','supplementary_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p11','IMG_1630.jpeg','Inline inspection','sloped hood, gantry and camera pods','supplementary_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p12','IMG_1631.jpeg','Inline inspection','gantry/camera pods','supplementary_reference',CONFIDENCE.HIGH],
  ['p13','IMG_1633.jpeg','Inline inspection','top beam','supplementary_reference',CONFIDENCE.HIGH],
  ['p14','IMG_1634.jpeg','Machine end','orientation overview','orientation_reference',CONFIDENCE.HIGH],
  ['p15','IMG_1165.jpeg','Service zone','gauge/hose detail','detail_reference',CONFIDENCE.MEDIUM],
  ['p16','IMG_0947.jpeg','Service zone','roller detail','detail_reference',CONFIDENCE.MEDIUM],
  ['p17','IMG_2388(2).jpeg','Delivery to feeder overview','operator-side longitudinal overview','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p18','IMG_2391(1).jpeg','Delivery / coating / printing units','operator-side walkway and inspection bridge','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p19','IMG_2392.jpeg','Coating to printing units','operator-side steps, covers and platform','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p20','IMG_2389(1).jpeg','Delivery to printing units','drive-side longitudinal overview and service aisle','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p21','IMG_2390(1).jpeg','Inspection / printing units','drive-side railing, flat covers and secondary steps','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p22','IMG_2395.jpeg','Feeder to printing units','drive-side pile portal, utility cabinet and hose routing','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p23','IMG_1628(2).jpeg','Printing Unit 1 to downstream units','top view from feeder toward delivery','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p24','IMG_1662.jpeg','Inter-unit operator access bay','operator side looking through PU gap','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p25','IMG_2777.jpeg','Printing Units 1–8','on-machine roller diagram / internal sectional topology','actual_internal_diagram_reference',CONFIDENCE.PHOTO_VERIFIED]
].map(([id,filename,machineZone,viewDirection,category,confidence])=>Object.freeze({id,filename,machineZone,viewDirection,category,confidence,duplicateOf:null})));

export const photoStats=()=>PHOTO_REGISTRY.reduce((s,p)=>{s.uploaded++;if(!p.duplicateOf)s.unique++;s[p.category]=(s[p.category]||0)+1;return s;},{uploaded:0,unique:0,duplicate:0,active_geometry_reference:0,supplementary_reference:0,orientation_reference:0,detail_reference:0});
