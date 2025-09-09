const CACHE_NAME = 'impostor-game-v1.2.0';
const urlsToCache = [
    '/',
    '/juego/Impostor.html',
    '/manifest.json',
    '/icons/icon-16.png',
    '/icons/icon-32.png',
    '/icons/icon-48.png',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-144.png',
    '/icons/icon-192.png',
    '/icons/icon-256.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png',
    '/icons/apple-touch-icon.png',
    // Fuentes y recursos externos que se usan
    'https://cdn.vercel-insights.com/v1/script.debug.js'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cacheando archivos');
                return cache.addAll(urlsToCache.map(url => {
                    // Para URLs externas, cachear solo si están disponibles
                    if (url.startsWith('http')) {
                        return fetch(url).then(response => {
                            if (response.ok) {
                                cache.put(url, response.clone());
                            }
                            return response;
                        }).catch(() => {
                            console.log(`No se pudo cachear: ${url}`);
                        });
                    }
                    return url;
                }));
            })
            .then(() => {
                console.log('Service Worker: Instalación completada');
                // Forzar la activación inmediata
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error durante la instalación:', error);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Eliminar caches antiguos
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activado y listo');
            // Tomar control de todas las páginas inmediatamente
            return self.clients.claim();
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', event => {
    // Solo cachear requests GET
    if (event.request.method !== 'GET') {
        return;
    }

    // No cachear requests de analytics o APIs externas que cambien
    const url = new URL(event.request.url);
    if (url.hostname.includes('vercel-insights.com') ||
        url.hostname.includes('analytics') ||
        url.pathname.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en cache, devolverlo
                if (response) {
                    console.log('Service Worker: Sirviendo desde cache:', event.request.url);
                    return response;
                }

                // Si no está en cache, hacer fetch
                console.log('Service Worker: Fetching:', event.request.url);
                return fetch(event.request).then(response => {
                    // Verificar si la respuesta es válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clonar la respuesta porque es un stream
                    const responseToCache = response.clone();

                    // Agregar al cache para futuras requests
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(error => {
                    console.error('Service Worker: Error en fetch:', error);

                    // Si es la página principal y no hay conexión, mostrar página offline básica
                    if (event.request.destination === 'document') {
                        return new Response(`
              <!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Impostor - Sin Conexión</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    text-align: center;
                    padding: 20px;
                  }
                  .offline-container {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(8px);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 400px;
                  }
                  h1 { font-size: 2.5em; margin-bottom: 20px; }
                  p { font-size: 1.2em; line-height: 1.6; }
                  .retry-btn {
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                  }
                  .retry-btn:hover {
                    transform: translateY(-2px);
                  }
                </style>
              </head>
              <body>
                <div class="offline-container">
                  <h1>🕵️ IMPOSTOR</h1>
                  <p>No hay conexión a internet</p>
                  <p>El juego funciona offline una vez cargado. Intenta recargar la página.</p>
                  <button class="retry-btn" onclick="window.location.reload()">
                    🔄 Reintentar
                  </button>
                </div>
              </body>
              </html>
            `, {
                            headers: {
                                'Content-Type': 'text/html'
                            }
                        });
                    }

                    throw error;
                });
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    console.log('Service Worker: Mensaje recibido:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

// Manejar notificaciones push (para futuras funcionalidades)
self.addEventListener('push', event => {
    console.log('Service Worker: Push recibido');

    const options = {
        body: event.data ? event.data.text() : 'Nueva partida disponible',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: 'Jugar',
                icon: '/icons/icon-192.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icons/icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Impostor', options)
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Click en notificación');
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('Service Worker: Script cargado');
