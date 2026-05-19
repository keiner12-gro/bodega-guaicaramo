const CACHE_NAME = 'bodega-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/public/css/styles.css',
  '/public/js/scripts.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
