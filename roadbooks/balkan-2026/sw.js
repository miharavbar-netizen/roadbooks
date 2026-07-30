"use strict";

/*
 * Balkan Roadbook 2026 — Service Worker
 *
 * Lokacija datoteke:
 * roadbooks/balkan-2026/sw.js
 *
 * Po pomembnejši posodobitvi povečaj verzijo:
 * balkan-2026-v1 → balkan-2026-v2
 */

const CACHE_VERSION = "balkan-2026-v3";

const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const APP_ROOT = self.registration.scope;

function appUrl(path) {
  return new URL(path, APP_ROOT).href;
}


/* ===================================================
   DATOTEKE APLIKACIJE
=================================================== */

const APP_ASSETS = [
  "./",
  "./index.html",
  "./days.html",
  "./hosts.html",
  "./map.html",
  "./food.html",
  "./practical.html",

  "./manifest.json",

  "./templates/day.html",
  "./templates/guide.html",

  "./js/day.js",
  "./js/guide.js",

  "./data/days.json",
  "./data/activities.json",
  "./data/knowledge.json",
  "./data/coordinates.json",

  "./map/routes.html",
  "./map/walks.html",
  "./map/trips.html",

  "./host/rastoke.html",
  "./host/jajce.html",
  "./host/sarajevo.html",
  "./host/zabljak.html",
  "./host/perast.html",
  "./host/mostar.html",
  "./host/split.html",

  "../../css/style.css",
  "../../css/day.css",
  "../../css/guide.css",

  "../../images/brand/miha-matej-logo.png",

  "../../images/pwa/icon-192.png",
  "../../images/pwa/icon-512.png",
  "../../images/pwa/maskable-icon-512.png",
  "../../images/pwa/apple-touch-icon.png",

  "../../images/roadbooks/balkan-2026/pages/map-hero.jpg"
];


/* ===================================================
   HERO SLIKE
=================================================== */

const DAY_HERO_ASSETS = Array.from(
  { length: 21 },
  (_, index) => {
    const number = String(index + 1).padStart(2, "0");

    return (
      `../../images/roadbooks/balkan-2026/days/hero${number}.jpg`
    );
  }
);


/* ===================================================
   SLIKE GOSTITELJEV, ZEMLJEVIDI, VODNIKI
=================================================== */

const HOST_IMAGE_ASSETS = [
  "../../images/roadbooks/balkan-2026/host/rastoke.jpg",
  "../../images/roadbooks/balkan-2026/host/jajce.jpg",
  "../../images/roadbooks/balkan-2026/host/sarajevo.jpg",
  "../../images/roadbooks/balkan-2026/host/zabljak.jpg",
  "../../images/roadbooks/balkan-2026/host/perast.jpg",
  "../../images/roadbooks/balkan-2026/host/mostar.jpg",
  "../../images/roadbooks/balkan-2026/host/split.jpg",
  "../../images/roadbooks/balkan-2026/pages/food-hero.jpg",
  "../../images/roadbooks/balkan-2026/pages/hosts-hero.jpg",
  "../../images/roadbooks/balkan-2026/pages/practical-hero.jpg",
  "../../images/roadbooks/balkan-2026/pages/routes-card.jpg",
  "../../images/roadbooks/balkan-2026/pages/trips-card.jpg",
  "../../images/roadbooks/balkan-2026/pages/walks-card.jpg",
  "../../images/roadbooks/balkan-2026/maps/mostar-walk.jpg",
  "../../images/roadbooks/balkan-2026/maps/durmitor-ring.jpg",
  "../../images/roadbooks/balkan-2026/maps/jajce-kings-waterfall-avnoj.jpg",
  "../../images/roadbooks/balkan-2026/maps/kotor-old-town-walk.jpg",
  "../../images/roadbooks/balkan-2026/maps/split-diocletian-walk.jpg",
  "../../images/roadbooks/balkan-2026/maps/sarajevo-heritage-walk.jpg",
  "../../images/roadbooks/balkan-2026/maps/zadar-express-walk.jpg",
  "../../images/roadbooks/balkan-2026/maps/Program-H-01.webp",
];


