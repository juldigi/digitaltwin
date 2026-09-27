// Find an optical station on the actual arclength-parameterized sheet path.
// Both inspection families use monotonic X transport through their scan cells.
export function progressAtX(curve,x){
 let lo=0,hi=1;
 for(let i=0;i<32;i++){
  const mid=(lo+hi)/2;
  if(curve.getPointAt(mid).x<x)lo=mid;else hi=mid;
 }
 return (lo+hi)/2;
}
