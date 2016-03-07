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

var React = require("react")
var ReactDOM = require("react-dom")
var PouchDB = require("pouchdb")

require("./index.css")

var { scheduleSong } = require("./schedule.es")
var { synthesizeChords } = require("./synth.es")
var { audioContext, playSchedule, toggleMute } = require("./audio.es")
var { Manager } = require("./manager.es")

let defaultContext = {
  beatsPerBar: 4,
  bpm: 100,
}

let trackAudioTime = f => {
  let t0 = audioContext.currentTime
  let i = 0
  let frame = () => {
    let j = (audioContext.currentTime - t0) / secondsPerBar(defaultContext)
    if (Math.floor(j) > i) {
      i = j
      f(audioContext.currentTime - t0)
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

let App = React.createClass({
  // componentWillMount: function() {
  //   setTimeout(async () => {
  //     await this.setState({
  //       samples: await synthesizeChords(audioContext)
  //     })
      
  //     trackAudioTime(t => this.setState({ t: t }))
  //     playSchedule(
  //       this.state.samples,
  //       scheduleSong(defaultContext, this.props.tab)
  //     )
  //   }, 0)
  // },

  render() {
    return (
      <Manager
        hash={this.props.hash}
        songs={this.props.songs.filter(x => !x._deleted)}
        db={db}
        syncUrl={this.props.syncUrl}
      />
    )
  }
})

let app = props => <App {...props} />
let div = document.createElement("div")
div.classList.add("app")
document.body.appendChild(div)
document.head.innerHTML += (
  '<meta name=viewport content="width=device-width, initial-scale=1">'
)

let appState = window.state = {
  hash: location.hash,
  songs: [],
  syncUrl: localStorage.getItem("sync-url"),
}

function setAppState(state) {
  appState = state
  ReactDOM.render(app(state), div)
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
    default:
      throw new Error(`Unhandled event type ${event.type}`)
  }
}

function dispatch(type, payload = {}, timestamp = new Date) {
  console.log(timestamp, type, payload)
  setAppState(applyEvent(appState, { type, timestamp, ...payload }))
}

onhashchange = () =>
  dispatch("hash-changed", { hash: location.hash })

dispatch("app-loaded")

let db = new PouchDB("sketch.band")
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