/* ===================================================
   ZUNANJE DATOTEKE
=================================================== */

const EXTERNAL_ASSETS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
];


const PRECACHE_ASSETS = [
  ...APP_ASSETS,
  ...DAY_HERO_ASSETS,
  ...HOST_IMAGE_ASSETS
];
/* ===================================================
   INSTALL
=================================================== */

self.addEventListener("install", event => {
  event.waitUntil(
    installServiceWorker()
  );
});


async function installServiceWorker() {
  const cache = await caches.open(STATIC_CACHE);

  /*
   * Datoteke shranjujemo posamično.
   *
   * Če posamezna datoteka ne obstaja, se service worker
   * kljub temu uspešno namesti.
   */

  const localResults = await Promise.allSettled(
    PRECACHE_ASSETS.map(async path => {
      const url = appUrl(path);

      const response = await fetch(url, {
        cache: "reload"
      });

      if (!response.ok) {
        throw new Error(
          `${url} — HTTP ${response.status}`
        );
      }

      await cache.put(
        url,
        response.clone()
      );
    })
  );


  localResults
    .filter(result => result.status === "rejected")
    .forEach(result => {
      console.warn(
        "[Roadbook SW] Datoteka ni bila predpomnjena:",
        result.reason
      );
    });


  /*
   * Bootstrap je naložen s CDN-ja.
   * Shranimo ga, da accordion deluje tudi brez povezave.
   */

  const externalResults = await Promise.allSettled(
    EXTERNAL_ASSETS.map(async url => {
      const response = await fetch(url, {
        mode: "cors",
        cache: "reload"
      });

      if (!response.ok) {
        throw new Error(
          `${url} — HTTP ${response.status}`
        );
      }

      await cache.put(
        url,
        response.clone()
      );
    })
  );


  externalResults
    .filter(result => result.status === "rejected")
    .forEach(result => {
      console.warn(
        "[Roadbook SW] Zunanji vir ni bil predpomnjen:",
        result.reason
      );
    });


  /*
   * Nova različica lahko takoj preide v stanje waiting.
   */

  await self.skipWaiting();
}


/* ===================================================
   ACTIVATE
=================================================== */

self.addEventListener("activate", event => {
  event.waitUntil(
    activateServiceWorker()
  );
});


async function activateServiceWorker() {
  const currentCaches = new Set([
    STATIC_CACHE,
    RUNTIME_CACHE,
    DATA_CACHE
  ]);

  const existingCacheNames =
    await caches.keys();

  await Promise.all(
    existingCacheNames
      .filter(
        cacheName => !currentCaches.has(cacheName)
      )
      .map(
        cacheName => caches.delete(cacheName)
      )
  );


  /*
   * Novi service worker takoj začne upravljati
   * že odprte strani aplikacije.
   */

  await self.clients.claim();
}
/* ===================================================
   FETCH
=================================================== */

