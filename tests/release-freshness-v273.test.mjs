import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const build=read('../scripts/build.mjs');
const html=read('../frontend/index.html');
const sw=read('../frontend/sw.js');
const state=read('../frontend/src/state/app-state.js');

test('V273 derives every production freshness identifier from one frontend fingerprint',()=>{
 assert.match(build,/const RELEASE_LABEL='2026\.10\.01-273'/);
 assert.match(build,/const buildFingerprint=fingerprint\.digest\('hex'\)\.slice\(0,16\)/);
 assert.match(build,/const VERSION='factory-digital-twin-\$\{buildFingerprint\}'/);
 assert.match(build,/const RELEASE='\$\{buildFingerprint\}'/);
 assert.match(build,/\?v=\$\{buildFingerprint\}/);
 assert.match(build,/bmj-sw-\$\{buildFingerprint\}-reloaded/);
 assert.match(build,/APP_BUILD='\$\{RELEASE_LABEL\}'/);
});

test('V273 leaves the historical source release contract intact and fingerprints dist only',()=>{
 assert.match(html,/app-shell-v79\.css\?v=222/);
 assert.match(html,/bmj-sw-v222-reloaded/);
 assert.match(sw,/const VERSION='factory-digital-twin-v270-flagship-ui-20260930'/);
 assert.match(sw,/const RELEASE='222'/);
 assert.match(sw,/const BUILD_FINGERPRINT='SOURCE'/);
 assert.match(state,/APP_BUILD='2026\.09\.30-270'/);
});
