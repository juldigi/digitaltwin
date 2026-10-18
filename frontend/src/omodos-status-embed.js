const EMBED_KEY = 'omodos-status';
if (new URLSearchParams(location.search).get('embed') !== EMBED_KEY) {
  // No extra imports or UI for regular DigitalTwin sessions.
} else {
  const ALLOWED_PARENT_ORIGINS = new Set(['https://omodos.juldigi.workers.dev']);
  const state = {authorized:false,readySent:false,parentOrigin:null,records:[],recordsVersion:0,registry:[],engine:null,layer:null,cards:new Map(),anchors:new Map(),lastAnchorAt:0,lastPolicyAt:0};
  document.documentElement.classList.add('omodos-status-embed');
  const css = [
    'html.omodos-status-embed,html.omodos-status-embed body{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#edf2f5!important}',
    'html.omodos-status-embed body{position:fixed!important;inset:0!important}',
    'html.omodos-status-embed .app-splash,html.omodos-status-embed .topbar,html.omodos-status-embed #main-navigation,html.omodos-status-embed .rail,html.omodos-status-embed .scene-heading,html.omodos-status-embed #plant-plan-2d,html.omodos-status-embed .viewport-mode-switch,html.omodos-status-embed .viewport-zoom,html.omodos-status-embed .scene-bottom,html.omodos-status-embed .scene-caption,html.omodos-status-embed #detail-panel,html.omodos-status-embed .mobile-nav,html.omodos-status-embed #ui-backdrop,html.omodos-status-embed .statusbar,html.omodos-status-embed #modal,html.omodos-status-embed #toast,html.omodos-status-embed #boot,html.omodos-status-embed #part-label-layer{display:none!important}',
    'html.omodos-status-embed main.twin-shell{display:block!important;position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;grid-template-columns:1fr!important}',
    'html.omodos-status-embed .center-stack{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}',
    'html.omodos-status-embed .workspace{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;border:0!important;border-radius:0!important;box-shadow:none!important}',
    'html.omodos-status-embed #viewport{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#eaf0f3!important}',
    'html.omodos-status-embed #viewport>canvas{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;outline:none!important}',
    '#omodos-status-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;background:#eef3f6;color:#173044;font:500 15px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center}',
    '#omodos-status-gate .gate-card{max-width:420px;padding:24px;border:1px solid #d6e1e8;border-radius:18px;background:#fff;box-shadow:0 15px 45px rgba(22,49,67,.1)}',
    '#omodos-status-gate strong{display:block;margin-bottom:8px;font-size:18px}',
    'html.omodos-status-embed:not(.omodos-status-authorized) #viewport{visibility:hidden!important}',
    '#omodos-status-overlay{position:absolute;inset:0;z-index:30;pointer-events:none;overflow:hidden;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '#omodos-status-badge{position:absolute;left:12px;top:12px;max-width:min(320px,calc(100vw - 24px));padding:9px 12px;border:1px solid rgba(197,211,220,.9);border-radius:12px;background:rgba(255,255,255,.94);box-shadow:0 3px 14px rgba(28,56,74,.1);color:#193548;backdrop-filter:blur(8px)}',
    '#omodos-status-badge strong{display:block;font-size:12px;letter-spacing:.055em;text-transform:uppercase}',
    '#omodos-status-badge span{display:block;margin-top:2px;font-size:10px;color:#607585}',
    '.omodos-machine-status-card{position:absolute;left:0;top:0;width:104px;min-height:39px;transform:translate(-50%,-100%);padding:4px 6px 5px;border:1px solid rgba(190,204,214,.94);border-radius:7px;background:rgba(255,255,255,.95);box-shadow:0 2px 8px rgba(26,51,67,.14);color:#203c4f;text-align:left;overflow:hidden}',
    '.omodos-machine-status-card .machine-label{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;font-weight:800;line-height:1.25;letter-spacing:.01em}',
    '.omodos-machine-status-card .machine-state{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;font-weight:700;line-height:1.25;color:#596e7d}',
    '.omodos-machine-status-card .machine-date{display:block;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;line-height:1.2;color:#738592}',
    '.omodos-machine-status-card.good{border-color:#a8d9bd;background:rgba(247,255,250,.97)}.omodos-machine-status-card.good .machine-state{color:#187044}',
    '.omodos-machine-status-card.attention{border-color:#efc07b;background:rgba(255,251,242,.97)}.omodos-machine-status-card.attention .machine-state{color:#985400}',
    '.omodos-machine-status-card.critical{border-color:#e4a2a2;background:rgba(255,247,247,.97)}.omodos-machine-status-card.critical .machine-state{color:#ad2e35}',
    '.omodos-machine-status-card.unknown{border-color:#c9d4dc;background:rgba(249,251,252,.95)}.omodos-machine-status-card.unknown .machine-state{color:#71818c}',
    '@media(max-width:700px){#omodos-status-badge{left:7px;top:7px;padding:6px 8px;border-radius:9px}#omodos-status-badge strong{font-size:10px}#omodos-status-badge span{font-size:9px}.omodos-machine-status-card{width:80px;min-height:33px;padding:3px 4px;border-radius:6px}.omodos-machine-status-card .machine-label{font-size:8px}.omodos-machine-status-card .machine-state{margin-top:1px;font-size:8px}.omodos-machine-status-card .machine-date{font-size:7px}}'
  ].join('\n');
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const gate = document.createElement('div'); gate.id = 'omodos-status-gate';
  gate.innerHTML = '<div class="gate-card"><strong>Beranda Superadmin OMODOS</strong>Viewer ini hanya dapat ditampilkan melalui sesi Superadmin OMODOS yang sah.</div>';
  document.body.appendChild(gate);
  function normalize(value){return String(value==null?'':value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}
  function machineNameKey(value){return normalize(value).replace(/(^|\s)0+(\d+)/g,(_,prefix,digits)=>prefix+String(Number(digits)));}
  function shortName(machine){
    const raw=String(machine?.name||machine?.sapCode||'Mesin');const offset=raw.match(/offset[^0-9]{0,24}(\d+)/i);if(offset)return 'Offset '+offset[1];
    const match=raw.match(/\b(APM|FGM|AHU|CTP|CTF|FZG|OFS|OFU|GLM|PDS|RMS)\s*[-# ]?\s*(\d+)\b/i);if(match)return match[1].toUpperCase()+' '+match[2];
    if(/polar\s*115/i.test(raw))return 'Polar 115';if(/sheeting/i.test(raw))return 'Sheeting';if(/compressor/i.test(raw))return 'Compressor';if(/collator/i.test(raw))return 'Collator';if(/ipal/i.test(raw))return 'IPAL';
    return raw.length>22?raw.slice(0,21).trim()+'…':raw;
  }
  function aliasesFor(machine){
    const aliases=[machine.machineId,machine.sapCode,machine.functionalLocation,machine.name,machine.codename,shortName(machine)],raw=String(machine.name||'');
    const offset=raw.match(/offset[^0-9]{0,24}(\d+)/i);if(offset)aliases.push('offset '+offset[1],'printing offset '+offset[1],'offset uv ink '+offset[1],'offset #'+offset[1]);
    const cat=raw.match(/\b(APM|FGM|AHU|CTP|CTF|OFS|OFU|GLM|PDS|RMS)\s*[-# ]?\s*(\d+)\b/i);if(cat)aliases.push(cat[1]+' '+cat[2],cat[1]+'-'+cat[2]);
    if(/polar\s*115/i.test(raw))aliases.push('polar 115','guillotine polar 115');if(/sheeting/i.test(raw))aliases.push('sheeting','sheeting lexus');if(/collator/i.test(raw))aliases.push('collator');
    return [...new Set(aliases.map(normalize).filter(Boolean))];
  }
  function compactStatus(raw){
    const s=String(raw||'').trim();if(!s)return 'Belum ada catatan';if(s.length<=18)return s;
    const low=normalize(s);if(low.includes('selesai'))return 'Selesai';if(low.includes('perbaikan'))return 'Perbaikan';if(low.includes('proses'))return 'Dalam proses';if(low.includes('breakdown')||low.includes('gangguan'))return 'Gangguan';if(low.includes('pending'))return 'Pending';
    return s.slice(0,17).trim()+'…';
  }
  function toneFor(status){
    const s=normalize(status);if(!s||s==='belum ada catatan'||s.includes('belum diisi'))return 'unknown';
    if(/(rusak|breakdown|gangguan|gagal|abnormal|emergency|darurat|critical|kritikal)/.test(s))return 'critical';
    if(/(perlu|masalah|pending|menunggu|belum|proses|ongoing|open|perbaikan|tidak normal|follow up)/.test(s))return 'attention';
    if(/(selesai|completed|closed|normal|baik|aman|running|operasi|operasional|ok\b)/.test(s))return 'good';
    return 'unknown';
  }
  function formatDate(value){if(!value)return '';const d=new Date(value);if(Number.isNaN(d.getTime()))return '';return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}).replace(/\./g,'');}
  function bestRecord(machine){
    const code=normalize(machine.sapCode);
    const machineName=machineNameKey(machine.name);
    const short=machineNameKey(shortName(machine));
    const sameCodePeers=code?state.registry.filter(peer=>normalize(peer.sapCode)===code):[];
    const payloadCodeRows=code?state.records.filter(row=>normalize(row.code)===code):[];
    const codeIsUnique=sameCodePeers.length===1&&payloadCodeRows.length===1;
    let winner=null,winnerScore=0,winnerTime=-Infinity;
    for(const row of state.records){
      const rowCode=normalize(row.code),name=normalize(row.name);
      let score=0;
      if(code&&rowCode===code){
        if(codeIsUnique)score=130;
        else if(name&&(name===machineName||name===short))score=160;
        else continue;
      }else if(rowCode&&code&&rowCode!==code){
        // An explicit different code must never be overridden by a fuzzy name match.
        continue;
      }else if(name&&(name===machineName||name===short)){
        const exactPeers=state.registry.filter(peer=>{
          const peerName=machineNameKey(peer.name),peerShort=machineNameKey(shortName(peer));
          return peerName===name||peerShort===name;
        });
        if(exactPeers.length===1&&exactPeers[0].machineId===machine.machineId)score=100;
        else continue;
      }else{
        continue;
      }
      const time=Date.parse(row.date||'')||row.index||0;
      if(score&&(time>winnerTime||(time===winnerTime&&score>winnerScore))){winner=row;winnerScore=score;winnerTime=time;}
    }
    return winner;
  }
  function readBox(THREE,obj){if(!obj||!obj.visible)return null;const box=new THREE.Box3().setFromObject(obj);if(box.isEmpty())return null;return {x:(box.min.x+box.max.x)/2,y:box.max.y+Math.max(.28,(box.max.y-box.min.y)*.06),z:(box.min.z+box.max.z)/2};}
  function ensureCard(machine){
    let card=state.cards.get(machine.machineId);if(card)return card;
    card=document.createElement('div');card.className='omodos-machine-status-card unknown';card.dataset.machineId=machine.machineId;
    card.innerHTML='<span class="machine-label"></span><span class="machine-state">Belum ada catatan</span><span class="machine-date"></span>';
    state.layer.appendChild(card);state.cards.set(machine.machineId,card);return card;
  }
  function updateCardContent(machine,card){
    const row=bestRecord(machine),status=row?.status||'Belum ada catatan';card.classList.remove('good','attention','critical','unknown');card.classList.add(row?toneFor(status):'unknown');
    card.querySelector('.machine-label').textContent=shortName(machine);card.querySelector('.machine-state').textContent=compactStatus(status);card.querySelector('.machine-date').textContent=row?.date?formatDate(row.date):'';
    card.setAttribute('aria-label',shortName(machine)+': '+status+(row?.date?', '+formatDate(row.date):''));card.dataset.contentVersion=String(state.recordsVersion);
  }
  function rebuildAnchors(THREE,engine){
    state.anchors.clear();for(const machine of state.registry){const obj=engine.actualFactory?.assets?.get(machine.machineId),anchor=readBox(THREE,obj);if(anchor)state.anchors.set(machine.machineId,{machine,obj,anchor});}
    state.lastAnchorAt=performance.now();
  }
  function projectCards(THREE,engine){
    if(!state.authorized||!state.layer||!engine?.camera||!engine?.renderer?.domElement)return;const viewport=engine.renderer.domElement.parentElement||document.getElementById('viewport');if(!viewport)return;
    const width=viewport.clientWidth,height=viewport.clientHeight;if(width<10||height<10)return;
    const entries=[...state.anchors.values()].map(entry=>{const pos=new THREE.Vector3(entry.anchor.x,entry.anchor.y,entry.anchor.z).project(engine.camera);return {...entry,px:(pos.x+1)*.5*width,py:(1-pos.y)*.5*height,depth:pos.z,ndcX:pos.x,ndcY:pos.y};})
      .filter(x=>x.depth>=-1.05&&x.depth<=1.05&&x.ndcX>-1.2&&x.ndcX<1.2&&x.ndcY>-1.2&&x.ndcY<1.2).sort((a,b)=>a.py-b.py);
    const mobile=matchMedia('(max-width:700px)').matches,cardWidth=mobile?82:106,cardHeight=mobile?39:46;
    const offsets=[[0,-5],[0,-cardHeight-5],[0,cardHeight/2],[-cardWidth/2-7,-5],[cardWidth/2+7,-5],[-cardWidth-6,-cardHeight/2],[cardWidth+6,-cardHeight/2],[0,-cardHeight*1.5],[-cardWidth/2-7,-cardHeight-5],[cardWidth/2+7,-cardHeight-5],[-cardWidth*1.2,0],[cardWidth*1.2,0]];
    const used=[];
    for(const entry of entries){
      const card=ensureCard(entry.machine);if(card.dataset.contentVersion!==String(state.recordsVersion))updateCardContent(entry.machine,card);
      const x=Math.max(cardWidth/2+3,Math.min(width-cardWidth/2-3,entry.px)),y=Math.max(cardHeight+4,Math.min(height-4,entry.py));let chosen=null,bestOverlap=Infinity;
      for(const [dx,dy] of offsets){
        const cx=Math.max(cardWidth/2+3,Math.min(width-cardWidth/2-3,x+dx)),cy=Math.max(cardHeight+3,Math.min(height-3,y+dy));
        const rect={left:cx-cardWidth/2,right:cx+cardWidth/2,top:cy-cardHeight,bottom:cy};
        const overlap=used.reduce((sum,u)=>sum+Math.max(0,Math.min(rect.right,u.right)-Math.max(rect.left,u.left))*Math.max(0,Math.min(rect.bottom,u.bottom)-Math.max(rect.top,u.top)),0);
        if(overlap===0){chosen={cx,cy,rect};break;}if(overlap<bestOverlap){bestOverlap=overlap;chosen={cx,cy,rect};}
      }
      if(!chosen){card.hidden=true;continue;}card.hidden=false;card.style.left=chosen.cx+'px';card.style.top=chosen.cy+'px';used.push(chosen.rect);
    }
    for(const [id,card] of state.cards)if(!state.anchors.has(id))card.hidden=true;
  }
  function visibleMeshesUnder(layer){const found=[];if(!layer)return found;const visit=(node,parentVisible)=>{const visible=parentVisible&&node.visible!==false;if(!visible)return;if(node.isMesh)found.push(node);for(const child of node.children||[])visit(child,visible);};visit(layer,true);return found;}
  async function startViewer(){
    try{
      const [THREE,registryModule]=await Promise.all([import('three'),import('./data/machine-registry.js')]);state.registry=registryModule.MACHINE_REGISTRY||[];
      const viewport=document.getElementById('viewport');if(!viewport)throw new Error('Viewport pabrik tidak ditemukan.');
      const layer=document.createElement('div');layer.id='omodos-status-overlay';layer.innerHTML='<div id="omodos-status-badge"><strong>BMJ · Factory Status</strong><span>Status logbook terakhir · bukan telemetry real-time</span></div>';viewport.appendChild(layer);state.layer=layer;
      let rootSignature='';
      setInterval(()=>{
        const engine=window.__BMJ_FACTORY_ENGINE__;if(!engine?.actualFactory?.assets||!engine.factory)return;state.engine=engine;
        const signature=String(engine.actualFactory.root?.uuid||'')+':'+String(engine.actualFactory.assets.size||0),rootChanged=signature!==rootSignature,now=performance.now();
        if(rootChanged||now-state.lastPolicyAt>900){
          rootSignature=signature;state.lastPolicyAt=now;
          const policy={building:false,ipal:true,floor:true,walls:false,doors:false,windows:false,air_curtain:false,furniture:false,roof:false,machines:true,labels:false,landscape:false,reference:false,unidentified:true,utility_compressed_air:false,utility_ahu_piping:false,utility_ahu_ducting:false,utility_anchors:false};
          for(const [key,visible] of Object.entries(policy))engine.setFactoryLayer(key,visible);
          engine.onFactorySelect=()=>{};engine.onTaxonomySelect=()=>{};engine.renderer.domElement.style.touchAction='none';engine.renderer.domElement.setAttribute('aria-label','Tampilan 3D status mesin BMJ; objek tidak membuka detail.');
          if(state.authorized&&engine.actualFactory.assets.size){const fitObjects=[...engine.actualFactory.assets.values(),...visibleMeshesUnder(engine.actualFactory.layers.ipal)];engine.fitObjects(fitObjects,'iso',false);}
        }
        if(now-state.lastAnchorAt>1400||rootChanged)rebuildAnchors(THREE,engine);
        // Report readiness only after the actual factory assets and status anchors exist.
        if(state.authorized&&!state.readySent&&engine.actualFactory.assets.size>0){
          state.readySent=true;
          window.parent.postMessage({type:'OMODOS_FACTORY_STATUS_READY',version:1},state.parentOrigin||'https://omodos.juldigi.workers.dev');
        }
      },350);
      const projectLoop=()=>{if(state.authorized&&state.engine)projectCards(THREE,state.engine);requestAnimationFrame(projectLoop);};requestAnimationFrame(projectLoop);
    }catch(error){console.error('[OMODOS status twin]',error);const card=gate.querySelector('.gate-card');if(card)card.innerHTML='<strong>Viewer 3D tidak tersedia</strong>Komponen tampilan tidak berhasil dimuat. Beranda OMODOS tetap dapat digunakan.';}
  }
  let viewerStarted=false;function startViewerOnce(){if(viewerStarted)return;viewerStarted=true;void startViewer();}
  window.addEventListener('message',event=>{
    if(window.parent===window||event.source!==window.parent||!ALLOWED_PARENT_ORIGINS.has(event.origin))return;
    const payload=event.data;if(!payload||payload.type!=='OMODOS_FACTORY_STATUS'||payload.version!==1||!Array.isArray(payload.records))return;
    state.records=payload.records.slice(0,1200).map((row,index)=>({code:String(row?.code||'').trim(),name:String(row?.name||'').trim(),status:String(row?.status||'').trim(),date:String(row?.date||'').trim(),index:Number(row?.index)||index}));state.recordsVersion++;
    state.authorized=true;state.parentOrigin=event.origin;const activeEngine=window.__BMJ_FACTORY_ENGINE__;if(activeEngine){activeEngine.onFactorySelect=()=>{};activeEngine.onTaxonomySelect=()=>{};}document.documentElement.classList.add('omodos-status-authorized');gate.remove();state.lastAnchorAt=0;
    startViewerOnce();
  });
}
