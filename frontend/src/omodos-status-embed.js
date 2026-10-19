const EMBED_KEY = 'omodos-status';
if (new URLSearchParams(location.search).get('embed') !== EMBED_KEY) {
  // No extra imports or UI for regular DigitalTwin sessions.
} else {
  const ALLOWED_PARENT_ORIGINS = new Set(['https://omodos.juldigi.workers.dev']);
  const state = {authorized:false,readySent:false,parentOrigin:null,records:[],recordsVersion:0,summary:{critical:0,attention:0},registry:[],engine:null,layer:null,cards:new Map(),anchors:new Map(),leaders:new Map(),leaderSvg:null,lastAnchorAt:0,lastProjectionAt:0,lastPolicyAt:0,policyApplied:false,previewPrunedRoot:''};
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
    '#omodos-status-leaders{position:absolute;inset:0;display:block;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:1}',
    '#omodos-status-leaders .machine-leader{fill:none;stroke:#8196a4;stroke-width:1.15;stroke-opacity:.9;stroke-linecap:round;vector-effect:non-scaling-stroke}',
    '#omodos-status-leaders .machine-leader.critical{stroke:#c84b53;stroke-width:1.35}',
    '#omodos-status-leaders .machine-leader.attention{stroke:#bd7b23;stroke-width:1.25}',
    '#omodos-status-leaders .machine-leader.good{stroke:#348461}',
    '#omodos-status-leaders .machine-leader-dot{stroke:#fff;stroke-width:1;vector-effect:non-scaling-stroke}',
    '#omodos-status-badge{position:absolute;left:12px;top:12px;z-index:4;max-width:min(320px,calc(100vw - 24px));padding:9px 12px;border:1px solid rgba(197,211,220,.9);border-radius:12px;background:rgba(255,255,255,.94);box-shadow:0 3px 14px rgba(28,56,74,.1);color:#193548;backdrop-filter:blur(8px)}',
    '#omodos-status-badge strong{display:block;font-size:12px;letter-spacing:.055em;text-transform:uppercase}',
    '#omodos-status-badge span{display:block;margin-top:2px;font-size:10px;color:#607585}',
    '.omodos-machine-status-card{position:absolute;left:0;top:0;z-index:2;width:122px;min-height:50px;transform:translate(-50%,-100%);padding:5px 7px 6px;border:1px solid rgba(190,204,214,.94);border-radius:8px;background:rgba(255,255,255,.97);box-shadow:0 2px 8px rgba(26,51,67,.14);color:#203c4f;text-align:left;overflow:hidden;pointer-events:auto;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-tap-highlight-color:transparent}',
    '#omodos-status-overlay .omodos-machine-status-card .machine-label{display:block!important;position:static!important;visibility:visible!important;opacity:1!important;height:auto!important;min-height:12px;max-height:1.5em;margin:0!important;padding:0!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:850;line-height:1.25;letter-spacing:.005em;color:#203c4f!important}',
    '.omodos-machine-status-card .machine-state{display:block!important;position:relative;margin-top:3px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:750;line-height:1.25;color:#596e7d}',
    '.omodos-machine-status-card .machine-date{display:block!important;position:relative;margin-top:1px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;line-height:1.2;color:#738592}',
    '.omodos-machine-status-card.good{border-color:#a8d9bd;background:rgba(247,255,250,.97)}.omodos-machine-status-card.good .machine-state{color:#187044}',
    '.omodos-machine-status-card.attention{border-color:#efc07b;background:rgba(255,251,242,.97)}.omodos-machine-status-card.attention .machine-state{color:#985400}',
    '.omodos-machine-status-card.critical{border-color:#e4a2a2;background:rgba(255,247,247,.97)}.omodos-machine-status-card.critical .machine-state{color:#ad2e35}',
    '.omodos-machine-status-card.unknown{border-color:#c9d4dc;background:rgba(249,251,252,.95)}.omodos-machine-status-card.unknown .machine-state{color:#71818c}',
    '@media(max-width:700px){#omodos-status-badge{left:7px;top:7px;max-width:min(330px,calc(100vw - 14px));padding:6px 8px;border-radius:9px}#omodos-status-badge strong{font-size:10px}#omodos-status-badge span{font-size:9px;line-height:1.25}.omodos-machine-status-card{width:118px;min-height:48px;padding:4px 6px 5px;border-radius:7px;background:rgba(255,255,255,.985);pointer-events:auto;cursor:pointer;touch-action:manipulation}.omodos-machine-status-card .machine-label{display:block!important;visibility:visible!important;opacity:1!important;min-height:11px;margin:0!important;font-size:9px!important;font-weight:850!important;line-height:1.2!important;color:#203c4f!important}.omodos-machine-status-card .machine-state{display:block!important;visibility:visible!important;opacity:1!important;margin-top:2px!important;font-size:8.5px!important;font-weight:750!important;line-height:1.15!important;color:#394e5d!important}.omodos-machine-status-card .machine-date{display:block!important;visibility:visible!important;opacity:1!important;margin-top:1px!important;font-size:8px!important;line-height:1.2!important}}'
  ].join('\n');
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const gate = document.createElement('div'); gate.id = 'omodos-status-gate';
  gate.innerHTML = '<div class="gate-card"><strong>Beranda Superadmin OMODOS</strong>Viewer ini hanya dapat ditampilkan melalui sesi Superadmin OMODOS yang sah.</div>';
  document.body.appendChild(gate);
  function normalize(value){return String(value==null?'':value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}
  function machineNameKey(value){return normalize(value).replace(/(^|\s)0+(\d+)/g,(_,prefix,digits)=>prefix+String(Number(digits)));}
  function shortName(machine){
    const raw=String(machine?.name||machine?.sapCode||'Mesin').trim();
    const offset=raw.match(/offset[^0-9]{0,24}(\d+)/i);if(offset)return 'Offset '+Number(offset[1]);
    if(/polar\s*115/i.test(raw))return 'Polar 115';
    const numbered=raw.match(/\b(AHU|APM|FGM|CTP|CTF|OFS|OFU|GLM|PDS|RMS)\s*[-# ]?\s*(\d+)\b/i);
    if(numbered)return numbered[1].toUpperCase()+' '+Number(numbered[2]);
    const platen=raw.match(/\bAUTOPLATEN\s*[-# ]*(\d+)\b/i);if(platen)return 'Autoplaten '+Number(platen[1]);
    const folder=raw.match(/\bFOLDER\s+GLUER\s*[-# ]*(\d+)\b/i);if(folder)return 'Folder Gluer '+Number(folder[1]);
    const pile=raw.match(/\bPILE\s+TURNER\s*[-# ]*(\d+)\b/i);if(pile)return 'Pile Turner '+Number(pile[1]);
    const inspection=raw.match(/\bOFFLINE\s+INSPECTION\s*(\d+)\s*[- ]*\s*(MK|FOCUSIGHT)?/i);
    if(inspection)return 'Inspection '+Number(inspection[1])+(inspection[2]?' · '+inspection[2].toUpperCase():'');
    const blanking=raw.match(/\bAUTOBLANKING(?:\s+MACHINE)?\s*[-# ]*(\d+)\b/i);if(blanking)return 'Autoblanking '+Number(blanking[1]);
    if(/sheeting/i.test(raw))return 'Sheeting Lexus';
    const compressor=raw.match(/\bCOMPRESSOR\s+(ATLAS\s+COPCO|KAESER|SWAN)\s+NO\.?\s*(\d+)\b/i);
    if(compressor){
      const brand=compressor[1].replace(/\s+/g,' ').toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase());
      return brand+' '+Number(compressor[2]);
    }
    if(/\bCOMPRESSOR\b/i.test(raw))return raw.length>20?raw.slice(0,20).trim():raw;
    if(/\bCOLLATOR\b/i.test(raw))return 'Collator';
    if(/\bDIGITAL\s+INKJET\b/i.test(raw))return 'Digital Inkjet';
    if(/\bCTP\s+HEIDELBERG\b/i.test(raw)){
      if(String(machine?.machineId||'').endsWith('0025'))return 'CTP Heidelberg 1';
      if(String(machine?.machineId||'').endsWith('0026'))return 'CTP Heidelberg 2';
      return 'CTP Heidelberg';
    }
    if(/\bCTF\s+IMAGESETTER\b/i.test(raw))return 'CTF Imagesetter';
    if(/\bZUND\b/i.test(raw))return 'Zünd';
    if(/\bIPAL\b/i.test(raw))return 'IPAL';
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
    const s=normalize(status);if(!s||s==='belum ada catatan'||s==='belum ada data'||s.includes('belum diisi'))return 'unknown';
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
      const rowCode=normalize(row.code),name=machineNameKey(row.name);let score=0;
      if(code&&rowCode===code){
        if(codeIsUnique)score=130;
        else if(name){
          const exactCodePeers=sameCodePeers.filter(peer=>{
            const peerName=machineNameKey(peer.name),peerShort=machineNameKey(shortName(peer));
            return peerName===name||peerShort===name;
          });
          if(exactCodePeers.length===1&&exactCodePeers[0].machineId===machine.machineId)score=160;
          else continue;
        }else continue;
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
      const time=Date.parse(row.date||'')||Number(row.index)||0;
      if(score&&(time>winnerTime||(time===winnerTime&&score>winnerScore))){winner=row;winnerScore=score;winnerTime=time;}
    }
    return winner;
  }
  function readBox(THREE,obj){if(!obj||!obj.visible)return null;const box=new THREE.Box3().setFromObject(obj);if(box.isEmpty())return null;return {x:(box.min.x+box.max.x)/2,y:box.max.y+Math.max(.28,(box.max.y-box.min.y)*.06),z:(box.min.z+box.max.z)/2};}
  function ensureCard(machine){
    let card=state.cards.get(machine.machineId);if(card)return card;
    card=document.createElement('div');card.className='omodos-machine-status-card unknown';card.dataset.machineId=machine.machineId;
    card.setAttribute('role','button');card.tabIndex=0;card.style.pointerEvents='auto';
    card.innerHTML='<span class="machine-label"></span><span class="machine-state">Belum ada catatan</span><span class="machine-date"></span>';
    const activate=event=>{
      if(event){event.preventDefault();event.stopPropagation();}
      if(!state.authorized||!state.parentOrigin||!ALLOWED_PARENT_ORIGINS.has(state.parentOrigin))return;
      const row=bestRecord(machine)||{};
      const code=String(row.code||machine.sapCode||'').trim();
      const name=String(row.name||machine.name||'').trim();
      window.parent.postMessage({type:'OMODOS_FACTORY_STATUS_CARD_CLICK',version:1,code,name},state.parentOrigin);
    };
    card.addEventListener('click',activate);
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){activate(event);}});
    state.layer.appendChild(card);state.cards.set(machine.machineId,card);return card;
  }
  function updateCardContent(machine,card){
    const row=bestRecord(machine),status=row?.status||'Belum ada catatan';card.classList.remove('good','attention','critical','unknown');card.classList.add(row?toneFor(status):'unknown');
    card.querySelector('.machine-label').textContent=shortName(machine);card.querySelector('.machine-state').textContent=compactStatus(status);card.querySelector('.machine-date').textContent=row?.date?formatDate(row.date):'';
    card.setAttribute('aria-label',shortName(machine)+': '+status+(row?.date?', '+formatDate(row.date):''));card.title=String(machine.name||shortName(machine))+' · '+status+(row?.date?', '+formatDate(row.date):'');card.dataset.contentVersion=String(state.recordsVersion);
  }
  function rebuildAnchors(THREE,engine){
    state.anchors.clear();for(const machine of state.registry){const obj=engine.actualFactory?.assets?.get(machine.machineId),anchor=readBox(THREE,obj);if(anchor)state.anchors.set(machine.machineId,{machine,obj,anchor});}
    state.lastAnchorAt=performance.now();
  }
  function ensureLeader(machineId){
    let nodes=state.leaders.get(machineId);if(nodes)return nodes;
    if(!state.leaderSvg)return null;
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('class','machine-leader unknown');line.setAttribute('data-machine-id',machineId);
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('class','machine-leader-dot unknown');dot.setAttribute('data-machine-id',machineId);dot.setAttribute('r','2.5');
    state.leaderSvg.append(line,dot);nodes={line,dot};state.leaders.set(machineId,nodes);return nodes;
  }
  function hideLeaders_(){
    for(const nodes of state.leaders.values()){nodes.line.style.display='none';nodes.dot.style.display='none';}
  }
  function updateLeader_(entry,rect){
    const nodes=ensureLeader(entry.machineId);if(!nodes)return;
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const points=[
      {x:clamp(entry.x,rect.left+8,rect.right-8),y:rect.top,edge:'top'},
      {x:clamp(entry.x,rect.left+8,rect.right-8),y:rect.bottom,edge:'bottom'},
      {x:rect.left,y:clamp(entry.y,rect.top+7,rect.bottom-7),edge:'left'},
      {x:rect.right,y:clamp(entry.y,rect.top+7,rect.bottom-7),edge:'right'}
    ];
    points.sort((a,b)=>((a.x-entry.x)**2+(a.y-entry.y)**2)-((b.x-entry.x)**2+(b.y-entry.y)**2));
    const end=points[0];
    const stateClass=entry.card.classList.contains('critical')?'critical':entry.card.classList.contains('attention')?'attention':entry.card.classList.contains('good')?'good':'unknown';
    nodes.line.setAttribute('class','machine-leader '+stateClass);
    nodes.line.setAttribute('x1',entry.x.toFixed(1));nodes.line.setAttribute('y1',entry.y.toFixed(1));
    nodes.line.setAttribute('x2',end.x.toFixed(1));nodes.line.setAttribute('y2',end.y.toFixed(1));
    nodes.dot.setAttribute('cx',entry.x.toFixed(1));nodes.dot.setAttribute('cy',entry.y.toFixed(1));
    nodes.dot.setAttribute('fill',stateClass==='critical'?'#c84b53':stateClass==='attention'?'#bd7b23':stateClass==='good'?'#348461':'#8196a4');
    nodes.line.style.display='block';nodes.dot.style.display='block';
  }
  function projectCards(THREE,engine){
    if(!state.authorized||document.hidden||!state.layer||!engine?.camera||!engine?.renderer?.domElement)return;
    hideLeaders_();
    const viewport=engine.renderer.domElement.parentElement||document.getElementById('viewport');
    if(!viewport)return;
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if(width<10||height<10)return;
    const mobile=matchMedia('(max-width:767px)').matches||matchMedia('(pointer:coarse)').matches;
    // The mobile viewport cannot label every asset at once. Prioritize important
    // statuses near the current camera and let users rotate/zoom to other areas.
    const cardWidth=mobile?118:122,cardHeight=mobile?48:50;
    const entries=[];
    for(const entry of state.anchors.values()){
      const card=ensureCard(entry.machine);
      if(card.dataset.contentVersion!==String(state.recordsVersion))updateCardContent(entry.machine,card);
      card.hidden=true;
      const pos=new THREE.Vector3(entry.anchor.x,entry.anchor.y,entry.anchor.z).project(engine.camera);
      if(pos.z < -1.05 || pos.z > 1.05 || pos.x < -1.08 || pos.x > 1.08 || pos.y < -1.08 || pos.y > 1.08)continue;
      const statusPriority=card.classList.contains('critical')?0:
        card.classList.contains('attention')?1:
        card.classList.contains('good')?2:3;
      entries.push({
        machineId:entry.machine.machineId,
        machine:entry.machine,
        card,
        statusPriority,
        x:(pos.x*.5+.5)*width,
        y:(-.5*pos.y+.5)*height,
        distance:(pos.x*pos.x)+(pos.y*pos.y)
      });
    }
    entries.sort((a,b)=>a.statusPriority-b.statusPriority||a.distance-b.distance||a.y-b.y);
    const mobileLimit=mobile?2:8;
    const candidates=entries.slice(0,mobileLimit);
    const offsets=mobile
      ?[[0,-8],[0,-cardHeight-12],[-cardWidth*.58,-8],[cardWidth*.58,-8],[0,-cardHeight*2-14],[-cardWidth*.9,-cardHeight*.6],[cardWidth*.9,-cardHeight*.6],[0,10],[-cardWidth*.55,10],[cardWidth*.55,10],[-cardWidth,-8],[cardWidth,-8]]
      :[[0,-8],[0,-cardHeight-10],[0,cardHeight*.45],[-cardWidth*.62,-8],[cardWidth*.62,-8],[-cardWidth*.92,-cardHeight*.55],[cardWidth*.92,-cardHeight*.55],[0,-cardHeight*1.7],[-cardWidth*.6,-cardHeight-8],[cardWidth*.6,-cardHeight-8],[0,10],[-cardWidth,-8],[cardWidth,-8],[0,-cardHeight*2.6]];
    const used=[];
    const badge=state.layer.querySelector('#omodos-status-badge');
    if(badge){
      const br=badge.getBoundingClientRect(),vr=viewport.getBoundingClientRect();
      if(br.width>0&&br.height>0){
        used.push({left:br.left-vr.left-4,top:br.top-vr.top-4,right:br.right-vr.left+4,bottom:br.bottom-vr.top+4});
      }
    }
    let shown=0;
    for(const entry of candidates){
      const card=entry.card;
      const labelEl=card.querySelector('.machine-label');
      const machineLabel=shortName(entry.machine);
      if(labelEl)labelEl.textContent=machineLabel;
      card.dataset.machineLabel=machineLabel;
      card.setAttribute('aria-label',machineLabel+' — '+(card.querySelector('.machine-state')?.textContent||'Belum ada catatan'));
      const x=Math.max(cardWidth/2+3,Math.min(width-cardWidth/2-3,entry.x));
      const y=Math.max(cardHeight+4,Math.min(height-4,entry.y));
      let chosen=null;
      for(const [dx,dy] of offsets){
        const cx=Math.max(cardWidth/2+3,Math.min(width-cardWidth/2-3,x+dx));
        const cy=Math.max(cardHeight+3,Math.min(height-3,y+dy));
        const rect={left:cx-cardWidth/2,right:cx+cardWidth/2,top:cy-cardHeight,bottom:cy};
        const overlaps=used.some(u=>rect.left<u.right+4&&rect.right>u.left-4&&rect.top<u.bottom+4&&rect.bottom>u.top-4);
        if(!overlaps){chosen={cx,cy,rect};break;}
      }
      // Mobile fallback grid: keep callouts readable even when three
      // nearby assets compete for the same tiny area. The leader still points
      // to the true machine anchor; no status card is stacked on another.
      if(!chosen&&mobile){
        const margin=5,gap=7,columns=Math.max(1,Math.floor((width-2*margin+gap)/(cardWidth+gap)));
        const rows=Math.max(1,Math.ceil(height/(cardHeight+gap)));
        let fallback=null,bestDistance=Infinity;
        for(let rowIndex=0;rowIndex<rows;rowIndex++){
          const bottom=margin+cardHeight+rowIndex*(cardHeight+gap);
          if(bottom>height-margin)continue;
          for(let column=0;column<columns;column++){
            const cx=margin+cardWidth/2+column*(cardWidth+gap);
            const rect={left:cx-cardWidth/2,top:bottom-cardHeight,right:cx+cardWidth/2,bottom};
            const overlaps=used.some(u=>rect.left<u.right+3&&rect.right>u.left-3&&rect.top<u.bottom+3&&rect.bottom>u.top-3);
            if(overlaps)continue;
            const distance=(cx-entry.x)**2+(bottom-cardHeight/2-entry.y)**2;
            if(distance<bestDistance){bestDistance=distance;fallback={cx,cy:bottom,rect};}
          }
        }
        if(fallback)chosen=fallback;
      }
      if(!chosen)continue;
      card.hidden=false;
      card.style.width=cardWidth+'px';
      card.style.minHeight=cardHeight+'px';
      card.style.left=chosen.cx+'px';
      card.style.top=chosen.cy+'px';
      updateLeader_(entry,chosen.rect);
      used.push(chosen.rect);
      shown++;
    }
    const summary=state.layer.querySelector('[data-status-summary]');
    if(summary){
      if(mobile){
        summary.textContent=shown+' kartu tampil · Kritikal '+state.summary.critical+' · Perhatian '+state.summary.attention+' · putar/perbesar untuk mesin lain';
      }else{
        summary.textContent=shown+' kartu tampil · status Logbook/Patrol, bukan telemetry sensor langsung';
      }
    }
    // Do not let a card from an earlier frame remain visible after the current
    // mobile priority set has changed.
    for(const [id,card] of state.cards){
      if(!entries.some(entry=>entry.machineId===id&&entry.card===card)||!candidates.some(entry=>entry.machineId===id))card.hidden=true;
    }
  }
  function visibleMeshesUnder(layer){const found=[];if(!layer)return found;const visit=(node,parentVisible)=>{const visible=parentVisible&&node.visible!==false;if(!visible)return;if(node.isMesh)found.push(node);for(const child of node.children||[])visit(child,visible);};visit(layer,true);return found;}

  function collectPreviewResources_(root,keep){
    const visit=(node,parentVisible)=>{
      const visible=parentVisible&&node.visible!==false;if(!visible)return;
      if(node.geometry)keep.geometries.add(node.geometry);
      const materials=Array.isArray(node.material)?node.material:(node.material?[node.material]:[]);
      for(const material of materials){
        keep.materials.add(material);
        for(const value of Object.values(material||{}))if(value?.isTexture)keep.textures.add(value);
      }
      for(const child of node.children||[])visit(child,visible);
    };
    visit(root,true);
  }
  function disposePreviewSubtree_(node,keep,disposed){
    for(const child of [...(node.children||[])])disposePreviewSubtree_(child,keep,disposed);
    node.parent?.remove(node);
    const geometry=node.geometry;
    if(geometry&&!keep.geometries.has(geometry)&&!disposed.geometries.has(geometry)){
      disposed.geometries.add(geometry);geometry.dispose?.();
    }
    const materials=Array.isArray(node.material)?node.material:(node.material?[node.material]:[]);
    for(const material of materials){
      if(!material||keep.materials.has(material)||disposed.materials.has(material))continue;
      disposed.materials.add(material);
      for(const value of Object.values(material)){
        if(value?.isTexture&&!keep.textures.has(value)&&!disposed.textures.has(value)){
          disposed.textures.add(value);value.dispose?.();
        }
      }
      material.dispose?.();
    }
  }
  function pruneInvisiblePreviewBranches_(parent,keep,disposed){
    for(const child of [...(parent?.children||[])]){
      if(child.visible===false){disposePreviewSubtree_(child,keep,disposed);continue;}
      pruneInvisiblePreviewBranches_(child,keep,disposed);
    }
  }
  function compactPreviewScene_(engine){
    const actual=engine?.actualFactory,layers=actual?.layers,assets=actual?.assets;
    if(!layers||!(assets instanceof Map))return false;
    const assetRoots=new Set([...assets.values()]);
    const keep={geometries:new Set(),materials:new Set(),textures:new Set()};
    const disposed={geometries:new Set(),materials:new Set(),textures:new Set()};
    const keepLayers=['floor','machines','unidentified','ipal'];
    for(const name of keepLayers)if(layers[name])collectPreviewResources_(layers[name],keep);
    for(const [name,layer] of Object.entries(layers)){
      if(keepLayers.includes(name))continue;
      layer.visible=false;
      for(const child of [...(layer.children||[])])disposePreviewSubtree_(child,keep,disposed);
    }
    for(const child of [...(layers.unidentified?.children||[])]){
      if(!assetRoots.has(child))disposePreviewSubtree_(child,keep,disposed);
    }
    if(layers.ipal)pruneInvisiblePreviewBranches_(layers.ipal,keep,disposed);
    actual.root.userData={...(actual.root.userData||{}),omodosExteriorPreview:true,detailedHydration:false,prunedLayers:true};
    return true;
  }

  async function startViewer(){
    try{
      const [THREE,registryModule]=await Promise.all([import('three'),import('./data/machine-registry.js')]);state.registry=registryModule.MACHINE_REGISTRY||[];
      const viewport=document.getElementById('viewport');if(!viewport)throw new Error('Viewport pabrik tidak ditemukan.');
      const layer=document.createElement('div');layer.id='omodos-status-overlay';layer.innerHTML='<div id="omodos-status-badge"><strong>BMJ · Factory Status</strong><span data-status-summary>Status terbaru dari Logbook/Patrol · bukan telemetry sensor langsung</span></div>';const leaderSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');leaderSvg.id='omodos-status-leaders';leaderSvg.setAttribute('aria-hidden','true');leaderSvg.setAttribute('preserveAspectRatio','none');layer.appendChild(leaderSvg);viewport.appendChild(layer);state.layer=layer;state.leaderSvg=leaderSvg;
      let rootSignature='';
      setInterval(()=>{
        const engine=window.__BMJ_FACTORY_ENGINE__;if(!engine?.actualFactory?.assets||!engine.factory)return;state.engine=engine;
        const signature=String(engine.actualFactory.root?.uuid||'')+':'+String(engine.actualFactory.assets.size||0),rootChanged=signature!==rootSignature,now=performance.now();
        if(rootChanged||!state.policyApplied){
          rootSignature=signature;state.lastPolicyAt=now;state.policyApplied=true;
          const policy={building:false,ipal:true,floor:true,walls:false,doors:false,windows:false,air_curtain:false,furniture:false,roof:false,machines:true,labels:false,landscape:false,reference:false,unidentified:true,utility_compressed_air:false,utility_ahu_piping:false,utility_ahu_ducting:false,utility_anchors:false};
          for(const [key,visible] of Object.entries(policy))engine.setFactoryLayer(key,visible);
          // Keep genuinely placed unidentified machines, but remove the
          // unrelated large context marker/label from the same layer.
          const assetRoots=new Set([...engine.actualFactory.assets.values()]);
          const unidentifiedLayer=engine.actualFactory.layers.unidentified;
          if(unidentifiedLayer?.children){
            for(const child of unidentifiedLayer.children){
              if(!assetRoots.has(child))child.visible=false;
            }
          }
          // Retain the IPAL water-treatment equipment but hide its canopy/frame
          // only in this embed route. Full DigitalTwin visibility preferences remain unchanged.
          const hiddenIpalStructure=new Set(['IPAL_OPEN_FRAME_COLUMN','IPAL_OPEN_FRAME_BASE','IPAL_CANOPY_RAFTER','IPAL_CANOPY_ROOF','IPAL_X_BRACE_REFERENCE']);
          const hideIpalStructure=node=>{
            if(!node)return;
            if(hiddenIpalStructure.has(node.userData?.semantic))node.visible=false;
            for(const child of node.children||[])hideIpalStructure(child);
          };
          hideIpalStructure(engine.actualFactory.layers.ipal);
          if(state.previewPrunedRoot!==signature){compactPreviewScene_(engine);state.previewPrunedRoot=signature;}
          engine.onFactorySelect=()=>{};engine.onTaxonomySelect=()=>{};engine.renderer.domElement.style.touchAction='none';engine.renderer.domElement.setAttribute('aria-label','Tampilan 3D status mesin BMJ; objek tidak membuka detail.');
          if(state.authorized&&engine.actualFactory.assets.size){const fitObjects=[...engine.actualFactory.assets.values(),...visibleMeshesUnder(engine.actualFactory.layers.ipal)];engine.fitObjects(fitObjects,'iso',false);}
        }
        if(!state.lastAnchorAt||rootChanged)rebuildAnchors(THREE,engine);
        // Tell OMODOS the viewer is ready only after the engine, visible assets,
        // and the status-card anchors exist. The parent then sends fresh records.
        if(state.authorized&&!state.readySent&&engine.actualFactory.assets.size>0&&state.anchors.size>0&&state.parentOrigin&&ALLOWED_PARENT_ORIGINS.has(state.parentOrigin)){
          state.readySent=true;
          window.parent.postMessage({type:'OMODOS_FACTORY_STATUS_READY',version:1},state.parentOrigin);
        }
      },1000);
      const overlayMobile=matchMedia('(max-width:767px)').matches||matchMedia('(pointer:coarse)').matches;
      const projectionInterval=overlayMobile?160:120;
      const projectLoop=()=>{if(!document.hidden&&state.authorized&&state.engine)projectCards(THREE,state.engine);setTimeout(projectLoop,document.hidden?1000:projectionInterval);};
      setTimeout(projectLoop,projectionInterval);
    }catch(error){console.error('[OMODOS status twin]',error);const card=gate.querySelector('.gate-card');if(card)card.innerHTML='<strong>Viewer 3D tidak tersedia</strong>Komponen tampilan tidak berhasil dimuat. Beranda OMODOS tetap dapat digunakan.';}
  }
  let viewerStarted=false;function startViewerOnce(){if(viewerStarted)return;viewerStarted=true;void startViewer();}
  window.addEventListener('message',event=>{
    if(window.parent===window||event.source!==window.parent||!ALLOWED_PARENT_ORIGINS.has(event.origin))return;
    const payload=event.data;if(!payload||payload.type!=='OMODOS_FACTORY_STATUS'||payload.version!==1||!Array.isArray(payload.records))return;
    state.records=payload.records.slice(0,1200).map((row,index)=>({code:String(row?.code||'').trim(),name:String(row?.name||'').trim(),status:String(row?.status||'').trim(),date:String(row?.date||'').trim(),index:Number(row?.index)||index}));state.recordsVersion++;state.summary={critical:state.records.filter(row=>/^(kritikal|critical|breakdown)$/i.test(String(row.status||'').trim())).length,attention:state.records.filter(row=>/perlu perhatian|attention|pending|proses/i.test(String(row.status||'').trim())).length};
    const firstAuthorization=!state.authorized;state.authorized=true;state.parentOrigin=event.origin;if(firstAuthorization){state.policyApplied=false;state.lastAnchorAt=0;}const activeEngine=window.__BMJ_FACTORY_ENGINE__;if(activeEngine){activeEngine.onFactorySelect=()=>{};activeEngine.onTaxonomySelect=()=>{};}document.documentElement.classList.add('omodos-status-authorized');gate.remove();startViewerOnce();
  });
}
