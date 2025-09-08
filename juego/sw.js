// Service Worker para Impostor PWA
const CACHE_NAME = 'impostor-v1.0.0';
const ASSETS_TO_CACHE = [
    './',
    './Impostor.html',
    './manifest.json',
    './icons/icon-16.png',
    './icons/icon-32.png',
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png'
];

// Instalar Service Worker y cachear recursos
self.addEventListener('install', event => {
    console.log('SW: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cacheando archivos');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('SW: Instalación completa');
                return self.skipWaiting();
            })
    );
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', event => {
    console.log('SW: Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('SW: Activación completa');
            return self.clients.claim();
        })
    );
});

// Interceptar requests y servir desde caché (offline-first)
self.addEventListener('fetch', event => {
    // Solo cachear requests GET del mismo origen
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('SW: Sirviendo desde caché:', event.request.url);
                    return cachedResponse;
                }

                console.log('SW: Descargando:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // No cachear respuestas no válidas
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar la respuesta para guardarla en caché
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Si falla la descarga y no está en caché, mostrar página offline
                        if (event.request.destination === 'document') {
                            return caches.match('./Impostor.html');
                        }
                    });
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Sincronización en segundo plano (para futuras funcionalidades)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('SW: Sincronización en segundo plano');
        // Aquí podrías sincronizar datos cuando vuelva la conexión
    }
});

// Push notifications (para futuras funcionalidades)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './icons/icon-192.png',
            badge: './icons/icon-96.png',
            vibrate: [100, 50, 100],
            data: data.data,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir juego',
                    icon: './icons/icon-96.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('./Impostor.html')
        );
    }
});
