import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const state=await readFile(new URL('../frontend/src/scene-editor-state.js',import.meta.url),'utf8');
const css=await readFile(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');

test('scene editor uses a reversible isolation guard instead of destructive visibility writes',()=>{
 assert.match(app,/createSceneIsolationGuard/);
 assert.match(app,/isolationGuard\.restore\(\)/);
 assert.match(app,/const isolationBoundary=\(\)=>editorScope==='machine'\?engine\.machine:engine\.factory/);
 assert.doesNotMatch(app,/while\(node\?\.parent&&node!==engine\.factory\)\{for\(const sibling/);
 assert.match(state,/export function createSceneIsolationGuard/);
});

test('scene editor cannot open duplicate floating panels',()=>{
 assert.match(app,/document\.querySelector\('#scene-editor-panel'\)/);
 assert.match(app,/Editor Scene 3D sudah terbuka/);
});

test('scene save and revision restore clear transient isolation before replaying persisted state',()=>{
 const save=app.indexOf("panel.querySelector('#se-save')");
 const restore=app.indexOf("request('/api/scene/restore'");
 assert.ok(save>=0&&restore>=0);
 assert.match(app.slice(save,restore),/isolationGuard\.restore\(\);await acceptState\(next\);applyIsolation\(\)/);
 assert.match(app.slice(restore,restore+1200),/isolationGuard\.restore\(\);await acceptState\(next\)/);
});

test('removed generated selections detach the gizmo instead of leaving an orphan transform target',()=>{
 assert.match(app,/!engine\.sceneObjects\.has\(selected\)\)\{engine\.gizmo\.detach\(\);if\(selected\.startsWith\('copy:'\)\|\|selected\.startsWith\('new:'\)\)selected=null/);
});


test('scene editor layout is responsive and leaves canonical navigation reachable',()=>{
 assert.doesNotMatch(app,/z-index:10000/);
 assert.doesNotMatch(app,/panel\.style\.cssText/);
 assert.match(css,/#scene-editor-panel\{[\s\S]*?z-index:78/);
 assert.match(css,/@media\(max-width:767px\)\{[\s\S]*?#scene-editor-panel\{[\s\S]*?bottom:calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/@media\(max-height:560px\) and \(orientation:landscape\)\{[\s\S]*?#scene-editor-panel/);
 assert.match(css,/#scene-editor-panel \.se-nudge\{display:grid/);
});
