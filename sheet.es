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

let secondsPerBar =
  ({ beatsPerBar, bpm }) =>
    beatsPerBar / (bpm / 60)

let adjust = (context, t, i) =>
  t / secondsPerBar(context) - i

export let Song = ({ context, song, t }) => {
  var accumulatedDelay = 0
  return <div className="sheet"> {
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
  <div className="bar-sequence">
    <div className="bar-sequence-name">{barSequence.name}</div>
    <div className="bar-sequence-bars">
      {barSequence.bars.map(
        (x, i) => <Bar t={adjust(context, t, i)} context={context} {...x}/>)}
    </div>
  </div>

let Bar = ({ context, t, bar }) =>
  <div className="bar">
    <div className="bar-voices">
      {bar.voices.map(x => <Voice t={t} voice={x}/>)}
    </div>
  </div>

let Voice = ({ t, voice, context }) =>
  <div className="voice">
    {voice.harmony ? <Harmony context={context} {...voice}/> : (
       voice.lyric ? <Lyric context={context} {...voice}/> : null
     )}
  </div>

let Harmony = ({ harmony }) =>
  <div className="harmony">
    {harmony.chords.map(x => <Chord {...x}/>)}
  </div>

let Lyric = ({ lyric }) =>
  <div className="lyric"> {lyric.text} </div>

let Chord = ({ chord }) =>
  <div className="chord"> {chord.name} </div>
