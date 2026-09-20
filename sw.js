/* Anaqa Shop — service worker : l'app reste ouvrable sans réseau */
const CACHE='anaqa-v1';
const FICHIERS=['./','./index.html',
 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-app-compat.js',
 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-auth-compat.js',
 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-firestore-compat.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FICHIERS.map(f=>c.add(f)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(e.request.method!=='GET')return;
  if(u.includes('firestore.googleapis.com')||u.includes('identitytoolkit')||u.includes('googleapis.com/google.firestore'))return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(rep=>{
      if(rep&&rep.status===200&&(u.startsWith(self.location.origin)||u.includes('cdn')))
        {const cl=rep.clone();caches.open(CACHE).then(c=>c.put(e.request,cl))}
      return rep;
    }).catch(()=>caches.match('./index.html')))
  );
});
