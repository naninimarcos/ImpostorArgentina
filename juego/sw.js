// Service Worker para Impostor PWA - Versión Offline Completa
const CACHE_NAME = 'impostor-offline-v2.0.0';
const ASSETS_TO_CACHE = [
    // Archivos principales
    '/juego/',
    '/juego/Impostor.html',
    '/juego/manifest.json',
    '/juego/index.html',
    
    // Iconos
    '/juego/icons/icon-16.png',
    '/juego/icons/icon-32.png',
    '/juego/icons/icon-72.png',
    '/juego/icons/icon-96.png',
    '/juego/icons/icon-128.png',
    '/juego/icons/icon-144.png',
    '/juego/icons/icon-152.png',
    '/juego/icons/icon-180.png',
    '/juego/icons/icon-192.png',
    '/juego/icons/icon-384.png',
    '/juego/icons/icon-512.png',
    
    // Página de inicio
    '/',
    '/index.html'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('SW: Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cacheando archivos para uso offline...');
                // Cachear archivos uno por uno para evitar errores
                return Promise.all(
                    ASSETS_TO_CACHE.map(url => {
                        return cache.add(url).catch(error => {
                            console.log('SW: Error cacheando', url, error);
                        });
                    })
                );
            })
            .then(() => {
                console.log('SW: ✅ Instalación completa - Juego disponible offline');
                // Forzar activación inmediata
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('SW: ❌ Error durante instalación:', error);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', event => {
    console.log('SW: Activando Service Worker...');
    event.waitUntil(
        // Limpiar caches antiguos
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('SW: ✅ Service Worker activado y listo');
            // Tomar control de todas las páginas
            return self.clients.claim();
        })
    );
});

// Interceptar todas las requests (OFFLINE FIRST)
self.addEventListener('fetch', event => {
    // Ignorar requests que no sean GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ignorar requests de analytics y externos
    if (event.request.url.includes('vercel-insights') || 
        event.request.url.includes('analytics') ||
        event.request.url.includes('google') ||
        event.request.url.includes('facebook')) {
        return;
    }

    event.respondWith(
        // ESTRATEGIA: Cache First (Offline First)
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('SW: ✅ Sirviendo desde cache:', event.request.url);
                    return cachedResponse;
                }

                // Si no está en cache, intentar fetch
                console.log('SW: 🌐 Fetching desde red:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Solo cachear respuestas exitosas
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar respuesta para cachear
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                                console.log('SW: 💾 Cacheado:', event.request.url);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.log('SW: ❌ Error de red, sirviendo offline:', error);
                        
                        // Si es una página HTML, servir la página principal
                        if (event.request.destination === 'document') {
                            return caches.match('/juego/Impostor.html')
                                .then(fallback => {
                                    if (fallback) {
                                        return fallback;
                                    }
                                    
                                    // Página offline de emergencia
                                    return new Response(`
                                        <!DOCTYPE html>
                                        <html lang="es">
                                        <head>
                                            <meta charset="UTF-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <title>Impostor - Offline</title>
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
                                                .container {
                                                    background: rgba(255, 255, 255, 0.15);
                                                    backdrop-filter: blur(8px);
                                                    border-radius: 20px;
                                                    padding: 40px;
                                                    max-width: 400px;
                                                }
                                                h1 { font-size: 2.5em; margin-bottom: 20px; }
                                                .btn {
                                                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                                                    color: white;
                                                    border: none;
                                                    padding: 15px 30px;
                                                    border-radius: 10px;
                                                    font-size: 16px;
                                                    cursor: pointer;
                                                    margin: 10px;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            <div class="container">
                                                <h1>🕵️ IMPOSTOR</h1>
                                                <p>✅ <strong>¡Funcionando Offline!</strong></p>
                                                <p>El juego está instalado y listo para usar sin internet.</p>
                                                <button class="btn" onclick="window.location.reload()">🔄 Recargar Juego</button>
                                                <button class="btn" onclick="window.location.href='/juego/Impostor.html'">🎮 Ir al Juego</button>
                                            </div>
                                        </body>
                                        </html>
                                    `, {
                                        headers: {
                                            'Content-Type': 'text/html'
                                        }
                                    });
                                });
                        }
                        
                        // Para otros recursos, devolver error
                        throw error;
                    });
            })
    );
});

// Mensaje desde la aplicación
self.addEventListener('message', event => {
    console.log('SW: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

console.log('SW: 🚀 Service Worker cargado - Impostor listo para funcionar offline');