self.addEventListener("fetch", event => {
  const request = event.request;

  /*
   * Obravnavamo samo GET zahteve.
   */

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);


  /*
   * Bootstrap CDN:
   * najprej predpomnilnik, nato omrežje.
   */

  if (url.hostname === "cdn.jsdelivr.net") {
    event.respondWith(
      cacheFirst(
        request,
        STATIC_CACHE
      )
    );

    return;
  }


  /*
   * Drugih zunanjih povezav ne prestrezamo.
   *
   * Sem sodijo:
   * Google Maps, vreme, uradne strani in druge
   * zunanje spletne povezave.
   */

  if (url.origin !== self.location.origin) {
    return;
  }


  /*
   * HTML navigacija:
   *
   * najprej omrežje,
   * brez povezave pa predpomnjena stran.
   */

  if (
    request.mode === "navigate" ||
    request.destination === "document"
  ) {
    event.respondWith(
      networkFirstNavigation(request)
    );

    return;
  }


  /*
   * JSON:
   *
   * ob povezavi pridobi najnovejšo različico,
   * brez povezave uporabi zadnjo shranjeno.
   */

  if (url.pathname.endsWith(".json")) {
    event.respondWith(
      networkFirst(
        request,
        DATA_CACHE
      )
    );

    return;
  }


  /*
   * CSS, JavaScript, slike in pisave:
   *
   * takoj vrni shranjeno različico,
   * v ozadju pa poskusi pridobiti novo.
   */

  if (
    [
      "style",
      "script",
      "image",
      "font"
    ].includes(request.destination)
  ) {
    event.respondWith(
      staleWhileRevalidate(
        request,
        RUNTIME_CACHE
      )
    );
  }
});
/* ===================================================
   NETWORK FIRST — HTML
=================================================== */

async function networkFirstNavigation(request) {
  const cache =
    await caches.open(RUNTIME_CACHE);

  try {
    const response =
      await fetch(request);

    if (
      response &&
      response.ok
    ) {
      await cache.put(
        request,
        response.clone()
      );
    }

    return response;

  } catch (error) {

    /*
     * Najprej preverimo popolno ujemanje URL-ja.
     */

    const exactMatch =
      await caches.match(request);

    if (exactMatch) {
      return exactMatch;
    }


    /*
     * Nato zanemarimo query string.
     *
     * To omogoča offline delovanje naslovov:
     *
     * templates/day.html?id=day02
     * templates/guide.html?guide=mostar-walk
     */

    const templateMatch =
      await caches.match(
        request,
        {
          ignoreSearch: true
        }
      );

    if (templateMatch) {
      return templateMatch;
    }


    /*
     * Zadnja rezerva je začetna stran Roadbooka.
     */

    const appIndex =
      await caches.match(
        appUrl("./index.html")
      );

    if (appIndex) {
      return appIndex;
    }


    const appRoot =
      await caches.match(
        appUrl("./")
      );

    if (appRoot) {
      return appRoot;
    }

    return Response.error();
  }
}


/* ===================================================
   NETWORK FIRST — JSON
=================================================== */

async function networkFirst(
  request,
  cacheName
) {
  const cache =
    await caches.open(cacheName);

  try {
    const response =
      await fetch(request);

    if (
      response &&
      response.ok
    ) {
      await cache.put(
        request,
        response.clone()
      );
    }

    return response;

  } catch (error) {

    const cachedResponse =
      await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }


    const globalCachedResponse =
      await caches.match(request);

    if (globalCachedResponse) {
      return globalCachedResponse;
    }

    return Response.error();
  }
}


/* ===================================================
   CACHE FIRST — BOOTSTRAP
=================================================== */

async function cacheFirst(
  request,
  cacheName
) {
  const cache =
    await caches.open(cacheName);

  const cachedResponse =
    await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }


  try {
    const networkResponse =
      await fetch(request);

    if (networkResponse) {
      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;

  } catch (error) {
    return Response.error();
  }
}


/* ===================================================
   STALE WHILE REVALIDATE — CSS, JS, SLIKE
=================================================== */

async function staleWhileRevalidate(
  request,
  cacheName
) {
  const cache =
    await caches.open(cacheName);

  const cachedResponse =
    await cache.match(request);


  const networkPromise =
    fetch(request)
      .then(async response => {
        if (
          response &&
          response.ok
        ) {
          await cache.put(
            request,
            response.clone()
          );
        }

        return response;
      })
      .catch(() => null);


  /*
   * Če je datoteka že shranjena, jo vrnemo takoj.
   */

  if (cachedResponse) {
    return cachedResponse;
  }


  /*
   * Če datoteka še ni shranjena, počakamo na omrežje.
   */

  const networkResponse =
    await networkPromise;

  if (networkResponse) {
    return networkResponse;
  }

  return Response.error();
}