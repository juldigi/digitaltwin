import {OFFSET5_DIMENSIONS} from './dimensions-offset5.js';
const D=OFFSET5_DIMENSIONS.layout;
// Photo-derived process surface; this does not change the locked module envelope.
export const OFFSET5_FEEDBOARD_SURFACE=Object.freeze({
 minX:D.feedBoardCenterX-D.feedBoardLength/2,maxX:D.feedBoardCenterX+D.feedBoardLength/2,
 centerX:D.feedBoardCenterX,length:D.feedBoardLength,rise:.42,tapeTopY:1.334,sheetClearance:.002,
 throatMaxX:D.firstPrintingUnitX-D.pu1FrameWidth/2,
 evidence:'BMJ_IMG_2468_IMG_2470__PHOTO_PROPORTIONS_NOT_INSTALLATION_CAD'
});
export function offset5FeedboardHeightAt(x){
 const S=OFFSET5_FEEDBOARD_SURFACE;
 return S.tapeTopY+S.rise*(S.maxX-x)/S.length;
}
