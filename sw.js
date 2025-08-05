// SW with absolute scope and network-first for /tm-pwa/model/ to avoid stale caches
const CACHE_NAME = 'tm-pwa-ios-forced-v7';
const CORE_ASSETS = [
  '/tm-pwa/',
  '/tm-pwa/index.html',
  '/tm-pwa/app.js',
  '/tm-pwa/manifest.webmanifest',
  '/tm-pwa/assets/icon-180.png',
  '/tm-pwa/assets/icon-192.png',
  '/tm-pwa/assets/icon-512.png',
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

  // Network-first for model assets to avoid stale cache issues on iOS
  if (url.pathname.startsWith('/tm-pwa/model/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Stale-while-revalidate for common assets and CDN libs
  if (url.pathname.startsWith('/tm-pwa/') || url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Default: try network, fallback to cached home
  event.respondWith(fetch(event.request).catch(() => caches.match('/tm-pwa/')));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const resp = await fetch(request, { cache: 'reload' });
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
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
