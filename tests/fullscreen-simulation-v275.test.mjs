import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const app=read('../frontend/src/app.js');
const css=read('../frontend/app-shell-v79.css');

test('V275 entering immersive mode does not retrigger 3D navigation when already in 3D',()=>{
 assert.match(app,/if\(getAppState\(\)\.viewMode==='2d'&&!\$\('#mode-3d'\)\?\.disabled\)\$\('#mode-3d'\)\?\.click\(\);/);
 assert.doesNotMatch(app,/if\(!\$\('#mode-3d'\)\?\.disabled\)\$\('#mode-3d'\)\?\.click\(\);/);
});

test('V275 immersive mode keeps the canvas clean but restores compact simulation transport when relevant',()=>{
 assert.match(css,/html\.immersive-mode \.scene-heading>div[\s\S]*?html\.immersive-mode \.mobile-nav\{display:none!important\}/);
 assert.doesNotMatch(css,/html\.immersive-mode \.mobile-nav,html\.immersive-mode \.canonical-simulation-transport\{display:none!important\}/);
 assert.match(css,/html\.immersive-mode body\.simulation-transport-open \.canonical-simulation-transport\{[\s\S]*?display:grid!important[\s\S]*?width:min\(560px,calc\(100vw - 24px\)\)/);
 assert.match(css,/html\.immersive-mode body\.simulation-transport-open \.canonical-simulation-transport progress\{display:none!important\}/);
 assert.match(css,/@media\(max-width:767px\)\{[\s\S]*?html\.immersive-mode body\.simulation-transport-open \.canonical-simulation-transport\{[\s\S]*?bottom:max\(8px,env\(safe-area-inset-bottom\)\)/);
});
