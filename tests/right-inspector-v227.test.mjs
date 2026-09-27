import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const app=readFileSync(resolve('frontend/src/app.js'),'utf8');
const css=readFileSync(resolve('frontend/app-shell-v79.css'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

test('V227 inspector visibility is semantic as well as visual',()=>{
 assert.match(shell,/panel\.setAttribute\('aria-hidden',String\(!open\)\)/);
 assert.match(shell,/panel\.inert=!open/);
 assert.match(shell,/panel\.dataset\.presentation=mobile\?'sheet':'sidebar'/);
 assert.match(shell,/else overlayReturnFocus\.delete\('inspector'\)/);
});

test('V227 inspector preserves the original focus owner across repeated opens',()=>{
 assert.match(shell,/const firstOpen=!getState\(\)\.inspectorState\?\.open/);
 assert.match(shell,/if\(firstOpen\)rememberOverlayFocus\('inspector'\)/);
 assert.match(shell,/if\(firstOpen&&matchMedia\('\(max-width:767px\)'\)\.matches\)focusOverlay/);
});

test('V227 keeps header tabs footer fixed and scrolls only panel content',()=>{
 assert.match(css,/V227 right inspector hardening/);
 assert.match(css,/aside#detail-panel\{[\s\S]*?display:flex!important;[\s\S]*?overflow:hidden!important/);
 assert.match(css,/aside#detail-panel #panel-content\{[\s\S]*?flex:1 1 auto!important;[\s\S]*?overflow-y:auto!important/);
 assert.match(css,/aside#detail-panel \.panel-top\{[\s\S]*?position:relative!important/);
 assert.match(css,/aside#detail-panel \.tabs\{[\s\S]*?position:relative!important;[\s\S]*?overflow-x:auto/);
 assert.match(css,/aside#detail-panel \.panel-footer\{[\s\S]*?position:relative!important/);
});

test('V227 has one deliberate inspector presentation per responsive class',()=>{
 assert.match(css,/@media\(min-width:1181px\)[\s\S]*?--v195-panel:clamp\(360px,29vw,430px\)[\s\S]*?aside#detail-panel/);
 assert.match(css,/@media\(min-width:768px\) and \(max-width:1180px\)[\s\S]*?width:min\(410px,48vw\)!important/);
 assert.match(css,/@media\(max-width:767px\) and \(orientation:portrait\)[\s\S]*?height:min\(68dvh,640px\)!important/);
 assert.match(css,/@media\(max-width:767px\) and \(max-height:560px\) and \(orientation:landscape\)[\s\S]*?right:76px!important[\s\S]*?width:min\(430px,58vw\)!important/);
});

test('V227 tablet viewport controls stay outside the open right inspector',()=>{
 assert.match(css,/body:not\(\.panel-hidden\) \.scene-heading\{right:calc\(min\(410px,48vw\) \+ 20px\)!important\}/);
 assert.match(css,/body:not\(\.panel-hidden\) \.viewport-mode-switch\{right:calc\(min\(410px,48vw\) \+ 70px\)!important\}/);
 assert.match(css,/body:not\(\.panel-hidden\) \.scene-bottom\{right:calc\(min\(410px,48vw\) \+ 20px\)!important\}/);
});

test('V227 tab changes reset only the content scroll container',()=>{
 assert.match(app,/function scrollInspectorToTabStart\(\)\{[\s\S]*?const content=\$\('#panel-content'\)[\s\S]*?content\.scrollTo\(\{top:0,behavior:'auto'\}\)/);
 assert.doesNotMatch(app,/scrollInspectorToTabStart\(\)[\s\S]{0,300}panel\.scrollTo/);
});

test('V227 refreshes shell bytes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
