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

var colors = require("./colors.es")

let secondsPerBar =
  ({ beatsPerBar, bpm }) =>
    beatsPerBar / (bpm / 60)

let adjust = (context, t, i) =>
  t / secondsPerBar(context) - i

export let Song = ({ context, song, t }) => {
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
      color: colors.headerColor,
    }}>{barSequence.name}</div>
    <div style={{
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
    }}>
      {barSequence.bars.map(
        (x, i) => <Bar t={adjust(context, t, i)} context={context} {...x}/>)}
    </div>
  </div>

let Bar = ({ context, t, bar }) =>
  <div style={{
    position: "relative", marginBottom: "1rem",
  }}>
    <div style={{
      ...((t >= 0 && t <= 1) ? {
        // Mario block bounce.
        WebkitAnimation: `pixiedown
          ${secondsPerBar(context)}s
          linear infinite`
      } : {}),
      border: "1px solid #aaa",
      minWidth: "8rem",
      transition: `${0.25 * secondsPerBar(context)}s ease-out all`,
      backgroundColor:
        (t >= 0 && t < 1) ? colors.activeBarColor :
          (t < 0 ? colors.inactiveBarColor : lessOpaque(colors.inactiveBarColor, 0.3)),
    }}>
      {bar.voices.map(x => <Voice t={t} voice={x}/>)}
    </div>
  </div>

let Voice = ({ t, voice, context }) =>
  <div>
    {voice.harmony ? <Harmony context={context} {...voice}/> : (
       voice.lyric ? <Lyric context={context} {...voice}/> : (
         voice.recording ? <Recording context={context} t={t} {...voice}/> : null
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
    color: colors.lyricColor,
    fontWeight: 300,
  }}> {lyric.text} </div>

let Recording = ({ t, context }) => {
  let progress = (
    <div style={{
      width: t < 0 ? 0 : "100%",
      WebkitAnimation:
        (t >= 0 && t < 1) &&
          `flyfill ${secondsPerBar(context)}s linear infinite`
    }}>
      <div style={{
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        height: "0.5rem",
        background: colors.lessOpaque("black", 0.9),
      }}/>
    </div>
  )
  return <div style={{
    backgroundColor: colors.lessOpaque(colors.backgroundColor, 0.8),
  }}> {progress} </div>
}
  
let Chord = ({ chord }) =>
  <div style={{
    backgroundColor: colors.chordBackgroundColor,
    color: colors.chordColor,
    fontWeight: 500,
    textAlign: "center",
    flexGrow: 1
  }}> {chord.name} </div>
