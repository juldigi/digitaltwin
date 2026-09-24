import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {readFileSync} from 'node:fs';import worker from '../backend/worker.js';
const origin='https://juldigi0107.github.io';
function environment(){const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../backend/migrations/0001_initial.sql',import.meta.url),'utf8'));return {ADMIN_TOKEN:'test-admin-not-a-production-secret',VIEWER_TOKEN:'test-viewer-not-a-production-secret',ALLOWED_ORIGINS:origin,DB:{prepare(sql){let args=[];const stmt=sqlite.prepare(sql);return {bind(...a){args=a;return this;},async first(){return stmt.get(...args);},async run(){const r=stmt.run(...args);return{meta:{changes:Number(r.changes)}};}};}},close:()=>sqlite.close()};}
const req=(path,{token='test-admin-not-a-production-secret',method='GET',data,rev='0',from=origin}={})=>new Request('https://worker.test/api/'+path,{method,headers:{Origin:from,Authorization:'Bearer '+token,'Content-Type':'application/json','If-Match':rev},body:data===undefined?undefined:JSON.stringify(data)});
const fixture=()=>({schemaVersion:1,source:{type:'DWG',file:'TEST_ONLY.dwg',sha256:'b'.repeat(64),extractionMethod:'Unit-test synthetic geometry; never shipped as factory'},transform:{sourceUnits:'m',scale:1,originX:0,originY:0,rotation:0},entities:[]});
test('authentication required and origin allowlist enforced',async()=>{const env=environment();assert.equal((await worker.fetch(req('state',{token:''}),env)).status,401);assert.equal((await worker.fetch(req('state',{from:'https://evil.test'}),env)).status,403);env.close();});
test('viewer can read but cannot mutate layout or position',async()=>{const env=environment(),token=env.VIEWER_TOKEN;assert.equal((await worker.fetch(req('state',{token}),env)).status,200);assert.equal((await worker.fetch(req('layout',{token,method:'PUT',data:fixture()}),env)).status,403);env.close();});
test('position cannot be saved before DWG-derived layout exists',async()=>{const env=environment();assert.equal((await worker.fetch(req('position',{method:'PUT',data:{x:0,y:0,z:0,rotation:0,scale:1,confidence:'APPROXIMATE'}}),env)).status,400);env.close();});
test('layout + position persist in SQLite and revision conflicts prevent lost updates',async()=>{const env=environment();let r=await worker.fetch(req('layout',{method:'PUT',data:fixture()}),env);assert.equal(r.status,200);assert.equal((await r.json()).revision,1);r=await worker.fetch(req('position',{method:'PUT',rev:'1',data:{x:125,y:3,z:25,rotation:30,scale:1,confidence:'USER-CONFIRMED'}}),env);assert.equal(r.status,200);const s=await (await worker.fetch(req('state'),env)).json();assert.equal(s.asset.layout_x,125);assert.equal(s.revision,2);assert.equal((await worker.fetch(req('position',{method:'DELETE',rev:'1'}),env)).status,409);assert.equal((await worker.fetch(req('position',{method:'DELETE',rev:'2'}),env)).status,200);const reset=await (await worker.fetch(req('state'),env)).json();assert.equal(reset.asset.layout_x,null);assert.equal(reset.asset.positionConfidence,'UNKNOWN');env.close();});
test('unconfigured DB cannot claim saved data',async()=>{const env=environment();env.DB=null;assert.equal((await worker.fetch(req('state'),env)).status,503);env.close();});
test('invalid JSON is actionable, CORS preflight has allowed headers',async()=>{const env=environment();const request=new Request('https://worker.test/api/layout',{method:'PUT',headers:{Origin:origin,Authorization:'Bearer '+env.ADMIN_TOKEN,'If-Match':'0','Content-Type':'application/json'},body:'{broken'});assert.equal((await worker.fetch(request,env)).status,400);const r=await worker.fetch(new Request('https://worker.test/api/state',{method:'OPTIONS',headers:{Origin:origin}}),env);assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);env.close();});
test('only Superadmin writes validated scene changes; revisions restore the prior scene',async()=>{
 const env=environment(),login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'superadmin123'}}),env);assert.equal(login.status,200,await login.clone().text());const token=(await login.json()).token,object={position:[1,0,2],rotation:[0,0,0],scale:[1,1,1],visible:true};
 assert.equal((await (await worker.fetch(req('session',{token}),env)).json()).role,'superadmin');
 assert.equal((await worker.fetch(req('scene',{method:'PUT',data:{overrides:{'node:0.1':object}}}),env)).status,403);
 assert.equal((await worker.fetch(req('scene',{token,method:'PUT',data:{overrides:{'node:0.1':{...object,scale:[-1,1,1]}}}}),env)).status,400);
 let response=await worker.fetch(req('scene',{token,method:'PUT',data:{overrides:{'node:0.1':object}}}),env);
 assert.equal(response.status,200,await response.clone().text());assert.equal((await response.json()).revision,1);
 assert.equal((await worker.fetch(req('scene',{token,method:'PUT',data:{overrides:{}}}),env)).status,409);
 const history=await (await worker.fetch(req('scene/revisions',{token}),env)).json();
 assert.equal(history.revisions.length,1);assert.deepEqual(history.revisions[0].overrides,{});
 assert.equal((await worker.fetch(req('scene/revisions',{token:env.VIEWER_TOKEN}),env)).status,403);
 assert.equal('sceneRevisions' in await (await worker.fetch(req('state',{token:env.VIEWER_TOKEN}),env)).json(),false);
 response=await worker.fetch(req('scene/restore',{token,method:'PUT',rev:'1',data:{id:history.revisions[0].id}}),env);
 assert.equal(response.status,200);assert.deepEqual((await response.json()).sceneOverrides,{});env.close();
});

