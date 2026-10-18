import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const embed = readFileSync(new URL('../frontend/src/omodos-status-embed.js', import.meta.url), 'utf8');

test('OMODOS status viewer is opt-in and only accepts the authenticated OMODOS parent origin', () => {
  assert.match(html, /src="\.\/src\/omodos-status-embed\.js\?v=1"/);
  assert.match(embed, /new URLSearchParams\(location\.search\)\.get\('embed'\) !== EMBED_KEY/);
  assert.match(embed, /ALLOWED_PARENT_ORIGINS = new Set\(\['https:\/\/omodos\.juldigi\.workers\.dev'\]\)/);
  assert.match(embed, /ALLOWED_PARENT_ORIGINS\.has\(event\.origin\)/);
  assert.match(embed, /payload\.type!=='OMODOS_FACTORY_STATUS'/);
});

test('embedded overview hides roof, walls, building envelope, and IPAL structure', () => {
  assert.match(embed, /const policy=\{building:false,ipal:false,floor:true,walls:false,doors:false,windows:false,air_curtain:false,furniture:false,roof:false/);
  assert.match(embed, /engine\.setFactoryLayer\(key,visible\)/);
  assert.match(embed, /const assetRoots=new Set\(\[\.\.\.engine\.actualFactory\.assets\.values\(\)\]\)/);
  assert.match(embed, /if\(!assetRoots\.has\(child\)\)child\.visible=false/);
});

test('embedded overview disables machine-detail selection and avoids repeated policy writes', () => {
  assert.match(embed, /engine\.onFactorySelect=\(\)=>\{\}/);
  assert.match(embed, /if\(rootChanged\|\|!state\.policyApplied\)/);
  assert.doesNotMatch(embed, /if\(rootChanged\|\|now-state\.lastPolicyAt>900\)/);
  assert.match(embed, /if\(firstAuthorization\)state\.policyApplied=false/);
});

test('every visible registry machine gets a status card and ambiguous codes do not map silently', () => {
  assert.match(embed, /for\(const machine of state\.registry\)/);
  assert.match(embed, /const card=ensureCard\(entry\.machine\)/);
  assert.match(embed, /codeTargets\.length===1&&codeTargets\[0\]\.machineId===machine\.machineId/);
  assert.match(embed, /exactTargets\.length===1&&exactTargets\[0\]\.machineId===machine\.machineId/);
  assert.match(embed, /critical\|kritikal/);
  assert.match(embed, /s==='belum ada data'.*return 'unknown'/);
});
