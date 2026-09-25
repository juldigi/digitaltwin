import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const app=readFileSync(resolve('frontend/src/app.js'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

test('V223 major navigation closes stale overlays before application handlers run',()=>{
 assert.match(shell,/const MAJOR_NAV_TRANSACTION=Object\.freeze\(\{'nav-machine':'factory','nav-assets':'asset','nav-help':'modal','settings':'modal'\}\)/);
 assert.match(shell,/document\.addEventListener\('click',[\s\S]*?beforeMajorOverlay\(next\);[\s\S]*?\},true\)/);
});

test('V223 asset chooser does not falsify the active section before a selection exists',()=>{
 assert.match(app,/const openAssetNavigation=\(\)=>\{stopSimulationBeforeNavigation\(\);assetDialog\(\);\}/);
 assert.doesNotMatch(app,/openAssetNavigation=\(\)=>\{[^}]*emitDomainState\(\{activeSection:'asset'\}\)/);
 assert.match(app,/if\(item\.type==='area'\)\{emitDomainState\(\{selectedArea:item\.title\}\);assetDialog\(item\.title\);return;\}/);
});

test('V223 system browser returns to a stable factory or asset context when dismissed',()=>{
 assert.match(shell,/let systemReturnSection=null/);
 assert.match(shell,/systemReturnSection=before\.activeSection==='factory'\?'factory':before\.activeSection==='asset'\?'asset':before\.sceneMode==='machine'\?'asset':'factory'/);
 assert.match(shell,/if\(state\.activeSection==='system'\)\{const next=systemReturnSection\|\|\(state\.sceneMode==='machine'\?'asset':'factory'\);setActiveSection\(next\);markSection\(next\)\}/);
});

test('V223 focus restoration rejects hidden stale controls and modal lifecycle restores the origin',()=>{
 assert.match(shell,/!saved\.closest\('\[hidden\]'\)/);
 assert.match(shell,/!saved\.closest\('dialog:not\(\[open\]\)'\)/);
 assert.match(shell,/const firstOpen=getState\(\)\.overlay!=='modal'/);
 assert.match(shell,/if\(firstOpen\)rememberOverlayFocus\('modal'\)/);
 assert.match(shell,/restoreOverlayFocus\('modal'\)/);
});

test('V223 changes service worker bytes so the existing V222 shell URLs are recached',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/const VERSION='factory-digital-twin-v222-overlay-state-ssot-20260925'/);
 assert.match(sw,/const RELEASE='222'/);
});
