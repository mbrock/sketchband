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

let color = require("color")

let lessOpaque = (x, n) => color(x).clearer(n).hslString()

export const name = "SketchBand"
export const backgroundColor = "royalblue"
export const secondary = "deeppink"
export const tagline = "A better way to write songs"
export let demo = () => <Demo tab={parse(rolling)} />

requestAnimationFrame(() => {
  let div = document.createElement("div")
  document.body.appendChild(div)
  document.body.style.fontSize = "20px"
  document.body.style.backgroundColor = backgroundColor
  ReactDOM.render(demo(), div)
})

var { parse } = require("./tab.es")
var { scheduleSong } = require("./schedule.es")
var { synthesizeChords } = require("./synth.es")
var { rolling } = require("./demo.es")
var { audioContext, playSchedule } = require("./audio.es")
var { Pixie } = require("./pixie.es")

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
      fontFamily: "sans-serif",
      textTransform: "uppercase",
      marginTop: 8,
      marginBottom: 8,
      color: "rgba(255,255,255,0.8)",
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
    position: "relative", marginBottom: "1rem", paddingRight: "1rem"
  }}>
    {(t >= 0 && t <= 1) &&
      <Pixie duration={secondsPerBar(defaultContext)}/> }
    <div style={{
      ...((t >= 0 && t <= 1) ? {
        // Mario block bounce.
        WebkitAnimation: `pixiedown
          ${secondsPerBar(defaultContext)}s
          linear infinite`
      } : {}),
      padding: "0.25rem 0 0 0",
      minWidth: 80,
      borderRadius: "0.25rem",
      transition: `${0.25 * secondsPerBar(defaultContext)}s ease-out all`,
      backgroundColor:
        (t >= 0 && t < 1) ? "cornflowerblue" :
          (t < 0 ? secondary : lessOpaque(secondary, 0.3)),
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
    fontFamily: "sans-serif",
    margin: "0 0.5rem",
    color: "#eee"
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
        height: 5,
        borderRadius: t > 1 ? "0 0 2px 2px" : "0 0 0 2px",
        background: lessOpaque("black", 0.9),
      }}/>
    </div>
  )
  return <div style={{
    backgroundColor: lessOpaque(backgroundColor, 0.8),
    borderRadius: "0 0 2px 2px",
    marginTop: 4,
  }}> {progress} </div>
}
  
let Chord = ({ chord }) =>
  <div style={{
    fontFamily: "sans-serif",
    backgroundColor: "rgba(255,255,255,0.6)",
    color: "purple",
    borderRadius: 2,
    margin: "0 4px 2px 4px",
    padding: "2px 8px",
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
    setTimeout(async () => {
      await this.setState({
        samples: await synthesizeChords(audioContext)
      })
      
      trackAudioTime(t => this.setState({ t: t }))
      playSchedule(
        this.state.samples,
        scheduleSong(defaultContext, this.props.tab)
      )
    }, 0)
  },

  render() {
    if (this.state.samples)
      return <Song
        context={defaultContext}
        t={this.state.t}
        {...this.props.tab}
       />
    else
      return <div>
        <style dangerouslySetInnerHTML={{
          __html: require("./spinner.es").spinner
        }}/>
        <div className="loader">Synthesizing chord sounds...</div>
      </div>
  }
})
