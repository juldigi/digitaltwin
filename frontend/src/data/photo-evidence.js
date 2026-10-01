export function normalizePhotoEvidence(photo={},index=0){
 const filename=photo.filename||photo.fileName||photo.file||('Foto '+(index+1));
 const view=photo.view||null;
 return Object.freeze({
  ...photo,
  filename,
  machineZone:photo.machineZone||view||'Foto aktual mesin',
  viewDirection:photo.viewDirection||(view?'Sudut aktual BMJ':'Sudut belum diringkas'),
  category:photo.category||'active_geometry_reference',
  confidence:photo.confidence||'UNVERIFIED'
 });
}

export function normalizePhotoRegistry(items=[]){
 return Object.freeze((Array.isArray(items)?items:[]).map((photo,index)=>normalizePhotoEvidence(photo,index)));
}
