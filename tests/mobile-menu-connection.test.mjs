import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL('../frontend/'+file,import.meta.url),'utf8');

test('mobile navigation exposes only the three primary domains plus More',()=>{
 const css=read('app-shell-v79.css'),html=read('index.html');
 assert.equal((html.match(/data-mobile-nav="/g)||[]).length,4);
 assert.doesNotMatch(html,/data-mobile-nav="simulation"/);
 assert.match(css,/\.mobile-nav\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important\}/);
 assert.match(css,/body\.nav-open \.twin-shell\{z-index:auto;overflow:visible\}/);
});

test('data connection has one user-facing entry inside Settings',()=>{
 const html=read('index.html'),app=read('src/app.js');
 assert.doesNotMatch(html,/id="nav-connect"/);
 assert.doesNotMatch(html,/id="connect" class="quiet"/);
 assert.match(app,/id="settings-connect"/);
 assert.match(app,/on\('#settings-connect',connectionDialog\)/);
});
