/*
 * This file is part of SketchBand.
 * Copyright (C) 2016  Mikael Brockman
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const cacheName = "sketchband-cache-v1"
const audioCacheName = "sketchband-audio-cache-v1"

var urlsToCache = ASSETS.map(x => `/${x}`)

const rootUrl = (url => {
  url.pathname = "/"
  return url.href
})(new URL(location.href))

self.addEventListener("install",
  event => event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
)

self.addEventListener("activate",
  event => event.waitUntil(
    self.clients.matchAll().then(clients =>
      Promise.all(clients.map(client => client.postMessage("installed")))
    )
  )
)

self.addEventListener(
  "fetch",
  event => event.respondWith(cachingStrategy(event.request))
)

const cachingStrategy =
  request => caches
    .match(request.url === rootUrl ? "/index.html" : request)
    .then(response => response || fetchingStrategy(request))

const fetchingStrategy =
  request => request.url.match(new RegExp("/ipfs/.*$"))
    ? fetchAndSave(request)
    : fetch(request)

const fetchAndSave = request =>
  caches.open(audioCacheName).then(cache => {
    console.log("Fetching", request)
    return fetch(request.clone()).then(response => {
      if (response.status < 400) {
        console.log("Caching", request)
        cache.put(request.clone(), response.clone())
      } else {
        console.warn("Failed to fetch", request)
      }
      return response
    })
  })
  