import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const css=readFileSync(resolve('frontend/app-shell-v79.css'),'utf8');
const state=readFileSync(resolve('frontend/src/state/app-state.js'),'utf8');

test('V222 derives overlay body classes from app state',()=>{
 assert.match(shell,/const OVERLAY_BODY_CLASS=Object\.freeze\(\{navigation:'nav-open',search:'search-open',layers:'layer-open',systems:'system-open',modal:'modal-open'\}\)/);
 assert.match(shell,/function syncOverlayDom\(state=getState\(\)\)/);
 assert.match(shell,/document\.body\.classList\.toggle\(className,active===name\)/);
 assert.match(shell,/subscribe\(state=>\{applyInspectorDom\(state\);[\s\S]*syncOverlayDom\(state\)\}\)/);
});

test('V222 never leaves hidden navigation overlay state after dismissing the drawer',()=>{
 assert.match(shell,/else if\(overlay==='navigation'\)closeDrawer\(\)/);
 assert.match(shell,/if\(overlay==='navigation'\)closeOverlay\(\)/);
 assert.match(shell,/const wasNavigation=getState\(\)\.overlay==='navigation';closeDrawer\(\);if\(wasNavigation\)closeOverlay\(\)/);
});

test('V222 modal lifecycle is reconciled without a second page backdrop',()=>{
 assert.match(shell,/modalElement\?\.addEventListener\('close',\(\)=>\{if\(getState\(\)\.overlay==='modal'\)closeOverlay\(\);restoreOverlayFocus\('modal'\)\}\)/);
 assert.match(css,/body\.modal-open \.ui-backdrop\{display:none!important\}/);
 assert.match(css,/body\.modal-open \.mobile-nav\{visibility:hidden!important;pointer-events:none!important\}/);
});

test('V222 build identity is coherent',()=>{
 assert.match(state,/APP_BUILD='2026\.09\.25-222'/);
});
