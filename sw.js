// Service worker: guarda la app para que abra sin internet. Primero intenta la red (así recibes las actualizaciones)
// y si no hay conexión usa la copia guardada. Solo toca archivos de este mismo sitio: nunca las respuestas de GitHub.
const CACHE = 'mapa-v1-37';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
    self.skipWaiting();
});
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    if (new URL(e.request.url).origin !== self.location.origin) return;
    e.respondWith(
        fetch(e.request).then((r) => {
            const copia = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copia));
            return r;
        }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
    );
});
