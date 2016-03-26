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

const shouldUseServiceWorker = (
  location.hostname !== "localhost" || localStorage.useLocalServiceWorker
)

if (shouldUseServiceWorker && "serviceWorker" in navigator) {
  const serviceWorkerAlreadyInstalled = !!navigator.serviceWorker.controller
  if (serviceWorkerAlreadyInstalled) {
    navigator.serviceWorker.addEventListener(
      "message",
      function() {
        if (confirm("Load new SketchBand version?")) {
          location.reload()
        }
      }
    )
  } else {
    navigator.serviceWorker.register("service-worker.js").then(
      function(registration) {
        alert("SketchBand is ready to work offline.")
      },
      function(error) {
        // This will happen if you don't use HTTPS, for example.
        console.error(error)
      }
    )
  }
}
