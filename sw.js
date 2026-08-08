var CACHE = "hiit-timer-v9";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* {cache:"reload"} bypasses the HTTP cache. Pages serves HTML with
         max-age=600, so a plain addAll can fill a brand-new cache version
         with a stale copy and users stay on old code after a deploy. */
      return c.addAll(ASSETS.map(function(u){ return new Request(u, { cache: "reload" }); }));
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Cache first, so the app still starts in a gym with no signal */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  /* Only own assets. Cross-origin (analytics beacons, fonts) must reach the
     network every time — caching them would silently break counting. */
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if (hit) return hit;
      return fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
        return res;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
