export function renderDiagnostics(renderer,quality,monitor){
 const info=renderer?.info;
 return Object.freeze({
  quality, fps:monitor?.lastFps??null,
  drawCalls:info?.render?.calls??0,
  triangles:info?.render?.triangles??0,
  geometries:info?.memory?.geometries??0,
  textures:info?.memory?.textures??0
 });
}
