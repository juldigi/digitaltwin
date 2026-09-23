import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const shell=read('../frontend/src/app-shell-v79.js');
const experience=read('../frontend/src/experience-v37.js');
const ui=read('../frontend/src/ui-v5.js');
const html=read('../frontend/index.html');
const sw=read('../frontend/sw.js');

test('detail toggle has exactly one canonical event owner and preserves overlay state',()=>{
 assert.match(shell,/q\('#panel-toggle'\)\?\.addEventListener\('click',toggleInspector\)/);
 assert.match(shell,/function openInspector\([\s\S]*?beforeMajorOverlay\('inspector'\)[\s\S]*?setInspector\(true,tab\);openOverlay\('inspector'\)/);
 assert.match(shell,/function toggleInspector\(\)[\s\S]*?openInspector\(\)/);
 assert.match(shell,/function toggleInspector\(\)[\s\S]*?closeInspector\(\)/);
 assert.doesNotMatch(ui,/\$\('#panel-toggle'\)\?\.addEventListener/);
});

test('theme click changes DOM, aria state and saved preference from the same resulting value',()=>{
 assert.match(experience,/const light=document\.body\.classList\.toggle\('light-mode'\)/);
 assert.match(experience,/toggle\.setAttribute\('aria-pressed',String\(light\)\)/);
 assert.match(experience,/localStorage\.setItem\('offset5-theme',light\?'light':'dark'\)/);
 assert.doesNotMatch(ui,/\$\('#ui-theme-toggle'\)\?\.addEventListener/);
});

test('changed controllers have fresh page and service worker cache identifiers',()=>{
 assert.match(html,/src\/experience-v37\.js\?v=164/);
 assert.match(html,/src\/app-shell-v79\.js\?v=187/);
 assert.match(sw,/factory-digital-twin-v187-simulation-contract-hardening-20260923/);
});
