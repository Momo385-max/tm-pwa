// iPhone-optimized PWA Service Worker
const CACHE_NAME = 'tm-pwa-ios-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js',
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
  } else {
    event.respondWith(staleWhileRevalidate(event.request));
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
  return cached || networkPromise || fetch(request);
}
