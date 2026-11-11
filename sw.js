var CACHE = "hiit-timer-v14";
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
  var req = e.request;
  if (req.method !== "GET") return;
  /* Only own assets. Cross-origin (analytics beacons, fonts) must reach the
     network every time — caching them would silently break counting. */
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    /* ignoreSearch: a shared link (/?w=45&r=15) is the same file as "/" */
    caches.match(req, { ignoreSearch: true }).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        /* Store clean successes only. A cached 404/5xx would be served cache-first
           until the next version bump, and each query-string variant would store
           another full copy of the same page. */
        if (res.ok && res.type === "basic" && !url.search){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ return c.put(req, copy); }).catch(function(){});
        }
        return res;
      }).catch(function(){
        /* offline: a page falls back to the app; anything else just fails */
        return req.mode === "navigate" ? caches.match("./index.html") : Response.error();
      });
    })
  );
});
