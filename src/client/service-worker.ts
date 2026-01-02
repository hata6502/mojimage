const mojimageRequests = [
  "/embed.js",
  "/favicon.png",
  "/frame.js",
  "/index.css",
];

const mojimageCacheName = `mojimage-${process.env.TIMESTAMP}`;
const serviceWorker = globalThis as unknown as ServiceWorkerGlobalScope;

serviceWorker.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(async (key) => {
          if ([mojimageCacheName].includes(key)) {
            return;
          }
          await caches.delete(key);
        }),
      );
    })(),
  );
});

serviceWorker.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cacheResponse = await caches.match(event.request);
      if (cacheResponse) {
        return cacheResponse;
      }

      return fetch(event.request);
    })(),
  );
});

serviceWorker.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const mojimageCache = await caches.open(mojimageCacheName);
      await mojimageCache.addAll(mojimageRequests);
      await serviceWorker.skipWaiting();
    })(),
  );
});
