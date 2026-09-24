import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL('../frontend/'+file,import.meta.url),'utf8');

test('mobile navigation has space for all five buttons and raises the drawer above the scene',()=>{
 const css=read('app-shell-v79.css'),html=read('index.html');
 assert.equal((html.match(/data-mobile-nav="/g)||[]).length,5);
 assert.match(css,/\.mobile-nav\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)\}/);
 assert.match(css,/body\.nav-open \.twin-shell\{z-index:auto;overflow:visible\}/);
});

test('data connection can be opened from the drawer and mobile settings',()=>{
 const html=read('index.html'),shell=read('src/app-shell-v79.js'),app=read('src/app.js');
 assert.match(html,/id="nav-connect"[^>]*>[^<]*<span[^>]*><\/span><small>Sambungkan Data<\/small>/);
 assert.match(shell,/#nav-connect'\)\?\.addEventListener\('click'/);
 assert.match(app,/id="settings-connect"/);
 assert.match(app,/on\('#settings-connect',connectionDialog\)/);
});
