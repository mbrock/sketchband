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

let teoria = require("teoria")
let adsr = require("adsr")

let concat = xss => [].concat.apply([], xss)

let chordLength = 2

let chordNotes = x => x.notes()
let noteFrequency = x => x.fq() * Math.pow(Math.pow(2, 0), 1/12)

let scheduleNote =
  (note, duration) => [{
    type: "audio-event/play-note",
    oscillatorType: "triangle",
    frequency: noteFrequency(note),
    duration: duration,
  }]

let scheduleChord =
  (chord, duration) =>
    concat(chordNotes(chord).map(x => scheduleNote(x, duration)))

let playNote = (
  audioContext, { oscillatorType, frequency, duration }
) => {
  let source = audioContext.createOscillator()
  let gain = audioContext.createGain()
  let envelope = adsr(audioContext)
  let filter = audioContext.createBiquadFilter()

  gain.gain.value = 0
  
  envelope.connect(gain.gain)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  filter.type = "lowpass"
  filter.frequency.value = 800
  filter.Q.value = 0.4

  envelope.value.value = 0.2
  envelope.attack = 0.01
  envelope.decay = 1
  envelope.sustain = 0.1
  envelope.release = 1.0

  source.type = oscillatorType
  source.frequency.value = frequency

  let time = audioContext.currentTime
  envelope.start(time)
  source.start(time)
  source.stop(time + duration)
  envelope.stop(time + duration, true)
}

let playEvent = (audioContext, { type, ...x }) => {
  if (type == "audio-event/play-note")
    playNote(audioContext, x)
  else
    throw new Error("impossible")
}

let playSchedule = (audioContext, schedule) => {
  schedule.forEach(x => playEvent(audioContext, x))
}

let makeOfflineAudioContext = (audioContext) =>
  new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    2, audioContext.sampleRate * chordLength, audioContext.sampleRate)

let render = audioContext => audioContext.startRendering()

let recordSchedule = (audioContext, schedule) => {
  let offlineAudioContext = makeOfflineAudioContext(audioContext)
  playSchedule(offlineAudioContext, schedule)
  return render(offlineAudioContext)
}

let recordChord = (audioContext, chord, duration) =>
  recordSchedule(audioContext, scheduleChord(chord, duration))

export let synthesizeChords = async (audioContext, chordNames) => {
  let buffers = {}
  for (var i = 0; i < chordNames.length; i++)
    buffers[chordNames[i]] =
      await recordChord(audioContext, teoria.chord(chordNames[i]), chordLength)
  return buffers
}
