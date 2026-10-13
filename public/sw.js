// Offline support: the notebook, progress and any explainer already opened
// keep working without a connection. Content is always fetched fresh when online.
const VERSION = "v1";
const PAGES = `anant-pages-${VERSION}`;
const ASSETS = `anant-assets-${VERSION}`;
const DATA = `anant-data-${VERSION}`;
const SHELL = ["/", "/notebook", "/progress", "/about"];

// Cache each shell page together with the scripts, styles and fonts it loads.
async function precache() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  await Promise.all(
    SHELL.map(async (url) => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const html = await res.clone().text();
      await pages.put(url, res);
      const urls = [...new Set(html.match(/\/_next\/static\/[^"'\\)\s]+/g) ?? [])];
      await Promise.all(urls.map((u) => assets.add(u).catch(() => {})));
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, key = request) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }
  if (request.mode === "navigate") {
    // Pages are keyed by path so a cached copy is found whatever the query.
    event.respondWith(
      networkFirst(request, PAGES, url.pathname).catch(() => caches.match("/", { cacheName: PAGES })),
    );
    return;
  }
  // Client-side route fetches: let them fail offline so the browser falls back
  // to a full navigation, which is served from the page cache above.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC")) return;
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, DATA));
  }
});
