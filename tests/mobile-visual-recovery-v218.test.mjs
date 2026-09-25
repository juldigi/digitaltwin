import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('overlay panels render above the dimmer and 2D controls yield to them',()=>{
 assert.match(css,/body\.layer-open \.ui-backdrop,body\.system-open \.ui-backdrop,[\s\S]*?z-index:88!important/);
 assert.match(css,/body\.layer-open \.canonical-layer-manager,body\.system-open \.canonical-layer-manager,[\s\S]*?z-index:120!important/);
 assert.match(css,/body\.layer-open \.viewport-mode-switch,[\s\S]*?visibility:hidden!important;pointer-events:none!important/);
});

test('mobile render resolution never substitutes factory geometry on a normal phone',()=>{
 assert.match(engine,/this\.capabilities\?\.memory<=2\?buildLowDetailFactory/);
 assert.doesNotMatch(engine,/this\.low\?buildLowDetailFactory/);
});
