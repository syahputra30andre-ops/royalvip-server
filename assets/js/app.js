
// Admin key hidden: SHA-256 hash of the allowed password
const ADMIN_HASH = "e3e6ae6ac703598b2d4a2ab31144d7f1eac092c4e2ea28f016a6e51f620c6c46";
const SYNC_MODE = window.SYNC_MODE || 'local'; // set 'firebase' + FIREBASE_CONFIG to enable cloud sync

let fb=null;(function(){ if(SYNC_MODE==='firebase' && window.FIREBASE_CONFIG && window.firebase){ try{ const app=firebase.initializeApp(window.FIREBASE_CONFIG); const db=firebase.firestore(); const storage=firebase.storage(); fb={db,storage}; }catch(e){ console.warn('Firebase init gagal', e); } } })();

/* IndexedDB for local persistence */
const DB_NAME='betina-db', DB_VER=6, STORE='videos';
function openDB(){ return new Promise((res,rej)=>{ const r=indexedDB.open(DB_NAME,DB_VER); r.onupgradeneeded=()=>{ const db=r.result; if(!db.objectStoreNames.contains(STORE)){ const os=db.createObjectStore(STORE,{keyPath:'id',autoIncrement:true}); os.createIndex('createdAt','createdAt'); } }; r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
async function dbAdd(item){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).add(item); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }
async function dbGetAll(){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readonly'); const q=tx.objectStore(STORE).index('createdAt').getAll(); q.onsuccess=()=>res(q.result.sort((a,b)=>b.createdAt-a.createdAt)); q.onerror=()=>rej(q.error); }); }
async function dbClear(){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).clear(); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); }); }

/* State & Elements */
const state={videos:[],filter:'Semua'};
const grid=document.getElementById('grid'); const toast=document.getElementById('toast');
const modal=document.getElementById('modal'); let modalVideo=document.getElementById('modalVideo');
const modalPaywall=document.getElementById('modalPaywall'); const modalWA=document.getElementById('modalWA'); const modalTG=document.getElementById('modalTG');
const keyModal=document.getElementById('keyModal'); const keyInput=document.getElementById('keyInput'); const keyCancel=document.getElementById('keyCancel'); const keyOk=document.getElementById('keyOk');
const uploadContainer=document.getElementById('upload');
const adminPanel=document.getElementById('adminPanel'); const adminClose=document.getElementById('adminClose'); const adminList=document.getElementById('adminList');

