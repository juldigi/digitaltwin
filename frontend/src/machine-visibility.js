// Quality changes must keep the current cutaway mode intact.
export function applyMachineDetailVisibility(template,low){
 if(!template)return;
 const exteriorOpen=template.exteriorOpen===true;
 template.setLow?.(low);
 if(exteriorOpen)template.setExteriorOpen?.(true);
}
