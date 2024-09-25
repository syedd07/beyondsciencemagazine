const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/assets/css/main.css',
  '/assets/js/search.js',
  '/assets/js/util.js',
  '/assets/js/jquery.min.js',
  '/assets/js/browser.min.js',
  '/assets/js/breakpoints.min.js',
  'assets/js/main.js',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/e-books.html',
  '/books.html',
  '/articles.html',
  
  '/images/favicon_io/icon-192x192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
