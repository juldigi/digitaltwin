import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');
const state=readFileSync(new URL('../frontend/src/state/app-state.js',import.meta.url),'utf8');

test('V273 public entrypoints use one fresh release namespace',()=>{
 for(const asset of ['app-shell-v79.css','flagship-v270.css','src/app.js','src/ui-v5.js','src/experience-v37.js','src/app-shell-v79.js']){
  assert.ok(html.includes(asset+'?v=273'),asset+' is not cache-busted with V273');
 }
 assert.match(html,/bmj-sw-v273-reloaded/);
 assert.doesNotMatch(html,/\?v=222|bmj-sw-v222-reloaded/);
 assert.match(sw,/const RELEASE='273'/);
 assert.match(sw,/const VERSION='factory-digital-twin-v273-release-freshness-20261001'/);
 assert.match(sw,/const LEGACY_VERSION='factory-digital-twin-v270-flagship-ui-20260930'/);
 assert.doesNotMatch(sw,/const RELEASE='222'/);
 assert.match(state,/APP_BUILD='2026\.10\.01-273'/);
});

test('V273 keeps the flagship visual layer filename while rotating only delivery identity',()=>{
 assert.match(html,/flagship-v270\.css\?v=273/);
 assert.match(sw,/\.\/flagship-v270\.css/);
});
