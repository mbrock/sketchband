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

// In this file, t values are measured in fractional bars,
// starting from 0.

var React = require("react")

export let Song = ({ song, t, onClickBar }) => {
  var t0 = 0
  return <div className="sheet"> {
    song.barSequences.map(x => {
      let tag = <BarSequence
        onClickBar={onClickBar}
        t0={t0}
        t={t - t0}
        {...x} />
      t0 += x.barSequence.bars.length
      return tag
    })
  } </div>
}

let BarSequence = ({ barSequence, t, t0, onClickBar }) =>
  <div className="bar-sequence">
    <div className="bar-sequence-name">{barSequence.name}</div>
    <div className="bar-sequence-bars">
      {barSequence.bars.map(
        (x, i) =>
          <Bar t0={t0 + i} t={t - i} {...x} onClickBar={onClickBar} />
       )}
    </div>
  </div>

let Bar = ({ t0, t, bar, onClickBar }) =>
  <div className={`bar ${(t >= 0 && t < 1) ? "playing" : ""}`}
       data-bar-number={t0}
       onMouseDown={() => onClickBar(t0)}
  >
    <div className="bar-voices">
      {bar.voices.map(x => <Voice t={t} voice={x}/>)}
    </div>
  </div>

let Voice = ({ t, voice }) =>
  <div className="voice">
    {voice.harmony ? <Harmony {...voice}/> : (
       voice.lyric ? <Lyric {...voice}/> : null
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
