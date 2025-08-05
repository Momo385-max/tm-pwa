const CACHE_NAME='tm-pwa-ios-minfix-v1';
const CORE_ASSETS=['/tm-pwa/','/tm-pwa/index.html','/tm-pwa/app.js','/tm-pwa/manifest.webmanifest','/tm-pwa/assets/icon-180.png'];

self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)));
 self.skipWaiting();
});

self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
 self.clients.claim();
});

self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(url.pathname.startsWith('/tm-pwa/model/')){
   // network-first for model files
   e.respondWith(fetch(e.request,{cache:'reload'}).catch(()=>caches.match(e.request)));
   return;
 }
 if(url.pathname.startsWith('/tm-pwa/')||url.hostname.includes('cdn.jsdelivr.net')){
   e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));
   return;
 }
 e.respondWith(fetch(e.request).catch(()=>caches.match('/tm-pwa/')));
});
