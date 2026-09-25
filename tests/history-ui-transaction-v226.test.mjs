import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const app=readFileSync(resolve('frontend/src/app.js'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

test('V226 browser history requests transient UI cleanup before scene restoration',()=>{
 assert.match(app,/addEventListener\('popstate',\(\)=>\{dispatchEvent\(new CustomEvent\('bmj:historynavigationrequest'\)\);restoreHistoryContext\(\)/);
 assert.match(shell,/addEventListener\('bmj:historynavigationrequest',[\s\S]*?syncOverlayDom\(getState\(\)\)/);
});

test('V226 history cleanup closes overlays without restoring focus into the old context',()=>{
 assert.match(shell,/closeSearch\(\{restoreFocus:false\}\)/);
 assert.match(shell,/closeSystemBrowser\(\{restoreFocus:false\}\)/);
 assert.match(shell,/closeLayerManager\(\{restoreFocus:false\}\)/);
 assert.match(shell,/closeDrawer\(\{restoreFocus:false\}\)/);
 assert.match(shell,/closeInspector\(\{restoreFocus:false\}\)/);
});

test('V226 close helpers can discard stale focus origins',()=>{
 assert.match(shell,/function closeDrawer\(\{restoreFocus=true\}=\{\}\)/);
 assert.match(shell,/else overlayReturnFocus\.delete\('navigation'\)/);
 assert.match(shell,/function closeLayerManager\(\{restoreFocus=true\}=\{\}\)/);
 assert.match(shell,/else overlayReturnFocus\.delete\('layers'\)/);
 assert.match(shell,/function closeSystemBrowser\(\{restoreFocus=true\}=\{\}\)/);
 assert.match(shell,/else overlayReturnFocus\.delete\('systems'\)/);
 assert.match(shell,/function closeSearch\(\{restoreFocus=true\}=\{\}\)/);
 assert.match(shell,/else overlayReturnFocus\.delete\('search'\)/);
});

test('V226 modal history cleanup suppresses focus restoration while closing',()=>{
 assert.match(shell,/let suppressModalFocusRestore=false/);
 assert.match(shell,/suppressModalFocusRestore=true;q\('#modal-close'\)\?\.click\(\);suppressModalFocusRestore=false/);
 assert.match(shell,/if\(!suppressModalFocusRestore\)restoreOverlayFocus\('modal'\)/);
});

test('V226 refreshes shell bytes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/V226 history UI transaction/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
