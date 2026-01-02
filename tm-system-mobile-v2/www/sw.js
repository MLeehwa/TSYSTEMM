// TM System Service Worker
const CACHE_NAME = 'tm-system-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/live-display.html',
  '/forklift-display.html',
  '/css/main.css',
  '/css/style.css',
  '/js/core/database.js',
  '/js/core/navigation.js',
  '/js/core/supabase-config.js',
  '/js/core/system-manager.js',
  '/js/core/utils.js',
  '/js/list.js',
  '/js/fifo/analysis-new.js',
  '/js/packaging/packaging-analysis.js',
  '/js/truck/management.js',
  '/js/truck/status.js',
  '/pages/analysis-new.html',
  '/pages/fifo/upload.html',
  '/pages/packaging-analysis-fixed.html',
  '/pages/packaging-analysis.html',
  '/pages/truck/management.html',
  '/pages/truck/status.html',
  '/assets/',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@supabase/supabase-js@2',
  'https://wfnihtmmaebgjtdmazmo.supabase.co'
];

// Install event
self.addEventListener('install', event => {
  console.log('TM System Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('TM System Service Worker caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('TM System Service Worker cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('TM System Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('TM System Service Worker deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('TM System Service Worker serving from cache:', event.request.url);
          return response;
        }
        
        console.log('TM System Service Worker fetching from network:', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(error => {
        console.log('TM System Service Worker fetch failed:', error);
        // Return offline page or fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('TM System Service Worker background sync');
    event.waitUntil(
      // Sync offline data when back online
      syncOfflineData()
    );
  }
});

// Push notification
self.addEventListener('push', event => {
  console.log('TM System Service Worker push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from TM System',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open TM System',
        icon: '/assets/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('TM System', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('TM System Service Worker notification clicked');
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for background sync
async function syncOfflineData() {
  try {
    // Sync any offline data when connection is restored
    console.log('TM System Service Worker syncing offline data');
    // Add your sync logic here
  } catch (error) {
    console.log('TM System Service Worker sync failed:', error);
  }
}
