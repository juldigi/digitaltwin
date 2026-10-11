// Visual contact constraints for the all eight printing units, not OEM service dimensions.
export function offset5CylinderSection(index){
 const r={plate:.215,blanket:.245,impression:.255,transfer:.225};
 const p={plate:[.16,1.79,0],blanket:[-.12,1.39,0],impression:[.16,.95,0],transfer:[-.12,.55,0]};
 {
  const d=p.plate[1]-p.impression[1],a=r.blanket+r.impression+.004,b=r.blanket+r.plate+.002;
  const y=(d*d+a*a-b*b)/(2*d);
  p.blanket=[.16-Math.sqrt(a*a-y*y),.95+y,0];
  const dx=p.transfer[0]-.16,dy=p.transfer[1]-.95,k=(r.transfer+r.impression+.002)/Math.hypot(dx,dy);
  p.transfer=[.16+dx*k,.95+dy*k,0];
 }
 return {r,p};
}
export const OFFSET5_TRANSFER_CONTACT={radius:.235,axisY:.70,sheetClearance:.002,installedTopologyVerified:false};
