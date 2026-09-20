export const SHEETING_PHOTO_REGISTRY=Object.freeze([]);
export const SHEETING_TECHNICAL_SOURCES=Object.freeze([
  Object.freeze({
    id:'SHEETING-BMJ-DATABASE',
    title:'Database Mesin Packaging Offset BMJ · SHEETING LEXUS',
    publisher:'PT Bukit Muria Jaya',
    type:'USER_PROVIDED',
    confidence:'VERIFIED',
    note:'HSM-CTM7 · serial 00982 · SAP SBM-2 · year 2014.'
  }),
  Object.freeze({
    id:'SHEETING-LEXUS-INDONESIA',
    title:'Lexus Sheeter · Indonesian production reference',
    publisher:'PT Macanan Jaya Cemerlang profile / public industrial reference',
    type:'FAMILY_PROCESS_REFERENCE',
    confidence:'MEDIUM-FAMILY',
    url:'https://id.scribd.com/doc/265987266/BAB-II',
    note:'Public Indonesian Lexus Sheeter reference describes a servo-drive single-rotary high-speed sheeter with double hydraulic shaftless reel stand, automatic tension, EPC automatic web guide and computerized control panel. Exact model is not stated, so this is not proof that BMJ HSM-CTM7 has every listed feature.'
  }),
  Object.freeze({
    id:'SHEETING-GREATWALL-SYNCHRO-VISUAL',
    title:'ACCURA / SPEEDWELL Synchro-Fly Sheeter visual family',
    publisher:'Great Wall Machinery & Manufacturing (Philippines), Inc.',
    type:'VISUAL_FAMILY_REFERENCE',
    confidence:'MEDIUM-VISUAL',
    url:'https://www.greatwallmachinery.com/speedwellsynchroflysheeter.html',
    note:'Open-frame visual family reference: double shaftless unwind architecture, exposed feed/tension bridge, compact cutter head, side operator catwalk, long tape/overlap delivery and lift-table stacker. Used for silhouette and proportions only.'
  }),
  Object.freeze({
    id:'SHEETING-GREATWALL-SRV56-TRADE',
    title:'MACH SRV 56 / Accura export records to Indonesia',
    publisher:'Public international trade records',
    type:'CORROBORATING_FAMILY_REFERENCE',
    confidence:'MEDIUM-FAMILY',
    url:'https://www.volza.com/p/tyre-or-machine/hsn-code-8441/export-data/exports-from-philippines/',
    note:'Trade records include MACH SRV 56 servo rotary high-speed sheeter machines exported from the Philippines to Indonesia with double shaftless reel stands, plus Accura Synchro-Fly sheeters with shaftless unwind stands. This supports the regional architecture but does not establish exact BMJ model identity.'
  }),
  Object.freeze({
    id:'SHEETING-HSM56-BW',
    title:'2014 Lexus Sheeter · Model HSM 56',
    publisher:'BW Papersystems',
    type:'COMPARISON_FAMILY_REFERENCE',
    confidence:'HIGH-FAMILY / LOW-EXACT',
    url:'https://www.bwpapersystems.com/docs/default-source/used-machines/lexus-2014-sheeter-500045.pdf?sfvrsn=ce1e827f_1',
    note:'Comparison source confirms a 2014 Lexus HSM 56 with 400–1700 mm cut length, 600 gsm knife load, flat-plate lift table, 300 m/min maximum mechanical speed and a fixed-position two-sided rollstand. Its rollstand/knife description conflicts with other Lexus family references, therefore it is not forced onto HSM-CTM7 geometry.'
  }),
  Object.freeze({
    id:'SHEETING-RECOVERED-REFERENCE',
    title:'Recovered BMJ Digital Twin Sheeting orientation baseline',
    publisher:'BMJ Digital Twin project history',
    type:'USER_CONFIRMED_REFERENCE',
    confidence:'USER-CONFIRMED',
    note:'Preserves user-confirmed process orientation: input roll at RIGHT, web travels RIGHT-to-LEFT, cutter and delivery follow, finished stack at LEFT.'
  })
]);
export const sheetingPhotoStats=()=>({unique:0,total:0});
export const SHEETING_ORIENTATION=Object.freeze({
  feedDirection:'RIGHT → LEFT · shaftless unwind → open feed/tension/EPC → cross-cut cutter → overlap delivery → layboy',
  operatorSide:'Single operator-side catwalk / HMI side follows the strongest public visual family reference; exact OEM side designation remains unverified.',
  driveSide:'Opposite service/drive side; exact HSM-CTM7 OEM labeling is not publicly verified.',
  input:'RIGHT',
  output:'LEFT',
  cutterArchitecture:'PUBLIC SOURCES CONFLICT · exact HSM-CTM7 cutter type remains unresolved'
});
