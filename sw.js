// SW with bumped cache & offline; lazy libs will be cached after first load
const CACHE_NAME = 'tm-pwa-ios-lazy-v11';
const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  // libs are fetched lazily; SW will cache them after first request automatically (see cacheFirst)
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/model/') || CORE_ASSETS.includes(url.pathname) || CORE_ASSETS.includes(url.href)) {
    event.respondWith(cacheFirst(event.request));
  } else if (url.href.includes('cdn.jsdelivr.net')) {
    event.respondWith(staleWhileRevalidate(event.request)); // cache TFJS/TM after first load
  } else {
    event.respondWith(fetch(event.request).catch(() => caches.match('./')));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const resp = await fetch(request);
  if (resp && resp.ok) cache.put(request, resp.clone());
  return resp;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(resp => {
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(()=>undefined);
  return cached || networkPromise;
}
