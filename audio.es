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

let audioContext =
  new (window.AudioContext || window.webkitAudioContext)()

let gainNode = audioContext.createGain()

requestAnimationFrame(() => {
  let x = localStorage.getItem("gain")
  gainNode.gain.value = x === null ? 1 : +x
})

let secondsPerBar = ({ beatsPerBar, bpm }) =>
  (60 / bpm) * beatsPerBar

export let trackAudioTime = (context, f) => {
  let t0 = audioContext.currentTime
  let i = 0
  let frame = () => {
    let j = (audioContext.currentTime - t0) / secondsPerBar(context)
    if (Math.floor(j) > i) {
      i = j
      f(audioContext.currentTime - t0, j)
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

export let toggleMute = () => {
  let gain = gainNode.gain.value > 0 ? 0 : 1
  gainNode.gain.value = gain
  localStorage.setItem("gain", gain)
}

export let playSchedule =
  (samples, { schedule }) => schedule.events.forEach(
    ({ play }, i) => {
      let { chord, delay } = play
      playBuffer(samples[chord.name], delay)
    })

let playBuffer = (buffer, delay) => {
  let source = audioContext.createBufferSource()
  source.buffer = buffer
  source.connect(gainNode)
  gainNode.connect(audioContext.destination)
  source.start(audioContext.currentTime + delay)
}
