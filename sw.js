const CACHE_NAME = 'tm-pwa-ios-lazy-v9';
const CORE_ASSETS = [
  '/tm-pwa/',
  '/tm-pwa/index.html',
  '/tm-pwa/app.js',
  '/tm-pwa/manifest.webmanifest',
  '/tm-pwa/assets/icon-180.png',
  '/tm-pwa/assets/icon-192.png',
  '/tm-pwa/assets/icon-512.png'
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
  if (url.pathname.startsWith('/tm-pwa/model/')) {
    event.respondWith(fetch(event.request, { cache: 'reload' }).catch(() => caches.match(event.request)));
    return;
  }
  if (url.pathname.startsWith('/tm-pwa/') || url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match('/tm-pwa/')));
});
