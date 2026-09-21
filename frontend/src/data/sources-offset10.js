export const OFFSET10_ORIENTATION=Object.freeze({
  feedDirection:'+X',
  operatorSide:'-Z',
  driveSide:'+Z',
  plantNote:'Delivery faces north in the BMJ plant; local model keeps feeder-to-delivery along +X and plant rotation is applied separately.'
});

export const OFFSET10_TECHNICAL_SOURCES=Object.freeze([
  {id:'O10-FINAL-DRAWING',title:'Final drawing · CX104-2-LY-8-LY-1-L (X3)',publisher:'Heidelberger Druckmaschinen AG',file:'2026_0723_04_ID_Bukit Muria Jaya_CX104-2-LY-8-LY-1-LX3_Final_Cust(1).pdf',supports:['module sequence','base dimensions','service envelope','FoilStar position','X3 delivery','peripheral placement']},
  {id:'O10-PROPOSAL',title:'Proposal Q417_R2_SF_FY27 · CX 104-2+LY-8+LY-1+L UV + FoilStar',publisher:'PT Heidelberg Indonesia',file:'20260311 Q417_R2_SF_CX104-2+LY-8+LY-1+L_UV_Foilstar_BMJ_FY27 Final (1)(1).pdf',supports:['equipment configuration','11 printing units by sequence','3 coating units','FoilStar PU2','Preset Plus feeder/delivery','AirTransfer','Alcolor','IST UV 6 ID + 3 EOP']},
  {id:'O10-UV-LAYOUT',title:'IST UV layout 385642',publisher:'IST METZ',file:'Layout UV IST_385642_a_Layout.pdf',supports:['UV cassette layout','interdeck positions','end-of-press UV arrangement']},
  {id:'O10-PREINSTALL',title:'Preinstallation Visit CX104-2-LY-8-LY-1+LX3 · 12 May 2026',publisher:'PT Heidelberg Indonesia / BMJ',file:'Preinstallation Visit CX104-2-LY-8-LY-1+LX3, BMJ, 12.05.2026.pdf',supports:['elevation 564 mm','water cooled','full UV','FoilStar','site installation context']},
  {id:'O10-SYSTEM',title:'Technotrans system diagram 90002471886',publisher:'technotrans',file:'system diagram_90002471886 Rahmen DIN A1 (revised 03062026).pdf',supports:['cooling-water topology','beta.c/beta.t equipment','re-chiller','pipe connections']},
  {id:'O10-TECH-DATA',title:'Technical Data Final · CX104-2-LY-8-LY-1-L(X3) · 13 May 2026',publisher:'Heidelberger Druckmaschinen AG',file:'Technical Data Final_CX104-2-LY-8-LY-1-L(X3)_BukitMuriaJaya_2026-05-13.pdf',supports:['power','cooling','exhaust','DryStar UV model','FoilStar electrical data','peripheral list']},
  {id:'O10-CX104-OFFICIAL',title:'Speedmaster CX 104 · Product information / technical information',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/product_information_5/product_information_cx_104.jsp',supports:['CX104 exterior design language','Preset Plus feeder/delivery','AirTransfer contact-free Venturi sheet guide','AutoPlate Pro','coating chamber blade + exchangeable anilox architecture','dryer systems','dynamic sheet brake controlled deceleration into delivery']},
  {id:'O10-FOILSTAR-OFFICIAL',title:'FoilStar · Cold transfer module',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/peripherals/printing_and_coating_unit/foil_star/product_information_19/foil_star.jsp',supports:['superstructure','one-to-six transfer webs','unwind/rewind','indexing dancer','web guidance','loading device']}
]);

export const OFFSET10_PHOTO_REGISTRY=Object.freeze([]);
export const offset10PhotoStats=()=>({unique:0,active:0,total:0});
