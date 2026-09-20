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
    id:'SHEETING-HSM56-BW',
    title:'2014 Lexus Sheeter · Model HSM 56',
    publisher:'BW Papersystems',
    type:'FAMILY_REFERENCE',
    confidence:'HIGH-FAMILY / MEDIUM-EXACT',
    url:'https://www.bwpapersystems.com/docs/default-source/used-machines/lexus-2014-sheeter-500045.pdf?sfvrsn=ce1e827f_1',
    note:'Family reference confirms 400–1700 mm cut length, 600 gsm flat-bed knife load, flat-plate lift table, 300 m/min maximum mechanical speed, and one fixed-position two-sided rollstand. It does not prove HSM-CTM7 is identical to HSM 56.'
  }),
  Object.freeze({
    id:'SHEETING-RECOVERED-REFERENCE',
    title:'Recovered BMJ Digital Twin Sheeting visual baseline',
    publisher:'BMJ Digital Twin project history',
    type:'USER_CONFIRMED_REFERENCE',
    confidence:'USER-CONFIRMED',
    note:'Preserves process orientation: input roll at right, web right-to-left, cutter, delivery/layboy, output stack at left; exterior silhouette uses the previously supplied Great Wall High_Speed_Synchro visual reference.'
  })
]);
export const sheetingPhotoStats=()=>({unique:0,total:0});
export const SHEETING_ORIENTATION=Object.freeze({
  feedDirection:'RIGHT → LEFT · rollstand → feed/tension/EPC → flat-bed knife → delivery/layboy',
  operatorSide:'Catwalk / control side retained from recovered BMJ visual baseline',
  driveSide:'Opposite service/drive side; exact OEM side labeling remains reference-level',
  input:'RIGHT',
  output:'LEFT'
});
