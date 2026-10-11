import {OFFSET5_DIMENSIONS} from './dimensions-offset5.js';
// Visual contact geometry only: installed UV configuration and transport hardware remain unverified.
const scaleX=OFFSET5_DIMENSIONS.layout.dryerLength/1.62;
export const OFFSET5_DRYER_CONTACT=Object.freeze({scaleX,sheetY:1.29,sheetClearance:.001,rollerRadius:.035,rollerAxisY:1.254,rollerXs:Object.freeze([-.60,-.36,-.12,.12,.36,.60]),installedTransportVerified:false});
export const OFFSET5_INSPECTION_CONTACT=Object.freeze({lightX:.26,lightY:2.55,installedOpticalTiltVerified:false});
