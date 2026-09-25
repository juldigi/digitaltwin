export const APM2_ORIENTATION=Object.freeze({
  feedDirection:'+X',
  operatorSide:'-Z',
  driveSide:'+Z',
  note:'Orientation is a reconstruction convention for the digital twin. The BMJ workbook does not encode operator-side orientation.'
});

export const APM2_PHOTO_REGISTRY=Object.freeze([]);

export const APM2_TECHNICAL_SOURCES=Object.freeze([
  {
    id:'APM2-BMJ-DATABASE',
    title:'BMJ Machine Database · AUTOPLATEN - 2 MACHINE',
    publisher:'PT Bukit Muria Jaya',
    file:'List All Machine_Clean_Database_Offset10.xlsx',
    supports:['model SP 102','serial 57115506','SAP Code APM-2','Functional Location PC-PK2-CON-AUT-AUTOPLAT02','year 1994']
  },
  {
    id:'APM2-BMJ-Q2',
    title:'Packaging Offset Technical Quarterly Review Q2 2026',
    publisher:'PT Bukit Muria Jaya',
    supports:['APM-2 SideLay abnormal maintenance history','temporary replacement motor issue']
  },
  {
    id:'APM2-SP102-1994',
    title:'Bobst SP 102 SE Automatic Die Cutter · 1994 reference',
    publisher:'PressCity',
    url:'https://presscity.com/en/machines/bobst/91359-96808/bobst-sp-102-se-automatic-die-cutter.html',
    supports:['1994 SP 102 family exterior','1020×720 mm sheet','250 t pressure','7500 sheets/h','non-stop feeder/delivery','left side lay','front lays','Centerline','stripping frames']
  },
  {
    id:'APM2-SP102-TECH',
    title:'BOBST SP 102 SE technical reference',
    publisher:'ROEPA',
    url:'https://www.roepa.com/offers/bobst-sp-102-se-from-1995-375375/print_base',
    supports:['side lay','standard feeder','die-cutting chase','micrometric system','upper/lower stripping frames','non-stop feeder and delivery','family weight']
  },
  {
    id:'APM2-SP102-E-VISUAL',
    title:'BOBST SP 102 E · 1992 visual reference',
    publisher:'Camporese',
    url:'https://www.camporese.it/products/press/25036536',
    supports:['legacy SP 102 exterior proportions','feeder opening','die-cutting housing','operator controls','stripping section']
  },
  {
    id:'APM2-SP102-CHAIN14',
    title:'Bobst SP 102 gripper-bar chain set · 14 pcs',
    publisher:'Conway Machine',
    url:'https://catalog.conwaymachine.com/catalog/chain-sets',
    supports:['SP 102 gripper-bar chain set of 14','two-chain gripper transport family reference']
  },
  {
    id:'APM2-BOBST-GRIPPER-PATENT',
    title:'Gripper bar for die cutting machine · assigned to Bobst Group',
    publisher:'Google Patents / USPTO record',
    url:'https://patents.google.com/patent/US20030107167A1/en',
    supports:['gripper bars on two lateral chains','cross-machine gripper-bar architecture','successive horizontal intermittent movement through processing stations','return path to sheet pickup']
  },
  {
    id:'APM2-SP102-PARTS',
    title:'SP 102 E compatible parts catalogue',
    publisher:'MV Parts',
    url:'https://www.mvparts.eu/machinetypes/sp102e/',
    supports:['gripper bars','chain set','suction cups','stripping pins','cutting plate','side lay guide','clutch','platen filter','non-stop apron']
  },
  {
    id:'APM2-SP102-DIM',
    title:'BOBST SP 102 E technical-data reference',
    publisher:'Exapro',
    url:'https://www.exapro.pl/sp/bobst-bobstsp102e-2717/',
    supports:['legacy family envelope around 6000×2000×2200 mm','18700 kg reference weight','7500 sheets/h']
  }
]);

export const apm2PhotoStats=()=>({unique:0,views:0,zones:0});