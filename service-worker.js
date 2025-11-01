const CACHE_NAME = 'gaming-lounge-cache-v2'; // Increment cache name to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // NOTE: Caching of JS/CSS/image assets should be handled by a build plugin (e.g., vite-plugin-pwa)
  // to include file hashes for proper cache busting.
  // For now, we will cache the main entry points.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll with a catch to prevent install failure if one asset is missing
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache initial assets:', err);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle navigation requests with a network-first strategy
  // to ensure the app is always up-to-date, falling back to cache if offline.
  // Other assets (JS, CSS, images) will be handled by the browser cache with hashes from Vite.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the fetch is successful, clone it and cache it.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If the network fails, try to serve from the cache.
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('/index.html'); // Fallback to index.html
            });
        })
    );
  }
  // For non-navigation requests, let the browser handle it.
  // Vite's build adds hashes to asset filenames, so browser caching works well.
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});