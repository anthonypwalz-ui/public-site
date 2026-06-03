/*
 * Service Worker — Bold North Electric
 *
 * Implements client-side caching equivalent to Expires headers:
 *   - Static assets (CSS, JS, images): cache-first, long-lived (re-cached on version bump)
 *   - HTML pages: network-first with cache fallback (always fresh when online)
 *
 * To bust the asset cache after a deployment, increment CACHE_VERSION.
 */

'use strict';

var CACHE_VERSION = 'v2';
var STATIC_CACHE  = 'static-'  + CACHE_VERSION;
var PAGE_CACHE    = 'pages-'   + CACHE_VERSION;

var PRECACHE_ASSETS = [
  '/assets/styles.min.css',
  '/assets/app.min.js',
  '/assets/logo.png',
  '/assets/icon.png',
  '/assets/favicon.svg'
];

var PRECACHE_PAGES = [
  '/',
  '/about/',
  '/contact/',
  '/services/',
  '/service-areas/',
  '/privacy/'
];

/* ── Install: pre-cache all assets and pages ─────────────────────────── */
self.addEventListener('install', function (event) {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.addAll(PRECACHE_ASSETS);
      }),
      caches.open(PAGE_CACHE).then(function (cache) {
        return cache.addAll(PRECACHE_PAGES);
      })
    ]).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ── Activate: delete caches from previous versions ─────────────────── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) {
            return name !== STATIC_CACHE && name !== PAGE_CACHE;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ── Fetch: route requests to the right caching strategy ────────────── */
self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url;

  // Only intercept same-origin GET requests
  if (req.method !== 'GET') { return; }
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) { return; }

  /* Static assets → cache-first (equivalent to a far-future Expires header) */
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(req).then(function (cached) {
          if (cached) { return cached; }
          return fetch(req).then(function (response) {
            if (response && response.ok) {
              cache.put(req, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  /* HTML pages → network-first with cache fallback (fresh content, works offline) */
  event.respondWith(
    fetch(req).then(function (response) {
      if (response && response.ok) {
        caches.open(PAGE_CACHE).then(function (cache) {
          cache.put(req, response.clone());
        });
      }
      return response;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
