/* Offline support: app files cached on install, covers and fonts cached as you browse.
   Audio previews always stream from Apple and are never stored. */
const V="geohub-v4",IMG="geohub-img"
const SHELL=["./","index.html","css/app.css","js/vendor/Sortable.min.js","js/config.js","js/napoli.js","js/core.js","js/views.js","js/games.js","js/spotify.js","js/social.js","js/circle.js","js/app.js","data/catalog.json","manifest.webmanifest","icons/icon-192.png","icons/apple-touch-icon.png"]
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))})
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("geohub-")&&k!==V&&k!==IMG).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))})
self.addEventListener("fetch",e=>{const u=new URL(e.request.url)
 if(e.request.method!=="GET")return
 if(u.hostname.includes("spotify.com")||u.hostname.startsWith("audio")||u.pathname.endsWith(".m4a"))return
 if(u.origin===location.origin){e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}));return}
 if(u.hostname.endsWith("mzstatic.com")||u.hostname.includes("fonts.g")){e.respondWith(caches.open(IMG).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{const r=await fetch(e.request);c.put(e.request,r.clone());return r}catch(err){return hit||Response.error()}}))}})
