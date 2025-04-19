const CACHE_NAME = 'space-particle-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/1.SpaceProject.html',
  '/2.About.html',
  '/About.us.html',
  '/Style.css',
  '/Script.js',
  '/about.js',
  '/about.css',
  '/animated-cards.css',
  '/animated-cards.js',
  '/DarkMode.js',
  '/iss-tracker.css',
  '/iss-tracker.html',
  '/iss-tracker.js',
  '/mainM.js',
  '/news.css',
  '/news.html',
  '/news.js',
  '/search.css',
  '/search.js',
  '/space-background.css',
  '/space-background.js',
  '/themes.css',
  // Add any other resources your app needs
];

// Install event - cache initial resources
self.addEventListener('install', event => {
  // Force immediate control of clients
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all open clients
      return clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
});