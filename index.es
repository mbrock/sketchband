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
let color = require("color")

let lessOpaque = (x, n) => color(x).clearer(n).hslString()

const backgroundColor = "#fcfcfc"
const inactiveBarColor = "white"
const activeBarColor = "#ddd"
const headerColor = "#333"
const lyricColor = headerColor
const chordBackgroundColor = "#ccc"
const chordColor = "#333"

var { parse } = require("./tab.es")
var { scheduleSong } = require("./schedule.es")
var { synthesizeChords } = require("./synth.es")
var { rolling, revelator } = require("./demo.es")
var { audioContext, playSchedule, toggleMute } = require("./audio.es")
var { Pixie } = require("./pixie.es")
var { Manager } = require("./manager.es")

let secondsPerBar =
  ({ beatsPerBar, bpm }) =>
    beatsPerBar / (bpm / 60)

let adjust = (context, t, i) =>
  t / secondsPerBar(context) - i

let defaultContext = {
  beatsPerBar: 4,
  bpm: 100,
}

let Song = ({ context, song, t }) => {
  var accumulatedDelay = 0
  return <div> {
    song.barSequences.map(x => {
      let tag = <BarSequence
        context={context}
        t={t - accumulatedDelay}
        {...x} />
      accumulatedDelay +=
        secondsPerBar(context) * x.barSequence.bars.length
      return tag
    })
  } </div>
}

let BarSequence = ({ context, barSequence, t }) =>
  <div>
    <div style={{
      textTransform: "uppercase",
      marginTop: ".5rem",
      marginBottom: ".5rem",
      color: headerColor,
    }}>{barSequence.name}</div>
    <div style={{
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
    }}>
      {barSequence.bars.map(
        (x, i) => <Bar t={adjust(context, t, i)} {...x}/>)}
    </div>
  </div>

let Bar = ({ t, bar }) =>
  <div style={{
    position: "relative", marginBottom: "1rem",
  }}>
    <div style={{
      ...((t >= 0 && t <= 1) ? {
        // Mario block bounce.
        WebkitAnimation: `pixiedown
          ${secondsPerBar(defaultContext)}s
          linear infinite`
      } : {}),
      border: "1px solid #aaa",
      minWidth: "8rem",
      transition: `${0.25 * secondsPerBar(defaultContext)}s ease-out all`,
      backgroundColor:
        (t >= 0 && t < 1) ? activeBarColor :
          (t < 0 ? inactiveBarColor : lessOpaque(inactiveBarColor, 0.3)),
    }}>
      {bar.voices.map(x => <Voice t={t} voice={x}/>)}
    </div>
  </div>

let Voice = ({ t, voice }) =>
  <div>
    {voice.harmony ? <Harmony {...voice}/> : (
       voice.lyric ? <Lyric {...voice}/> : (
         voice.recording ? <Recording t={t} {...voice}/> : null
     ))}
  </div>

let Harmony = ({ harmony }) =>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    {harmony.chords.map(x => <Chord {...x}/>)}
  </div>

let Lyric = ({ lyric }) =>
  <div style={{
    textAlign: "center",
    margin: "0 .5rem",
    color: lyricColor,
    fontWeight: 300,
  }}> {lyric.text} </div>

let Recording = ({ t }) => {
  let progress = (
    <div style={{
      width: t < 0 ? 0 : "100%",
      WebkitAnimation:
        (t >= 0 && t < 1) &&
          `flyfill ${secondsPerBar(defaultContext)}s linear infinite`
    }}>
      <div style={{
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        height: "0.5rem",
        background: lessOpaque("black", 0.9),
      }}/>
    </div>
  )
  return <div style={{
    backgroundColor: lessOpaque(backgroundColor, 0.8),
  }}> {progress} </div>
}
  
let Chord = ({ chord }) =>
  <div style={{
    backgroundColor: chordBackgroundColor,
    color: chordColor,
    fontWeight: 500,
    textAlign: "center",
    flexGrow: 1
  }}> {chord.name} </div>

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
