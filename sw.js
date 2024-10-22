const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/assets/css/main.css',
  '/assets/js/search.js',
  '/assets/js/util.js',
  '/assets/js/jquery.min.js',
  '/assets/js/browser.min.js',
  '/assets/js/breakpoints.min.js',
  '/assets/js/main.js',
  'index.html',
  'about.html',
  '/articles/contact.html',
  '/articles/abinayah.html',
  '/articles/brooke.html',
  '/articles/lumila.html',
  '/articles/luis.html',
  '/articles/vittoria.html',
  'e-books.html',
  'books.html',
  '/articles/article.html',
  'articles/images/favicon_io/icon-192x192.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;  
        }
        return fetch(event.request);  
      })
  );
});