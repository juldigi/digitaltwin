import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const worker=readFileSync(new URL('../backend/worker.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V285 bootstrap Superadmin sessions are explicitly restricted until password change',()=>{
 assert.match(worker,/async function superadminSession\(db,token\)/);
 assert.match(worker,/passwordChangeRequired=superadmin&&superadminSessionInfo\.generation===0/);
 assert.match(worker,/admin=tokenAdmin\|\|\(superadmin&&!passwordChangeRequired\)/);
 assert.match(worker,/Ganti kata sandi awal Superadmin sebelum mengubah scene/);
 assert.match(worker,/Ganti kata sandi awal Superadmin sebelum membuka riwayat scene/);
 assert.match(worker,/passwordChangeRequired\},200,cors/);
});

test('V285 frontend immediately routes bootstrap sessions to a forced password-change flow',()=>{
 assert.match(app,/let state,engine,apiBase='',token='',role=null,superadminPasswordChangeRequired=false/);
 assert.match(app,/function superadminPasswordDialog\(\{forced=false,back=settingsDialog\}=\{\}\)/);
 assert.match(app,/Sesi Superadmin pertama hanya dapat membaca data sampai kata sandi awal diganti/);
 assert.match(app,/superadminPasswordChangeRequired=Boolean\(login\.passwordChangeRequired\)/);
 assert.match(app,/if\(superadminPasswordChangeRequired\)\{toast\('Masuk berhasil\. Ganti kata sandi awal untuk mengaktifkan alat Superadmin\.'/);
 assert.match(app,/if\(role==='superadmin'&&superadminPasswordChangeRequired\)\{superadminPasswordDialog\(\{forced:true\}\)/);
 assert.match(app,/Ganti kata sandi awal sebelum alat edit Superadmin diaktifkan/);
});

test('V285 successful password change clears restricted state and invalidates the bootstrap session locally',()=>{
 assert.match(app,/await request\('\/api\/superadmin\/password'/);
 assert.match(app,/superadminPasswordChangeRequired=false;token='';role=null/);
 assert.match(app,/Kata sandi tersimpan\. Masuk kembali dengan kata sandi baru\./);
});