test('Superadmin password change invalidates prior sessions and initial password',async()=>{const env=environment();let login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'superadmin123'}}),env);const token=(await login.json()).token;assert.equal((await worker.fetch(req('superadmin/password',{token,method:'POST',data:{currentPassword:'wrong',newPassword:'replacement-strong-password'}}),env)).status,403);assert.equal((await worker.fetch(req('superadmin/password',{token,method:'POST',data:{currentPassword:'superadmin123',newPassword:'replacement-strong-password'}}),env)).status,200);assert.equal((await worker.fetch(req('session',{token}),env)).status,401);assert.equal((await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'superadmin123'}}),env)).status,401);login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'replacement-strong-password'}}),env);assert.equal(login.status,200);env.close();});


test('Superadmin legacy generation-zero password hash migrates under the 100k runtime cap',async()=>{
 const env=environment();
 let login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'superadmin123'}}),env);
 assert.equal(login.status,200,await login.clone().text());
 await env.DB.prepare('UPDATE superadmin_auth SET salt=?,password_hash=?,generation=0 WHERE id=1').bind('legacy-salt','a'.repeat(64)).run();
 login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'superadmin123'}}),env);
 assert.equal(login.status,200,await login.clone().text());
 const row=await env.DB.prepare('SELECT password_hash,generation FROM superadmin_auth WHERE id=1').first();
 assert.equal(row.generation,0);
 assert.match(row.password_hash,/^pbkdf2-sha256:100000:[a-f0-9]{64}$/);
 env.close();
});

test('Superadmin changed-password legacy hashes fail safely instead of requesting unsupported PBKDF2 work',async()=>{
 const env=environment();
 let login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'superadmin123'}}),env);
 assert.equal(login.status,200);
 await env.DB.prepare('UPDATE superadmin_auth SET salt=?,password_hash=?,generation=2 WHERE id=1').bind('legacy-custom-salt','b'.repeat(64)).run();
 login=await worker.fetch(req('superadmin/login',{method:'POST',data:{password:'any-password'}}),env);
 assert.equal(login.status,409);
 assert.match((await login.json()).error,/PBKDF2 lama|PBKDF2 legacy/);
 env.close();
});
