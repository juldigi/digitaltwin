import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V155 release cache keys move beyond V149/V151 sources',()=>{
  assert.match(html,/app-shell-v79\.css\?v=168/);
  assert.match(html,/src\/app\.js\?v=174/);
  assert.match(html,/src\/ui-v5\.js\?v=167/);
  assert.match(html,/src\/app-shell-v79\.js\?v=173/);
  assert.doesNotMatch(html,/\?v=149/);
  assert.match(sw,/factory-digital-twin-v174-navigation-selector-hotfix-20260923/);
});

test('custom major overlays expose dialog semantics focus restoration and keyboard containment',()=>{
  assert.match(shell,/setAttribute\('role','dialog'\)/);
  assert.match(shell,/setAttribute\('aria-modal','true'\)/);
  assert.match(shell,/function rememberOverlayFocus/);
  assert.match(shell,/function restoreOverlayFocus/);
  assert.match(shell,/const target=saved\?\.isConnected\?saved:\(fallback\?q\(fallback\):null\)/);
  assert.match(shell,/function trapOverlayFocus/);
  assert.match(shell,/event\.key==='Tab'/);
  assert.match(shell,/event\.key!=='Escape'/);
  assert.match(shell,/aria-activedescendant/);
  assert.match(shell,/if\(overlay==='search'\)closeSearch\(\)/);
  assert.match(shell,/else if\(overlay==='layers'\)closeLayerManager\(\)/);
  assert.match(shell,/else if\(overlay==='navigation'\)closeDrawer\(\)/);
  assert.match(html,/<dialog id="modal" aria-labelledby="modal-title" aria-modal="true">/);
});

test('inspector tabs follow roving tabindex and arrow Home End keyboard behavior',()=>{
  assert.match(html,/role="tablist" aria-label="Bagian detail"/);
  assert.match(html,/aria-controls="panel-content" tabindex="0" data-tab="overview"/);
  assert.match(html,/id="panel-content" class="panel-content" role="tabpanel"/);
  assert.match(shell,/function syncInspectorTabs/);
  assert.match(shell,/ArrowRight/);
  assert.match(shell,/ArrowLeft/);
  assert.match(shell,/event\.key==='Home'/);
  assert.match(shell,/event\.key==='End'/);
});

test('user-facing system workspace no longer exposes implementation jargon',()=>{
  assert.doesNotMatch(shell,/Buka network context|Distribution piping|SYSTEM CONTEXT|Evidence \/ source|Reference \/ template/);
  assert.doesNotMatch(app,/routing scaffold|Consumer network/);
  assert.match(shell,/KONTEKS SISTEM/);
  assert.match(shell,/titik · .*jalur · .*titik peralatan/);
  assert.match(app,/Udara Bertekanan/);
  assert.match(app,/Jalur Utilitas/);
});

test('technical diagnostics live inside Settings System Information and focus is visibly accessible',()=>{
  assert.match(app,/Informasi Sistem/);
  assert.match(app,/Diagnostik teknis ditempatkan di sini agar tampilan utama tetap sederhana/);
  assert.match(app,/pair\('Versi aplikasi','V171'\)/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/prefers-contrast:more/);
});

test('universal search remains broad including documents and photos',()=>{
  assert.match(app,/group:'DOKUMEN'/);
  assert.match(app,/group:'FOTO'/);
  assert.match(app,/searchablePhotos/);
  assert.match(shell,/dokumen, atau foto/);
});
