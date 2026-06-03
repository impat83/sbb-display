const C='gw-v1';
const F=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>c.addAll(F).catch(()=>{})));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.hostname.includes('opendata.ch')||url.hostname.includes('qrserver.com')||url.hostname.includes('googleapis.com')||url.hostname.includes('gstatic.com'))return;
  e.respondWith(
    fetch(e.request).then(r=>{
      if(r&&r.ok&&url.origin===location.origin){const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl)).catch(()=>{});}
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