/* Utils */
const showToast=(m='OK')=>{ toast.textContent=m; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2200); };
const humanTime=s=>{ if(!Number.isFinite(s)) return '0:00'; const m=Math.floor(s/60), sc=Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sc}`; };
const blobToDataURL=b=>new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=()=>rej(fr.error); fr.readAsDataURL(b); });
async function sha256Hex(t){ const buf=new TextEncoder().encode(t); const h=await crypto.subtle.digest('SHA-256',buf); return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join(''); }

/* Paywall 20s */
function attachPaywall(videoEl,paywallEl,waA,tgA,waUrl,tgUrl){ waA.href=waUrl||'#'; tgA.href=tgUrl||'#'; paywallEl.classList.add('hidden'); const LIMIT=20; const onTime=()=>{ if(videoEl.currentTime>=LIMIT){ videoEl.pause(); paywallEl.classList.remove('hidden'); } }; const clone=videoEl.cloneNode(true); videoEl.parentNode.replaceChild(clone,videoEl); videoEl=clone; videoEl.addEventListener('timeupdate', onTime); return videoEl; }

/* Render grid */
function renderGrid(list){ grid.innerHTML=''; const arr=(list||state.videos).filter(v=>state.filter==='Semua'||v.category===state.filter); if(!arr.length){ grid.innerHTML='<div style="color:var(--text-muted)">Belum ada item.</div>'; return; } arr.forEach(item=>{ const card=document.createElement('div'); card.className='card'; const th=document.createElement('div'); th.className='thumb'; if(item.posterURL) th.style.backgroundImage=`url('${item.posterURL}')`; const ov=document.createElement('div'); ov.className='overlay'; const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML=`<p class="title">${item.title}</p><div class="sub">${(item.views||0).toLocaleString('id-ID')} • ${item.category}</div>`; const badge=document.createElement('div'); badge.className='badge'; badge.textContent=item.duration||''; card.appendChild(th); card.appendChild(ov); card.appendChild(meta); card.appendChild(badge); card.onclick=()=>openModal(item); grid.appendChild(card); }); }

/* Modal player */
function openModal(item){ modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); modalVideo.src=item.videoURL; if(item.posterURL) modalVideo.setAttribute('poster', item.posterURL); modalVideo = attachPaywall(modalVideo, modalPaywall, modalWA, modalTG, item.wa, item.tg); modalVideo.play(); }
modal.addEventListener('click', (e)=>{ if(e.target===modal){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); modalVideo.pause(); modalVideo.src=''; modalPaywall.classList.add('hidden'); } });

/* Filter buttons (incl. Upload pill) */
document.querySelectorAll('.pill').forEach(p=>p.addEventListener('click', async ()=>{
  const val=p.dataset.filter;
  if(val==='__UPLOAD__'){ const ok=await requireKey(); if(ok){ const hidden=uploadContainer.classList.contains('hidden'); uploadContainer.classList.toggle('hidden'); uploadContainer.setAttribute('aria-hidden', hidden?'true':'false'); } return; }
  document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); state.filter=val; renderGrid();
}));

/* Password modal helpers */
let _authOk=false;
function openKey(){ keyInput.value=''; keyModal.classList.add('show'); keyModal.setAttribute('aria-hidden','false'); }
function closeKey(){ keyModal.classList.remove('show'); keyModal.setAttribute('aria-hidden','true'); }
async function requireKey(){ if(_authOk) return true; openKey(); return new Promise(resolve=>{ const onOk=async()=>{ const hash=await sha256Hex(keyInput.value.trim()); if(hash!==ADMIN_HASH){ showToast('Kunci salah'); return; } _authOk=true; cleanup(); resolve(true); }; const onCancel=()=>{ cleanup(); resolve(false); }; function cleanup(){ keyOk.removeEventListener('click', onOk); keyCancel.removeEventListener('click', onCancel); closeKey(); } keyOk.addEventListener('click', onOk); keyCancel.addEventListener('click', onCancel); }); }

/* Admin dashboard */
document.getElementById('btnAdmin').addEventListener('click', async ()=>{ const ok=await requireKey(); if(ok){ showAdmin(); } });
function showAdmin(){ adminPanel.classList.add('show'); adminPanel.setAttribute('aria-hidden','false'); renderAdminList(); }
adminClose.addEventListener('click', ()=>{ adminPanel.classList.remove('show'); adminPanel.setAttribute('aria-hidden','true'); });
async function renderAdminList(){ const items = fb ? await fetchRemoteList() : await dbGetAll(); adminList.innerHTML=''; (items||[]).forEach((it)=>{ const div=document.createElement('div'); div.className='admin-item'; div.innerHTML=`<div class="meta"><div><b>${it.title}</b></div><div class="sub">${it.category} • ${it.duration}</div></div>`; const del=document.createElement('button'); del.className='btn outline'; del.textContent='Hapus'; del.onclick=()=>confirmDelete(it); div.appendChild(del); adminList.appendChild(div); }); }
async function fetchRemoteList(){ const snap=await fb.db.collection('betina_videos').orderBy('createdAt','desc').get(); return snap.docs.map(d=>({ id:d.id, ...d.data() })); }
async function confirmDelete(it){ if(!confirm('Hapus video ini?')) return; try{ if(fb && it.id){ await fb.db.collection('betina_videos').doc(it.id).delete(); await loadRemote(); } else { const all=await dbGetAll(); const keep=all.filter(v => !(v.title===it.title && v.createdAt===it.createdAt)); await dbClear(); for(const k of keep) await dbAdd(k); await hydrateLocal(); } renderAdminList(); showToast('Dihapus'); }catch(e){ console.error(e); showToast('Gagal hapus'); }}

/* Upload handler */
document.getElementById('uploadForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const ok=await requireKey(); if(!ok) return;
  const vfile=document.getElementById('video').files[0]; if(!vfile){ showToast('Pilih file video'); return; }
  const pfile=document.getElementById('poster').files[0]||null;
  const title=document.getElementById('title').value.trim();
  const category=document.getElementById('category').value; // only one category
  const wa=document.getElementById('wa').value.trim(); const tg=document.getElementById('tg').value.trim();
  const tmp=document.createElement('video'); tmp.preload='metadata'; tmp.src=URL.createObjectURL(vfile);
  const durationText=await new Promise(res=>{ tmp.onloadedmetadata=()=>res(humanTime(tmp.duration||0)); tmp.onerror=()=>res('0:00'); });
  const createdAt=Date.now(); let stored={ title, category, views:Math.floor(2000+Math.random()*10000), duration:durationText, wa, tg, createdAt };
  if(fb){ try{ const rid=`${createdAt}-${Math.random().toString(36).slice(2,8)}`; const vRef=fb.storage.ref().child(`videos/${rid}.mp4`); const pRef=pfile?fb.storage.ref().child(`posters/${rid}`):null; await vRef.put(vfile); const videoURL=await vRef.getDownloadURL(); let posterURL=''; if(pRef){ await pRef.put(pfile); posterURL=await pRef.getDownloadURL(); } await fb.db.collection('betina_videos').doc(rid).set({ ...stored, videoURL, posterURL }); showToast('Upload & sinkron berhasil'); await loadRemote(); e.target.reset(); return; }catch(e){ console.error(e); showToast('Gagal sinkron, simpan lokal'); } }
  stored.videoBlob=vfile; stored.posterBlob=pfile; await dbAdd(stored); await hydrateLocal(); showToast('Upload tersimpan'); e.target.reset();
});

/* Search: title or category */
document.getElementById('btnSearch').addEventListener('click', ()=>{
  const q=document.getElementById('q').value.toLowerCase();
  const filtered=state.videos.filter(v => (v.title+' '+v.category).toLowerCase().includes(q));
  renderGrid(filtered);
});

/* Loaders */
async function hydrateLocal(){ const list=await dbGetAll(); state.videos=list.map(v=>{ const videoURL=URL.createObjectURL(v.videoBlob); const posterURL=v.posterBlob?URL.createObjectURL(v.posterBlob):''; return { ...v, videoURL, posterURL }; }); renderGrid(); }
async function loadRemote(){
  if (window.SYNC_MODE==='supabase' && supa) {
    try {
      const { data, error } = await supa.from('betina_videos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      state.videos = (data||[]).map(r => ({
        id: (r.id||0).toString(),
        title: r.title,
        category: r.category,
        createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
        videoURL: r.video_url,
        posterURL: r.poster_url,
        wa: r.wa || '',
        tg: r.tg || '',
        views: r.views || 0,
      }));
      renderGrid();
      return;
    } catch(e){ console.error('Supabase load error', e); }
  } if(!fb) return hydrateLocal(); const snap=await fb.db.collection('betina_videos').orderBy('createdAt','desc').get(); state.videos=snap.docs.map(d=>({ id:d.id, ...d.data() })); renderGrid(); }

/* Export/Import */
const btnExport=document.getElementById('btnExport'), btnImport=document.getElementById('btnImport'), importFile=document.getElementById('importFile');
btnExport.addEventListener('click', async ()=>{ const list=await dbGetAll(); const serial=await Promise.all(list.map(async v=>{ const vd=await blobToDataURL(v.videoBlob); const pd=v.posterBlob?await blobToDataURL(v.posterBlob):null; return { ...v, videoBlob:vd, posterBlob:pd }; })); const data=JSON.stringify({version:6, items:serial}); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([data],{type:'application/json'})); a.download='koleksi.betina.json'; a.click(); showToast('Koleksi diekspor'); });
btnImport.addEventListener('click', ()=>importFile.click());
importFile.addEventListener('change', async (e)=>{ const f=e.target.files[0]; if(!f) return; try{ const txt=await f.text(); const payload=JSON.parse(txt); await dbClear(); const toBlob=(u)=>{ if(!u) return null; const [m,b64]=u.split(','); const mime=m.match(/data:(.*?);base64/)[1]; const bin=atob(b64), u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); return new Blob([u8],{type:mime}); }; for(const it of payload.items){ await dbAdd({ ...it, videoBlob: toBlob(it.videoBlob), posterBlob: toBlob(it.posterBlob) }); } await hydrateLocal(); showToast('Impor selesai'); }catch(e){ console.error(e); showToast('Gagal impor'); } finally { importFile.value=''; } });

/* Boot */
(async function init(){ if(fb) await loadRemote(); else await hydrateLocal(); })();
