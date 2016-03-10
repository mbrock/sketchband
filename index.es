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

require("./use-service-worker.es")
require("./index.css")

var React = require("react")
var ReactDOM = require("react-dom")
var PouchDB = require("pouchdb")

var { scheduleSong } = require("./schedule.es")
var { synthesizeChords } = require("./synth.es")
var { audioContext, playSchedule, toggleMute } = require("./audio.es")
var { Manager } = require("./manager.es")

const db = new PouchDB("sketch.band")

let appState = window.state = {
  hash: location.hash,
  songs: [],
  syncUrl: localStorage.getItem("sync-url"),
  audioFiles: {}
}

// Custom pseudo-Redux
function applyEvent(state, event) {
  switch (event.type) {
    case "app-loaded":
      return state
    case "hash-changed":
      return { ...state, hash: event.hash }
    case "songs-loaded":
      return { ...state, songs: event.songs }
    case "song-changed":
      return { ...state,
        songs: state.songs.map(
          x => x._id === event.song._id ? event.song : x
        )
      }
    case "song-added":
      return { ...state,
        songs: [...state.songs, event.song]
      }
    case "audio-download-started":
      return {
        ...state,
        audioFiles: {
          ...state.audioFiles,
          [event.audioHash]: "downloading"
        }
      }
    case "audio-download-finished":
      return {
        ...state,
        audioFiles: {
          ...state.audioFiles,
          [event.audioHash]: event.data
        }
      }
    case "audio-download-failed":
      return {
        ...state,
        audioFiles: {
          ...state.audioFiles,
          [event.audioHash]: undefined
        }
    default:
      throw new Error(`Unhandled event type ${event.type}`)
  }
}

let App = React.createClass({
  render() {
    let props = {
      db,
      hash: this.props.hash,
      songs: this.props.songs.filter(x => !x._deleted),
      audioFiles: this.props.audioFiles,
      syncUrl: this.props.syncUrl,
    }
    return <Manager {...props} />
  }
})

const app = props => <App {...props} />
const div = document.createElement("div")

div.classList.add("app")
document.body.appendChild(div)
document.head.innerHTML += (
  '<meta name=viewport content="width=device-width, initial-scale=1">'
)

function setAppState(state) {
  appState = state
  ReactDOM.render(app(state), div)
}

function dispatch(type, payload = {}, timestamp = new Date) {
  console.log(timestamp, type, payload)
  setAppState(applyEvent(appState, { type, timestamp, ...payload }))
}

onhashchange = () =>
  dispatch("hash-changed", { hash: location.hash })

dispatch("app-loaded")

db.allDocs({ include_docs: true }).then(function(result) {
  const songs = result.rows.map(x => x.doc)
  dispatch("songs-loaded", { songs })

  if (localStorage.getItem("sync-url")) {
    PouchDB.sync("sketch.band", localStorage.getItem("sync-url"), { live: true })
  }

  db.changes({
    live: true,
    include_docs: true,
  }).on("change", function(change) {
    if (appState.songs.filter(x => x._id === change.id).length > 0) {
      dispatch("song-changed", { song: change.doc })
    } else {
      dispatch("song-added", { song: change.doc })
    }
  })
})

window.db = db
