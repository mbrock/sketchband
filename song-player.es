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

import React from "react"

import { synthesizeChords } from "./synth.es"
import { scheduleSong } from "./schedule.es"
import { audioContext, trackAudioTime, playSchedule } from "./audio.es"
import { parse } from "./tab.es"
import { Song } from "./sheet.es"

function calculateBarProgress(song, timeInSeconds) {
  return 0
}

function allChordsUsedInSong(song) {
  const object = {}
  song.barSequences.forEach(
    ({ barSequence }) => barSequence.bars.forEach(
      ({ bar }) => bar.voices.forEach(
        voice => {
          if (voice.harmony)
            voice.harmony.chords.forEach(x => object[x.chord.name] = true)
        }
      )
    )
  )
  return Object.keys(object)
}

function needsMoreChords(chords, chordNames) {
  return chordNames.every(x => chords[x])
}

export const SongPlayerToolbar = React.createClass({
  render() {
    const chordText = (
      this.props.chords.length
        ? this.props.chords.join(", ")
        : "Synthesizing..."
    )
    return (
      <div className="player-toolbar">
        <div className="player-toolbar-print-info">
          <span className="title">
            {this.props.song.title}
          </span>
          {' by '}
          <span className="author">
            {this.props.song.author}
          </span>
        </div>
        <div className="player-toolbar-chords">
          <span>
            Chords: {chordText}
          </span>
        </div>
        <div className="player-toolbar-buttons">
          <button onClick={this.transposeUp}>↑</button>
          <button onClick={this.transposeDown}>↓</button>
          <button onClick={this.props.play}>Play</button>
        </div>
      </div>
    )
  },

  transposeUp: function() {
    this.transposeBy(1)
  },

  transposeDown: function() {
    this.transposeBy(-1)
  },

  transposeBy: function(n) {
    window.dispatch("transposition-changed", {
      songId: this.props.song._id,
      semitones: this.props.transposeSteps + n
   })
  },
})

export const SongPlayer = React.createClass({
  getInitialState() {
    return {
      timeInSeconds: 0,
      synthesizedChords: {}
    }
  },

  componentWillMount() {
    this.resynthesize(this.props)
  },

  componentWillReceiveProps(next) {
    this.resynthesize(next)
  },

  resynthesize(props) {
    const chordNames = allChordsUsedInSong(this.parseSong(props))
    if (!needsMoreChords(this.state.synthesizedChords, chordNames)) {
      this.setState({ synthesizedChords: {} })
      synthesizeChords(
        audioContext, chordNames
      ).then(synthesizedChords => {
        this.setState({ synthesizedChords })
      }).catch(e => {
        console.error(e)
      })
    }
  },

  render() {
    const { song } = this.props
    const { timeInSeconds, synthesizedChords } = this.state
    
    const parsedSong = this.parseSong()
    const barProgress = calculateBarProgress(parsedSong, timeInSeconds)
    
    return (
      <div className="song-player">
        <SongPlayerToolbar
          song={song}
          play={this.play}
          chords={Object.keys(synthesizedChords)}
          transposeSteps={this.props.transposeSteps}
        />
        <Song song={parsedSong} />
      </div>
    )
  },

  parseSong(props = this.props) {
    return parse(
      props.song.content,
      props.transposeSteps
    ).song
  },

  play() {
    playSchedule(
      this.state.synthesizedChords,
      scheduleSong(
        { bpm: 100, beatsPerBar: 4 },
        { song: this.parseSong() }
      )
    )
  }
})