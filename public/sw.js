/* Readee service worker — install + light offline-friendly caching.
 *
 * Strategy:
 *   · /_next/static/*       cache-first  (immutable hashed assets)
 *   · /icon-*, /apple-touch-icon, /favicon  cache-first
 *   · Supabase storage audio/images         stale-while-revalidate
 *   · everything else                       network-first, fall back to cache
 *
 * The point isn't full offline — Readee needs the network for lessons +
 * Buddy. It's resilience on flaky home wifi: a kid mid-lesson whose
 * connection drops for 30 seconds shouldn't see a broken page, and the
 * dashboard should still load on cold open even before the network
 * comes back.
 */

const VERSION = "v3";
const STATIC_CACHE = `readee-static-${VERSION}`;
const ASSET_CACHE = `readee-assets-${VERSION}`;
const PAGE_CACHE = `readee-pages-${VERSION}`;

const PRECACHE_URLS = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                k.startsWith("readee-") &&
                ![STATIC_CACHE, ASSET_CACHE, PAGE_CACHE].includes(k),
            )
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.json" ||
    /^\/(icon-|apple-touch-icon|favicon)/.test(url.pathname)
  );
}

function isSupabaseAsset(url) {
  return (
    url.hostname.endsWith(".supabase.co") &&
    /\/storage\/v1\/object\/public\/(audio|images)\//.test(url.pathname)
  );
}

function isApiOrAuth(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.includes("/_next/data/")
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

async function networkFirstWithCachedFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && request.method === "GET") {
      cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Skip cross-origin requests that aren't Supabase storage.
  if (url.origin !== self.location.origin && !isSupabaseAsset(url)) {
    return;
  }

  if (isApiOrAuth(url)) {
    // Never cache APIs/auth — always hit the network.
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  if (isSupabaseAsset(url)) {
    event.respondWith(staleWhileRevalidate(req, ASSET_CACHE));
    return;
  }

  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirstWithCachedFallback(req, PAGE_CACHE));
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
