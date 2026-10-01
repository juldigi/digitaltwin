import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const worker=readFileSync(new URL('../backend/worker.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V290 backend distinguishes a logged-in bootstrap session from an activated Superadmin session',()=>{
 assert.match(worker,/async function sessionInfo\(db,token\)/);
 assert.match(worker,/superadminSession=env\.DB\?await sessionInfo\(env\.DB,token\):null,superadmin=!!superadminSession,superadminReady=superadmin&&superadminSession\.generation>0/);
 assert.match(worker,/const admin=superadminReady\|\|await same\(token,env\.ADMIN_TOKEN\),viewer=superadmin\|\|admin\|\|await same\(token,env\.VIEWER_TOKEN\)/);
 assert.match(worker,/passwordChangeRequired:superadmin&&!superadminReady/);
 assert.match(worker,/if\(superadmin&&!superadminReady&&req\.method!=='GET'\)return json\(\{error:'Ganti kata sandi Superadmin awal sebelum mengubah data atau scene\.',passwordChangeRequired:true\},428,cors\)/);
 assert.match(worker,/if\(path\.startsWith\('\/api\/scene'\)&&!superadminReady\)/);
});

test('V290 bootstrap login cannot expose Superadmin editing UI before password activation',()=>{
 assert.match(app,/function superadminPasswordDialog\(\{back=settingsDialog,currentPassword='',required=false\}=\{\}\)/);
 assert.match(app,/role=login\.passwordChangeRequired\?null:'superadmin'/);
 assert.match(app,/if\(login\.passwordChangeRequired\)\{superadminPasswordDialog\(\{back,currentPassword,required:true\}\);\}/);
 assert.match(app,/Password awal hanya boleh dipakai untuk aktivasi pertama\. Buat password baru sebelum editor atau data dapat diubah\./);
 assert.match(app,/required\?'Aktifkan Superadmin':'Simpan kata sandi'/);
 assert.doesNotMatch(app,/Masuk berhasil\. Segera ganti kata sandi di Pengaturan\./);
});

test('V290 ordinary connection flow rejects an unactivated bootstrap Superadmin session',()=>{
 assert.match(app,/if\(session\.passwordChangeRequired\)throw new Error\('Sesi Superadmin awal belum diaktifkan\. Gunakan tombol Masuk sebagai Superadmin lalu buat kata sandi baru\.'\)/);
});

test('V290 password activation invalidates the bootstrap session and requires a clean login',()=>{
 assert.match(app,/await request\('\/api\/superadmin\/password',\{method:'POST',data:\{currentPassword:oldPassword,newPassword\}\}\)/);
 assert.match(app,/token='';role=null;updateConnectionTruth\(\);closeModal\(\);toast\('Kata sandi Superadmin tersimpan\. Masuk kembali dengan kata sandi baru\.'\)/);
 assert.match(app,/if\(required\)connectionDialog\(\{back\}\)/);
});
