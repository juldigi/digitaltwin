const PHOTO_VIEW_LABELS=Object.freeze({
 'rollstand-wide':'Rollstand · tampak lebar',
 'rollstand-to-cutter':'Rollstand menuju cutter',
 'delivery-overview':'Delivery · tampak keseluruhan',
 'delivery-console':'Delivery · console operator',
 'belt-table-detail':'Belt table · detail',
 'stack-lay-table-detail':'Stack / lay table · detail',
 'two-sided-rollstand-rear':'Rollstand dua sisi · tampak belakang',
 'lexus-cutter-cabinet':'LEXUS cutter cabinet',
 'lexus-window-and-nip':'LEXUS inspection window dan nip'
});

export function normalizePhotoEvidence(photo={},index=0){
 const filename=photo.filename||photo.fileName||photo.file||('Foto '+(index+1));
 const view=photo.view||null,viewLabel=view?(PHOTO_VIEW_LABELS[view]||view.replace(/[-_]+/g,' ')):null;
 return Object.freeze({
  ...photo,
  filename,
  machineZone:photo.machineZone||viewLabel||'Foto aktual mesin',
  viewDirection:photo.viewDirection||(view?'Sudut aktual BMJ':'Sudut belum diringkas'),
  category:photo.category||'active_geometry_reference',
  confidence:photo.confidence||'UNVERIFIED'
 });
}

export function normalizePhotoRegistry(items=[]){
 return Object.freeze((Array.isArray(items)?items:[]).map((photo,index)=>normalizePhotoEvidence(photo,index)));
}
