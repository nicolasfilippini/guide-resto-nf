// Guide resto : hors ligne après la première visite. Version = empreinte du contenu (publier_guide.py).
const CACHE = "guide-resto-1ebc055e83";
const FICHIERS = ["./", "manifest.webmanifest", "icone-192.png", "icone-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Réseau d'abord, revalidé (la dernière version, ⛔ copie du cache HTTP), le cache si pas de réseau ou réseau trop lent (3 s).
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const cle = req.mode === "navigate" ? "./" : req;
  const reseau = fetch(req, { cache: "no-cache" }).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(cle, c)); } return r; });
  const garde = new Promise(ok => setTimeout(ok, 3000)).then(() => caches.match(cle));
  e.waitUntil(reseau.catch(() => {}));
  e.respondWith(Promise.race([reseau.catch(() => caches.match(cle)), garde.then(r => r || new Promise(() => {}))])
    .then(r => r || caches.match("./")));
});
