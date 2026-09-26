import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read=p=>readFileSync(resolve(p),'utf8');
const apm2=read('frontend/src/apm2.js');
const mk920=read('frontend/src/mk920.js');
const mk1060=read('frontend/src/mk1060.js');
const promatrix=read('frontend/src/promatrix106.js');
const media=read('frontend/src/media100.js');
const diana=read('frontend/src/diana-eye55.js');
const shark=read('frontend/src/shark-n650.js');
const bake=read('scripts/bake-factory-fleet.mjs');
const build=read('scripts/build.mjs');
const sw=read('frontend/sw.js');

test('V230 converting and inspection templates add family-specific exterior identity passes',()=>{
 for(const src of [apm2,mk920,mk1060,promatrix,media,diana,shark]){
  assert.match(src,/buildExteriorIdentity\(\)/);
  assert.match(src,/visualRefinement='V2(?:30|35)_/);
  assert.match(src,/sourceBoundary=/);
 }
});

test('V230 SP102 keeps feeder and delivery pile zones open while strengthening the legacy platen silhouette',()=>{
 assert.match(apm2,/V230_SP102_LEGACY_FAMILY_SILHOUETTE/);
 assert.match(apm2,/BOBST_SP102_LEGACY_FAMILY__E_SE_CER_BMA_SUFFIX_UNCONFIRMED/);
 assert.match(apm2,/openPileEnvelope=true/);
 assert.match(apm2,/legacyServiceFascia=true/);
 assert.doesNotMatch(apm2,/buildExteriorIdentity[\s\S]{0,3500}this\.cover\(this\.box\(g,\[5\.82,[^\]]+\]/);
});

test('V230 die cutters are visually distinct instead of sharing one generic body',()=>{
 assert.match(promatrix,/V235_PROMATRIX106_CSB_OFFICIAL_VISUAL_IDENTITY/);
 assert.match(promatrix,/HEIDELBERG_PROMATRIX106_CSB_OFFICIAL_MACHINE_IMAGES__OPTIONAL_LOGISTICS_BOUNDED/);
 assert.match(promatrix,/Wide operator-side access stair bank and landing/);
 assert.match(mk1060,/V230_MK1060ER_MODEL_FAMILY_SILHOUETTE/);
 assert.match(mk1060,/Model-family red identification band/);
 assert.match(mk920,/V235_MK920YMI_WHITE_GRAY_MAGENTA_ARCHIVE_IDENTITY/);
 assert.match(mk920,/Foil-stamping upper superstructure/);
});

test('V230 MEDIA 100 II stays an open-frame folder gluer with longitudinal section rhythm',()=>{
 assert.match(media,/V235_MEDIA100II_OPEN_WHITE_RAIL_BLACK_HANDWHEEL_IDENTITY/);
 assert.match(media,/MEDIA100II_USED_MACHINE_VISUALS__A1_A2_AND_INSTALLED_OPTION_KITS_BOUNDED/);
 assert.match(media,/Operator-side black adjustment hardware/);
 assert.match(media,/feederIdentityPanel=true/);
 assert.match(media,/compressionDeliveryIdentityPanel=true/);
 assert.doesNotMatch(media,/buildExteriorIdentity[\s\S]{0,3000}\[9\.80,1\.[0-9]+,1\.[0-9]+\]/);
});

test('V230 Diana Eye and SHARK N650 carry different inspection-tower exterior identities',()=>{
 assert.match(diana,/V235_DIANA_EYE55_WHITE_INSPECTION_CELL_WITH_HMI_PEDESTAL/);
 assert.match(diana,/cameraHood=true/);
 assert.match(diana,/acceptedDeliveryPanel=true/);
 assert.match(shark,/V235_SHARK_N650_WHITE_TOWER_DARK_BASE_BLUE_STRIPE_HMI/);
 assert.match(shark,/P3N1_OPTION_PACKAGE_UNDECODED/);
 assert.match(shark,/visionHood=true/);
 assert.match(shark,/familyAccent=true/);
});

test('V230 factory/home geometry continues to be regenerated from these same live templates',()=>{
 assert.match(bake,/const t=createPolishedMachineTemplate\(place\.machineId\)/);
 assert.match(bake,/t\.setLow\?\.\(true\)/);
 const rebake=build.indexOf('scripts/bake-factory-fleet.mjs');
 const copy=build.indexOf("cpSync('frontend','dist'");
 assert.ok(rebake>=0&&copy>rebake);
});

test('V230 refreshes shell bytes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
