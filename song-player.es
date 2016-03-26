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
    return (
      <div className="song-player-toolbar">
        Chords: {allChordsUsedInSong(this.props.song).join(", ")}
      </div>
    )
  }
})

export const SongPlayer = React.createClass({
  getInitialState() {
    return {
      timeInSeconds: 0,
      synthesizedChords: {}
    }
  },

  componentWillMount() {
    this.resynthesize(this.props.song)
  },

  componentWillReceiveProps(next) {
    this.resynthesize(next.song)
  },

  resynthesize(song) {
    const chordNames = allChordsUsedInSong(song)
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
    const { timeInSeconds } = this.state
    const barProgress = calculateBarProgress(song, timeInSeconds)
    return (
      <div className="song-player">
        <SongPlayerToolbar song={song} />
        <Song song={song} />
      </div>
    )
  }
})