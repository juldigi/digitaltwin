// Apply the same user preference after every scene rebuild, including cached and live data reloads.
const LAYERS=Object.freeze({
 building:'building',ipal:'ipal',floor:'floor',walls:'walls',doors:'doors',windows:'windows',airCurtain:'air_curtain',furniture:'furniture',roof:'roof',machines:'machines',
 labels:'labels',landscape:'landscape',reference:'reference',unidentified:'unidentified',
 compressedAir:'utility_compressed_air',ahuPiping:'utility_ahu_piping',
 ducting:'utility_ahu_ducting',utilityAnchors:'utility_anchors'
});

export function syncFactoryLayerVisibility(engine,visibleLayers){
 if(!engine?.actualFactory?.layers||!visibleLayers)return;
 for(const [preference,layer] of Object.entries(LAYERS)){
  if(typeof visibleLayers[preference]==='boolean'&&engine.actualFactory.layers[layer])
   engine.setFactoryLayer(layer,visibleLayers[preference]);
 }
 if(typeof visibleLayers.labels==='boolean')engine.labels=visibleLayers.labels;
}
