// Service worker: guarda la página para que el kiosko abra rápido y funcione sin conexión.
// Cambia el número de versión cuando modifiques los archivos, para que se actualicen.
const CACHE = 'kiosko-v3';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icono.svg', 'icono-192.png', 'icono-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Primero intenta la red (para ver siempre lo último); si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
