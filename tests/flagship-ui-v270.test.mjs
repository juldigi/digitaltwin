import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const css=read('../frontend/flagship-v270.css');
const state=read('../frontend/src/state/app-state.js');
const experience=read('../frontend/src/experience-v37.js');
const app=read('../frontend/src/app.js');
const sw=read('../frontend/sw.js');

test('V270 loads one final flagship layer after the canonical shell',()=>{
 const shellIndex=html.indexOf('app-shell-v79.css?v=273');
 const flagshipIndex=html.indexOf('flagship-v270.css?v=273');
 assert.ok(shellIndex>=0,'canonical shell missing');
 assert.ok(flagshipIndex>shellIndex,'flagship layer must load after canonical shell');
 assert.match(html,/<body class="panel-hidden ui-simple light-mode">/);
 assert.match(html,/<meta name="theme-color" content="#f3f7fb">/);
 assert.match(html,/id="theme-bootstrap"/);
 assert.match(html,/bmj-digitaltwin-theme/);
 assert.match(html,/document\.documentElement\.dataset\.theme=theme/);
});

test('V270 design system covers primary surfaces and both real themes',()=>{
 for(const token of [
  '--f270-bg','--f270-surface','--f270-text','--f270-line','--f270-blue',
  '--f270-shadow-1','--f270-shadow-2','--f270-shadow-3','--f270-radius-xl'
 ])assert.ok(css.includes(token),token);
 assert.match(css,/body\.light-mode\{/);
 assert.match(css,/body:not\(\.light-mode\),html\[data-theme="dark"\] body\{/);
 for(const surface of [
  '.topbar','.rail','.scene-heading>div','aside#detail-panel','dialog#modal',
  '.canonical-simulation-transport','#scene-editor-panel','.mobile-nav',
  '.asset-browser-row','.compact-part-row','.context-reference-card','.reference-truth-row',
  '.canonical-layer-group','.quality-device-recommendation','.settings-section','.help-grid>section',
  '.simulation-mode-field','.exterior-area-button','.static-machine-fallback'
 ])assert.ok(css.includes(surface),surface);
 const opens=[...css].filter(c=>c==='{').length,closes=[...css].filter(c=>c==='}').length;
 assert.equal(opens,closes,'flagship CSS braces must stay balanced');
});

test('V270 makes touch, focus, motion and contrast preferences first-class',()=>{
 assert.match(css,/@media\(pointer:coarse\)/);
 assert.match(css,/min-height:44px/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(prefers-contrast:more\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(css,/@supports not \(backdrop-filter:blur\(1px\)\)/);
 assert.match(css,/body\.ui-performance-lite/);
});

test('V270 theme preference starts from the visible light shell and preserves stored user choice',()=>{
 assert.match(state,/APP_BUILD='2026\.09\.30-270'/);
 assert.match(state,/preferences:\{theme:'light',lowDetail:false,visualQuality:'auto'\}/);
 assert.match(state,/value===null\?fallback:\(value==='light'\?'light':'dark'\)/);
 assert.match(state,/theme:readStoredPreference\('theme','light'\)/);
 assert.match(experience,/document\.body\.classList\.toggle\('ui-performance-lite',Boolean\(state\.preferences\?\.lowDetail\|\|state\.preferences\?\.visualQuality==='hemat'\)\)/);
 assert.match(experience,/document\.documentElement\.style\.colorScheme=light\?'light':'dark'/);
 assert.match(experience,/themeMeta\.content=light\?'#f3f7fb':'#07111c'/);
 assert.match(experience,/setAttribute\('aria-label',light\?'Gunakan tema gelap':'Gunakan tema terang'\)/);
});

test('V270 modal, confirmation and toast interaction states are accessible and polished',()=>{
 assert.match(app,/el\.setAttribute\('role',error\?'alert':'status'\)/);
 assert.match(app,/el\.setAttribute\('aria-live',error\?'assertive':'polite'\)/);
 assert.match(app,/modalBody\.scrollTop=0/);
 assert.match(app,/modalBody\.querySelector\('input:not\(\[disabled\]\),select:not\(\[disabled\]\),textarea:not\(\[disabled\]\),button:not\(\[disabled\]\)'\)/);
 assert.match(app,/target\?\.focus\(\{preventScroll:true\}\)/);
 assert.match(app,/function confirmAction\(/);
 assert.match(app,/flagship-confirm/);
 assert.match(app,/await confirmAction\('Hapus objek\?'/);
 assert.match(app,/await confirmAction\('Tutup editor tanpa menyimpan\?'/);
 assert.doesNotMatch(app,/\bconfirm\(/);
 assert.match(app,/danger\?'#flagship-confirm-cancel':'#flagship-confirm-ok'/);
 assert.match(css,/\.flagship-confirm-actions/);
 assert.match(css,/\.danger-action/);
});

test('V270 flagship UI is part of the offline shell and public release query uses the current freshness namespace',()=>{
 assert.match(sw,/const VERSION='factory-digital-twin-v273-release-freshness-20261001'/);
 assert.match(sw,/\.\/flagship-v270\.css/);
 assert.match(sw,/const RELEASE='273'/);
});
