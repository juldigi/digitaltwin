import {OFFSET5_DIMENSIONS} from './dimensions-offset5.js';
// Visual contact clearances, not measured OEM diameters or pressure settings.
const scaleX=OFFSET5_DIMENSIONS.layout.coaterLength/1.15;
const impression={x:-.08,y:1.03,r:.255};
const coating={x:.10,y:1.03+Math.sqrt(.494**2-(.18*scaleX)**2),r:.235};
const anilox={x:-.02,y:coating.y+Math.sqrt(.351**2-(.12*scaleX)**2),r:.115};
export const OFFSET5_COATER_CONTACT=Object.freeze({scaleX,impression:Object.freeze(impression),coating:Object.freeze(coating),anilox:Object.freeze(anilox),bladeX:anilox.x-(anilox.r+.004)/scaleX,sheetClearance:.001,installedTransferVerified:false});
