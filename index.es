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

var React = require("react")
var ReactDOM = require("react-dom")
var PouchDB = require("pouchdb")

var { backgroundColor } = require("./colors.es")
var { parse } = require("./tab.es")
var { scheduleSong } = require("./schedule.es")
var { synthesizeChords } = require("./synth.es")
var { rolling, revelator } = require("./demo.es")
var { audioContext, playSchedule, toggleMute } = require("./audio.es")
var { Manager } = require("./manager.es")
var { Song } = require("./sheet.es")

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

let Demo = React.createClass({
  getInitialState: () => ({
    samples: null,
    t: 0,
  }),

  componentWillMount: function() {
    // setTimeout(async () => {
    //   await this.setState({
    //     samples: await synthesizeChords(audioContext)
    //   })
      
    //   trackAudioTime(t => this.setState({ t: t }))
    //   playSchedule(
    //     this.state.samples,
    //     scheduleSong(defaultContext, this.props.tab)
    //   )
    // }, 0)
  },

  render() {
    if (this.props.hash == "#manage") {
      return <Manager songs={this.props.songs} db={db} />
    } else if (true)
      return (
        <div>
          <button onClick={toggleMute} style={{ marginRight: "1rem" }}>
            Toggle mute
          </button>
          <a href="#manage">Manage songs</a>
          <Song
            context={defaultContext}
            t={this.state.t}
            {...this.props.tab}
           />
       </div>
     )
    else
      return <div>
        <style dangerouslySetInnerHTML={{
          __html: require("./spinner.es").spinner
        }}/>
        <div className="loader">Synthesizing chord sounds...</div>
      </div>
  }
})

let app = props => <Demo tab={parse(revelator)} {...props} />
let div = document.createElement("div")
document.body.appendChild(div)
document.body.style.font =
  "16px/24px 'helvetica neue', helvetica, arial, sans-serif"
document.body.style.backgroundColor = backgroundColor
document.body.style.margin = "1rem"

let appState = {
  hash: location.hash,
  songs: [],
}

function setAppState(state) {
  appState = state
  ReactDOM.render(app(state), div)
}

onhashchange = () =>
  setAppState({ ...appState, hash: location.hash })

setAppState(appState)

let db = new PouchDB("sketch.band")
db.allDocs({ include_docs: true }).then(function(result) {
  setAppState({
    ...appState,
    songs: result.rows.map(x => x.doc)
  })

  if (localStorage.getItem("sync-url")) {
    PouchDB.sync("sketch.band", localStorage.getItem("sync-url"), { live: true })
  }

  db.changes({
    live: true,
    include_docs: true,
  }).on("change", function(change) {
    console.log("change", change)
    if (appState.songs.filter(x => x._id === change.id).length > 0) {
      setAppState({
        ...appState,
        songs: appState.songs.map(x => x._id === change.id ? change.doc : x)
      })
    } else {
      setAppState({
        ...appState,
        songs: [...appState.songs, change.doc]
      })
    }
  })
})

window.db = db
