const encoder=new TextEncoder();

// Cloudflare D1 currently caps a single row/string/BLOB at 2,000,000 bytes.
// Keep headroom for SQLite row encoding and future state fields.
export const D1_STATE_STORAGE_BUDGET=1_800_000;

const byteLength=value=>encoder.encode(value).byteLength;

export function serializeStateForD1(state,{budget=D1_STATE_STORAGE_BUDGET}={}){
 if(!state||typeof state!=='object'||Array.isArray(state))throw Object.assign(new Error('State Digital Twin tidak valid.'),{status:400});
 let payload=JSON.stringify(state),bytes=byteLength(payload),trimmedRevisions=0;
 while(bytes>budget&&Array.isArray(state.sceneRevisions)&&state.sceneRevisions.length){
  state.sceneRevisions=state.sceneRevisions.slice(1);trimmedRevisions++;
  payload=JSON.stringify(state);bytes=byteLength(payload);
 }
 if(bytes>budget)throw Object.assign(new Error('Data Digital Twin terlalu besar untuk disimpan dengan aman. Kurangi objek editor atau ukuran denah lalu coba lagi.'),{status:413,code:'D1_STATE_TOO_LARGE',bytes,budget});
 return {payload,bytes,trimmedRevisions};
}
