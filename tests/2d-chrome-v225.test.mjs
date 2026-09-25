import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const css=readFileSync(resolve('frontend/app-shell-v79.css'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

test('V225 removes duplicate 2D headings and residual 3D chrome',()=>{
 assert.match(css,/\.workspace-2d \.plant-plan-2d>header\{display:none!important\}/);
 assert.match(css,/\.workspace-2d \.scene-bottom,[\s\S]*?\.workspace-2d \.viewport-zoom\{display:none!important\}/);
 assert.match(css,/\.workspace-2d \.scene-heading\{z-index:12\}/);
});

test('V225 keeps 2D status text clear of mobile navigation and landscape rail',()=>{
 assert.match(css,/\.workspace-2d \.plant-plan-2d \.dwg-warning\{[\s\S]*?bottom:calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/@media\(max-width:767px\) and \(max-height:560px\) and \(orientation:landscape\)[\s\S]*?right:76px;bottom:8px/);
 assert.match(css,/body:not\(\.panel-hidden\)\.workspace-2d \.plant-plan-2d \.dwg-warning\{visibility:hidden!important\}/);
});

test('V225 synchronizes 2D semantics with the visible surfaces',()=>{
 assert.match(shell,/if\(plan\)\{plan\.hidden=!is2d;plan\.setAttribute\('aria-hidden',String\(!is2d\)\)\}/);
 assert.match(shell,/if\(sceneToolbar\)sceneToolbar\.setAttribute\('aria-hidden',String\(is2d\)\)/);
 assert.match(shell,/if\(zoom\)zoom\.setAttribute\('aria-hidden',String\(is2d\)\)/);
 assert.match(shell,/workspace\.setAttribute\('aria-label',is2d\?'Denah dua dimensi pabrik':'Tampilan tiga dimensi'\)/);
});

test('V225 refreshes shell bytes without rotating the V222 cache contract',()=>{
 assert.match(sw,/V225 2D chrome consolidation/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
