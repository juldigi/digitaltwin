import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('Stage 5 scene editor refreshes continuous transforms incrementally',()=>{
  assert.match(app,/const refreshEditorTransformUi=/);
  assert.match(app,/const scheduleEditorTransformUi=/);
  assert.match(app,/onEditorKeyUp=e=>\{[^}]*refreshEditorTransformUi\(\)/);
  assert.match(app,/onDragEnd=\(\)=>\{if\(selected\)\{overrides\[selected\]=current\(\);refreshEditorTransformUi\(\);\}\}/);
  assert.match(app,/engine\.onSceneTransform=\(\)=>\{if\(selected&&!overrides\[selected\]\?\.locked\)\{overrides\[selected\]=current\(\);scheduleEditorTransformUi\(\);\}\}/);
  assert.match(app,/data-se-size/);
  assert.match(app,/data-se-collision/);
  assert.match(app,/cancelAnimationFrame\(liveEditorUiFrame\)/);
});

test('Stage 5 numeric transform edits avoid full editor rerender',()=>{
  const numeric=app.match(/panel\.querySelectorAll\('\[data-se-key\]'\)[\s\S]*?\}\);/)?.[0]||'';
  assert.match(numeric,/refreshEditorTransformUi\(\)/);
  assert.doesNotMatch(numeric,/apply\(\);update\(\)/);
});
