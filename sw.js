/* Anaqa Shop — service worker v3
   Page de l'app et manifeste : réseau d'abord (dernière version publiée), cache en secours hors ligne.
   Icônes et bibliothèques externes : cache d'abord. */
const CACHE='anaqa-v4';
const LOCAUX=['./','manifest.json','icon-192.png','icon-512.png','maskable-192.png',
 'maskable-512.png','apple-touch-icon.png','icon-32.png'];
const LIBS=[
 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-app-compat.js',
 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-auth-compat.js',
 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-firestore-compat.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled([...LOCAUX,...LIBS].map(f=>c.add(f)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request,u=req.url;
  if(req.method!=='GET')return;
  if(u.includes('googleapis.com')||u.includes('identitytoolkit')||u.includes('firebaseio'))return;
  const local=u.startsWith(self.location.origin);
  const estPage=req.mode==='navigate'||(local&&(u.endsWith('/')||u.includes('index.html')));
  const estManifeste=local&&u.includes('manifest.json');
  if(estPage||estManifeste){
    e.respondWith(fetch(req,{cache:'no-store'}).then(rep=>{
      if(rep&&rep.ok){const cl=rep.clone();caches.open(CACHE).then(c=>c.put(estPage?'./':req,cl))}
      return rep;
    }).catch(()=>caches.match(estPage?'./':req).then(r=>r||caches.match(req))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(rep=>{
    if(rep&&rep.ok&&(local||u.includes('cdn'))){const cl=rep.clone();caches.open(CACHE).then(c=>c.put(req,cl))}
    return rep;
  })));
});
