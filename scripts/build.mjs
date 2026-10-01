import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/bake-factory-fleet.mjs'],{stdio:'inherit'});
import {cpSync,mkdirSync,readFileSync,writeFileSync,rmSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const path=join(dir,entry.name);return entry.isDirectory()?walk(path):[path];});
const fingerprint=createHash('sha256');
for(const file of walk('frontend').sort()){fingerprint.update(relative('frontend',file));fingerprint.update('\0');fingerprint.update(readFileSync(file));}
const buildFingerprint=fingerprint.digest('hex').slice(0,16);
const RELEASE_LABEL='2026.10.01-273';
rmSync('dist',{recursive:true,force:true});cpSync('frontend','dist',{recursive:true});mkdirSync('dist/vendor/three',{recursive:true});cpSync('node_modules/three/build','dist/vendor/three/build',{recursive:true});cpSync('node_modules/three/examples/jsm','dist/vendor/three/addons',{recursive:true});cpSync('node_modules/three/LICENSE','dist/vendor/three/LICENSE');
const fleetChunkCount=[...readFileSync('dist/src/data/factory-fleet-data.js','utf8').matchAll(/import c\d+ from '\.\/factory-fleet-chunk-\d+\.js';/g)].length;
if(!fleetChunkCount)throw new Error('Manifest geometri pabrik tidak memiliki chunk.');
let sw=readFileSync('dist/sw.js','utf8');sw=sw.replace("const BUILD_FINGERPRINT='SOURCE';",`const BUILD_FINGERPRINT='${buildFingerprint}';`).replace(/const VERSION='factory-digital-twin-[^']+';/,`const VERSION='factory-digital-twin-${buildFingerprint}';`).replace(/const RELEASE='[^']+';/,`const RELEASE='${buildFingerprint}';`).replace(/const FLEET_CHUNK_COUNT=\d+;/,`const FLEET_CHUNK_COUNT=${fleetChunkCount};`);writeFileSync('dist/sw.js',sw);
// Keep modules at their original URLs so relative imports resolve identically in development and production.
let html=readFileSync('dist/index.html','utf8');html=html.replace(/\?v=[A-Za-z0-9._-]+/g,`?v=${buildFingerprint}`).replace(/bmj-sw-[A-Za-z0-9._-]+-reloaded/g,`bmj-sw-${buildFingerprint}-reloaded`).replace('<link rel="stylesheet" href="./style.css">',()=>'<style>'+readFileSync('frontend/style.css','utf8')+'</style>');writeFileSync('dist/index.html',html);
let appState=readFileSync('dist/src/state/app-state.js','utf8');appState=appState.replace(/export const APP_BUILD='[^']+';/,`export const APP_BUILD='${RELEASE_LABEL}-${buildFingerprint}';`);writeFileSync('dist/src/state/app-state.js',appState);
import {initialState} from '../frontend/src/model.js';
writeFileSync('backend/migrations/0001_initial.sql',`CREATE TABLE IF NOT EXISTS twin_state (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL CHECK(json_valid(data)), revision INTEGER NOT NULL DEFAULT 0);\nINSERT OR IGNORE INTO twin_state(id,data,revision) VALUES(1,'${JSON.stringify(initialState).replaceAll("'","''")}',0);\n`);
console.log('Build selesai: dist/ (HTML + Three.js lokal), migrasi D1 tersedia.');
