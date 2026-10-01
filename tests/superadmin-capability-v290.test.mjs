import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V290 shared-data mutation capability excludes unactivated Superadmin sessions',()=>{
 assert.match(app,/const canMutateSharedData=\(\)=>role==='admin'\|\|role==='superadmin'&&!superadminPasswordChangeRequired/);
 assert.match(app,/const adminTools=canMutateSharedData\(\)\?/);
 assert.match(app,/if\(canMutateSharedData\(\)\)on\('#mapping',mappingDialog\)/);
 assert.doesNotMatch(app,/const adminTools=\(role==='admin'\|\|role==='superadmin'\)\?/);
});

test('V290 direct mapping entry routes restricted Superadmin back to mandatory password activation',()=>{
 assert.match(app,/if\(role==='superadmin'&&superadminPasswordChangeRequired\)\{superadminPasswordDialog\(\{forced:true\}\);toast\('Ganti kata sandi awal sebelum mengubah denah\.'/);
 assert.match(app,/if\(!canMutateSharedData\(\)\)\{toast\('Pengaturan denah memerlukan izin pengaturan\.'/);
});

test('V290 first-login copy matches the automatic activation flow',()=>{
 assert.match(app,/Pada aktivasi pertama, sistem akan langsung meminta kata sandi baru sebelum alat pengeditan dapat digunakan/);
 assert.doesNotMatch(app,/Setelah berhasil masuk pertama kali, segera ganti kata sandi melalui Pengaturan/);
});
