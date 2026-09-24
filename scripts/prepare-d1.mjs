import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const configPath=resolve(dirname(fileURLToPath(import.meta.url)),'../backend/wrangler.toml');
const name='digitaltwin-db';

export async function prepareD1({accountId,token,databaseId,fetcher=fetch,config=configPath}={}){
 if(!accountId||!token)throw new Error('Cloudflare account ID dan API token diperlukan untuk D1.');
 const endpoint=`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database`;
 const call=async(method,url,payload)=>{
  const response=await fetcher(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:payload?JSON.stringify(payload):undefined});
  const data=await response.json();
  if(!response.ok||!data.success)throw new Error(`D1 ${method} gagal: ${data.errors?.map(item=>item.message).join('; ')||response.status}. Pastikan API token memiliki izin D1 Read dan D1 Write.`);
  return data.result;
 };
 let id=databaseId;
 if(!id){
  const databases=await call('GET',`${endpoint}?name=${encodeURIComponent(name)}&per_page=10`);
  const existing=databases.find(item=>item.name===name);
  id=existing?.uuid||existing?.id;
  if(!id){const created=await call('POST',endpoint,{name,primary_location_hint:'apac'});id=created.uuid||created.id;}
 }
 if(!/^[a-f0-9-]{36}$/i.test(id||''))throw new Error('ID database D1 tidak valid.');
 const current=await readFile(config,'utf8');
 const base=current.replace(/\n\[\[d1_databases\]\][\s\S]*$/,'').trimEnd();
 await writeFile(config,`${base}\n\n[[d1_databases]]\nbinding = "DB"\ndatabase_name = "${name}"\ndatabase_id = "${id}"\nmigrations_dir = "migrations"\n`);
 console.log(`D1 ${name} disiapkan dengan binding DB.`);
 return id;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 prepareD1({accountId:process.env.CLOUDFLARE_ACCOUNT_ID,token:process.env.CLOUDFLARE_API_TOKEN,databaseId:process.env.CLOUDFLARE_D1_DATABASE_ID}).catch(error=>{console.error(error.message);process.exitCode=1;});
}
