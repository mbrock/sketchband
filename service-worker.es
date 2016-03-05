const cacheName = "sketchband-cache-v1"
var urlsToCache = ASSETS.map(x => `/${x}`)

const rootUrl = new URL(location.href)
rootUrl.pathname = "/"

self.addEventListener("install", function(event) {
  event.waitUntil(
   caches.open(cacheName).then(function(cache) {
      return cache.addAll(urlsToCache)
    }).then(function() {
      return self.skipWaiting()
    })
  )
})

self.addEventListener("activate", function(event) {
  event.waitUntil(
    self.clients.matchAll().then(function(clients) {
      return Promise.all(clients.map(function(client) {
        return client.postMessage("installed")
      }))
    })
  )
})

self.addEventListener("fetch", function(event) {
  var request = (
    event.request.url == rootUrl.href
  ) ? "/index.html" : event.request
  event.respondWith(
    caches.match(request).then(function(response) {
      if (response) {
        return response
      } else {
        return fetch(event.request)
      }
    })
  )
})