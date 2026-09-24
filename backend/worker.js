import {initialState,validateLayout,validatePosition} from '../frontend/src/model.js';
import {validateSceneOverrides} from '../frontend/src/scene-editor-state.js';
const MAX_BYTES=4*1024*1024;
const DEFAULT_PASSWORD='superadmin123';
const PASSWORD_ITERATIONS=100000;
const PASSWORD_RECORD_PREFIX='pbkdf2-sha256';
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function passwordHash(password,salt,iterations=PASSWORD_ITERATIONS){
  if(!Number.isInteger(iterations)||iterations<1||iterations>PASSWORD_ITERATIONS)throw new Error('Parameter PBKDF2 tidak didukung runtime.');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations,hash:'SHA-256'},key,256))).map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function passwordRecord(password,salt){return `${PASSWORD_RECORD_PREFIX}:${PASSWORD_ITERATIONS}:${await passwordHash(password,salt)}`;}
function parsePasswordRecord(record){
  const match=new RegExp('^'+PASSWORD_RECORD_PREFIX+':(\\d+):([a-f0-9]{64})$','i').exec(String(record||''));
  if(match)return {iterations:Number(match[1]),hash:match[2],legacy:false};
  return /^[a-f0-9]{64}$/i.test(String(record||''))?{iterations:150000,hash:String(record),legacy:true}:null;
}
async function verifyPassword(password,account){
  const record=parsePasswordRecord(account?.password_hash);
  if(!record)return {ok:false,unsupported:false};
  if(record.iterations>PASSWORD_ITERATIONS)return {ok:false,unsupported:true};
  return {ok:await same(await passwordHash(password,account.salt,record.iterations),record.hash),unsupported:false};
}
async function authStore(db){
  await db.prepare('CREATE TABLE IF NOT EXISTS superadmin_auth (id INTEGER PRIMARY KEY CHECK(id = 1), salt TEXT NOT NULL, password_hash TEXT NOT NULL, generation INTEGER NOT NULL DEFAULT 0)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS superadmin_sessions (token_hash TEXT PRIMARY KEY, generation INTEGER NOT NULL, expires INTEGER NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS superadmin_attempts (client_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)').run();
  let account=await db.prepare('SELECT salt,password_hash,generation FROM superadmin_auth WHERE id = 1').first();
  if(!account){
    const salt=crypto.randomUUID(),hash=await passwordRecord(DEFAULT_PASSWORD,salt);
    await db.prepare('INSERT OR IGNORE INTO superadmin_auth(id,salt,password_hash,generation) VALUES(1,?,?,0)').bind(salt,hash).run();
    account=await db.prepare('SELECT salt,password_hash,generation FROM superadmin_auth WHERE id = 1').first();
  }else if(account.generation===0&&parsePasswordRecord(account.password_hash)?.legacy){
    const salt=crypto.randomUUID(),hash=await passwordRecord(DEFAULT_PASSWORD,salt);
    await db.prepare('UPDATE superadmin_auth SET salt=?,password_hash=? WHERE id=1 AND generation=0').bind(salt,hash).run();
    account={...account,salt,password_hash:hash};
  }
  return account;
}
async function sessionRole(db,token){if(!token?.startsWith('sa_'))return false;const row=await db.prepare('SELECT s.expires FROM superadmin_sessions s JOIN superadmin_auth a ON a.generation=s.generation WHERE s.token_hash=?').bind(await digest(token)).first();return !!row&&row.expires>Date.now();}
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function same(a,b){
  if(!a||!b) return false;
  const enc=new TextEncoder(),hash=async x=>new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(x)));
  const [x,y]=await Promise.all([hash(a),hash(b)]);let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0;
}
async function body(req){
  if(!req.headers.get('content-type')?.startsWith('application/json')) throw Object.assign(new Error('Gunakan application/json.'),{status:415});
  const reader=req.body?.getReader();if(!reader)throw new Error('Isi permintaan kosong.');
  let n=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>MAX_BYTES){await reader.cancel();throw Object.assign(new Error('Data terlalu besar; batas 4 MiB.'),{status:413});}chunks.push(value);}
  const merged=new Uint8Array(n);let offset=0;for(const c of chunks){merged.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(merged));
}
export default {async fetch(req,env){
  const url=new URL(req.url),path=url.pathname;
  if(!path.startsWith('/api/')){
    if(!env.ASSETS)return new Response('Static assets belum terhubung.',{status:503});
    return env.ASSETS.fetch(req);
  }
  const origin=req.headers.get('Origin'),allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
  const sameOrigin=!origin||origin===url.origin;
  const cors=origin&&(sameOrigin||allowed.includes(origin))?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};
  if(origin&&!sameOrigin&&!allowed.includes(origin))return json({error:'Origin tidak diizinkan.'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,If-Match','Access-Control-Max-Age':'600'}});
  try{
    if(path==='/api/health'&&req.method==='GET')return json({service:'bmj-digitaltwin',ready:!!env.DB&&!!env.ADMIN_TOKEN&&!!env.VIEWER_TOKEN,assets:!!env.ASSETS,sceneEditorReady:!!env.DB},200,cors);
    const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');
    if(path==='/api/superadmin/login'&&req.method==='POST'){
      if(!env.DB)return json({error:'Database D1 belum terhubung.'},503,cors);
      const account=await authStore(env.DB);
      const client=await digest((req.headers.get('CF-Connecting-IP')||'unknown')+'|'+(env.ADMIN_TOKEN||''));
      const attempt=await env.DB.prepare('SELECT count,reset_at FROM superadmin_attempts WHERE client_hash=?').bind(client).first();
      if(attempt?.count>=5&&attempt.reset_at>Date.now())return json({error:'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'},429,cors);
      const data=await body(req),verification=typeof data.password==='string'?await verifyPassword(data.password,account):{ok:false,unsupported:false};
      if(verification.unsupported)return json({error:'Hash kata sandi Superadmin memakai parameter PBKDF2 lama yang tidak didukung runtime saat ini. Akun awal akan dimigrasikan otomatis; akun yang kata sandinya pernah diubah perlu di-reset oleh administrator.'},409,cors);
      if(!verification.ok){
        await env.DB.prepare('INSERT INTO superadmin_attempts(client_hash,count,reset_at) VALUES(?,1,?) ON CONFLICT(client_hash) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END').bind(client,Date.now()+900000,Date.now(),Date.now()).run();
        return json({error:'Kata sandi salah.'},401,cors);
      }
      await env.DB.prepare('DELETE FROM superadmin_attempts WHERE client_hash=?').bind(client).run();
      const session='sa_'+crypto.randomUUID()+crypto.randomUUID();
      await env.DB.prepare('INSERT INTO superadmin_sessions(token_hash,generation,expires) VALUES(?,?,?)').bind(await digest(session),account.generation,Date.now()+8*3600000).run();
      return json({token:session,role:'superadmin',passwordChangeRequired:account.generation===0},200,cors);
    }
    const superadmin=!!env.DB&&await sessionRole(env.DB,token);
    if(path==='/api/superadmin/password'&&req.method==='POST'){
      if(!superadmin)return json({error:'Sesi Superadmin tidak valid. Masuk kembali.'},401,cors);
      const data=await body(req),account=await authStore(env.DB),verification=typeof data.currentPassword==='string'?await verifyPassword(data.currentPassword,account):{ok:false,unsupported:false};
      if(verification.unsupported)return json({error:'Hash kata sandi lama memakai PBKDF2 legacy yang tidak didukung runtime saat ini.'},409,cors);
      if(!verification.ok)return json({error:'Kata sandi lama salah.'},403,cors);
      if(typeof data.newPassword!=='string'||data.newPassword.length<12||data.newPassword.length>128||data.newPassword===DEFAULT_PASSWORD)return json({error:'Kata sandi baru minimal 12 karakter dan berbeda dari kata sandi awal.'},400,cors);
      const salt=crypto.randomUUID(),hash=await passwordRecord(data.newPassword,salt);
      await env.DB.prepare('UPDATE superadmin_auth SET salt=?,password_hash=?,generation=generation+1 WHERE id=1').bind(salt,hash).run();
      await env.DB.prepare('DELETE FROM superadmin_sessions').run();
      return json({changed:true},200,cors);
    }
    const admin=superadmin||await same(token,env.ADMIN_TOKEN),viewer=admin||await same(token,env.VIEWER_TOKEN);
    if(!viewer)return json({error:'Autentikasi diperlukan.'},401,cors);
    if(path==='/api/session'&&req.method==='GET')return json({role:superadmin?'superadmin':admin?'admin':'viewer'},200,cors);
    if(!env.DB)return json({error:'Database D1 belum terhubung.'},503,cors);
    const row=await env.DB.prepare('SELECT data, revision FROM twin_state WHERE id = 1').first();
    let state=row?JSON.parse(row.data):structuredClone(initialState);state.revision=row?.revision??0;
    if(path==='/api/state'&&req.method==='GET'){
      if(!superadmin){const {sceneRevisions,...publicState}=state;return json(publicState,200,cors);}
      return json(state,200,cors);
    }
    if(path==='/api/scene/revisions'&&req.method==='GET')return superadmin?json({revisions:state.sceneRevisions||[]},200,cors):json({error:'Riwayat scene hanya untuk Superadmin.'},403,cors);
    if(path==='/api/scene'&&req.method==='GET')return json({overrides:state.sceneOverrides||{},revision:state.revision},200,cors);
    if(path.startsWith('/api/scene')&&!superadmin)return json({error:'Hanya Superadmin yang dapat mengubah scene.'},403,cors);
    if(!admin)return json({error:'Hanya administrator yang dapat mengubah data.'},403,cors);
    if(!['/api/position','/api/layout','/api/scene','/api/scene/restore'].includes(path))return json({error:'Endpoint tidak ditemukan.'},404,cors);
    if(!['PUT','DELETE'].includes(req.method))return json({error:'Metode tidak diizinkan.'},405,cors);
    if(req.headers.get('If-Match')!==String(state.revision))return json({error:'Data berubah. Muat ulang sebelum menyimpan.'},409,cors);
    const data=req.method==='PUT'?await body(req):null;
    if(path==='/api/scene'||path==='/api/scene/restore'){
      const previous=state.sceneOverrides||{};
      if(path==='/api/scene/restore'){
        const entry=(state.sceneRevisions||[]).find(item=>item.id===data?.id);
        if(!entry)throw new Error('Revisi tidak ditemukan.');
        state.sceneOverrides=entry.overrides;
      }else{
        state.sceneOverrides=validateSceneOverrides(data?.overrides);
      }
      state.sceneRevisions=[...(state.sceneRevisions||[]),{id:crypto.randomUUID(),at:new Date().toISOString(),by:'Superadmin',objects:Object.keys(previous).length,overrides:previous}].slice(-10);
    }else if(path==='/api/position'){
      if(req.method==='DELETE'){Object.assign(state.asset,{layout_x:null,layout_y:null,layout_z:null,rotation:null,scale:null,positionConfidence:'UNKNOWN'});}
      else{
        if(!state.layout)throw new Error('DWG layout harus tersedia sebelum posisi disimpan.');
        const p=validatePosition(data);
        Object.assign(state.asset,{layout_x:p.x,layout_y:p.y,layout_z:p.z,rotation:p.rotation,scale:p.scale,positionConfidence:p.confidence,last_updated:new Date().toISOString()});
      }
    }else{
      state.layout=req.method==='DELETE'?null:validateLayout(data);
      Object.assign(state.asset,{layout_x:null,layout_y:null,layout_z:null,rotation:null,scale:null,positionConfidence:'UNKNOWN'});
    }
    const old=state.revision;state.revision++;
    const result=await env.DB.prepare('UPDATE twin_state SET data = ?, revision = ? WHERE id = 1 AND revision = ?').bind(JSON.stringify(state),state.revision,old).run();
    if(!result.meta.changes)return json({error:'Konflik revisi atau migrasi database belum dijalankan.'},409,cors);
    return json(state,200,cors);
  }catch(e){return json({error:e instanceof SyntaxError?'JSON tidak valid.':e.message||'Permintaan gagal.'},e.status||400,cors);}
}};
