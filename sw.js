const CACHE_NAME = 'redline-motors-v1';

// Статические ресурсы для предкэширования при установке
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './catalog/catalog.html',
  './card/card.html',
  './preorder.html',
  './contacts.html',
  './css/global.css',
  './css/index.css',
  './css/navbar.css',
  './css/toast.css',
  './css/slide.css',
  './js/api-client.js',
  './js/toast.js',
  './card/cars_data.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Установка Service Worker и кэширование базовых ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Предварительное кэширование статики...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Ошибка при предкэшировании некоторых ресурсов:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Активация и удаление старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кэша:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Пропускаем запросы с неверной схемой (chrome-extension и т.д.)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Стратегия Network First для API (бэкенд и БД всегда получают свежие данные)
  if (url.pathname.includes('/api/') || url.port === '8000') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Вы находитесь в офлайн-режиме' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Стратегия Network First для HTML страниц
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Стратегия Cache First (с обновлением из сети) для CSS, JS, картинок и шрифтов
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Игнорируем сетевые ошибки для статики, если она есть в кэше
        });

      return cachedResponse || fetchPromise;
    })
  );
});
