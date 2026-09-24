import {initialState,validateLayout,validatePosition} from '../frontend/src/model.js';
import {validateSceneOverrides} from '../frontend/src/scene-editor-state.js';
const MAX_BYTES=4*1024*1024;
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
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,If-Match','Access-Control-Max-Age':'600'}});
  try{
    if(path==='/api/health'&&req.method==='GET')return json({service:'bmj-digitaltwin',ready:!!env.DB&&!!env.ADMIN_TOKEN&&!!env.VIEWER_TOKEN,assets:!!env.ASSETS,sceneEditorReady:!!env.SUPERADMIN_TOKEN&&env.SUPERADMIN_TOKEN!==env.ADMIN_TOKEN&&env.SUPERADMIN_TOKEN!==env.VIEWER_TOKEN},200,cors);
    const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');
    const superadmin=env.SUPERADMIN_TOKEN!==env.ADMIN_TOKEN&&env.SUPERADMIN_TOKEN!==env.VIEWER_TOKEN&&await same(token,env.SUPERADMIN_TOKEN);
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
